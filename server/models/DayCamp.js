const mongoose=require("mongoose")
const dayCampSchema=new mongoose.Schema({
name:{
    type:String,
    required:true
},
startDate:{
type:Date,
required:true
},
endDate:{
type:Date,
required:true
},
location:{
    type: String,
    required: true,
    trim: true
},
 subscribersNumber:{
    type:Number,
    default:0
 },
 registerStatus:{
    type:Boolean,
    required:true,
    default:true
 },
 registeredChildren:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child"
}],
// optional file attached to the day camp (metadata + optional binary data)
file: {
    filename: { type: String, trim: true },
    path: { type: String, trim: true }, // local or remote path/URL
},
},{timestamps:true})
module.exports=mongoose.model("dayCamp",dayCampSchema)