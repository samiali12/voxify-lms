require('dotenv').config({ path: './config/.env' });

import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const emailRegistration: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

// Define the user interface
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    },
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: string }>;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string,
    SignRefreshToken: () => string
    createdAt: Date;
}

// Define the user schema
const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegistration.test(value)
            },
            message: "Please enter valid email"
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "Password must be 6 characters long"],
    },
    avatar: {
        public_id: String,
        url: String
    },
    role: {
        type: String,
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    courses: [
        {
            courseId: String,
        }
    ]
}, { timestamps: true }
)



// hash user password
userSchema.pre<IUser>("save", async function (next) {

    if (this.isModified('password')) {
        // Hash the password only if it has been modified (changed)
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
    // Continue to the next middleware or the save operation
    next();
})


userSchema.methods.SignAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
        expiresIn: "15m"
    })
}

userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
        expiresIn: "7d"
    })
}


userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {

    return await bcrypt.compare(enteredPassword, this.password)
}

// Create and export the User model
const User = mongoose.model<IUser>('User', userSchema);

export default User;