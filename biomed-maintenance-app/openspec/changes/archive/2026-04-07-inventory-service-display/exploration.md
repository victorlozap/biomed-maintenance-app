# Exploration: Inventory Service Display Swap

### Current State
In `Inventory.tsx`, the main table displays "Ubicación" as a column header, and the row content uses `{item.ubicacion || item.servicio || 'No Asignada'}`. 
Institutional rules recently applied to PDFs (Bitácora 2026-04-06) state that "UBICACIÓN" labels should strictly show the "SERVICIO" (Department/Unit) to facilitate equipment identification by hospital auditing standards.

### Affected Areas
- `src/pages/Inventory.tsx`: Main table header and row data cell.
- `src/components/EquipmentsModal.tsx`: (Verification) Shows "Ubicación y Riesgo" cards.
- `src/components/Dashboard.tsx`: (Verification) Tooltip/Data mapping.

### Approaches
1. **Strict Swap (Recommended)**: Change the header to "SERVICIO" and ensure the cell value prioritizes `item.servicio`.
   - Pros: Consistent with institutional rules mentioned in the Bitácora.
   - Cons: Might hide physically detailed location if it was specifically put in `ubicacion`.
   - Effort: Low.

2. **Combined Display**: Change header to "SERVICIO / UBICACIÓN".
   - Pros: No data loss.
   - Cons: Cluttered UI, doesn't strictly follow the user request "in place of".
   - Effort: Low.

### Recommendation
Proceed with **Approach 1**. The user explicitly asked to replace "Ubicación" with "SERVICIO" in that space.

### Risks
- Data in the `ubicacion` field (specific details like "Cama 101") won't be visible in the search table anymore, but remains available in the Equipment Details modal (Life Sheet).

### Ready for Proposal
Yes.
