const ItemCategory = require('../models/ItemCategory.model')
const DeliveryOption = require('../models/deliveryOption.model')
const Item = require('../models/Item.model')
const Order = require('../models/order.model')
const User  = require('../models/user.model')
const asyncHandler = require('express-async-handler')

//@desc get item categories
//@route GET /api/items/item-categories
//@access Public
const getItemCategories = asyncHandler(async (req, res) =>{
    console.log('getItemCategories API fired')
    const itemCategories = await ItemCategory.find()
    if(itemCategories){
        // console.log(itemCategories)
        res.status(200).json({
            status: 'success',
            dataResponse: itemCategories
        })
    }
    else{
        return res.status(400).json({
            status: 'fail',
            message: 'data not found'
        })
    }
})

const getHomeItemsData = asyncHandler(async (req, res) =>{
    console.log('getHomeItemsInfo API fired')
    const itemCategories = await ItemCategory.find()
    const randomItems = await Item.aggregate([ { $sample: { size: 6 } } ])
    const mostViewed = await Item.aggregate([ { $sort: { ItemViewCount: -1 } }, { $limit: 6 } ])
    
    const dataResponse = {
        itemCategories: itemCategories,
        randomItems: randomItems,
        mostViewed: mostViewed,
    }

    console.log(dataResponse)

    return res.status(200).json({
        statusCode: 200,
        statusText: 'DATA_FETCHED',
        dataResponse: dataResponse
    })
})

//@desc get items by category
//@route GET /api/items/item-categories/:itemCategoryId
//@access Private
const getItemsByFilter = asyncHandler(async (req, res) => {
    console.log('get items by category API called')
    let URLqueries = req.query
    //console.log(URLqueries)
    let itemsByCategory   
    let parsedQueries = JSON.parse(URLqueries.queryParams) 
    const itemCategory = await ItemCategory.findById(parsedQueries.ItemCategory)
    
    //checking if URL params exist
    if(Object.keys(parsedQueries).length !== 0){
        console.log('params exist')
        console.log('parsed queries')
        //console.log(parsedQueries)
        itemsByCategory = await Item.find(parsedQueries)
        console.log('items by category')
        //console.log(itemsByCategory)
    }

    //if URL params dont exist, find all items
    if(Object.keys(JSON.parse(URLqueries.queryParams)).length === 0){
        console.log('params dont exist')
        itemsByCategory = await Item.find()
        console.log('items by category')
        //console.log(itemsByCategory)
    }

    if(itemsByCategory.ItemCategory === null || itemsByCategory.length === 0){
        if(itemCategory === null){
            console.log('======================================================================')
            return res.status(200).json({
                status:'SUCCESS_NO_ITEM',
                statusCode: 200,
                itemCategory: 'Semua',
                message:'Ups! Barang yang kamu cari nggak ada',
                dataResponse: {
                    itemsByCategory
                }
            })
        }
        console.log('======================================================================')
        return res.status(200).json({
            status:'SUCCESS_NO_ITEM',
            statusCode: 200,
            itemCategory: itemCategory.Value,
            message:'Ups! Barang yang kamu cari nggak ada',
            dataResponse: {
                itemsByCategory
            }
        })
    }
    
    else{
        if(itemCategory === null){
            console.log('======================================================================')
            return res.status(200).json({
                status:'SUCCESS',
                statusCode: 200,
                itemCategory: 'Semua',
                dataResponse: {
                    itemsByCategory
                }
            })
        }
        console.log('======================================================================')
        return res.status(200).json({
            status: 'SUCCESS',
            statusCode: 200,
            itemCategory: itemCategory.Value,
            dataResponse: {
                itemsByCategory
            }
        })
    }
})

