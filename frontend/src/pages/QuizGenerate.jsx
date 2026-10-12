import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BookOpen, 
  FileText, 
  UploadCloud, 
  Sparkles, 
  HelpCircle, 
  Check, 
  AlertCircle,
  File
} from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';

export default function QuizGenerate({ onStartQuiz, setToast }) {
  const [activeTab, setActiveTab] = useState('topic'); // topic, text, pdf, docx
  
  // Settings
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  
  // Tab Inputs
  const [topic, setTopic] = useState('');
  const [rawText, setRawText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Drag & drop state
  const [dragOver, setDragOver] = useState(false);
  
  // Generation state
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');

  useEffect(() => {
    // Check if dashboard prefilled a topic
    const prefilled = localStorage.getItem('prefilled_topic');
    if (prefilled) {
      setTopic(prefilled);
      setActiveTab('topic');
      localStorage.removeItem('prefilled_topic');
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (activeTab === 'pdf' && ext !== 'pdf') {
      setToast({ message: 'Please upload a PDF file only.', type: 'error' });
      return;
    }
    
    if (activeTab === 'docx' && ext !== 'docx') {
      setToast({ message: 'Please upload a Word (.docx) file only.', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'File size exceeds 5MB limit.', type: 'error' });
      return;
    }

    setUploadedFile(file);
    setToast({ message: `File loaded: ${file.name}`, type: 'success' });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    // Validate current tab inputs
    if (activeTab === 'topic' && !topic.trim()) {
      setToast({ message: 'Please enter a quiz topic.', type: 'warning' });
      return;
    }
    if (activeTab === 'text' && (!rawText.trim() || rawText.length < 50)) {
      setToast({ message: 'Please paste source text (min 50 characters).', type: 'warning' });
      return;
    }
    if ((activeTab === 'pdf' || activeTab === 'docx') && !uploadedFile) {
      setToast({ message: 'Please upload your document file.', type: 'warning' });
      return;
    }

    setLoading(true);
    setLoadingStage('Analyzing materials...');
    
    try {
      let quizData = null;
      
      if (activeTab === 'topic') {
        setLoadingStage('Connecting to Gemini...');
        quizData = await api.generateFromTopic(topic, difficulty, count);
      } else if (activeTab === 'text') {
        setLoadingStage('Parsing study notes...');
        quizData = await api.generateFromText(rawText, difficulty, count);
      } else if (activeTab === 'pdf') {
        setLoadingStage('Extracting text from PDF...');
        quizData = await api.generateFromPDF(uploadedFile, difficulty, count);
      } else if (activeTab === 'docx') {
        setLoadingStage('Extracting text from Word file...');
        quizData = await api.generateFromDOCX(uploadedFile, difficulty, count);
      }

      setLoadingStage('Drafting multiple choice options...');
      
      if (quizData && quizData.quiz_id) {
        setToast({ message: 'Quiz generated successfully!', type: 'success' });
        // Start quiz player with generated quiz questions
        onStartQuiz(quizData);
      } else {
        throw new Error('AI failed to return standard quiz data.');
      }
    } catch (err) {
      setToast({ message: err.message || 'Generation failed.', type: 'error' });
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px max(24px, 4vw) 80px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--text-main)' }}>Quiz Generator</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Select an input format, choose your parameters, and let AI build your customized test.
        </p>
      </div>

      {/* Main Generator Card */}
      {loading ? (
        <GlassCard style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '60px 40px',
          textAlign: 'center'
        }} glow hoverEffect={false}>
          {/* Glowing AI Spinner */}
          <div className="spinner-outer" style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, var(--primary), var(--secondary), var(--accent), var(--primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'spin 1.5s linear infinite'
          }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={32} color="var(--secondary)" className="pulse-sparkle" />
            </div>
          </div>
          
          <div>
            <h2 style={{ fontSize: '20px', color: 'var(--text-main)' }}>Creating Quiz...</h2>
            <div style={{ 
              fontSize: '14px', 
              color: 'var(--primary)', 
              fontWeight: 600,
              marginTop: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {loadingStage}
            </div>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '400px' }}>
            Gemini is reading, sorting, and validating questions against difficulty targets. This usually takes 5-15 seconds.
          </p>

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .pulse-sparkle {
              animation: sparkle-pulse 1.5s ease-in-out infinite alternate;
            }
            @keyframes sparkle-pulse {
              from { transform: scale(1); filter: drop-shadow(0 0 2px var(--secondary)); }
              to { transform: scale(1.2); filter: drop-shadow(0 0 10px var(--accent)); }
            }
          `}</style>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tab Selection */}
          <div className="glass-panel" style={{
            display: 'flex',
            padding: '4px',
            borderRadius: '14px',
            gap: '4px'
          }}>
            {tabButton('topic', 'Topic', BookOpen, activeTab, setActiveTab)}
            {tabButton('text', 'Text', FileText, activeTab, setActiveTab)}
            {tabButton('pdf', 'PDF', UploadCloud, activeTab, setActiveTab)}
            {tabButton('docx', 'DOCX', FileText, activeTab, setActiveTab)}
          </div>

          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} hoverEffect={false}>
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Tab Content inputs */}
              {activeTab === 'topic' && (
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Topic Description</label>
                  <input
                    type="text"
                    placeholder="e.g. European History 19th Century, Photosynthesis, JavaScript Promises..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    style={textInputStyle}
                    required
                  />
                  <span style={hintStyle}>Type a concise topic for AI to query historical contexts.</span>
                </div>
              )}

              {activeTab === 'text' && (
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Study Notes / Material</label>
                  <textarea
                    placeholder="Paste your raw study notes, book page contents, or summaries here (min 50 characters)..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    style={{ ...textInputStyle, minHeight: '140px', resize: 'vertical' }}
                    required
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Paste study materials directly.</span>
                    <span>{rawText.length} characters</span>
                  </div>
                </div>
              )}

              {(activeTab === 'pdf' || activeTab === 'docx') && (
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Upload Document ({activeTab.toUpperCase()})</label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      border: dragOver ? '2px dashed var(--primary)' : '2px dashed var(--card-border)',
                      backgroundColor: dragOver ? 'rgba(79, 70, 229, 0.05)' : 'rgba(255,255,255,0.01)',
                      borderRadius: '16px',
                      padding: '40px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onClick={() => document.getElementById('file-upload-input').click()}
                  >
                    <input
                      id="file-upload-input"
                      type="file"
                      accept={activeTab === 'pdf' ? '.pdf' : '.docx'}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    
                    {uploadedFile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto' }}>
                          <File size={24} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{uploadedFile.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                        <Button variant="text" size="sm" style={{ color: 'var(--error)' }} onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}>
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <UploadCloud size={36} color="var(--primary)" />
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Drag and drop file here, or click to browse</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Supports {activeTab.toUpperCase()} files up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Parameters Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
                borderTop: '1px solid var(--card-border)',
                paddingTop: '20px'
              }}>
                {/* Difficulty Selector */}
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Difficulty Level</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {difficultyPill('Easy', difficulty, setDifficulty)}
                    {difficultyPill('Medium', difficulty, setDifficulty)}
                    {difficultyPill('Hard', difficulty, setDifficulty)}
                  </div>
                </div>

                {/* Length Selector */}
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Number of Questions</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {countPill(5, count, setCount)}
                    {countPill(10, count, setCount)}
                    {countPill(15, count, setCount)}
                    {countPill(20, count, setCount)}
                  </div>
                </div>
              </div>

              {/* Generate Trigger */}
              <Button
                type="submit"
                size="lg"
                fullWidth
                icon={Sparkles}
                style={{ marginTop: '8px' }}
              >
                Generate Quiz
              </Button>

            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// Subcomponents helper
const tabButton = (id, label, Icon, active, setActive) => {
  const isActive = active === id;
  return (
    <button
      onClick={() => setActive(id)}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 14px',
        borderRadius: '10px',
        border: 'none',
        background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
        color: isActive ? '#FFF' : 'var(--text-muted)',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
};

const difficultyPill = (level, active, setActive) => {
  const isActive = active === level;
  let activeBg = 'var(--primary)';
  
  if (level === 'Easy') activeBg = 'var(--success)';
  if (level === 'Hard') activeBg = 'var(--error)';
  
  return (
    <button
      type="button"
      onClick={() => setActive(level)}
      style={{
        flex: 1,
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        border: isActive ? `1.5px solid ${activeBg}` : '1.5px solid var(--card-border)',
        backgroundColor: isActive ? activeBg + '15' : 'transparent',
        color: isActive ? activeBg : 'var(--text-muted)',
        transition: 'all 0.15s'
      }}
    >
      {level}
    </button>
  );
};

const countPill = (num, active, setActive) => {
  const isActive = active === num;
  return (
    <button
      type="button"
      onClick={() => setActive(num)}
      style={{
        flex: 1,
        padding: '8px 8px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        border: isActive ? '1.5px solid var(--primary)' : '1.5px solid var(--card-border)',
        backgroundColor: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
        transition: 'all 0.15s'
      }}
    >
      {num}
    </button>
  );
};

// Reuse inputs styling
const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text-main)',
  fontFamily: 'Poppins'
};

const textInputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid var(--card-border)',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  color: 'var(--text-main)',
  outline: 'none',
  fontSize: '14px',
  transition: 'border-color 0.2s',
  ':focus': {
    borderColor: 'var(--primary)'
  }
};

const hintStyle = {
  fontSize: '11px',
  color: 'var(--text-muted)'
};
