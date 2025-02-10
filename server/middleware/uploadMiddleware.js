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
    const ext = path.extname(file.originalname).toLowerCase();
    const category = req.body.category;
    
    const allowedTypes = {
        '3D_Models': ['.stp','.step'],
        '2D_Drawings': ['.pdf', '.dxf'],
        'Artwork': ['.cdr', '.ai', '.psd','.pdf'],
        'Images': ['.jpeg', '.jpg', '.png'],
        'Documents': ['.doc', '.docx', '.pdf'],
        'Vendor_Data': ['.txt']
    };

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