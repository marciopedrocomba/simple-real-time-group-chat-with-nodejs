module.exports = {

    render(req, res, error, success) {
        res.render('index', { 
            title: 'LetsTlk - Login',
            error,
            success,
            body: req.body
        })

    }

}