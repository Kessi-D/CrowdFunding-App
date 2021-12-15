var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs')
const mongoose = require('mongoose')
var passport = require('passport')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const { ProjectCreatedMessage } = require('../notificatons')
var { sendEmailtoAdmin} = require ('../gmail-notification')


const Project = require('../models/Project')
const User = require('../models/User')
const AdminUser = require('../models/adminUser')
const ProjectOwner = require('../models/projectOwner')
const Country = require('../models/Country')

const { authUser, authRole } = require('../basicAuth');


mongoose.connect('mongodb://127.0.0.1:27017/CrowdFunding')
.then(()=>console.log('Connected to the MongoDB...'))
.catch(err=>console.error('Could not connect to the MongoDB...', err))


var passport = require('passport');
const bcrypt = require('bcrypt')

const {check, body, validationResult } = require('express-validator')

const uploadInitialStagePics = multer({dest:'public/images/initial_stage_pics'});
const uploadFinalStagePics = multer({dest:'public/images/final_stage_pics'});



/* GET home page. */
router.get('/', async function(req, res, next) {
  
  const ghanaProjects = await Project.find({country:"GHS", status:"Active"});
  const burkinaProjects = await Project.find({country:"BKF", status:"Active"});

  res.render('home', {ghanaProjects:ghanaProjects, burkinaProjects:burkinaProjects, user: req.user});
});

// router.get('/', async function(req, res, next) {
  
//   const a = await ProjectOwner.find();
//   const b = await AdminUser.find();
//   const c = a.concat(b)
//   res.json(c)

// });
// router.get('/', async function(req, res, next) {
//   const role = new Role({
//     name: "Admin"
//   }).save()
//   .then( item => {
//     res.send('role saved')
//   }).catch(error=>{
//     res.status(400).send('unable to save in database')
//   })
// });

// router.get('/', async function(req, res, next) {
  
//   const a = await ProjectOwner.find()
//   const b = await AdminUser.find()

//   d = a.
//   e = await d.find()
//   console.log(e)
//   // const c =  a.concat(b)
  

//   // console.log(c);

//   // c.find
// });




// router.get('/create-project', (req,res)=>{
//   if (req.user) {
//     res.render('multi');
//   } 
//   res.redirect('/user-login');
// })

router.get('/create-project', authUser,authRole('project-owner'), async (req,res)=>{
  const countries = await Country.find()
  // console.log(req.user)
  res.render('multi', {user: req.cookies.userEmail});
  
})

router.get('/user-login', (req,res)=>{
  res.render('user-login');
})


router.get('/user-signup', (req,res)=>{
  console.log(req.cookies.userEmail)
  res.render('user-register', {user: req.cookies.userEmail});
})


router.get('/donate', (req,res)=>{
  res.render('donate-form')
})

router.get('/project-page', (req,res)=>{
  res.render('p-o-page')
})
// router.get('/views', (req,res)=>{
//   res.render('home')
// })
// router.post('/views', urlencoded(req,res)=>{
//   res.json('req.query.username')
// })
router.get('/view-project/:id', async (req,res)=>{
  const project = await Project.findById(req.params.id)
  res.render('view-project', {project:project, user: req.user})
});

const cpUpload = uploadInitialStagePics.fields([{ name: 'initialStageImgs', maxCount: 3 }, { name: 'finalStageImgs', maxCount: 3 }])

// ===========router saves the created project by user============
router.post('/processProjectUpload', cpUpload, urlencodedParser, async (req, res)=>{       
  let initalPics = [];
  let finalPics = [];

  let files = req.files;

  let initialStageImages  = files.initialStageImgs; 
  let finalStageImages  =  files.finalStageImgs;

  for (var i=0; i<initialStageImages.length; i++){

    const newPath = `public/images/initial_stage_pics/${initialStageImages[i].originalname}`
    initalPics.push(initialStageImages[i].originalname)

    fs.rename(initialStageImages[i].path, newPath, ()=>{
      let msg = 'file uploaded.';
    })

  }

  for (var i=0; i<finalStageImages.length; i++){

    const newPath = `public/images/final_stage_pics/${finalStageImages[i].originalname}`
    finalPics.push(finalStageImages[i].originalname)

    fs.rename(finalStageImages[i].path, newPath, ()=>{
      let msg = 'file uploaded.';
    })

  }

  let signedPO = req.user;
  let poID = signedPO._id;


  const project = new Project({
    projectOwner: poID,
    title : req.body.projectTitle,
    description : req.body.projectDescription,
    location : req.body.projectLocation,
    endResult : req.body.projectAimedEndResult,
    participant : req.body.projectParticipants,
    impact: req.body.projectImpactInAfrica,
    startDate : req.body.startDate,
    endDate : req.body.endDate,
    socailMedia : req.body.socialLinks,
    country : req.body.country,
    currency : req.body.currency,
    amountAsked : req.body.projectAmountNeeded,
    status : req.body.projectStatus,
    initalImages : initalPics,
    finalImages : finalPics

  });

  await project.save();

// =======gmail notification===============
  ProjectCreatedMessage()
  sendEmailtoAdmin(req.body.projectParticipants, req.body.projectTitle, req.body.projectLocation)

  res.redirect('/')
})

router.get('/register', (req, res)=>{
  res.render('register')
});


