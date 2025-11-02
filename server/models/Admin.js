const mongoose=require("mongoose")
const adminSchema=new mongoose.Schema({
name:{
    type:String,
    required:true,
    trim:true
},
email:{
  type:String,
    required:true,
    unique:true,
    match:/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/
},
password:{
type:String,
required:true,
minLength:8,
  match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/,
},
role: {
    type: String,
    enum: ["child", "admin"],
    default: "admin",
  }
},{timestamps:true})
module.exports=mongoose.model("Admin",adminSchema)  
