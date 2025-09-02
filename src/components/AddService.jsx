import React, { useState, useEffect } from 'react';
import './styles/AddService.css';

const AddService = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    offer: '',
    seek: '',
    deadline: '',
    file: null,
    serviceType: 'remote', // 'remote' or 'in-person'
    location: '' // Only used when serviceType is 'in-person'
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState({});

  // Add keyframes for shake animation
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const categories = [
    'Design',
    'Development',
    'Marketing',
    'Writing',
    'Business',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
      // Clear location if switching to remote
      ...(name === 'serviceType' && value === 'remote' ? { location: '' } : {})
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate form
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.offer.trim()) newErrors.offer = 'Offer is required';
    if (!form.seek.trim()) newErrors.seek = 'Seek is required';
    if (!form.deadline) newErrors.deadline = 'Deadline is required';
    if (form.serviceType === 'in-person' && !form.location.trim()) {
      newErrors.location = 'Location is required for in-person services';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Trigger shake animation for each field with error
      Object.keys(newErrors).forEach(field => {
        setIsShaking(prev => ({ ...prev, [field]: true }));
        setTimeout(() => {
          setIsShaking(prev => ({ ...prev, [field]: false }));
        }, 500);
      });
      return;
    }

    try {
      // Moderate all text fields
      const fieldsToModerate = ['title', 'description', 'offer', 'seek'];
      for (const field of fieldsToModerate) {
        const moderationResponse = await fetch('http://localhost:3001/api/moderate-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: form[field] })
        });

        const result = await moderationResponse.json();
        if (result.status === 'rejected') {
          setErrors(prev => ({
            ...prev,
            [field]: `This ${field} contains inappropriate content and cannot be submitted.`
          }));
          setIsShaking(prev => ({ ...prev, [field]: true }));
          setTimeout(() => {
            setIsShaking(prev => ({ ...prev, [field]: false }));
          }, 500);
          return;
        }
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('offer', form.offer);
      formData.append('seek', form.seek);
      formData.append('deadline', form.deadline);
      formData.append('serviceType', form.serviceType);
      if (form.serviceType === 'in-person') {
        formData.append('location', form.location);
      }
      if (form.file) {
        formData.append('file', form.file);
      }

      const response = await fetch('http://localhost:3001/api/services', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add service');
      }

      const data = await response.json();

      // If successful, show success message and reset form
      setSubmitted(true);
      setForm({
        title: '',
        description: '',
        category: '',
        offer: '',
        seek: '',
        deadline: '',
        file: null,
        serviceType: 'remote',
        location: ''
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding service:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to add service. Please try again.'
      }));
    }
  };

  return (
    <div className="addservice-container">
      <h1 className="addservice-title">Add New Service</h1>
      <div className="addservice-desc">Fill out the form below to offer a new service and find a matching collaborator.</div>
      <form className="addservice-form" onSubmit={handleSubmit}>
        <div>
          <div className="addservice-label">Service Title</div>
            <input
              className={`addservice-input ${errors.title ? 'input-error' : ''} ${isShaking.title ? 'shake' : ''}`}
              name="title"
              type="text"
              placeholder="e.g. Logo Design for Startups"
              value={form.title}
              onChange={handleChange}
              required
            />
            {errors.title && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.title}
              </div>
            )}
          </div>

        <div>
          <div className="addservice-label">Description</div>
            <textarea
              className={`addservice-textarea ${errors.description ? 'input-error' : ''} ${isShaking.description ? 'shake' : ''}`}
              name="description"
              placeholder="Describe your service and what you are looking for in exchange."
              value={form.description}
              onChange={handleChange}
              required
            />
            {errors.description && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.description}
              </div>
            )}
          </div>

        <div>
          <div className="addservice-label">Category</div>
          <select
            className="addservice-select"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="addservice-label">Service Type</div>
          <div className="service-type-container">
            <label className="service-type-option">
              <input
                type="radio"
                name="serviceType"
                value="remote"
                checked={form.serviceType === 'remote'}
                onChange={handleChange}
              />
              <span>Remote</span>
            </label>
            <label className="service-type-option">
              <input
                type="radio"
                name="serviceType"
                value="in-person"
                checked={form.serviceType === 'in-person'}
                onChange={handleChange}
              />
              <span>In-Person</span>
            </label>
          </div>
        </div>

        {form.serviceType === 'in-person' && (
          <div>
            <div className="addservice-label">Location</div>
            <input
              className={`addservice-input ${errors.location ? 'input-error' : ''} ${isShaking.location ? 'shake' : ''}`}
              name="location"
              type="text"
              placeholder="e.g. New York, NY"
              value={form.location}
              onChange={handleChange}
              required
            />
            {errors.location && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.location}
              </div>
            )}
          </div>
        )}

        <div>
          <div className="addservice-label">What are you offering?</div>
            <input
              className={`addservice-input ${errors.offer ? 'input-error' : ''} ${isShaking.offer ? 'shake' : ''}`}
              name="offer"
              type="text"
              placeholder="e.g. Logo Design"
              value={form.offer}
              onChange={handleChange}
              required
            />
            {errors.offer && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.offer}
              </div>
            )}
          </div>

        <div>
          <div className="addservice-label">What do you seek in exchange?</div>
            <input
              className={`addservice-input ${errors.seek ? 'input-error' : ''} ${isShaking.seek ? 'shake' : ''}`}
              name="seek"
              type="text"
              placeholder="e.g. Web Development"
              value={form.seek}
              onChange={handleChange}
              required
            />
            {errors.seek && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.seek}
              </div>
            )}
          </div>

        <div>
          <div className="addservice-label">Deadline</div>
          <input
            className="addservice-input"
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <div className="addservice-label">Attach a File (optional)</div>
          <input
            className="addservice-file"
            name="file"
            type="file"
            onChange={handleChange}
          />
        </div>

        <button className="addservice-btn" type="submit">Add Service</button>
        {submitted && <div className="addservice-success">Service submitted successfully!</div>}
        {errors.submit && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {errors.submit}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddService; 