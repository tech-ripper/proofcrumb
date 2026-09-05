import { Buffer } from 'buffer';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';

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

export function assertSufficientCookieBalance(balanceBaseUnits: number, feeBaseUnits: number | null): void {
  if (feeBaseUnits === null) {
    throw new Error('Cookie Chain could not estimate the transaction fee.');
  }
  if (balanceBaseUnits < feeBaseUnits) {
    throw new Error('Fund this wallet with native COOK on Cookie Chain before signing.');
  }
}

export async function signAndBroadcastTransaction(
  transaction: Transaction,
  signTransaction: ((transaction: Transaction) => Promise<Transaction>) | undefined,
  connection: Pick<Connection, 'sendRawTransaction'>,
): Promise<string> {
  if (!signTransaction) {
    throw new Error('Nightly cannot sign this Cookie Chain transaction without broadcasting it to Solana.');
  }

  const signedTransaction = await signTransaction(transaction);
  return connection.sendRawTransaction(signedTransaction.serialize(), {
    preflightCommitment: 'confirmed',
  });
}

export function explorerTransactionUrl(signature: string): string {
  return `${COOKIE_EXPLORER_URL}/tx/${encodeURIComponent(signature)}`;
}
