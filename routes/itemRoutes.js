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
    getItemsByUserId, postItem, 
    editItem, deleteItem } = require('../controllers/ItemController')
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
router.put('/:itemId', protect, upload_update.any(), editItem)
router.delete('/:itemId', protect, deleteItem)
router.get('/', getItems)
router.post('/', protect, upload.any(), checkItemExist, postItem)


module.exports = router