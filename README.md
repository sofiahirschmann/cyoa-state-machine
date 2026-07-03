# The Keeper's Last Night

A choose-your-own-adventure you play in one panel — while the second panel shows the
story's underlying state machine live, with your current node and traveled path lit up
as you move through it. **The state machine IS the visualization.**

> 🎬 *GIF of the two panels moving together goes here*
> (record with e.g. [Kap](https://getkap.co/): make a few choices, hit Undo, watch the graph un-light the edge)

## The story

*The Keeper's Last Night* — a haunted-lighthouse mystery. The keeper of Gray Hollow Light
has gone silent, the lamp is dark, and the last ferry leaves at dawn. 22 nodes,
**6 distinct endings**, and one choice that's only available if you picked something up
earlier (see [Conditional choices](#conditional-choices)).

## Run it

```bash
npm install
npm run dev
```

## How it works

The whole design is one rule: **a single source of truth, two pure views.**

```
src/lib/machine.js   ← the state machine. Pure functions, no React, no DOM.
        │
        ├──► src/StoryPanel.jsx   (renders current node text + choices)
        └──► src/GraphPanel.jsx   (renders the full graph + highlights)
```

- **`src/lib/machine.js`** — game state is `{ currentId, history, endingsFound }`.
  Everything else is derived: the visited-node set and the traveled-edge set are computed
  from `history`, never stored separately. That's why Undo "just works": popping the
  history entry automatically un-lights the edge in the graph — there is no second copy
  of the path that could drift out of sync.
- **`src/App.jsx`** — owns the state with `useReducer` (`CHOOSE` / `UNDO` / `RESTART`)
  and passes it to both panels. Neither panel keeps its own idea of "where am I."
- **`src/lib/layout.js`** — node positions are computed **once** per story with
  [dagre](https://github.com/dagrejs/dagre) (top-down rank layout). Navigation never
  re-runs layout; only CSS highlight classes change.
- **`src/GraphPanel.jsx`** — [React Flow](https://reactflow.dev/) renders the graph
  read-only (no dragging/connecting), pans to your current node as you play, and styles
  nodes by state: current (glowing), visited, unexplored, ending (gold double border).
- **`src/lib/validate.js`** — validates the story graph on load, *before* anything
  renders: unknown choice targets, non-ending nodes without choices, missing/duplicate
  ids → a fatal error screen listing every problem; unreachable nodes → warnings.
  A broken story file fails loudly, never as a mysteriously dead button.

## Write your own adventure

All story content lives in [`src/story/story.json`](src/story/story.json) — no code
changes needed:

```json
{
  "title": "My Story",
  "start": "wake_up",
  "nodes": [
    {
      "id": "wake_up",
      "label": "Waking Up",
      "text": "You wake up. The door is locked.",
      "choices": [
        { "label": "Search the desk", "target": "desk" },
        { "label": "Force the door", "target": "hallway" }
      ]
    },
    { "id": "hallway", "label": "END: Free", "text": "You're out.", "ending": true }
  ]
}
```

- `start` names the first node; `ending: true` nodes terminate a run (no choices).
- `label` is what the graph shows; `text` is the story prose.
- Keep it to ~15–25 nodes — big graphs read as noise.
- The validator will tell you exactly what's wrong if you break the graph.

### Conditional choices

A choice may declare `"requires": "<nodeId>"` — it's only offered if the player has
already visited that node this run. The edge still appears in the graph (the validator
ignores gating for reachability); only the button is hidden. Used here so you can't pour
lamp oil you never picked up.

## Design decisions

- **Backtracking: allowed.** The history stack drives an Undo button, so you can explore
  all six endings in one sitting. Undone edges dim in the graph; endings you've found
  are remembered across Undo and Restart (but not reload — there's deliberately no
  persistence).
- **Layout once, highlight often.** Re-running layout on every move makes the graph
  squirm; positions are stable for the life of the story file.
- **Validator before render.** Authoring mistakes surface as a readable error list, not
  as runtime weirdness three choices deep.

## Stack

Vite · React 18 · @xyflow/react (React Flow 12) · dagre — nothing else.
