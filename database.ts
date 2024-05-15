import mongoose from "mongoose";
import { config } from 'dotenv';
config();

// Connect to database
const uri: string | undefined  = process.env.MONGO_URI;

if(!uri)
  throw new Error('MONGO_URI not found in environment variables');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000 // Example timeout value in milliseconds
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Create a schema
const Schema = mongoose.Schema;
const urlSchema = new Schema({
    original_url: String,
    short_url: String
});


export const URL = mongoose.model("URL", urlSchema);