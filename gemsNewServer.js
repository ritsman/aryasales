const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();


const indexRoutes = require('./routes/index');
app.use(cors());  // This will allow all origins

app.use(express.json());
app.use('/api', indexRoutes);


// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'public','uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use(express.static('public'));
// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname,'public', 'uploads')));

// ✅ Add this route for checking in browser
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

app.get('/debug/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'uploads', 'products', filename);
  
  console.log('Checking file:', filename);
  console.log('Full path:', filePath);
  console.log('File exists:', fs.existsSync(filePath));
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    res.json({
      exists: true,
      size: stats.size,
      fullPath: filePath,
      relativePath: `/uploads/products/${filename}`
    });
  } else {
    res.json({
      exists: false,
      fullPath: filePath,
      directoryExists: fs.existsSync(path.dirname(filePath))
    });
  }
});

app.get('/debug/directory', (req, res) => {
  const uploadsDir = path.join(__dirname, 'public', 'uploads', 'products');
  
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    res.json({
      directory: uploadsDir,
      exists: true,
      files: files
    });
  } else {
    res.json({
      directory: uploadsDir,
      exists: false
    });
  }
});
const mongoose = require("mongoose");

async function connectMongo() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/gems", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

connectMongo();

//app.listen(3025, () => console.log('Server running on port 3025'));
app.listen(3025, () => {
  console.log('Server running on port 3025');
  console.log('Static files served from:', path.join(__dirname, 'public'));
});
