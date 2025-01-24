import React, { useState, useEffect } from 'react';
import './Inbox.css';

function Inbox() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Eksempeldata - bytt med API-kall senere
    setMessages([
      { id: 1, sender: 'Creator123', content: 'Thanks for liking my video!', time: '10:30 AM' },
      { id: 2, sender: 'Friend456', content: 'Hey, what’s up?', time: '11:15 AM' },
      { id: 3, sender: 'User789', content: 'Did you see the new upload?', time: '1:45 PM' },
    ]);
  }, []);

  return (
    <div className="inbox-page">
      <h2 className="inbox-title">Inbox</h2>
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.id} className="message-item">
            <div className="message-header">
              <h4 className="sender-name">{msg.sender}</h4>
              <span className="message-time">{msg.time}</span>
            </div>
            <p className="message-content">{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inbox;
