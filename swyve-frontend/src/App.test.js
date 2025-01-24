const BASE_URL = 'http://localhost:5000'; // Backend-URL

export async function uploadVideo(videoName, userName) {
  try {
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoName, userName }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}
