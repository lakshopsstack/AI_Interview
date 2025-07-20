# AI Interviewer Backend 

Welcome to the backend! This is where the logic lives, the data flows, and the bugs occasionally hide. If you like FastAPI, SQLAlchemy, and wrangling databases, you’re in the right place. If not, don’t worry — we’ve got plenty of comments (and coffee).

## Project Overview

The backend is the engine room of the AI Interviewer platform. It’s where all the business logic, data wrangling, and API magic happens. Our goal: **Make technical interviews smarter, fairer, and a lot less painful for everyone.**

Whether you’re a job seeker, a company, or an admin, this is where your data lives and your requests are answered. If you’re a developer, you’re about to dive into a world of FastAPI endpoints, SQLAlchemy models, and enough Pydantic schemas to make your head spin.

---

## 🗂️ Directory Map

```
backend/
├── app/
│   ├── main.py            # Application entry point
│   ├── models.py          # SQLAlchemy ORM models
│   ├── schemas.py         # Pydantic schemas for request/response validation
│   ├── database.py        # Database connection and session management
│   ├── config.py          # Configuration management
│   ├── exception_handlers.py # Custom exception handlers
│   ├── routes/            # Admin and public route definitions
│   ├── company/           # Company domain logic (router, schemas, services)
│   ├── job_seeker/        # Job seeker domain logic (router, schemas, services)
│   ├── interview/         # Interview domain logic (router, schemas, services)
│   ├── services/          # Shared service modules (email, GCS, interview logic, etc.)
│   ├── lib/               # Utility libraries (JWT, security, errors)
│   ├── configs/           # Third-party and API configs (OpenAI, Razorpay, Brevo)
│   ├── dependencies/      # Dependency injection modules
│   ├── middlewares/       # Middleware logic
│   └── public/            # Public endpoints
├── requirements.txt       # Python dependencies
├── alembic/               # Database migrations
├── uploads/               # Uploaded files
└── README.md              # You are here!
```

### What’s in Each Folder?
- **main.py**: The entry point. If this file is missing, you’re in the wrong repo.
- **models.py**: SQLAlchemy ORM models. All your tables, all your relationships, all your hopes and dreams.
- **schemas.py**: Pydantic schemas for request/response validation. Because trusting user input is for amateurs.
- **database.py**: Database connection and session management. (If you see a connection error, start here.)
- **config.py**: Configuration management. All your secrets in one place (but not in version control, please).
- **exception_handlers.py**: Custom exception handlers. For when things go sideways (and they will).
- **routes/**: Admin and public route definitions. Where the endpoints live.
- **company/**: Company domain logic (router, schemas, services). For all things corporate.
- **job_seeker/**: Job seeker domain logic (router, schemas, services). For the people.
- **interview/**: Interview domain logic (router, schemas, services). Where the AI magic happens.
- **services/**: Shared service modules (email, GCS, interview logic, etc.).
- **lib/**: Utility libraries (JWT, security, errors). The unsung heroes.
- **configs/**: Third-party and API configs (OpenAI, Razorpay, Brevo). Because we love APIs.
- **dependencies/**: Dependency injection modules. (No, not the medical kind.)
- **middlewares/**: Middleware logic. (The bouncers of your API.)
- **public/**: Public endpoints. For the world to see.
- **requirements.txt**: Python dependencies. (Don’t forget to `pip install`!)
- **alembic/**: Database migrations. (For when you need to change the schema and pray nothing breaks.)
- **uploads/**: Uploaded files. (No cat pictures or memes, please.)

---

## 🏁 Onboarding Guide for New Backend Devs

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd <repo-name>/backend
   ```
2. **Set up your virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Set up your environment variables**
   - Copy `.env.example` to `.env` and fill in the blanks (ask a teammate if you get stuck).
5. **Run database migrations**
   ```bash
   alembic upgrade head
   ```
6. **Start the dev server**
   ```bash
   uvicorn app.main:app --reload
   ```
   - Open [http://localhost:8000/api/v1](http://localhost:8000/api/v1) (should say healthy!)
7. **Check the docs**
   - `../backend_documentation.txt` is your best friend.
8. **Run the tests** (see below)
9. **Say hi in the team chat!**

---

## 🛠️ Example Workflows

### Local Development
- Make changes in `app/` as needed.
- Use hot reload (`uvicorn ... --reload`) to see changes instantly.
- Use backend logs and FastAPI’s interactive docs at `/docs` for debugging.

### Testing
- Use pytest or FastAPI’s built-in test client.
- Run tests with `pytest` (if configured).
- Pro tip: If all tests pass, celebrate. If not, blame the last person who committed.

### Database Migrations
- Use Alembic for migrations:
  ```bash
  alembic revision --autogenerate -m "Describe your change"
  alembic upgrade head
  ```
- Pro tip: Always check your migration scripts before running them in production.

### Deployment
- Push to `main` and let GitHub Actions do the heavy lifting.
- See `.github/workflows/` for the full CI/CD magic.
- For manual deploys, see `ci_cd_documentation.txt`.

---

## How the Backend Talks to the Frontend

- The backend exposes RESTful APIs at `/api/v1`.
- Example endpoint:
  ```http
  GET /api/v1/jobseeker/profile
  Authorization: Bearer <token>
  ```
- If you change an API, update the types in both frontend and backend docs!
- Pro tip: Use FastAPI’s `/docs` for interactive API exploration.

---

## Troubleshooting & FAQ

**Q: The server won’t start!**
- A: Did you run `pip install -r requirements.txt`? Did you set up your `.env`? Did you turn it off and on again?

**Q: I see database connection errors.**
- A: Check your DB URL in `.env` and make sure your database is running.

**Q: My API call returns 401.**
- A: Check your auth tokens. If you’re still stuck, see the context provider docs in the frontend.

**Q: The build is failing on CI.**
- A: Check the Actions tab on GitHub for logs. If it’s a flaky test, blame the weather.

**Q: I broke production.**
- A: Don’t panic. Tell the team, revert your change, and remember: we’ve all been there.

---

## Pro Tips for Teamwork
- Use clear commit messages (bonus points for puns).
- Keep your code DRY (Don’t Repeat Yourself).
- Use Pydantic schemas everywhere. Your future self will thank you.
- Don’t be afraid to ask for help. We’ve all been stuck before.
- Review PRs with empathy and a sense of humor.

---

## How to Contribute
- Fork, branch, and PR like a pro.
- Write clear commit messages.
- Add tests for new features (or at least don’t break the old ones).
- Update the docs if you change something big.
- Be kind in code reviews—remember, we’re all human (except the CI bot).

---

## Documentation & Resources
- [Backend Documentation](../backend_documentation.txt)
- [Main Project README](../README.md)
- [CI/CD Documentation](../ci_cd_documentation.txt)
- [.github/workflows/](../.github/workflows/) — for CI/CD configs

---

## Project Values
- **Empathy**: Help each other, ask questions, and don’t be afraid to admit when you’re stuck.
- **Quality**: Write code you’re proud of (or at least not ashamed of).
- **Humor**: A little laughter goes a long way. (But keep it professional-ish.)
- **Learning**: Every bug is a lesson. Every PR is a chance to grow.

---

Happy coding!
