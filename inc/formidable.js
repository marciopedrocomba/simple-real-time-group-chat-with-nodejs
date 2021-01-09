const formidable = require('formidable')
const path = require('path')

module.exports = function(req, res, next) {

    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, './../public/uploads'),
        keepExtensions: true
    })

    form.parse(req, (err, fields, files) => {

        if(err) throw err

        req.body = fields
        req.files = files

        next()

    })

}