const mongoose = require('mongoose')
const ItemCategory = require('../models/ItemCategory.model')

mongoose.connect('mongodb://pinjam_can:FyK3MABCFCNWbiHF@pinjamcluster-shard-00-00.gdsyv.mongodb.net:27017,pinjamcluster-shard-00-01.gdsyv.mongodb.net:27017,pinjamcluster-shard-00-02.gdsyv.mongodb.net:27017/PinjamCan?ssl=true&replicaSet=atlas-per5as-shard-0&authSource=admin&retryWrites=true&w=majority')
        .then(()=> {
            app.listen(5000, () => console.log('Server is listening on port 5000, Database Connected'));
        })
        .catch(err => {
            console.log(err);
        });

const seedItemCategories = [
    {
        Value: 'Musik',
    },
    {
        Value: 'Fotografi',
    },
    {
        Value: 'Buku',
    },
    {
        Value: 'Dapur',
    },
    {
        Value: 'Olahraga',
    },
    {
        Value: 'Fashion',
    },
    {
        Value: 'DIY',
    },
    {
        Value: 'Travelling'
    }
]

const seedDB = async () => {
    await ItemCategory.insertMany(seedItemCategories)
}

seedDB().then(() => {
    mongoose.connection.close()
}).then(() => {
    console.log('Seed Successful. DB connection closed.')
})