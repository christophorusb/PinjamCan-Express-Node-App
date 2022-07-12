const asyncHandler = require('express-async-handler')
const User = require('../models/user.model')
const Item = require('../models/Item.model')
const Transaction = require('../models/transaction.model')
const Cart = require('../models/cart.model')
const Order = require('../models/order.model')
const { v4: uuidv4 } = require('uuid')
const moment = require('moment')
const midtransClient = require('midtrans-client')

const handlePayment = asyncHandler(async (req, res) => {
    console.log('handlePayment API fired')
    const userId = req.user.id
    const userFullName = req.user.userFullName.split(' ')
    const userFirstName = userFullName[0]
    const userLastName = userFullName.slice(1, userFullName.length).join(' ')
    
    const userEmail = req.user.userEmail
    const userPhoneNumber = req.user.userPhoneNumber
    const totalPrice = req.body.totalPrice
    const orderId = 'PNJC-'+uuidv4()
    
    const checkedOutItems = req.body.checkedOutItems
    const cartItems = req.body.cartItems

    let preparedItem
    let items = []
    let itemIdDeliveryOptionPair = []
    
    //loop through selectedDeliveryOptions object
    for(const [key, value] of Object.entries(checkedOutItems)) {
        itemIdDeliveryOptionPair.push({
            itemId: value[2],
            itemBorrowPrice: value[3],
            selectedDeliveryOption: value[0],
            selectedDeliveryOptionPrice: value[1],
        })
    }

    console.log('itemIdDeliveryOptionPair array')
    console.log(itemIdDeliveryOptionPair)

    for (let i = 0; i < cartItems.CartItems.length; i++) {
        for (let j = 0; j < cartItems.CartItems[i].ItemsByUser.Items.length; j++) {
            const matchedPair = itemIdDeliveryOptionPair.find(pair => pair.itemId === cartItems.CartItems[i].ItemsByUser.Items[j].ItemDetail._id)
            const matchedDeliveryOption = matchedPair.selectedDeliveryOption.replaceAll('-', ' ')
            const matchedItemBorrowPrice = matchedPair.itemBorrowPrice
            preparedItem = {
                ItemBorrowDate: cartItems.CartItems[i].ItemsByUser.Items[j].ItemBorrowDate,
                ItemBorrowPrice: matchedItemBorrowPrice,
                ItemDetail: cartItems.CartItems[i].ItemsByUser.Items[j].ItemDetail._id,
                SelectedDeliveryOption: matchedDeliveryOption,
                SelectedDeliveryOptionPrice: matchedPair.selectedDeliveryOptionPrice,
            }
            items.push(preparedItem)
        }
    }

    let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    let parameter = {
        'transaction_details': {
            'order_id': orderId,
            'gross_amount': totalPrice,
        },
        'credit_card':{
            'secure': true
        },
        'customer_details': {
            'first_name': userFirstName,
            'last_name': userLastName,
            'email': userEmail,
            'phone': userPhoneNumber,
        },
        "enabled_payments": [
            "gopay",
            "shopeepay",
            "bca_va",
            "bni_va",
            "bri_va",
            "mandiri_clickpay",
            "cimb_clicks",
            "bca_klikbca",
            "bca_klikpay",
        ],
        "callbacks": {
            "finish": `${process.env.URL_TO_FRONTEND}/payment-notification`,
        }
    }

    snap.createTransaction(parameter)
    .then(transactionResponse => {
        console.log(transactionResponse)
        return transactionResponse
    }).then(transactionFirstPass => {
        console.log(transactionFirstPass)
        const createdTransaction = 
            Transaction.create({
                user: userId,
                OrderId: orderId,
                OrderedItems: items,
                TransactionToken: transactionFirstPass.token,
            }).then(transactionCreated => {
                return transactionCreated
            })
        return createdTransaction
    }).then(transactionSecondPass => {
        res.status(200).json({
            statusText: 'PAYMENT_CHARGED',
            statusCode: 200,
            transactionToken: transactionSecondPass.TransactionToken,
        })
    })
})

const handlePendingPayment = asyncHandler(async (req, res) => {
    console.log('handlePendingPayment API fired')
    const userId = req.user.id
    const prevOrderId = req.params.orderId
    const newOrderId = 'PNJC-'+uuidv4()
    const grossAmount = req.body.gross_amount
    const userFullName = req.user.userFullName.split(' ')
    const userFirstName = userFullName[0]
    const userLastName = userFullName.slice(1, userFullName.length).join(' ') 
    const userEmail = req.user.userEmail
    const userPhoneNumber = req.user.userPhoneNumber
    const orderedItems = req.body.orderedItems

    console.log('ordered items')
    console.log('================================')
    console.log(orderedItems)

    let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    let parameter = {
        'transaction_details': {
            'order_id': newOrderId,
            'gross_amount': grossAmount,
        },
        'credit_card':{
            'secure': true
        },
        'customer_details': {
            'first_name': userFirstName,
            'last_name': userLastName,
            'email': userEmail,
            'phone': userPhoneNumber,
        },
        "enabled_payments": [
            "gopay",
            "shopeepay",
            "bca_va",
            "bni_va",
            "bri_va",
            "mandiri_clickpay",
            "cimb_clicks",
            "bca_klikbca",
            "bca_klikpay",
        ],
        "callbacks": {
            "finish": `${process.env.URL_TO_FRONTEND}/payment-notification`,
        }
    }

    //delete previous (pending) transaction
    await Transaction.deleteOne({ OrderId: prevOrderId })


    //and create a new one
    snap.createTransaction(parameter)
    .then(transactionResponse => {
        console.log(transactionResponse)
        return transactionResponse
    }).then(transactionFirstPass => {
        const createdTransaction = 
            Transaction.create({
                user: userId,
                OrderId: newOrderId,
                OrderedItems: orderedItems,
                TransactionToken: transactionFirstPass.token,
            }).then(transactionCreated => {
                return transactionCreated
            })
        return createdTransaction
    }).then(transactionSecondPass => {
        res.status(200).json({
            statusText: 'PAYMENT_CHARGED',
            statusCode: 200,
            transactionToken: transactionSecondPass.TransactionToken,
        })
    })
})

