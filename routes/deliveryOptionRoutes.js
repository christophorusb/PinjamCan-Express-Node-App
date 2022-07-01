const express = require('express')
const router = express.Router()
const { protect } = require('../authMiddleware.js')
const { getDeliveryOptions } = require('../controllers/DeliveryOptionController')

router.get('/', getDeliveryOptions)

module.exports = router