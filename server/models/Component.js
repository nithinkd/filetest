const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    componentType: {
        type: String,
        required: true,
        enum: ['Enclosure', 'Structural', 'Fillers', 'Adhesives', 'Packaging', 'Collateral']
    },
    partCode: {
        type: String,
        required: true,
        trim: true  // removed unique: true
    },
    description: String,
    thumbnail: {
        path: String,
        uploadedAt: Date,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    files: [{
        category: {
            type: String,
            required: true,
            enum: ['3D_Models', '2D_Drawings', 'Artwork', 'Images', 'Documents', 'Vendor_Data']
        },
        originalName: String,
        path: String,
        fileType: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Obsolete', 'Under Review'],
        default: 'Under Review'
    }
});

componentSchema.pre('save', async function(next) {
    if (this.status === 'Active') {
        const activeComponent = await this.constructor.findOne({
            name: this.name,
            status: 'Active',
            _id: { $ne: this._id }
        });
        if (activeComponent) {
            throw new Error('Another component with this name is already active');
        }
    }

    const sameComponents = await this.constructor.countDocuments({
        name: this.name,
        partCode: this.partCode,
        _id: { $ne: this._id }
    });
    if (sameComponents >= 3) {
        throw new Error('Maximum of three versions allowed');
    }
    next();
});

files: [{
    category: {
        type: String,
        required: true,
        enum: ['3D_Models', '2D_Drawings', 'Artwork', 'Images', 'Documents', 'Vendor_Data']
    },
    originalName: String,
    fileName: String,
    path: String,
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}]

module.exports = mongoose.model('Component', componentSchema);