import { Request, Response } from 'express';
import { PropertyType } from '@prisma/client';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { prisma } from '@/lib/prisma';

// Validation schemas
const createPropertySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  type: z.nativeEnum(PropertyType),
  price: z.number().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  maxGuests: z.number().int().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  amenityIds: z.array(z.string()).optional(),
});

const updatePropertySchema = createPropertySchema.partial();

const searchPropertiesSchema = z.object({
  location: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  type: z.nativeEnum(PropertyType).optional(),
  amenities: z.string().optional(), // comma-separated amenity IDs
  sortBy: z.enum(['price', 'rating', 'newest']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export class PropertyController {
  // Create a new property
  static async createProperty(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const validatedData = createPropertySchema.parse(req.body);
      const { amenityIds, ...propertyData } = validatedData;

      const property = await prisma.property.create({
        data: {
          ...propertyData,
          hostId: userId,
          amenities: amenityIds ? {
            create: amenityIds.map(amenityId => ({
              amenityId
            }))
          } : undefined
        },
        include: {
          host: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          images: true,
          amenities: {
            include: {
              amenity: true
            }
          },
          _count: {
            select: {
              reviews: true,
              bookings: true
            }
          }
        }
      });

      logger.info(`Property created: ${property.id} by user: ${userId}`);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      logger.error('Error creating property:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  // Get all properties with search and filtering
  static async getProperties(req: Request, res: Response) {
    try {
      const query = searchPropertiesSchema.parse(req.query);
      
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        isActive: true
      };

      // Location search
      if (query.location) {
        where.OR = [
          { city: { contains: query.location, mode: 'insensitive' } },
          { state: { contains: query.location, mode: 'insensitive' } },
          { country: { contains: query.location, mode: 'insensitive' } },
          { address: { contains: query.location, mode: 'insensitive' } }
        ];
      }

      // Price range
      if (query.minPrice || query.maxPrice) {
        where.price = {};
        if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
        if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
      }

      // Property type
      if (query.type) {
        where.type = query.type;
      }

      // Guest capacity
      if (query.guests) {
        where.maxGuests = { gte: parseInt(query.guests) };
      }

      // Amenities filter
      if (query.amenities) {
        const amenityIds = query.amenities.split(',');
        where.amenities = {
          some: {
            amenityId: { in: amenityIds }
          }
        };
      }

      // Date availability check
      if (query.checkIn && query.checkOut) {
        const checkIn = new Date(query.checkIn);
        const checkOut = new Date(query.checkOut);
        
        where.bookings = {
          none: {
            OR: [
              {
                AND: [
                  { checkIn: { lte: checkIn } },
                  { checkOut: { gt: checkIn } }
                ]
              },
              {
                AND: [
                  { checkIn: { lt: checkOut } },
                  { checkOut: { gte: checkOut } }
                ]
              },
              {
                AND: [
                  { checkIn: { gte: checkIn } },
                  { checkOut: { lte: checkOut } }
                ]
              }
            ],
            status: { in: ['CONFIRMED', 'PENDING'] }
          }
        };
      }

      // Sorting
      let orderBy: any = { createdAt: 'desc' };
      if (query.sortBy === 'price') {
        orderBy = { price: 'asc' };
      } else if (query.sortBy === 'rating') {
        orderBy = { reviews: { _count: 'desc' } };
      }

      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            },
            images: {
              orderBy: { order: 'asc' }
            },
            amenities: {
              include: {
                amenity: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            },
            _count: {
              select: {
                reviews: true,
                bookings: true
              }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.property.count({ where })
      ]);

      // Calculate average ratings
      const propertiesWithRatings = properties.map(property => {
        const avgRating = property.reviews.length > 0
          ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
          : 0;
        
        const { reviews, ...propertyWithoutReviews } = property;
        return {
          ...propertyWithoutReviews,
          avgRating: Math.round(avgRating * 10) / 10
        };
      });

      res.json({
        properties: propertiesWithRatings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
      }
      logger.error('Error fetching properties:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get property by ID
  static async getPropertyById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const property = await prisma.property.findUnique({
        where: { id, isActive: true },
        include: {
          host: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              createdAt: true,
            }
          },
          images: {
            orderBy: { order: 'asc' }
          },
          amenities: {
            include: {
              amenity: true
            }
          },
          reviews: {
            include: {
              guest: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              reviews: true,
              bookings: true
            }
          }
        }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Calculate average rating and rating breakdown
      const avgRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;

      const ratingBreakdown = {
        cleanliness: 0,
        accuracy: 0,
        checkIn: 0,
        communication: 0,
        location: 0,
        value: 0
      };

      if (property.reviews.length > 0) {
        property.reviews.forEach(review => {
          if (review.cleanliness) ratingBreakdown.cleanliness += review.cleanliness;
          if (review.accuracy) ratingBreakdown.accuracy += review.accuracy;
          if (review.checkIn) ratingBreakdown.checkIn += review.checkIn;
          if (review.communication) ratingBreakdown.communication += review.communication;
          if (review.location) ratingBreakdown.location += review.location;
          if (review.value) ratingBreakdown.value += review.value;
        });

        Object.keys(ratingBreakdown).forEach(key => {
          ratingBreakdown[key as keyof typeof ratingBreakdown] = 
            Math.round((ratingBreakdown[key as keyof typeof ratingBreakdown] / property.reviews.length) * 10) / 10;
        });
      }

      res.json({
        ...property,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingBreakdown
      });
    } catch (error) {
      logger.error('Error fetching property:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  // Update property
  static async updateProperty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const validatedData = updatePropertySchema.parse(req.body);
      const { amenityIds, ...propertyData } = validatedData;

      // Check if property exists and user owns it
      const existingProperty = await prisma.property.findUnique({
        where: { id },
        select: { hostId: true }
      });

      if (!existingProperty) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (existingProperty.hostId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to update this property' });
      }

      // Update property with amenities
      const updateData: any = { ...propertyData };
      
      if (amenityIds) {
        // Remove existing amenities and add new ones
        await prisma.propertyAmenity.deleteMany({
          where: { propertyId: id }
        });
        
        updateData.amenities = {
          create: amenityIds.map(amenityId => ({
            amenityId
          }))
        };
      }

      const property = await prisma.property.update({
        where: { id },
        data: updateData,
        include: {
          host: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          images: true,
          amenities: {
            include: {
              amenity: true
            }
          },
          _count: {
            select: {
              reviews: true,
              bookings: true
            }
          }
        }
      });

      logger.info(`Property updated: ${property.id} by user: ${userId}`);
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      logger.error('Error updating property:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete property (soft delete)
  static async deleteProperty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if property exists and user owns it
      const existingProperty = await prisma.property.findUnique({
        where: { id },
        select: { hostId: true, title: true }
      });

      if (!existingProperty) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (existingProperty.hostId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to delete this property' });
      }

      // Check for active bookings
      const activeBookings = await prisma.booking.count({
        where: {
          propertyId: id,
          status: { in: ['CONFIRMED', 'PENDING'] },
          checkOut: { gte: new Date() }
        }
      });

      if (activeBookings > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete property with active bookings',
          activeBookings 
        });
      }

      // Soft delete by setting isActive to false
      await prisma.property.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info(`Property deleted: ${id} (${existingProperty.title}) by user: ${userId}`);
      res.json({ message: 'Property deleted successfully' });
    } catch (error) {
      logger.error('Error deleting property:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get properties by host
  static async getPropertiesByHost(req: Request, res: Response) {
    try {
      const { hostId } = req.params;
      const userId = req.user?.id;

      // Users can only see their own properties unless they're admin
      if (hostId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to view these properties' });
      }

      const properties = await prisma.property.findMany({
        where: { 
          hostId,
          isActive: true 
        },
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          amenities: {
            include: {
              amenity: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              reviews: true,
              bookings: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate average ratings
      const propertiesWithRatings = properties.map(property => {
        const avgRating = property.reviews.length > 0
          ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
          : 0;
        
        const { reviews, ...propertyWithoutReviews } = property;
        return {
          ...propertyWithoutReviews,
          avgRating: Math.round(avgRating * 10) / 10
        };
      });

      res.json(propertiesWithRatings);
    } catch (error) {
      logger.error('Error fetching host properties:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get property availability
  static async getPropertyAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (start >= end) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }

      const bookings = await prisma.booking.findMany({
        where: {
          propertyId: id,
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            {
              AND: [
                { checkIn: { lte: start } },
                { checkOut: { gt: start } }
              ]
            },
            {
              AND: [
                { checkIn: { lt: end } },
                { checkOut: { gte: end } }
              ]
            },
            {
              AND: [
                { checkIn: { gte: start } },
                { checkOut: { lte: end } }
              ]
            }
          ]
        },
        select: {
          checkIn: true,
          checkOut: true,
          status: true
        }
      });

      res.json({
        available: bookings.length === 0,
        conflictingBookings: bookings
      });
    } catch (error) {
      logger.error('Error checking property availability:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}