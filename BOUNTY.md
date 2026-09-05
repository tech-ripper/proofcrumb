# Cookie Chain bounty handoff

## Target

- Listing: https://superteam.fun/earn/listing/create-an-app-on-cookie-chain-app
- Status checked: open on 2026-09-05
- Deadline: 2026-09-22 21:59:59 UTC / 2026-09-23 05:59:59 UTC+8
- Pool: 1,000 USDC; two 500 USDC winners
- Competition observed at selection: one submitted entry
- Eligibility: global, human-only submission

## What is ready

- Working React/TypeScript prototype
- Nightly-compatible Wallet Standard connection
- Cookie Chain RPC health check
- Versioned proof-of-work memo format
- Transaction creation and confirmation flow
- Receipt activity and CookieScan links
- Automated tests and production build
- README, MIT license, and local git history

## Human / live-value gates remaining

1. Approve publication of the source repository and live app.
2. Sign in to or create the human Superteam Earn profile used to submit.
3. Connect a Nightly wallet to Cookie Chain.
4. Fund only enough COOK for the demonstration transaction; no funds have been moved.
5. Approve and sign the demonstration transaction.
6. Approve the public X demo thread and sharing it in the Cookie Chain Telegram community.
7. Submit the live URL, GitHub repository, and transaction/application details before the deadline.

## Pre-publication work still required

- Test with a real Nightly wallet and confirmed Cookie Chain transaction.
- Review or replace the Solana wallet-adapter dependency tree: `npm audit --omit=dev` currently reports 19 transitive advisories (12 moderate, 7 high, 0 critical), including React Native packages that are not used by the browser build and web3.js dependencies without an available upstream fix.
- Split the 634 kB JavaScript bundle before final publication if time permits.
- Capture a short demo video or screenshots.
- Deploy the static build.
- Publish the repository and X thread.

Do not include private client data, credentials, or proprietary deliverables in a receipt; the memo is public.
