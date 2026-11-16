import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { prisma } from '@/lib/prisma';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
  },
});

const addImageSchema = z.object({
  altText: z.string().optional(),
  isPrimary: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export class ImageController {
  // Multer middleware
  static uploadMiddleware = upload.array('images', 10); // Max 10 images

  // Upload images to property
  static async uploadPropertyImages(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const userId = req.user?.id;
      const files = req.files as Express.Multer.File[];

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No images provided' });
      }

      // Check if property exists and user owns it
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { hostId: true, title: true }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (property.hostId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to upload images to this property' });
      }

      // Get current image count
      const currentImageCount = await prisma.propertyImage.count({
        where: { propertyId }
      });

      if (currentImageCount + files.length > 20) {
        return res.status(400).json({ 
          error: 'Maximum 20 images allowed per property',
          currentCount: currentImageCount,
          attemptingToAdd: files.length
        });
      }

      // Upload images to Cloudinary
      const uploadPromises = files.map(async (file, index) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `stayora/properties/${propertyId}`,
              transformation: [
                { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
                { format: 'webp' }
              ]
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  url: result!.secure_url,
                  publicId: result!.public_id,
                  order: currentImageCount + index
                });
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const uploadResults = await Promise.all(uploadPromises);

      // Save image records to database
      const imageRecords = await Promise.all(
        uploadResults.map(async (result: any, index) => {
          const imageData = req.body[`image_${index}`] ? JSON.parse(req.body[`image_${index}`]) : {};
          const validatedData = addImageSchema.parse(imageData);

          return prisma.propertyImage.create({
            data: {
              propertyId,
              url: result.url,
              altText: validatedData.altText || `${property.title} - Image ${index + 1}`,
              isPrimary: validatedData.isPrimary || (currentImageCount === 0 && index === 0),
              order: validatedData.order !== undefined ? validatedData.order : result.order
            }
          });
        })
      );

      logger.info(`${imageRecords.length} images uploaded for property: ${propertyId}`);
      res.status(201).json(imageRecords);
    } catch (error) {
      logger.error('Error uploading property images:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update image details
  static async updatePropertyImage(req: Request, res: Response) {
    try {
      const { propertyId, imageId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const validatedData = addImageSchema.parse(req.body);

      // Check if property exists and user owns it
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { hostId: true }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (property.hostId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to update images for this property' });
      }

      // If setting as primary, unset other primary images
      if (validatedData.isPrimary) {
        await prisma.propertyImage.updateMany({
          where: { 
            propertyId,
            id: { not: imageId }
          },
          data: { isPrimary: false }
        });
      }

      const updatedImage = await prisma.propertyImage.update({
        where: { 
          id: imageId,
          propertyId // Ensure image belongs to this property
        },
        data: validatedData
      });

      logger.info(`Image updated: ${imageId} for property: ${propertyId}`);
      res.json(updatedImage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      logger.error('Error updating property image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete property image
  static async deletePropertyImage(req: Request, res: Response) {
    try {
      const { propertyId, imageId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if property exists and user owns it
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { hostId: true }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (property.hostId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to delete images from this property' });
      }

      // Get image details
      const image = await prisma.propertyImage.findUnique({
        where: { 
          id: imageId,
          propertyId
        }
      });

      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Delete from Cloudinary if it's a Cloudinary URL
      if (image.url.includes('cloudinary.com')) {
        const publicId = image.url.split('/').pop()?.split('.')[0];
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(`stayora/properties/${propertyId}/${publicId}`);
          } catch (cloudinaryError) {
            logger.warn('Failed to delete image from Cloudinary:', cloudinaryError);
          }
        }
      }

      // Delete from database
      await prisma.propertyImage.delete({
        where: { id: imageId }
      });

      // If this was the primary image, set another image as primary
      if (image.isPrimary) {
        const nextImage = await prisma.propertyImage.findFirst({
          where: { propertyId },
          orderBy: { order: 'asc' }
        });

        if (nextImage) {
          await prisma.propertyImage.update({
            where: { id: nextImage.id },
            data: { isPrimary: true }
          });
        }
      }

      logger.info(`Image deleted: ${imageId} from property: ${propertyId}`);
      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      logger.error('Error deleting property image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reorder property images
  static async reorderPropertyImages(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { imageOrders } = req.body; // Array of { id, order }
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!Array.isArray(imageOrders)) {
        return res.status(400).json({ error: 'imageOrders must be an array' });
      }

      // Check if property exists and user owns it
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { hostId: true }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (property.hostId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to reorder images for this property' });
      }

      // Update image orders
      const updatePromises = imageOrders.map(({ id, order }) =>
        prisma.propertyImage.update({
          where: { 
            id,
            propertyId // Ensure image belongs to this property
          },
          data: { order }
        })
      );

      await Promise.all(updatePromises);

      // Get updated images
      const updatedImages = await prisma.propertyImage.findMany({
        where: { propertyId },
        orderBy: { order: 'asc' }
      });

      logger.info(`Images reordered for property: ${propertyId}`);
      res.json(updatedImages);
    } catch (error) {
      logger.error('Error reordering property images:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}