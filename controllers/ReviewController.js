const asyncHandler = require('express-async-handler')
const { default: mongoose } = require('mongoose')
const Item = require('../models/Item.model')
const Order = require('../models/order.model')
const Review = require('../models/review.model')
const User = require('../models/user.model')

const addReview = asyncHandler(async (req, res, next) => {
    console.log('addReview API Fired')
    const user = req.user
    const { orderRef, itemRef, itemRating, itemReview, ownerRating, reviewedTo } = req.body

    const converted = new mongoose.Types.ObjectId(reviewedTo)

    const review = 
    await Review.create({
        OrderDetail: orderRef,
        ItemDetail: itemRef,
        ReviewedBy: user.id,
        ReviewedTo: converted,
        ItemReview: itemReview,
        ItemReviewDate: Date.now(),
        ItemStarsReceived: itemRating,
        OwnerStarsReceived: ownerRating,
    }).then(review => {
        return review
    })

    //add review id to order
    await Order.updateOne({ _id: orderRef }, { $set: { review: review._id } })

    //push owner rating to User Model
    await User.updateOne({ _id: review.ReviewedTo }, { $push: { userRatings: ownerRating } })

    //add review id and push item rating to Item Model
    const updatedItem = await Item.findOneAndUpdate({ _id: itemRef }, { $push: { ItemReviews: review._id,  ItemRatings: review.ItemStarsReceived} }, {returnDocument: 'after'})
    console.log('UPDATED ITEMS')
    console.log(updatedItem)
    let avg = 0
    let sum = 0
    for(let i=0; i<updatedItem.ItemRatings.length; i++){
        // console.log(`item rating ${updatedItem.ItemRatings[i]}`)
        // console.log(`i ${i}`)
        sum += updatedItem.ItemRatings[i]
        // console.log(`sum ${sum}`)
    }
    avg = sum / updatedItem.ItemRatings.length
    // console.log(`sum ${sum}`)
    // console.log(`avg ${avg}`)

    await Item.updateOne({ _id: itemRef }, { $set: { ItemRatingAverage: avg } })
    
    
    return res.status(200).json({
        statusText: 'REVIEW_CREATED',
        statusCode: 200,
    })
})

module.exports = { addReview }