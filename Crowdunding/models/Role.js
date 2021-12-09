var mongoose = require('mongoose')

const connection = mongoose.connect('mongodb://127.0.0.1:27017/CrowdFunding')
.then(()=>{console.log('Sucessfully connected to monngDB')})
.catch(()=>{console.log('Could not connect to mongoDB')})

const roleSchema = new mongoose.Schema({
    role: {
       type: String,
       required: true,
    }
})

let Role = mongoose.model('Role', roleSchema)

module.exports = Role