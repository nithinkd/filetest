const Project = require('../models/Project');

const createProject = async (req, res) => {
    try {
        const { name, projectCode, clientName, priority } = req.body;
        
        // Check if project code already exists
        const existingProject = await Project.findOne({ projectCode });
        if (existingProject) {
            return res.status(400).json({ 
                message: `Project code ${projectCode} is already in use. Please use a different code.` 
            });
        }

        const projectData = {
            name,
            projectCode,
            clientName,
            priority,
            creator: {
                userId: req.user.userId,
                department: req.user.role
            }
        };

        const project = await Project.create(projectData);

        res.status(201).json({
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        console.error('Project creation error:', error);
        if (error.code === 11000) {
            res.status(400).json({ 
                message: 'Project code must be unique. Please use a different code.' 
            });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('creator.userId', 'username');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('creator.userId', 'username');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const { name, projectCode, clientName } = req.body;
        
        // Check if new projectCode already exists (if it's being changed)
        if (projectCode) {
            const existingProject = await Project.findOne({ 
                projectCode, 
                _id: { $ne: req.params.id } 
            });
            if (existingProject) {
                return res.status(400).json({ 
                    message: 'Project code already exists' 
                });
            }
        }

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { name, projectCode, clientName },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { createProject, getProjects, getProjectById, deleteProject, updateProject };