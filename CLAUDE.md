# CLAUDE.md — Choose-Your-Own-Adventure with Live State-Machine View

## What this is
A branching story you play in one panel, while a second panel shows the underlying choice graph with your current node and traveled path lit up in real time. The gimmick: the "code" (the state machine) IS the visualization. As you play, you watch yourself move through the graph.

## Stack
- Vite + React
- Graph rendering: React Flow (handles nodes/edges/layout/pan-zoom) OR a hand-rolled SVG renderer if you want full control and zero deps. Default to React Flow for v1.
- Story data: a single authored `story.json` (or `.yaml`) — a directed graph of nodes and choice edges
- No backend. Everything runs client-side.

## Architecture
- `src/story/story.json` — the graph: each node has `id`, `text`, and `choices: [{ label, target }]`. One or more `ending` nodes.
- `src/lib/machine.js` — the state machine: current node, visited set, history stack. Pure and framework-agnostic. This is the single source of truth both panels read from.
- `src/StoryPanel.jsx` — renders current node text + choice buttons
- `src/GraphPanel.jsx` — renders the full graph; subscribes to machine state to highlight current node + traveled edges
- `src/App.jsx` — owns the machine, syncs both panels

## Conventions
- ONE source of truth for state (`machine.js`). Both panels are pure views of it. Never let the two panels hold independent copies of "where am I" — that desync is the classic bug and the whole point of the project is that they stay in lockstep.
- The graph layout is computed once from the story file, not re-laid-out on every move. Only highlight state changes on navigation.
- Story content is data, never hardcoded in components. Someone should be able to write a new adventure by editing only the JSON.

## Gotchas
- Validate the story graph on load: every `target` must reference a real node, every non-ending node must have at least one choice, warn on unreachable nodes. A tiny validator saves hours of "why is this button broken."
- For a satisfying graph view, keep the demo story small (15-25 nodes). A sprawling graph looks impressive but reads as noise and layout gets ugly.
- Decide early: can players backtrack? If yes, the history stack drives an undo. If no, visited edges stay lit but choices are one-way. Either is fine, but pick one and make the graph reflect it.

## Definition of done
- Live URL
- A complete short story with at least 2 distinct endings
- Graph panel stays perfectly in sync with the story panel, current node + path always clearly highlighted
- Story-file validator that fails loudly on bad graphs
- README with a GIF showing the two panels moving together
