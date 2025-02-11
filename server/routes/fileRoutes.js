const express = require('express');
const router = express.Router({ mergeParams: true });
const upload = require('../middleware/componentFileMiddleware');
const { uploadFile, downloadFile, deleteFile } = require('../controllers/fileController');


console.log('Setting up file routes');
router.post('/', upload.single('file'), uploadFile);  // Changed from /upload to /
router.get('/:fileId/download', downloadFile);
router.delete('/:fileId', deleteFile);

module.exports = router;