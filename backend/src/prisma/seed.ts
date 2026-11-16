import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create comprehensive amenities
  const amenities = [
    // Basic amenities
    { name: 'WiFi', icon: '📶', category: 'Basic' },
    { name: 'Kitchen', icon: '🍳', category: 'Basic' },
    { name: 'Washer', icon: '🧺', category: 'Basic' },
    { name: 'Dryer', icon: '🌀', category: 'Basic' },
    { name: 'Air conditioning', icon: '❄️', category: 'Basic' },
    { name: 'Heating', icon: '🔥', category: 'Basic' },
    { name: 'Dedicated workspace', icon: '💻', category: 'Basic' },
    { name: 'TV', icon: '📺', category: 'Basic' },
    { name: 'Hair dryer', icon: '💨', category: 'Basic' },
    { name: 'Iron', icon: '👔', category: 'Basic' },

    // Features
    { name: 'Pool', icon: '🏊', category: 'Features' },
    { name: 'Hot tub', icon: '🛁', category: 'Features' },
    { name: 'Patio or balcony', icon: '🏡', category: 'Features' },
    { name: 'BBQ grill', icon: '🔥', category: 'Features' },
    { name: 'Fire pit', icon: '🔥', category: 'Features' },
    { name: 'Pool table', icon: '🎱', category: 'Features' },
    { name: 'Indoor fireplace', icon: '🔥', category: 'Features' },
    { name: 'Piano', icon: '🎹', category: 'Features' },
    { name: 'Exercise equipment', icon: '🏋️', category: 'Features' },
    { name: 'Lake access', icon: '🏞️', category: 'Features' },
    { name: 'Beach access', icon: '🏖️', category: 'Features' },
    { name: 'Ski-in/Ski-out', icon: '⛷️', category: 'Features' },

    // Location
    { name: 'Free parking on premises', icon: '🅿️', category: 'Location' },
    { name: 'Paid parking on premises', icon: '🅿️', category: 'Location' },
    { name: 'EV charger', icon: '🔌', category: 'Location' },
    { name: 'Gym', icon: '🏋️', category: 'Location' },
    { name: 'Elevator', icon: '🛗', category: 'Location' },

    // Safety
    { name: 'Smoke alarm', icon: '🚨', category: 'Safety' },
    { name: 'First aid kit', icon: '🩹', category: 'Safety' },
    { name: 'Fire extinguisher', icon: '🧯', category: 'Safety' },
    { name: 'Carbon monoxide alarm', icon: '⚠️', category: 'Safety' },
  ];

  console.log('Creating amenities...');
  const createdAmenities = [];
  for (const amenity of amenities) {
    const created = await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    });
    createdAmenities.push(created);
  }

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 12);

  console.log('Creating test users...');
  
  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stayora.com' },
    update: {},
    create: {
      email: 'admin@stayora.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // Host users
  const host1 = await prisma.user.upsert({
    where: { email: 'host1@stayora.com' },
    update: {},
    create: {
      email: 'host1@stayora.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'HOST',
      isVerified: true,
      phone: '+1234567890',
    },
  });

  const host2 = await prisma.user.upsert({
    where: { email: 'host2@stayora.com' },
    update: {},
    create: {
      email: 'host2@stayora.com',
      password: hashedPassword,
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'HOST',
      isVerified: true,
      phone: '+1234567891',
    },
  });

  // Guest user
  const guest = await prisma.user.upsert({
    where: { email: 'guest@stayora.com' },
    update: {},
    create: {
      email: 'guest@stayora.com',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Davis',
      role: 'GUEST',
      isVerified: true,
    },
  });

  // Create sample properties
  console.log('Creating sample properties...');
  
  const property1 = await prisma.property.create({
    data: {
      title: 'Luxury Downtown Apartment',
      description: 'Beautiful modern apartment in the heart of the city with stunning skyline views. Perfect for business travelers and couples looking for a premium stay.',
      type: 'APARTMENT',
      price: 150.00,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      address: '123 Main Street, Apt 15B',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10001',
      latitude: 40.7589,
      longitude: -73.9851,
      hostId: host1.id,
      amenities: {
        create: [
          { amenityId: createdAmenities.find(a => a.name === 'WiFi')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Kitchen')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Air conditioning')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'TV')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Elevator')!.id },
        ]
      }
    }
  });

  const property2 = await prisma.property.create({
    data: {
      title: 'Cozy Beach House',
      description: 'Charming beach house just steps from the ocean. Wake up to the sound of waves and enjoy spectacular sunsets from the private deck.',
      type: 'HOUSE',
      price: 220.00,
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      address: '456 Ocean Drive',
      city: 'Malibu',
      state: 'CA',
      country: 'United States',
      zipCode: '90265',
      latitude: 34.0259,
      longitude: -118.7798,
      hostId: host2.id,
      amenities: {
        create: [
          { amenityId: createdAmenities.find(a => a.name === 'WiFi')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Kitchen')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Beach access')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Patio or balcony')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'BBQ grill')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Free parking on premises')!.id },
        ]
      }
    }
  });

  const property3 = await prisma.property.create({
    data: {
      title: 'Mountain Villa Retreat',
      description: 'Stunning villa nestled in the mountains with panoramic views. Features a private pool, hot tub, and hiking trails right from your doorstep.',
      type: 'VILLA',
      price: 350.00,
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      address: '789 Mountain View Road',
      city: 'Aspen',
      state: 'CO',
      country: 'United States',
      zipCode: '81611',
      latitude: 39.1911,
      longitude: -106.8175,
      hostId: host1.id,
      amenities: {
        create: [
          { amenityId: createdAmenities.find(a => a.name === 'WiFi')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Kitchen')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Pool')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Hot tub')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Indoor fireplace')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Ski-in/Ski-out')!.id },
          { amenityId: createdAmenities.find(a => a.name === 'Free parking on premises')!.id },
        ]
      }
    }
  });

  // Create sample bookings
  console.log('Creating sample bookings...');
  
  const booking1 = await prisma.booking.create({
    data: {
      checkIn: new Date('2024-06-15'),
      checkOut: new Date('2024-06-18'),
      guests: 2,
      totalPrice: 450.00,
      status: 'COMPLETED',
      guestId: guest.id,
      propertyId: property1.id,
    }
  });

  const booking2 = await prisma.booking.create({
    data: {
      checkIn: new Date('2024-07-01'),
      checkOut: new Date('2024-07-05'),
      guests: 4,
      totalPrice: 880.00,
      status: 'CONFIRMED',
      guestId: guest.id,
      propertyId: property2.id,
    }
  });

  // Create sample reviews
  console.log('Creating sample reviews...');
  
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Amazing apartment with incredible views! Sarah was a wonderful host and the location was perfect for exploring the city.',
      cleanliness: 5,
      accuracy: 5,
      checkIn: 5,
      communication: 5,
      location: 5,
      value: 4,
      guestId: guest.id,
      propertyId: property1.id,
      bookingId: booking1.id,
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Test accounts created:');
  console.log('   Admin: admin@stayora.com / password123');
  console.log('   Host 1: host1@stayora.com / password123');
  console.log('   Host 2: host2@stayora.com / password123');
  console.log('   Guest: guest@stayora.com / password123');
  console.log(`📊 Created ${createdAmenities.length} amenities, 3 properties, 2 bookings, 1 review`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });