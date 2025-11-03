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
updateLocation: {
    type: String,
    enum: ["site", "site_and_email"],
    default: "site"
},
},{timestamps:true})
module.exports=mongoose.model("updating",updatingSchema)