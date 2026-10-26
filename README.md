# Ishmael Munyalo Portfolio

A responsive, multi-page portfolio built with HTML, CSS, and vanilla JavaScript, with an Express and SQLite backend for project content, administrator-only image uploads, and contact messages. Existing pages and image paths remain in place.

## Project structure

```text
my-portfolio/
├── index.html, about.html, skills.html, projects.html
├── services.html, education.html, contact.html, admin.html
├── css/style.css
├── js/script.js, js/admin.js
├── images/                    # Existing favicon and portfolio images
├── documents/                 # Existing CV document
├── backend/
│   ├── server.js
│   ├── config/                # Environment and SQLite connection
│   ├── controllers/           # API request handling
│   ├── middleware/            # Authentication, validation, sessions, uploads
│   ├── models/                # SQLite data access
│   ├── routes/                # Public, admin, authentication, contact APIs
│   ├── scripts/seedAdmin.js
│   ├── data/                  # Local SQLite database (created at runtime)
│   └── uploads/               # Administrator-uploaded images
├── .env.example
├── .gitignore
└── package.json
```

## Requirements

- Node.js 20 or later and npm.
- SQLite is included through `better-sqlite3`; no separate database service is needed.

Install the project dependencies:

```bash
npm install
```

The application uses Express, `better-sqlite3`, `express-session`, `bcryptjs`, Helmet, Multer, `express-rate-limit`, and dotenv.

## Configure the administrator and session secret

Copy `.env.example` to `.env` and replace the example values with private values. Set `SESSION_SECRET` to a randomly generated value of at least 32 characters. Choose a unique admin password of at least 12 characters. Do not commit `.env`.

PowerShell can create a strong session secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Seed the first administrator once:

```bash
npm run seed:admin
```

The seeder hashes the password before storing it and refuses to overwrite an existing administrator. To change the administrator password later, implement a password-rotation workflow or reset the local database after backing up any portfolio data.

## Run locally

Start the backend and serve the existing portfolio pages from the same origin:

```bash
npm start
```

Open `http://localhost:3000`. For automatic server restarts during development, use `npm run dev`. Do not use Live Server for backend features because the API and session cookies require the Express server's same origin.

Administrator sign-in: `http://localhost:3000/admin.html`. Sign in with the username and password configured in `.env`.

## Features and API

- Public projects and the home-page profile image load from `GET /api/public/portfolio`.
- Signed-in administrators can add, edit, and delete projects at `/api/admin/projects`.
- JPEG, PNG, and WebP project/profile images can be uploaded at `/api/admin/images`; each image is limited to 5 MB.
- Administrators can set the home-page profile image at `/api/admin/settings/profile-image`.
- The contact form submits messages to `POST /api/contact`; messages are stored in SQLite and visible in the admin dashboard.
- Admin sign-in uses a SQLite-backed session cookie, password hashes, a login rate limit, same-origin mutation checks, input validation, and HTTP security headers.
- The SQLite database and uploaded files are local runtime data and are excluded from Git.

## Deployment notes

Use HTTPS in production and set `NODE_ENV=production`, `SESSION_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` through the hosting provider's secret/environment settings. Run `npm run seed:admin` once against the persistent database. Configure durable storage and backups for `backend/data/` and `backend/uploads/`; ephemeral server storage will lose database content and uploaded images on redeploy. Do not expose `.env`, the database, or backend source as public static files.

The interface preserves the original theme toggle, responsive navigation, project filtering, multi-page content, existing image assets, and contact form validation.
