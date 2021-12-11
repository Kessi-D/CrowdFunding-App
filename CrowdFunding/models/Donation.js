const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/CrowdFunding')
.then(()=>console.log('Connected to the MongoDB...'))
.catch(err=>console.error('Could not connect to the MongoDB...', err))

const donationSchema = new mongoose.Schema({
    projectID: {
      type: String,
      trim: true,
      required: true
    },
    donatorName: {
      type: String,
      trim: true,
      required: true
    },
    donatorEmail: {
      type: String,
      trim: true,
      required: true
    },
    donatorPhone: {
      type: String,
      trim: true,
      required: true
    },
    paymentMethod: {
      type: String,
      trim: true
    },
    amountRecieved: {
      type: Number,
    },
    status: {
      type: String,
      default: "NotApproved"
    }
  
})
  
const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;