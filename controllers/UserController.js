const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')

//@desc Authenticate user
//@route POST /api/users/register
//@access Public
const registerUser = asyncHandler(async (req, res) =>{
    console.log('register user API fired')
    console.log(req.body)
    const userEmail = req.body.userEmail
    const userPassword = req.body.dataRequest.userPassword
    const userFullName = req.body.dataRequest.userFullName
    const userNIK = req.body.dataRequest.userNIK
    const userPhoneNumber = req.body.dataRequest.userPhoneNumber
    const userAddress = req.body.dataRequest.userAddress

    console.log(userEmail)

    if(!userEmail || !userPassword || !userFullName || !userNIK || !userPhoneNumber){
        return res.status(400).json({ statusText: 'USER_DATA_INCOMPLETE', message: 'Data harus diisi!' })
    } 

    const hashedPassword = await bcrypt.hash(userPassword, 10)

    //check if user exists
    const userExists = await User.findOne({ userEmail })
    if(userExists){
        return res.status(400).json({ statusText: 'USER_EXIST', message: 'User sudah terdaftar!' })
    }

    //Create user into database
    const user = await User.create({
        userFullName: userFullName,
        userEmail: userEmail,
        userPassword: hashedPassword,
        userOriginalPasswordLength: userPassword.length,
        //userNIK: userNIK,
        userPhoneNumber: '+62' + userPhoneNumber,
        userAddress: userAddress,
    }).then(createdUser => {
        return createdUser
    }).catch(err => {
        if(err.code === 11000 && err.name === 'MongoServerError'){ //duplicate key error
            const duplicateKey = Object.keys(err.keyValue)
            return res.status(400).json({ 
                statusText: 'USER_DATA_DUPLICATE', 
                statusCode: 400,
                duplicateKey: duplicateKey
            })
        }
    })
    console.log('new user pushed to database')

    console.log(user)

    if(user){
        return res.status(200).json({
            _id: user.id,
            userFullName: user.userFullName,
            userEmail: user.userEmail,
        })
    }
})

//@desc Authenticate user
//@route POST /api/users/login
//@access Public
const loginUser = asyncHandler(async (req, res) =>{
    console.log("this api is fired")
    const { userEmail, userPassword } = req.body
    console.log(userEmail)
    
    const user = await User.findOne({userEmail})

    console.log(user)

    if(user && await bcrypt.compare(userPassword, user.userPassword)){
        const generatedToken = generateToken(user._id, user.userFullName, user.userEmail, user.userPhoneNumber)
        return res.status(200).json({
            _id: user.id,
            userEmail: user.userEmail,
            userFullName: user.userFullName,
            token: 'Bearer ' + generatedToken,
            timeOfLogin: new Date(Date.now()).getTime()
        })
    }
    else{
        return res.status(400).json({ status: 'ERROR', message: 'Login gagal!' })
    }
})

//@desc Reset password
//@route POST /api/users/reset-password
//@access Public
const sendRecoveryEmail = asyncHandler(async (req, res) => {
    console.log('reset password api is fired')
    const user = await User.findOne({userEmail: req.body.userEmail})

    if(!user){
        return res.status(400).json({ status: 'ERROR', message: 'User tidak ditemukan!' })
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pinjam.can@gmail.com',
            pass: 'lrlimatmkvzgehts'
        }
    })

    //generate reset token
    const resetPasswordToken = generateResetPasswordToken(req.body.userEmail)

    //add reset password token field to user's db
    await User.updateOne({userEmail: req.body.userEmail}, {$set: { resetPasswordToken: resetPasswordToken }})

    const options = {
        from: 'Pinjam.can@gmail.com',
        to: user.userEmail,
        subject: 'Reset Password',
        html: `<p><strong>Klik link dibawah ini untuk reset password kamu. Link ini tidak akan bisa di akses lagi setelah 30 menit!<strong></p><br><a href="http://localhost:3000/reset-password/create-new-password/${resetPasswordToken}">Link Reset Password</a>`
    }

    transporter.sendMail(options, function(err, info){
        if(err){
            console.log(err)
            return res.status(400).json({
                statusText: 'EMAIL_ERROR',
                statusCode: 400,
            })
        }
        console.log('Sent: ' + info.response)
    })

    return res.status(200).json({
        statusCode: 200,
        statusText: 'PASSWORD_RECOVERY_EMAIL_SENT',
    })
})

