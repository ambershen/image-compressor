import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Processing from './pages/Processing';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <div className="min-h-screen selection:bg-brut-red selection:text-white">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/processing/:jobId" element={<Processing />} />
          <Route path="/results/:jobId" element={<Results />} />
        </Routes>
      </Router>
      <Toaster 
        theme="light" 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#F2EDE7',
            border: '4px solid #0A0A0C',
            color: '#0A0A0C',
            borderRadius: '0px',
            boxShadow: '4px 4px 0px 0px #0A0A0C',
            fontFamily: 'Courier New, monospace',
            fontWeight: 700,
            textTransform: 'uppercase',
          },
          className: 'brutalist-toast'
        }}
      />
    </div>
  );
}

export default App;
