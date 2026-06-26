import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB successfully");
    }
    catch(err){
        console.log("Error in connecting to DB", err);
    }
}

export default connectDB;