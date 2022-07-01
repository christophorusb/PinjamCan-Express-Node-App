const express = require('express')
const router = express.Router()
const { registerUser, 
    loginUser, 
    getUser, 
    checkUser, 
    sendRecoveryEmail, 
    verifyResetToken,
    createNewPassword,
    updateUserInfo,
    getUserInfo, } = require('../controllers/userController')
const { protect } = require('../authMiddleware.js')

router.get('/profile', protect, getUserInfo)
router.put('/profile/edit', protect, updateUserInfo)
router.post('/login', loginUser)
router.post('/register', registerUser)
router.post('/check-user', checkUser)
router.get('/', protect, getUser)
router.post('/reset-password/send-recovery-email', sendRecoveryEmail)
router.get('/reset-password/verify-reset-token/:resetToken', verifyResetToken)
router.post('/reset-password/create-new-password', createNewPassword)
// router.get('/dashboard/:userId', protect, userDashboard)

module.exports = router