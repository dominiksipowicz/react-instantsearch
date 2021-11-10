import React from 'react';
import { hydrateRoot } from 'react-dom';
import App from './App';

const __APP_INITIAL_STATE__ = window.__APP_INITIAL_STATE__;

delete window.__APP_INITIAL_STATE__;

hydrateRoot(
  document.querySelector('#root'),
  <App serverState={__APP_INITIAL_STATE__} />
);
