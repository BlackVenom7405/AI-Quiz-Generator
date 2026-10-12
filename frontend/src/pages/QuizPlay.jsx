import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle, 
  Timer,
  Info,
  Menu,
  ChevronDown
} from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';

export default function QuizPlay({ quizData, onSubmitted, setToast }) {
  const { quiz_id, topic, difficulty, questions = [] } = quizData;
  const totalQuestions = questions.length;
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    const saved = localStorage.getItem(`quiz_answers_${quiz_id}`);
    return saved ? JSON.parse(saved) : {}; // Map of { question_id: selected_option_text }
  });
  const [flaggedQuestions, setFlaggedQuestions] = useState(() => {
    const saved = localStorage.getItem(`quiz_flags_${quiz_id}`);
    return saved ? JSON.parse(saved) : {}; // Map of { question_id: boolean }
  });

  // Timer: 60 seconds per question
  const timeLimit = totalQuestions * 60;
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedStart = localStorage.getItem(`quiz_timer_start_${quiz_id}`);
    if (savedStart) {
      const elapsed = Math.floor((Date.now() - parseInt(savedStart)) / 1000);
      return Math.max(timeLimit - elapsed, 0);
    }
    localStorage.setItem(`quiz_timer_start_${quiz_id}`, Date.now().toString());
    return timeLimit;
  });

  const [submitting, setSubmitting] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);

  // Auto-save answers & flags to localStorage
  useEffect(() => {
    localStorage.setItem(`quiz_answers_${quiz_id}`, JSON.stringify(selectedAnswers));
  }, [selectedAnswers, quiz_id]);

  useEffect(() => {
    localStorage.setItem(`quiz_flags_${quiz_id}`, JSON.stringify(flaggedQuestions));
  }, [flaggedQuestions, quiz_id]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSelectOption = (optionText) => {
    const activeQ = questions[currentIdx];
    setSelectedAnswers(prev => ({
      ...prev,
      [activeQ.question_id]: optionText
    }));
  };

  const handleToggleFlag = () => {
    const activeQ = questions[currentIdx];
    setFlaggedQuestions(prev => ({
      ...prev,
      [activeQ.question_id]: !prev[activeQ.question_id]
    }));
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) setCurrentIdx(prev => prev + 1);
  };

  const handleAutoSubmit = () => {
    setToast({ message: 'Time expired! Submitting your answers automatically.', type: 'warning' });
    submitAnswers();
  };

  const handleSubmitClick = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(`You answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }
    submitAnswers();
  };

  const submitAnswers = async () => {
    setSubmitting(true);
    const elapsedSeconds = timeLimit - timeLeft;
    try {
      const result = await api.submitQuiz(quiz_id, selectedAnswers, elapsedSeconds);
      
      // Cleanup localStorage
      localStorage.removeItem(`quiz_answers_${quiz_id}`);
      localStorage.removeItem(`quiz_flags_${quiz_id}`);
      localStorage.removeItem(`quiz_timer_start_${quiz_id}`);
      
      onSubmitted(result);
    } catch (e) {
      setToast({ message: e.message || 'Submission failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (questions.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No questions found for this quiz session.
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progressPercent = Math.round((Object.keys(selectedAnswers).length / totalQuestions) * 100);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
      padding: '24px max(24px, 4vw) 80px',
      maxWidth: '1100px',
      margin: '0 auto',
      width: '100%',
      '@media (min-width: 992px)': { gridTemplateColumns: '3fr 1fr' }
    }} className="quiz-play-layout">

      {/* Main Play Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Quiz Info Header */}
        <div className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderRadius: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '16px', color: 'var(--text-main)' }}>{topic}</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Difficulty: {difficulty}</span>
          </div>
          
          {/* Glowing Timer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: timeLeft < 30 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.08)',
            border: timeLeft < 30 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(79, 70, 229, 0.2)',
            borderRadius: '10px',
            padding: '8px 14px',
            color: timeLeft < 30 ? 'var(--error)' : 'var(--text-main)',
            fontWeight: 700,
            fontSize: '15px'
          }}>
            <Timer size={18} className={timeLeft < 30 ? 'timer-critical' : ''} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question Card */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} hoverEffect={false}>
          {/* Card Top: Number, Flag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '13px' }}>
              QUESTION {currentIdx + 1} OF {totalQuestions}
            </span>
            
            <button
              onClick={handleToggleFlag}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: flaggedQuestions[currentQuestion.question_id] ? '#F59E0B' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <Flag size={16} fill={flaggedQuestions[currentQuestion.question_id] ? '#F59E0B' : 'none'} />
              <span>{flaggedQuestions[currentQuestion.question_id] ? 'Flagged' : 'Flag'}</span>
            </button>
          </div>

          {/* Question Text */}
          <h3 style={{ fontSize: '18px', color: 'var(--text-main)', lineHeight: 1.5 }}>
            {currentQuestion.question}
          </h3>

          {/* Options Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQuestion.question_id] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                    backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: isSelected ? '2px solid var(--primary)' : '2px solid var(--card-border)',
                    backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {isSelected ? '✓' : String.fromCharCode(65 + idx)}
                  </div>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Nav Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--card-border)',
            paddingTop: '20px',
            marginTop: '8px'
          }}>
            <Button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              variant="glass"
              icon={ChevronLeft}
            >
              Previous
            </Button>
            
            {currentIdx === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmitClick}
                variant="primary"
                loading={submitting}
                icon={CheckCircle}
                style={{
                  background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                }}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                icon={ChevronRight}
                iconPosition="right"
              >
                Next
              </Button>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Sidebar Palette */}
      <div className={`palette-sidebar ${paletteOpen ? 'open' : ''}`}>
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }} hoverEffect={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', color: 'var(--text-main)' }}>Quiz Progress</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--card-border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
          </div>

          {/* Grid Palette */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
            gap: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '4px'
          }}>
            {questions.map((q, idx) => {
              const isCurrent = currentIdx === idx;
              const isAnswered = selectedAnswers[q.question_id] !== undefined;
              const isFlagged = flaggedQuestions[q.question_id] === true;

              let border = '1px solid var(--card-border)';
              let bg = 'transparent';
              let color = 'var(--text-muted)';
              
              if (isAnswered) {
                bg = 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)';
                border = 'none';
                color = '#FFFFFF';
              }
              
              if (isFlagged) {
                border = '2px solid #F59E0B';
                if (!isAnswered) color = '#F59E0B';
              }

              if (isCurrent) {
                border = '2px solid var(--accent)';
                if (!isAnswered) color = 'var(--accent)';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    border,
                    background: bg,
                    color,
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    outline: 'none',
                    animation: isCurrent ? 'pulse-outline 1.5s infinite alternate' : 'none'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--card-border)', paddingTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }} />
              <span>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid #F59E0B' }} />
              <span>Flagged</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid var(--accent)' }} />
              <span>Current Question</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <style>{`
        .timer-critical {
          animation: blink-red 1s infinite alternate;
        }
        @keyframes blink-red {
          from { opacity: 1; }
          to { opacity: 0.4; }
        }
        @keyframes pulse-outline {
          from { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
          to { box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1); }
        }
        .quiz-play-layout {
          display: grid;
          grid-template-columns: 3fr 1fr;
        }
        @media (max-width: 992px) {
          .quiz-play-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
