import mongoose from "mongoose";

const subsciptionSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Subscription name is required"],
        trim:true,
        minlength:2,
        maxlength:100
    },
    price:{
        type:Number,
        required:[true, "Subscription price is required"],
        min: [0, "Price must be greater than 0"]
    },
    currency:{
        type:String,
        enum:["INR", "USD", "EUR", "SAR"],
        default:"INR",
    },
    frequency:{
        type:String,
        enum:['daily', 'weekly', 'monthly', 'yearly']
    },
    category:{
        type:String,
        enum:['daily', 'new', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'others'],
        require:true
    },
    timestamp:true
})