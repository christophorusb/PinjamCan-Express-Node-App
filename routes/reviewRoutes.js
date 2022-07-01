const express = require('express')
const router = express.Router()
const { protect } = require('../authMiddleware.js')
const { addReview, getReviewsByItemId, getReviewsByOrderId } = require('../controllers/ReviewController')

router.post('/', protect, addReview)

module.exports = router