const MEMO_PREFIX = 'PROOFCRUMB:v1:';
const MAX_MEMO_BYTES = 566;

export type ReceiptInput = {
  task: string;
  deliverableUrl: string;
  completedAt?: string;
};

export function validateReceiptInput(input: Pick<ReceiptInput, 'task' | 'deliverableUrl'>): string | null {
  const task = input.task.trim();
  if (!task) return 'Describe the completed work.';
  if (task.length > 280) return 'Keep the work description under 280 characters.';

  try {
    const url = new URL(input.deliverableUrl);
    if (url.protocol !== 'https:' || !url.hostname) return 'Use a valid HTTPS deliverable URL.';
  } catch {
    return 'Use a valid HTTPS deliverable URL.';
  }

  return null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).split('+').join('-').split('/').join('_').replace(/=+$/, '');
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(digest));
}

export async function createReceiptMemo(input: ReceiptInput): Promise<string> {
  const validationError = validateReceiptInput(input);
  if (validationError) throw new Error(validationError);

  const task = input.task.trim();
  const deliverableUrl = new URL(input.deliverableUrl).toString();
  const completedAt = input.completedAt ?? new Date().toISOString();
  const payload = {
    completedAt,
    deliverable: deliverableUrl,
    proof: await sha256(`${task}\n${deliverableUrl}\n${completedAt}`),
    task,
  };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const memo = `${MEMO_PREFIX}${encoded}`;

  if (new TextEncoder().encode(memo).byteLength > MAX_MEMO_BYTES) {
    throw new Error('Receipt is too large for an on-chain memo.');
  }
  return memo;
}

export function extractReceiptFromLog(logs: readonly string[] | null | undefined): string | null {
  if (!logs) return null;
  for (const log of logs) {
    const index = log.indexOf(MEMO_PREFIX);
    if (index >= 0) return log.slice(index).trim();
  }
  return null;
}

export { MAX_MEMO_BYTES, MEMO_PREFIX };
