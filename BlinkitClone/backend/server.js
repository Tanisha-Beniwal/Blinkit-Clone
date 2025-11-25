const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blinkit-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Models
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [{
    street: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false },
  }],
  createdAt: { type: Date, default: Date.now },
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  category: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, default: 0 },
  unit: String,
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 4.0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
  }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Admin Middleware
const adminMiddleware = async (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'user',
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
      { expiresIn: '7d' }
    );

    res.json({ 
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(400).json({ message: 'Login failed', error: error.message });
  }
});

// Get Current User
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// ==================== PRODUCT ROUTES ====================

// Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// Get Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Create Product (Admin Only)
app.post('/api/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
});

// Update Product (Admin Only)
app.put('/api/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
});

// Delete Product (Admin Only)
app.delete('/api/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete product', error: error.message });
  }
});

// ==================== ORDER ROUTES ====================

// Create Order
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const order = new Order({
      userId: req.userId,
      ...req.body,
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create order', error: error.message });
  }
});

// Get User Orders
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Get All Orders (Admin Only)
app.get('/api/orders/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Get Single Order
app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');
    
    // Check if user owns this order or is admin
    if (order.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(404).json({ message: 'Order not found' });
  }
});

// Update Order Status (Admin Only)
app.put('/api/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update order', error: error.message });
  }
});

// ==================== USER ROUTES ====================

// Get User Profile
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch profile' });
  }
});

// Update User Profile
app.put('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update profile' });
  }
});

// Add Address
app.post('/api/user/address', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.addresses.push(req.body);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add address' });
  }
});

// Get Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch categories' });
  }
});

