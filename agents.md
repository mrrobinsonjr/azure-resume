# agents.md

**Project: Azure Cloud Resume Challenge (Codex-Driven Build)**\
**Goal: Use Codex to execute and iterate safely, with minimal Azure
cost.**

------------------------------------------------------------------------

## 1. Operating Principles

Codex must follow this workflow for all tasks:

1.  **Plan First**
    -   Propose step-by-step plan before editing files.
    -   List files to be modified.
    -   List commands that will be run for validation.
2.  **Small, Reviewable Diffs**
    -   Keep changes minimal and scoped.
    -   Avoid unrelated refactors.
    -   Summarize changes after completion.
3.  **Run and Validate**
    -   Run relevant local commands (build, test, lint).
    -   Report results.
    -   Fix failures before concluding.
4.  **No Silent Assumptions**
    -   If configuration is unclear, ask.
    -   Do not invent Azure resources not explicitly requested.

------------------------------------------------------------------------

## 2. Cost Control Guardrails (Critical)

This project must remain near Azure free tier.

Codex must:

-   Use **Azure Static Web Apps (Free)**
-   Use **Azure Functions (Consumption plan only)**
-   Use **Azure Table Storage (not Cosmos DB)**
-   Avoid Log Analytics unless explicitly requested
-   Avoid Premium plans, Dedicated plans, or Always-On features
-   Never create paid SKUs without explicit approval

If a proposed change introduces potential cost, Codex must: - Explain
the cost implication - Propose a lower-cost alternative

------------------------------------------------------------------------

## 3. Architecture Constraints

Frontend: - Plain HTML/CSS - Minimal JavaScript (vanilla only) - No
heavy frameworks unless explicitly requested

Backend: - Azure Functions (Python) - HTTP-trigger functions only -
Environment variables for secrets - No hardcoded credentials

Storage: - Azure Table Storage - Table: `Counters` - PartitionKey:
`resume` - RowKey: `visitors` - Property: `count`

------------------------------------------------------------------------

## 4. Security Rules

Codex must:

-   Never commit `local.settings.json`
-   Never commit connection strings
-   Use environment variables only
-   Add `.gitignore` entries when needed
-   Prefer least-privilege guidance in documentation

------------------------------------------------------------------------

## 5. Coding Standards

Python: - Clear function separation (business logic separate from
trigger logic) - Basic error handling - Retry logic for concurrency
conflicts - Unit tests where feasible

Frontend: - Semantic HTML (`header`, `main`, `section`, `footer`) -
Accessible structure (proper headings, aria only when necessary) -
Graceful failure for API errors

------------------------------------------------------------------------

## 6. Documentation Requirements

Every meaningful change must: - Update `README.md` if deployment steps
change - Keep setup instructions accurate - Document required
environment variables

------------------------------------------------------------------------

## 7. Deployment Philosophy

Prefer: - GitHub → Azure Static Web Apps integration - Minimal
configuration - Clear manual setup instructions

Avoid: - Over-automation early - Complex IaC unless explicitly requested

------------------------------------------------------------------------

## 8. Output Expectations

After completing a task, Codex must provide:

-   Summary of changes
-   Files modified
-   Commands executed and results
-   Suggested next step

------------------------------------------------------------------------

## 9. Definition of Done (Per Task)

A task is complete only if:

-   Code compiles/runs locally
-   No secrets are exposed
-   Documentation is updated
-   Cost guardrails are preserved

------------------------------------------------------------------------

If uncertain at any time, Codex must stop and ask for clarification
before proceeding.