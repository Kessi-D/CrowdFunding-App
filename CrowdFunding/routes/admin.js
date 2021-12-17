var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs')
const bcrypt = require('bcrypt')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const { AdminCreatedMessage, ProjectApprovedMessage, AdminToReviewerMessage } = require('../notificatons')
var {sendEMailToReviewer, sendApprovedToProjectOwner} = require ('../gmail-notification')



const Project = require('../models/Project')
const AdminUser = require('../models/adminUser')
const ProjectOwner = require('../models/projectOwner')
const Role = require('../models/Role')
const Country = require('../models/Country')

const {check, validationResult } = require('express-validator');
const User = require('../models/User');

const uploadInitialStagePics = multer({dest:'public/images/initial_stage_pics'});
const uploadFinalStagePics = multer({dest:'public/images/final_stage_pics'});

/* GET home page. */

// ===============render admin home page=============
router.get('/', async function(req, res, next) {
  const totalProjectOwners = await ProjectOwner.find().count()
  const adminUsers = await AdminUser.find().count()
  const countTotalUsers = totalProjectOwners + adminUsers
  const countProjects = await Project.find().count()
  const countReviewedProjects = await Project.find({ status: "reviewed"}).count()

  let usersList = await User.find()
  usersList = usersList.slice(0,5 )


  let projects = await Project.find({ status: "inactive"})
  projects = projects.slice(0,5 )

  let reviewedProjects = await Project.find({status:"reviewed"} || {status:"denied"})
  reviewedProjects = reviewedProjects.slice(0,5)

  res.render('admin-dashboard copy', { countProjects: countProjects, countTotalUsers: countTotalUsers, projects:projects, reviewedProjects:reviewedProjects, countReviewedProjects: countReviewedProjects, usersList:usersList, user: req.user})
});

// router.get('/', async function(req, res, next) {
  
//   res.render('b')
// });

router.get('/projects', async function(req, res, next) {
  const projectsFromVistors = await Project.find({ status: "inactive" })

  res.render('admin-index', { title: 'Express', projectsFromVistors:projectsFromVistors, userEmail: req.cookies.userEmail});
});

router.get('/view-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)
  const reviewers = await AdminUser.find({role: "reviewer"})

  const projectOwner = await ProjectOwner.findById(project.projectOwner)

  if (project.status === "reviewed") return res.render('admin-view-project-reviewed', { title: 'Express', project:project, userEmail: req.cookies.userEmail });
  if (project.status === "denied") return res.render ('denied-project-reviewed', {title: 'Express', project:project, userEmail: req.cookies.userEmail, projectOwner:projectOwner })
  res.render('admin-view-project', { title: 'Express', project:project, reviewers:reviewers, userEmail: req.cookies.userEmail });
});

router.get('/register', async (req, res) => {
  console.log(req.cookies.userEmail)
  res.render('admin-register', {title: 'Admin Register', userEmail: req.cookies.userEmail})
});


router.get('/edit-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)
  res.render('admin-edit-project', { title: 'Express', project:project , userEmail: req.cookies.userEmail});
});

// i dont understand something here
const cpUpload = uploadInitialStagePics.fields([{ name: 'initialStageImgs', maxCount: 3 }, { name: 'finalStageImgs', maxCount: 3 }]);

router.post('/processAdminProjectEdit', cpUpload , async (req, res) => {

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

  const editedProject = await Project.findByIdAndUpdate(req.body.projectToEditID, {
    title : req.body.projectTitle,
    description : req.body.projectDescription,
    location : req.body.projectLocation,
    endResult : req.body.projectAimedEndResult,
    participant : req.body.projectParticipants,
    impact: req.body.projectImpactInAfrica,
    startDate : req.body.startDate,
    endDate : req.body.endDate,
    socailMedia : req.body.socialLinks,
    currency : req.body.Currency,
    amountAsked : req.body.projectAmountNeeded,
    initalImages : initalPics,
    finalImages : finalPics

  }, {new:true});

  res.redirect(`/admin/view-project/${req.body.projectToEditID}`)


  
});

router.get('/users', async (req, res) => {
  const usersList = await User.find()
  // const usersEmail = await User.find({email})
  
  let user = req.user

  // console.log(usersList)
  // console.log(user)
  // console.log(usersEmails)
  res.render('user-list', {usersList:usersList, user: user})
});

router.get('/delete-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)

  await project.delete();

  res.redirect('/admin')
});
 

router.post('/uploadOnline', async (req, res) => {
  const project = await Project.findById(req.body.projectID);
  const projectOwner = await ProjectOwner.findById(project.projectOwner);

  ProjectApprovedMessage();

  sendApprovedToProjectOwner( project.title , projectOwner.firstname, projectOwner.email);

  const UploadProject = await Project.findByIdAndUpdate(req.body.projectID, {
    status : "Active",
  }, {new:true});

  res.redirect('/admin/reviewed')
});

router.get('/delete-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)

  await project.delete();

  res.redirect('/admin')
});
// ============== admin-delete users===================
 router.get('/delete-user/:id', async (req,res)=>{
   const productOwners = await User.findById(req.params.id)
  
   await productOwners.delete();

   res.redirect('/admin/')
 })

 router.get('/delete-admin-user/:id', async (req, res)=>{
  const adminUsers = await AdminUser.findById(req.params.id)
  await adminUsers.delete();

  res.redirect('/admin/users')

 })

router.post('/processAdminRegister', [
  
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
      return res.render('admin-register', {alert, title: "Admin Register", userEmail: req.cookies.userEmail})
    }

    user = new User({
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      email : req.body.email,
      role: req.body.role,
      password : await bcrypt.hash(req.body.password1, salt),   
    }).save()
    .then( item =>{
      AdminCreatedMessage();
      res.redirect('/admin/')
    }).catch(error=>{
      res.status(400).send('unable to save in database')
    })
    
  
});



router.get('/logout', async (req, res) => {
  res.clearCookie('userEmail')
  res.redirect('/')
});





router.post('/processSendToReviewer', urlencodedParser, async (req,res)=>{

  const updateProjectStatus = await Project.findByIdAndUpdate(req.body.projectID, {
    reviewer: req.body.reviewer,
    status : "review",
  }, {new:true});

  AdminToReviewerMessage();

  sendEMailToReviewer(req.body.reviewer) 
  
  res.redirect('/admin/projects')
});



// ==========render reviewed pages===================
router.get('/reviewed', async (req, res, next)=>{
  const projectsFromReviewers = await Project.find({ status: "reviewed"})
  const deniedProject = await Project.find({ status: "denied"})
  res.render('admin-reviewed-page', {title: 'Reviewed', projectsFromReviewers:projectsFromReviewers, deniedProject:deniedProject, userEmail: req.cookies.userEmail})
})

router.get('/role', async (req, res, next)=>{

  res.render('admin-create-role', {title: 'Reviewed', user: req.cookies.userEmail})
})

router.post('/processRole', async (req,res)=>{
  const role = new Role({
    name : req.body.roleName
  }).save()
  .then( item =>{
    res.redirect('/admin/projects')
  }).catch(error=>{
    res.status(400).send('unable to save in database')
  })
})

router.get('/country', async (req, res, next)=>{
  res.render('admin-create-country', {title: 'Reviewed', user: req.cookies.userEmail})
})

router.post('/processCountry', async (req,res)=>{
  const country = new Country({
    country_name: req.body.countryName,
    country_code : req.body.countryCode,
    currency : req.body.countryCurrency
  }).save()
  .then( item =>{
    res.redirect('/admin/projects')
  }).catch(error=>{
    res.status(400).send('unable to save in database')
  })
})


module.exports = router;
