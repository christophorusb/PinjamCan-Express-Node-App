const mongoose = require('mongoose');

const User = new mongoose.Schema(
    {
        userFullName: { type: String, required: true },
        userEmail: { type: String, required: true, unique: true },
        userPassword: { type: String, required: true},
        userOriginalPasswordLength: { type: Number, default: 0},
        // userNIK: { type: String, required: true, unique: true },
        userPhoneNumber: { type: String, required: true, unique: true },
        picturePath: { type: String, default: null },
        userRatings: [ { type: Number, default: 0 } ],
        userAddress: { type: String, required: true, default: null },
    }, 
    
    { collection: 'user-data', strict: false },
)

const userModel = mongoose.model('UserData', User)

module.exports = userModel