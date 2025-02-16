import React, { useState } from 'react';
import './Upload.css';

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

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
      // 1) Upload the file to our backend
      const formData = new FormData();
      formData.append('video', file);

      // Change localhost:5000 to your Render URL in production
      const uploadRes = await fetch('http://localhost:5000/api/upload-video', {
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

      // 2) Save metadata in the "videos" table
      const metadataRes = await fetch('http://localhost:5000/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          videoUrl,
          thumbnail: '',     // or set a real thumbnail if you have one
          duration: '',      // or calculate duration
          tags: '',
          embed_code: ''
        }),
      });
      const metadataData = await metadataRes.json();

      if (!metadataRes.ok) {
        throw new Error(metadataData.error || 'Saving metadata failed');
      }

      console.log('Metadata saved:', metadataData);

      alert('Video uploaded and metadata saved successfully!');

      // Reset form
      setFile(null);
      setTitle('');
    } catch (err) {
      console.error(err);
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
