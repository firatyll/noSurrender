const express = require('express');
const router = express.Router();

const levelController = require('../controllers/levelController');

router.post('/level-up', levelController.levelUpCardCaseStudy);
router.post('/', levelController.levelUpCard);
router.get('/cards', levelController.getUserCards);

module.exports = router;