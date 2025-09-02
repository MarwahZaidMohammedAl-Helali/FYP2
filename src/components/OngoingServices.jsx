import React, { useState, useRef } from 'react';

const ongoingData = [
  {
    id: 1,
    title: 'Web Development Project',
    desc: 'Web development service offered in exchange for mobile app development.',
    partner: 'John Doe',
    partnerProgress: 0,
    partnerFile: null,
    yourProgress: 30,
    yourFile: null,
    deadline: '2025-02-20',
  },
  {
    id: 2,
    title: 'SEO Optimization',
    desc: 'SEO optimization offered in exchange for graphic design services.',
    partner: 'Alice Smith',
    partnerProgress: 0,
    partnerFile: null,
    yourProgress: 60,
    yourFile: null,
    deadline: '2025-02-20',
  }
];

const OngoingServices = () => {
  const [services, setServices] = useState(ongoingData);
  const [progressInputs, setProgressInputs] = useState({});
  const [uploadError, setUploadError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const triggerError = (message) => {
    setUploadError(message);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleProgressChange = (id, value) => {
    setProgressInputs({ ...progressInputs, [id]: value });
  };

  const handleFileUpload = async (serviceId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5000000) {
      triggerError('File size should be less than 5MB');
      return;
    }

    // Only moderate images
    if (file.type.startsWith('image/')) {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('http://localhost:3001/api/moderate-image', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();

        if (result.status === 'approved') {
          // Update the service with the file
          setServices(services.map(service => 
            service.id === serviceId 
              ? { ...service, yourFile: file.name }
              : service
          ));
          setUploadError('');
        } else {
          triggerError(result.reason || "This image was flagged as inappropriate and cannot be uploaded.");
        }
      } catch (e) {
        console.error('Image moderation error:', e);
        triggerError("Could not verify image content. Please try again later.");
      } finally {
        setUploading(false);
      }
    } else {
      // For non-image files, just update without moderation
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, yourFile: file.name }
          : service
      ));
    }
  };

  return (
    <div className="ongoing-root">
      <style>{`
        .ongoing-root {
          background: #f1f5f9;
          min-height: 100vh;
          padding: 2rem 0;
        }
        .ongoing-title {
          font-size: 2.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #222;
          text-align: center;
        }
        .ongoing-desc {
          text-align: center;
          color: #64748b;
          margin-bottom: 2rem;
        }
        .ongoing-card {
          background: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin: 0 auto 2rem auto;
          max-width: 900px;
          padding: 2rem 2rem 1.5rem 2rem;
          display: flex;
          flex-direction: column;
        }
        .ongoing-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .ongoing-card-desc {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        .ongoing-progress-row {
          display: flex;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }
        .ongoing-progress-box {
          background: #f3f4f6;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          flex: 1;
          padding: 1rem 1.5rem 1.5rem 1.5rem;
          min-width: 250px;
          position: relative;
        }
        .ongoing-progress-box.yourside {
          background: #e0f2fe;
          border: 1px solid #bae6fd;
        }
        .ongoing-progress-label {
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .ongoing-progress-bar {
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          margin-bottom: 0.5rem;
          position: relative;
        }
        .ongoing-progress-bar-inner {
          height: 100%;
          background: #2563eb;
          border-radius: 3px;
        }
        .ongoing-progress-input {
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.3rem;
          border: 1px solid #cbd5e1;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        .ongoing-file-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 1rem;
          margin-bottom: 0.5rem;
          position: relative;
        }
        .ongoing-upload-btn {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 0.3rem;
          padding: 0.4rem 1rem;
          font-size: 1rem;
          color: #2563eb;
          cursor: pointer;
          margin-right: 0.5rem;
          transition: all 0.2s ease;
        }
        .ongoing-upload-btn:hover:not(:disabled) {
          background: #e2e8f0;
        }
        .ongoing-upload-btn.error {
          border-color: #ef4444;
          color: #ef4444;
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        .ongoing-submit-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 0.3rem;
          padding: 0.4rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          margin-left: 0.5rem;
        }
        .ongoing-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ongoing-deadline-row {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .ongoing-deadline-label {
          color: #64748b;
        }
        .ongoing-deadline-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 0.3rem;
          padding: 0.4rem 1.2rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
        }
        .ongoing-deadline-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error-message {
          position: absolute;
          bottom: -24px;
          left: 0;
          background: #ef4444;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        @media (max-width: 900px) {
          .ongoing-card { padding: 1rem; }
          .ongoing-progress-row { flex-direction: column; gap: 1rem; }
        }
      `}</style>
      <div className="ongoing-title">Ongoing Services</div>
      <div className="ongoing-desc">Here, you will find all the ongoing services you have posted or are participating in.</div>
      {services.map(service => (
        <div key={service.id} className="ongoing-card">
          <div className="ongoing-card-title">{service.title}</div>
          <div className="ongoing-card-desc">{service.desc}</div>
          <div className="ongoing-progress-row">
            {/* Partner Side */}
            <div className="ongoing-progress-box">
              <div className="ongoing-progress-label">{service.partner}<br/>Progress:</div>
              <div className="ongoing-progress-bar">
                <div className="ongoing-progress-bar-inner" style={{ width: `${service.partnerProgress}%` }} />
              </div>
              <div className="ongoing-file-row">
                <span role="img" aria-label="clip">📎</span> {service.partnerFile || 'No File'}
              </div>
            </div>
            {/* Your Side */}
            <div className="ongoing-progress-box yourside">
              <div className="ongoing-progress-label">Your Side<br/>Progress:</div>
              <div className="ongoing-progress-bar">
                <div className="ongoing-progress-bar-inner" style={{ width: `${service.yourProgress}%` }} />
              </div>
              <input
                className="ongoing-progress-input"
                type="number"
                min={0}
                max={100}
                value={progressInputs[service.id] || service.yourProgress}
                onChange={e => handleProgressChange(service.id, e.target.value)}
                placeholder="Update Progress"
              />
              <div className="ongoing-file-row">
                <span role="img" aria-label="clip">📎</span> {service.yourFile || 'No File'}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(service.id, e)}
                  style={{ display: 'none' }}
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
                <button 
                  className={`ongoing-upload-btn ${isShaking ? 'error' : ''}`}
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                >
                  {uploading ? 'UPLOADING...' : 'UPLOAD FILE'}
                </button>
                {uploadError && (
                  <div className="error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {uploadError}
                  </div>
                )}
              </div>
              <button className="ongoing-submit-btn">SUBMIT</button>
              <div className="ongoing-deadline-row">
                <span className="ongoing-deadline-label">Current Deadline: {service.deadline}</span>
                <button className="ongoing-deadline-btn">PROPOSE NEW DEADLINE</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OngoingServices; 