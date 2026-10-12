import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  UploadCloud, 
  Award, 
  ShieldCheck, 
  ChevronDown, 
  Zap, 
  ArrowRight 
} from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';

export default function LandingPage({ onNavigate }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How does the AI quiz generation work?",
      answer: "QuizGenius AI connects to Google's advanced Gemini API. Depending on the method you choose (Topic, raw text, or document upload), we parse the material, feed it to the AI using optimized prompt engineering, and receive a high-quality educational quiz structure in seconds."
    },
    {
      question: "What document formats are supported?",
      answer: "We fully support standard PDF documents (.pdf) and Microsoft Word files (.docx). Our backend automatically extracts the text content from these files and generates questions based only on the material inside the documents."
    },
    {
      question: "Can I customize the quiz difficulty and length?",
      answer: "Yes! For every generation method, you can select your desired difficulty level (Easy, Medium, or Hard) and the number of questions you want (5, 10, 15, or 20 questions)."
    },
    {
      question: "Is QuizGenius AI free to use?",
      answer: "We offer a fully featured free tier where you can generate quizzes, review results, and track your history. A valid Gemini API key is configured on the platform, and you can also plug in your own key if needed."
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', padding: '40px 24px max(80px, 8vh)' }}>
      
      {/* Hero Section */}
      <section style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center', 
        gap: '24px',
        padding: '60px 0 20px',
        position: 'relative'
      }}>
        {/* Glow backdrop */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: -1
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '30px',
          background: 'rgba(79, 70, 229, 0.08)',
          border: '1px solid rgba(79, 70, 229, 0.15)',
          color: 'var(--primary)',
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'Poppins'
        }}>
          <Zap size={14} fill="currentColor" />
          <span>Powered by Gemini 2.5 Flash</span>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(32px, 5vw, 64px)', 
          lineHeight: 1.15,
          maxWidth: '850px',
          fontFamily: 'Poppins, sans-serif',
          background: 'linear-gradient(135deg, var(--text-main) 30%, #7C3AED 70%, #06B6D4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          paddingBottom: '8px'
        }}>
          Instantly Generate Quizzes from Any Source using AI
        </h1>

        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: 'clamp(15px, 2vw, 18px)', 
          maxWidth: '650px',
          lineHeight: 1.6
        }}>
          Transform topics, text paragraphs, PDFs, or DOCX files into beautiful interactive multiple-choice quizzes in seconds. Perfect for students, teachers, and self-learners.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button 
            onClick={() => onNavigate('login')} 
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
          >
            Get Started Free
          </Button>
          <Button 
            onClick={() => {
              const el = document.getElementById('features-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} 
            variant="glass" 
            size="lg"
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features-section" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '32px', color: 'var(--text-main)' }}>Quiz Generation Modes</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '550px', margin: '0 auto' }}>
            Choose from four flexible input formats to build your customized questions.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '24px' 
        }}>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} glow>
            <div style={iconBoxStyle('var(--primary)')}>
              <BookOpen size={24} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Generate by Topic</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Just enter any topic (e.g. 'Quantum Physics') and watch our AI craft relevant educational questions.
            </p>
          </GlassCard>

          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} glow>
            <div style={iconBoxStyle('var(--secondary)')}>
              <FileText size={24} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Generate by Text</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Paste study notes, textbook chapters, or lecture transcript paragraphs to create targeted quizzes.
            </p>
          </GlassCard>

          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} glow>
            <div style={iconBoxStyle('var(--accent)')}>
              <UploadCloud size={24} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Upload PDFs</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Drop your lecture slides, documents, or reports, and let our backend automatically parse and quiz you.
            </p>
          </GlassCard>

          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} glow>
            <div style={iconBoxStyle('#EC4899')}>
              <FileText size={24} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Upload DOCX Files</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Import Microsoft Word documents containing study material or essays to test your comprehension.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '40px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '32px', color: 'var(--text-main)' }}>Premium SaaS Features Built-in</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            QuizGenius AI is engineered to feel like a premium tool you would use daily. From deep insights to interactive learning widgets, we've got you covered.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ShieldCheck size={20} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '15px' }}>JWT Secured Session Management</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Your authentication and data are fully safe, utilizing standard password hashing.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Zap size={20} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '15px' }}>Progress Tracking & Circular Stats</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Monitor your accuracy, weekly completion rates, and highest attempt scores instantly.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Award size={20} color="var(--secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '15px' }}>Gamified Profile Achievements</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Unlock custom badges like 'Einstein Status' or 'Speed Runner' by doing perfect attempts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mockup Dashboard Card */}
        <GlassCard style={{ 
          border: '1px solid rgba(124, 58, 237, 0.2)',
          boxShadow: '0 20px 50px rgba(124, 58, 237, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }} hoverEffect={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Quiz Review Demo</span>
            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 600 }}>80% Score</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
              Q: Which of the following is correct about SQLite databases?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={demoOptionStyle('rgba(16, 185, 129, 0.1)', 'var(--success)', '1px solid rgba(16, 185, 129, 0.3)')}>
                ✓ It is a serverless, self-contained SQL database engine.
              </div>
              <div style={demoOptionStyle('rgba(239, 68, 68, 0.08)', 'var(--error)', '1px solid rgba(239, 68, 68, 0.2)')}>
                ✗ It requires a separate server process to run queries.
              </div>
              <div style={demoOptionStyle('transparent', 'var(--text-muted)', '1px solid var(--card-border)')}>
                It is written in Java and only supports memory files.
              </div>
            </div>
            <div style={{
              fontSize: '12px',
              backgroundColor: 'rgba(79, 70, 229, 0.05)',
              padding: '10px',
              borderRadius: '8px',
              borderLeft: '3px solid var(--primary)',
              color: 'var(--text-muted)'
            }}>
              <strong>Explanation:</strong> SQLite reads and writes directly to ordinary disk files. It is serverless and self-contained, making it highly portable.
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Testimonials */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <h2 style={{ fontSize: '32px', textAlign: 'center', color: 'var(--text-main)' }}>Loved by Learners</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} hoverEffect={false}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic', lineHeight: 1.6 }}>
              "QuizGenius AI is a lifesaver for exam preparation. I upload my lecture PDFs, and it builds custom quiz cards matching my slides in seconds. I've improved my scores significantly!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={avatarStyle('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop')} />
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-main)' }}>Sarah Jenkins</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Biology Undergrad Student</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} hoverEffect={false}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic', lineHeight: 1.6 }}>
              "As a trainer, creating assessments was extremely tedious. QuizGenius has cut down my quiz-building time from hours to minutes. The explanations are highly accurate!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={avatarStyle('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop')} />
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-main)' }}>David Miller</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Corporate IT Trainer</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} hoverEffect={false}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic', lineHeight: 1.6 }}>
              "I love self-learning. This application is my personal tutor. I paste book extracts, generate 15-question hard quizzes, and test myself. The layout is beautiful and smooth."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={avatarStyle('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop')} />
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-main)' }}>Elena Rostova</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Self-Taught Developer</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: '32px', textAlign: 'center', color: 'var(--text-main)' }}>Frequently Asked Questions</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => (
            <GlassCard 
              key={index}
              onClick={() => toggleFaq(index)} 
              padding="16px 24px"
              hoverEffect={false}
              style={{ display: 'flex', flexDirection: 'column', gap: activeFaq === index ? '12px' : '0px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '15px' }}>{faq.question}</span>
                <ChevronDown 
                  size={18} 
                  color="var(--text-muted)" 
                  style={{ 
                    transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} 
                />
              </div>
              {activeFaq === index && (
                <div style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '14px', 
                  lineHeight: 1.5,
                  paddingTop: '8px',
                  borderTop: '1px solid var(--card-border)',
                  animation: 'fade-slide-down 0.2s ease-out'
                }}>
                  {faq.answer}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Call to Action Footer Panel */}
      <GlassCard style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        textAlign: 'center',
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        marginTop: '40px'
      }} hoverEffect={false}>
        <h2 style={{ fontSize: '28px', color: 'var(--text-main)' }}>Ready to Test Your Knowledge?</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px' }}>
          Create an account in 10 seconds and start generating customized quizzes instantly.
        </p>
        <Button onClick={() => onNavigate('register')} size="lg">Sign Up Now</Button>
      </GlassCard>

      {/* Simple Footer Links */}
      <footer style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        borderTop: '1px solid var(--card-border)',
        paddingTop: '32px',
        color: 'var(--text-muted)',
        fontSize: '13px'
      }}>
        <div>© 2026 QuizGenius AI. All rights reserved.</div>
      </footer>

      {/* Animation helper styles */}
      <style>{`
        @keyframes fade-slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Styling helper functions
const iconBoxStyle = (bgColor) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: bgColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 8px 16px ${bgColor}33`
});

const demoOptionStyle = (bgColor, textColor, border) => ({
  fontSize: '13px',
  fontWeight: 500,
  padding: '10px 14px',
  borderRadius: '10px',
  backgroundColor: bgColor,
  color: textColor,
  border: border,
  textAlign: 'left'
});

const avatarStyle = (url) => ({
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundImage: `url(${url})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  border: '2px solid rgba(124, 58, 237, 0.2)'
});
