const mongoose = require('mongoose')

const DeliveryOption = mongoose.Schema({
    Label: { type: String, required: true },
    Value : { type: String, required: true },
},
    { collection: 'delivery-option-data' }
)

const DeliveryOptionModel = mongoose.model('DeliveryOptionData', DeliveryOption)

module.exports = DeliveryOptionModel