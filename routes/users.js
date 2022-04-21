var express = require('express');
var router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')

const {check, body, validationResult } = require('express-validator')

router.get('/user-signup', (req,res)=>{
    console.log(req.cookies.userEmail)
    res.render('user-register', {user: req.cookies.userEmail});
})

router.post('/processProjectOwnerRegister',[
  
  
    // check('email', 'Email is not valid.').isEmail().normalizeEmail(),
    check('email', 'Email is not valid.').custom(async(value, { req }) => {
  
      return await User.findOne({ email: req.body.email }).then(user => {
        if (user) {
          return Promise.reject('E-mail already in use');
        }
      });
    }),
    check('password1', 'This password must be 6+ characters long.').exists().isLength({ min:6 }),
      
    check('password1').custom((value, { req }) => {
      if (value !== req.body.password2){
        
        throw new Error('Passwords do not match..')
      } else {
        return true;
      }
  
    })
  ], async (req, res) => {
    
      const salt = await bcrypt.genSalt(10);
      
      const errors = validationResult(req);
  
      if (!errors.isEmpty()){
        const alert = errors.array();
        return res.render('user-register', {alert, user: req.cookies.userEmail})
      }
  
      let user = new User({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email : req.body.email,
        role: req.body.role,
        password : await bcrypt.hash(req.body.password1, salt),   
      }).save()
      .then( item =>{
        res.redirect('/users/login')
      }).catch(error=>{
        res.status(400).send('unable to save in database')
      })
        
    
        
});

router.get('/login', (req,res)=>{
    res.render('login2', {title: "Login User", user: req.user})
})
  
  
  
router.post('/loginUsers',[
  
    
    check('email').custom(async(value, { req }) => {
      return await User.findOne({ email: req.body.email }).then(async user => {
        if (!user) {
           return Promise.reject('Invalid Credentials');
        } 
      });
  
    }),
    check('password', 'This password must be 6+ characters long.').exists().isLength({ min:6 }),
    check('password').custom(async(value, { req }) => {
      return await User.findOne({ email: req.body.email }).then(async user => {
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) {
           return Promise.reject('Password incorrect');
        }
  
      });
    }),
  ], async (req,res, next)=>{
  
    // let projectOwner = await ProjectOwner.findOne({ email: req.body.email })
    let person = await User.findOne({ email: req.body.email })
  
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      const alert = errors.array();
      return res.render('login2', {alert, user: req.cookies.userEmail})
    }
  
    if (person.role === "project-owner") {
      res.cookie('userEmail', req.body.email)
      return res.redirect('/create-project')
    } else {
      res.cookie('userEmail', req.body.email)
      return res.redirect(`/${person.role}`)
    } 
  
});
  
router.get('/logout', async (req, res) => {
    res.clearCookie('userEmail')
    res.redirect('/')
});  

module.exports = router;