import mongoose, { mongo } from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
      logo: {
        type: String, // URL to the organization's logo
        default: 'https://example.com/default-logo.png', // Optional default logo
      },
      website: {
        type: String, // URL to the organization's website
        default: null,
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
      followers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the User collection
        },
      ],
      posts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post', // Reference to the Post collection
        },
      ],
    },
    {
      timestamps: true,
    }
);

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;