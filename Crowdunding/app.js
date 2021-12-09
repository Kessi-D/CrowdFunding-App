var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var logger = require('morgan')
var router = require('./routes/index')
var passport = require('passport')
require('dotenv').config()
var {config, fbConfig, google} = require('./passport.js')
var GitHubStrategy = require('passport-github').Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require ('passport-facebook').Strategy
var methodOverride = require('method-override')
var bodyParser = require('body-parser')




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
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/admin', adminRouter)
app.use('/reviewer', reviewerRouter)
app.use('/financial', financialRouter)
app.use(passport.initialize())
app.use(passport.session())

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'crowdfund'
}));

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
passport.use(new FacebookStrategy(fbConfig,
function(accessToken, refreshToken, profile, cb) {
  
    return cb(null, user);
  
}
));
// ========================google auth=================
passport.use(new GoogleStrategy(google,
  function(accessToken, refreshToken, profile, cb) {
   
      return cb(null, profile);
  
  }
));
// ========================github auth=======================
passport.use(new GitHubStrategy.Strategy(config,
  function(accessToken, refreshToken, profile, cb) {
  console.log(profile)
  
  // const retrievedData = profile.findOne()
  return cb(null, profile);


}
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);  
  });
});
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/index.html'))
// });
// ====================================================
module.exports = app;
