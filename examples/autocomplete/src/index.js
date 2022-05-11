import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App-Multi-Index';
import Mentions from './App-Mentions';

const root = createRoot(
  document.getElementById('autocomplete-with-multi-indices')
);
root.render(<App />);

const mentionsRoot = createRoot(
  document.getElementById('autocomplete-mentions')
);
mentionsRoot.render(<Mentions />);
