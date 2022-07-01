const express = require('express')
const router = express.Router()
const { protect } = require('../authMiddleware.js')
const { addItemToWishList,
        deleteItemFromWishList,
        getWishListByUserId,
} = require('../controllers/WishListController')

router.get('/', protect, getWishListByUserId)
router.post('/:itemId', protect, addItemToWishList)
router.delete('/:itemId', protect, deleteItemFromWishList)

module.exports = router