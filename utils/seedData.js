require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

/**
 * Database Seeder
 * Seeds sample data including users and products
 * Run with: npm run seed
 */

// Sample products matching the frontend structure
const sampleProducts = [
  // Skin Products
  {
    name: 'Hydra Boost Gel',
    brand: 'Neutrogena',
    category: 'Skin',
    concern: 'Oily Skin',
    price: 599,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400',
    description: 'Lightweight water gel formula that absorbs quickly and delivers intense hydration.',
    stock: 50,
    rating: 4.5,
    reviews: 120,
  },
  {
    name: 'Ceramide Cream',
    brand: 'Cetaphil',
    category: 'Skin',
    concern: 'Dry Skin',
    price: 849,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    description: 'Rich moisturizing cream with ceramides to restore skin barrier.',
    stock: 40,
    rating: 4.7,
    reviews: 89,
  },
  {
    name: 'Niacinamide Serum',
    brand: 'The Ordinary',
    category: 'Skin',
    concern: 'Acne',
    price: 590,
    discount: 5,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    description: 'High-strength vitamin and mineral formula for blemishes.',
    stock: 100,
    rating: 4.6,
    reviews: 250,
  },
  {
    name: 'Vitamin C Serum',
    brand: 'Minimalist',
    category: 'Skin',
    concern: 'Pigmentation',
    price: 545,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    description: 'Brightening serum with 10% Vitamin C for glowing skin.',
    stock: 75,
    rating: 4.4,
    reviews: 180,
  },
  {
    name: 'Aloe Gel',
    brand: 'Plum',
    category: 'Skin',
    concern: 'Sensitive Skin',
    price: 299,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400',
    description: 'Pure aloe vera gel for soothing and hydrating sensitive skin.',
    stock: 150,
    rating: 4.3,
    reviews: 95,
  },
  {
    name: 'Sunscreen SPF50',
    brand: 'Lotus Herbals',
    category: 'Skin',
    concern: 'All Skin',
    price: 399,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    description: 'Broad spectrum sun protection with PA+++ rating.',
    stock: 80,
    rating: 4.5,
    reviews: 200,
  },

  // Hair Products
  {
    name: 'Hair Oil',
    brand: 'Mamaearth',
    category: 'Hair',
    concern: 'Hair Fall',
    price: 349,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400',
    description: 'Onion hair oil with redensyl for hair fall control.',
    stock: 60,
    rating: 4.2,
    reviews: 150,
  },
  {
    name: 'Shampoo',
    brand: 'Dove',
    category: 'Hair',
    concern: 'Dry Hair',
    price: 299,
    discount: 5,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400',
    description: 'Intense repair shampoo for dry and damaged hair.',
    stock: 100,
    rating: 4.4,
    reviews: 300,
  },
  {
    name: 'Conditioner',
    brand: "L'Oreal",
    category: 'Hair',
    concern: 'Frizz',
    price: 399,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400',
    description: 'Smoothing conditioner for frizz-free hair.',
    stock: 70,
    rating: 4.3,
    reviews: 110,
  },
  {
    name: 'Hair Mask',
    brand: 'St. Botanica',
    category: 'Hair',
    concern: 'Damage Repair',
    price: 499,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400',
    description: 'Deep conditioning hair mask with argan oil.',
    stock: 45,
    rating: 4.6,
    reviews: 75,
  },
  {
    name: 'Scalp Serum',
    brand: 'The Body Shop',
    category: 'Hair',
    concern: 'Dandruff',
    price: 599,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400',
    description: 'Anti-dandruff scalp serum with tea tree oil.',
    stock: 55,
    rating: 4.1,
    reviews: 60,
  },
  {
    name: 'Hair Serum',
    brand: "L'Oreal",
    category: 'Hair',
    concern: 'All Hair',
    price: 399,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400',
    description: 'Smoothing hair serum for shine and manageability.',
    stock: 90,
    rating: 4.5,
    reviews: 220,
  },

  // Makeup Products
  {
    name: 'Foundation',
    brand: 'Maybelline',
    category: 'Makeup',
    concern: 'All Skin',
    price: 499,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    description: 'Fit Me matte foundation with SPF 22.',
    stock: 85,
    rating: 4.4,
    reviews: 400,
  },
  {
    name: 'Lipstick',
    brand: 'Lakme',
    category: 'Makeup',
    concern: 'All Skin',
    price: 349,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    description: 'Long-lasting matte lipstick in vibrant shades.',
    stock: 120,
    rating: 4.2,
    reviews: 350,
  },
  {
    name: 'Eyeliner',
    brand: 'Maybelline',
    category: 'Makeup',
    concern: 'All Skin',
    price: 199,
    discount: 5,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    description: 'Waterproof gel eyeliner for precise lines.',
    stock: 150,
    rating: 4.3,
    reviews: 280,
  },
  {
    name: 'Compact Powder',
    brand: "L'Oreal",
    category: 'Makeup',
    concern: 'All Skin',
    price: 399,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    description: 'Matte finish compact powder for all-day wear.',
    stock: 95,
    rating: 4.5,
    reviews: 190,
  },
  {
    name: 'Mascara',
    brand: 'Maybelline',
    category: 'Makeup',
    concern: 'All Skin',
    price: 299,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    description: 'Volumizing mascara for dramatic lashes.',
    stock: 110,
    rating: 4.4,
    reviews: 320,
  },
  {
    name: 'Blush',
    brand: 'Nykaa',
    category: 'Makeup',
    concern: 'All Skin',
    price: 249,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    description: 'Creamy blush for a natural flush of color.',
    stock: 130,
    rating: 4.1,
    reviews: 140,
  },
];

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'ecommerseai',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed data function
const seedData = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@zeencare.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin user created');
    console.log(`   Email: admin@zeencare.com`);
    console.log(`   Password: admin123\n`);

    // Create regular user
    console.log('👤 Creating regular user...');
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
    });
    console.log('✅ Regular user created');
    console.log(`   Email: user@example.com`);
    console.log(`   Password: user123\n`);

    // Create sample user for quick testing
    console.log('👤 Creating sample user...');
    const sampleUser = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'user',
    });
    console.log('✅ Sample user created');
    console.log(`   Email: jane@example.com`);
    console.log(`   Password: password123\n`);

    // Create products
    console.log('📦 Creating products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ ${createdProducts.length} products created\n`);

    // Create empty carts for users
    console.log('🛒 Creating user carts...');
    await Cart.create([
      { user: adminUser._id, items: [] },
      { user: regularUser._id, items: [] },
      { user: sampleUser._id, items: [] },
    ]);
    console.log('✅ User carts created\n');

    console.log('='.repeat(50));
    console.log('🎉 Database seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📋 SAMPLE LOGIN CREDENTIALS:');
    console.log('-'.repeat(50));
    console.log('Admin Account:');
    console.log('  Email:    admin@zeencare.com');
    console.log('  Password: admin123');
    console.log('\nUser Account:');
    console.log('  Email:    user@example.com');
    console.log('  Password: user123');
    console.log('\nSample Account:');
    console.log('  Email:    jane@example.com');
    console.log('  Password: password123');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeder
seedData();
