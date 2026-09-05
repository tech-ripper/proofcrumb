# Cookie Chain bounty handoff

## Target

- Listing: https://superteam.fun/earn/listing/create-an-app-on-cookie-chain-app
- Status checked: open on 2026-09-06
- Deadline: 2026-09-22 21:59:59 UTC / 2026-09-23 05:59:59 UTC+8
- Pool: 1,000 USDC; two 500 USDC winners
- Competition observed on 2026-09-06: six submissions
- Eligibility: global; submission requires the builder's Superteam profile

## Completed deliverables

- Live app: https://tech-ripper.github.io/proofcrumb/
- Public source: https://github.com/tech-ripper/proofcrumb
- Production receipt: https://cookiescan.io/tx/3oYkMA7ySFoUrstEU7BtZoU6s7EArpkgRJ54dcUyTX6ZN8f1oDoXqBA9oWEFmoc8bm7gZd9X7JpuPp4kPhePssfD
- Public demo screenshot: `docs/proofcrumb-receipt-mobile.jpg`
- Nightly wallet connection and connected-address display
- Cookie Chain native-balance and transaction-fee preflight
- Wallet sign-only flow with explicit raw broadcast through the Cookie Chain RPC
- Versioned `PROOFCRUMB:v1` on-chain receipt format
- Transaction confirmation, error feedback, receipt activity, and CookieScan links
- Automated tests, production build, README, and MIT license

## Production proof

The finalized receipt records:

- Task: `Published ProofCrumb, an open-source on-chain proof-of-work receipt app for Cookie Chain.`
- Deliverable: `https://github.com/tech-ripper/proofcrumb`
- Fee: `0.000005 COOK`
- Program: `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`

## Human gates remaining

1. Publish the prepared X thread in `SUBMISSION.md` with the demo screenshot.
2. Share that X thread in https://t.me/TheCookieNetChain.
3. Log into the builder's Superteam Earn profile and submit the prepared links/copy in `SUBMISSION.md`.

## Known non-blocking technical note

`npm audit --omit=dev` previously reported 19 transitive advisories (12 moderate, 7 high, 0 critical), primarily through browser-unused React Native and Solana wallet dependency paths. A forced breaking upgrade was intentionally not applied immediately before submission. The automated suite and production build pass.

Do not include private client data, credentials, recovery phrases, or proprietary deliverables in a receipt; receipt memo content is public.
