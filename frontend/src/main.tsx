import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// main.tsx — точка входа. React "вешает" приложение в контейнер #root из index.html
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
