# Hello CI/CD 🚀

A minimal Express.js app built specifically to **learn how CI/CD works**, not to do anything fancy. It has 3 routes and 4 tests. That's it — the point is the pipeline, not the app.

## What this project does

| Route | What it returns |
|---|---|
| `GET /` | A welcome message |
| `GET /health` | `{ status: "ok" }` — used by deploy platforms to check if your app is alive |
| `GET /add?a=5&b=7` | `{ result: 12 }` — simple logic worth writing tests for |

## Run it locally

```bash
npm install
npm start        # starts the server on http://localhost:3000
```

## Run the tests locally

```bash
npm test
```

You should see 4 passing tests. **Always run tests locally before pushing** — CI just automates this same check on GitHub's servers.

---

## Part 1: Continuous Integration (CI) — already set up

Look at `.github/workflows/ci.yml`. Here's what happens, step by step, every time you push code or open a pull request to `main`:

1. **Checkout code** — GitHub spins up a fresh Ubuntu machine and copies your repo onto it
2. **Setup Node.js** — installs Node 20 on that machine
3. **Install dependencies** — runs `npm install`, exactly like on your laptop
4. **Run tests** — runs `npm test`

If any test fails, the workflow shows a red ❌ on GitHub and (if configured) blocks merging. If all tests pass, you get a green ✅. That's the entire concept of CI: **automatically verify your code works, on every change, without you doing it manually.**

### How to see this in action
1. Push this project to a new GitHub repo
2. Go to the **Actions** tab on GitHub — you'll watch the workflow run live
3. Try breaking a test on purpose (e.g., change `expect(res.body.result).toBe(12)` to `toBe(13)`), push it, and watch it fail red
4. Fix it, push again, watch it turn green

---

## Part 2: Continuous Deployment (CD) — add this next

Once CI is working, add automatic deployment to **Render** (free tier, beginner-friendly):

1. Create a free account at [render.com](https://render.com)
2. Click **New → Web Service**, connect your GitHub repo
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Render automatically redeploys every time you push to `main` — **that's CD**. No extra YAML needed for basic Render auto-deploy; Render watches your repo directly.

### Optional: Make deployment depend on tests passing
Right now, even if your GitHub Actions tests fail, Render would still try to deploy (since Render watches the repo independently). To properly **gate deployment on tests passing**, add a second job to `ci.yml` that only runs after tests succeed and calls Render's **Deploy Hook URL** (found in Render dashboard → Settings → Deploy Hook):

```yaml
  deploy:
    name: Deploy to Render
    needs: test          # <-- only runs if the "test" job above succeeded
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Trigger Render Deploy Hook
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

Add `RENDER_DEPLOY_HOOK` as a GitHub repo secret (Settings → Secrets and variables → Actions) so the URL isn't exposed in your code.

**Now you have real CI/CD:** tests run automatically → if they pass → deployment triggers automatically → if they fail → nothing deploys.
