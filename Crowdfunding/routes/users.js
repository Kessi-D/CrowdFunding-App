// var express = require('express');
// var router = express.Router();
// const User = require('../models/User')
// var passport = require('passport');
// var bcrypt = require('bcrypt')

// /* GET users listing. */
// router.get('/login', function(req, res, next) {
//   res.render('login');
// });
// router.get('/register', (req, res)=>{
//   res.render('register')
// });


// router.post('/addme', async (req,res, next)=>{
//   const userFirstname = req.body.firstName;
//   const userLastname = req.body.lastName;
//   const userEmail = req.body.email;
//   const userPassword = req.body.password1;
//   const userPassword1 = req.body.password2;

//   const salt = await bcrypt.genSaltSync(10);

//   if(userPassword === userPassword1){
//       const user = new User({
//           firstname: userFirstname,
//           lastname: userLastname,
//           email:  userEmail,
//           password: await bcrypt.hash(userPassword, salt),
          
//       }).save()
//       .then( item =>{
//           res.send('item saved to database')
//       }).catch(error=>{
//           res.status(400).send('unable to save in database')
//       })
 
//   }
//   else{res.send('password does not match')}

//   res.redirect('/')
// })

// router.get('/git', passport.authenticate('github'))


// router.get('/auth', passport.authenticate('github', {session: false}), (req, res)=>{
//   res.render('feed')


// })
// router.get('/home', (req,res)=>{
//   res.render('home')
// })
// router.get('/login2', (req,res)=>{
//   res.send('authenticate login details')
// })


// module.exports = router;
