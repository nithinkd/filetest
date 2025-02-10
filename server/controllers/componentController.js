const Component = require('../models/Component');
const Project = require('../models/Project');

const createComponent = async (req, res) => {
    try {
        const { name, partCode, componentType, description } = req.body;
        const projectId = req.params.projectId;

        // Check if partCode is unique
        const existingComponent = await Component.findOne({ partCode });
        if (existingComponent) {
            return res.status(400).json({ message: 'Part code already exists' });
        }

        // Create component
        const component = await Component.create({
            name,
            partCode,
            componentType,
            description,
            project: projectId,
            createdBy: req.user.userId,
            thumbnail: req.file ? 'uploads/thumbnails/' + req.file.filename : null
        });

        res.status(201).json({
            message: 'Component created successfully',
            component
        });
    } catch (error) {
        console.error('Component creation error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getComponents = async (req, res) => {
    try {
        const components = await Component.find({ project: req.params.projectId })
            .populate('createdBy', 'username');
        res.json(components);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateComponent = async (req, res) => {
    try {
        const { name, partCode, componentType } = req.body;
        const component = await Component.findByIdAndUpdate(
            req.params.id,
            { name, partCode, componentType },
            { new: true, runValidators: true }
        );
        res.json(component);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateComponentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        // First get the component we're trying to update
        const component = await Component.findById(req.params.id);
        if (!component) {
            return res.status(404).json({ message: 'Component not found' });
        }

        // If trying to set status to Active, check for other active components
        if (status === 'Active') {
            const existingActive = await Component.findOne({
                name: component.name,
                status: 'Active',
                _id: { $ne: req.params.id }
            });
            if (existingActive) {
                return res.status(400).json({ 
                    message: 'Another component with this name is already active' 
                });
            }
        }

        // If all checks pass, update the status
        component.status = status;
        await component.save();

        res.json(component);
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createComponent, 
    getComponents, 
    updateComponent, 
    updateComponentStatus 
};

