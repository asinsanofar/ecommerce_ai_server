const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Cart Controller
 * Handles shopping cart operations
 */

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name brand price discount image stock isActive',
  });

  if (!cart) {
    const newCart = await Cart.create({
      user: req.user._id,
      items: [],
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { cart: newCart }, 'Cart retrieved successfully'));
  }

  cart.items = cart.items.filter((item) => item.product && item.product.isActive);

  return res
    .status(200)
    .json(new ApiResponse(200, { cart }, 'Cart retrieved successfully'));
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/items
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findOne({ _id: productId, isActive: true });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stock) {
      throw new ApiError(
        400,
        `Cannot add more. Only ${product.stock} items available in stock`
      );
    }
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
    });
  }

  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name brand price discount image',
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { cart }, 'Item added to cart successfully'));
});

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/cart/items/:productId
 * @access  Private
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 0) {
    throw new ApiError(400, 'Quantity cannot be negative');
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new ApiError(404, 'Product not found');
    }

    if (quantity > product.stock) {
      throw new ApiError(400, `Only ${product.stock} items available in stock`);
    }

    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name brand price discount image',
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { cart }, 'Cart updated successfully'));
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:productId
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name brand price discount image',
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { cart }, 'Item removed from cart successfully'));
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = [];
  cart.totalAmount = 0;
  cart.totalItems = 0;

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { cart }, 'Cart cleared successfully'));
});

/**
 * @desc    Get cart summary (totals)
 * @route   GET /api/cart/summary
 * @access  Private
 */
const getCartSummary = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'price discount',
  });

  if (!cart || cart.items.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalItems: 0,
          subtotal: 0,
          discount: 0,
          total: 0,
        },
        'Cart summary retrieved'
      )
    );
  }

  let subtotal = 0;
  let totalDiscount = 0;

  cart.items.forEach((item) => {
    if (item.product) {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = itemTotal * (item.product.discount / 100);
      subtotal += itemTotal;
      totalDiscount += itemDiscount;
    }
  });

  const total = subtotal - totalDiscount;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalItems: cart.totalItems,
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(totalDiscount.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
      'Cart summary retrieved'
    )
  );
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
};
