# Design: Inventory Service Display Swap

## Architectural Decisions

### Decision: Database Field Priority
- **Context**: Some records might have valid `ubicacion` (physical detail) but empty `servicio` (institutional unit), though the recent synchronization efforts focused on `servicio`.
- **Decision**: In the main table, we will use `{item.servicio || item.ubicacion || 'No Asignado'}` but label the column as "SERVICIO". This preserves visibility for records that haven't been fully normalized yet, while adhering to the label switch.
- **Rationale**: Avoids "No Asignado" appearing for records that actually have a physical location recorded, even if not yet mapped to a Service.

## Components to Modify

### `src/pages/Inventory.tsx`
- **Header**: Change `<th>` text for the 3rd column.
- **Row (Desktop)**: Update the `<p>` inside the 3rd `<td>`.
- **Card (Mobile)**: Update the `<p>` that currently shows `item.servicio || 'No Asignada'`.
- **Search Input**: Update `placeholder` to include "servicio".

### `src/components/EquipmentsModal.tsx`
- No changes required as it already shows both and is filtered by service.

## Data Flow
No changes to Data Flow. The SQL query already selects both fields.
