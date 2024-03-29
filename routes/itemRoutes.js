const express = require('express')
const router = express.Router()
const multer = require('multer')
const { protect } = require('../authMiddleware.js')
const { checkItemExist } = require('../middlewares/checkItemExist.js')
const { getItems, 
    getItemById, 
    getItemCategories, 
    getHomeItemsData,
    getItemsByFilter , 
    getSearchedItemsByFilter, 
    getItemsByUserId, postItem_imageLocal,
    postItem_imageCloud, 
    editItem_imageLocal, editItem_imageCloud,
    deleteItem } = require('../controllers/ItemController')
const Item = require('../models/Item.model')

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../client/public/image_uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ 
    storage: fileStorageEngine,
    fileFilter: async (req, res, cb) => {
        const textualData = req.body
        const thisUser = req.user
        const itemExist = await Item.findOne({
            'ItemCreatedBy.userId': thisUser.id,
            ItemName: textualData.itemName,
        })
        if(itemExist){
            cb(null, false) //file rejected, moving to next middleware
        }
        else{
            cb(null, true) //file accepted, moving to next middleware
        }
    }
});

const upload_update = multer({
    storage: fileStorageEngine
})

router.get('/search/filter/:searchKeyword', getSearchedItemsByFilter)
router.get('/item-categories', getItemCategories)
router.get('/home', getHomeItemsData)
router.get('/filter', getItemsByFilter)
router.get('/owner', protect, getItemsByUserId)
router.get('/:itemId', getItemById)
router.put('/image-local/:itemId', protect, upload_update.any(), editItem_imageLocal)
router.put('/image-cloudinary/:itemId', protect, editItem_imageCloud)
router.delete('/:itemId', protect, deleteItem)
router.get('/', getItems)
router.post('/image-local', protect, upload.any(), checkItemExist, postItem_imageLocal)
router.post('/image-cloudinary', protect, postItem_imageCloud)


module.exports = router