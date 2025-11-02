const mongoose=require("mongoose")
const childSchema=new mongoose.Schema({
childId:{
    type:String,
    required:true,
    unique:true,
    minLength:5,
    maxLength:9 ,
    match:/^[0-9]+$/
},
password:{
type:String,
minLength:8,
match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/,
},
parentName:{
    type:String,
    required:true,
    maxLength:20,
    trim:true
},
Fname:{
    type:String,   
    required:true,
    maxLength:20,
    trim:true
},
Lname:{
    type:String,
    required:true,
    maxLength:20,
    trim:true
},
age:{
    type:Number,
    required:true,
    min:0,
    max:99
},
address:{
    city:{
        type:String,
        required:true,
        maxLength:20,
        trim:true

    },
    street:{
        type:String,
        required:true,
        maxLength:20,
        trim:true
        
    },
    building:{
        type:Number,
        required:true,
        min:0,
        max:500
    },

},
phone1:{
    type:String,
    required:true,
    minLength:9,
    maxLength:10,
    match:/^[0-9]+$/

},
phone2:{
    type:String,
    minLength:9,
    maxLength:10,
    match:/^[0-9]+$/
},
email:{
    type:String,
    required:true,
    unique:true,
    match:/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/
},
definition:{
    type: String,
    maxLength:100
},
role:{
     type: String,
     enum: ["child", "admin"],
     default: "child",
    },
isVerified: {
  type: Boolean,
  default: false
},
isApproved: {
  type: Boolean,
  default: false
},
otp: {
  type: String
},
otpExpires: {
  type: Date
}

} , { timestamps: true }

)
module.exports=mongoose.model("Child",childSchema)  

