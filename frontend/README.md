# AI Interviewer Frontend 

Welcome to the frontend! This is where the magic happens (or at least where it looks like magic). If you like React, TypeScript, and Tailwind, you’re in for a treat. If you don’t, well... you’ll learn to love them. 😉

## Project Overview

The frontend is the face of the AI Interviewer platform. It’s where users sign up, companies post jobs, admins rule with benevolence, and everyone gets to see just how much CSS it takes to make a button look good. Our goal: **Make technical interviews less scary, more fair, and a lot more fun to use.**

Whether you’re a job seeker, a company, or an admin, this is where your journey begins. If you’re a developer, you’re about to dive into a world of React components, hooks, context, and enough Tailwind classes to make your head spin.

---

## 🗂️ Directory Map

```
frontend/
├── src/
│   ├── components/      # All reusable UI and domain components
│   ├── context/         # React context providers for global state
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page-level components (routed)
│   ├── services/        # API service modules
│   ├── types/           # TypeScript type definitions
│   ├── index.css        # Main CSS file (Tailwind)
│   ├── main.tsx         # App entry point
│   ├── App.tsx          # Main app component and router
│   ├── config.tsx       # Configuration constants
│   └── vite-env.d.ts    # Vite environment types
├── public/              # Static assets
├── package.json         # Project metadata and dependencies
├── tsconfig*.json       # TypeScript configuration
├── vite.config.ts       # Vite build config
├── tailwind.config.ts   # Tailwind CSS config
└── README.md            # You are here!
```

### What’s in Each Folder?
- **components/**: All the Lego bricks—UI widgets, forms, modals, and more. If you’re copy-pasting code, you’re probably missing a component here.
- **context/**: Global state for things like authentication, theming, and more. (Yes, you’ll need these for auth and theming.)
- **hooks/**: Custom React hooks. If you see a `use-` prefix, it probably lives here.
- **lib/**: Utility functions. For when you don’t want to write the same code twice.
- **pages/**: Page-level components. Each route gets its own file. Like a choose-your-own-adventure, but with more JSX.
- **services/**: API service modules. All the async/await you can handle.
- **types/**: TypeScript type definitions. Because `any` is for quitters.
- **index.css**: Main CSS file (Tailwind-powered, so you can look cool with utility classes).
- **main.tsx**: The entry point. If this breaks, nothing works.
- **App.tsx**: The main app component and router. All roads lead here.
- **config.tsx**: Configuration constants. Change these and hope for the best.
- **vite-env.d.ts**: Vite environment types. (You’ll probably never touch this.)

---

## 🏁 Onboarding Guide for New Frontend Devs

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd <repo-name>/frontend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the dev server**
   ```bash
   npm run dev
   ```
   - Open [http://localhost:8080](http://localhost:8080) (or [http://localhost:5173](http://localhost:5173) in some cases)
4. **Explore the codebase**
   - Start with `src/App.tsx` and `src/main.tsx` to see how the app is bootstrapped.
   - Check out `src/pages/` for routed pages, and `src/components/` for reusable UI.
5. **Check the docs**
   - `../frontend_documentation.txt` is your best friend.
6. **Run the tests** (see below)
7. **Say hi in the team chat!**

---

## Example Workflows

### Local Development
- Make changes in `src/` as needed.
- Use hot reload (`npm run dev`) to see changes instantly.
- Use browser dev tools for debugging.
- Use the React DevTools extension for state inspection.

### Testing
- Use your favorite React testing library (Jest, React Testing Library, etc.).
- Run tests with `npm test` (if configured).
- Pro tip: If all tests pass, celebrate. If not, blame the last person who committed.

### Building for Production
- Run `npm run build` to create a production build in `dist/`.
- Preview with `npm run preview`.

### Deployment
- Push to `main` and let GitHub Actions do the heavy lifting.
- See `.github/workflows/` for the full CI/CD magic.
- For manual deploys, see `ci_cd_documentation.txt`.

---

## 🔗 How the Frontend Talks to the Backend

- The frontend talks to the backend via RESTful APIs (see `/api/v1` endpoints).
- Auth tokens are passed in headers (check the context providers for details).
- Example API call (using Axios):
  ```js
  axios.get('/api/v1/jobseeker/profile', { headers: { Authorization: `Bearer ${token}` } })
  ```
- If you change an API, update the types in both frontend and backend docs!
- Pro tip: Use browser dev tools’ Network tab to debug API calls.

---

## Troubleshooting & FAQ

**Q: The app won’t start!**
- A: Did you run `npm install`? Did you turn it off and on again?

**Q: I see CORS errors.**
- A: Check your backend CORS settings in `config.py`.

**Q: My API call returns 401.**
- A: Check your auth tokens. If you’re still stuck, see the context provider docs.

**Q: The build is failing on CI.**
- A: Check the Actions tab on GitHub for logs. If it’s a flaky test, blame the weather.

**Q: The UI looks weird.**
- A: Check your Tailwind classes and CSS. If all else fails, blame the designer.

**Q: I broke production.**
- A: Don’t panic. Tell the team, revert your change, and remember: we’ve all been there.

---

## Pro Tips for Teamwork
- Use clear commit messages (bonus points for puns).
- Keep your code DRY (Don’t Repeat Yourself).
- Use TypeScript types everywhere. Your future self will thank you.
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
- [Frontend Documentation](../frontend_documentation.txt)
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

Happy hacking! 
