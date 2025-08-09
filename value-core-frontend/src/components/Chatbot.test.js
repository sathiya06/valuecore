import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chatbot from './Chatbot';

describe('Chatbot', () => {
  const mockUpdateField = jest.fn();

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ answer: 'Test answer', action: null }),
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders initial bot message', () => {
    render(<Chatbot uiContext={{}} updateField={mockUpdateField} />);
    expect(
      screen.getByText(/Hello! I can answer questions and update your ROI fields./i)
    ).toBeInTheDocument();
  });

  test('sends user message and displays response', async () => {
    render(<Chatbot uiContext={{}} updateField={mockUpdateField} />);

    fireEvent.change(
      screen.getByPlaceholderText(/Ask about ROI or update values/i),
      { target: { value: 'Hi' } }
    );
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    expect(screen.getByText('Hi')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('Test answer')).toBeInTheDocument()
    );
  });
});