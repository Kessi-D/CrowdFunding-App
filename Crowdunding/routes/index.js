var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs')
const mongoose = require('mongoose')
var passport = require('passport')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var {sendEMailToReviewer, sendEmailtoAdmin, sendApprovedMail} = require ('../gmail-notification')


const Project = require('../models/Project')
const User = require('../models/User')
const AdminUser = require('../models/adminUser')


mongoose.connect('mongodb://127.0.0.1:27017/CrowdFunding')
.then(()=>console.log('Connected to the MongoDB...'))
.catch(err=>console.error('Could not connect to the MongoDB...', err))


var passport = require('passport');
const bcrypt = require('bcrypt')

const uploadInitialStagePics = multer({dest:'public/images/initial_stage_pics'});
const uploadFinalStagePics = multer({dest:'public/images/final_stage_pics'});

/* GET home page. */
router.get('/', async function(req, res, next) {
  
  const ghanaProjects = await Project.find({country:"GHS"});
  const burkinaProjects = await Project.find({country:"BKF"});

  res.render('home', {ghanaProjects:ghanaProjects, burkinaProjects:burkinaProjects});
});


router.get('/', async function(req, res, next) {
  
  const ghanaProjects = await Project.find({country:"GHS", status:"Active"});
  const burkinaProjects = await Project.find({country:"BKF", status:"Active"});

  res.render('home', {ghanaProjects:ghanaProjects, burkinaProjects:burkinaProjects});
});




router.get('/create-project', (req,res)=>{
  res.render('multi')
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
  res.render('view-project', {project:project})
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


  const project = new Project({
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
  res.render('login2')
})

router.get('/login2', (req,res)=>{
  res.render('login2')
})


router.post('/loginUsers', async (req,res, next)=>{

  let userAdmin = await AdminUser.findOne({ email: req.body.email })
  if (!userAdmin) return res.status(400).send("Invalid email or password.")

  const validPassword = await bcrypt.compare(req.body.password, userAdmin.password)
  if (!validPassword) return res.status(400).send("Invalid email or password.")

  res.cookie('userEmail', req.body.email)

  res.redirect(`/${userAdmin.role}`)
})


// ==================passport route github===============
router.get('/git', passport.authenticate('github'))


router.get('/auth/git', passport.authenticate('github', {session: false}), (req, res)=>{
  res.render('p-o-page')
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


module.exports = router;
