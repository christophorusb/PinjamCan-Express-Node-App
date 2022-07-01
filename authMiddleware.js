const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('./models/user.model')

const protect = asyncHandler(async(req, res, next) => {
    console.log('==================================================================================')
    console.log('protect route API fired')
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        console.log('bearer token exists')
        try{
            console.log(`Token: ${req.headers.authorization}`)
            //get token from header
            token = req.headers.authorization.split(' ')[1]

            //verify token
            jwt.verify(token, process.env.JWT_SECRET, (err, user) =>{
                if(err){
                    return res.status(401).json({ status: 'error', message: 'Invalid token' })
                }
                req.user = user
                console.log('user authenticated')
                console.log(user)
            })
            next()
        }catch(err){
            console.log(err)
            res.status(401).json({'message': 'Anda tidak memiliki akses ke halaman ini!', 'status': 'Unauthorized'})
            
        }     
    }

    if(!token){
       return res.status(401).json({'message': 'Anda tidak memiliki akses ke halaman ini!', 'status': 'Unauthorized'})
    }
})

module.exports = { protect }