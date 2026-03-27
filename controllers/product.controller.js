const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Product Controller
 * Handles product CRUD operations and search/filter functionality
 */

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    concern,
    search,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    page = 1,
    limit = 18,
  } = req.query;

  // Build filter object
  const filter = { isActive: true };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (concern && concern !== 'all') {
    filter.concern = concern;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
    ];
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Calculate pagination
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  let sortObj = {};
  if (sort) {
    const sortFields = sort.split(',');
    sortFields.forEach((field) => {
      if (field.startsWith('-')) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });
  }

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage,
        },
      },
      'Products retrieved successfully'
    )
  );
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, 'Product retrieved successfully'));
});

/**
 * @desc    Create new product (Admin only)
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    brand,
    category,
    concern,
    price,
    discount,
    image,
    description,
    stock,
  } = req.body;

  const product = await Product.create({
    name,
    brand,
    category,
    concern,
    price,
    discount: discount || 0,
    image,
    description,
    stock: stock || 100,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { product }, 'Product created successfully'));
});

/**
 * @desc    Update product (Admin only)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { product: updatedProduct }, 'Product updated successfully')
    );
});

/**
 * @desc    Delete product (Admin only)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Soft delete
  product.isActive = false;
  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Product deleted successfully'));
});

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 18 } = req.query;

  const validCategories = ['Skin', 'Hair', 'Makeup'];
  if (!validCategories.includes(category)) {
    throw new ApiError(400, 'Invalid category');
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find({ category, isActive: true })
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments({ category, isActive: true }),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
        },
      },
      'Products retrieved successfully'
    )
  );
});

/**
 * @desc    Get all unique concerns (for filtering)
 * @route   GET /api/products/concerns
 * @access  Public
 */
const getConcerns = asyncHandler(async (req, res) => {
  const concerns = await Product.distinct('concern', { isActive: true });

  return res
    .status(200)
    .json(new ApiResponse(200, { concerns }, 'Concerns retrieved successfully'));
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const products = await Product.find({ isActive: true })
    .sort('-rating -createdAt')
    .limit(Number(limit))
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { products }, 'Featured products retrieved successfully')
    );
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getConcerns,
  getFeaturedProducts,
};
