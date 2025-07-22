const express = require('express');
const router = express.Router();

const progressController = require('../controllers/progressController');

router.post('/', progressController.updateProgress);
router.post('/bulk', progressController.bulkUpdateProgress);

module.exports = router;