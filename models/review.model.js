const mongoose = require('mongoose')

const Review = mongoose.Schema({
    OrderDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderData', required: true },
    ItemDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemData', required: true },
    ReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData', required: true },
    ReviewedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData', required: true },
    ItemReview: { type: String, required: true },
    ItemReviewDate: { type: Date, default: Date.now },
    ItemStarsReceived: { type: Number, required: true },
    OwnerStarsReceived: { type: Number, required: true },
    // OwnerReview: { type: String, required: true },
    // OwnerReviewDate: { type: Date, default: Date.now },
},
    { collection: 'review-data', strict: false },
)

const ReviewModel = mongoose.model('ReviewData', Review)

module.exports = ReviewModel