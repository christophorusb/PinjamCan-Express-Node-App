const asyncHandler = require('express-async-handler')
const User = require('../models/user.model')
const Item = require('../models/Item.model')
const WishList = require('../models/wishList.model')
const { v4: uuidv4 } = require('uuid')

const addItemToWishList = asyncHandler(async (req, res) => {
    console.log('addItemToWishList API fired')
    const user = req.user
    const itemId = req.params.itemId

    //find wishlist item by userid and check if item exists in items array
    const wishList = await WishList.findOne({ user: user.id })

    if(wishList){
        console.log('wishlist exist')
        if(wishList.items.includes(itemId)){
            console.log('item already exists in wishlist')
            return res.status(200).json({
                statusText: 'ITEM_EXIST_IN_WISHLIST',
                statusCode: 200
            })
        }
        else{
            console.log('update wishlist')
            await WishList.updateOne({ user: user.id }, { $push: { items: itemId } })
            return res.status(200).json({
                statusText: 'ITEM_ADDED_TO_WISHLIST',
                statusCode: 200,
            })
        }
    }

    console.log('wishlist doesnt exist. creating...')
    const itemInWishList = await WishList.create({
        user: user.id,
        items: [itemId],
    })

    return res.status(200).json({
        statusText: 'ITEM_ADDED_TO_WISHLIST',
        statusCode: '200',
    })
})

const deleteItemFromWishList = asyncHandler(async (req, res) => {
    console.log('deleteItemFromWishList API fired')
    const user = req.user
    const itemId = req.params.itemId

    const wishList = await WishList.findOne({ user: user.id })

    //wishlist exist
    if(wishList){
        //delete this item from wishlist
        await WishList.updateOne({ user: user.id }, { $pull: { items: itemId } })

        const updatedWishList = await WishList.findOne({ user: user.id })

        console.log(updatedWishList)
        //if updatedWishList's items array is empty, delete wishlist
        if(updatedWishList.items.length === 0){
            console.log('wishlist items length 0')
            await WishList.deleteOne({ user: user.id })
        }

        return res.status(200).json({
            statusText: 'ITEM_DELETED_FROM_WISHLIST',
            statusCode: 200,
        })
    }
})

const getWishListByUserId = asyncHandler(async (req, res) => {
    console.log('getWishListByUserId API fired ')
    const user = req.user

    const wishList = await WishList.findOne({ user: user.id }).populate('items')

    if(!wishList){
        console.log('cannot find wishlist')
        return res.status(200).json({
            statusText: 'WISHLIST_EMPTY',
            statusCode: '200'
        })
    }
    return res.status(200).json({
        statusText: 'WISHLIST_FETCHED',
        statusCode: '200',
        dataResponse: wishList,
    })
})

module.exports = { addItemToWishList, deleteItemFromWishList, getWishListByUserId }