//@desc Process password reset
//@route POST /api/users/reset-password/:resetToken
//@access Private
const verifyResetToken = asyncHandler(async (req, res) => {
    console.log('verify reset token API fired')
    const resetToken = req.params.resetToken
    jwt.verify(resetToken, process.env.JWT_SECRET, async (err, decoded) => {
        if(err){
            if(err.name === 'TokenExpiredError'){
                return res.status(400).json({ 
                    statusText: 'PASSWORD_RESET_TOKEN_EXPIRED', 
                    statusCode: 400 
                })
            }
        }
        console.log('resetPassword jwt token payload')
        console.log(decoded)
        return res.status(200).json({
            statusText: 'PASSWORD_RESET_TOKEN_VERIFIED',
            statusCode: 200,
            payloadResponse: decoded,
        })
    })
})

//@desc Process password reset
//@route POST /api/users/reset-password/create-new-password
//@access Private
const createNewPassword = asyncHandler(async (req, res) => {
    console.log('create new password API fired')
    const { userEmail, newUserPassword } = req.body
    const hashedPassword = await bcrypt.hash(newUserPassword, 10)
    await User.updateOne({userEmail: userEmail}, {$set: { userPassword: hashedPassword }, $unset: { resetPasswordToken: '' }})
    return res.status(200).json({
        statusText: 'PASSWORD_RESET_SUCCESS',
        statusCode: 200,
    })
})

//@desc Check user email
//@route POST /api/users/check-user
//@access Public
const checkUser = asyncHandler(async(req, res) =>{
    console.log('check user API is fired')
    const userEmail = req.body.userEmail
    let isUserExist = false
    console.log(userEmail)
    let user = await User.findOne({userEmail})
    console.log(user)

    if(user === null){
        user = false
    }

    if(user){
        console.log('user found')
        return res.status(400).json({
            statusText: 'USER_EMAIL_EXIST',
            statusCode: 400,
            isUserExist: true,
        })
    }
    else{
        console.log('user not found in database, clear for registration')
        return res.status(200).json({
            isUserExist: false,
            newUserEmail: userEmail
        })
    }  
})

const getUserInfo = asyncHandler(async (req, res) => {
    console.log('get user info API is fired')
    const user = req.user

    const thisUser = await User.findOne({_id: user.id})

    return res.status(200).json({
        dataResponse: thisUser,
    })
})

const updateUserInfo = asyncHandler(async (req, res) => {
    console.log('update user info API is fired')
    const user = req.user
    const dataToBeUpdated = req.body
    const thisUser = await User.findOne({_id: user.id})
    
    console.log(dataToBeUpdated)

    if(dataToBeUpdated.hasOwnProperty('userPassword_old')){
        console.log('HAS OLD PASSWORD')
        //if old password matches with the current password in DB
        const compareValid = await bcrypt.compare(dataToBeUpdated.userPassword_old, thisUser.userPassword)
        if(compareValid){
            console.log(`old password is ${compareValid}`)
            const newPasswordLength = dataToBeUpdated.userPassword_new.length
            const newPasswordHashed = await bcrypt.hash(dataToBeUpdated.userPassword_new, 10)
            await User.updateOne({_id: user.id}, {$set: {userPassword: newPasswordHashed, userOriginalPasswordLength: newPasswordLength}})
        }
        else{
            console.log(`old password is ${compareValid}`)
            return res.status(400).json({
                statusText: 'PASSWORD_NOT_MATCH',
                statusCode: 400,
            })
        }
    }
    await User.updateOne({_id: user.id}, {$set: dataToBeUpdated}) 

    return res.status(200).json({
        statusText: 'PROFILE_UPDATED',
        statusCode: 200
    })
})

const getUser = asyncHandler(async(req, res) => {
    const allUsers = await User.find()
    return res.status(200).json({ status: 'OK', data: allUsers })
})

const generateToken = (id, userFullName, userEmail, userPhoneNumber ) =>{
    return jwt.sign({ id, userFullName, userEmail, userPhoneNumber }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

const generateResetPasswordToken = (userEmail) => {
    const resetUUID = uuidv4();
    return jwt.sign({ resetUUID, userEmail }, process.env.JWT_SECRET, { expiresIn: '30m' })
}

module.exports = {
    registerUser,
    loginUser,
    getUser,
    sendRecoveryEmail,
    verifyResetToken,
    createNewPassword,
    checkUser,
    updateUserInfo,
    getUserInfo
}