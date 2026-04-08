# Spec: Inventory Table Standardization

## Requirement: Column Header Replacement
The Inventory table MUST replace the "Ubicación" column header with "SERVICIO".

### Scenario: Table Display
- GIVEN the user is on the Inventory page
- WHEN the equipment list is loaded
- THEN the third column header SHALL be "SERVICIO" (uppercase)
- AND each row SHALL display the value of the `servicio` field from the database.

## Requirement: Search Enhancements
The search input SHALL remain functional for both `ubicacion` and `servicio` fields to ensure backward compatibility in discovery.

### Scenario: Mobile View
- GIVEN the user is on a mobile device
- THEN the equipment cards SHALL prominently display the "SERVICIO" instead of "Ubicación" in the secondary info area.
