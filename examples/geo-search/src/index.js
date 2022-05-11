import React from 'react';
import { createRoot } from 'react-dom/client';
import 'instantsearch.css/themes/algolia.css';
import App from './App';
import './style.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
