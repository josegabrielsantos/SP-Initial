import mongoose from "mongoose";
import Paper from "../models/paper_model.js";
import Author from "../models/author_model.js";
import Organization from "../models/organization_model.js";
import User from "../models/user_model.js";

const createPaper = async (req, res) => {
    try {
        const { title, abstract, authors, publicationDate, doi, journal } = req.body;

        // Ensure title is provided
        if (!title || title.trim() === "") {
            return res.status(400).json({ message: "Title is required." });
        }

        // Ensure authors is an array
        if (!Array.isArray(authors)) {
            return res.status(400).json({ message: "Authors must be an array." });
        }

        // Process each author: check userId or string, save accordingly
        const formattedAuthors = await Promise.all(authors.map(async (author) => {
            if (author && author.userId) {
                // If the author has a userId, check if the user exists in the Author collection
                let existingAuthor = await Author.findOne({ userId: author.userId });
                if (!existingAuthor) {
                    // If the user doesn't exist in Author, check in the User collection
                    const user = await User.findById(author.userId);
                    if (!user) {
                        throw new Error(`User with ID ${author.userId} does not exist.`);
                    }

                    // Create a new author in Author collection
                    existingAuthor = new Author({
                        userId: author.userId,
                        firstName: user.firstName,
                        middleName: user.middleName,
                        lastName: user.lastName,
                    });
                    await existingAuthor.save();
                }

                // Return author with the full name from Author schema
                return { userId: existingAuthor.userId, fullName: existingAuthor.fullName };
            } else if (typeof author === "string") {
                // If the author is a string (external author), split it into parts
                const nameParts = author.split(' ');
                const firstName = nameParts[0];
                const middleName = nameParts.length > 2 ? nameParts[1] : null;
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : null;

                // Save the parsed name as a new author
                let newAuthor = new Author({
                    firstName,
                    middleName,
                    lastName,
                    userId: null, // Since it's an external author
                });

                // Save the new author and return their full name
                await newAuthor.save();
                return { userId: null, fullName: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim() };
            } else {
                // If neither a userId nor a name is provided, throw an error
                throw new Error("Each author must have a userId or a name.");
            }
        }));

        // Log authors data before saving to see the structure
        console.log("Formatted Authors:", formattedAuthors);

        // Create a new Paper instance
        const newPaper = new Paper({
            title,
            abstract,
            authors: formattedAuthors,
            publicationDate,
            doi,
            journal,
        });
        
        // Save the paper and return the result
        const savedPaper = await newPaper.save();
        res.status(201).json(savedPaper);
    } catch (error) {
        console.error("Error in createPaper", error);
        res.status(500).json({ error: error.message || "Internal Server Error." });
    }
};

const getPaperById = async (req, res) => {

}

const updatePaper = async (req, res) => {
    
}

const deletePaper = async (req, res) => {
    
}

const searchPapers = async (req, res) => {
    
}

const getPaperByAuthor = async (req, res) => {
    
}

const getPaperByCategory = async (req, res) => {
    
}

const getAllPapers = async (req, res) => {
    
}

export {
    createPaper,
    getPaperById,
    updatePaper,
    deletePaper,
    searchPapers,
    getAllPapers,
    getPaperByAuthor,
    getPaperByCategory
};
