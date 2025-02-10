const express = require('express');
const router = express.Router({ mergeParams: true });
const { createComponent, getComponents, updateComponent, updateComponentStatus } = require('../controllers/componentController');
const upload = require('../middleware/uploadMiddleware');

const authCheck = (allowedRoles) => (req, res, next) => {
   if (!allowedRoles.includes(req.user.role)) {
       return res.status(403).json({ message: 'Not authorized' });
   }
   next();
};

router.post('/', 
   upload.single('thumbnail'),
   authCheck(['admin', 'design', 'procurement']), 
   createComponent
);

router.get('/', getComponents);

router.put('/:id', 
   authCheck(['admin', 'design']),
   updateComponent
);

router.patch('/:id/status', 
   authCheck(['admin', 'design']),
   updateComponentStatus
);

module.exports = router;