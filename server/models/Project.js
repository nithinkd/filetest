const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    projectCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['Normal', 'High', 'Lightspeed'],
        default: 'Normal'
    },
    creator: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        department: {
            type: String,
            required: true,
            enum: ['admin', 'design', 'procurement'] // Added admin
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema);

// models/Project.js
