const mongoose = require('mongoose')

const Transaction = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData', required: true },
    OrderId: { type: String, default: null }, 
    TransactionId: { type: String, default: ''},
    OrderedItems: [{ 
        ItemBorrowDate: [{ type: String, required: true }],
        ItemBorrowPrice: { type: Number, required: true },
        ItemDetail: {type: mongoose.Schema.Types.ObjectId, ref: 'ItemData', required: true},
        SelectedDeliveryOption: { type: String, required: true }, 
        SelectedDeliveryOptionPrice: { type: Number, required: true },
    }],
    // SelectedDeliveryOptions: { type: mongoose.Schema.Types.Mixed, required: true }, 
    TransactionToken: { type: String, required: true }, //provided by midtrans
    TransactionStatus: { type: String, default: '' },//provided by midtrans
    PaymentDetail: { type: mongoose.Schema.Types.Mixed, default: {} }, 
},
    { collection: 'transaction-data' }
)

const TransactionModel = mongoose.model('TransactionData', Transaction)

module.exports = TransactionModel