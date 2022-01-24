import * as React from 'react';
import { render } from '@testing-library/react';
import App from './App';

describe('<App>', () => {
  it('renders Hello', () => {
    const { getByText } = render(<App />);
    const element = getByText(/Hello/i);
    expect(document.body.contains(element));
  });
});
