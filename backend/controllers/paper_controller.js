import mongoose from "mongoose";
import Paper from "../models/paper_model.js";
import Author from "../models/author_model.js";
import Organization from "../models/organization_model.js";
import User from "../models/user_model.js";
import esClient, { syncExistingData, watchMongoChanges } from "../elastic/elastic_client.js";

const createPaper = async (req, res) => {
    try {
        const { title, abstract, authors, keywords, publicationDate, doi, journal } = req.body;
        const organization = req.organization;
        // Ensure title is provided
        if (!title || title.trim() === "") {
            return res.status(400).json({ message: "Title is required." });
        }

        // Ensure authors is an array
        if (!Array.isArray(authors) || authors.length === 0) {
            return res.status(400).json({ message: "Authors must be an array." });
        }

        if (!Array.isArray(keywords) || keywords.length === 0) {
            res.status(400);
            throw new Error('Keywords must be a non-empty array');
        }

        const newPaper = new Paper({
            title,
            abstract,
            authors,
            keywords,
            publicationDate,
            doi,
            journal,
            organization,
        });
        
        // Save the paper and return the result
        const savedPaper = await newPaper.save();
        watchMongoChanges();
        res.status(201).json(savedPaper);
    } catch (error) {
        console.error("Error in createPaper", error);
        res.status(500).json({ error: error.message || "Internal Server Error." });
    }
};

const getPaperById = async (req, res) => {
    try {
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid Paper ID." });
        }
        const paper = await Paper.findById(id);

        if(!paper) return res.status(404).json({error: "Paper not found."});
        res.status(201).json(paper);
    } catch (error) {
        res.status(500).json({error:"Internal Server Error"});
        console.log("Error in like post controller.",error); 
    }
}

const updatePaper = async (req, res) => {
    // const {title, abstract, authors, keywords, publicationDate, journal, doi} = req.body;
    // const {id} = req.params;

    // const paper = await Paper.findById(id)

    // if(!paper) return res.status(404).json({error: "Paper not found."});

    // paper.title = title || paper.title;
    // paper.abstract = abstract || paper.abstract;
    // paper. = title || paper.title;
    // paper.title = title || paper.title;

    // try {
        
    // } catch (error) {
        
    // }
}

const deletePaper = async (req, res) => {
    try {
        const paperId = req.params.id;
        
        // Check if paper exists
        const paper = await Paper.findById(paperId);
        if (!paper) {
            return res.status(404).json({ message: "Paper not found." });
        }

        // Get the current user or organization (logged-in user/organization)
        // const creatorId = req.user ? req.user.id : req.organization ? req.organization.id : null;
        // const creatorType = req.user ? 'User' : req.organization ? 'Organization' : null;

        // if (!creatorId || !creatorType) {
        //     return res.status(400).json({ message: "Creator information is required to delete." });
        // }

        // Check if the current user or organization is the creator of the paper
        // if (paper.createdBy.toString() !== creatorId.toString()) {
        //     return res.status(403).json({ message: "You do not have permission to delete this paper." });
        // }

        // Delete the paper
        await Paper.findByIdAndDelete(paperId);
        res.status(200).json({ message: "Paper deleted successfully." });
    } catch (error) {
        console.error("Error in deletePaper", error);
        res.status(500).json({ error: error.message || "Internal Server Error." });
    }
};

const searchPapers = async (req, res) => {
    try {
        const { query, filters } = req.body;

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ error: 'Query is required and must be a non-empty string.' });
        }

        const searchQuery = {
            index: 'papers',
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query,
                                fields: ['title', 'abstract', 'keywords', 'authors.name'],
                                fuzziness: 'AUTO',
                            },
                        },
                    ],
                    filter: filters || [],
                },
            },
        };

        const response = await esClient.search(searchQuery);
        console.log(response)
        res.status(200).json({message: response.hits.hits });
    } catch (error) {
        console.error('Error in searchPapers:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
  
const getPaperByAuthor = async (req, res) => {
    try {
        const { query, filters, author } = req.body;

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ error: 'Query is required and must be a non-empty string.' });
        }

        const searchQuery = {
            index: 'papers',
            query: {
                bool: {
                    must: [
                        {
                            match: {
                                query,
                                [author]: ['title', 'abstract', 'keywords', 'authors.name'],
                                fuzziness: 'AUTO',
                            },
                        },
                    ],
                    filter: filters || [],
                },
            },
        };

        const response = await esClient.search(searchQuery);
        console.log(response)
        res.status(200).json({message: response.hits.hits });
    } catch (error) {
        console.error('Error in searchPapers:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getPaperByKeyword = async (req, res) => {
    try {
        const { keyword } = req.params;
        const { query } = req.body;

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ error: 'Query is required and must be a non-empty string.' });
        }

        const searchQuery = {
            index: 'papers',
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query,
                                fields: ['title', 'abstract', 'keywords', 'authors.name'],
                                fuzziness: 'AUTO',
                            },
                        },
                    ],
                    filter: [
                        { term: { 'authors.name.keyword': author } }, // Exact match for the author's name
                    ],
                },
            },
        };

        const { body } = await esClient.search(searchQuery);

        if (!body.hits.hits.length) {
            return res.status(404).json({ message: 'No papers found for the specified author and query.' });
        }

        const results = body.hits.hits.map((hit) => ({
            id: hit._id,
            ...hit._source,
        }));

        res.status(200).json({ results, total: body.hits.total.value });
    } catch (error) {
        console.error('Error in searchPapersByAuthor:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getAllPapers = async (req, res) => {
    try {
        const papers = await Paper.find().sort({createdAt: -1}).populate({
            path: "title",
            select: "-password"
        });

        if(papers.length === 0){
            return res.status(200).json([]);
        }

        res.status(200).json(papers);

    } catch (error) {
        res.status(500).json({error:"Internal Server Error"});
        console.log("Error in get all post controller.",error);
    }  
}

export {
    createPaper,
    getPaperById,
    updatePaper,
    deletePaper,
    searchPapers,
    getAllPapers,
    getPaperByAuthor,
    getPaperByKeyword
};
