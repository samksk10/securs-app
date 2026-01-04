import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

/* IMPORT BOOTSTRAP - RIEN D'AUTRE */
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

/* CSS personnalisé SÉCURIS */
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)