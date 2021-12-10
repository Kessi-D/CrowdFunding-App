const mongoose = require('mongoose')

const connection = mongoose.connect('mongodb://127.0.0.1:27017/CrowdFunding')
.then(()=>{console.log('Sucessfully connected to monngDB')})
.catch(()=>{console.log('Could not connect to mongoDB')})

const projectOwnerSchema = new mongoose.Schema ({

    firstname: {
        type: String,
        minlength: 3,
        maxlength: 50
    },
    lastname:{
        type: String,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type:String,
        unique: true,   
    },
    address: {
        type:String,
        trim: true,
        required: true,
    },
    country: {
        type:String,
        trim: true,
        required: true,
    },
    role: {
        type:String,
        trim: true,
    },
    password : {
        type:String,
        trim:true,
        required: true,
        minlength: 2
    },
    profilePic : {
        type:String,
        trim:true
    }
})

let projectOwner = mongoose.model('Project Owner', projectOwnerSchema);

module.exports = projectOwner;
