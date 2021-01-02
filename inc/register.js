module.exports = {

    render(req, res, error, success) {
        res.render('register', { 
            title: 'LetsTlk - Register',
            error,
            success,
            body: req.body
        })

    }

}