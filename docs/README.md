# Documentation — ArrowMaze Backend

This folder holds the design documentation required by the project brief (Section 4).

## Diagrams

| File | Description | Status |
| --- | --- | --- |
| `diagrams/clean-architecture.puml` | Backend Clean Architecture (4 concentric layers + dependency rule). | ✅ Editable source (PlantUML) |
| `diagrams/class-diagram.puml` | Backend class diagram (entities, ports, use cases, controllers, infrastructure). | ✅ Editable source (PlantUML) |
| `diagrams/clean-architecture-client-ref.png` | Reference copy of the client's diagram (shared layering vocabulary). | Reference only |

Both diagrams are also embedded as **Mermaid** in the root [`README.md`](../README.md), which GitHub renders
inline (no export step needed to view them).

### Regenerating PNGs (optional)

The `.puml` sources can be exported to PNG/SVG with any PlantUML renderer, e.g.:

```bash
# with the PlantUML CLI / jar
plantuml docs/diagrams/clean-architecture.puml docs/diagrams/class-diagram.puml
# or paste the file contents into https://www.plantuml.com/plantuml
```
