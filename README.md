# Welcome to the AI Interviewer Monorepo! 🎤🤖

## 🚀 Project Overview

Welcome to the AI Interviewer! This is not just another web app—it's a full-stack, AI-powered platform designed to make technical interviews less painful (for everyone). Whether you're a job seeker, a company, or an admin, this project has something for you. If you’re a developer, you’re about to embark on a journey through React, FastAPI, CI/CD, and more acronyms than you can shake a stick at.
Whether you’re here to fix a bug, add a feature, or just to see what all the fuss is about, you’re in the right place!

Our vision: **To make interviews smarter, fairer, and a little less awkward.**

---

## 🗂️ Directory Map (aka, What’s All This Stuff?)

```
/                   # The root of all magic
├── frontend/        # Where the pixels live (React, TypeScript, Tailwind)
├── backend/         # The brains of the operation (FastAPI, SQLAlchemy)
├── .github/         # CI/CD butler (GitHub Actions workflows)
├── frontend_documentation.txt  # Deep dive into the frontend
├── backend_documentation.txt   # Deep dive into the backend
├── ci_cd_documentation.txt     # All about our automation
├── README.md        # You are here!
```

### What’s in Each Directory?
- **frontend/**: All things UI/UX. If you see a button, it’s here. If you break a button, it’s also here.
- **backend/**: All things logic, data, and API. If you see a 500 error, it’s probably here (but don’t tell the frontend devs).
- **.github/**: Our robot army. Deploys, tests, and keeps us honest.
- **documentation files**: The treasure maps for new and old devs alike.

---

## 🏁 Onboarding Checklist for New Devs

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd <repo-name>
   ```
2. **Read this README (seriously, it’s worth it).**
3. **Set up the frontend**
   - `cd frontend`
   - `npm install`
   - `npm run dev`
   - Open [http://localhost:8080](http://localhost:5173 in some cases)
4. **Set up the backend**
   - `cd backend`
   - `python -m venv venv && source venv/bin/activate` (or use your favorite virtualenv tool)
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload`
   - Open [http://localhost:8000/api/v1](http://localhost:8000/api/v1) (should say healthy!)
5. **Check the docs**
   - `frontend_documentation.txt` and `backend_documentation.txt` are your best friends.
6. **Run the tests** (see below)
7. **Say hi in the team chat!**

---

## 🛠️ Example Workflows

### Local Development
- Make changes in `frontend/` or `backend/` as needed.
- Use hot reload (`npm run dev` or `uvicorn ... --reload`) to see changes instantly.
- Use the browser dev tools and backend logs for debugging.

### Testing
- **Frontend**: Use your favorite React testing library (see `frontend_documentation.txt` for details).
- **Backend**: Use pytest or FastAPI’s built-in test client (see `backend_documentation.txt`).
- Pro tip: If all tests pass, celebrate. If not, blame the last person who committed.

### Deployment
- Push to `main` and let GitHub Actions do the heavy lifting.
- See `.github/workflows/` for the full CI/CD magic.
- For manual deploys, see `ci_cd_documentation.txt`.

---

## 🔗 How the Frontend and Backend Interact

- The frontend talks to the backend via RESTful APIs (see `/api/v1` endpoints).
- Auth tokens are passed in headers (check the context providers for details).
- If you change an API, update the types in both frontend and backend docs!
- Pro tip: Use browser dev tools’ Network tab to debug API calls.
- Lazy to install Postman? Go to [http://localhost:8000/docs] See the Swagger magic!

---

## CI/CD Overview

- Automated tests and deployments via GitHub Actions.
- Backend and frontend deploy independently to Google Compute Engine.
- Secrets are managed in GitHub (no passwords in the code, please).
- See `ci_cd_documentation.txt` for all the gory details.

---

## Troubleshooting & FAQ

**Q: The app won’t start!**
- A: Did you run `npm install` and `pip install -r requirements.txt`? Did you turn it off and on again?

**Q: I see CORS errors.**
- A: Check your backend CORS settings in `config.py`.

**Q: My API call returns 401.**
- A: Check your auth tokens. If you’re still stuck, see the context provider docs.

**Q: The build is failing on CI.**
- A: Check the Actions tab on GitHub for logs. If it’s a flaky test, blame the weather.

**Q: I broke production.**
- A: Don’t panic. Tell the team, revert your change, and remember: we’ve all been there.

---

## Documentation & Resources

- [Frontend Documentation](./frontend_documentation.txt)
- [Backend Documentation](./backend_documentation.txt)
- [CI/CD Documentation](./ci_cd_documentation.txt)
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [.github/workflows/](./.github/workflows/) — for CI/CD configs

---

## How to Contribute

- Fork, branch, and PR like a pro.
- Write clear commit messages (bonus points for puns).
- Add tests for new features (or at least don’t break the old ones).
- Update the docs if you change something big.
- Be kind in code reviews—remember, we’re all human (except the CI bot).

---

## Teamwork & Project Values

- **Empathy**: Help each other, ask questions, and don’t be afraid to admit when you’re stuck.
- **Quality**: Write code you’re proud of (or at least not ashamed of).
- **Humor**: A little laughter goes a long way. (But keep it professional-ish.)
- **Learning**: Every bug is a lesson. Every PR is a chance to grow.

---

## Need Help?
- Read the docs (seriously, they’re good, I wrote them).
- Ask a teammate or mentor.
- Take a break and come back with fresh eyes.
- If all else fails, post a meme in the team chat and hope for sympathy.

---

Happy coding , and welcome to the team! 🚀
