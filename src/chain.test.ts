import { describe, expect, it } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { buildReceiptTransaction, MEMO_PROGRAM_ID } from './chain';

describe('Cookie Chain transaction', () => {
  it('builds a memo transaction signed by the connected wallet', () => {
    const signer = new PublicKey('11111111111111111111111111111111');
    const tx = buildReceiptTransaction('PROOFCRUMB:v1:abc', signer);

    expect(tx.instructions).toHaveLength(1);
    expect(tx.instructions[0].programId.toBase58()).toBe(MEMO_PROGRAM_ID.toBase58());
    expect(tx.instructions[0].keys[0].pubkey.toBase58()).toBe(signer.toBase58());
    expect(tx.instructions[0].keys[0].isSigner).toBe(true);
    expect(new TextDecoder().decode(tx.instructions[0].data)).toBe('PROOFCRUMB:v1:abc');
  });
});
