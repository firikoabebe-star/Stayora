import { Router } from 'express';
import { prisma } from '@/lib/prisma';
import { logger } from '@/utils/logger';

const router = Router();

// Get all amenities
router.get('/all', async (req, res) => {
  try {
    const { category } = req.query;
    
    let where = {};
    if (category && typeof category === 'string') {
      where = { category };
    }

    const amenities = await prisma.amenity.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json(amenities);
  } catch (error) {
    logger.error('Error fetching amenities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get amenity by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const amenity = await prisma.amenity.findUnique({
      where: { id }
    });

    if (!amenity) {
      return res.status(404).json({ error: 'Amenity not found' });
    }

    res.json(amenity);
  } catch (error) {
    logger.error('Error fetching amenity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;