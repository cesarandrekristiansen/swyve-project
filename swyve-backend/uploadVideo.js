// uploadVideo.js
const express = require('express');
const multer = require('multer');
const supabase = require('./supabaseClient');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/api/upload-video', upload.single('video'), async (req, res) => {
  console.log("uploadVideo.js is loaded!");
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // 1. Create a unique filename
    const fileName = `${Date.now()}-${req.file.originalname}`;
    console.log('fileName:', fileName);

    // 2. Upload to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')  // "videos" is the bucket name
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    // 3. Check for upload errors
    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw uploadError;
    }
    console.log('Supabase upload data:', uploadData);
    // uploadData.path is the path for the object in the bucket

    // 4. Get public URL (according to Supabase docs)
    const { data: publicUrlData, error: urlError } = supabase.storage
      .from('videos')
      .getPublicUrl(uploadData.path);

    if (urlError) {
      console.error('Supabase public URL error:', urlError);
      throw urlError;
    }

    // The docs show that publicUrl is inside data.publicUrl
    const finalPublicUrl = publicUrlData.publicUrl;
    console.log('finalPublicUrl:', finalPublicUrl);

    // 5. Return the public URL
    return res.status(200).json({ videoUrl: finalPublicUrl });
  } catch (err) {
    console.error('Error uploading video:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
