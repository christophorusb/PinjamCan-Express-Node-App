const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Cart = Schema({
    CartUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserData'
    },
    CartItems: [{
        ItemsByUser: {
            CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserData' },
            Items:[{
                    ItemDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemData' },
                    ItemBorrowDate: [{type: String, required: true}]
                },
            ], 
        },  
    }], 
    OrderId: { type: String, default: null }, //proviced by midtrans 
},
    { collection: 'cart-data' }
)

// const Cart = Schema({
//     CartUser: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'UserData'
//     },
//     CartItems: [{
//         item: {
//             type: mongoose.Schema.Types.ObjectId, ref: 'ItemData',

//         }, 
//         itemCreatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'UserData' }, 
//         ItemBorrowDate: [{type: String, required: true}]
//     }],
      
// },
//     { collection: 'cart-data' }
// )

const CartModel = mongoose.model('CartData', Cart)
module.exports = CartModel