const express=require('express');
const connectDB=require('./config/db')
const dotenv = require("dotenv")
// const auth=require('./middleware/auth')
const cors = require('cors')

dotenv.config();

const app=express();




connectDB()

//init Middleware

app.use(express.json())

const PORT=process.env.PORT ||5000;
app.use(cors())
app.get('/',(req,res)=>res.send("api running"))

app.use('/api/users', require('./Routes/api/user'))
// 
// app.use('/api/auth', require('./Routes/api/auth'))
app.use('/api/auth',require('./Routes/api/auth'));

app.use('/api/profile', require('./Routes/api/profile'))

app.use('/api/post', require('./Routes/api/posts'))



app.listen(5000,()=> console.log(`server started on port ${PORT}`))
