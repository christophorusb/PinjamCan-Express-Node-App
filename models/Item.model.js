const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Item = mongoose.Schema({
    ItemName: { type: String, required: true },
    ItemDescription: { type: String, required: true },
    ItemCategory: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ItemCategoryData'
        }
    ,
    ItemPriceDaily: { type: Number, required: true },
    ItemPriceWeeklyPerDay: { type: Number, default: null },
    ItemPriceMonthlyPerDay: { type: Number, default: null },
    ItemPriceDailyMinimum: { type: Number, required: true },
    ItemMinimumRentDuration: { type: Number, required: true },
    ItemWeight: { type: Number, required: true },
    ItemStatus: { type: String, required: true },
    ItemDeliveryOptions:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DeliveryOptionData'
        }
    ],
    ItemReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ReviewData'
        }
    ],
    MainItemPictureLocalPath : { type: String, required: true },
    ItemPictureLocalPaths: [
        { type: String, required: true }
    ],
    ItemRatings: [ { type: Number, default:0 } ],
    ItemRatingAverage: { type: Number, default: 0 },
    ItemViewCount: { type: Number, default: 0 },
    ItemCreatedAt: { type: Date, default: Date.now },
    ItemCreatedBy: {
        user: { type: String, required: true },
        userId: { type: String, required: true },
    },
    ItemModifiedDate: { type: Date, default: null },
    ItemModifiedBy: { type: String, default: null },
},
    { collection: 'item-data', strict: false }
)

const ItemModel = mongoose.model('ItemData', Item)

module.exports = ItemModel
