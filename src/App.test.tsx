import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('ProofCrumb app shell', () => {
  it('explains the receipt workflow before a wallet is connected', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /proof of work that lives on-chain/i })).toBeTruthy();
    expect(screen.getAllByText(/cookie chain/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/connect nightly/i)).toBeTruthy();
    expect(screen.getByText('https://rpc.cookiescan.io')).toBeTruthy();
  });
});
