const mongoose = require("mongoose");
const Child = require("./Child");

const VolunteerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    minLength:5,
    maxLength:9 ,
    match:/^[0-9]+$/
  },
  fname: {
    type: String,
    required: true,
    maxLength: 20,
    trim: true
  },
  lname: {
    type: String,
    required: true,
    maxLength: 20,
    trim: true
  },
  clubs: [
    {
      clubName: {
        type: String
      },
      child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
      },
    },
  ],
  school: {
    type: String,
    required: true,
    maxLength: 20,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    minLength:9,
    maxLength:10,
    match:/^[0-9]+$/ 
  },
  address: {
    city: {
      type: String,
      required: true,
      maxLength:20,
      trim:true
    },
    street: {
      type: String,
      required: true,
        maxLength:20,
        trim:true
    },
    building: {
      type: Number,
      required: true,
    min: 1,
    max: 500
    },
  },
  email: {
    type: String,
    match: /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/,
    
  },
  dateBorn: {
    type: Date,
    required: true,
        validate: {
        validator: function(value) {
            return value <= new Date();
        },
        message: 'תאריך לידה לא יכול להיות עתידי'
    }
  },
});

module.exports = mongoose.model("Volunteer", VolunteerSchema);

