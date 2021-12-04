var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var router = require('./routes/index')
var passport = require('passport')
var config = require('./passport.js')
var GitHubStrategy = require('passport-github').Strategy
var methodOverride = require('method-override')


var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin')
var reviewerRouter = require('./routes/reviewer')
var financialRouter = require('./routes/financial')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'))

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/login', router)
app.use('/admin', adminRouter)
app.use('/reviewer', reviewerRouter)
app.use('/financial', financialRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// ===================Passport Config===============
passport.use(new GitHubStrategy.Strategy(config,
  function(accessToken, refreshToken, profile, cb) {
  console.log(profile)
  
  // const retrievedData = profile.findOne()
  return cb(null, profile);


}
))
// passport.serializeUser((user, cb) => {
//   cb(null, user);
// });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'))
});
// ====================================================
module.exports = app;