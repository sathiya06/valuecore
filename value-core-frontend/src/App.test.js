import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./pages/MainPage', () => () => <div>Mock MainPage</div>);

test('renders MainPage component', () => {
  render(<App />);
  const heading = screen.getByText(/Mock MainPage/i);
  expect(heading).toBeInTheDocument();
});