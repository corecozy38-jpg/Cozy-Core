import mongoose from 'mongoose';

const { connect, connection } = mongoose;

export async function ConnectDB() {
    if (connection.readyState === 1) {
        return connection;
    }

    if (connection.readyState === 2) {
        console.log("DB is already connecting, waiting...");
        return new Promise((resolve, reject) => {
            connection.once('connected', () => resolve(connection));
            connection.once('error', (err) => reject(err));
        });
    }

    try {
        console.log("Creating new DB connection...");
        
        mongoose.set('bufferCommands', false); 

        const conn = await connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
        });

        console.log("Connected to MongoDB successfully!");
        return conn;
        
    } catch (error) {
        console.error(`ERROR connecting to MongoDB: ${error}`);
        
        throw error; 
    }
}