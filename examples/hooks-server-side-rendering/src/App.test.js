import React from 'react';
import renderer from 'react-test-renderer';
import App from './App';

describe('Server-side rendering recipes', () => {
  it('App renders without crashing', () => {
    const props = {
      initialResults: undefined,
    };

    const component = renderer.create(<App {...props} />);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
