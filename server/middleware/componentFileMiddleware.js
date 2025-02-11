const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/files/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('Full request body:', req.body);  // Debug log
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Access category from FormData
    const category = req.body.category;
    
    console.log('Processing file:', {
        category: category,
        extension: ext,
        originalName: file.originalname
    });

    const allowedTypes = {
        '3D_Models': ['.step', '.stp'],
        '2D_Drawings': ['.pdf', '.dxf'],
        'Artwork': ['.cdr', '.ai', '.psd', '.pdf'],
        'Images': ['.jpeg', '.jpg', '.png'],
        'Documents': ['.doc', '.docx', '.pdf'],
        'Vendor_Data': ['.txt', '.pdf']
    };

    // If category isn't available yet, accept the file and validate later
    if (!category) {
        return cb(null, true);
    }

    if (!allowedTypes[category]?.includes(ext)) {
        return cb(new Error(`Invalid file type for ${category}`));
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

module.exports = upload;