const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('CRITICAL ERROR: MONGO_URI is not defined in environment variables!');
            process.exit(1);
        }
        console.log('Attempting to connect to MongoDB...');
        // Log a masked version of the URI to verify it's being read
        const maskedUri = process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@');
        console.log(`Using URI: ${maskedUri}`);

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
