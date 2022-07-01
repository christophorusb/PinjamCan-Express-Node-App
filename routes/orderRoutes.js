const express = require('express')
const router = express.Router()
const { protect } = require('../authMiddleware.js')
const { getOrdersByOrderId, getOrdersByItemId, handleAcceptedOrder, handleRejectedOrder,
    handleRemoveOrder, handleOnDeliveryOrder, handleArrivedItem, handleReturnItem, handleOwnerArrivedItem
    } = require('../controllers/OrderController')

router.get('/:orderId', protect, getOrdersByOrderId)
router.get('/:itemId', protect, getOrdersByItemId)
router.delete('/remove/:orderId', protect, handleRemoveOrder)
router.put('/accept/:orderId', protect, handleAcceptedOrder)
router.put('/reject/:orderId', protect, handleRejectedOrder)
router.put('/on-delivery/:orderId', protect, handleOnDeliveryOrder)
router.put('/arrived/:orderId', protect, handleArrivedItem)
router.put('/owner-item-arrived/:orderId', protect, handleOwnerArrivedItem)
router.put('/return-item/:orderId', protect, handleReturnItem)

// router.post('/', protect, handlePayment)
// router.post('/notification', handlePaymentNotification)
// router.get('/history', protect, getTransactionByUserId)

module.exports = router