# Skill Registry - biomed-maintenance-app

## Project Standards

- **Design**: Premium glassmorphism, Dark mode (blue obsidian #0c111d), mobile-first.
- **Stack**: React 19 + Vite 8 + TS 5.9 + Tailwind 4.
- **Data**: Supabase for persistent cloud storage.
- **Sync**: Monthly Excel imports are the source of truth for KPIs.

## User Skills

| Skill | Trigger | Source |
|-------|---------|--------|
| brainstorming | creative work, new features | `.agents/skills/brainstorming` |
| core-routing-protocol | start of task | `.agents/skills/core-routing-protocol` |
| core-systematic-debugging | errors, test failures | `.agents/skills/core-systematic-debugging.md` |
| core-verification-protocol | task completion | `.agents/skills/core-verification-protocol.md` |
| dispatching-parallel-agents | parallel tasks | `.agents/skills/dispatching-parallel-agents` |
| executing-plans | implementation plans | `.agents/skills/executing-plans` |
| finishing-a-development-branch | branch completion | `.agents/skills/finishing-a-development-branch` |
| receiving-code-review | code review feedback | `.agents/skills/receiving-code-review` |
| requesting-code-review | pull requests | `.agents/skills/requesting-code-review` |
| subagent-driven-development | session implementation | `.agents/skills/subagent-driven-development` |
| systematic-debugging | unexpected behavior | `.agents/skills/systematic-debugging` |
| test-driven-development | new code | `.agents/skills/test-driven-development` |
| using-git-worktrees | feature isolation | `.agents/skills/using-git-worktrees` |
| using-superpowers | session start | `.agents/skills/using-superpowers` |
| verification-before-completion | pre-commit check | `.agents/skills/verification-before-completion` |
| writing-plans | task planning | `.agents/skills/writing-plans` |
| writing-skills | skill creation | `.agents/skills/writing-skills` |

## Workflows

- **/code-reviewer**: Logical chunk review against plans.
- **/sdd-init**: (Internal) SDD bootstrapping.
