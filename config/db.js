const mongoose=require('mongoose');




const connectDB= async () => {

    try {
        
        await mongoose.connect(process.env.mongoURL,{
          
          
      
        })
        console.log("Mongodb connected..")
        
    } catch (error) {
        console.error(error.message)

        process.exit(1)

        
    }
}


module.exports=connectDB