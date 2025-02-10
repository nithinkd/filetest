const express = require('express');
const router = express.Router();
const { 
    createProject, 
    getProjects, 
    getProjectById, 
    deleteProject,
    updateProject  // Add this to the imports
} = require('../controllers/projectController');

// Only design and procurement can create projects
router.post('/create', (req, res, next) => {
   if (req.user.role !== 'admin' && req.user.role !== 'design' && req.user.role !== 'procurement') {
       return res.status(403).json({ message: 'Not authorized to create projects' });
   }
   next();
}, createProject);

router.get('/', getProjects);
router.get('/:id', getProjectById);

router.delete('/:id', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can delete projects' });
    }
    next();
}, deleteProject);

router.put('/:id', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can edit projects' });
    }
    next();
}, updateProject);

module.exports = router;