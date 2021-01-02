const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, './../public/img'))
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '.' + file.mimetype.split('/')[1]) //Appending .jpg
    }
})

module.exports = multer({ storage })