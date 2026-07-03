# The Keeper's Last Night

A choose-your-own-adventure you play in one panel, while the second panel shows the
story's underlying state machine live, with your current node and traveled path lit up
as you move through it. **The state machine IS the visualization.**

> 🎬 *GIF of the two panels moving together goes here*
> (record with e.g. [Kap](https://getkap.co/): make a few choices, hit Undo, watch the graph un-light the edge)

## The story

*The Keeper's Last Night* is a haunted-lighthouse mystery. The keeper of Gray Hollow Light
has gone silent, the lamp is dark, and the last ferry leaves at dawn. 22 nodes,
**6 distinct endings**, and one choice that's only available if you picked something up
earlier (see [Conditional choices](#conditional-choices)). Every scene has a matching
AI-generated illustration rendered beneath the text.

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

- **`src/lib/machine.js`** holds game state as `{ currentId, history, endingsFound }`.
  Everything else is derived: the visited-node set and the traveled-edge set are computed
  from `history`, never stored separately. That's why Undo "just works": popping the
  history entry automatically un-lights the edge in the graph. There is no second copy
  of the path that could drift out of sync.
- **`src/App.jsx`** owns the state with `useReducer` (`CHOOSE` / `UNDO` / `RESTART`)
  and passes it to both panels. Neither panel keeps its own idea of "where am I."
- **`src/lib/layout.js`** computes node positions **once** per story with
  [dagre](https://github.com/dagrejs/dagre) (top-down rank layout). Navigation never
  re-runs layout; only CSS highlight classes change.
- **`src/GraphPanel.jsx`** renders the graph read-only with
  [React Flow](https://reactflow.dev/) (no dragging or connecting), pans to your current
  node as you play, and styles nodes by state: current (glowing), visited, unexplored,
  ending (gold double border).
- **`src/lib/validate.js`** validates the story graph on load, *before* anything
  renders: unknown choice targets, non-ending nodes without choices, and missing or
  duplicate ids produce a fatal error screen listing every problem; unreachable nodes
  produce warnings. A broken story file fails loudly, never as a mysteriously dead button.

## Scene illustrations

Each node has a matching image in `public/scenes/<nodeId>.jpg`, shown beneath the story
text. They were generated once with [pollinations.ai](https://pollinations.ai) (a free
text-to-image API) using a shared style prompt for a consistent dark-maritime look, then
committed as static assets, so the app makes zero network calls at runtime. If a node has
no image, the panel simply hides it. Total weight: about 1.2 MB for 27 scenes.

## Write your own adventure

All story content lives in [`src/story/story.json`](src/story/story.json). No code
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
- Keep it to roughly 15 to 25 nodes; big graphs read as noise.
- The validator will tell you exactly what's wrong if you break the graph.
- Optionally drop a `public/scenes/<nodeId>.jpg` per node for illustrations.

### Conditional choices

A choice may declare `"requires": "<nodeId>"`, making it available only if the player has
already visited that node this run. The edge still appears in the graph (the validator
ignores gating for reachability); only the button is hidden. Used here so you can't pour
lamp oil you never picked up.

## Design decisions

- **Backtracking: allowed.** The history stack drives an Undo button, so you can explore
  all six endings in one sitting. Undone edges dim in the graph; endings you've found
  are remembered across Undo and Restart (but not reload; there's deliberately no
  persistence).
- **Layout once, highlight often.** Re-running layout on every move makes the graph
  squirm; positions are stable for the life of the story file.
- **Validator before render.** Authoring mistakes surface as a readable error list, not
  as runtime weirdness three choices deep.

## Stack

Vite · React 18 · @xyflow/react (React Flow 12) · dagre, plus one-time image generation
via pollinations.ai. No runtime API calls, no backend, no accounts.
