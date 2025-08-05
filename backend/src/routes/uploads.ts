import { Router, Request, Response, NextFunction } from 'express';
import { handleUpload, cleanupOldFiles } from '../utils/upload';
import { authenticate } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
import { createError } from '../middleware/errorHandler';

// Extend the Express Request type to include the file property
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

const router = Router();

// Upload image endpoint
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Handle the file upload
    const file = await new Promise<Express.Multer.File>((resolve, reject) => {
      handleUpload(req, res, (err: any) => {
        if (err) return reject(createError(err.message, 400));
        if (!req.file) return reject(createError('No file was uploaded', 400));
        resolve(req.file);
      });
    });

    // Construct the file URL
    const fileUrl = `/uploads/${file.filename}`;
    
    // Clean up old files (run in background, don't wait for it to complete)
    cleanupOldFiles();

    // Return the file URL
    res.status(200).json({ 
      success: true,
      url: fileUrl,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    });
  } catch (error: any) {
    next(error);
  }
});

// Get image endpoint
router.get('/:filename', (req: Request, res: Response, next: NextFunction) => {
  const filename = req.params.filename;
  
  // Validate filename to prevent directory traversal
  if (!/^[a-zA-Z0-9-_.]+$/.test(filename)) {
    return next(createError('Invalid filename', 400));
  }
  
  const filePath = path.join(__dirname, '../../uploads', filename);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return next(createError('File not found', 404));
    }
    
    // Set appropriate content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    // Set headers and send file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    
    stream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });
  });
});

export default router;
