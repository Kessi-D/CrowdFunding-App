var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs')
const bcrypt = require('bcrypt')

const Project = require('../models/Project')
const AdminUser = require('../models/adminUser')

const uploadInitialStagePics = multer({dest:'public/images/initial_stage_pics'});
const uploadFinalStagePics = multer({dest:'public/images/final_stage_pics'});

/* GET home page. */
router.get('/', async function(req, res, next) {
  const projects = await Project.find()
  res.render('admin-index', { title: 'Express', projects:projects, userEmail: req.cookies.userEmail });
});

router.get('/view-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)
  res.render('admin-view-project', { title: 'Express', project:project });
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
    status : req.body.projectStatus,
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
  
  const UploadProject = await Project.findByIdAndUpdate(req.body.projectID, {
    status : "Active",
  }, {new:true});

  res.redirect('/admin')
});

router.get('/delete-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)

  await project.delete();

  res.redirect('/admin')
});


router.post('/processAdminRegister', async (req, res) => {
  console.log(req.body.firstName)
  console.log(req.body.lastName)
  console.log(req.body.email)
  console.log(req.body.role)
  console.log(req.body.password1)
  console.log(req.body.password2)

  let userAdmin = AdminUser.findOne({ email: req.body.email })
  if (userAdmin) return res.status(400).send("User already registered.")

  const salt = await bcrypt.genSalt(10);

  if(req.body.password1 === req.body.password2){

    userAdmin = new AdminUser({
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      email : req.body.email,
      role: req.body.role,
      password : await bcrypt.hash(req.body.password1, salt),   
    }).save()
    .then( item =>{
      res.redirect('/admin')
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




module.exports = router;
