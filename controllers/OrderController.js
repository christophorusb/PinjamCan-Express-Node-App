const asyncHandler = require('express-async-handler')
const Item = require('../models/Item.model')
const Order = require('../models/order.model')
const { v4: uuidv4 } = require('uuid')

const getOrdersByOrderId = asyncHandler(async (req, res, next) => {
    console.log('getOrdersByOrderid API Fired')
    const orderId = req.params.orderId
    console.log(`orderId ${orderId}`)

    const orders = await Order.find({ OrderId: orderId }).populate('ItemDetail').populate('OrderedBy').populate('SettledTransaction')

    if(orders){
        res.status(200).json({
            statusText: 'ORDERS_FETCHED',
            dataResponse: orders,
        })
    }
    else{
        res.status(200).json({
            statusText: 'ORDERS_NOT_FOUND',
        })
    }  
})

const getOrdersByItemId = asyncHandler(async (req, res, next) => {
    console.log('getOrdersByItemId API Fired')
    const itemId = req.params.itemId

    const orders = await Order.find({ ItemDetail: itemId }).populate('ItemDetail').populate('OrderedBy').populate('SettledTransaction')

    if(orders){
        return res.status(200).json({
            statusText: 'ORDERS_FETCHED',
            statusCode: 200,
            dataResponse: orders,
            ordersCount: orders.length,
        })
    }
    else{
        return res.status(200).json({
            statusText: 'ORDERS_NOT_FOUND',
            statusCode: 200,
        })
    }
})

const handleAcceptedOrder = asyncHandler(async (req, res, next) => {
    console.log('handleAcceptedOrder API Fired')
    const user = req.user
    const orderId = req.params.orderId

    const order = await Order.findOneAndUpdate({ _id: orderId }, { $set: { OrderStatus: 'PEMILIK SUDAH KONFIRMASI', OrderStatus_Owner: 'PESANAN DITERIMA' } })

    return res.status(200).json({
        statusText: 'ORDER_ACCEPTED',
        statusCode: 200,
        ItemBorrowDate: order.ItemBorrowDate
    })
})

const handleRejectedOrder = asyncHandler(async (req, res, next) => {
    console.log('handleRejectedOrder API Fired')
    const user = req.user
    const orderId = req.params.orderId
    await Order.updateOne({ _id: orderId }, { $set: { OrderStatus: 'PESANAN DIBATALKAN OLEH PEMILIK' } })

    return res.status(200).json({
        statusText: 'ORDER_REJECTED_BY_OWNER',
        statusCode: 200,
    })
})

const handleRemoveOrder = asyncHandler(async (req, res, next) => {
    console.log('handleRemoveOrder API Fired')
    const user = req.user
    const orderId = req.params.orderId
    await Order.updateOne({ _id: orderId }, { $set: { OrderStatus: 'PENGEMBALIAN DANA SEDANG DIPROSES' } })

    return res.status(200).json({
        statusText: 'ORDER_REFUND_REQUESTED',
        statusCode: 200,
    })
})

const handleOnDeliveryOrder = asyncHandler(async (req, res, next) => {
    console.log('handleOnDeliveryOrder API Fired')
    const user = req.user
    const orderId = req.params.orderId
    const order = await Order.findOneAndUpdate({ _id: orderId }, { $set: { OrderStatus: 'BARANG SEDANG DIKIRIM', OrderStatus_Owner: 'BARANG SEDANG DIKIRIM' } })
    await Item.updateOne({ _id: order.ItemDetail }, { $set: { ItemStatus: 'Borrowed' } })

    return res.status(200).json({
        statusText: 'ORDER_ON_DELIVERY',
        statusCode: 200,
    })
})

const handleArrivedItem = asyncHandler(async (req, res, next) => {
    console.log('handleArrivedItem API Fired')
    const user = req.user
    const orderId = req.params.orderId

    const order = await Order.findOneAndUpdate({ _id: orderId}, { $set: { OrderStatus: 'BARANG SEDANG KAMU PINJAM', OrderStatus_Owner: 'BARANG SEDANG DIPINJAM'}}, {returnDocument: 'after'})

    //console.log(order)

    return res.status(200).json({
        statusText: 'ITEM_ARRIVED_TO_BORROWER',
        statusCode: 200,
        orderDetail: order,
    })
})

const handleReturnItem = asyncHandler(async (req, res, next) => {
    console.log('handleReturnItem API Fired')
    const user = req.user
    const orderId = req.params.orderId

    await Order.updateOne({ _id: orderId}, { $set: { OrderStatus: 'BARANG SEDANG DIKEMBALIKAN', OrderStatus_Owner: 'BARANG SEDANG DIKEMBALIKAN'}}, {returnDocument: 'after'})

    return res.status(200).json({
        statusText: 'ITEM_ON_RETURN',
        statusCode: 200,
    })
})

const  handleOwnerArrivedItem = asyncHandler(async (req, res, next) => {
    console.log('handleOwnerArrivedItem API Fired')
    const user = req.user
    const orderId = req.params.orderId

    const order = await Order.findOneAndUpdate({ _id: orderId}, { $set: { OrderStatus: 'PEMINJAMAN SELESAI', OrderStatus_Owner: 'PEMINJAMAN SELESAI'}}, {returnDocument: 'after'})
    await Item.updateOne({ _id: order.ItemDetail }, { $set: { ItemStatus: 'Available' } })

    return res.status(200).json({
        statusText: 'ITEM_ARRIVED_TO_OWNER',
        statusCode: 200,
    })
})

module.exports = { getOrdersByOrderId, getOrdersByItemId, handleAcceptedOrder, handleRejectedOrder, handleRemoveOrder, handleOnDeliveryOrder, handleArrivedItem, handleReturnItem, handleOwnerArrivedItem }