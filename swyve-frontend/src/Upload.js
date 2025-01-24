import React, { useState } from 'react';
import './Upload.css';

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file || !title) {
      alert('Please fill in all fields!');
      return;
    }

    setUploading(true);

    setTimeout(() => {
      alert('Video uploaded successfully!');
      setUploading(false);
      setFile(null);
      setTitle('');
    }, 2000);
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
