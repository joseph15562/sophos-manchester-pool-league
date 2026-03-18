import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import PasswordGate from './components/PasswordGate'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PasswordGate>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PasswordGate>
  </StrictMode>,
)
