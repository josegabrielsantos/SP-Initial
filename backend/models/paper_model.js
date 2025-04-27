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
    // authors: [
    //   {
    //     userId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'Author', // Reference to the Author collection
    //     },
    //     name: {
    //         type: String,
    //         trim: true,
    //     },
    //   },
    // ],
    authors: [
      {
        type: String,
        default: "",
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
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    // file: {
    //   type: String, // URL to the paper file (e.g., PDF)
    //   default: "",
    // },
    // organization: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Organization', // Reference to the Organization model, if applicable
    // },
  },
  // {
  //   timestamps: true,
  // }
);

const Paper = mongoose.model("Papers", paperSchema);

export default Paper;
