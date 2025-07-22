const express = require('express');
const router = express.Router();

const energyController = require('../controllers/energyController');

router.get('/', energyController.getEnergyLevels);

module.exports = router;