var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')


const redis = require('redis')
const session = require('express-session')
const connectRedis = require('connect-redis')(session)

const redisClient = redis.createClient({
  host: "localhost",
  port: 6379
})

var indexRouter = require('./routes/index')

var app = express()

//configure socket server
const http = require('http').createServer(app)
const io = require('socket.io')(http)

io.on('connection', (socket => {

  console.log("New User")

}))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  store: new connectRedis({
    client: redisClient
  }),
  secret: "1234",
  resave: true,
  saveUninitialized: true
}))

app.use('/', indexRouter(io))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

http.listen('3000', () => {
  console.log("SERVER IS RUNNING")
})

//module.exports = app
