const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/CrowdFunding')
.then(()=>console.log('Connected to the MongoDB...'))
.catch(err=>console.error('Could not connect to the MongoDB...', err))

const projectSchema = new mongoose.Schema({
    title : {
      type:String,
      trim:true,
      required: true,
    },
    description : {
      type:String,
      trim:true,
      required: true,
    },
    location : {
      type:String,
      trim:true,
      required: true,
    },
    endResult : {
      type:String,
      trim:true,
      required: true,
    },
    participant : {
      type:String,
      trim:true,
      required: true,
    },
    impact : {
      type:String,
      trim:true,
      required: true,
    },
    startDate : {
      type:Date,
      required: true,
    },
    endDate : {
      type:Date,
      required: true,
    },
    socailMedia : {
      type:String,
      trim:true,
      required: true,
    },
    country : {
      type:String,
      trim:true,
      required: true,
    },
    currency : {
      type:String,
      trim:true,
      required: true,
    },
    moneyPledged : {
      type:Number,
      default: 0,
    },
    amountAsked : {
      type:Number,
      required: true,
    },
    status : {
      type:String,
      trim:true,
      required: true,
      default: "inactive",
    },
    initalImages : {
      type: Array,
      required: true
    },
    finalImages : {
      type: Array,
      required: true
    },
    percentage: {
      type: Number,
      default: 0,
    },
    reviewer: {
      type: String,
      default: null
    }
    
}, {timestamps: true});
  
const Project = mongoose.model('Project', projectSchema);

module.exports = Project