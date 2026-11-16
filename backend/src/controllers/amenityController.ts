import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { prisma } from '@/lib/prisma';

const createAmenitySchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().optional(),
  category: z.string().optional(),
});

const updateAmenitySchema = createAmenitySchema.partial();

export class AmenityController {
  // Get all amenities
  static async getAmenities(req: Request, res: Response) {
    try {
      const { category } = req.query;
      
      const where = category ? { category: category as string } : {};
      
      const amenities = await prisma.amenity.findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      });

      res.json(amenities);
    } catch (error) {
      logger.error('Error fetching amenities:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create amenity (Admin only)
  static async createAmenity(req: Request, res: Response) {
    try {
      const validatedData = createAmenitySchema.parse(req.body);

      const amenity = await prisma.amenity.create({
        data: validatedData
      });

      logger.info(`Amenity created: ${amenity.id} - ${amenity.name}`);
      res.status(201).json(amenity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      logger.error('Error creating amenity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update amenity (Admin only)
  static async updateAmenity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateAmenitySchema.parse(req.body);

      const amenity = await prisma.amenity.update({
        where: { id },
        data: validatedData
      });

      logger.info(`Amenity updated: ${amenity.id} - ${amenity.name}`);
      res.json(amenity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      logger.error('Error updating amenity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete amenity (Admin only)
  static async deleteAmenity(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if amenity is being used by any properties
      const propertiesCount = await prisma.propertyAmenity.count({
        where: { amenityId: id }
      });

      if (propertiesCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete amenity that is being used by properties',
          propertiesCount 
        });
      }

      await prisma.amenity.delete({
        where: { id }
      });

      logger.info(`Amenity deleted: ${id}`);
      res.json({ message: 'Amenity deleted successfully' });
    } catch (error) {
      logger.error('Error deleting amenity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}