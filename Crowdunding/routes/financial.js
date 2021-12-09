var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs')

const Project = require('../models/Project')
const Donation = require('../models/Donation')

const uploadInitialStagePics = multer({dest:'public/images/initial_stage_pics'});
const uploadFinalStagePics = multer({dest:'public/images/final_stage_pics'});

/* GET home page. */
router.get('/', async function(req, res, next) {
 
  const projects = await Project.find()

  res.render('financial-index', { title: 'Express', projects:projects, userEmail: req.cookies.userEmail });
});

router.get('/view-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)
  const donations = await Donation.find({ projectID: req.params.id, status: "NotApproved"})

  res.render('financial-view-project', { title: 'Express', project:project, donations:donations });
});

router.get('/edit-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)
  res.render('reviewer-edit-project', { title: 'Express', project:project });
});

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
    status : req.body.projectStatus,
    initalImages : initalPics,
    finalImages : finalPics

  }, {new:true});

  res.redirect(`/reviewer/view-project/${req.body.projectToEditID}`)


  
});

router.get('/delete-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)

  await project.delete();

  res.redirect('/reviewer')
});

router.post('/sendToAdmin', async (req, res) => {
  const project = await Project.findById(req.body.projectID);
  
  const UploadProject = await Project.findByIdAndUpdate(req.body.projectID, {
    status : "Reviewed",
  }, {new:true});

  res.redirect('/reviewer')
});

router.get('/logout', async (req, res) => {
  res.clearCookie('userEmail')
  res.redirect('/')
});


router.post('/a', async (req, res) => {
  res.send("Approved!!!!")
});

router.post('/b', async (req, res) => {
  res.send("Declined!!!!")
});

router.post('/processDonations', async (req,res)=>{
  let sum = 0;


  let projectID = req.body.projectID;
  let project = await Project.findById(projectID)

  // console.log(req.body.projectID)

  let initialMoneyPledged = project.moneyPledged;
  let moneyAskedFor = project.amountAsked;

  // console.log(initialMoneyPledged)
  // console.log(moneyAskedFor)

  let newMoneyPledged = req.body.donationsRecieved;

  sum = Number(initialMoneyPledged) + Number(newMoneyPledged) ;

  function calculatePercent(a,b){
    let percent = (a/b) * 100;
    return percent;
  }

  let percentSum = calculatePercent(sum,moneyAskedFor);

  // // console.log(moneyAskedFor)
  // // console.log(sum)
  // // console.log(percentSum)

  // // sum = sum + amountApproved;

  // // console.log(sum)

  // // console.log(projectID)
  // // console.log(amountApproved)

  const UpdateProjectMoneyRecieved = await Project.findByIdAndUpdate(projectID, {
    moneyPledged : sum,
    percentage: percentSum,
  }, {new:true});

  res.redirect(`/financial/view-project/${projectID}`)
})


module.exports = router;
