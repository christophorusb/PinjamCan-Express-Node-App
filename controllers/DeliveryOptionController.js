const DeliveryOption = require('../models/deliveryOption.model')
const asyncHandler = require('express-async-handler')

const getDeliveryOptions = asyncHandler(async (req, res) =>{
    console.log('getDeliveryOptions API fired')
    const deliveryOptions = await DeliveryOption.find()
    //console.log(deliveryOptions)

    if(deliveryOptions){
        //console.log(deliveryOptions)
        return res.status(200).json({
            status: 'success',
            dataResponse: deliveryOptions
        })
    }
    else{
        return res.status(400).json({
            status: 'fail',
            message: 'data not found'
        })
    }
})

module.exports = {
    getDeliveryOptions
}