import express from 'express';
import { 
    createPaper, 
    getPaperById, 
    updatePaper, 
    deletePaper, 
    searchPapers, 
    getPaperByAuthor, 
    getPaperByCategory, 
    getAllPapers,
    test
} from '../controllers/paper_controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/create', protectRoute, createPaper);
router.post('/:id', protectRoute, updatePaper);
router.delete('/:id', protectRoute, deletePaper);

router.get('/search', protectRoute, searchPapers);
router.get('/search-author', protectRoute, getPaperByAuthor);
router.get('/search-keyword', protectRoute, getPaperByCategory);
router.get('/', protectRoute, getAllPapers);
router.get('/:id', protectRoute, getPaperById);


export default router;