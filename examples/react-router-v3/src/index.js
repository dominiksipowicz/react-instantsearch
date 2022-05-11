import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router, Route, browserHistory } from 'react-router';
import 'instantsearch.css/themes/algolia.css';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <Router history={browserHistory}>
    <Route path="/" component={App} />
  </Router>
);
