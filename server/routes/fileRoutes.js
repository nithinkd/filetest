const express = require('express');
const router = express.Router({ mergeParams: true });
const upload = require('../middleware/componentFileMiddleware');
const { uploadFile, downloadFile, deleteFile } = require('../controllers/fileController');

router.post('/upload', upload.single('file'), uploadFile);
router.get('/:fileId/download', downloadFile);
router.delete('/:fileId', deleteFile);

module.exports = router;