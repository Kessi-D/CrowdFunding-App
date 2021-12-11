var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs')

const Project = require('../models/Project')
const ProjectOwner = require('../models/projectOwner')

const { FinancialStatusMessage } = require('../notificatons')
const { sendEmailToProjectOwner } = require('../gmail-notification')

/* GET home page. */
router.get('/', async function(req, res, next) {
 
  const projects = await Project.find({status:"Active"})

  res.render('financial-index', { title: 'Express', projects:projects, userEmail: req.cookies.userEmail });
});

router.get('/view-project/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)

  const projectOwner = await ProjectOwner.findById(project.projectOwner)

  res.render('financial-view-project', { title: 'Express', project:project, projectOwner:projectOwner });
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

  FinancialStatusMessage();

  const projectOwner = await ProjectOwner.findById(project.projectOwner)

  sendEmailToProjectOwner(project.title, projectOwner.firstname, projectOwner.email, newMoneyPledged)

  const UpdateProjectMoneyRecieved = await Project.findByIdAndUpdate(projectID, {
    moneyPledged : sum,
    percentage: percentSum,
  }, {new:true});

  res.redirect(`/financial/view-project/${projectID}`)
})


module.exports = router;
