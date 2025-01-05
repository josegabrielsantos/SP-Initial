import express from 'express';
import { 
    createPaper, 
    getPaperById, 
    updatePaper, 
    deletePaper, 
    searchPapers, 
    getPaperByAuthor, 
    getPaperByCategory, 
    getAllPapers 
} from '../controllers/paper_controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/create', protectRoute, createPaper);
router.get('/:id', protectRoute, getPaperById);
router.post('/:id', protectRoute, updatePaper);
router.delete('/:id', protectRoute, deletePaper);
router.get('/search', protectRoute, searchPapers);
router.get('/author/:authorId', protectRoute, getPaperByAuthor);
router.get('/category/:category', protectRoute, getPaperByCategory);
router.get('/', protectRoute, getAllPapers);

export default router;
