# Proposal: Swap Ubicación for SERVICIO in Inventory Table

## Intent
Standardize the inventory search view to display the "SERVICIO" (Unit/Department) instead of the physical "Ubicación" (Specific location), following the institutional auditing rules recently established for PDFs. This makes it easier for technicians and auditors to identify which service the equipment belongs to at a glance.

## Scope
- Modify `Inventory.tsx` table headers and data cells.
- Update search placeholder to mention "Servicio".
- Ensure the logic follows institutional standards.

## Technical Approach
1. Change Header in `Inventory.tsx` from "Ubicación" to "SERVICIO".
2. Update table row logic to show `item.servicio` primarily.
3. Update Mobile view to ensure consistency.

## Rollback Plan
Revert changes in `src/pages/Inventory.tsx` via Git.
