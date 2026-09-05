import { describe, expect, it } from 'vitest';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  buildReceiptTransaction,
  MEMO_PROGRAM_ID,
  assertSufficientCookieBalance,
  signAndBroadcastTransaction,
} from './chain';

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

  it('rejects a receipt before signing when native Cookie Chain COOK is insufficient', () => {
    expect(() => assertSufficientCookieBalance(0, 5_000)).toThrow(/fund.*native COOK/i);
    expect(() => assertSufficientCookieBalance(5_000, 5_000)).not.toThrow();
  });

  it('broadcasts the wallet-signed bytes through the Cookie Chain connection', async () => {
    const signer = new PublicKey('11111111111111111111111111111111');
    const tx = buildReceiptTransaction('PROOFCRUMB:v1:abc', signer);
    const signedBytes = Uint8Array.from([1, 2, 3]);
    const signed = { serialize: () => signedBytes } as Transaction;
    const sent: Uint8Array[] = [];

    const signature = await signAndBroadcastTransaction(
      tx,
      async () => signed,
      {
        sendRawTransaction: async (bytes: Uint8Array) => {
          sent.push(bytes);
          return 'cookie-chain-signature';
        },
      },
    );

    expect(signature).toBe('cookie-chain-signature');
    expect(sent).toEqual([signedBytes]);
  });
});