// router.get('/post-page',(req,res)=>{
//   res.render('p-o-page.ejs')
// } )

router.post('/addme', async (req,res, next)=>{
  const userFirstname = req.body.firstName;
  const userLastname = req.body.lastName;
  const userEmail = req.body.email;
  const userPassword = req.body.password1;
  const userPassword1 = req.body.password2;


  const salt = await bcrypt.genSalt(10);

  if(userPassword === userPassword1){

    const user = new User({
      firstname: userFirstname,
      lastname: userLastname,
      email:  userEmail,
      password: await bcrypt.hash(userPassword, salt),  
    }).save()
    .then( item =>{
      res.redirect('/login')
    }).catch(error=>{
      res.status(400).send('unable to save in database')
    })
    
  } else {
    return res.send("Passwords are not the same")
  }

})

router.get('/login', (req,res)=>{
  res.render('login2', {title: "Login User", user: req.user})
})



router.post('/loginUsers',[

  
  check('email').custom(async(value, { req }) => {
    return await ProjectOwner.findOne({ email: req.body.email }) ||  AdminUser.findOne({ email: req.body.email }) .then(async user => {
      if (!user) {
         return Promise.reject('Invalid Credentials');
      } 
    });

  }),
  check('password', 'This password must be 6+ characters long.').isLength({ min:6 }),
  check('password').custom(async(value, { req }) => {
    return await ProjectOwner.findOne({ email: req.body.email }) ||  AdminUser.findOne({ email: req.body.email }) .then(async user => {
      const poValidPassword = await bcrypt.compare(req.body.password, user.password)
      console.log(poValidPassword);
      if (!poValidPassword) {
         return Promise.reject('Password incorrect');
      }

    });
  }),
], async (req,res, next)=>{

  let projectOwner = await ProjectOwner.findOne({ email: req.body.email })
  let userAdmin = await AdminUser.findOne({ email: req.body.email })

  const errors = validationResult(req);
  if (!errors.isEmpty()){
    const alert = errors.array();
    return res.render('login2', {alert, user: req.cookies.userEmail})
  }
  

  if (userAdmin) {
    // const validPassword = await bcrypt.compare(req.body.password, userAdmin.password)
    // if (!validPassword) return res.status(400).send("Invalid email or password.")

    res.cookie('userEmail', req.body.email)

    return res.redirect(`/${userAdmin.role}`)
  } else if (projectOwner) {

    res.cookie('userEmail', req.body.email)

    return res.redirect('/create-project')
  } 

})

router.get('/logout', async (req, res) => {
  res.clearCookie('userEmail')
  res.redirect('/')
});


// ==================passport route github===============
router.get('/git', passport.authenticate('github'))


router.get('/auth/git', passport.authenticate('github', {failureRedirect: '/loginFailed'}), (req,res)=>{
  console.log("User info (please!!!)")
  console.log(req.user)
  res.redirect('/')
})

router.get('/a', (req,res)=>{
  res.render('a');
})


router.get('/loginFailed', (req,res)=>{
  res.send('passport failed main')
})
// =======================passport fb ================
router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: '/login',
    successRedirect: '/profile'
   }),
  // function(req, res) {
    // Successful authentication, redirect home.
  //   res.redirect('/');
  // } 
  );

  router.get('/auth/facebook',
  passport.authenticate('facebook', { session: false }),
  function(req, res) {
    res.json({ id: req.user.id, username: req.user.username });
  });

  // ====================passport google==================
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/donate');
  });

  router.get('/donate', (req,res)=>{
    res.render('donate-form')
  })
//  =============passport sessions===================
  // router.get('/donate',
  // passport.authenticate('google', { session: false }),
  // function(req, res) {
    
  // });
 router.get('/home', (req,res)=>{
   res.render('admin')
 })
  router.get('/auth/facebook',
  passport.authenticate('google', { session: false }),
  function(req, res) {
    res.json({ id: req.user.id, username: req.user.username });
  });

  router.get('/failed', (req, res)=>{
    res.send('failed to user login ')
  });
  router.get('/profile', (req, res)=>{
    res.send('Successful user login ')
  })

router.post('/processProjectOwnerRegister', [
  
  
  // check('email', 'Email is not valid.').isEmail().normalizeEmail(),
  check('email', 'Email is not valid.').custom(async(value, { req }) => {

    return await ProjectOwner.findOne({ email: req.body.email }).then(user => {
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

    // let projectOwner = await ProjectOwner.findOne({ email: req.body.email })
    // if (projectOwner) return res.status(400).send("User already registered.")
  
    const salt = await bcrypt.genSalt(10);
    
    const errors = validationResult(req);

    if (!errors.isEmpty()){
      const alert = errors.array();
      return res.render('user-register', {alert, user: req.cookies.userEmail})
    }
  
    if(req.body.password1 === req.body.password2){
  
      projectOwner = new ProjectOwner({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.email,
        address: req.body.address,
        country: req.body.country,
        role: req.body.role,
        password : await bcrypt.hash(req.body.password1, salt),   
      }).save()
      .then( item =>{
        res.redirect('/login')
      }).catch(error=>{
        res.status(400).send('unable to save in database')
      })
      
    } else {
      return res.send("Passwords are not the same")
    }
});




module.exports = router;
