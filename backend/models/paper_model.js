import mongoose from "mongoose";

const paperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    abstract: {
      type: String,
      default: "",
    },
    authors: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Author', // Reference to the Author collection
        },
        name: {
            type: String,
            trim: true,
        },
      },
    ],
    keywords: [
      {
        type: String,
        default: "",
      },
    ],
    publicationDate: {
      type: Date,
      default: null,
    },
    journal: {
      type: String, // e.g., name of the journal/conference
      default: "",
    },
    doi: {
      type: String, // Digital Object Identifier for referencing
      // unique: true,
      sparse: true,
      default: "",
    },
    // file: {
    //   type: String, // URL to the paper file (e.g., PDF)
    //   default: "",
    // },
    // organization: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Organization', // Reference to the Organization model, if applicable
    // },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'creatorType', // The refPath will help determine if it's a user or organization
    },
    creatorType: {
        type: String,
        required: true,
        enum: ['User', 'Organization'], // This ensures that we track if it's a User or Organization
    }
  },
  {
    timestamps: true,
  }
);

const Paper = mongoose.model("Papers", paperSchema);

export default Paper;
