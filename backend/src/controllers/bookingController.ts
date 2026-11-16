import { Request, Response } from 'express';
import { BookingStatus } from '@prisma/client';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { prisma } from '@/lib/prisma';
import { addDays, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';

// Validation schemas
const createBookingSchema = z.object({
  propertyId: z.string().uuid(),
  checkIn: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid check-in date'
  }),
  checkOut: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid check-out date'
  }),
  guests: z.number().int().min(1).max(16),
  totalPrice: z.number().positive(),
  paymentIntentId: z.string().optional(),
});

const updateBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.number().int().min(1).max(16).optional(),
});

export class BookingController {
  // Create a new booking
  static async createBooking(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const validatedData = createBookingSchema.parse(req.body);
      const checkInDate = parseISO(validatedData.checkIn);
      const checkOutDate = parseISO(validatedData.checkOut);

      // Validate dates
      if (!isAfter(checkOutDate, checkInDate)) {
        return res.status(400).json({ error: 'Check-out date must be after check-in date' });
      }

      if (isBefore(checkInDate, new Date())) {
        return res.status(400).json({ error: 'Check-in date cannot be in the past' });
      }

      const nights = differenceInDays(checkOutDate, checkInDate);
      if (nights > 28) {
        return res.status(400).json({ error: 'Maximum stay is 28 nights' });
      }

      // Check if property exists and is active
      const property = await prisma.property.findUnique({
        where: { id: validatedData.propertyId, isActive: true },
        include: {
          host: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found or inactive' });
      }

      // Prevent self-booking
      if (property.hostId === userId) {
        return res.status(400).json({ error: 'Cannot book your own property' });
      }

      // Check guest capacity
      if (validatedData.guests > property.maxGuests) {
        return res.status(400).json({ 
          error: `Property can accommodate maximum ${property.maxGuests} guests` 
        });
      }

      // Check availability
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          propertyId: validatedData.propertyId,
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            {
              AND: [
                { checkIn: { lte: checkInDate } },
                { checkOut: { gt: checkInDate } }
              ]
            },
            {
              AND: [
                { checkIn: { lt: checkOutDate } },
                { checkOut: { gte: checkOutDate } }
              ]
            },
            {
              AND: [
                { checkIn: { gte: checkInDate } },
                { checkOut: { lte: checkOutDate } }
              ]
            }
          ]
        }
      });

      if (conflictingBookings.length > 0) {
        return res.status(409).json({ 
          error: 'Property is not available for selected dates',
          conflictingBookings: conflictingBookings.map(b => ({
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            status: b.status
          }))
        });
      }

      // Validate pricing (basic check - should match frontend calculation)
      const expectedTotal = Number(property.price) * nights;
      const priceDifference = Math.abs(validatedData.totalPrice - expectedTotal);
      
      if (priceDifference > 1) { // Allow $1 difference for rounding
        return res.status(400).json({ 
          error: 'Price mismatch',
          expected: expectedTotal,
          provided: validatedData.totalPrice
        });
      }

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          guestId: userId,
          propertyId: validatedData.propertyId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: validatedData.guests,
          totalPrice: validatedData.totalPrice,
          status: validatedData.paymentIntentId ? 'CONFIRMED' : 'PENDING',
        },
        include: {
          property: {
            include: {
              host: {
                select: { id: true, firstName: true, lastName: true, email: true }
              },
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
          },
          guest: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });

      logger.info(`Booking created: ${booking.id} for property: ${property.id} by user: ${userId}`);

      // Send notifications
      if (booking.status === 'CONFIRMED') {
        // TODO: Send booking confirmation notification to guest
        // TODO: Send new booking notification to host
        // TODO: Send confirmation emails to guest and host
      }

      // TODO: Create calendar events
      // TODO: Process payment if paymentIntentId provided

      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      logger.error('Error creating booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's bookings
  static async getUserBookings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { status, upcoming, past } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      let where: any = { guestId: userId };

      // Filter by status
      if (status && typeof status === 'string') {
        where.status = status.toUpperCase();
      }

      // Filter by time
      const now = new Date();
      if (upcoming === 'true') {
        where.checkIn = { gte: now };
      } else if (past === 'true') {
        where.checkOut = { lt: now };
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            property: {
              include: {
                host: {
                  select: { id: true, firstName: true, lastName: true, avatar: true }
                },
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.booking.count({ where })
      ]);

      res.json({
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get booking by ID
  static async getBookingById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          property: {
            include: {
              host: {
                select: { id: true, firstName: true, lastName: true, avatar: true, email: true }
              },
              images: true,
              amenities: {
                include: { amenity: true }
              }
            }
          },
          guest: {
            select: { id: true, firstName: true, lastName: true, avatar: true, email: true }
          },
          reviews: {
            include: {
              guest: {
                select: { id: true, firstName: true, lastName: true, avatar: true }
              }
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check if user has access to this booking
      const isGuest = booking.guestId === userId;
      const isHost = booking.property.hostId === userId;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!isGuest && !isHost && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to view this booking' });
      }

      res.json(booking);
    } catch (error) {
      logger.error('Error fetching booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update booking
  static async updateBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const validatedData = updateBookingSchema.parse(req.body);

      // Get existing booking
      const existingBooking = await prisma.booking.findUnique({
        where: { id },
        include: {
          property: {
            select: { hostId: true, maxGuests: true }
          }
        }
      });

      if (!existingBooking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check permissions
      const isGuest = existingBooking.guestId === userId;
      const isHost = existingBooking.property.hostId === userId;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!isGuest && !isHost && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to update this booking' });
      }

      // Guests can only update certain fields and only for future bookings
      if (isGuest && !isHost && !isAdmin) {
        const now = new Date();
        if (existingBooking.checkIn <= now) {
          return res.status(400).json({ error: 'Cannot modify past or current bookings' });
        }

        // Guests can only modify dates and guest count, not status
        if (validatedData.status) {
          return res.status(403).json({ error: 'Guests cannot change booking status' });
        }
      }

      // Validate date changes if provided
      if (validatedData.checkIn || validatedData.checkOut) {
        const newCheckIn = validatedData.checkIn ? parseISO(validatedData.checkIn) : existingBooking.checkIn;
        const newCheckOut = validatedData.checkOut ? parseISO(validatedData.checkOut) : existingBooking.checkOut;

        if (!isAfter(newCheckOut, newCheckIn)) {
          return res.status(400).json({ error: 'Check-out date must be after check-in date' });
        }

        if (isBefore(newCheckIn, new Date())) {
          return res.status(400).json({ error: 'Check-in date cannot be in the past' });
        }

        // Check availability for new dates (exclude current booking)
        const conflictingBookings = await prisma.booking.findMany({
          where: {
            propertyId: existingBooking.propertyId,
            id: { not: id },
            status: { in: ['CONFIRMED', 'PENDING'] },
            OR: [
              {
                AND: [
                  { checkIn: { lte: newCheckIn } },
                  { checkOut: { gt: newCheckIn } }
                ]
              },
              {
                AND: [
                  { checkIn: { lt: newCheckOut } },
                  { checkOut: { gte: newCheckOut } }
                ]
              },
              {
                AND: [
                  { checkIn: { gte: newCheckIn } },
                  { checkOut: { lte: newCheckOut } }
                ]
              }
            ]
          }
        });

        if (conflictingBookings.length > 0) {
          return res.status(409).json({ 
            error: 'Property is not available for selected dates',
            conflictingBookings: conflictingBookings.map(b => ({
              checkIn: b.checkIn,
              checkOut: b.checkOut,
              status: b.status
            }))
          });
        }
      }

      // Validate guest count
      if (validatedData.guests && validatedData.guests > existingBooking.property.maxGuests) {
        return res.status(400).json({ 
          error: `Property can accommodate maximum ${existingBooking.property.maxGuests} guests` 
        });
      }

      // Update booking
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          ...validatedData,
          checkIn: validatedData.checkIn ? parseISO(validatedData.checkIn) : undefined,
          checkOut: validatedData.checkOut ? parseISO(validatedData.checkOut) : undefined,
        },
        include: {
          property: {
            include: {
              host: {
                select: { id: true, firstName: true, lastName: true, avatar: true }
              },
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
          },
          guest: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        }
      });

      logger.info(`Booking updated: ${id} by user: ${userId}`);
      
      // Send notifications for status changes
      if (validatedData.status && validatedData.status !== existingBooking.status) {
        // TODO: Send status change notification to guest and host
      }
      
      res.json(updatedBooking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      logger.error('Error updating booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Cancel booking
  static async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          property: {
            select: { hostId: true, title: true }
          }
        }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check permissions
      const isGuest = booking.guestId === userId;
      const isHost = booking.property.hostId === userId;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!isGuest && !isHost && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to cancel this booking' });
      }

      // Check if booking can be cancelled
      if (booking.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Booking is already cancelled' });
      }

      if (booking.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Cannot cancel completed booking' });
      }

      // Update booking status
      const cancelledBooking = await prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          property: {
            include: {
              host: {
                select: { id: true, firstName: true, lastName: true, email: true }
              }
            }
          },
          guest: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });

      logger.info(`Booking cancelled: ${id} by user: ${userId}`);

      // Send cancellation notifications
      // TODO: Send cancellation notification to guest and host
      // TODO: Process refund based on cancellation policy
      // TODO: Send cancellation emails
      // TODO: Update calendar availability

      res.json({
        message: 'Booking cancelled successfully',
        booking: cancelledBooking
      });
    } catch (error) {
      logger.error('Error cancelling booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get host bookings (for property owners)
  static async getHostBookings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { status, propertyId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      let where: any = {
        property: { hostId: userId }
      };

      if (status && typeof status === 'string') {
        where.status = status.toUpperCase();
      }

      if (propertyId && typeof propertyId === 'string') {
        where.propertyId = propertyId;
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            property: {
              select: {
                id: true,
                title: true,
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            },
            guest: {
              select: { id: true, firstName: true, lastName: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.booking.count({ where })
      ]);

      res.json({
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching host bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get booking statistics
  static async getBookingStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { role } = req.user;
      const now = new Date();

      if (role === 'HOST' || role === 'ADMIN') {
        // Host statistics
        const [
          totalBookings,
          confirmedBookings,
          pendingBookings,
          upcomingBookings,
          totalRevenue,
          monthlyRevenue
        ] = await Promise.all([
          prisma.booking.count({
            where: { property: { hostId: userId } }
          }),
          prisma.booking.count({
            where: { 
              property: { hostId: userId },
              status: 'CONFIRMED'
            }
          }),
          prisma.booking.count({
            where: { 
              property: { hostId: userId },
              status: 'PENDING'
            }
          }),
          prisma.booking.count({
            where: { 
              property: { hostId: userId },
              status: 'CONFIRMED',
              checkIn: { gte: now }
            }
          }),
          prisma.booking.aggregate({
            where: { 
              property: { hostId: userId },
              status: { in: ['CONFIRMED', 'COMPLETED'] }
            },
            _sum: { totalPrice: true }
          }),
          prisma.booking.aggregate({
            where: { 
              property: { hostId: userId },
              status: { in: ['CONFIRMED', 'COMPLETED'] },
              createdAt: {
                gte: new Date(now.getFullYear(), now.getMonth(), 1)
              }
            },
            _sum: { totalPrice: true }
          })
        ]);

        res.json({
          totalBookings,
          confirmedBookings,
          pendingBookings,
          upcomingBookings,
          totalRevenue: totalRevenue._sum.totalPrice || 0,
          monthlyRevenue: monthlyRevenue._sum.totalPrice || 0
        });
      } else {
        // Guest statistics
        const [
          totalBookings,
          upcomingBookings,
          pastBookings,
          totalSpent
        ] = await Promise.all([
          prisma.booking.count({
            where: { guestId: userId }
          }),
          prisma.booking.count({
            where: { 
              guestId: userId,
              checkIn: { gte: now }
            }
          }),
          prisma.booking.count({
            where: { 
              guestId: userId,
              checkOut: { lt: now }
            }
          }),
          prisma.booking.aggregate({
            where: { 
              guestId: userId,
              status: { in: ['CONFIRMED', 'COMPLETED'] }
            },
            _sum: { totalPrice: true }
          })
        ]);

        res.json({
          totalBookings,
          upcomingBookings,
          pastBookings,
          totalSpent: totalSpent._sum.totalPrice || 0
        });
      }
    } catch (error) {
      logger.error('Error fetching booking statistics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}