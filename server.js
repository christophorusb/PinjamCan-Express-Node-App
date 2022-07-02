
// console.log(process.env.JWT_SECRET)
//const bodyParser = require('body-parser');
//const User = require('./models/user.model');
//const bcrypt = require('bcrypt')
// app.use(express.json())

//  app.use(multer().any())
// app.use(cors())
// app.use((req, res, next) => {    
//     res.setHeader('Access-Control-Allow-Origin', '*');    
//     res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');    
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');    
//     next();
// });

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.use(cors({
    //origin: 'http://localhost:3000',
    origin: ['https://pinjamcan.netlify.app', 'http://localhost:3000'],
    methods:'GET,POST,PUT,DELETE',
    credentials: true,
}))

mongoose.connect('mongodb://pinjam_can:FyK3MABCFCNWbiHF@pinjamcluster-shard-00-00.gdsyv.mongodb.net:27017,pinjamcluster-shard-00-01.gdsyv.mongodb.net:27017,pinjamcluster-shard-00-02.gdsyv.mongodb.net:27017/PinjamCan?ssl=true&replicaSet=atlas-per5as-shard-0&authSource=admin&retryWrites=true&w=majority')
        .then(()=> {
            app.listen(5000, () => console.log('Server is listening on port 5000, MongoDB Atlas Connected'));
        })
        .catch(err => {
            console.log(err);
        });

app.get('/testroute', (req, res) =>{
    res.status(200)
    res.json({message: 'test route works'})
})

app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/items', require('./routes/itemRoutes'))
app.use('/api/wishlist', require('./routes/wishListRoutes'))
app.use('/api/delivery-options', require('./routes/deliveryOptionRoutes'))
app.use('/api/cart', require('./routes/cartRoutes'))
app.use('/api/transaction', require('./routes/transactionRoutes'))
app.use('/api/order', require('./routes/orderRoutes'))
app.use('/api/review', require('./routes/reviewRoutes'))
