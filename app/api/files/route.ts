import { Hono } from 'hono';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const app = new Hono();

// File upload endpoint
app.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const files = formData.getAll('files') as File[];
    const customerId = formData.get('customerId') as string;

    if (!files || files.length === 0) {
      return c.json({ error: 'No files provided' }, 400);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'customers', customerId || 'temp');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 9);
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${timestamp}-${randomString}${fileExtension}`;
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file to disk
      const filePath = path.join(uploadsDir, uniqueFilename);
      await writeFile(filePath, buffer);

      uploadedFiles.push({
        id: `${timestamp}-${randomString}`,
        originalName: file.name,
        filename: uniqueFilename,
        mimetype: file.type,
        size: file.size,
        uploadedAt: new Date(),
        path: filePath
      });
    }

    return c.json({ 
      success: true, 
      files: uploadedFiles 
    });

  } catch (error) {
    console.error('File upload error:', error);
    return c.json({ error: 'File upload failed' }, 500);
  }
});

// File download endpoint
app.get('/download/:fileId', async (c) => {
  try {
    const fileId = c.req.param('fileId');
    const customerId = c.req.query('customerId');
    
    if (!fileId || !customerId) {
      return c.json({ error: 'File ID and Customer ID required' }, 400);
    }
    
    // You would typically store file metadata in database and retrieve the actual filename
    // This is a simplified implementation
    return c.json({ error: 'File download not implemented yet' }, 501);

  } catch (error) {
    console.error('File download error:', error);
    return c.json({ error: 'File download failed' }, 500);
  }
});

// File deletion endpoint
app.delete('/:fileId', async (c) => {
  try {
    const fileId = c.req.param('fileId');
    const customerId = c.req.query('customerId');
    
    if (!fileId || !customerId) {
      return c.json({ error: 'File ID and Customer ID required' }, 400);
    }

    // In a real implementation, you'd:
    // 1. Look up the file in your database
    // 2. Delete the physical file
    // 3. Remove the database record
    
    return c.json({ success: true });

  } catch (error) {
    console.error('File deletion error:', error);
    return c.json({ error: 'File deletion failed' }, 500);
  }
});

export default app;