var nodemailer = require('nodemailer')
const AdminUser = require('../Crowdunding/models/adminUser')


async function sendEMailToReviewer (email) {
    const output = `
    <p>Hello,</p>
    <p>You have been assigned a new project by the Admin for your review and approval.</p>
    <p>Thank You!</p>
    

  `
  // console.log(process.env.EMAIL)
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    },
    tls: {
      rejectUnauthorized:false
    }
  });

  
  

  let info = await transporter.sendMail({
    to: email, // list of receivers
    subject: "New Project Assigned to You", // Subject line
    text: "Hello world?", // plain text body
    html: output, // html body
    from: '"MD Crowdfund Admin👻" <jmsgrnbrg@gmail.com>', // sender address
  });

  
  
  console.log("Message sent: %s", info.messageId);
  
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}

async function sendEmailtoAdmin(participants, title, location){
    let info;
  const output = `
    <p>New post Created by ${participants}</p>
    <h3>Project Details</h3>
    <ul>
        <li>Project title: ${title}</li>
        <li>Company: ${participants}</li>
        <li>Project location: ${location}</li>
        
    </ul> 

  `
  // console.log(process.env.EMAIL)
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    },
    tls: {
      rejectUnauthorized:false
    }
  });

  const adminUsers = await AdminUser.find({role:"admin"})

  for (let i=0; i < adminUsers.length; i++){
    const userEmail = adminUsers[i].email
    // console.log(userEmail)
    // usersEmail.push(userEmail)
      info = await transporter.sendMail({
      from: '"Crowdfund Project Form👻" <jmsgrnbrg@gmail.com>', // sender address
      to: userEmail, // list of receivers
      subject: "New Project Created", // Subject line
      text: "Hello world?", // plain text body
      html: output, // html body
    });

  }
  
  console.log("Message sent: %s", info.messageId);
  
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  
}

module.exports = {sendEMailToReviewer, sendEmailtoAdmin};