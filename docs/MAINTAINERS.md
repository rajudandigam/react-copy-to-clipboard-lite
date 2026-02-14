# Maintainer guide

## Require CI to pass before merging

GitHub allows merging while checks are still running unless **branch protection** is enabled. To block merging until all CI jobs pass:

1. Open the repo on GitHub → **Settings** → **Branches**.
2. Under **Branch protection rules**, click **Add rule** (or edit the rule for `main`).
3. Set **Branch name pattern** to `main`.
4. Enable **Require status checks to pass before merging**.
5. Click **Add status checks** and add these (exact names from the CI workflow):
   - **Setup & Install**
   - **Typecheck**
   - **Unit Tests (Vitest)**
   - **Build Integrity**
   - **Playwright Smoke Tests**
6. Optionally enable **Require branches to be up to date before merging** so the latest `main` is included.
7. Save the rule.

After this, the **Merge pull request** button stays disabled until all five checks are green.
