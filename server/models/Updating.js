const mongoose=require("mongoose")
const updatingSchema=new mongoose.Schema({
title:{
    type:String,
    required:true
},
content:{
    type:String,
   required:true

},
file: {
    filename: { type: String, trim: true },
    path: { type: String, trim: true }, // local or remote path/URL
},
},{timestamps:true})
module.exports=mongoose.model("updating",updatingSchema)