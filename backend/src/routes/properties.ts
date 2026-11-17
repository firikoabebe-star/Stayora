import express from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import { PropertyController } from '@/controllers/propertyController';
import { AmenityController } from '@/controllers/amenityController';
import { ImageController } from '@/controllers/imageController';

const router = express.Router();

// Public routes
router.get('/', PropertyController.getProperties);
router.get('/:id', PropertyController.getPropertyById);
router.get('/:id/availability', PropertyController.getPropertyAvailability);

// Protected routes - Properties
router.post('/', authenticate, authorize('HOST', 'ADMIN'), PropertyController.createProperty);
router.put('/:id', authenticate, authorize('HOST', 'ADMIN'), PropertyController.updateProperty);
router.delete('/:id', authenticate, authorize('HOST', 'ADMIN'), PropertyController.deleteProperty);

// Host-specific routes
router.get('/host/:hostId', authenticate, PropertyController.getPropertiesByHost);

// Image routes
router.post('/:propertyId/images', 
  authenticate, 
  authorize('HOST', 'ADMIN'),
  ImageController.uploadMiddleware,
  ImageController.uploadPropertyImages
);
router.put('/:propertyId/images/:imageId', 
  authenticate, 
  authorize('HOST', 'ADMIN'), 
  ImageController.updatePropertyImage
);
router.delete('/:propertyId/images/:imageId', 
  authenticate, 
  authorize('HOST', 'ADMIN'), 
  ImageController.deletePropertyImage
);
router.put('/:propertyId/images/reorder', 
  authenticate, 
  authorize('HOST', 'ADMIN'), 
  ImageController.reorderPropertyImages
);

// Amenity routes
router.get('/amenities/all', AmenityController.getAmenities);
router.post('/amenities', authenticate, authorize('ADMIN'), AmenityController.createAmenity);
router.put('/amenities/:id', authenticate, authorize('ADMIN'), AmenityController.updateAmenity);
router.delete('/amenities/:id', authenticate, authorize('ADMIN'), AmenityController.deleteAmenity);

export default router;