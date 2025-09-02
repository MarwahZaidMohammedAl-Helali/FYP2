import React, { useState, useRef, useEffect } from 'react';
import {
  Star, Award, Globe, Camera,
  Github, Linkedin, Twitter, Layout, Eye, EyeOff, Save, X,
  Plus, Code, Sparkles, Instagram,
  Layers, Wand2, Music, Palette,
  Box, Sliders, Square, Move, Grid,
  Cloud, Sun, Droplets,
  Stars, Snowflake, Timer, MessageCircle,
  Users, Trash2, Type, PaintBucket,
  ImageIcon, FileText, Activity, Smile, Grip,
  Lock, Unlock, Mail, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Image, Quote,
  Heading1, Heading2, Heading3, Minus, Plus as PlusIcon,
  ChevronUp, ChevronDown, Edit3, Settings,
  Columns, LayoutGrid, Maximize, Minimize,
  RotateCw, Copy, Clipboard, Download, Upload,
  Zap, Heart, Coffee, Target, TrendingUp,
  DollarSign, Calendar, Clock, MapPin, Phone,
  Youtube, Facebook, Briefcase, Book, Cpu,
  Database, Server, Smartphone, Monitor, Wifi,
  Circle, HelpCircle, GripVertical, Edit2, Pencil,
  Check, Brush, Share2, ExternalLink, Loader2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Create an axios instance with specific config
const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const Profile = () => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [customizationTab, setCustomizationTab] = useState('theme');
  const [editingField, setEditingField] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [expandedFAQs, setExpandedFAQs] = useState({});
  const customizationPanelRef = useRef(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({});
  
  // Profile Theme State with enhanced options - integrated with database
  const [profileTheme, setProfileTheme] = useState({
    // From profile_themes table
    primaryColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    backgroundColor: '#ffffff',
    headingColor: '#1e293b',
    paragraphColor: '#475569',
    
    // From profile_typography table
    fontFamily: '"Quicksand", sans-serif',
    headingFont: '"Playfair Display", serif',
    bodyFont: '"Merriweather", serif',
    textAlign: 'left',
    headingTextDecoration: 'none',
    bodyTextDecoration: 'none',
    
    // From profile_visual_effects table
    backgroundAnimationEnabled: false,
    hoverEffectType: 'lift',
    borderRadiusSize: 'medium',
    shadowStyle: 'light',
    
    // From profile_customizations table
    themeColor: '#3b82f6',
    backgroundStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: 'rounded',
    
    // Additional UI state
    glassEffect: false,
    neonEffect: false,
    gradientAngle: 135,
    particleEffect: 'none',
    layoutType: 'modern',
    spacing: 'normal',
    containerWidth: 'default',
    animations: true,
    hoverEffects: true,
    transitionSpeed: '0.3s',
    sectionSpacing: '2rem',
    contentDensity: 'comfortable',
    backgroundAnimation: false,
    animationType: 'hearts'
  });

  // Individual text styles with enhanced options
  const [textStyles, setTextStyles] = useState({});

  // Animation variants for sections
  const animationVariants = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5 }
    }
  };

  // Update text style for individual elements
  const updateTextStyle = (elementId, style) => {
    setTextStyles(prev => ({
      ...prev,
      [elementId]: { ...prev[elementId], ...style }
    }));
  };

  // Toggle FAQ expansion
  const toggleFAQ = (faqId, section) => {
    if (section.settings.collapsible) {
      setExpandedFAQs(prev => ({
        ...prev,
        [faqId]: !prev[faqId]
      }));
    }
  };

  // Enhanced background options
  const backgroundOptions = [
    { value: 'white', label: 'Pure White', preview: '⬜' },
    { value: 'transparent', label: 'Transparent', preview: '🔲' },
    { value: '#f8fafc', label: 'Cool Gray', preview: '🌫️' },
    { value: '#fefce8', label: 'Warm Cream', preview: '🌤️' },
    { value: '#f0fdf4', label: 'Mint Fresh', preview: '🌿' },
    { value: '#fdf4ff', label: 'Lavender Mist', preview: '💜' },
    { value: '#1e293b', label: 'Dark Slate', preview: '🌑' },
    { value: '#0f172a', label: 'Midnight Blue', preview: '🌌' },
    { value: 'gradient1', label: 'Ocean Breeze', preview: '🌊' },
    { value: 'gradient2', label: 'Sunset Glow', preview: '🌅' },
    { value: 'gradient3', label: 'Aurora', preview: '🌈' },
    { value: 'gradient4', label: 'Forest Dawn', preview: '🌲' },
    { value: 'gradient5', label: 'Cosmic Dream', preview: '🌠' },
    { value: 'gradient6', label: 'Cherry Blossom', preview: '🌸' },
    { value: 'pattern1', label: 'Subtle Dots', preview: '⚪' },
    { value: 'pattern2', label: 'Grid Lines', preview: '📐' },
    { value: 'pattern3', label: 'Waves', preview: '〰️' },
    { value: 'glass', label: 'Frosted Glass', preview: '🧊' },
    { value: 'mesh1', label: 'Mesh Gradient', preview: '🎨' },
    { value: 'animated1', label: 'Floating Bubbles', preview: '🫧' }
  ];

  // Helper to get background style with enhanced gradients
  const getBackgroundStyle = (background) => {
    const backgroundMap = {
      'gradient1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'gradient2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'gradient3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'gradient4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'gradient5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'gradient6': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      'pattern1': `radial-gradient(circle, ${profileTheme.primaryColor}15 1px, transparent 1px)`,
      'pattern2': `linear-gradient(${profileTheme.primaryColor}05 1px, transparent 1px), linear-gradient(90deg, ${profileTheme.primaryColor}05 1px, transparent 1px)`,
      'pattern3': `radial-gradient(ellipse at top, ${profileTheme.primaryColor}10, transparent), radial-gradient(ellipse at bottom, ${profileTheme.secondaryColor}10, transparent)`,
      'glass': `rgba(255, 255, 255, 0.1)`,
      'mesh1': `radial-gradient(at 40% 20%, ${profileTheme.primaryColor}30 0px, transparent 50%), radial-gradient(at 80% 0%, ${profileTheme.secondaryColor}30 0px, transparent 50%), radial-gradient(at 0% 50%, ${profileTheme.accentColor}30 0px, transparent 50%)`,
      'animated1': `linear-gradient(45deg, ${profileTheme.primaryColor}10 25%, transparent 25%, transparent 75%, ${profileTheme.primaryColor}10 75%, ${profileTheme.primaryColor}10), linear-gradient(45deg, ${profileTheme.primaryColor}10 25%, transparent 25%, transparent 75%, ${profileTheme.primaryColor}10 75%, ${profileTheme.primaryColor}10)`
    };
    
    if (background === 'gradient') {
      return `linear-gradient(${profileTheme.gradientAngle}deg, ${profileTheme.primaryColor}, ${profileTheme.secondaryColor})`;
    }
    
    return backgroundMap[background] || background;
  };

  // Add this after your state declarations
useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await api.get('/api/check-session');
      console.log('Auth check:', response.data);
      if (!response.data.authenticated) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/login';
    }
  };
  
  checkAuth();
}, []);

  // Enhanced Editable Field Component with Save/Cancel buttons
  const EditableField = ({ 
    value, 
    onSave, 
    style = {}, 
    multiline = false, 
    placeholder = "Click to edit", 
    fieldId, 
    icon,
    fieldName,
    tableName 
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const [isHovered, setIsHovered] = useState(false);
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef(null);
    const fieldStyles = textStyles[fieldId] || {};
    
    useEffect(() => {
      setTempValue(value);
    }, [value]);
    
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        if (inputRef.current.select) {
          inputRef.current.select();
        }
      }
    }, [isEditing]);

    const handleSave = async () => {
  if (tempValue === value) {
    setIsEditing(false);
    setEditingField(null);
    return;
  }
  
  setIsSaving(true);
  setError('');
  
  try {
    // Call the moderation API
    const moderationResponse = await fetch('http://localhost:3001/api/moderate-text', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ text: tempValue }),
    });
    
    if (!moderationResponse.ok) {
      throw new Error(`Moderation request failed: ${moderationResponse.status}`);
    }
    
    const moderationResult = await moderationResponse.json();
    
    if (moderationResult.status === 'approved') {
      // If fieldName and tableName are provided, save to database
      if (fieldName && tableName) {
        const response = await fetch('http://localhost:3001/api/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            tableName: tableName.replace(/-/g, '_'),
            fieldName: fieldName,
            value: tempValue
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to save: ${response.status}`);
        }

        const data = await response.json();
        console.log('Save successful:', data);
      } else {
        // For non-database fields, just call onSave
        await onSave(tempValue);
      }
      
      setIsEditing(false);
      setEditingField(null);
      setError('');
      
      // Show save animation
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 2000);
    } else {
      setError("This text contains inappropriate content. Please revise it.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  } catch (e) {
    console.error('Save error:', e);
    setError(e.message || "Could not save changes. Please try again.");
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  } finally {
    setIsSaving(false);
  }
};
    const handleCancel = () => {
      setTempValue(value);
      setIsEditing(false);
      setEditingField(null);
      setError('');
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !multiline && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };

    const combinedStyle = {
      ...style,
      ...fieldStyles,
      color: fieldStyles.color || style.color,
      textAlign: fieldStyles.textAlign || style.textAlign,
      border: fieldStyles.border || 'none',
      borderRadius: fieldStyles.borderRadius || '4px',
      padding: fieldStyles.padding || '4px 8px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
    };

    if (!isCustomizing || previewMode) {
      return <span style={combinedStyle}>{value || placeholder}</span>;
    }

    if (isEditing && editingField === fieldId) {
      const inputStyle = {
        ...combinedStyle,
        width: '100%',
        border: `2px solid ${error ? '#ef4444' : profileTheme.primaryColor}`,
        borderRadius: '8px',
        padding: multiline ? '0.75rem' : '0.5rem 0.75rem',
        outline: 'none',
        background: 'rgba(255, 255, 255, 0.98)',
        color: '#1e293b',
        fontSize: style.fontSize || '1rem',
        fontFamily: style.fontFamily || profileTheme.bodyFont,
        boxShadow: `0 0 0 4px ${error ? '#ef444420' : `${profileTheme.primaryColor}20`}`,
        resize: multiline ? 'vertical' : 'none',
        minHeight: multiline ? '80px' : 'auto',
        animation: error ? undefined : 'pulse 2s infinite'
      };

      return (
        <div style={{ position: 'relative', width: '100%' }}>
          {multiline ? (
            <textarea
              ref={inputRef}
              value={tempValue}
              onChange={(e) => {
                setTempValue(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              className={isShaking ? 'shake' : ''}
              style={inputStyle}
              disabled={isSaving}
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={tempValue}
              onChange={(e) => {
                setTempValue(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              className={isShaking ? 'shake' : ''}
              style={inputStyle}
              disabled={isSaving}
            />
          )}
          
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            position: 'absolute',
            right: '0',
            top: multiline ? 'calc(100% + 0.5rem)' : '50%',
            transform: multiline ? 'none' : 'translateY(-50%)',
            paddingRight: '0.5rem'
          }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: profileTheme.primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                opacity: isSaving ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isSaving}
              style={{
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
            >
              <X size={14} />
              Cancel
            </button>
          </div>
          
          {error && (
            <div style={{
              position: 'absolute',
              bottom: multiline ? '-2rem' : '-1.75rem',
              left: '0',
              color: '#ef4444',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}
        </div>
      );
    }

    return (
      <span
        style={{
          ...combinedStyle,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          position: 'relative',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          background: isHovered ? `${profileTheme.primaryColor}05` : 'transparent'
        }}
        onClick={() => {
          setIsEditing(true);
          setEditingField(fieldId);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
        {value || placeholder}
        {isHovered && (
          <Pencil
            size={14}
            style={{
              marginLeft: '0.25rem',
              opacity: 0.5
            }}
          />
        )}
      </span>
    );
  };

  // Add new state for header, metrics and about me data from database
  const [headerData, setHeaderData] = useState({
    profile_picture_url: '',
    full_name: '',
    professional_title: '',
    tagline: ''
  });

  const [metricsData, setMetricsData] = useState({
    projects_count: 0,
    projects_growth: 0,
    awards_count: 0,
    awards_growth: 0,
    happy_clients_count: 0,
    happy_clients_percentage: 0,
    years_experience: 0,
    years_experience_plus: false
  });

  const [aboutMeData, setAboutMeData] = useState({
    bio: '',
    short_bio: '',
    interests: [],
    languages: {},
    career_objectives: '',
    personal_statement: '',
    key_skills: [],
    values_and_principles: '',
    availability_details: '',
    preferred_work_environment: ''
  });

  // Fetch all profile data from database
  const fetchAllProfileData = async () => {
    setIsLoading(true);
    try {
      // First check session and get user ID
      const authCheck = await fetch('http://localhost:3001/api/check-session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const authData = await authCheck.json();
      if (!authData.authenticated) {
        window.location.href = '/login';
        return;
      }

      const userId = authData.user.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Fetch profile headers first to ensure we have the profile picture
      const profileHeadersResponse = await fetch(`http://localhost:3001/api/profile-headers/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!profileHeadersResponse.ok) {
        throw new Error('Failed to fetch profile headers');
      }

      const headerData = await profileHeadersResponse.json();
      
      // Update header data with proper image URL
      if (headerData && headerData.profile_picture_url) {
        headerData.profile_picture_url = `http://localhost:3001${headerData.profile_picture_url}`;
      }
      setHeaderData(headerData || {});
      
      // Fetch remaining profile data in parallel
      const [
        metricsRes,
        aboutRes,
        themesRes,
        typographyRes,
        visualEffectsRes,
        customizationsRes,
        sectionsRes
      ] = await Promise.all([
        fetch(`http://localhost:3001/api/profile-metrics/${userId}`, { credentials: 'include' }).then(res => res.json()).catch(() => ({})),
        fetch(`http://localhost:3001/api/about-me/${userId}`, { credentials: 'include' }).then(res => res.json()).catch(() => ({})),
        fetch(`http://localhost:3001/api/profile-themes/${userId}`, { credentials: 'include' }).then(res => res.json()).catch(() => ({})),
        fetch(`http://localhost:3001/api/profile-typography/${userId}`, { credentials: 'include' }).then(res => res.json()).catch(() => ({})),
        fetch(`http://localhost:3001/api/profile-visual-effects/${userId}`, { credentials: 'include' }).then(res => res.json()).catch(() => ({})),
        fetch(`http://localhost:3001/api/profile-customizations/${userId}`, { credentials: 'include' }).then(res => res.json()).catch(() => ({})),
        fetch(`http://localhost:3001/api/profile-sections/${userId}`, { credentials: 'include' }).then(res => res.json()).catch(() => [])
      ]);

      // Set the remaining data
      setMetricsData(metricsRes || {});
      setAboutMeData(aboutRes || {});
      
      // Merge theme data
      setProfileTheme(prev => ({
        ...prev,
        ...(themesRes && {
          primaryColor: themesRes.primary_color || prev.primaryColor,
          secondaryColor: themesRes.secondary_color || prev.secondaryColor,
          backgroundColor: themesRes.background_color || prev.backgroundColor,
          headingColor: themesRes.heading_text_color || prev.headingColor,
          paragraphColor: themesRes.body_text_color || prev.paragraphColor,
        }),
        ...(typographyRes && {
          fontFamily: typographyRes.font_family || prev.fontFamily,
          textAlign: typographyRes.text_alignment || prev.textAlign,
          headingTextDecoration: typographyRes.heading_text_decoration || prev.headingTextDecoration,
          bodyTextDecoration: typographyRes.body_text_decoration || prev.bodyTextDecoration,
        }),
        ...(visualEffectsRes && {
          backgroundAnimationEnabled: visualEffectsRes.background_animation_enabled || false,
          backgroundAnimation: visualEffectsRes.background_animation_enabled || false,
          hoverEffectType: visualEffectsRes.hover_effect_type || prev.hoverEffectType,
          borderRadiusSize: visualEffectsRes.border_radius_size || prev.borderRadiusSize,
          shadowStyle: visualEffectsRes.shadow_style || prev.shadowStyle,
        }),
        ...(customizationsRes && {
          themeColor: customizationsRes.theme_color || prev.themeColor,
          fontFamily: customizationsRes.font_family || prev.fontFamily,
          backgroundStyle: customizationsRes.background_style || prev.backgroundStyle,
          borderRadius: customizationsRes.border_radius || prev.borderRadius,
        })
      }));

      // Process sections if they exist
      if (sectionsRes && sectionsRes.length > 0) {
        const processedSections = await Promise.all(
          sectionsRes.map(async (section) => {
            // Fetch section-specific content
            let content = {};
            
            switch (section.section_type) {
              case 'skills':
                const skillsRes = await fetch(`http://localhost:3001/api/skills/section/${section.id}`, { credentials: 'include' })
                  .then(res => res.json())
                  .catch(() => []);
                content = { skills: skillsRes };
                break;
              case 'projects':
                const projectsRes = await fetch(`http://localhost:3001/api/projects/section/${section.id}`, { credentials: 'include' })
                  .then(res => res.json())
                  .catch(() => []);
                content = { projects: projectsRes };
                break;
              case 'experience':
                const expRes = await fetch(`http://localhost:3001/api/work-experience/section/${section.id}`, { credentials: 'include' })
                  .then(res => res.json())
                  .catch(() => []);
                content = { entries: expRes };
                break;
              case 'education':
                const eduRes = await fetch(`http://localhost:3001/api/education/section/${section.id}`, { credentials: 'include' })
                  .then(res => res.json())
                  .catch(() => []);
                content = { entries: eduRes };
                break;
              case 'achievements':
                const achRes = await fetch(`http://localhost:3001/api/achievements/section/${section.id}`, { credentials: 'include' })
                  .then(res => res.json())
                  .catch(() => []);
                content = { achievements: achRes };
                break;
              case 'faq':
                const faqRes = await fetch(`http://localhost:3001/api/faqs/section/${section.id}`, { credentials: 'include' })
                  .then(res => res.json())
                  .catch(() => []);
                content = { faqs: faqRes };
                break;
            }

            // Fetch section customizations
            const customRes = await fetch(`http://localhost:3001/api/section-customizations/${section.id}`, { credentials: 'include' })
              .then(res => res.json())
              .catch(() => ({}));
            
            return {
              id: section.id,
              type: section.section_type,
              title: section.title,
              visible: section.is_visible,
              order: section.order_index,
              style: {
                ...(section.style_settings || {}),
                ...(customRes && {
                  background: customRes.background_color || 'white',
                  color: customRes.text_color,
                  borderStyle: customRes.border_style,
                  borderRadius: customRes.border_radius,
                  shadowStyle: customRes.shadow_style,
                })
              },
              settings: section.style_settings?.settings || {},
              content
            };
          })
        );
        
        setSections(processedSections.sort((a, b) => a.order - b.order));
        setCustomSections([]); // Clear custom sections as they're now in sections
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
      setErrorNotification({
        show: true,
        message: "Failed to load profile data. Please try again later."
      });
      setTimeout(() => setErrorNotification({ show: false, message: '' }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Centralized function to handle moderation and saving
const saveWithModeration = async (text, fieldName, tableName) => {
  try {
    // Check authentication
    const authCheck = await fetch('http://localhost:3001/api/check-session', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const authData = await authCheck.json();
    if (!authData.authenticated) {
      window.location.href = '/login';
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    if (!userId) {
      throw new Error('User ID not found');
    }

    // Step 1: Moderate the text
    console.log('Moderating text:', text);
    const moderationResponse = await fetch('http://localhost:3001/api/moderate-text', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    const moderationData = await moderationResponse.json();
    if (moderationData.status !== 'approved') {
      throw new Error('This text contains inappropriate content. Please revise it.');
    }
    
    // Step 2: Save to database using the new simplified endpoint
    console.log('Saving to database:', { fieldName, tableName, userId });
    const response = await fetch('http://localhost:3001/api/update-profile', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tableName: tableName.replace(/-/g, '_'), // Convert kebab-case to snake_case
        fieldName: fieldName,
        value: text,
        userId: userId
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Save successful!', data);
    return data;
  } catch (error) {
    console.error('Save with moderation error:', error);
    if (error.response?.status === 401) {
      window.location.href = '/login';
      return;
    }
    throw error;
  }
};

// Updated updateProfileData function
const updateProfileData = async (value, fieldName, tableName) => {
  try {
    // Use the centralized save function
    await saveWithModeration(value, fieldName, tableName);
    
    // Update local state based on table
    switch (tableName) {
      case 'profile-headers':
        setHeaderData(prev => ({ ...prev, [fieldName]: value }));
        break;
      case 'profile-metrics':
        setMetricsData(prev => ({ ...prev, [fieldName]: value }));
        break;
      case 'about-me':
        setAboutMeData(prev => ({ ...prev, [fieldName]: value }));
        break;
      case 'profile-themes':
        setProfileTheme(prev => ({ ...prev, [fieldName]: value }));
        break;
      case 'profile-typography':
        setProfileTheme(prev => ({ ...prev, [fieldName]: value }));
        break;
      case 'profile-visual-effects':
        setProfileTheme(prev => ({ ...prev, [fieldName]: value }));
        break;
    }
  } catch (error) {
    console.error('Update profile data error:', error);
    throw error;
  }
};
  // Update section data
  const updateSectionData = async (sectionId, contentType, contentId, fieldName, value) => {
    const endpoint = `/api/${contentType}/${contentId}`;
    
    try {
      await axios.patch(endpoint, { [fieldName]: value });
      
      // Update local state
      const updateFn = (sections) => sections.map(section => {
        if (section.id === sectionId) {
          const updatedContent = { ...section.content };
          
          // Find and update the specific item
          if (contentType === 'skills' || contentType === 'projects' || 
              contentType === 'achievements' || contentType === 'faqs') {
            const items = updatedContent[contentType] || [];
            const index = items.findIndex(item => item.id === contentId);
            if (index !== -1) {
              items[index] = { ...items[index], [fieldName]: value };
            }
          } else if (contentType === 'work-experience' || contentType === 'education') {
            const entries = updatedContent.entries || [];
            const index = entries.findIndex(entry => entry.id === contentId);
            if (index !== -1) {
              entries[index] = { ...entries[index], [fieldName]: value };
            }
          }
          
          return { ...section, content: updatedContent };
        }
        return section;
      });

      setSections(prev => updateFn(prev));
      setCustomSections(prev => updateFn(prev));
      
    } catch (error) {
      console.error('Error updating section data:', error);
      throw error;
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchAllProfileData();
  }, []);

  // Add error state
  const [errorNotification, setErrorNotification] = useState({ show: false, message: '' });

  // Update handleAvatarUpload function
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create object URL for immediate preview
    const previewUrl = URL.createObjectURL(file);
    
    if (file.size > 5000000) {
      setErrorNotification({
        show: true,
        message: 'Image size should be less than 5MB'
      });
      setTimeout(() => setErrorNotification({ show: false, message: '' }), 3000);
      URL.revokeObjectURL(previewUrl);
      return;
    }

    setIsAvatarUploading(true);
    
    try {
      // Create FormData for the upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload and moderate the image
      const response = await fetch('http://localhost:3001/api/upload-profile-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      if (result.status === 'approved') {
        // Update with the actual server URL
        const fullImageUrl = `http://localhost:3001${result.url}`;
        setHeaderData(prev => ({
          ...prev,
          profile_picture_url: fullImageUrl
        }));
        
        // Show success notification
        setShowSaveNotification(true);
        setTimeout(() => setShowSaveNotification(false), 2000);
      } else {
        // Show error if image is rejected
        setErrorNotification({
          show: true,
          message: result.reason || "This image was flagged as inappropriate and cannot be used."
        });
        setTimeout(() => setErrorNotification({ show: false, message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      setErrorNotification({
        show: true,
        message: "Could not upload the image. Please try again later."
      });
      setTimeout(() => setErrorNotification({ show: false, message: '' }), 3000);
    } finally {
      setIsAvatarUploading(false);
      URL.revokeObjectURL(previewUrl);
      event.target.value = '';
    }
  };

  // Sections State - now integrated with database
  const [sections, setSections] = useState([
    {
      id: 'header',
      type: 'header',
      visible: true,
      locked: false,
      order: 0,
      animation: 'fadeIn',
      style: {
        padding: '4rem 2rem',
        margin: '0',
        background: 'gradient',
        borderRadius: 'inherit',
        textAlign: 'center'
      },
      settings: {
        showAvatar: true,
        avatarSize: 140,
        avatarShape: 'circle',
        avatarBorder: true,
        showName: true,
        showTitle: true,
        showStats: true,
        showSocial: true,
        layout: 'centered',
        statsLayout: 'grid'
      },
      content: {
        stats: [
          { 
            label: 'Projects', 
            value: '0', 
            icon: '💼', 
            trend: '' 
          },
          { 
            label: 'Awards', 
            value: '0', 
            icon: '🏆', 
            trend: '' 
          },
          { 
            label: 'Happy Clients', 
            value: '0', 
            icon: '😊', 
            trend: '' 
          },
          { 
            label: 'Years Experience', 
            value: '0', 
            icon: '⭐', 
            trend: '' 
          }
        ],
        social: [],
      }
    },
    {
      id: 'bio',
      type: 'bio',
      title: 'About Me',
      visible: true,
      locked: false,
      order: 1,
      animation: 'slideIn',
      style: {
        padding: '3rem',
        margin: '0 0 2rem 0',
        background: 'white',
        borderRadius: 'inherit'
      },
      settings: {
        showTitle: true,
        titleSize: 'h2',
        showQuote: true,
        showSkillTags: true,
        columns: 1,
        showReadMore: true
      },
      content: {
        text: '',
      }
    }
  ]);

  // Custom Sections
  const [customSections, setCustomSections] = useState([]);

  // Enhanced font options with distinctive styles
  const fontOptions = [
    { value: '"Playfair Display", serif', label: 'Playfair Display', preview: 'Elegant & Editorial' },
    { value: '"Merriweather", serif', label: 'Merriweather', preview: 'Classic Serif' },
    { value: '"Oswald", sans-serif', label: 'Oswald', preview: 'Bold & Modern' },
    { value: '"Quicksand", sans-serif', label: 'Quicksand', preview: 'Soft & Friendly' },
    { value: '"Abril Fatface", display', label: 'Abril Fatface', preview: 'Dramatic Display' },
    { value: '"Crimson Pro", serif', label: 'Crimson Pro', preview: 'Refined Serif' },
    { value: '"Bebas Neue", sans-serif', label: 'Bebas Neue', preview: 'Strong Impact' },
    { value: '"Cormorant Garamond", serif', label: 'Cormorant', preview: 'Luxury Serif' }
  ];

  // Section types
  const sectionTypes = [
    { type: 'projects', name: 'Projects Gallery', icon: Grid, color: '#3b82f6' },
    { type: 'experience', name: 'Work Experience', icon: Briefcase, color: '#8b5cf6' },
    { type: 'education', name: 'Education', icon: Book, color: '#10b981' },
    { type: 'skills', name: '⚡ Skills', icon: Zap, color: '#06b6d4' },
    { type: 'achievements', name: 'Achievements', icon: Award, color: '#f59e0b' },
    { type: 'testimonials', name: '💬 Testimonials', icon: MessageCircle, color: '#ec4899' },
    { type: 'faq', name: 'FAQ Section', icon: HelpCircle, color: '#84cc16' },
  ];

  // Apply dark mode theme
  useEffect(() => {
    if (profileTheme.backgroundColor === '#1e293b' || profileTheme.backgroundColor === '#0f172a') {
      setProfileTheme(prev => ({
        ...prev,
        headingColor: '#f1f5f9',
        paragraphColor: '#cbd5e1'
      }));
    }
  }, [profileTheme.backgroundColor]);

  // Helper functions
  const updateSection = (sectionId, updates) => {
    if (sectionId.startsWith('custom-')) {
      setCustomSections(customSections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      ));
    } else {
      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      ));
    }
  };

  const updateSectionStyle = (sectionId, styleKey, value) => {
    const updateFn = (s) => s.id === sectionId ? {
      ...s,
      style: { ...s.style, [styleKey]: value }
    } : s;
    
    if (sectionId.startsWith('custom-')) {
      setCustomSections(customSections.map(updateFn));
    } else {
      setSections(sections.map(updateFn));
    }
  };

  const updateSectionSettings = (sectionId, settingKey, value) => {
    const updateFn = (s) => s.id === sectionId ? {
      ...s,
      settings: { ...s.settings, [settingKey]: value }
    } : s;
    
    if (sectionId.startsWith('custom-')) {
      setCustomSections(customSections.map(updateFn));
    } else {
      setSections(sections.map(updateFn));
    }
  };

  const updateSectionContent = (sectionId, contentKey, value) => {
    const updateFn = (s) => s.id === sectionId ? {
      ...s,
      content: { ...s.content, [contentKey]: value }
    } : s;
    
    if (sectionId.startsWith('custom-')) {
      setCustomSections(customSections.map(updateFn));
    } else {
      setSections(sections.map(updateFn));
    }
  };

  // Add custom section with enhanced defaults
  const addCustomSection = (type) => {
    const sectionType = sectionTypes.find(s => s.type === type);
    let newSection = {
      id: `custom-${Date.now()}`,
      type: type,
      title: sectionType.name,
      visible: true,
      locked: false,
      order: sections.length + customSections.length,
      animation: 'fadeIn',
      style: {
        padding: '3rem',
        margin: '0 0 2rem 0',
        background: 'white',
        borderRadius: 'inherit',
        textAlign: 'left'
      },
      settings: {
        showTitle: true,
        titleSize: 'h2',
        showSectionTitle: true
      },
      content: {}
    };

    // Enhanced content for each section type
    switch (type) {
      case 'projects':
        newSection.content = {
          projects: [
            { 
              id: Date.now() + 1,
              title: 'E-Commerce Redesign', 
              description: 'Complete overhaul of an online shopping platform, increasing conversion by 35%.', 
              date: '2024',
              image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
              url: 'https://example.com/project1',
              tags: ['UI/UX', 'React', 'Node.js'],
              metrics: { views: '10K', likes: '1.2K' }
            },
            { 
              id: Date.now() + 2,
              title: 'Banking App UI', 
              description: 'Modern banking application with focus on security and user experience.', 
              date: '2024',
              image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop',
              url: 'https://example.com/project2',
              tags: ['Mobile', 'Figma', 'Swift'],
              metrics: { downloads: '50K', rating: '4.8' }
            }
          ]
        };
        newSection.settings = { 
          layout: 'cards',
          showImages: true, 
          showDescription: true, 
          showDate: true,
          showTags: true,
          showMetrics: true,
          hoverEffect: 'lift'
        };
        break;
        
      case 'experience':
        newSection.content = {
          entries: [
            { 
              id: Date.now() + 1,
              title: 'Senior Product Designer', 
              company: 'Tech Innovations Inc.',
              location: 'San Francisco, CA',
              date: '2022 - Present', 
              description: 'Leading design initiatives for flagship products, managing a team of 5 designers.',
              achievements: [
                'Increased user engagement by 45% through redesign',
                'Established company-wide design system',
                'Mentored 3 junior designers'
              ],
              logo: '🏢'
            },
            { 
              id: Date.now() + 2,
              title: 'Product Designer', 
              company: 'StartupXYZ',
              location: 'Remote',
              date: '2020 - 2022', 
              description: 'Designed user experiences for mobile and web applications.',
              achievements: [
                'Led the design of 3 major product features',
                'Improved app store rating from 3.5 to 4.7 stars'
              ],
              logo: '🚀'
            }
          ]
        };
        newSection.settings = { 
          showDates: true, 
          showLocation: true,
          showCompany: true,
          showAchievements: true,
          timeline: true
        };
        break;
        
      case 'education':
        newSection.content = {
          entries: [
            { 
              id: Date.now() + 1,
              degree: 'Master of Design', 
              field: 'Human-Computer Interaction',
              institution: 'Carnegie Mellon University',
              location: 'Pittsburgh, PA',
              date: '2020', 
              description: 'Focused on user research, interaction design, and design thinking.',
              gpa: '3.9/4.0',
              honors: ['Dean\'s List', 'Best Thesis Award'],
              logo: '🎓'
            }
          ]
        };
        newSection.settings = { 
          showYear: true, 
          showLocation: true,
          showGPA: true,
          showHonors: true,
          showLogo: true
        };
        break;
        
      case 'achievements':
        newSection.content = {
          achievements: [
            { 
              id: Date.now() + 1,
              title: 'Design Excellence Award', 
              date: '2024', 
              description: 'Recognized for outstanding contribution to product design.',
              icon: 'trophy',
              issuer: 'International Design Association',
              link: 'https://example.com/award'
            },
            { 
              id: Date.now() + 2,
              title: 'Featured Speaker at Design Conference', 
              date: '2023', 
              description: 'Presented on "The Future of Design Systems" to 500+ attendees.',
              icon: 'mic',
              issuer: 'DesignCon 2023',
              link: 'https://example.com/talk'
            }
          ]
        };
        newSection.settings = { 
          layout: 'timeline',
          showDate: true,
          showDescription: true,
          showIssuer: true,
          showLink: true
        };
        break;
        
      case 'skills':
        newSection.content = {
          skills: [
            { 
              id: Date.now() + 1,
              name: 'React & JavaScript', 
              level: 90,
              category: 'Frontend',
              icon: '⚛️',
              description: 'Advanced proficiency in React, Redux, and modern JavaScript'
            },
            { 
              id: Date.now() + 2,
              name: 'UI/UX Design', 
              level: 85,
              category: 'Design',
              icon: '🎨',
              description: 'Expert in Figma, Adobe Creative Suite, and design systems'
            },
            { 
              id: Date.now() + 3,
              name: 'Node.js & APIs', 
              level: 80,
              category: 'Backend',
              icon: '🔧',
              description: 'Building scalable server-side applications and REST APIs'
            }
          ]
        };
        newSection.settings = { 
          layout: 'cards',
          showLevel: true,
          showCategory: true,
          showIcon: true,
          showDescription: true,
          skillBarStyle: 'modern'
        };
        break;
        
      case 'testimonials':
        newSection.content = {
          testimonials: [
            { 
              id: Date.now() + 1,
              name: 'Sarah Johnson',
              role: 'Product Manager',
              company: 'TechCorp',
              image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
              content: 'Exceptional work quality and attention to detail. Delivered beyond expectations and was a pleasure to work with.',
              rating: 5,
              date: '2024'
            },
            { 
              id: Date.now() + 2,
              name: 'Michael Chen',
              role: 'CEO',
              company: 'StartupXYZ',
              image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              content: 'Transformed our entire user experience. The redesign resulted in a 40% increase in user engagement.',
              rating: 5,
              date: '2024'
            }
          ]
        };
        newSection.settings = { 
          layout: 'carousel',
          showRating: true,
          showDate: true,
          showCompany: true,
          showImage: true,
          autoplay: false
        };
        break;
        
      case 'faq':
        newSection.content = {
          faqs: [
            { 
              id: Date.now() + 1,
              question: 'What is your design process?', 
              answer: 'I follow a user-centered design process that includes research, ideation, prototyping, testing, and iteration. I believe in close collaboration with stakeholders throughout the process.',
              category: 'Process'
            },
            { 
              id: Date.now() + 2,
              question: 'Do you work with international clients?', 
              answer: 'Yes! I work with clients globally and am experienced in remote collaboration across different time zones.',
              category: 'General'
            }
          ]
        };
        newSection.settings = { 
          collapsible: true,
          showCategories: true,
          layout: 'accordion'
        };
        break;
        
      default:
        break;
    }
    
    setCustomSections([...customSections, newSection]);
    
    // Scroll to the new section after it's added
    setTimeout(() => {
      const sectionElement = document.getElementById(`section-${newSection.id}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    
    setSelectedSection(newSection.id);
    setCustomizationTab('editor');
  };

  const removeSection = (sectionId) => {
    setCustomSections(customSections.filter(s => s.id !== sectionId));
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  };

  const moveSection = (sectionId, direction) => {
    const allSections = [...sections, ...customSections].sort((a, b) => a.order - b.order);
    const currentIndex = allSections.findIndex(s => s.id === sectionId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up'
      ? Math.max(0, currentIndex - 1)
      : Math.min(allSections.length - 1, currentIndex + 1);
    
    if (currentIndex === newIndex) return;
    
    // Prevent moving sections above header (order 0) and bio (order 1)
    const currentSection = allSections[currentIndex];
    const targetSection = allSections[newIndex];
    
    // Don't allow any section to move above bio (order 1)
    if (direction === 'up' && targetSection.order <= 1) return;
    
    // Don't allow header or bio to be moved down
    if ((currentSection.id === 'header' || currentSection.id === 'bio') && direction === 'down') return;
    
    // Swap the sections
    [allSections[currentIndex], allSections[newIndex]] = [allSections[newIndex], allSections[currentIndex]];
    
    // Reassign order values
    allSections.forEach((section, index) => {
      section.order = index;
    });
    
    // Update both arrays
    const updatedSections = allSections.filter(s => !s.id.startsWith('custom-'));
    const updatedCustomSections = allSections.filter(s => s.id.startsWith('custom-'));
    
    setSections(updatedSections);
    setCustomSections(updatedCustomSections);
  };

  // Handle project image upload
  const handleProjectImageUpload = (sectionId, projectId, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentSection = [...sections, ...customSections].find(s => s.id === sectionId);
        if (currentSection) {
          const projects = [...currentSection.content.projects];
          const projectIndex = projects.findIndex(p => p.id === projectId);
          if (projectIndex !== -1) {
            projects[projectIndex].image = reader.result;
            updateSectionContent(sectionId, 'projects', projects);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Enhanced Section Component with all features
  const Section = ({ section, isEditing }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isDark = profileTheme.backgroundColor === '#1e293b' || profileTheme.backgroundColor === '#0f172a';
    
    const renderSectionTitle = () => {
      if (!section.settings.showTitle) return null;
      
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: profileTheme.headingColor,
            margin: 0,
            fontFamily: profileTheme.headingFont
          }}>
            {isEditing ? (
              <EditableField
                value={section.title}
                onSave={(value) => updateSection(section.id, { title: value })}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: profileTheme.headingColor
                }}
              />
            ) : section.title}
          </h2>
          {section.type === 'skills' && <Sparkles size={20} color={profileTheme.primaryColor} />}
          {section.type === 'experience' && <Briefcase size={20} color={profileTheme.primaryColor} />}
          {section.type === 'education' && <Book size={20} color={profileTheme.primaryColor} />}
          {section.type === 'projects' && <Code size={20} color={profileTheme.primaryColor} />}
          {section.type === 'achievements' && <Award size={20} color={profileTheme.primaryColor} />}
          {section.type === 'testimonials' && <MessageCircle size={20} color={profileTheme.primaryColor} />}
          {section.type === 'contact' && <Mail size={20} color={profileTheme.primaryColor} />}
        </div>
      );
    };
    
    const sectionStyle = {
      background: section.type === 'header'
        ? (section.style.background === 'gradient'
            ? `linear-gradient(${profileTheme.gradientAngle}deg, ${profileTheme.primaryColor}, ${profileTheme.secondaryColor})`
            : getBackgroundStyle(section.style.background))
        : getBackgroundStyle(section.style.background),
      backgroundSize: section.style.background?.includes('pattern') ? '20px 20px' : 
                      section.style.background?.includes('mesh') ? '100% 100%' : 'cover',
      backdropFilter: (profileTheme.glassEffect || section.style.background === 'glass') ? 'blur(20px)' : 'none',
      borderRadius: '20px',
      padding: section.type === 'header' ? '2rem' : '2.5rem',
      margin: section.type === 'header' ? '0 0 2rem 0' : '0 0 1.5rem 0',
      textAlign: section.style.textAlign,
      boxShadow: selectedSection === section.id && isEditing 
        ? `0 0 0 3px ${profileTheme.primaryColor}, 0 10px 40px rgba(0,0,0,0.08)`
        : '0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)',
      position: 'relative',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: section.visible ? 1 : 0.3,
      transform: isHovered && profileTheme.hoverEffects ? 'translateY(-4px)' : 'translateY(0)',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      fontFamily: profileTheme.bodyFont,
      // Mobile responsiveness
      '@media (max-width: 768px)': {
        padding: section.type === 'header' ? '1.5rem' : '2rem',
        margin: '0 0 1rem 0',
        borderRadius: '16px'
      },
      ...(section.animation && profileTheme.animations && animationVariants[section.animation].animate)
    };

    const renderSectionContent = () => {
      switch (section.type) {
        case 'header':
          return (
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
              alignItems: 'center',
              gap: window.innerWidth <= 768 ? '1.5rem' : '2rem',
              padding: window.innerWidth <= 768 ? '1.5rem' : (isCustomizing ? '2rem' : '2.5rem'),
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
              borderRadius: '20px',
              justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              backdropFilter: 'blur(20px)',
              textAlign: window.innerWidth <= 768 ? 'center' : 'left'
            }}>
              {section.settings.showAvatar && (
                <div style={{
                  position: 'relative',
                  width: section.settings.avatarSize || '140px',
                  height: section.settings.avatarSize || '140px',
                  borderRadius: section.settings.avatarShape === 'circle' ? '50%' : '20%',
                  overflow: 'hidden',
                  border: section.settings.avatarBorder ? `4px solid ${profileTheme.primaryColor}` : 'none',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  background: '#f3f4f6' // Add background color for smoother transitions
                }}>
                  <img
                    key={headerData.profile_picture_url} // Force re-render when URL changes
                    src={headerData.profile_picture_url || '/default-avatar.png'}
                    alt={headerData.full_name || 'Profile Picture'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: isAvatarUploading ? 0.5 : 1,
                      transition: 'all 0.3s ease',
                      transform: isAvatarUploading ? 'scale(0.95)' : 'scale(1)' // Add subtle scale effect during upload
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  {isAvatarUploading && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      zIndex: 2
                    }}>
                      <Loader2 
                        size={24} 
                        style={{
                          animation: 'spin 1s linear infinite',
                          color: profileTheme.primaryColor
                        }}
                      />
                      <span style={{ 
                        fontSize: '0.75rem',
                        color: profileTheme.primaryColor,
                        fontWeight: '500',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        Uploading...
                      </span>
                    </div>
                  )}
                  {isCustomizing && !isAvatarUploading && (
                    <label
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(4px)',
                        zIndex: 3
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = profileTheme.primaryColor;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Camera size={16} />
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                        // Reset the input value to allow uploading the same file again
                        onClick={(e) => { e.target.value = null }}
                      />
                    </label>
                  )}
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                {section.settings.showName && (
                  <EditableField
                    value={headerData.full_name}
                    onSave={updateProfileData}
                    fieldName="full_name"
                    tableName="profile-headers"
                    fieldId="header-name"
                    style={{ 
                      fontSize: '2rem', 
                      fontWeight: 'bold',
                      color: profileTheme.headingColor,
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}
                    placeholder="Your Name"
                  />
                )}
                
                {section.settings.showTitle && (
                  <EditableField
                    value={headerData.professional_title}
                    onSave={updateProfileData}
                    fieldName="professional_title"
                    tableName="profile-headers"
                    fieldId="header-title"
                    style={{ 
                      fontSize: '1.25rem', 
                      color: profileTheme.primaryColor,
                      marginBottom: '0.5rem',
                      display: 'block',
                      fontWeight: '500'
                    }}
                    placeholder="Your Professional Title"
                  />
                )}
                
                <EditableField
                  value={headerData.tagline}
                  onSave={updateProfileData}
                  fieldName="tagline"
                  tableName="profile-headers"
                  fieldId="header-tagline"
                  style={{ 
                    fontSize: '1rem', 
                    fontStyle: 'italic',
                    color: profileTheme.paragraphColor,
                    display: 'block',
                    opacity: 0.9
                  }}
                  placeholder="Your Tagline"
                />
                
                {section.settings.showStats && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '2rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                        💼 <EditableField
                          value={metricsData.projects_count?.toString() || '0'}
                          onSave={(value) => updateProfileData(parseInt(value), 'projects_count', 'profile-metrics')}
                          fieldName="projects_count"
                          tableName="profile-metrics"
                          fieldId="metric-projects"
                          style={{ fontSize: '2rem', fontWeight: '700' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.875rem', color: profileTheme.paragraphColor }}>
                        Projects
                        {metricsData.projects_growth > 0 && (
                          <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>
                            +{metricsData.projects_growth}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                        🏆 <EditableField
                          value={metricsData.awards_count?.toString() || '0'}
                          onSave={(value) => updateProfileData(parseInt(value), 'awards_count', 'profile-metrics')}
                          fieldName="awards_count"
                          tableName="profile-metrics"
                          fieldId="metric-awards"
                          style={{ fontSize: '2rem', fontWeight: '700' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.875rem', color: profileTheme.paragraphColor }}>
                        Awards
                        {metricsData.awards_growth > 0 && (
                          <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>
                            +{metricsData.awards_growth}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                        😊 <EditableField
                          value={metricsData.happy_clients_count?.toString() || '0'}
                          onSave={(value) => updateProfileData(parseInt(value), 'happy_clients_count', 'profile-metrics')}
                          fieldName="happy_clients_count"
                          tableName="profile-metrics"
                          fieldId="metric-clients"
                          style={{ fontSize: '2rem', fontWeight: '700' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.875rem', color: profileTheme.paragraphColor }}>
                        Happy Clients
                        {metricsData.happy_clients_percentage > 0 && (
                          <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>
                            {metricsData.happy_clients_percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                        ⭐ <EditableField
                          value={
                            metricsData.years_experience_plus 
                              ? `${metricsData.years_experience}+`
                              : metricsData.years_experience?.toString() || '0'
                          }
                          onSave={(value) => {
                            const hasPlus = value.includes('+');
                            const years = parseInt(value.replace('+', ''));
                            updateProfileData(years, 'years_experience', 'profile-metrics');
                            if (hasPlus !== metricsData.years_experience_plus) {
                              updateProfileData(hasPlus, 'years_experience_plus', 'profile-metrics');
                            }
                          }}
                          fieldName="years_experience"
                          tableName="profile-metrics"
                          fieldId="metric-experience"
                          style={{ fontSize: '2rem', fontWeight: '700' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.875rem', color: profileTheme.paragraphColor }}>Years Experience</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
          
        case 'bio':
          return (
            <>
              {section.settings.showTitle && (
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  marginBottom: '2rem',
                  color: profileTheme.headingColor,
                  fontFamily: profileTheme.headingFont,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <span style={{
                    width: '4px',
                    height: '32px',
                    background: profileTheme.primaryColor,
                    borderRadius: '2px'
                  }} />
                  {section.title}
                </h2>
              )}
              
              {section.settings.showQuote && section.content.quote && (
                <div style={{
                  fontSize: '1.25rem',
                  fontStyle: 'italic',
                  color: profileTheme.primaryColor,
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  background: `${profileTheme.primaryColor}05`,
                  borderLeft: `4px solid ${profileTheme.primaryColor}`,
                  borderRadius: '8px',
                  position: 'relative'
                }}>
                  <Quote size={24} style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '20px',
                    background: section.style.background || 'white',
                    padding: '0 8px',
                    color: profileTheme.primaryColor
                  }} />
                  {section.content.quote}
                </div>
              )}
              
              <EditableField
                value={aboutMeData.bio || section.content.text}
                onSave={updateProfileData}
                fieldName="bio"
                tableName="about-me"
                fieldId={`${section.id}-text`}
                multiline={true}
                style={{
                  color: profileTheme.paragraphColor,
                  fontFamily: profileTheme.bodyFont,
                  display: 'block',
                  lineHeight: '1.8',
                  fontSize: '1.0625rem',
                  whiteSpace: 'pre-wrap'
                }}
                placeholder="Write about yourself..."
              />
              
              {section.settings.showSkillTags && aboutMeData.key_skills && aboutMeData.key_skills.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginTop: '2rem'
                }}>
                  {aboutMeData.key_skills.map((skill, i) => (
                    <span key={i} style={{
                      padding: '0.5rem 1rem',
                      background: `${profileTheme.primaryColor}10`,
                      color: profileTheme.primaryColor,
                      borderRadius: '100px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      border: `1px solid ${profileTheme.primaryColor}20`,
                      transition: 'all 0.3s ease',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = profileTheme.primaryColor;
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${profileTheme.primaryColor}10`;
                      e.currentTarget.style.color = profileTheme.primaryColor;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </>
          );
          
        case 'skills':
          const SkillCard = ({ skill }) => (
            <div style={{
              padding: '1.5rem',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
              borderRadius: '16px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = profileTheme.primaryColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
            }}>
              {section.settings.showIcon && (
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    background: `linear-gradient(135deg, ${profileTheme.primaryColor}20, ${profileTheme.secondaryColor}20)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    cursor: isEditing ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (isEditing) {
                      const icons = ['⚡', '🎯', '💡', '🚀', '🎨', '💻', '📱', '🔧', '📊', '🎮', '🎬', '📝'];
                      const currentIndex = icons.indexOf(skill.icon);
                      const nextIcon = icons[(currentIndex + 1) % icons.length];
                      const updatedSkills = section.content.skills.map(s => 
                        s.id === skill.id ? { ...s, icon: nextIcon } : s
                      );
                      updateSectionContent(section.id, 'skills', updatedSkills);
                    }
                  }}
                >
                  {skill.icon}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: profileTheme.headingColor,
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {isEditing ? (
                      <EditableField
                        value={skill.name}
                        onSave={(value) => {
                          if (skill.db_id) {
                            updateSectionData(section.id, 'skills', skill.db_id, 'name', value);
                          } else {
                            const updatedSkills = section.content.skills.map(s => 
                              s.id === skill.id ? { ...s, name: value } : s
                            );
                            updateSectionContent(section.id, 'skills', updatedSkills);
                          }
                        }}
                        fieldName={skill.db_id ? "name" : null}
                        tableName={skill.db_id ? "skills" : null}
                        fieldId={`skill-${skill.id}-name`}
                        style={{ fontSize: '1.125rem', fontWeight: '600', color: profileTheme.headingColor }}
                      />
                    ) : skill.name}
                  </h3>
                  <div 
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: `${profileTheme.primaryColor}10`,
                      color: profileTheme.primaryColor,
                      borderRadius: '100px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: isEditing ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (isEditing) {
                        const categories = ['Frontend', 'Backend', 'Design', 'DevOps', 'Mobile', 'Database', 'AI/ML', 'Other'];
                        const currentIndex = categories.indexOf(skill.category);
                        const nextCategory = categories[(currentIndex + 1) % categories.length];
                        if (skill.db_id) {
                          updateSectionData(section.id, 'skills', skill.db_id, 'category', nextCategory);
                        } else {
                          const updatedSkills = section.content.skills.map(s => 
                            s.id === skill.id ? { ...s, category: nextCategory } : s
                          );
                          updateSectionContent(section.id, 'skills', updatedSkills);
                        }
                      }
                    }}
                  >
                    {skill.category}
                  </div>
                </div>
                <div style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.875rem',
                  color: profileTheme.paragraphColor,
                  opacity: 0.8,
                  lineHeight: '1.5'
                }}>
                  {isEditing ? (
                    <EditableField
                      value={skill.description}
                      onSave={(value) => {
                        if (skill.db_id) {
                          updateSectionData(section.id, 'skills', skill.db_id, 'description', value);
                        } else {
                          const updatedSkills = section.content.skills.map(s => 
                            s.id === skill.id ? { ...s, description: value } : s
                          );
                          updateSectionContent(section.id, 'skills', updatedSkills);
                        }
                      }}
                      fieldName={skill.db_id ? "description" : null}
                      tableName={skill.db_id ? "skills" : null}
                      fieldId={`skill-${skill.id}-description`}
                      style={{ fontSize: '0.875rem', color: profileTheme.paragraphColor }}
                      multiline={true}
                    />
                  ) : skill.description}
                </div>
              </div>
              {isEditing && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      const updatedSkills = section.content.skills.filter(s => s.id !== skill.id);
                      updateSectionContent(section.id, 'skills', updatedSkills);
                    }}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          );
          
          return (
            <>
              {renderSectionTitle()}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                {isEditing && (
                  <button
                    onClick={() => {
                      const newSkill = {
                        id: Date.now(),
                        name: 'New Skill',
                        icon: '⚡',
                        category: 'Category',
                        description: 'Click to edit description'
                      };
                      const updatedSkills = [...section.content.skills, newSkill];
                      updateSectionContent(section.id, 'skills', updatedSkills);
                    }}
                    style={{
                      background: profileTheme.primaryColor,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    <Plus size={16} /> Add Skill
                  </button>
                )}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                {section.content.skills.map((skill, i) => (
                  <SkillCard key={skill.id || i} skill={skill} />
                ))}
              </div>
            </>
          );
          
        // Continue with other section types (projects, experience, education, etc.)
        // Each will have EditableField components with database integration
        
        default:
          return (
            <>
              {renderSectionTitle()}
              <p style={{ 
                textAlign: 'center', 
                opacity: 0.6, 
                color: profileTheme.paragraphColor, 
                fontFamily: profileTheme.bodyFont,
                padding: '3rem',
                background: `${profileTheme.primaryColor}05`,
                borderRadius: '12px',
                border: `1px dashed ${profileTheme.primaryColor}40`
              }}>
                {section.type} section - Click to customize
              </p>
            </>
          );
      }
    };

    return (
      <div
        id={`section-${section.id}`}
        style={sectionStyle}
        onClick={() => {
          if (isEditing) {
            setSelectedSection(section.id);
            setCustomizationTab('editor');
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isEditing && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '0.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            zIndex: 10,
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.3s ease'
          }}>
            {/* Show/Hide button for all sections except header and bio */}
            {section.id !== 'header' && section.id !== 'bio' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateSection(section.id, { visible: !section.visible });
                }}
                style={{
                  background: section.visible ? profileTheme.primaryColor : '#e5e7eb',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  color: section.visible ? 'white' : '#6b7280',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title={section.visible ? 'Hide' : 'Show'}
              >
                {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            )}
            
            {/* Up/Down arrows for sections except header and bio */}
            {section.id !== 'header' && section.id !== 'bio' && (
              <div style={{
                display: 'flex',
                gap: '0.25rem',
                background: '#f3f4f6',
                borderRadius: '6px',
                padding: '0.25rem'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(section.id, 'up');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#6b7280',
                    display: 'flex',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(section.id, 'down');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#6b7280',
                    display: 'flex',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
            
            {/* Delete button only for custom sections */}
            {section.id.startsWith('custom-') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSection(section.id);
                }}
                style={{
                  background: '#fee2e2',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  color: '#ef4444',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title="Delete"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fecaca';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fee2e2';
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
        <div className="section-content">
          {renderSectionContent()}
        </div>
      </div>
    );
  };

  // Enhanced Customization Panel - keeping all your original functionality
  const CustomizationPanel = () => {
    const currentSection = [...sections, ...customSections].find(s => s.id === selectedSection);
    const isDark = profileTheme.backgroundColor === '#1e293b' || profileTheme.backgroundColor === '#0f172a';
    const panelBg = isDark ? '#0f172a' : 'white';
    const panelText = isDark ? '#e2e8f0' : '#334155';
    const panelHeading = isDark ? '#f1f5f9' : '#0f172a';
    
    return (
      <div
        ref={customizationPanelRef}
        style={{
          position: 'fixed',
          right: isCustomizing ? '0' : '-500px',
          top: '0',
          width: window.innerWidth < 768 ? '100vw' : 'min(500px, 42vw)',
          height: '100vh',
          background: panelBg,
          boxShadow: isCustomizing ? '-20px 0 40px rgba(0, 0, 0, 0.15)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: panelText,
          backdropFilter: 'blur(20px)',
          borderLeft: isCustomizing ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
          background: isDark ? '#1e293b' : '#f8fafc'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: panelHeading
            }}>
              <Wand2 size={24} color={profileTheme.primaryColor} />
              Profile Studio
            </h2>
            <button
              onClick={() => {
                setIsCustomizing(false);
                setSelectedSection(null);
                setSelectedText(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                color: panelText
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Panel Tabs - Single Row, Compact */}
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {[
              { id: 'themes', label: 'Themes', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Type },
              { id: 'effects', label: 'Visual Effects', icon: Sparkles },
              { id: 'sections', label: 'Add Section', icon: Plus },
              ...(selectedSection ? [{ id: 'editor', label: 'Editor', icon: Edit3 }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCustomizationTab(tab.id)}
                style={{
                  flex: 1,
                  minWidth: '0',
                  padding: '0.5rem 0.25rem',
                  background: customizationTab === tab.id 
                    ? `linear-gradient(135deg, ${profileTheme.primaryColor}, ${profileTheme.secondaryColor})`
                    : 'transparent',
                  color: customizationTab === tab.id ? 'white' : panelText,
                  border: customizationTab === tab.id 
                    ? 'none'
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s ease',
                  transform: customizationTab === tab.id ? 'scale(1.02)' : 'scale(1)',
                  minHeight: '50px'
                }}
                onMouseEnter={(e) => {
                  if (customizationTab !== tab.id) {
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (customizationTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <tab.icon size={14} />
                <span style={{ 
                  fontSize: '0.6rem', 
                  textAlign: 'center',
                  lineHeight: '1.1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel Content */}
        <div
          style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: `${profileTheme.primaryColor}20 transparent`
          }}
        >
          {customizationTab === 'sections' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                marginBottom: '0.75rem', 
                color: panelHeading,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Plus size={16} color={profileTheme.primaryColor} />
                Add New Section
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { type: 'experience', label: 'Experience', icon: '💼', description: 'Work history' },
                  { type: 'education', label: 'Education', icon: '🎓', description: 'Academic background' },
                  { type: 'skills', label: 'Skills', icon: '⚡', description: 'Technical skills' },
                  { type: 'projects', label: 'Projects', icon: '🚀', description: 'Portfolio projects' },
                  { type: 'achievements', label: 'Achievements', icon: '🏆', description: 'Awards' },
                  { type: 'testimonials', label: 'Testimonials', icon: '💬', description: 'Client reviews' },
                  { type: 'faq', label: 'FAQ', icon: '❓', description: 'Questions' }
                ].map(section => (
                  <button
                    key={section.type}
                    onClick={() => addCustomSection(section.type)}
                    style={{
                      padding: '0.75rem',
                      background: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${profileTheme.primaryColor}10`;
                      e.currentTarget.style.borderColor = profileTheme.primaryColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb';
                      e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{section.icon}</span>
                    <div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        fontWeight: '600', 
                        color: panelText,
                        marginBottom: '0.125rem'
                      }}>
                        {section.label}
                      </div>
                      <div style={{ 
                        fontSize: '0.625rem', 
                        color: panelText,
                        opacity: 0.7
                      }}>
                        {section.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {customizationTab === 'themes' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {/* Left Column - Colors & Presets */}
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Custom Colors */}
                <div>
                  <h3 style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem', 
                    color: panelHeading,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Palette size={14} color={profileTheme.primaryColor} />
                    Colors
                  </h3>
                  <div style={{ display: 'grid', gap: '0.375rem' }}>
                    {[
                      { label: 'Background', key: 'backgroundColor', icon: '🎨' },
                      { label: 'Primary', key: 'primaryColor', icon: '🔵' },
                      { label: 'Secondary', key: 'secondaryColor', icon: '🟦' }
                    ].map(({ label, key, icon }) => (
                      <div key={key} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb';
                      }}>
                        <span style={{ fontSize: '0.75rem' }}>{icon}</span>
                        <label style={{ flex: 1, fontSize: '0.65rem', fontWeight: '500', color: panelText, minWidth: 0 }}>{label}</label>
                        <input
                          type="color"
                          value={profileTheme[key]}
                          onChange={(e) => {
                            if (key === 'backgroundColor' && e.target.value !== '#0f172a' && e.target.value !== '#1e293b' && (profileTheme.backgroundColor === '#0f172a' || profileTheme.backgroundColor === '#1e293b')) {
                              setProfileTheme(prev => ({
                                ...prev,
                                [key]: e.target.value,
                                headingColor: '#1e293b',
                                paragraphColor: '#475569'
                              }));
                            } else {
                              setProfileTheme(prev => ({ ...prev, [key]: e.target.value }));
                            }
                            // Update database
                            updateProfileData(e.target.value, key === 'backgroundColor' ? 'background_color' : key === 'primaryColor' ? 'primary_color' : 'secondary_color', 'profile-themes');
                          }}
                          style={{
                            width: '20px',
                            height: '20px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            flexShrink: 0
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Text Colors & Effects */}
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Text Colors */}
                <div>
                  <h3 style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem', 
                    color: panelHeading,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Type size={14} color={profileTheme.primaryColor} />
                    Text
                  </h3>
                  <div style={{ display: 'grid', gap: '0.375rem' }}>
                    {[
                      { label: 'Headings', key: 'headingColor', icon: '📝' },
                      { label: 'Body Text', key: 'paragraphColor', icon: '📄' }
                    ].map(({ label, key, icon }) => (
                      <div key={key} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb';
                      }}>
                        <span style={{ fontSize: '0.75rem' }}>{icon}</span>
                        <label style={{ flex: 1, fontSize: '0.65rem', fontWeight: '500', color: panelText, minWidth: 0 }}>{label}</label>
                        <input
                          type="color"
                          value={profileTheme[key]}
                          onChange={(e) => {
                            setProfileTheme(prev => ({ ...prev, [key]: e.target.value }));
                            updateProfileData(e.target.value, key === 'headingColor' ? 'heading_text_color' : 'body_text_color', 'profile-themes');
                          }}
                          style={{
                            width: '20px',
                            height: '20px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            flexShrink: 0
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {customizationTab === 'typography' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Font Selection */}
              <div>
                <h3 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem', 
                  color: panelHeading,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Type size={16} color={profileTheme.primaryColor} />
                  Font Family
                </h3>
                <select
                  value={profileTheme.fontFamily}
                  onChange={(e) => {
                    setProfileTheme(prev => ({ ...prev, fontFamily: e.target.value, bodyFont: e.target.value, headingFont: e.target.value }));
                    updateProfileData(e.target.value, 'font_family', 'profile-typography');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                    fontSize: '0.875rem',
                    color: panelText
                  }}
                >
                  {fontOptions.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.label} - {font.preview}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Alignment */}
              <div>
                <h3 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem', 
                  color: panelHeading,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlignLeft size={16} color={profileTheme.primaryColor} />
                  Text Alignment
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[
                    { value: 'left', icon: AlignLeft, label: 'Left' },
                    { value: 'center', icon: AlignCenter, label: 'Center' },
                    { value: 'right', icon: AlignRight, label: 'Right' },
                    { value: 'justify', icon: AlignJustify, label: 'Justify' }
                  ].map(align => (
                    <button
                      key={align.value}
                      onClick={() => {
                        setProfileTheme(prev => ({ ...prev, textAlign: align.value }));
                        updateProfileData(align.value, 'text_alignment', 'profile-typography');
                      }}
                      style={{
                        padding: '0.75rem',
                        background: profileTheme.textAlign === align.value 
                          ? profileTheme.primaryColor 
                          : isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                        color: profileTheme.textAlign === align.value 
                          ? 'white' 
                          : panelText,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (profileTheme.textAlign !== align.value) {
                          e.currentTarget.style.background = `${profileTheme.primaryColor}20`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (profileTheme.textAlign !== align.value) {
                          e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
                        }
                      }}
                    >
                      <align.icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {customizationTab === 'effects' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {/* Left Column - Animations */}
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Background Animation */}
                <div>
                  <h3 style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem', 
                    color: panelHeading,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Sparkles size={14} color={profileTheme.primaryColor} />
                    Animations
                  </h3>
                  <div style={{ display: 'grid', gap: '0.375rem' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      background: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.65rem'
                    }}>
                      <span style={{ color: panelText, fontWeight: '500' }}>Enable Background Animation</span>
                      <input
                        type="checkbox"
                        checked={profileTheme.backgroundAnimation || false}
                        onChange={(e) => {
                          setProfileTheme(prev => ({ ...prev, backgroundAnimation: e.target.checked }));
                          updateProfileData(e.target.checked, 'background_animation_enabled', 'profile-visual-effects');
                        }}
                        style={{ transform: 'scale(0.8)', accentColor: profileTheme.primaryColor }}
                      />
                    </label>
                    
                    {profileTheme.backgroundAnimation && (
                      <div>
                        <label style={{ fontSize: '0.65rem', color: panelText, marginBottom: '0.25rem', display: 'block', fontWeight: '500' }}>
                          Animation Type
                        </label>
                        <select
                          value={profileTheme.animationType || 'hearts'}
                          onChange={(e) => setProfileTheme(prev => ({ ...prev, animationType: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                            fontSize: '0.65rem',
                            color: panelText
                          }}
                        >
                          <option value="hearts">❤️ Hearts</option>
                          <option value="stars">⭐ Stars</option>
                          <option value="bubbles">🫧 Bubbles</option>
                          <option value="snowflakes">❄️ Snowflakes</option>
                          <option value="confetti">🎊 Confetti</option>
                          <option value="flowers">🌸 Flowers</option>
                          <option value="sparkles">✨ Sparkles</option>
                        </select>
                      </div>
                    )}
                    
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      background: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.65rem'
                    }}>
                      <span style={{ color: panelText, fontWeight: '500' }}>Hover Effects</span>
                      <input
                        type="checkbox"
                        checked={profileTheme.hoverEffects || false}
                        onChange={(e) => setProfileTheme(prev => ({ ...prev, hoverEffects: e.target.checked }))}
                        style={{ transform: 'scale(0.8)', accentColor: profileTheme.primaryColor }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Shadows & Borders */}
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <h3 style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem', 
                    color: panelHeading,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Square size={14} color={profileTheme.primaryColor} />
                    Shadows & Borders
                  </h3>
                  <div style={{ display: 'grid', gap: '0.375rem' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: panelText, marginBottom: '0.25rem', display: 'block', fontWeight: '500' }}>
                        Border Radius
                      </label>
                      <select
                        value={profileTheme.borderRadius}
                        onChange={(e) => {
                          setProfileTheme(prev => ({ ...prev, borderRadius: e.target.value }));
                          updateProfileData(e.target.value, 'border_radius_size', 'profile-visual-effects');
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                          background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                          fontSize: '0.65rem',
                          color: panelText
                        }}
                      >
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="rounded">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: panelText, marginBottom: '0.25rem', display: 'block', fontWeight: '500' }}>
                        Shadow Style
                      </label>
                      <select
                        value={profileTheme.shadowStyle}
                        onChange={(e) => {
                          setProfileTheme(prev => ({ ...prev, shadowStyle: e.target.value }));
                          updateProfileData(e.target.value, 'shadow_style', 'profile-visual-effects');
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                          background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                          fontSize: '0.65rem',
                          color: panelText
                        }}
                      >
                        <option value="none">None</option>
                        <option value="subtle">Subtle</option>
                        <option value="medium">Medium</option>
                        <option value="strong">Strong</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {customizationTab === 'editor' && currentSection && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              height: 'calc(100vh - 200px)',
              overflow: 'hidden'
            }}>
              {/* Left Column - General Settings */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                overflow: 'auto',
                paddingRight: '0.5rem'
              }}>
                {/* Section Background */}
                <div>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.75rem', color: panelHeading }}>
                    Section Appearance
                  </h3>
                  <div>
                    <label style={{ fontSize: '0.7rem', marginBottom: '0.375rem', display: 'block', color: panelText }}>
                      Background
                    </label>
                    <select
                      value={currentSection.style.background}
                      onChange={(e) => updateSectionStyle(currentSection.id, 'background', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                        fontSize: '0.75rem',
                        color: panelText
                      }}
                    >
                      {backgroundOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.preview} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column - Section-Specific Settings */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                overflow: 'auto',
                paddingLeft: '0.5rem'
              }}>
                {/* Add section-specific settings based on section type */}
                {currentSection.type === 'header' && (
                  <div>
                    <h3 style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: '600', 
                      marginBottom: '0.75rem', 
                      color: panelHeading,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}>
                      <Settings size={14} />
                      Header Settings
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', marginBottom: '0.375rem', display: 'block', color: panelText }}>
                          Avatar Shape
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem' }}>
                          {[
                            { value: 'circle', icon: '⭕' },
                            { value: 'square', icon: '⬜' },
                            { value: 'rounded', icon: '🔲' }
                          ].map(shape => (
                            <button
                              key={shape.value}
                              onClick={() => updateSectionSettings(currentSection.id, 'avatarShape', shape.value)}
                              style={{
                                padding: '0.5rem',
                                background: currentSection.settings.avatarShape === shape.value 
                                  ? profileTheme.primaryColor 
                                  : isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                                color: currentSection.settings.avatarShape === shape.value 
                                  ? 'white' 
                                  : panelText,
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {shape.icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '1.5rem',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
          background: isDark ? '#1e293b' : '#f8fafc',
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={() => {
              setIsCustomizing(false);
              setPreviewMode(false);
              setSelectedSection(null);
              setSelectedText(null);
              setShowSaveNotification(true);
              setTimeout(() => setShowSaveNotification(false), 3000);
            }}
            style={{
              flex: 1,
              padding: '1rem',
              background: `linear-gradient(135deg, ${profileTheme.primaryColor}, ${profileTheme.secondaryColor})`,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9375rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            }}
          >
            <Save size={18} />
            Save All Changes
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.2)',
              transform: 'rotate(45deg)',
              transition: 'all 0.6s ease'
            }} />
          </button>
          
          <button
            onClick={() => setPreviewMode(!previewMode)}
            style={{
              padding: '1rem 1.5rem',
              background: previewMode 
                ? profileTheme.primaryColor
                : 'transparent',
              color: previewMode 
                ? 'white'
                : profileTheme.primaryColor,
              border: `2px solid ${profileTheme.primaryColor}`,
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!previewMode) {
                e.currentTarget.style.background = `${profileTheme.primaryColor}10`;
              }
            }}
            onMouseOut={(e) => {
              if (!previewMode) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {previewMode ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>
    );
  };

  // Helper functions
  const getBorderRadius = (custom) => {
    if (custom) return custom;
    const radiusMap = {
      none: '0px',
      small: '8px',
      rounded: '16px',
      large: '24px'
    };
    return radiusMap[profileTheme.borderRadius] || '16px';
  };

  const getShadowStyle = () => {
    const shadowMap = {
      none: 'none',
      subtle: '0 2px 8px rgba(0, 0, 0, 0.06)',
      medium: '0 8px 24px rgba(0, 0, 0, 0.12)',
      strong: '0 16px 40px rgba(0, 0, 0, 0.18)'
    };
    return shadowMap[profileTheme.shadowStyle] || 'none';
  };

  const getThemeStyles = () => {
    return {
      '--primary-color': profileTheme.primaryColor,
      '--secondary-color': profileTheme.secondaryColor,
      '--accent-color': profileTheme.accentColor,
      '--bg-color': profileTheme.backgroundColor,
      '--heading-color': profileTheme.headingColor,
      '--paragraph-color': profileTheme.paragraphColor,
      backgroundColor: profileTheme.backgroundColor,
      color: profileTheme.paragraphColor,
      fontFamily: profileTheme.bodyFont,
      minHeight: '100vh',
      position: 'relative',
      transition: `all ${profileTheme.transitionSpeed} ease`
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: profileTheme.backgroundColor
      }}>
        <Loader2 size={48} className="animate-spin" color={profileTheme.primaryColor} />
      </div>
    );
  }

  // Main render
  return (
    <div style={getThemeStyles()}>
      {/* Global Typography Styles */}
      <style>{`
        * {
          font-family: ${profileTheme.fontFamily || profileTheme.bodyFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif !important;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: ${profileTheme.headingFont || profileTheme.fontFamily || profileTheme.bodyFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif !important;
          color: ${profileTheme.headingColor} !important;
          text-align: ${profileTheme.textAlign || 'left'} !important;
          font-weight: ${profileTheme.fontWeight || 'normal'} !important;
          font-style: ${profileTheme.fontStyle || 'normal'} !important;
          text-decoration: ${profileTheme.textDecoration || 'none'} !important;
        }
        p, span, div, label, input, textarea, button, li {
          font-family: ${profileTheme.fontFamily || profileTheme.bodyFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif !important;
          text-align: ${profileTheme.textAlign || 'left'} !important;
          font-weight: ${profileTheme.fontWeight || 'normal'} !important;
          font-style: ${profileTheme.fontStyle || 'normal'} !important;
          text-decoration: ${profileTheme.textDecoration || 'none'} !important;
        }
        .section-content * {
          text-align: ${profileTheme.textAlign || 'left'} !important;
          font-weight: ${profileTheme.fontWeight || 'normal'} !important;
          font-style: ${profileTheme.fontStyle || 'normal'} !important;
          text-decoration: ${profileTheme.textDecoration || 'none'} !important;
        }
        /* Shake animation for error feedback */
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        /* Spin animation for loading states */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        /* Pulse animation for inputs */
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 ${profileTheme.primaryColor}40; }
          70% { box-shadow: 0 0 0 10px ${profileTheme.primaryColor}00; }
          100% { box-shadow: 0 0 0 0 ${profileTheme.primaryColor}00; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Save Notification */}
      {showSaveNotification && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: profileTheme.primaryColor,
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <Check size={20} />
          <span style={{ fontWeight: '500' }}>Changes saved successfully!</span>
        </div>
      )}
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Preview Mode Header */}
        {previewMode && (
          <div style={{
            background: `linear-gradient(90deg, ${profileTheme.primaryColor}, ${profileTheme.secondaryColor})`,
            color: 'white',
            padding: '1rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <Eye size={18} />
            Preview Mode - This is how others will see your profile
          </div>
        )}

        {/* Main Action Buttons */}
        {!isCustomizing && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 100
          }}>
            <button
              onClick={() => setIsCustomizing(true)}
              style={{
                background: `linear-gradient(135deg, ${profileTheme.primaryColor}, ${profileTheme.secondaryColor})`,
                color: 'white',
                border: 'none',
                padding: '1.25rem 1.75rem',
                borderRadius: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
              }}
            >
              <Wand2 size={20} />
              Customize Profile
              <Sparkles size={16} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', opacity: 0.6 }} />
            </button>
            
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: profileTheme.primaryColor,
                border: `2px solid ${profileTheme.primaryColor}`,
                padding: '0.75rem',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = profileTheme.primaryColor;
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.color = profileTheme.primaryColor;
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
        )}

        {/* Profile Content */}
        <div style={{
          padding: isCustomizing ? (window.innerWidth < 768 ? '1rem' : '1.5rem') : profileTheme.sectionSpacing,
          maxWidth: isCustomizing ? 'none' : '1200px',
          margin: isCustomizing ? '0' : '0 auto',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isCustomizing ? 
            (window.innerWidth < 768 ? 'scale(1)' : 'translateX(-20px) scale(1)') : 
            'translateX(0) scale(1)',
          width: isCustomizing ? 
            (window.innerWidth < 768 ? '100%' : 'calc(100vw - min(500px, 42vw))') : '100%',
          marginRight: isCustomizing ? 
            (window.innerWidth < 768 ? '0' : 'min(500px, 42vw)') : 'auto',
          opacity: 1,
          pointerEvents: 'auto',
          minHeight: '100vh',
          boxSizing: 'border-box',
          overflow: isCustomizing ? 'visible' : 'initial'
        }}>
          {/* Render all sections in order */}
          {[...sections, ...customSections]
            .filter(section => previewMode ? section.visible : true)
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <Section key={section.id} section={section} isEditing={isCustomizing && !previewMode} />
            ))}
        </div>
      </div>

      {/* Overlay for mobile when panel is open */}
      {isCustomizing && window.innerWidth < 768 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 999,
            display: 'block'
          }}
          onClick={() => setIsCustomizing(false)}
        />
      )}

      {/* Customization Panel */}
      <CustomizationPanel />
      
      {/* Background Animation */}
      {profileTheme.backgroundAnimation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'hidden'
        }}>
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                fontSize: profileTheme.animationType === 'bubbles' ? '2rem' : '1.5rem',
                opacity: 0.7,
                animation: `float${i % 3} ${8 + (i % 5)}s infinite ease-in-out`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`
              }}
            >
              {profileTheme.animationType === 'hearts' && '❤️'}
              {profileTheme.animationType === 'stars' && '⭐'}
              {profileTheme.animationType === 'bubbles' && '🫧'}
              {profileTheme.animationType === 'snowflakes' && '❄️'}
              {profileTheme.animationType === 'confetti' && ['🎊', '🎉', '🎈'][i % 3]}
              {profileTheme.animationType === 'flowers' && ['🌸', '🌺', '🌻', '🌷'][i % 4]}
              {profileTheme.animationType === 'sparkles' && '✨'}
            </div>
          ))}
        </div>
      )}
      
      {/* Global Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          to {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
        }
        
        @keyframes float0 {
          0%, 100% { transform: translateY(100vh) rotate(0deg); }
          50% { transform: translateY(-10vh) rotate(180deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(100vh) rotate(0deg) scale(0.8); }
          50% { transform: translateY(-5vh) rotate(360deg) scale(1.2); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(100vh) rotate(0deg) translateX(0); }
          25% { transform: translateY(75vh) rotate(90deg) translateX(20px); }
          50% { transform: translateY(50vh) rotate(180deg) translateX(-20px); }
          75% { transform: translateY(25vh) rotate(270deg) translateX(10px); }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Error Notification */}
      {errorNotification.show && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: '#ef4444',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.2)',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '400px'
          }}
        >
          <AlertCircle size={20} />
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Error</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{errorNotification.message}</div>
          </div>
          <button
            onClick={() => setErrorNotification({ show: false, message: '' })}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              padding: '0.25rem',
              cursor: 'pointer',
              marginLeft: 'auto',
              opacity: 0.8,
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;