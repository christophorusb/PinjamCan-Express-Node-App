const mongoose = require('mongoose')

const ItemCategory = mongoose.Schema({
    Value: { type: String, required: true },
    PicturePath : { type: String, required: false, default: null },
},
    { collection: 'item-category-data' }
)

const ItemCategoryModel = mongoose.model('ItemCategoryData', ItemCategory)

module.exports = ItemCategoryModel