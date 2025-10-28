/**
 index.js - React Application Entry Point
 
 This file serves as the main entry point for the React application.
 It creates the root React DOM element and renders the main App component
 with React Strict Mode enabled for development debugging.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 