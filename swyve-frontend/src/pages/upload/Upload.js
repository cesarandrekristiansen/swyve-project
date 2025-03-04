import React, { useState } from 'react';
import './Upload.css';

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const userId = localStorage.getItem('userId');

  console.log('UserID: ', userId);


  // Use the environment variable, falling back to localhost if not set
  const backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !title) {
      alert('Please fill in all fields!');
      return;
    }

    setUploading(true);

    try {
      // Step 1: Upload the video file to the backend
      const formData = new FormData();
      formData.append('video', file);

      const uploadRes = await fetch(`${backendUrl}/api/upload-video`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'File upload failed');
      }

      const { videoUrl } = uploadData;
      if (!videoUrl) {
        throw new Error('No videoUrl returned from upload endpoint');
      }
      console.log('Video uploaded. URL:', videoUrl);



      // Step 2: Save video metadata (including videoUrl) to the database
      const metadataRes = await fetch(`${backendUrl}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          videoUrl,
          thumbnail: '', // Optionally add a thumbnail URL
          duration: '',  // Optionally add video duration
          tags: '',
          embed_code: '',
          userId // Include the user id here
        }),
      });
      const metadataData = await metadataRes.json();

      if (!metadataRes.ok) {
        throw new Error(metadataData.error || 'Saving metadata failed');
      }

      console.log('Metadata saved:', metadataData);
      alert('Video uploaded and metadata saved successfully!');
      
      // Reset the form
      setFile(null);
      setTitle('');
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <h2 className="upload-title">Upload Your Video</h2>
      <div className="upload-form">
        <input
          type="text"
          placeholder="Enter video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="upload-input"
        />
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="upload-file-input"
        />
        <button onClick={handleUpload} disabled={uploading} className="upload-btn">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}

export default Upload;
