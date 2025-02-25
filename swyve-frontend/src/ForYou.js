import React from 'react';
import VideoCard from '../components/VideoCard'; // vi kan trekke ut VideoCard i en egen mappe "components"

function ForYou() {
  return (
    <div>
      <VideoCard 
        videoSrc="https://www.w3schools.com/html/mov_bbb.mp4"
        userName="Bruker1"
        description="Første testvideo" 
        likes={120} 
        comments={30} 
      />
      <VideoCard
        videoSrc="https://www.w3schools.com/html/movie.mp4"
        userName="Bruker2"
        description="Andre testvideo" 
        likes={89} 
        comments={12} 
      />
    </div>
  );
}

export default ForYou;
