import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders school map title', () => {
  render(<App />);
  const titleElement = screen.getByText(/School Map/i);
  expect(titleElement).toBeInTheDocument();
});