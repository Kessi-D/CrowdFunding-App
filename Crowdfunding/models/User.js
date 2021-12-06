const mongoose = require('mongoose')

const connection = mongoose.connect('mongodb://127.0.0.1:27017/CrowdFunding')
.then(()=>{console.log('Sucessfully connected to monngDB')})
.catch(()=>{console.log('Could not connect to mongoDB')})

const usersSchema = new mongoose.Schema ({

    firstname: {
        type: String,
        minlength: 3,
        maxlength: 200
    },
    lastname:{
        type: String,
        minlength: 3,
        maxlength: 200
    },
    profilePic : {
        type:String,
        trim:true
    },
    email: {
        type:String,
        unique: true,
        
    },
    password : {
        type:String,
        trim:true,
        required: true,
        minlength: 2
    }
})

let User = mongoose.model('User', usersSchema);

module.exports = User;
