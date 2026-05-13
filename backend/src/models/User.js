import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor, insira um endereço de e-mail válido']
    },
    password: { 
        type: String, 
        required: true 
    }
}, 
{ 
    timestamps: true 
});

export const User = mongoose.model('User', userSchema);