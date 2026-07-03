// Story-graph validator. Runs once at startup, before anything renders.
// Errors are fatal (the app shows an error screen instead of a broken game);
// warnings are surfaced but don't block play.

export function validateStory(story) {
  const errors = []
  const warnings = []

  if (!story || !Array.isArray(story.nodes) || story.nodes.length === 0) {
    return { errors: ['Story has no nodes.'], warnings }
  }

  const ids = new Map()
  for (const node of story.nodes) {
    if (!node.id) {
      errors.push('A node is missing an "id".')
      continue
    }
    if (ids.has(node.id)) errors.push(`Duplicate node id: "${node.id}".`)
    ids.set(node.id, node)
  }

  if (!story.start) {
    errors.push('Story is missing a "start" node id.')
  } else if (!ids.has(story.start)) {
    errors.push(`Start node "${story.start}" does not exist.`)
  }

  for (const node of story.nodes) {
    if (!node.id) continue
    if (node.ending) {
      if (node.choices && node.choices.length > 0) {
        warnings.push(`Ending node "${node.id}" has choices; they will be ignored.`)
      }
      continue
    }
    if (!Array.isArray(node.choices) || node.choices.length === 0) {
      errors.push(`Node "${node.id}" is not an ending but has no choices.`)
      continue
    }
    node.choices.forEach((choice, i) => {
      if (!choice.target) {
        errors.push(`Node "${node.id}" choice ${i + 1} has no target.`)
      } else if (!ids.has(choice.target)) {
        errors.push(`Node "${node.id}" choice "${choice.label}" targets missing node "${choice.target}".`)
      }
      if (choice.requires && !ids.has(choice.requires)) {
        errors.push(`Node "${node.id}" choice "${choice.label}" requires missing node "${choice.requires}".`)
      }
    })
  }

  // Reachability: BFS from start over all choice edges (ignoring `requires` gating,
  // which only hides buttons at runtime — the edge still exists in the graph).
  if (story.start && ids.has(story.start) && errors.length === 0) {
    const reachable = new Set([story.start])
    const queue = [story.start]
    while (queue.length > 0) {
      const node = ids.get(queue.shift())
      for (const choice of node.choices || []) {
        if (!reachable.has(choice.target)) {
          reachable.add(choice.target)
          queue.push(choice.target)
        }
      }
    }
    for (const id of ids.keys()) {
      if (!reachable.has(id)) warnings.push(`Node "${id}" is unreachable from the start node.`)
    }
  }

  return { errors, warnings }
}
