import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Processing from './pages/Processing';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-neo-white text-neo-black selection:bg-neo-purple selection:text-white">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/processing/:jobId" element={<Processing />} />
          <Route path="/results/:jobId" element={<Results />} />
        </Routes>
      </Router>
      <Toaster 
        theme="light" 
        position="top-right"
        toastOptions={{
          style: {
            background: '#F2EDE7',
            border: '2px solid #0A0A0C',
            color: '#0A0A0C',
            borderRadius: '0px',
            boxShadow: '4px 4px 0px 0px #0A0A0C',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 500,
          },
          className: 'font-bold'
        }}
      />
    </div>
  );
}

export default App;
