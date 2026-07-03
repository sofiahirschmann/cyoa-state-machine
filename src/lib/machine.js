// The single source of truth for game state. Pure functions, no React, no DOM.
// Both the story panel and the graph panel are views of the state produced here;
// neither holds its own copy of "where am I".

export function nodeById(story, id) {
  return story.nodes.find((n) => n.id === id)
}

export function isEnding(story, id) {
  const node = nodeById(story, id)
  return Boolean(node && node.ending)
}

export function createInitialState(story) {
  return {
    currentId: story.start,
    // history is the source of truth for the traveled path: [{ from, to, choiceIndex }]
    history: [],
    // endings the player has reached across restarts (survives RESTART, not reload)
    endingsFound: [],
  }
}

export function visitedNodeIds(state) {
  const ids = new Set([...state.history.map((h) => h.from), state.currentId])
  return ids
}

export function traveledEdges(state) {
  return new Set(state.history.map((h) => `${h.from}->${h.to}`))
}

// Choices on the current node that the player can actually take right now.
// A choice with `requires: nodeId` is only available if that node has been visited.
export function availableChoices(story, state) {
  const node = nodeById(story, state.currentId)
  if (!node || node.ending) return []
  const visited = visitedNodeIds(state)
  return node.choices.filter((c) => !c.requires || visited.has(c.requires))
}

export function choose(story, state, choiceIndex) {
  const choicesNow = availableChoices(story, state)
  const choice = choicesNow[choiceIndex]
  if (!choice) return state
  const nextId = choice.target
  const endingsFound =
    isEnding(story, nextId) && !state.endingsFound.includes(nextId)
      ? [...state.endingsFound, nextId]
      : state.endingsFound
  return {
    ...state,
    currentId: nextId,
    history: [...state.history, { from: state.currentId, to: nextId }],
    endingsFound,
  }
}

export function undo(state) {
  if (state.history.length === 0) return state
  const history = state.history.slice(0, -1)
  const last = state.history[state.history.length - 1]
  return { ...state, currentId: last.from, history }
}

export function restart(story, state) {
  return {
    ...createInitialState(story),
    endingsFound: state ? state.endingsFound : [],
  }
}
