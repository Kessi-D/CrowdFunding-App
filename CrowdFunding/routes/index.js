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


var passport = require('passport');
const bcrypt = require('bcrypt')

const {check, body, validationResult } = require('express-validator')

const uploadInitialStagePics = multer({dest:'public/images/initial_stage_pics'});
const uploadFinalStagePics = multer({dest:'public/images/final_stage_pics'});



/* GET home page. */
router.get('/', async function(req, res, next) {
  
  const ghanaProjects = await Project.find({country:"GHS", status:"Active"});
  const burkinaProjects = await Project.find({country:"BKF", status:"Active"});
  let user = req.user;

  console.log(user)

  res.render('home2', {ghanaProjects:ghanaProjects, burkinaProjects:burkinaProjects, user: user});
});

// router.get('/', async function(req, res, next) {

//   res.render('view-project copy')

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

// router.get('/view-project/:id', async (req,res)=>{
//   // const project = await Project.findById(req.params.id)
//   res.render('view-project', {user: req.user})
// });

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

  






module.exports = router;
