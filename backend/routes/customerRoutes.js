import express from 'express';
import multer from 'multer';
import { getCustomers, getCustomerById } from '../controllers/customerController.js';
import { handleCustomerVoice } from '../controllers/voiceController.js';

const router = express.Router();

// Configure multer memory storage for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB max audio file size
  }
});

// GET /api/customers
router.get('/', getCustomers);

// GET /api/customers/:customerId
router.get('/:customerId', getCustomerById);

// POST /api/customers/:customerId/voice
router.post('/:customerId/voice', upload.single('audio'), handleCustomerVoice);

export default router;
