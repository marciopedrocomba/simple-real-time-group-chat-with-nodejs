var express = require('express')
var router = express.Router()
const moment = require('moment')

//routes includes
const register = require('../inc/register')
const index = require('../inc/index')

const formidable = require('./../inc/formidable')
//const multer = require('./../inc/multer')

const User = require('./../inc/User')
const Message = require('./../inc/Message')
const app = require('./../inc/app')

//auth middleware
function authMiddleware(req, res, next) {

  const notAllowed = ['/', '/register']

  if(!req.session.user && notAllowed.indexOf(req.url) == - 1) {
    res.redirect('/')
  }else {
    if(req.session.user && notAllowed.indexOf(req.url) > -1) return res.redirect('/app')
    next()
  }

}

module.exports = function(io) {

  /* GET home page. */
router.get('/', authMiddleware, function(req, res, next) {
  index.render(req, res)
})

router.get('/register', authMiddleware, function(req, res, next) {
  register.render(req, res)
})

router.get('/app', authMiddleware, async function(req, res, next) {

  try {

    const messages = await app.getAllMessages()

    res.render('app', app.getParams({
      user: req.session.user,
      messages
    }))
    
  } catch (error) {
    
    console.log(error)

  }

})

//POST METHODS

router.post('/register', formidable, async (req, res) => {

  try {

    const allwedtypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']

    if(!req.body.username) {

      register.render(req, res, "Please fill the username field")

    }else if(!req.body.email) {

      register.render(req, res, "Please fill the email field")

    }else if(!req.body.password) {

      register.render(req, res, "Please fill the password field")

    }else {

      let params = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      }

      if(req.files.photo.size != 0) {

        if(!allwedtypes.includes(req.files.photo.type)) return register.render(req, res, "The files type is not accepted, Allowed: {'image/jpg', 'image/jpeg', 'image/png', 'image/gif'}")

        params.photo = req.files.photo.path

      }

      const userExists = await User.validateUserExists(req.body.username, req.body.email)

      if(userExists.email) {
        if(req.body.username == userExists.username) req.body.username = ""
        if(req.body.email == userExists.email) req.body.email = ""
        return register.render(req, res, "Opps! username or email already exists, try another one")
      } 

      const savedUser = await User.save(params)

      if(savedUser) {
        
        const login = await User.login(req.body.email, req.body.password)

        if(login) {
          req.session.user = login
          res.redirect('/app')
        }

        
      }

    }
    
  } catch (error) {
    
    console.log(error)

  }  

})

router.post('/login', async (req, res) => {

  try {

    if(!req.body.username) {

      index.render(req, res, "Please fill the username field")

    }else if(!req.body.password) {

      index.render(req, res, "Please fill the password field")

    }else {

      const login = await User.login(req.body.username, req.body.password)

      if(login.error)  return index.render(req, res, login.error)
      
      req.session.user = login
      res.redirect('/app')

    }
    
  } catch (error) {
    
    console.log(error)

  }  

})

router.post('/message', authMiddleware, async (req, res, next) => {

  try {

    const who = req.body.user
    const content = req.body.message
    const time = Date.now()

    if(!who) {

      res.json({
        error: "error"
      })

    }else if(!content) {

      res.json({
        error: "Please enter a message!"
      })

    }else {

      const messageSaved = Message.save({
        who,
        content,
        date: moment().format('YYYY-MM-DD'),
        time
      })

      if(messageSaved) {

        const data = {
          user: who,
          message: content,
          photo: req.body.photo,
          time
        }

        io.emit('new message', data)

        res.json({
          success: true
        })

      }

    }

    
  } catch (error) {
    
    console.log(error)

  }

})

router.get('/logout', (req, res) => {
  delete req.session.user
  res.redirect('/')
})

return router

} 
