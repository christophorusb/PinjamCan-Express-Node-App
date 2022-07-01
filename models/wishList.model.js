const mongoose = require('mongoose')

const WishList = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData' },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ItemData'}],
},
    { collection: 'wishlist-data' }
)

const WishListModel = mongoose.model('WishListData', WishList)

module.exports = WishListModel