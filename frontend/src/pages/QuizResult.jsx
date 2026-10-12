import React, { useEffect } from 'react';
import { 
  Trophy, 
  Percent, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Download, 
  Copy, 
  ArrowLeft, 
  RefreshCw,
  Info 
} from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

export default function QuizResult({ resultData, onNavigate, setToast }) {
  const { 
    quiz_id, 
    topic, 
    difficulty, 
    score, 
    total_questions, 
    wrong_answers, 
    accuracy, 
    time_taken, 
    pass_status, 
    questions = [] 
  } = resultData;

  const isPassed = accuracy >= 60;

  // Trigger confetti if passed on mount
  useEffect(() => {
    if (isPassed) {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1100 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isPassed]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyQuestion = (q, idx) => {
    const textToCopy = `Question ${idx + 1}: ${q.question}\nOptions:\n- ${q.options.join('\n- ')}\nCorrect Answer: ${q.correct_answer}\nExplanation: ${q.explanation}`;
    navigator.clipboard.writeText(textToCopy);
    setToast({ message: `Copied question ${idx + 1} to clipboard!`, type: 'success' });
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title / Brand
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // var(--primary)
      doc.text('QuizGenius AI - Report Card', 14, 20);
      
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 26);
      doc.line(14, 28, 196, 28);
      
      // Metadata
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text('Quiz Metadata', 14, 38);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Topic: ${topic}`, 14, 45);
      doc.text(`Difficulty: ${difficulty}`, 14, 51);
      doc.text(`Result Status: ${pass_status}`, 14, 57);
      
      // Score details block
      doc.setFont('Helvetica', 'bold');
      doc.text(`Score: ${score} / ${total_questions} questions`, 110, 45);
      doc.text(`Accuracy: ${accuracy}%`, 110, 51);
      doc.text(`Time Taken: ${Math.floor(time_taken / 60)}m ${time_taken % 60}s`, 110, 57);
      
      doc.line(14, 63, 196, 63);
      
      // Questions review
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Questions Review', 14, 73);
      
      let yOffset = 82;
      questions.forEach((q, idx) => {
        // Page break check
        if (yOffset > 250) {
          doc.addPage();
          yOffset = 20;
        }
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30);
        // Split question text into lines to avoid overflow
        const qLines = doc.splitTextToSize(`Q${idx + 1}: ${q.question}`, 180);
        doc.text(qLines, 14, yOffset);
        yOffset += (qLines.length * 5) + 2;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`- User's Answer: ${q.user_answer || '(Unanswered)'}`, 18, yOffset);
        yOffset += 5;
        doc.text(`- Correct Answer: ${q.correct_answer}`, 18, yOffset);
        yOffset += 6;
        
        doc.setFont('Helvetica', 'italic');
        const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, 174);
        doc.text(expLines, 18, yOffset);
        yOffset += (expLines.length * 4) + 8;
      });

      doc.save(`QuizGenius_${topic.replace(/\s+/g, '_')}_Report.pdf`);
      setToast({ message: 'PDF downloaded successfully!', type: 'success' });
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to generate PDF.', type: 'error' });
    }
  };

  const handleRetake = () => {
    localStorage.setItem('prefilled_topic', topic);
    onNavigate('generate');
  };

  const getAccuracyGlow = () => {
    if (isPassed) return '0 0 20px rgba(16, 185, 129, 0.2)';
    return '0 0 20px rgba(239, 68, 68, 0.2)';
  };

  const getMotivationalMessage = () => {
    if (accuracy === 100) return 'Perfect Score! Einstein Status Unlocked!';
    if (accuracy >= 80) return 'Exceptional Job! You have mastered this content.';
    if (accuracy >= 60) return 'Congratulations! You passed the assessment.';
    return 'Attempt failed. Don\'t worry, check the reviews and try again!';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      padding: '24px max(24px, 4vw) 80px',
      maxWidth: '850px',
      margin: '0 auto',
      width: '100%'
    }} className="printable-results">

      {/* Main Scorecard Header */}
      <GlassCard 
        style={{
          background: isPassed 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)' 
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: isPassed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '40px 24px',
          textAlign: 'center'
        }}
        hoverEffect={false}
      >
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: getAccuracyGlow(),
          fontSize: '24px',
          fontWeight: 700,
          color: isPassed ? 'var(--success)' : 'var(--error)'
        }}>
          {accuracy}%
        </div>

        <div>
          <h2 style={{ fontSize: '24px', color: 'var(--text-main)' }}>{pass_status}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', maxWidth: '450px' }}>
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Info pills */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
          <div style={badgeStyle}>
            <Trophy size={14} color="var(--secondary)" />
            <span>Score: {score}/{total_questions}</span>
          </div>
          <div style={badgeStyle}>
            <Clock size={14} color="var(--accent)" />
            <span>Time: {Math.floor(time_taken / 60)}m {time_taken % 60}s</span>
          </div>
          <div style={badgeStyle}>
            {isPassed ? <CheckCircle2 size={14} color="var(--success)" /> : <XCircle size={14} color="var(--error)" />}
            <span>Target: 60% Pass</span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="no-print" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
          <Button onClick={handleRetake} variant="secondary" icon={RefreshCw}>
            Retake Quiz
          </Button>
          <Button onClick={handleDownloadPDF} variant="glass" icon={Download}>
            Download PDF
          </Button>
          <Button onClick={handlePrint} variant="glass" icon={Printer}>
            Print Quiz
          </Button>
        </div>
      </GlassCard>

      {/* Review Section */}
      <div>
        <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '16px', fontFamily: 'Poppins' }}>
          Questions Review
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, idx) => {
            const isCorrect = q.user_answer && q.user_answer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
            return (
              <GlassCard 
                key={idx}
                style={{
                  borderLeft: isCorrect ? '4px solid var(--success)' : '4px solid var(--error)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
                hoverEffect={false}
              >
                {/* Review Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '15px' }}>
                    Q{idx + 1}: {q.question}
                  </div>
                  
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }} className="no-print">
                    <button 
                      onClick={() => handleCopyQuestion(q, idx)}
                      title="Copy Question Details"
                      style={iconButtonStyle}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                {/* Options list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options.map((opt, oIdx) => {
                    const isOptionCorrect = opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                    const isOptionUserSelection = q.user_answer && opt.trim().toLowerCase() === q.user_answer.trim().toLowerCase();

                    let optionBg = 'transparent';
                    let optionBorder = '1px solid var(--card-border)';
                    let optionColor = 'var(--text-main)';
                    let checkMarker = null;

                    if (isOptionCorrect) {
                      optionBg = 'rgba(16, 185, 129, 0.08)';
                      optionBorder = '1px solid rgba(16, 185, 129, 0.3)';
                      optionColor = 'var(--success)';
                      checkMarker = <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />;
                    } else if (isOptionUserSelection && !isCorrect) {
                      optionBg = 'rgba(239, 68, 68, 0.08)';
                      optionBorder = '1px solid rgba(239, 68, 68, 0.3)';
                      optionColor = 'var(--error)';
                      checkMarker = <XCircle size={16} color="var(--error)" style={{ flexShrink: 0 }} />;
                    }

                    return (
                      <div
                        key={oIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: optionBg,
                          border: optionBorder,
                          color: optionColor,
                          fontSize: '13px',
                          fontWeight: (isOptionCorrect || isOptionUserSelection) ? 600 : 500
                        }}
                      >
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.6 }}>
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                        {checkMarker}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation text */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  backgroundColor: 'rgba(79, 70, 229, 0.03)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  borderLeft: '3px solid var(--primary)'
                }}>
                  <Info size={16} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </div>

              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
        <Button onClick={() => onNavigate('dashboard')} variant="glass" icon={ArrowLeft}>
          Back to Dashboard
        </Button>
      </div>

      {/* Print friendly layout styling */}
      <style>{`
        @media print {
          body {
            background: #FFFFFF !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-results {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .glass-panel {
            background: #FFFFFF !important;
            border: 1px solid #DDDDDD !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid var(--card-border)',
  color: 'var(--text-main)',
  fontSize: '12px',
  fontWeight: 600
};

const iconButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px',
  borderRadius: '6px',
  transition: 'background-color 0.2s',
  outline: 'none',
  ':hover': {
    backgroundColor: 'rgba(255,255,255,0.05)'
  }
};
