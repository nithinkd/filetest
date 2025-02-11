const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const { createInitialAdmin } = require('./controllers/authController');
const componentRoutes = require('./routes/componentRoutes');
console.log('Registering routes...');
const fileRoutes = require('./routes/fileRoutes');
// In server.js

// Add these lines to check if routes are being registered




const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, 'uploads/files');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}



// Auth middleware
const auth = async (req, res, next) => {
   try {
       const token = req.header('Authorization').replace('Bearer ', '');
       const decoded = jwt.verify(token, JWT_SECRET);
       req.user = decoded;
       next();
   } catch (error) {
       res.status(401).json({ message: 'Please authenticate' });
   }
};


// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', auth, projectRoutes);
app.use('/api/projects/:projectId/components', auth, componentRoutes);
// Add this line after your middleware setup
app.use('/uploads', express.static('uploads'));
app.use('/api/projects/:projectId/components/:componentId/files', auth, fileRoutes);
console.log('Routes registered');



// Create initial admin user
createInitialAdmin();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});