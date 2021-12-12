var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs')



const Project = require('../models/Project');
const AdminUser = require('../models/adminUser');

const uploadInitialStagePics = multer({dest:'public/images/initial_stage_pics'});
const uploadFinalStagePics = multer({dest:'public/images/final_stage_pics'});

const { ReviewerToAdminMessage } = require('../notificatons')
var {sendApprovedMail, sendDeniedMail} = require ('../gmail-notification')

/* GET home page. */
router.get('/', async function(req, res, next) {
  let projects;

  console.log(req.user)
  if (req.user){
    let signedUser = req.user;
    projects = await Project.find({ status: "review", reviewer : signedUser.email })
  }
  
  projects = await Project.find({ status: "review" })
  res.render('reviewer-index', { title: 'Reviewer', projects:projects, userEmail: req.cookies.userEmail });
});

router.get('/view-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)
  res.render('reviewer-view-project', { title: 'Express', project:project, userEmail: req.cookies.userEmail });
});

// router.get('/edit-project/:id', async (req, res) => {
//   const project = await Project.findById(req.params.id)
//   res.render('reviewer-edit-project', { title: 'Express', project:project });
// });


// i dont understand something here
const cpUpload = uploadInitialStagePics.fields([{ name: 'initialStageImgs', maxCount: 3 }, { name: 'finalStageImgs', maxCount: 3 }]);

router.post('/processReviewerProjectEdit', cpUpload , async (req, res) => {

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

  res.redirect(`/reviewer/view-project/${req.body.projectToEditID}`)


  
});

// router.get('/delete-project/:id', async (req, res) => {
//   const project = await Project.findById(req.params.id)

//   await project.delete();

//   res.redirect('/reviewer')
// });

// ==================approved project by reviewer=================
router.post('/sendToAdmin', async (req, res) => {
  const project = await Project.findById(req.body.projectID);
  const UploadProject = await Project.findByIdAndUpdate(req.body.projectID, {
      status : "reviewed",
  }, {new:true})   //--find projects and update or changes the status to reviewed-//

  ReviewerToAdminMessage();

    // ===========query adminusers and grap the admin email to send approved projects to admin
 
  sendApprovedMail(req.body.body)

  res.redirect('/reviewer')
});


// ==================denied project by reviewer=================
router.post('/reviewerDenied', async (req, res) => {
  const project = await Project.findById(req.body.projectID);
  const UploadProject = await Project.findByIdAndUpdate(req.body.projectID, {
    status : "denied",
  }, {new:true});

  ReviewerToAdminMessage();
  
  sendDeniedMail(req.body.body) //send denied email to admin
  res.redirect('/reviewer')
})
// ==========================================================
router.get('/logout', async (req, res) => {
  res.clearCookie('userEmail')
  res.redirect('/')
});

module.exports = router;
