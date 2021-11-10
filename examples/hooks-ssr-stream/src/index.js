import React from 'react';
import { hydrateRoot } from 'react-dom';
import App from './App';

const __SERVER_STATE__ = window.__SERVER_STATE__;

delete window.__SERVER_STATE__;

hydrateRoot(document, <App serverState={__SERVER_STATE__} />);
