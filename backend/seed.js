const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load models
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Read JSON files
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'products.json'), 'utf-8')
);

const categories = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'categories.json'), 'utf-8')
);

const users = JSON.parse(fs.readFileSync(path.join(__dirname, '_data', 'users.json'), 'utf-8'));

// Import into DB
const importData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    await Category.create(categories);
    await Product.create(products);
    await User.create(users);

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please specify -i to import or -d to delete data');
  process.exit();
}
