import { describe, expect, it } from 'vitest';
import {
  createReceiptMemo,
  extractReceiptFromLog,
  validateReceiptInput,
} from './receipt';

describe('proof receipt', () => {
  it('creates a deterministic, versioned memo', async () => {
    const first = await createReceiptMemo({
      task: 'Ship Telegram alert deduplication',
      deliverableUrl: 'https://github.com/example/repo/pull/42',
      completedAt: '2026-09-05T02:30:00.000Z',
    });
    const second = await createReceiptMemo({
      task: 'Ship Telegram alert deduplication',
      deliverableUrl: 'https://github.com/example/repo/pull/42',
      completedAt: '2026-09-05T02:30:00.000Z',
    });

    expect(first).toBe(second);
    expect(first.startsWith('PROOFCRUMB:v1:')).toBe(true);
    expect(new TextEncoder().encode(first).byteLength).toBeLessThanOrEqual(566);
  });

  it('rejects invalid or unsafe receipt input', () => {
    expect(validateReceiptInput({ task: '', deliverableUrl: 'https://example.com' })).toBe('Describe the completed work.');
    expect(validateReceiptInput({ task: 'done', deliverableUrl: 'javascript:alert(1)' })).toBe('Use a valid HTTPS deliverable URL.');
    expect(validateReceiptInput({ task: 'x'.repeat(281), deliverableUrl: 'https://example.com' })).toBe('Keep the work description under 280 characters.');
  });

  it('extracts only ProofCrumb receipts from transaction logs', () => {
    const encoded = 'PROOFCRUMB:v1:eyJ0YXNrIjoiRG9uZSJ9';
    const logs = [
      'Program log: Memo (len 10): unrelated',
      `Program log: Memo (len 42): ${encoded}`,
    ];

    expect(extractReceiptFromLog(logs)).toBe(encoded);
    expect(extractReceiptFromLog(['Program log: no receipt'])).toBeNull();
  });
});
