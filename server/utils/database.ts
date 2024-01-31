require('dotenv').config({ path: './config/.env' });

import mongoose from 'mongoose'

const dbUrl: string = process.env.DB_URL || '';

const dbConnection = async () => {

    try {
        await mongoose.connect(dbUrl).then((data: any) => {
            console.log(`Database connected successfully with ${data.connection.host}`)
        })
    }
    catch (err: any) {
        console.log(err.message)
        setTimeout(dbConnection, 5000)
    }
}

export default dbConnection;