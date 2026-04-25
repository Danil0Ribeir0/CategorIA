import express from 'express';
import multer from 'multer';
import { expenseController } from '../controllers/expenseController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(authMiddleware);

router.get('/', expenseController.list);
router.get('/summary', expenseController.summary);
router.get('/export', expenseController.exportCsv);

router.put('/:id', expenseController.update);
router.delete('/:id', expenseController.remove);

router.post('/text', expenseController.createFromText);
router.post('/image', upload.single('image'), expenseController.createFromImage);
router.post('/audio', upload.single('audio'), expenseController.createFromAudio);

export default router;