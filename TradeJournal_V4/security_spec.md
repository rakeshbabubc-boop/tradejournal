# TradeJournal Security Specification & Dirty Dozen Audit

## 1. Data Invariants
1. **User Isolation**: A user can strictly read and write ONLY their own `/users/{userId}` profile and `/users/{userId}/**` subcollections. No user can read or modify another user's trades.
2. **Identity Integrity**: `request.auth.uid` must match `{userId}` in every path.
3. **No Blanket Reads**: Every read and list query must enforce `request.auth.uid == userId`.
4. **Temporal Integrity**: `createdAt` must strictly match `request.time` on create, and be immutable on update.
5. **Schema Bounds**: String lengths, number bounds (confidence 1-10), strategy enums, and allowed keys must be strictly validated.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Read**: Attempting to read `/users/userA/trades/trade1` without auth.
2. **Cross-User Data Scraping**: Authenticated `userB` attempting to read `/users/userA/trades`.
3. **Cross-User Trade Injection**: Authenticated `userB` attempting to create `/users/userA/trades/tradeX`.
4. **Ghost Field Poisoning**: Inserting extra unauthorized fields (e.g., `isAdmin: true` or `shadowField: 123`).
5. **Confidence Range Overflow**: Submitting `confidenceLevel: 15` (violating 1-10 range).
6. **Strategy Enum Bypass**: Submitting `strategy: "InsiderTip"` (invalid enum).
7. **Negative or Overflow String Abuse**: Injecting a 2MB string into `symbol` or `notes`.
8. **Path Traversal / ID Poisoning**: Document ID with junk characters or length > 128 chars.
9. **Timestamp Tampering**: Setting `createdAt` to a future or past date instead of `request.time`.
10. **Immutable Field Mutation**: Updating `userId` or `createdAt` after creation.
11. **PII Harvesting**: Querying the `/users` root collection without scoping to `request.auth.uid`.
12. **Unverified Email Access**: Writing data when `request.auth.token.email_verified == false`.
