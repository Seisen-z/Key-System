# Reiya website changelog

## v1.1.18 - 2026-10-10

### Added
- My Premium account portal with email-code login, saved keys, downloads and refund requests.
- Purchase key save/copy dialog and email key backup.

### Improved
- Expired subscriptions keep all local Free-mode data; cloud features pause until renewal.
- Authenticated account metadata sync with verified ownership; plaintext cloud credentials removed.
- Premium status uses database time and clear active, expired, disabled and refunded states.

### Fixed
- Completed refunds revoke keys, stop renewal, and purge cloud backups and owned metadata.
- Local erasure occurs only after a completed refund with explicit customer consent, when the updated app reconnects.
- Refund requests and pending refunds do not erase data; ordinary expiration never triggers refund erasure.

## v1.1.17 - 2026-10-10

### Added
- Premium cloud backup and restore in the same app, activated with a Premium key.
- Optional automatic cloud backups and support for up to three activated computers.
- Seven recurring seasonal themes with matching cartoon artwork and manual overrides.

### Improved
- Cloud backups retain up to five snapshots, each for 15 days after upload.
- Expired cloud snapshots are automatically deleted and excluded from restore.
- The website now includes a redesigned homepage, actual-app browser demo, Premium plans, and policy pages.
- Website admin sections use separate tabs, sortable metadata, ten-row pagination, and audited Premium access controls.

### Fixed
- Cloud restore replaces stale managed data and commits preferences after successful file restoration.
- Restore failures recover destination files and preferences.
- Premium access controls now display validation and updated expiry/status after changes.
- Local checkout stays on localhost; production uses the HTTPS website.