//@desc create new item
//@route POST /api/items
//@access Private
const postItem = asyncHandler(async (req, res) => {
    console.log('post item API fired')
    const textualData = req.body
    const files = req.files
    const user = req.user
    //console.log(textualData)
    // console.log(user)
    //getting item category ID
    const thisItemCategory = await ItemCategory.findOne({Value: textualData.itemCategory})
    const thisItemCategoryId = thisItemCategory._id

    //getting delivery option IDs
    const thisDeliveryOptionArr = textualData.itemDeliveryOptions.split(',')
    const thisDeliveryOptionIdArr = await Promise.all(thisDeliveryOptionArr.map(async (deliveryOption) => {
        const thisDeliveryOption = await DeliveryOption.findOne({Value: deliveryOption})
        return thisDeliveryOption._id
    }))

    //getting picture local paths
    const thisPicturePathArr = []
    let mainPicturePath
    for(let i=0; i<files.length; i++){
        if(i === 0){
            mainPicturePath = '/image_uploads/' + files[i].filename
        }
        thisPicturePathArr.push('/image_uploads/' + files[i].filename)
    }
    // console.log(thisPicturePathArr)


    //calculate item rent price per day for weekly and monthly, 
    //as well as comparing which price is the lowest
    let itemRentMinPrice 
    let calculateItemRentPerDay = parseInt(textualData.itemRentPerDay)
    let calculateItemWeeklyPerDay = (textualData.itemRentPerWeek.length === 0) ? null : parseInt(textualData.itemRentPerWeek)
    let calculateItemMonthlyPerDay = (textualData.itemRentPerMonth.length === 0) ? null : parseInt(textualData.itemRentPerMonth)

    calculateItemRentPerDay = Math.floor(calculateItemRentPerDay)
    if(calculateItemWeeklyPerDay !== null){
        calculateItemWeeklyPerDay = Math.floor(calculateItemWeeklyPerDay / 7)
    }

    if(calculateItemMonthlyPerDay !== null){
        calculateItemMonthlyPerDay = Math.floor(calculateItemMonthlyPerDay / 30)
    }
    //if weekly price field is empty
    if(calculateItemWeeklyPerDay === null){
        itemRentMinPrice = Math.min(
            calculateItemRentPerDay,
            calculateItemMonthlyPerDay,
        )
    }

    //if monthly price field is empty
    if(calculateItemMonthlyPerDay === null){
        itemRentMinPrice = Math.min(
            calculateItemRentPerDay,
            calculateItemWeeklyPerDay,
        )
    }

    //if both weekly and monthly price fields are empty
    if(calculateItemWeeklyPerDay === null && calculateItemMonthlyPerDay === null){
        itemRentMinPrice = calculateItemRentPerDay
    }

    //if both weekly and monthly price fields are not empty
    if(calculateItemWeeklyPerDay !== null && calculateItemMonthlyPerDay !== null){
        itemRentMinPrice = Math.min(
            calculateItemRentPerDay,
            calculateItemWeeklyPerDay,
            calculateItemMonthlyPerDay,
        )
    }

    Item.create({
        ItemName: textualData.itemName,
        ItemDescription: textualData.itemDescription,
        ItemCategory: thisItemCategoryId,
        ItemPriceDaily: calculateItemRentPerDay,
        ItemPriceWeeklyPerDay: calculateItemWeeklyPerDay,
        ItemPriceMonthlyPerDay: calculateItemMonthlyPerDay,
        ItemPriceDailyMinimum: itemRentMinPrice,
        ItemMinimumRentDuration: textualData.itemMinimumRentDuration,
        ItemWeight: textualData.itemWeight,
        ItemStatus: 'Available',
        ItemDeliveryOptions: thisDeliveryOptionIdArr,
        MainItemPictureLocalPath : mainPicturePath,
        ItemPictureLocalPaths: thisPicturePathArr,
        ItemCreatedAt: Date.now(),
        ItemCreatedBy:{
            user: req.user.userFullName,
            userId: req.user.id
        }
    }).then(() => {
        return res.status(201).json({
            status: 'success',
            message: 'Item created',
            statusCode: 201,
        })
    })
})

//@desc get all item
//@route GET /api/items/
//@access Public
const getItems = asyncHandler(async (req, res) => {
   // console.log('getItems API Called')
    const item = await Item.find()
    if (item) {
        return res.status(200).json({
            status: 'success',
            statusCode: 200,
            dataResponse: item
        })
    }else{
        return res.status(404).json({
            success: 'fail',
            message: 'Item not found'
        })
    }
})

//@desc get item by id
//@route GET /api/items/:itemId
//@access Public
const getItemById = asyncHandler(async (req, res) => {
    console.log('getItemById API fired')
    const itemId = req.params.itemId
    await Item.updateOne({_id: itemId}, {$inc: {ItemViewCount: 1}})
    const item = await Item.findById(itemId).populate({
            path: 'ItemReviews',
            populate: {
                path: 'ReviewedBy'
            }
        }
    ).populate('ItemCategory').populate('ItemDeliveryOptions')
    
    const userDetail = await User.findById(item.ItemCreatedBy.userId)

    const combined = {
        ...item.toObject(),
        userDetail
    }

    if (item) {
        return res.status(200).json({
            success: 'success',
            dataResponse: combined,
        })
    }else{
        return res.status(404).json({
            success: 'fail',
            message: 'Item not found'
        })
    }
})


