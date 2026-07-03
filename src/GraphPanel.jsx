import { useMemo, useEffect } from 'react'
import { ReactFlow, ReactFlowProvider, useReactFlow, Background } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { layoutStory } from './lib/layout'
import { visitedNodeIds, traveledEdges } from './lib/machine'

function nodeClass(id, story, state, visited) {
  const node = story.nodes.find((n) => n.id === id)
  const classes = ['story-node']
  if (node.ending) classes.push('ending')
  if (id === state.currentId) classes.push('current')
  else if (visited.has(id)) classes.push('visited')
  else classes.push('unvisited')
  return classes.join(' ')
}

function GraphInner({ story, state }) {
  // Layout is computed once per story, never on navigation
  const { positions } = useMemo(() => layoutStory(story), [story])

  const visited = visitedNodeIds(state)
  const traveled = traveledEdges(state)

  const nodes = useMemo(
    () =>
      story.nodes.map((n) => ({
        id: n.id,
        position: positions[n.id],
        data: { label: n.label || n.id },
        className: nodeClass(n.id, story, state, visited),
        draggable: false,
        connectable: false,
        selectable: false,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [story, positions, state.currentId, state.history.length]
  )

  const edges = useMemo(
    () =>
      story.nodes.flatMap((n) =>
        (n.choices || []).map((choice, i) => {
          const key = `${n.id}->${choice.target}`
          const isTraveled = traveled.has(key)
          return {
            id: `${key}#${i}`,
            source: n.id,
            target: choice.target,
            animated: isTraveled,
            className: isTraveled ? 'edge-traveled' : 'edge-untraveled',
          }
        })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [story, state.history.length]
  )

  // Keep the current node in view as the player moves
  const { setCenter } = useReactFlow()
  useEffect(() => {
    const pos = positions[state.currentId]
    if (pos) setCenter(pos.x + 75, pos.y + 22, { zoom: 1, duration: 500 })
  }, [state.currentId, positions, setCenter])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      minZoom={0.2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={24} size={1} />
    </ReactFlow>
  )
}

export default function GraphPanel({ story, state }) {
  return (
    <section className="graph-panel">
      <ReactFlowProvider>
        <GraphInner story={story} state={state} />
      </ReactFlowProvider>
      <div className="legend">
        <span className="legend-item"><i className="dot current" /> you are here</span>
        <span className="legend-item"><i className="dot visited" /> visited</span>
        <span className="legend-item"><i className="dot unvisited" /> unexplored</span>
        <span className="legend-item"><i className="dot ending" /> ending</span>
      </div>
    </section>
  )
}
