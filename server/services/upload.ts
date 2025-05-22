import { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';

// Configuratie voor disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "public", "images")); // Zorg dat deze map bestaat
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

const router = Router();

router.post('/upload', upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    res.send(`Afbeelding succesvol geüpload als ${req.file.filename}`);
    });

export default router;