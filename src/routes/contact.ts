import express from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// Contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Here you would typically send an email or save to database
    logger.info(`Contact form submitted: ${name} (${email}) - ${subject}`);
    
    res.json({
      success: true,
      message: 'Your message has been sent successfully'
    });
  } catch (error) {
    logger.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

export default router;