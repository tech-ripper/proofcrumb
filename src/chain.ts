import { Buffer } from 'buffer';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';

export const COOKIE_RPC_URL = 'https://rpc.cookiescan.io';
export const COOKIE_EXPLORER_URL = 'https://cookiescan.io';
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export function buildReceiptTransaction(memo: string, signer: PublicKey): Transaction {
  const instruction = new TransactionInstruction({
    keys: [{ pubkey: signer, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, 'utf8'),
  });
  return new Transaction().add(instruction);
}

export function explorerTransactionUrl(signature: string): string {
  return `${COOKIE_EXPLORER_URL}/tx/${encodeURIComponent(signature)}`;
}