// ==================== SEED DATA (For Testing) ====================
app.get('/api/seed', async (req, res) => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    
    // Sample products with real-looking image URLs
   const products = [
  // Vegetables & Fruits
  { name: 'Fresh Tomatoes', description: 'Fresh red tomatoes, locally sourced', price: 40, originalPrice: 50, category: 'Vegetables & Fruits', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT1xWa6RGujnMx4u6jTF5p2f3pL95mpYL6HVZwUdOmG7h8CoQekKUb3o1v7JmEiaUlcX1bBqlr0hnc8jwdwk1zkO3y4eygLnfS4-kpFdcAA0djrPY7rWz7YcA', unit: '500g', discount: 20, stock: 50, rating: 4.2 },
  { name: 'Fresh Bananas', description: 'Premium ripe bananas', price: 50, originalPrice: 60, category: 'Vegetables & Fruits', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=300&fit=crop', unit: '1 dozen', discount: 17, stock: 40, rating: 4.4 },
  { name: 'Fresh Apples', description: 'Crispy red apples from Kashmir', price: 80, originalPrice: 100, category: 'Vegetables & Fruits', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop', unit: '1kg', discount: 20, stock: 45, rating: 4.5 },
  { name: 'Fresh Carrots', description: 'Organic carrots, farm fresh', price: 35, originalPrice: 45, category: 'Vegetables & Fruits', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop', unit: '500g', discount: 22, stock: 60, rating: 4.3 },
  { name: 'Fresh Onions', description: 'Red onions, essential for cooking', price: 30, originalPrice: 38, category: 'Vegetables & Fruits', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop', unit: '1kg', discount: 21, stock: 80, rating: 4.1 },
  
  // Dairy & Breakfast
  { name: 'Amul Milk', description: 'Fresh toned milk', price: 28, originalPrice: 30, category: 'Dairy & Breakfast', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop', unit: '500ml', discount: 7, stock: 100, rating: 4.5 },
  { name: 'Amul Butter', description: 'Creamy salted butter', price: 55, originalPrice: 60, category: 'Dairy & Breakfast', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop', unit: '100g', discount: 8, stock: 70, rating: 4.6 },
  { name: 'Yogurt Cup', description: 'Fresh homemade style yogurt', price: 45, originalPrice: 50, category: 'Dairy & Breakfast', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', unit: '400g', discount: 10, stock: 60, rating: 4.4 },
  { name: 'Paneer', description: 'Fresh cottage cheese', price: 90, originalPrice: 100, category: 'Dairy & Breakfast', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop', unit: '200g', discount: 10, stock: 35, rating: 4.5 },
  { name: 'Cheese Slices', description: 'Premium cheddar cheese slices', price: 120, originalPrice: 140, category: 'Dairy & Breakfast', image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=300&fit=crop', unit: '200g', discount: 14, stock: 50, rating: 4.3 },
  
  // Munchies
  { name: 'Lays Classic Chips', description: 'Crispy salted potato chips', price: 20, originalPrice: 20, category: 'Munchies', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop', unit: '50g', discount: 0, stock: 75, rating: 4.0 },
  { name: 'Kurkure Masala', description: 'Crunchy spicy snack', price: 20, originalPrice: 20, category: 'Munchies', image: 'https://images.unsplash.com/photo-1613919234083-5c217d28300f?w=400&h=300&fit=crop', unit: '60g', discount: 0, stock: 80, rating: 4.2 },
  { name: 'Haldiram Bhujia', description: 'Traditional Indian snack', price: 50, originalPrice: 55, category: 'Munchies', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop', unit: '200g', discount: 9, stock: 40, rating: 4.5 },
  { name: 'Pringles Original', description: 'Stackable potato crisps', price: 150, originalPrice: 170, category: 'Munchies', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop', unit: '107g', discount: 12, stock: 30, rating: 4.4 },
  { name: 'Bingo Mad Angles', description: 'Uniquely shaped tangy chips', price: 20, originalPrice: 20, category: 'Munchies', image: 'bingo.jpg', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop', unit: '52g', discount: 0, stock: 65, rating: 4.1 },
  
  // Cold Drinks & Juices
  { name: 'Coca Cola', description: 'Refreshing cola drink', price: 40, originalPrice: 45, category: 'Cold Drinks & Juices', image: 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&cs=tinysrgb&w=400', unit: '750ml', discount: 11, stock: 60, rating: 4.3 },
  { name: 'Pepsi', description: 'Bold cola taste', price: 40, originalPrice: 45, category: 'Cold Drinks & Juices', image: 'https://images.pexels.com/photos/4057659/pexels-photo-4057659.jpeg?auto=compress&cs=tinysrgb&w=400', unit: '750ml', discount: 11, stock: 55, rating: 4.2 },
  { name: 'Tropicana Orange', description: '100% orange juice', price: 120, originalPrice: 140, category: 'Cold Drinks & Juices', image: 'https://images.pexels.com/photos/1337824/pexels-photo-1337824.jpeg?auto=compress&cs=tinysrgb&w=400', unit: '1L', discount: 14, stock: 40, rating: 4.6 },
  { name: 'Real Mixed Fruit', description: 'Delicious mixed fruit juice', price: 100, originalPrice: 120, category: 'Cold Drinks & Juices', image: 'https://images.pexels.com/photos/1537635/pexels-photo-1537635.jpeg?auto=compress&cs=tinysrgb&w=400', unit: '1L', discount: 17, stock: 45, rating: 4.4 },
  { name: 'Sprite', description: 'Lemon lime flavored drink', price: 40, originalPrice: 45, category: 'Cold Drinks & Juices', image: 'https://images.pexels.com/photos/3593923/pexels-photo-3593923.jpeg?auto=compress&cs=tinysrgb&w=400', unit: '750ml', discount: 11, stock: 50, rating: 4.2 },
  
  // Bakery & Biscuits
  { name: 'Britannia Bread', description: 'Soft white bread', price: 35, originalPrice: 40, category: 'Bakery & Biscuits', image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400', unit: '400g', discount: 13, stock: 80, rating: 4.1 },
  { name: 'Parle-G Biscuits', description: 'Classic glucose biscuits', price: 20, originalPrice: 20, category: 'Bakery & Biscuits', image: 'https://images.pexels.com/photos/890577/pexels-photo-890577.jpeg?auto=compress&cs=tinysrgb&w=400', unit: '200g', discount: 0, stock: 100, rating: 4.5 },
  { name: 'Good Day Cookies', description: 'Butter cookies', price: 30, originalPrice: 35, category: 'Bakery & Biscuits', image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=400', unit: '150g', discount: 14, stock: 75, rating: 4.3 },
  { name: 'Oreo Biscuits', description: 'Cream filled cookies', price: 40, originalPrice: 45, category: 'Bakery & Biscuits', image: 'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=400', unit: '120g', discount: 11, stock: 60, rating: 4.6 },
  { name: 'Cake Rusk', description: 'Crunchy tea time snack', price: 50, originalPrice: 60, category: 'Bakery & Biscuits', image: 'https://images.pexels.com/photos/298218/pexels-photo-298218.jpeg?auto=compress&cs=tinysrgb&w=400', unit: '300g', discount: 17, stock: 40, rating: 4.2 },
  
  // Tea Coffee & Health Drinks
  { name: 'Tata Tea Gold', description: 'Premium black tea', price: 150, originalPrice: 180, category: 'Tea Coffee & Health Drinks', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop', unit: '250g', discount: 17, stock: 50, rating: 4.5 },
  { name: 'Nescafe Classic', description: 'Instant coffee', price: 200, originalPrice: 220, category: 'Tea Coffee & Health Drinks', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop', unit: '100g', discount: 9, stock: 45, rating: 4.6 },
  { name: 'Green Tea', description: 'Healthy herbal tea', price: 180, originalPrice: 200, category: 'Tea Coffee & Health Drinks', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop', unit: '100 bags', discount: 10, stock: 30, rating: 4.7 },
  { name: 'Horlicks', description: 'Health drink for all ages', price: 250, originalPrice: 280, category: 'Tea Coffee & Health Drinks', image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop', unit: '500g', discount: 11, stock: 35, rating: 4.4 },
  { name: 'Bournvita', description: 'Chocolate health drink', price: 240, originalPrice: 270, category: 'Tea Coffee & Health Drinks', image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop', unit: '500g', discount: 11, stock: 40, rating: 4.5 },
  
  // Sweet Tooth
  { name: 'Dairy Milk Chocolate', description: 'Smooth milk chocolate', price: 80, originalPrice: 90, category: 'Sweet Tooth', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=300&fit=crop', unit: '150g', discount: 11, stock: 70, rating: 4.8 },
  { name: 'KitKat', description: 'Crispy wafer chocolate', price: 40, originalPrice: 45, category: 'Sweet Tooth', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJBeqDyBkf9kou-UjAFVCwCwNpZEOnDZuczuBt_clzS7TbSnmmZibwkTdhYHUjvD5UzcfoP84JL91cW037sWcUxb51EzQSzfI1nH8Ly0SG&s=10', unit: '37g', discount: 11, stock: 80, rating: 4.6 },
  { name: 'Chocolate Cake', description: 'Rich chocolate sponge cake', price: 120, originalPrice: 150, category: 'Sweet Tooth', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', unit: '500g', discount: 20, stock: 25, rating: 4.7 },
  { name: 'Gulab Jamun', description: 'Traditional Indian sweet', price: 100, originalPrice: 120, category: 'Sweet Tooth', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&h=300&fit=crop', unit: '1kg', discount: 17, stock: 20, rating: 4.5 },
  { name: 'Ice Cream Tub', description: 'Vanilla ice cream', price: 180, originalPrice: 200, category: 'Sweet Tooth', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop', unit: '1L', discount: 10, stock: 30, rating: 4.6 },
];

    await Product.insertMany(products);
    
    res.json({ message: 'Database seeded successfully', count: products.length });
  } catch (error) {
    res.status(400).json({ message: 'Seed failed', error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});