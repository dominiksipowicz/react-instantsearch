import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'instantsearch.css/themes/algolia.css';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Route path="/" component={App} />
  </Router>
);
