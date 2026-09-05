import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { buildReceiptTransaction, COOKIE_RPC_URL, explorerTransactionUrl } from './chain';
import { createReceiptMemo, extractReceiptFromLog, validateReceiptInput } from './receipt';
import './styles.css';
import '@solana/wallet-adapter-react-ui/styles.css';

type ReceiptActivity = {
  signature: string;
  confirmedAt: number | null;
};

function shorten(value: string, head = 6, tail = 5) {
  return value.length <= head + tail ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function ReceiptDashboard() {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const [task, setTask] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [activity, setActivity] = useState<ReceiptActivity[]>([]);
  const [network, setNetwork] = useState<'checking' | 'online' | 'offline'>('checking');
  const [status, setStatus] = useState('Ready when your work is.');
  const [submitting, setSubmitting] = useState(false);

  const validationError = useMemo(
    () => (task || deliverableUrl ? validateReceiptInput({ task, deliverableUrl }) : null),
    [task, deliverableUrl],
  );

  const refreshActivity = useCallback(async () => {
    if (!publicKey) {
      setActivity([]);
      return;
    }
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });
    const receiptRows: ReceiptActivity[] = [];
    for (const row of signatures) {
      const transaction = await connection.getTransaction(row.signature, {
        maxSupportedTransactionVersion: 0,
      });
      if (extractReceiptFromLog(transaction?.meta?.logMessages)) {
        receiptRows.push({ signature: row.signature, confirmedAt: row.blockTime ?? null });
      }
    }
    setActivity(receiptRows);
  }, [connection, publicKey]);

  useEffect(() => {
    connection
      .getVersion()
      .then(() => setNetwork('online'))
      .catch(() => setNetwork('offline'));
  }, [connection]);

  useEffect(() => {
    refreshActivity().catch(() => setStatus('Connected, but receipt history could not be loaded.'));
  }, [refreshActivity]);

  async function submitReceipt(event: React.FormEvent) {
    event.preventDefault();
    if (!publicKey) {
      setStatus('Connect Nightly before issuing a receipt.');
      return;
    }
    const error = validateReceiptInput({ task, deliverableUrl });
    if (error) {
      setStatus(error);
      return;
    }

    setSubmitting(true);
    setStatus('Preparing your tamper-evident receipt…');
    try {
      const memo = await createReceiptMemo({ task, deliverableUrl });
      const transaction = buildReceiptTransaction(memo, publicKey);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      const signature = await sendTransaction(transaction, connection);
      setStatus('Confirming on Cookie Chain…');
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
      setStatus(`Receipt confirmed: ${shorten(signature, 8, 8)}`);
      setTask('');
      setDeliverableUrl('');
      await refreshActivity();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction failed.';
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="ProofCrumb home">
          <span className="brand-mark">P</span>
          <span>ProofCrumb</span>
        </a>
        <div className="nav-actions">
          <span className={`network ${network}`}><i /> Cookie Chain {network}</span>
          <WalletMultiButton />
        </div>
      </nav>

      <section id="top" className="hero">
        <div className="eyebrow">VERIFIABLE DELIVERY FOR HUMANS + AGENTS</div>
        <h1>Proof of work that<br />lives on-chain.</h1>
        <p className="hero-copy">
          Turn a finished task and its public deliverable into a permanent Cookie Chain receipt—signed by your wallet, timestamped by the network, and easy to verify.
        </p>
        <div className="hero-pills">
          <span>No account database</span><span>Sub-second finality</span><span>Open receipt format</span>
        </div>
      </section>

      <section className="workspace">
        <div className="composer card">
          <div className="section-heading">
            <div><span className="step">01</span><h2>Issue a work receipt</h2></div>
            <span className="status-dot">{connected ? 'WALLET READY' : 'CONNECT NIGHTLY'}</span>
          </div>
          <form onSubmit={submitReceipt}>
            <label htmlFor="task">What was completed?</label>
            <textarea id="task" value={task} maxLength={280} onChange={(event) => setTask(event.target.value)} placeholder="Example: Shipped idempotent Telegram alert delivery" />
            <div className="field-meta"><span>Specific, public-safe descriptions work best.</span><span>{task.length}/280</span></div>

            <label htmlFor="deliverable">Deliverable URL</label>
            <input id="deliverable" type="url" value={deliverableUrl} onChange={(event) => setDeliverableUrl(event.target.value)} placeholder="https://github.com/you/project/pull/42" />
            <p className="hint">The URL and description are hashed together before signing.</p>

            <button className="issue-button" type="submit" disabled={submitting || Boolean(validationError)}>
              {submitting ? 'Issuing receipt…' : connected ? 'Issue on-chain receipt' : 'Connect wallet to continue'}
              <span>↗</span>
            </button>
            <div className="transaction-status" role="status">{status}</div>
          </form>
        </div>

        <aside className="side-stack">
          <div className="card metric-card">
            <div className="section-heading compact"><div><span className="step">02</span><h2>Your proof ledger</h2></div></div>
            <div className="metrics">
              <div><strong>{activity.length.toString().padStart(2, '0')}</strong><span>Receipts found</span></div>
              <div><strong>{network === 'online' ? '~1s' : '—'}</strong><span>Network finality</span></div>
            </div>
            <div className="wallet-line">
              <span>Signer</span>
              <code>{publicKey ? shorten(publicKey.toBase58(), 9, 7) : 'Not connected'}</code>
            </div>
          </div>

          <div className="card activity-card">
            <div className="activity-title"><h3>Recent receipts</h3><button onClick={() => refreshActivity()} disabled={!publicKey}>Refresh</button></div>
            {activity.length ? (
              <ol>
                {activity.slice(0, 5).map((receipt) => (
                  <li key={receipt.signature}>
                    <span className="receipt-icon">✓</span>
                    <div><b>Work receipt confirmed</b><small>{receipt.confirmedAt ? new Date(receipt.confirmedAt * 1000).toLocaleString() : 'On-chain'}</small></div>
                    <a href={explorerTransactionUrl(receipt.signature)} target="_blank" rel="noreferrer">View ↗</a>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="empty-state"><span>⌁</span><p>Your first confirmed receipt will appear here.</p></div>
            )}
          </div>
        </aside>
      </section>

      <section className="how-it-works">
        <div><span>1</span><h3>Describe</h3><p>Add the completed work and a public deliverable.</p></div>
        <div><span>2</span><h3>Sign</h3><p>Nightly signs one low-cost Cookie Chain memo transaction.</p></div>
        <div><span>3</span><h3>Verify</h3><p>Share the explorer link as permanent delivery evidence.</p></div>
      </section>

      <footer><span>ProofCrumb</span><p>Open-source proof-of-delivery infrastructure on Cookie Chain.</p><a href="https://cookiescan.io" target="_blank" rel="noreferrer">Explore Cookie Chain ↗</a></footer>
    </main>
  );
}

export default function App() {
  const endpoint = useMemo(() => COOKIE_RPC_URL, []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <ReceiptDashboard />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
