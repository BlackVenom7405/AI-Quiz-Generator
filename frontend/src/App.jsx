import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizGenerate from './pages/QuizGenerate';
import QuizPlay from './pages/QuizPlay';
import QuizResult from './pages/QuizResult';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [toast, setToast] = useState(null);
  
  // Active quiz session states
  const [activeQuizData, setActiveQuizData] = useState(null);
  const [activeQuizResult, setActiveQuizResult] = useState(null);

  // Auto-redirect if authenticated and landing page
  React.useEffect(() => {
    if (isAuthenticated && currentPage === 'landing') {
      setCurrentPage('dashboard');
    } else if (!isAuthenticated && currentPage !== 'landing' && currentPage !== 'login' && currentPage !== 'register') {
      setCurrentPage('landing');
    }
  }, [isAuthenticated, currentPage]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleStartQuiz = (quizData) => {
    setActiveQuizData(quizData);
    setCurrentPage('play');
  };

  const handleQuizSubmitted = (resultData) => {
    setActiveQuizResult(resultData);
    setCurrentPage('result');
  };

  const handleSelectQuizHistory = async (quizId) => {
    try {
      // Fetch quiz details from history
      const { api } = await import('./services/api');
      const details = await api.getQuizDetails(quizId);
      setActiveQuizResult(details);
      setCurrentPage('result');
    } catch (e) {
      setToast({ message: 'Failed to retrieve quiz details.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--text-main)',
        fontSize: '18px',
        fontWeight: 600,
        fontFamily: 'Poppins'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span>Restoring Session...</span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      
      {/* Floating Animated Background Blobs */}
      <div className="bg-blob-container">
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>
        <div className="bg-blob blob-3"></div>
      </div>

      {/* Main Navbar */}
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Main Layout Area */}
      <main style={{ minHeight: 'calc(100vh - 120px)' }}>
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && <Login onNavigate={handleNavigate} setToast={setToast} />}
        {currentPage === 'register' && <Register onNavigate={handleNavigate} setToast={setToast} />}
        {currentPage === 'dashboard' && (
          <Dashboard 
            onNavigate={handleNavigate} 
            onSelectQuiz={handleSelectQuizHistory} 
            setToast={setToast} 
          />
        )}
        {currentPage === 'generate' && (
          <QuizGenerate 
            onStartQuiz={handleStartQuiz} 
            setToast={setToast} 
          />
        )}
        {currentPage === 'play' && activeQuizData && (
          <QuizPlay 
            quizData={activeQuizData} 
            onSubmitted={handleQuizSubmitted} 
            setToast={setToast} 
          />
        )}
        {currentPage === 'result' && activeQuizResult && (
          <QuizResult 
            resultData={activeQuizResult} 
            onNavigate={handleNavigate} 
            setToast={setToast} 
          />
        )}
        {currentPage === 'history' && (
          <History 
            onSelectQuiz={handleSelectQuizHistory} 
            onNavigate={handleNavigate} 
            setToast={setToast} 
          />
        )}
        {currentPage === 'profile' && <Profile setToast={setToast} />}
        {currentPage === 'admin' && <AdminPanel setToast={setToast} />}
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
