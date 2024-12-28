import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
        min: 8,
      },
      role: {
        type: String,
        enum: ['admin', 'researcher', 'student', 'public'],
        default: 'public',
      },
      following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: [],
        }
      ],
      followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: [],
        }
      ],
      following_organization:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            default: [],
        }
      ],
      profile_picture: {
        type: String, // URL to the profile picture
        default: 'https://example.com/default-profile.png', // Optional default picture
      },
    },
    {
      timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const User = mongoose.model("User", userSchema);

export default User;