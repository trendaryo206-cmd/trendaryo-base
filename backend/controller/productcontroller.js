const Product = require('../models/Product');
const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../utils/cloudinary');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  // Build query
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // Start with finding
  query = Product.find(JSON.parse(queryStr)).populate('category', 'name slug');

  // Search functionality
  if (req.query.search) {
    query = Product.find({
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } },
      ],
    }).populate('category', 'name slug');
  }

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments(query.getQuery());

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const products = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: products.length,
    pagination,
    total,
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('reviews')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name avatar',
      },
    });

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Increment view count
  product.viewCount += 1;
  await product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Get product by slug
// @route   GET /api/v1/products/slug/:slug
// @access  Public
exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug')
    .populate('reviews')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name avatar',
      },
    });

  if (!product) {
    return next(new ErrorResponse(`Product not found with slug of ${req.params.slug}`, 404));
  }

  // Increment view count
  product.viewCount += 1;
  await product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Delete images from Cloudinary
  for (const image of product.images) {
    if (image.url) {
      const publicId = image.url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    }
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload product image
// @route   POST /api/v1/products/:id/image
// @access  Private/Admin
exports.uploadProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)
    );
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'trendaryo/products',
    use_filename: true,
    unique_filename: false,
  });

  // Add to product images
  product.images.push({
    url: result.secure_url,
    alt: req.body.alt || product.name,
  });

  // If it's the first image, set as thumbnail
  if (product.images.length === 1) {
    product.thumbnail = result.secure_url;
  }

  await product.save();

  res.status(200).json({
    success: true,
    data: result.secure_url,
  });
});

// @desc    Get trending products
// @route   GET /api/v1/products/trending
// @access  Public
exports.getTrendingProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({
    trendStatus: { $in: ['hot', 'new', 'featured'] },
    status: 'active',
  })
    .sort('-createdAt')
    .limit(10)
    .populate('category', 'name slug');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get related products
// @route   GET /api/v1/products/:id/related
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    status: 'active',
  })
    .limit(4)
    .select('name price thumbnail slug ratings')
    .populate('category', 'name');

  res.status(200).json({
    success: true,
    data: relatedProducts,
  });
});

// @desc    Get products by category
// @route   GET /api/v1/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = asyncHandler(async (req, res, next) => {
  const products = await Product.find({
    category: req.params.categoryId,
    status: 'active',
  })
    .populate('category', 'name slug')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get products on sale
// @route   GET /api/v1/products/sale
// @access  Public
exports.getProductsOnSale = asyncHandler(async (req, res, next) => {
  const products = await Product.find({
    comparePrice: { $gt: 0 },
    status: 'active',
  })
    .where('price')
    .lt('comparePrice')
    .sort('-createdAt')
    .limit(20)
    .populate('category', 'name slug');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});
