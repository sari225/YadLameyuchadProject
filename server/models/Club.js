const mongoose=require("mongoose")
const clubSchema=new mongoose.Schema({
name:{
    type:String,
    required:true,
    unique: true,
    trim:true
},
registeredChildren:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child"
}],
refusedChildren:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child"
}],
waitingChildren:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child"
}],
volunteers:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer"
}],
clubManagers:[{
    
name:{
    type:String,
    required:true,
    trim: true
},
phone:{
    type:String,
    required:true,
    match:/^[0-9]+$/

},
email:{
type:String,
match:/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/,
trim: true
}
}],
activityDay:{
    type:String,
    required:true,
    trim: true
},
startTime:{
    type:String,
    required:true
},
endTime:{
    type:String,
    required:true
},
location:{
    type: String,
    required: true,
    trim: true
}

},{timestamps:true})
module.exports=mongoose.model("Club",clubSchema)