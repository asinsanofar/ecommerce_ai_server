const mongoose = require('mongoose');

/**
 * Product Model Schema
 * Defines the structure for product documents in the database
 * Aligned with the frontend product structure (Skin, Hair, Makeup categories)
 */

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Skin', 'Hair', 'Makeup'],
        message: 'Category must be Skin, Hair, or Makeup',
      },
    },
    concern: {
      type: String,
      required: [true, 'Concern is required'],
      enum: {
        values: [
          'Oily Skin',
          'Dry Skin',
          'Acne',
          'Pigmentation',
          'Sensitive Skin',
          'All Skin',
          'Hair Fall',
          'Dry Hair',
          'Frizz',
          'Damage Repair',
          'Dandruff',
          'All Hair',
        ],
        message: 'Please select a valid concern',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    stock: {
      type: Number,
      default: 100,
      min: [0, 'Stock cannot be negative'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
productSchema.index({ category: 1 });
productSchema.index({ concern: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', brand: 'text' }); // Text search

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function () {
  return this.price * (1 - this.discount / 100);
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
