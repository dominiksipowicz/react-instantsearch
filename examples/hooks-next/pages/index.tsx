import React from 'react';
import {
  getServerState,
  InstantSearchServerState,
  InstantSearchSSRProvider,
} from 'react-instantsearch-hooks';

import { Search } from '../src/Search';

type AppProps = {
  serverState?: InstantSearchServerState;
};

export default function App({ serverState }: AppProps) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <Search />
    </InstantSearchSSRProvider>
  );
}

export async function getServerSideProps() {
  const serverState = await getServerState(<App />);

  return {
    props: {
      serverState,
    },
  };
}
