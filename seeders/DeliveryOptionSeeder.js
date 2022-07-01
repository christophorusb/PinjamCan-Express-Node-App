const mongoose = require('mongoose')
const DeliveryOption = require('../models/deliveryOption.model')

mongoose.connect('mongodb://pinjam_can:FyK3MABCFCNWbiHF@pinjamcluster-shard-00-00.gdsyv.mongodb.net:27017,pinjamcluster-shard-00-01.gdsyv.mongodb.net:27017,pinjamcluster-shard-00-02.gdsyv.mongodb.net:27017/PinjamCan?ssl=true&replicaSet=atlas-per5as-shard-0&authSource=admin&retryWrites=true&w=majority')
        .then(()=> {
            app.listen(5000, () => console.log('Server is listening on port 5000, Database Connected'));
        })
        .catch(err => {
            console.log(err);
        });

const seedDeliveryOptions = [
    {
        Label: 'Saya Antar Sendiri!',
        Value: 'Saya Antar Sendiri!',
    },
    {
        Label: 'Anteraja',
        Value: 'Anteraja',
    },
    {
        Label: 'SiCepat',
        Value: 'SiCepat',
    },
    {
        Label: 'GoSend',
        Value: 'GoSend',
    },
    {
        Label: 'Ninja Xpress',
        Value: 'Ninja Xpress',
    },
    {
        Label: 'Grab Express',
        Value: 'Grab Express',
    },
    {
        Label: 'JNE',
        Value: 'JNE',
    },
    {
        Label: 'ID Express',
        Value: 'ID Express',
    }
]

const seedDB = async () => {
    await DeliveryOption.insertMany(seedDeliveryOptions)
}

seedDB().then(() => {
    mongoose.connection.close()
}).then(() => {
    console.log('Seed Successful. DB connection closed.')
})