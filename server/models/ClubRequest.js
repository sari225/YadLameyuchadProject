const mongoose=require("mongoose")
const clubRequestSchema=new mongoose.Schema({
childId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"Child"
},
clubId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"Club"
},
},{timestamps:true})
module.exports=mongoose.model("ClubRequest",clubRequestSchema) 