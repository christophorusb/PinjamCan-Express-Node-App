const express = require('express')
const router = express.Router()
const { protect } = require('../authMiddleware.js')
const { handlePayment, 
        handlePaymentNotification,
        getTransactionsByUserId,
        cancelPendingPaymentByOrderId,
        handlePendingPayment
    } = require('../controllers/TransactionController')

router.post('/', protect, handlePayment)
router.post('/pending/:orderId', protect, handlePendingPayment)
router.delete('/:orderId', protect, cancelPendingPaymentByOrderId)
router.post('/notification', handlePaymentNotification)
router.get('/history', protect, getTransactionsByUserId)

module.exports = router