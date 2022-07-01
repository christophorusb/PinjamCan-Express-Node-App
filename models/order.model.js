const mongoose = require('mongoose')

const Order = mongoose.Schema({
    OrderId: { type: String, required: true },
    OrderStatus: { type: String, default: null },
    OrderPrice: { type: Number, required: true },
    ItemBorrowDate: { type: Array, default: null },
    DeliveryOption: { type: String, default: null },
    ItemDetail: {type: mongoose.Schema.Types.ObjectId, ref: 'ItemData', required: true},
    OrderedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'UserData', required: true},
    SettledTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'TransactionData' },
},
    { collection: 'order-data', strict: false },
)

const OrderModel = mongoose.model('OrderData', Order)

module.exports = OrderModel