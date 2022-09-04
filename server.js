
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 5000
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({extended: true}))

app.use(cors({
    origin: ['https://pinjamcan.netlify.app', 'http://localhost:3000'],
    methods:'GET,POST,PUT,DELETE',
    credentials: true,
}))

mongoose.connect('mongodb://pinjam_can:FyK3MABCFCNWbiHF@pinjamcluster-shard-00-00.gdsyv.mongodb.net:27017,pinjamcluster-shard-00-01.gdsyv.mongodb.net:27017,pinjamcluster-shard-00-02.gdsyv.mongodb.net:27017/PinjamCan?ssl=true&replicaSet=atlas-per5as-shard-0&authSource=admin&retryWrites=true&w=majority')
        .then(()=> {
            app.listen(port, () => console.log(`Server is listening on port ${port}, MongoDB Atlas Connected`));
        })
        .catch(err => {
            console.log(err);
        });

app.get('/testroute', (req, res) =>{
    res.status(200)
    res.json({message: 'test route works'})
})

app.get('/', (req, res) => {
   res.send('Welcome to pinjamcan API')
})

app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/items', require('./routes/itemRoutes'))
app.use('/api/wishlist', require('./routes/wishListRoutes'))
app.use('/api/delivery-options', require('./routes/deliveryOptionRoutes'))
app.use('/api/cart', require('./routes/cartRoutes'))
app.use('/api/transaction', require('./routes/transactionRoutes'))
app.use('/api/order', require('./routes/orderRoutes'))
app.use('/api/review', require('./routes/reviewRoutes'))
