# agents.md

## Working Rules

1. Plan first
- Propose a short step-by-step plan before changing files.
- List expected files to change.
- List validation command(s) to run.

2. Keep diffs small
- Make minimal, reviewable edits.
- Avoid unrelated refactors.
- Prefer incremental changes over broad rewrites.

3. No secrets in repo
- Do not commit credentials, keys, tokens, or connection strings.
- Keep `api/local.settings.json` out of source control.
- Use environment variables and sample/example files only.

4. Always run local validation
- Run at least one relevant local validation command for each meaningful change.
- Report command(s) and results.

5. Always update docs
- Update `README.md` when setup, structure, or commands change.
- Keep architecture and local development steps current.
