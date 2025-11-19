require("dotenv").config()
const express=require("express")
const cors= require("cors")
const corsOptions=require("./config/corsOptions")
const connectDB=require("./config/dbConn")
const mongoose=require("mongoose")

connectDB()

const app = express()
const PORT =process.env.PORT||2500

app.use(express.json())
app.use(cors(corsOptions))
app.use(express.static("public"))

app.use("/api/club",require("./routs/ClubRouts"))
app.use("/api/auth",require("./routs/AuthRouts"))
app.use("/api/child",require("./routs/ChildRouts"))
app.use("/api/admin",require("./routs/AdminRouts"))
app.use("/api/daycamp",require("./routs/DayCampRouts"))
app.use("/api/messages", require("./routs/MessageRouts"))
app.use("/api/documents", require("./routs/DocumentRouts"))
app.use("/api/volunteer", require("./routs/VolunteerRouts"))
app.use("/api/update", require("./routs/UpdateRouts"))

mongoose.connection.once('open',()=>{
    console.log('connected to mongoDB')
    app.listen(PORT,()=>{console.log(`server runnig on port${process.env.PORT}`)})
})
mongoose.connection.on('error',err=>{
    console.log(err)
})
