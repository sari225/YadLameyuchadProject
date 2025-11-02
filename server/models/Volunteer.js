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
    match:/^[0-9]+$/ 
  },
  address: {
    city: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    building: {
      type: Number,
      required: true,
    },
  },
  email: {
    type: String,
    match: /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/,
    
  },
  dateBorn: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Volunteer", VolunteerSchema);

