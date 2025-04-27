import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema(
    {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      middleName: {
        type: String,
        trim: true,
        required: true,
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
      followingOrganization:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            default: [],
        }
      ],
      likedPosts: [
        {
          type:mongoose.Schema.Types.ObjectId,
          ref: "Post",
          default: [],
        }
      ],
      memberOrganizations: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
          default: [],
        }
      ],
      applicationForMembership: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
          default: [],
        }
      ],
      applicationsForPosts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post'
        }
      ],
      posts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post'
        }
      ],
      profilePicture: {
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