//@desc get items by search keyword
//@route GET /api/items/filter-searched-item/:searchKeyword
//@access Public
const getSearchedItemsByFilter = asyncHandler(async (req, res) => {
    console.log('getSearchItemsByFilter API Called')
    let URLqueries = req.query
    //console.log(URLqueries)
    let searchedItemsByKeyword  
    let parsedQueries = JSON.parse(URLqueries.queryParams) 
    const itemCategory = await ItemCategory.findById(parsedQueries.ItemCategory)

    let keyword = req.params.searchKeyword
    keyword = keyword.replaceAll('-', ' ')
    //console.log('keyword: ' + keyword)
    let regexInsensitiveContainsSubstring = new RegExp(keyword, 'i')
    //console.log(searchTerm)
    
    //checking if URL params exist
    if(Object.keys(parsedQueries).length !== 0){
        searchedItemsByKeyword = await Item.find({
            ...parsedQueries,
            ItemName: { $regex: regexInsensitiveContainsSubstring }
        })
        console.log('searched items by query')
        //console.log(searchedItemsByKeyword)
    }

    //if URL params dont exist, find all items
    if(Object.keys(JSON.parse(URLqueries.queryParams)).length === 0){
        searchedItemsByKeyword = await Item.find({
            ItemName: { $regex: regexInsensitiveContainsSubstring }
        })
    }

    if(searchedItemsByKeyword === null || searchedItemsByKeyword.length === 0){
        if(itemCategory === null){
            console.log('======================================================================')
            return res.status(200).json({
                statusText:'SUCCESS_NO_ITEM',
                statusCode: 200,
                itemCategory: 'Semua',
                dataResponse: {
                    searchedItemsByKeyword
                }
            })
        }
        console.log('======================================================================')
        return res.status(200).json({
            statusText:'SUCCESS_NO_ITEM',
            statusCode: 200,
            itemCategory: itemCategory.Value,
            message:'Ups! Barang yang kamu cari nggak ada',
            dataResponse: {
                searchedItemsByKeyword
            }
        })
    }
    
    else{
        if(itemCategory === null){
            console.log('======================================================================')
            return res.status(200).json({
                statusText:'SUCCESS',
                statusCode: 200,
                itemCategory: 'Semua',
                dataResponse: {
                    searchedItemsByKeyword
                }
            })
        }
        console.log('======================================================================')
        return res.status(200).json({
            statusText: 'SUCCESS',
            statusCode: 200,
            itemCategory: itemCategory.Value,
            dataResponse: {
                searchedItemsByKeyword
            }
        })
    }
})

const getItemsByUserId = asyncHandler(async (req, res) => {
    console.log('getItemsByUserId API Called')
    const user = req.user
    const items = await Item.find({'ItemCreatedBy.userId': user.id}).populate('ItemCategory').populate('ItemDeliveryOptions')
    

    if (items) {
        const itemsWithOrders = await Promise.all(items.map(async (item) => {
            let incomingOrders = await Order.find({
                ItemDetail: item._id,
                OrderStatus: 'PEMILIK BELUM KONFIRMASI'
            }).populate('OrderedBy').populate('SettledTransaction').populate('ItemDetail')

            let ongoingOrders = await Order.find({
                ItemDetail: item._id,
                $or : [ {OrderStatus: 'BARANG SEDANG DIKIRIM'}, {OrderStatus: 'PEMILIK SUDAH KONFIRMASI'}, {OrderStatus_Owner: 'BARANG SEDANG DIPINJAM'}, {OrderStatus: 'BARANG SEDANG DIKEMBALIKAN'}],
            }).populate('OrderedBy').populate('SettledTransaction').populate('ItemDetail')

            let finishedOrders = await Order.find({
                ItemDetail: item._id,
                OrderStatus: 'PEMINJAMAN SELESAI',
            }).populate('OrderedBy').populate('SettledTransaction').populate('ItemDetail')
            
            let itemsOrders = {
                ...item.toObject(),
                IncomingOrders: incomingOrders,
                OngoingOrders: ongoingOrders,
                FinishedOrders: finishedOrders,
            }
            return itemsOrders
        })).then(itemsWithOrders => {
            return itemsWithOrders
        })

        return res.status(200).json({
            statusText: 'ITEMS_FETCHED',
            statusCode: 200,
            dataResponse: itemsWithOrders
        })
    }

    return res.status(200).json({
        statusText: 'ITEMS_EMPTY',
        statusCode: 200,
    })

})

