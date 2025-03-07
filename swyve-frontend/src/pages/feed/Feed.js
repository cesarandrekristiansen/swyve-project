import React, { useState, useEffect } from 'react';
import VideoCard from '../../components/videocard/VideoCard';
import './Feed.css';

function Feed() {
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [videos, setVideos] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState(0);


   // Get backend URL from environment variable (fallback to localhost for dev)
   const backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

   // Fetch video metadata from the database when component mounts
   useEffect(() => {
     fetch(`${backendUrl}/api/videos`)
       .then(res => res.json())
       .then(data => {
         //console.log('Fetched videos:', data);
         setVideos(data);
       })
       .catch(err => console.error("Error fetching videos:", err));
   }, [backendUrl]);

  // Håndter belønning for å se et visst antall videoer
  useEffect(() => {
    if (watchedVideos > 0 && watchedVideos % 10 === 0) {
      fetch(`${backendUrl}/api/rewards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, watchedVideos }),
      })
        .then(res => res.json())
        .then(data => alert(data.message))
        .catch(err => console.error("Reward error:", err));
    }
  }, [watchedVideos, backendUrl]);

  // Toggle for infinite scroll
  const toggleInfiniteScroll = () => {
    setInfiniteScroll(!infiniteScroll);
  };

  // Infinite scroll funksjonalitet
  useEffect(() => {
    if (infiniteScroll) {
      const handleScroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
          console.log('Loading more videos...');
          setVideos((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              src: 'https://www.w3schools.com/html/mov_bbb.mp4',
              userName: `User${prev.length + 1}`,
              likes: 0,
            },
          ]);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [infiniteScroll]);

  return (
    <div className="feed">
      {/* Toggle for infinite scroll 
      <button onClick={toggleInfiniteScroll} className="infinite-scroll-toggle">
        {infiniteScroll ? 'Disable Infinite Scroll' : 'Enable Infinite Scroll'}
      </button>*/}

      {/* Video feed */}
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          videoId={video.id}          // <-- Pass the video ID
          videoSrc={video.url}  // Use the URL from the DB
          source={video.source} // Pass the source property (e.g., "library" or "user")
          userName={"Uploader"}
          description={video.title} // Use the title as the description
          likes={video.likes || 0}
          comments={video.comments || 0}
          onVideoEnd={() => setWatchedVideos(prev => prev + 1)}
        />
      ))}

    </div>
  );
}

export default Feed;
