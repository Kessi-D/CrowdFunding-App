var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')

var logger = require('morgan')
var router = require('./routes/index')
var session = require('express-session')
var passport = require('passport')
require('dotenv').config()
var {config, fbConfig, google} = require('./passport.js')
var GitHubStrategy = require('passport-github').Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require ('passport-facebook').Strategy
var methodOverride = require('method-override')



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin')
var reviewerRouter = require('./routes/reviewer')
var financialRouter = require('./routes/financial')

const User = require('./models/User');

const { authUser, authRole } = require('./basicAuth');

var app = express();

app.use(session({
  secret: 'I love Express!',
  resave: false,
  saveUninitialized: true,
}))

app.use(passport.initialize())
app.use(passport.session())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'))

app.use(setUser)


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin',  adminRouter)
app.use('/reviewer',  reviewerRouter)
app.use('/financial', financialRouter)


// app.use('/', indexRouter);
// app.use('/users', usersRouter)
// app.use('/admin', authUser, authRole('admin'), adminRouter)
// app.use('/reviewer', authUser, authRole('reviewer'), reviewerRouter)
// app.use('/financial',authUser, authRole('financial'), financialRouter)


passport.use(new GitHubStrategy(config,
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    return cb(null, profile)
  }
));
passport.serializeUser((user, cb)=>{
  cb(null, user)
})
passport.deserializeUser((user, cb)=>{
  cb(null, user)
})


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


async function setUser(req,res,next){

  const loggedInUserEmail = req.cookies.userEmail

 
  if(loggedInUserEmail){
    const user = await User.findOne({ email : loggedInUserEmail })
    console.log(user)

    if (user){
      req.user = user;
    }
  }

  // console.log(req.user)


  // console.log(req.cookies.userEmail)
  // console.log(projectOwner)




  next()
}
// ====================================================
module.exports = app;
