import express from 'express';
import multer from 'multer';
import { expenseController } from '../controllers/expenseController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { fileCleanup } from '../middlewares/fileCleanupMiddleware.js';

const router = express.Router();
const upload = multer({ 
    dest: 'uploads/',
    limits: { 
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg', 
            'image/png', 
            'image/webp',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Tipo de ficheiro não suportado: ${file.mimetype}`), false);
        }
    }
});

router.use(authMiddleware);

router.get('/', expenseController.list);
router.get('/summary', expenseController.summary);
router.get('/export', expenseController.exportCsv);

router.put('/:id', expenseController.update);
router.delete('/:id', expenseController.remove);

router.post('/text', expenseController.createFromText);
router.post('/image', upload.single('image'), fileCleanup, expenseController.createFromImage);
router.post('/audio', upload.single('audio'), fileCleanup, expenseController.createFromAudio);

export default router;