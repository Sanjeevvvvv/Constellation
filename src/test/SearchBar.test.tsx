import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from './render';
import { SearchBar } from '../components/SearchBar';

describe('SearchBar', () => {
  it('renders labeled search input', () => {
    render(<SearchBar />);
    const input = screen.getByRole('searchbox', { name: /search receipts/i });
    expect(input).toBeTruthy();
  });

  it('accepts search text and shows a clear button that resets it', () => {
    const { ctx } = render(<SearchBar />);
    const input = screen.getByRole('searchbox', { name: /search receipts/i }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(ctx.getState().filters.search).toBe('hello');
    const clear = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clear);
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
    expect(ctx.getState().filters.search).toBe('');
  });
});
