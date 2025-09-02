import React, { useState, useRef, useEffect } from 'react';

// --- Helper Icons ---
const WarningIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> );
const PaperclipIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> );

const sampleConversations = [
  { id: '1', name: 'Sarah Johnson', avatar: '/placeholder-avatar.jpg', lastMessage: 'Thank you for your help!', lastTime: '2 min ago', messages: [{ fromMe: false, text: 'Hi! Can you help me with my project?', time: '09:00' }, { fromMe: true, text: 'Of course! What do you need?', time: '09:01' }] },
  { id: '2', name: 'Michael Chen', avatar: '/placeholder-avatar.jpg', lastMessage: 'Let me know if you need anything else.', lastTime: '1 hour ago', messages: [{ fromMe: false, text: 'The website looks fantastic!', time: '08:00' }, { fromMe: true, text: 'Glad you like it!', time: '08:01' }] }
];

const LoadingDots = () => (
  <div className="loading-dots">
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
  </div>
);

const Chat = () => {
  const [conversations, setConversations] = useState(sampleConversations);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [image, setImage] = useState({ preview: '', file: null }); // State for image preview and file
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input

  const activeConversation = conversations.find(c => c.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, activeConversation?.messages.length]);

  const triggerError = (message) => {
    setError(message); setIsShaking(true);
    setTimeout(() => { setIsShaking(false); }, 500);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage({
        preview: URL.createObjectURL(file), // Create a temporary URL for preview
        file: file,
      });
      setInput(''); // Clear text input when an image is selected
    }
  };

  const removeImage = () => {
    setImage({ preview: '', file: null });
  };

  const handleSend = async () => {
    if (image.file) { // If there's an image, send the image
      sendImage();
    } else if (input.trim()) { // Otherwise, if there's text, send the text
      sendMessage();
    }
  };

  const sendImage = async () => {
    setIsLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', image.file);

    try {
      const response = await fetch('http://localhost:3001/api/moderate-image', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.status === 'approved') {
        setConversations(convs => convs.map(c =>
          c.id === activeId ? { ...c, messages: [...c.messages, { fromMe: true, text: null, imageUrl: image.preview, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] } : c
        ));
        removeImage();
      } else {
        triggerError(result.reason || "This image was flagged as inappropriate and cannot be sent.");
      }
    } catch (e) {
      triggerError("Could not moderate image. Server may be down.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      triggerError("Message cannot be empty");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/moderate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() }),
      });

      const result = await response.json();

      if (result.status === 'approved') {
        setConversations(convs => convs.map(c =>
          c.id === activeId ? {
            ...c,
            messages: [...c.messages, {
              fromMe: true,
              text: input.trim(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]
          } : c
        ));
        setInput('');
        setError('');
      } else {
        triggerError(result.reason || "This message contains inappropriate content and cannot be sent.");
      }
    } catch (error) {
      triggerError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-root">
      <style>{
`
  .chat-root {
          display: flex;
          height: 500px;
          background: #fff;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .chat-sidebar {
          width: 260px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }
        .chat-sidebar-header {
          padding: 1rem;
          font-weight: 600;
          font-size: 1.1rem;
          color: #2563eb;
          border-bottom: 1px solid #e2e8f0;
        }
        .chat-conversations {
          flex: 1;
          overflow-y: auto;
        }
        .chat-conv-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          border-bottom: 1px solid #f1f5f9;
          background: none;
          transition: background 0.2s;
        }
        .chat-conv-item.active, .chat-conv-item:hover {
          background: #e0e7ff;
        }
        .chat-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }
        .chat-conv-info {
          flex: 1;
        }
        .chat-conv-name {
          font-weight: 500;
          color: #1e293b;
        }
        .chat-conv-last {
          font-size: 0.95rem;
          color: #64748b;
        }
        .chat-conv-time {
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .chat-main-header {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          font-weight: 600;
          color: #2563eb;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .chat-main-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 1rem 1rem 1rem;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
        }
        .chat-message-row {
          display: flex;
          margin-bottom: 0.75rem;
        }
        .chat-message-row.me {
          justify-content: flex-end;
        }
        .chat-message {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 1.25rem;
          background: #2563eb;
          color: #fff;
          font-size: 1rem;
          margin-left: 0.5rem;
          margin-right: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .chat-message-row.them .chat-message {
          background: #e0e7ff;
          color: #1e293b;
        }
        .chat-message-time {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.25rem;
          text-align: right;
        }
        .chat-input-bar {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
          background: #fff;
        }
        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 2rem;
          border: 1px solid #e2e8f0;
          font-size: 1rem;
          margin-right: 1rem;
        }
        .chat-send-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 2rem;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .chat-send-btn:hover {
          background: #1d4ed8;
        }
                  @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        .input-error {
          border: 1px solid #ef4444 !important; /* Red border for error */
        }
        .chat-error-message {
          position: absolute;
          bottom: 0.5rem;
          left: 1rem;
          color: #ef4444; /* Brighter red for visibility */
          font-size: 0.9rem;
          display: flex;
          align-items: center;
        }
        /* --- Existing Styles (no changes needed) --- */
        .chat-root { display: flex; height: 500px; background: #fff; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
        .chat-sidebar { width: 260px; background: #f8fafc; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; }
        .chat-sidebar-header { padding: 1rem; font-weight: 600; font-size: 1.1rem; color: #2563eb; border-bottom: 1px solid #e2e8f0; }
        .chat-conversations { flex: 1; overflow-y: auto; }
        .chat-conv-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; border-bottom: 1px solid #f1f5f9; background: none; transition: background 0.2s; }
        .chat-conv-item.active, .chat-conv-item:hover { background: #e0e7ff; }
        .chat-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .chat-conv-info { flex: 1; }
        .chat-conv-name { font-weight: 500; color: #1e293b; }
        .chat-conv-last { font-size: 0.95rem; color: #64748b; }
        .chat-conv-time { font-size: 0.8rem; color: #94a3b8; }
        .chat-main { flex: 1; display: flex; flex-direction: column; }
        .chat-main-header { padding: 1rem; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #2563eb; font-size: 1.1rem; display: flex; align-items: center; gap: 0.75rem; }
        .chat-main-messages { flex: 1; overflow-y: auto; padding: 1.5rem 1rem 1rem 1rem; background: #f8fafc; display: flex; flex-direction: column; }
        .chat-message-row { display: flex; margin-bottom: 0.75rem; }
        .chat-message-row.me { justify-content: flex-end; }
        .chat-message { max-width: 70%; padding: 0.75rem 1rem; border-radius: 1.25rem; background: #2563eb; color: #fff; font-size: 1rem; margin-left: 0.5rem; margin-right: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .chat-message-row.them .chat-message { background: #e0e7ff; color: #1e293b; }
        .chat-message-time { font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem; text-align: right; }
        .chat-input-bar { position: relative; display: flex; align-items: center; padding: 1rem; padding-bottom: 2.5rem; border-top: 1px solid #e2e8f0; background: #fff; }
        .chat-input { flex: 1; padding: 0.75rem 1rem; border-radius: 2rem; border: 1px solid #e2e8f0; font-size: 1rem; margin-right: 1rem; }
        .chat-send-btn { background: #2563eb; color: #fff; border: none; border-radius: 2rem; padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 500; cursor: pointer; transition: background 0.2s; }
        .chat-send-btn:hover { background: #1d4ed8; }
              .chat-input-bar { position: relative; display: flex; align-items: center; padding: 0.75rem 1rem; border-top: 1px solid #e2e8f0; background: #fff; }
        .chat-upload-btn { background: none; border: none; padding: 0.5rem; cursor: pointer; color: #64748b; }
        .chat-upload-btn:hover { color: #2563eb; }
        .image-preview-bar { padding: 0.5rem 1rem; background: #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
        .image-preview-thumb { height: 40px; width: 40px; object-fit: cover; border-radius: 4px; }
        .image-preview-remove { background: #e2e8f0; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-weight: bold; }
        .chat-message-image { max-width: 250px; border-radius: 1rem; }
        .loading-dots {
          display: inline-flex;
          align-items: center;
          height: 20px;
          margin-right: 10px;
        }

        .dot {
          width: 6px;
          height: 6px;
          margin: 0 2px;
          background: #2563eb;
          border-radius: 50%;
          animation: dot-flashing 1s infinite linear alternate;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes dot-flashing {
          0% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <div className="chat-sidebar">{/* ... sidebar ... */}</div>
      <div className="chat-main">
        <div className="chat-main-header">{/* ... header ... */}</div>
        <div className="chat-main-messages">
          {activeConversation.messages.map((msg, idx) => (
            <div key={idx} className={`chat-message-row${msg.fromMe ? ' me' : ' them'}`}>
              <div>
                <div className="chat-message">
                  {msg.text && <span>{msg.text}</span>}
                  {msg.imageUrl && <img src={msg.imageUrl} alt="Sent" className="chat-message-image" />}
                </div>
                <div className="chat-message-time">{msg.time}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* --- NEW IMAGE PREVIEW BAR --- */}
        {image.preview && (
          <div className="image-preview-bar">
            <img src={image.preview} alt="Preview" className="image-preview-thumb" />
            <button onClick={removeImage} className="image-preview-remove">&times;</button>
          </div>
        )}

        <div className="chat-input-bar">
          <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
          <button className="chat-upload-btn" onClick={() => fileInputRef.current.click()}><PaperclipIcon /></button>

          <input
            className={`chat-input ${isShaking ? 'shake' : ''} ${error ? 'input-error' : ''}`}
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={e => { setInput(e.target.value); if (image.file) removeImage(); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={isLoading}>
            {isLoading ? <LoadingDots /> : 'Send'}
          </button>
        </div>
        {error && <div className="chat-error-message" style={{position: 'relative', bottom: 0, margin: '-0.5rem 1rem 0.5rem 1rem'}}><WarningIcon /> {error}</div>}
      </div>
    </div>
  );
};

export default Chat;