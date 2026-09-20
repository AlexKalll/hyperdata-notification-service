# Changes
This file documents modifications made to the upstream project in compliance with
Section 4(b) of the Apache License, Version 2.0.

## Upstream
- **Original project:** [dave/leyu-notification-service](https://github.com/dav-lab12/leyu-notification-service)
- **License:** Apache License 2.0
- **Fork:** [iCog-Labs-Dev/hyperdata-notification-service](https://github.com/iCog-Labs-Dev/hyperdata-notification-service)

### 2026-08-03: Rebranding to Mahder

### 2026-09-19: Local E2E configuration
- Fixed the TypeORM schema configuration typo (`DATABASE_SCHEMAA` to `DATABASE_SCHEMA`).
- Documented the required `DB_URL` and `DATABASE_SCHEMA` variables for local PostgreSQL and Docker-network setup.

## How to record future changes
- When making non-trivial modifications, add a short entry under a new dated section below
- Split commits by cohesive behavior or deployable concern, use Conventional Commit messages
- Do not include documentation-only files in implementation commits (exception: CHANGES.md may be committed separately)
- Before committing implementation changes, record a concise, dated summary in this file
