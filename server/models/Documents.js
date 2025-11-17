const mongoose=require("mongoose")
const DocumentsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    url:{
        type:String,
        required:true,
    },

}, { timestamps: true })
module.exports=mongoose.model("Document",DocumentsSchema)