const express = require('express')
const router = express.Router()
const { protect } = require('../authMiddleware.js')
const { addItemToCart, 
        getCartItemsByUserId,
        deleteItemFromCart, 
        // updateCartWithOrderId, 
    } = require('../controllers/CartController')

router.post('/:itemId', protect, addItemToCart)
router.get('/:userPayload', protect, getCartItemsByUserId)
router.put('/:itemId', protect, deleteItemFromCart)
// router.put('/:orderId', updateCartWithOrderId)

module.exports = router