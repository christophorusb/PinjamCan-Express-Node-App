const asyncHandler = require('express-async-handler')
const Item = require('../models/Item.model')

const checkItemExist = asyncHandler(async(req, res, next) =>{
    console.log('checking if item does exist for this user...')
    const textualData = req.body
    const thisUser = req.user

    //checking if the same item is posted by the same user
    const itemExist = await Item.findOne({
        'ItemCreatedBy.userId': thisUser.id,
         ItemName: textualData.itemName,
    })

    console.log(itemExist)

    if(itemExist){
        console.log('item exist error')
        return res.status(400).json({
            status: 'ITEM_EXIST',
            message: 'Item already exists',
            statusCode: 400
        }) 
    }
    console.log('item does not exist. proceed')
    next()
})

module.exports = { checkItemExist }