const cancelPendingPaymentByOrderId = asyncHandler(async (req, res) => {
    const user = req.user
    const orderId = req.params.orderId

    await Transaction.deleteOne({ OrderId: orderId })

    res.status(200).json({
        statusText: 'PAYMENT_CANCELLED',
        statusCode: 200,
    })
})

const handlePaymentNotification = asyncHandler(async (req, res) => {
    console.log('handlePaymentNotification API fired')
    const paymentNotification = req.body
    console.log(paymentNotification)

    if(paymentNotification.transaction_status === 'settlement'){
        console.log('PAYMENT SETTLED')
        const transaction = await Transaction.findOneAndUpdate({OrderId: paymentNotification.order_id}, {$set: { TransactionStatus: paymentNotification.transaction_status, TransactionId: paymentNotification.transaction_id, PaymentDetail: paymentNotification }})
        await Cart.deleteOne({CartUser: transaction.user})

        //add item borrow date to Item Model
        await Promise.all(transaction.OrderedItems.map(async (orderedItem) => {
            const startDate = moment(orderedItem.ItemBorrowDate[0])
            const endDate = moment(orderedItem.ItemBorrowDate[1])
            const returnDate = moment(orderedItem.ItemBorrowDate[2])
            const curr = startDate.clone(), dates = [];

            let updatedDateArr

            while(curr.isSameOrBefore(endDate)){
                dates.push(curr.format('YYYY-MM-DD'));
                curr.add(1, 'days');
            }

            //also add the return item date
            dates.push(returnDate.format('YYYY-MM-DD')) 

            const item = await Item.findOne({_id: orderedItem.ItemDetail})

            if (item.ItemBorrowDates){
                console.log('item borrow dates already exist, updating...')
                updatedDateArr = [...item.ItemBorrowDates, ...dates]
                await Item.updateOne({_id: orderedItem.ItemDetail}, {$set: { ItemBorrowDates: updatedDateArr }})
            }
            else {
                console.log('item borrow dates does not exist, creating...')
                updatedDateArr = dates
                await Item.updateOne({_id: orderedItem.ItemDetail}, {$set: { ItemBorrowDates: updatedDateArr }})
            }

            //create order for each orderedItem
            const checkOrder = await Order.findOne(
                {
                    OrderId: transaction.OrderId, 
                    DeliveryOption: orderedItem.SelectedDeliveryOption,
                    ItemDetail: orderedItem.ItemDetail,
                }
            )

            if(!checkOrder){
                console.log('order does not exist, creating...')
                await Order.create({
                    OrderId: transaction.OrderId,
                    OrderStatus: 'PEMILIK BELUM KONFIRMASI',
                    OrderPrice: orderedItem.ItemBorrowPrice + orderedItem.SelectedDeliveryOptionPrice,
                    ItemBorrowDate: orderedItem.ItemBorrowDate,
                    DeliveryOption: orderedItem.SelectedDeliveryOption,
                    ItemDetail: orderedItem.ItemDetail,
                    OrderedBy: transaction.user,
                    SettledTransaction: transaction._id,
                })
            }
            else{
                console.log('order exist. midtrans notification will be ignored')
            }
        }))

        console.log('returning with status code 200...')

        res.sendStatus(200)
    }

    else if(paymentNotification.transaction_status === 'pending'){
        console.log('PAYMENT PENDING')
        const transaction = await Transaction.findOne({OrderId: paymentNotification.order_id})
        if(transaction.TransactionStatus !== 'settlement'){
            await Transaction.updateOne({OrderId: paymentNotification.order_id}, {$set: { TransactionStatus: paymentNotification.transaction_status, TransactionId: paymentNotification.transaction_id, PaymentDetail: paymentNotification }})
            await Cart.deleteOne({CartUser: transaction.user})
        }

        res.sendStatus(200)
    }

    else if(paymentNotification.transaction_status === 'cancel' || paymentNotification.transaction_status === 'deny' || paymentNotification.transaction_status === 'expire'){
        console.log('PAYMENT CANCELLED')

        res.sendStatus(200)
    }
})

const getTransactionsByUserId = asyncHandler(async (req, res) => {
    console.log('getTransactionsByUserId API fired')
    const user = req.user
    const transactions = await Transaction.find({user: user.id})
    .populate('user')
    .populate('OrderedItems.ItemDetail')

    res.status(200).json({
        statusText: 'TRANSACTIONS_FETCHED',
        statusCode: 200,
        dataResponse: transactions, 
    })
})

module.exports = { handlePayment, handlePaymentNotification, getTransactionsByUserId, cancelPendingPaymentByOrderId, handlePendingPayment }