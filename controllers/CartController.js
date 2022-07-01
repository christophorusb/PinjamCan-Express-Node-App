const asyncHandler = require('express-async-handler')
const Item = require('../models/Item.model')
const User = require('../models/user.model')
const Cart = require('../models/cart.model')

const addItemToCart = asyncHandler(async (req, res) => {
    console.log('addItemToCart API fired')
    const itemId = req.params.itemId    
    const thisUser = req.user   
    const ItemBorrowDate = req.body.ItemBorrowDate 
    const cart = await Cart.findOne({CartUser: thisUser.id})
    const userByItem = await Item.findOne({_id: itemId}).exec().then(item => {
        return item.ItemCreatedBy.userId
    })

    if(cart){
        console.log('cart exist. updating...')
        const matchedUserInCart = await Cart.findOne({CartUser:thisUser.id , CartItems: {$elemMatch: {'ItemsByUser.CreatedBy': userByItem}}})
        if(matchedUserInCart === null)
        {
            console.log('owner not found. adding item to cart...')
            await Cart.updateOne(
                { _id: cart._id },
                { $push: 
                    { CartItems: 
                        { ItemsByUser: 
                            { 
                                CreatedBy: userByItem, 
                                Items: [{ItemDetail: itemId, ItemBorrowDate: ItemBorrowDate}]
                            } 
                        } 
                    } 
                }
            )
        }
        if(matchedUserInCart !== null){
            console.log('owner found. updating item in cart ')
            await Cart.updateOne(
                {
                    _id: cart._id,
                    'CartItems.ItemsByUser.CreatedBy': userByItem,  
                },
                { $push: {
                    'CartItems.$.ItemsByUser.Items': {
                        ItemDetail: itemId,
                        ItemBorrowDate: ItemBorrowDate,
                    }
                }}
            )
        }
    }
    else{
        console.log('cart does not exist. creating a new one...')
        await Cart.create({
            CartUser: thisUser.id,
            CartItems: [{
                ItemsByUser: {
                    CreatedBy: userByItem,
                    Items: [{ItemDetail: itemId, ItemBorrowDate: ItemBorrowDate}]
                }
            }], 
        })
    }

    return res.status(200).json({
        statusText: 'POSTED_ITEM_TO_CART',
        statusCode: 200,
    })
})

const getCartItemsByUserId = asyncHandler(async (req, res) => {
    console.log('getCartItemsByUserId API fired')
    const userId = req.user.id
    const cartItems = await Cart.findOne({CartUser: userId})
    .populate('CartUser')
    .populate('CartItems.ItemsByUser.CreatedBy')
    .populate({
        path: 'CartItems.ItemsByUser.Items.ItemDetail',
        populate: {
            path: 'ItemDeliveryOptions',
        }
    })
    // .populate('CartItems.ItemsByUser.Items.ItemDetail')
    // .populate('CartItems.ItemsByUser.Items.ItemDetail.ItemDeliveryOptions')


    if(cartItems === null || cartItems.length === 0 || cartItems.CartItems.length === 0 || cartItems === undefined || cartItems === {}){
        return res.status(200).json({
            statusText: 'CART_EMPTY',
            statusCode: 200,
        })
    }
    if(cartItems){
        return res.status(200).json({
            statusText: 'CART_NOT_EMPTY',
            statusCode: 200,
            dataResponse: cartItems,
        })
    }
})

const deleteItemFromCart = asyncHandler(async (req, res) => {
    console.log('deleteItemFromCart API fired')
    const itemId = req.params.itemId
    const thisUserId = req.user.id

    const userByItem = await Item.findOne({_id: itemId}).exec().then(item => {
        return item.ItemCreatedBy.userId
    })

    console.log(`itemId ${itemId}`)
    console.log(`this userId ${thisUserId}`)
    
    const cart = await Cart.findOne({CartUser: thisUserId})

    console.log('cart by userId')

    console.log(cart)

    if(cart){
        await Cart.updateOne({
            _id: cart._id,
            'CartItems.ItemsByUser.CreatedBy': userByItem,                 
        }, {
            $pull: {
                'CartItems.$.ItemsByUser.Items': {
                    ItemDetail: itemId,
                }
            }
        })
       
        
        //CHECKING IF OWNER'S ITEMS ARRAY IS EMPTY
        //=====================================================================
        const giovanniGiorgio = await Cart.findOne({
            CartUser: thisUserId,
            'CartItems.$.ItemsByUser.CreatedBy': userByItem,
            }).exec().then(cart => {
                let status
                cart.CartItems.forEach(item => {
                    if(item.ItemsByUser.CreatedBy.toString() === userByItem.toString()){
                        if(item.ItemsByUser.Items.length === 0){

                            status = 'ITEMS_ARRAY_EMPTY'
                        }
                        else{
                            status =  'ITEMS_ARRAY_NOT_EMPTY'
                        }
                    }
                }) 
                return status
            })
        
        if(giovanniGiorgio === 'ITEMS_ARRAY_EMPTY'){
            await Cart.updateOne({
                _id: cart._id,
                'CartItems.ItemsByUser.CreatedBy': userByItem,
            }, {
                $pull: {
                    CartItems: {
                        'ItemsByUser.CreatedBy': userByItem,
                    }
                }
            }
        )}

        //=====================================================================

        //CHECKING IF THE WHOLE CART IS EMPTY
        //=====================================================================
        const joseMourinho = await Cart.findOne({
            CartUser: thisUserId,
            }).exec().then(cart => {
                let status
                if(cart.CartItems.length === 0){
                    status = 'CART_EMPTY'
                }
                return status
            })

        if(joseMourinho === 'CART_EMPTY'){
            await Cart.deleteOne({
                _id: cart._id,
            })
        }
        //=====================================================================

        return res.status(200).json({
            statusText: 'DELETED_ITEM_FROM_CART',
        })
    }
})

module.exports = {
    addItemToCart,
    getCartItemsByUserId,
    deleteItemFromCart
}