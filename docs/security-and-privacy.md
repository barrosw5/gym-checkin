# Security and privacy

**English** · [Português](seguranca-e-privacidade.md)

How gym-checkin protects the residents' data, and why each decision was taken. Everything here describes the code as it is; what is not done yet is listed under [Known gaps](#known-gaps).

## Personal data (GDPR)

Only what the gym needs: no e-mail, phone number, photo or location.

| Data | Why |
| --- | --- |
| Name, room, username | Reception knows who is inside (the room is how the residence identifies people) |
| Password hash (bcrypt) | Login; the password itself is never stored |
| Role, active, account dates | Permissions; deactivated accounts keep their history but cannot log in |
| Visits: entry and exit time, check-in method, who closed it | The occupancy count, reception's daily list and the statistics |
| Entry requests: when, status, which staff member decided | Reception approval method, and an audit of who let whom in |

The public demo holds fake people only. Real residents' data is meant for an on-premises install inside the residence network (roadmap, phase 8), never the cloud demo.

## Who sees what

| | Student | Reception | Admin |
| --- | --- | --- | --- |
| How many people are inside | yes | yes | yes |
| Statistics (counts and averages only) | yes | yes | yes |
| Who is inside, today's visits with names | no | yes | yes |
| Accounts (create, deactivate, change room) | no | no | yes |

- **Statistics are aggregates by design.** The statistics query selects entry and exit times only (no user id, no name), and a test checks that `select`. Averages are time-weighted, so they never show a single visit. The one place with individual visits on a timeline is the staff page, for people who already see the named list.
- **Roles are checked in the API**, not only hidden in the interface: every staff route has a role guard, and the role is read from the database on every request, so a change applies at once.

## Authentication

- **JWT in an `httpOnly` cookie**, never in `localStorage`: JavaScript (and so an XSS bug) cannot read it. `Secure` in production, `SameSite=Lax`, valid for 7 days.
- **Every request re-checks the account.** A deactivated user is locked out immediately, and changing the password logs out every other device (tokens issued before the change stop working).
- **Passwords:** bcrypt (10 rounds). Imported accounts get a random temporary password, shown to the admin once, and must choose their own at first login. Demo accounts cannot change theirs.
- **No user enumeration:** a wrong username, a wrong password and an inactive account give the same answer in the same time (bcrypt runs either way).
- **CSRF:** `SameSite=Lax` keeps the cookie off cross-site `POST`/`PATCH` requests, so another site cannot act as a logged-in resident. No CORS is configured: the app and the API share one origin.

## Rate limits

| Endpoint | Limit |
| --- | --- |
| Login | 5 per minute |
| Password change | 5 per minute, per user |
| Check-in, checkout, entry request | 10 per minute |

## Proof of presence

A QR code printed on paper proves nothing: anyone can photograph it and check in from their room. The check-in method is therefore a swappable component (Strategy pattern), and the residence enables the ones it wants:

- **Rotating QR on a screen.** The code changes every 30 seconds and is an HMAC signature of the time window (compared in constant time). The current and the previous window are accepted, so a photo works for at most about a minute.
- **Reception approval.** The student asks to enter; a person at the desk approves. A request expires after 2 minutes.

Rules that matter live in the database and the API, not in the interface: "one open visit per person" is a partial unique index (`one_open_session_per_user`), so it holds even under two simultaneous requests. Visits left open (a forgotten key) are closed by a job every 5 minutes and marked `AUTO`, so they do not distort the statistics.

## Secrets and configuration

`JWT_SECRET` and `QR_SECRET` come from environment variables and are validated at startup: the API refuses to start without them. Seed passwords also come from the environment, never from the code.

## Known gaps

Listed on purpose, so nobody assumes they exist:

- **Retention:** visits are kept indefinitely. Plan: delete or anonymise visits older than 12 months.
- **Right to erasure:** an account can be deactivated, not deleted. Deleting must also decide what happens to its visits (anonymise rather than delete, to keep the statistics).
- **Right of access:** students cannot list their own visits in the app yet; reception can show them.
- **Security headers:** no Content-Security-Policy or other hardening headers yet.
- **Shared QR photo:** a photo sent to a friend works for up to a minute. Reception approval (or a shorter window) is the answer where that matters.
