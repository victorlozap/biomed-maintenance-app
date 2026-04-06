# Skill Registry: victorlozap/biomed-maintenance-app

## Project Standards

### Glassmorphic UI (React + Tailwind)
- Use `backdrop-blur-xl`, `bg-white/5`, `border-white/10` for containers.
- Use `bg-gradient-to-br` for cards and accents.
- Modern color palette: `orange-500`, `amber-500`, `emerald-500` for status.
- Components must be responsive and mobile-first.

### Supabase Integration
- Use the shared `supabase` client from `@src/lib/supabase`.
- Table `equipments`: main inventory.
- Table `correctivos_husj`: corrective maintenance records.
- Fields: `servicio` (service unit), `ubicacion` (physical location), `id_unico` (institutional code).

### SDD Phase Standards
- `proposal`: Describe intent, scope, and approach clearly.
- `spec`: Define scenarios in Gherkin-like style.
- `design`: Architecture decisions and component structure.
- `tasks`: Atomic, numbered implementation tasks.

## Registered Skills

| Name | Location | Triggers |
| ---- | -------- | -------- |
| brainstorming | project | Creating features, components |
| core-routing-protocol | project | Session start, routing |
| core-systematic-debugging | project | Debugging, errors |
| core-verification-protocol | project | Finalizing tasks |
| sdd-apply | global | Implementation phase |
| sdd-explore | global | Investigation phase |
| sdd-propose | global | Proposal phase |
| sdd-spec | global | Specification phase |
| sdd-tasks | global | Task breakdown |
| sdd-verify | global | Testing/Verification |
| judgment-day | global | Adversarial review |
| branch-pr | global | Opening PRs |
| issue-creation | global | Reporting bugs/features |
| skill-creator | global | New agent rules |
| systematic-debugging | project | Bug fixing |
| test-driven-development | project | TDD mode |
| writing-plans | project | Multi-step logic |
