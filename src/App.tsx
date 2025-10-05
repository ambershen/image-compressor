import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Processing from './pages/Processing';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/processing/:jobId" element={<Processing />} />
          <Route path="/results/:jobId" element={<Results />} />
        </Routes>
      </Router>
      <Toaster 
        theme="dark" 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            border: '1px solid #32F08C',
            color: '#ffffff',
          },
        }}
      />
    </div>
  );
}

export default App;
