var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs')

const Project = require('../models/Project')

const uploadInitialStagePics = multer({dest:'public/images/initial_stage_pics'});
const uploadFinalStagePics = multer({dest:'public/images/final_stage_pics'});

/* GET home page. */
router.get('/', async function(req, res, next) {
  const projects = await Project.find()
  res.render('admin-index', { title: 'Express', projects:projects });
});

router.get('/view-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)
  res.render('admin-view-project', { title: 'Express', project:project });
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
module.exports = router;
