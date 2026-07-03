// Computes x/y positions for every story node with dagre, ONCE per story.
// Navigation never re-runs layout; only highlight classes change.

import dagre from 'dagre'

const NODE_WIDTH = 150
const NODE_HEIGHT = 44

export function layoutStory(story) {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', nodesep: 24, ranksep: 56 })
  g.setDefaultEdgeLabel(() => ({}))

  for (const node of story.nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }
  for (const node of story.nodes) {
    for (const choice of node.choices || []) {
      g.setEdge(node.id, choice.target)
    }
  }

  dagre.layout(g)

  const positions = {}
  for (const node of story.nodes) {
    const { x, y } = g.node(node.id)
    // dagre gives center points; React Flow wants top-left corners
    positions[node.id] = { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 }
  }
  return { positions, nodeWidth: NODE_WIDTH, nodeHeight: NODE_HEIGHT }
}
