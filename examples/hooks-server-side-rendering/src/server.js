import { join } from 'path';
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getServerState } from 'react-instantsearch-hooks';
import App from './App';

const server = express();

server.use('/assets', express.static(join(__dirname, 'assets')));

server.get('/', async (req, res) => {
  const location = {
    ...req._parsedUrl,
    search: req._parsedUrl.search || '',
  };
  const serverState = await getServerState(<App location={location} />);
  const html = renderToString(
    <App serverState={serverState} location={location} />
  );

  res.send(
    `<!DOCTYPE html>
<html>
  <head>
    <script>window.__APP_INITIAL_STATE__ = ${JSON.stringify(
      serverState
    )}</script>
  </head>
  
  <body>
    <div id="root">${html}</div>
  </body>
  
  <script src="/assets/bundle.js"></script>
</html>`
  );
});

server.listen(8080, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on: http://localhost:8080');
});
