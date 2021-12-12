var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs')
const bcrypt = require('bcrypt')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const { AdminCreatedMessage, ProjectApprovedMessage } = require('../notificatons')
var {sendEMailToReviewer, sendApprovedToProjectOwner} = require ('../gmail-notification')



const Project = require('../models/Project')
const AdminUser = require('../models/adminUser')
const ProjectOwner = require('../models/projectOwner')

const {check, validationResult } = require('express-validator')

const uploadInitialStagePics = multer({dest:'public/images/initial_stage_pics'});
const uploadFinalStagePics = multer({dest:'public/images/final_stage_pics'});

/* GET home page. */

// ===============render admin home page=============
router.get('/', async function(req, res, next) {
  const totalProjectOwners = await ProjectOwner.find().count()
  const adminUsers = await AdminUser.find().count()
  const countTotalUsers = totalProjectOwners + adminUsers
  const countProjects = await Project.find().count()


  let projects = await Project.find()
  projects = projects.slice(0,5 )

  let reviewedProjects = await Project.find({status:"reviewed"} || {status:"denied"})
  reviewedProjects = reviewedProjects.slice(0,5)

  res.render('admin-dashboard', { countProjects: countProjects, countTotalUsers: countTotalUsers, projects:projects, reviewedProjects:reviewedProjects, user: req.user})
});

// =======================================================

router.get('/view-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)
  const reviewers = await AdminUser.find({role: "reviewer"})

  if (project.status === "reviewed") res.render('admin-view-project-reviewed', { title: 'Express', project:project });
  if (project.status === "denied") res.render ('denied-project-reviewed', {title: 'Express', project:project })
  res.render('admin-view-project', { title: 'Express', project:project, reviewers:reviewers });
});

router.get('/register', async (req, res) => {
  res.render('admin-register')
});


router.get('/edit-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)
  res.render('admin-edit-project', { title: 'Express', project:project });
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

  res.redirect('/admin/projects')
});

router.get('/delete-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)

  await project.delete();

  res.redirect('/admin')
});
// ============== admin-delete users===================
 router.get('/delete-user/:id', async (req,res)=>{
   const productOwners = await  User.findById(req.params.id)
  
   await productOwners.delete();

   res.redirect('/admin/users')
 })

 router.get('/delete-admin-user/:id', async (req, res)=>{
  const adminUsers = await AdminUser.findById(req.params.id)
  await adminUsers.delete();

  res.redirect('/admin/users')

 })

router.post('/processAdminRegister', [
  
  check('email', 'Email is not valid.')
    .isEmail()
    .normalizeEmail(),
  check('password1', 'This password must be 3+ characters long.')
    .exists()
    .isLength({ min:3 }),
  check('password1').custom((value, { req }) => {
    if (value !== req.body.password2){
      throw new Error('Passwords do not match.')
    } else {
      return true;
    }

  })
], async (req, res) => {

  let userAdmin = await AdminUser.findOne({ email: req.body.email })
  if (userAdmin) return res.status(400).send("User already registered.")

  const salt = await bcrypt.genSalt(10);

  const errors = validationResult(req);

    if (!errors.isEmpty()){
      const alert = errors.array();
      return res.render('admin-register', {alert})
    }

  if(req.body.password1 === req.body.password2){

    userAdmin = new AdminUser({
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      email : req.body.email,
      role: req.body.role,
      password : await bcrypt.hash(req.body.password1, salt),   
    }).save()
    .then( item =>{
      AdminCreatedMessage();
      res.redirect('/admin/users')
    }).catch(error=>{
      res.status(400).send('unable to save in database')
    })
    
  } else {
    return res.send("Passwords are not the same")
  }
});

router.get('/logout', async (req, res) => {
  res.clearCookie('userEmail')
  res.redirect('/')
});


router.get('/users', async (req, res) => {
  const adminUsers = await AdminUser.find()
  const productOwners = await ProjectOwner.find()

  console.log(productOwners)

  res.render('admin-users', { title: 'Express', adminUsers:adminUsers, productOwners:productOwners, userEmail: req.cookies.userEmail })
});


router.post('/processSendToReviewer', urlencodedParser, async (req,res)=>{

  const updateProjectStatus = await Project.findByIdAndUpdate(req.body.projectID, {
    reviewer: req.body.reviewer,
    status : "review",
  }, {new:true});

  sendEMailToReviewer(req.body.reviewer) 
  
  res.redirect('/admin/projects')
});

router.get('/projects', async function(req, res, next) {
  const projectsFromVistors = await Project.find({ status: "inactive" })

  res.render('admin-index', { title: 'Express', projectsFromVistors:projectsFromVistors, userEmail: req.cookies.userEmail});
});

// ==========render reviewed pages===================
router.get('/reviewed', async (req, res, next)=>{
  const projectsFromReviewers = await Project.find({ status: "reviewed"})
  const deniedProject = await Project.find({ status: "denied"})
  res.render('reviewed-page', {title: 'Reviewed', projectsFromReviewers:projectsFromReviewers, deniedProject:deniedProject, userEmail: req.cookies.userEmail})
})


module.exports = router;