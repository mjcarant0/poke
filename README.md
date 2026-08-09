# POKE

POKE is a QA feedback platform for web applications. Instead of vague bug reports, reviewers test live web applications and log structured QA reports containing exact technical metadata (browser, operating system, screen resolution, tested page URL) and screenshot evidence.

Live App: https://app-2b50-3000.prg1.zerops.app/

---

## Overview

POKE helps developers collect clear, actionable bug reports and feedback from community testers. 

Key capabilities:
- Project Submissions: Developers submit live web application URLs, categories, descriptions, and previews.
- Structured QA Logging: Reviewers inspect live apps and submit reports with auto-captured metadata (browser, OS, screen resolution, page URL) and screenshot uploads.
- Developer Dashboard: View incoming reports and track QA metrics over time with interactive analytics.
- Report Status Lifecycle: Transition reports across NOT VIEWED, REVIEWING, IN PROGRESS, FIXED, and CLOSED.
- Threaded Discussion: In-line discussion between developers and reviewers with role badges.
- Project Management: Archive projects to hide them from the reviewer feed or delete them permanently.

---

## Architecture & Zerops Deployment

POKE is a full-stack Next.js application hosted entirely on Zerops, utilizing Zerops Node.js 22 runtime and a native Zerops PostgreSQL database service.

- Hosting & Infrastructure: Zerops (Next.js Node.js 22 service)
- Database: Zerops PostgreSQL (connected via Prisma ORM)
- Application Stack: Next.js App Router, TypeScript, Tailwind CSS

### How Zerops is Used

Zerops hosts both the application runtime container and the native PostgreSQL database service.

Deployment process:
1. Zerops PostgreSQL Database Service:
   - Dedicated PostgreSQL database service provisioned natively on Zerops.
   - Dynamically exposes database credentials (`db_user`, `db_password`, `db_hostname`, `db_port`) for secure inter-service connection.

2. Node.js 22 Build Service:
   - Installs Alpine system dependencies (`openssl`) required for the Prisma ORM engine.
   - Installs application packages (`npm ci`).
   - Generates Prisma client types (`npx prisma generate`).
   - Compiles the production Next.js application (`npm run build`).

3. Deployment Package:
   - Deploys compiled Next.js output, static assets, node modules, and Prisma schema files.

4. Node.js 22 Runtime Service:
   - Connects to Zerops PostgreSQL via dynamic environment variable interpolation (`postgresql://${db_user}:${db_password}@${db_hostname}:${db_port}/db?schema=public`).
   - Synchronizes database schema automatically on container startup (`npx prisma db push`).
   - Serves HTTP web traffic on port 3000 (`npm start`).

---

## Author & AI Disclosure

The product idea, application concept, features, and UI/UX design were created entirely by the author. AI development tools (including Antigravity AI / Gemini 3.6 Flash) were used for assistance during development for code editing, refactoring, and documentation drafting. All application code, UI/UX design, database structures, and deployment configurations were built, directed, and reviewed by the author.
