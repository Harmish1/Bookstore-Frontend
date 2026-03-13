import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import LoginPage from './components/LoginPage'
import HelpCentre from './HelpCentre'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/help" element={<HelpCentre onBack={() => window.history.back()} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)