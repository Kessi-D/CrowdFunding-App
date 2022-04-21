var mongoose = require('mongoose')

const connection = mongoose.connect('mongodb://127.0.0.1:27017/CrowdFunding')
.then(()=>{console.log('Sucessfully connected to monngDB')})
.catch(()=>{console.log('Could not connect to mongoDB')})

const countrySchema = new mongoose.Schema({
    country_name: {
       type: String,
       required: true, 
    },
    country_code : {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    }
})

let Country = mongoose.model('Country', countrySchema)

module.exports = Country