const editItem = asyncHandler(async (req, res) => {
    console.log('editItem API Called')
    const itemId = req.params.itemId
    const textualData = req.body
    const user = req.user
    const files = req.files

    // console.log('TEXT DATA')
    // console.log('==================================================')
    // console.log(textualData)

    // console.log('FILE DATA')
    // console.log('==================================================')
    // console.log(files)

    const thisItemCategory = await ItemCategory.findOne({Value: textualData.itemCategory})
    const thisItemCategoryId = thisItemCategory._id

    const thisDeliveryOptionArr = textualData.itemDeliveryOptions.split(',')

    const thisDeliveryOptionsIdArr = await Promise.all(thisDeliveryOptionArr.map(async (deliveryOption) => {
        const thisDeliveryOption = await DeliveryOption.findOne({Value: deliveryOption})
        return thisDeliveryOption._id
    }))

    const thisPicturePathArr = []
    let mainPicturePath
    for(let i=0; i<files.length; i++){
        if(i === 0){
            mainPicturePath = '/image_uploads/' + files[i].filename
        }
        thisPicturePathArr.push('/image_uploads/' + files[i].filename)
    }

    let itemRentMinPrice 
    let calculateItemRentPerDay = parseInt(textualData.itemRentPerDay)
    let calculateItemWeeklyPerDay = (textualData.itemRentPerWeek.length === 0) ? null : parseInt(textualData.itemRentPerWeek)
    let calculateItemMonthlyPerDay = (textualData.itemRentPerMonth.length === 0) ? null : parseInt(textualData.itemRentPerMonth)

    calculateItemRentPerDay = Math.floor(calculateItemRentPerDay)
    if(calculateItemWeeklyPerDay !== null){
        calculateItemWeeklyPerDay = Math.floor(calculateItemWeeklyPerDay / 7)
    }

    if(calculateItemMonthlyPerDay !== null){
        calculateItemMonthlyPerDay = Math.floor(calculateItemMonthlyPerDay / 30)
    }
    //if weekly price field is empty
    if(calculateItemWeeklyPerDay === null){
        itemRentMinPrice = Math.min(
            calculateItemRentPerDay,
            calculateItemMonthlyPerDay,
        )
    }

    //if monthly price field is empty
    if(calculateItemMonthlyPerDay === null){
        itemRentMinPrice = Math.min(
            calculateItemRentPerDay,
            calculateItemWeeklyPerDay,
        )
    }

    //if both weekly and monthly price fields are empty
    if(calculateItemWeeklyPerDay === null && calculateItemMonthlyPerDay === null){
        itemRentMinPrice = calculateItemRentPerDay
    }

    //if both weekly and monthly price fields are not empty
    if(calculateItemWeeklyPerDay !== null && calculateItemMonthlyPerDay !== null){
        itemRentMinPrice = Math.min(
            calculateItemRentPerDay,
            calculateItemWeeklyPerDay,
            calculateItemMonthlyPerDay,
        )
    }
    await Item.updateOne({
        _id: itemId
    }, {
        $set: {
            ItemName: textualData.itemName,
            ItemDescription: textualData.itemDescription,
            ItemCategory: thisItemCategoryId,
            ItemDeliveryOptions: thisDeliveryOptionsIdArr,
            ItemPriceDaily: calculateItemRentPerDay,
            ItemPriceWeeklyPerDay: calculateItemWeeklyPerDay,
            ItemPriceMonthlyPerDay: calculateItemMonthlyPerDay,
            ItemPriceDailyMinimum: itemRentMinPrice,
            ItemMinimumRentDuration: textualData.itemMinimumRentDuration,
            ItemWeight: textualData.itemWeight,
            ItemPictureLocalPaths: thisPicturePathArr,
            MainItemPictureLocalPath : mainPicturePath,
            ItemModifiedDate: Date.now()
        }
    }).then(() => {
        console.log('ITEM UPDATED')
        return res.status(200).json({
            statusText: 'ITEM_UPDATED',
            statusCode: 200,
        })
    })
})

const deleteItem = asyncHandler(async (req, res) => {
    console.log('deleteItem API Fired')
    const itemId = req.params.itemId
    const user = req.user

    await Item.deleteOne({
        _id: itemId
    })

    return res.status(200).json({
        statusText: 'ITEM_DELETED',
        statusCode: 200,
    })
})


module.exports = {
    getItems,
    getItemById,
    getItemCategories,
    getHomeItemsData,
    getItemsByFilter,
    getSearchedItemsByFilter,
    getItemsByUserId,
    postItem,
    editItem,
    deleteItem
}