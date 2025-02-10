const Component = require('../models/Component');
const fs = require('fs').promises;
const path = require('path');

const uploadFile = async (req, res) => {
    try {
        console.log('Upload attempt:', {
            file: req.file,
            body: req.body,
            params: req.params,
            user: req.user
        });

        const { componentId } = req.params;
        const { category } = req.body;

        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const component = await Component.findById(componentId);
        console.log('Component found:', component);

        if (!component) {
            return res.status(404).json({ message: 'Component not found' });
        }

        const fileData = {
            category,
            originalName: req.file.originalname,
            fileName: req.file.filename,
            path: req.file.path,
            uploadedBy: req.user.userId
        };
        console.log('File data:', fileData);

        component.files.push(fileData);
        await component.save();

        res.json({ message: 'File uploaded successfully', file: fileData });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
};

const downloadFile = async (req, res) => {
    try {
        const { componentId, fileId } = req.params;
        
        const component = await Component.findById(componentId);
        const file = component.files.id(fileId);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.download(file.path, file.originalName);
    } catch (error) {
        res.status(500).json({ message: error.message }); // Fixed this line
    }
};

const deleteFile = async (req, res) => {
    try {
        const { componentId, fileId } = req.params;
        
        const component = await Component.findById(componentId);
        const file = component.files.id(fileId);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete file from filesystem
        await fs.unlink(file.path);

        // Remove file from component
        component.files.pull(fileId);
        await component.save();

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadFile,
    downloadFile,
    deleteFile
};