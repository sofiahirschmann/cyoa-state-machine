import { useReducer, useMemo } from 'react'
import story from './story/story.json'
import { validateStory } from './lib/validate'
import { createInitialState, choose, undo, restart } from './lib/machine'
import StoryPanel from './StoryPanel'
import GraphPanel from './GraphPanel'

function reducer(state, action) {
  switch (action.type) {
    case 'CHOOSE':
      return choose(story, state, action.choiceIndex)
    case 'UNDO':
      return undo(state)
    case 'RESTART':
      return restart(story, state)
    default:
      return state
  }
}

function ValidationErrorScreen({ errors, warnings }) {
  return (
    <div className="validation-error">
      <h1>Story graph failed validation</h1>
      <p>Fix <code>src/story/story.json</code> and reload.</p>
      <ul>
        {errors.map((e, i) => (
          <li key={i} className="error">{e}</li>
        ))}
        {warnings.map((w, i) => (
          <li key={i} className="warning">{w}</li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  const { errors, warnings } = useMemo(() => {
    const result = validateStory(story)
    result.warnings.forEach((w) => console.warn(`[story] ${w}`))
    return result
  }, [])

  const [state, dispatch] = useReducer(reducer, story, createInitialState)

  if (errors.length > 0) {
    return <ValidationErrorScreen errors={errors} warnings={warnings} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>{story.title}</h1>
        <span className="tagline">the state machine is the visualization</span>
      </header>
      <main className="panels">
        <StoryPanel story={story} state={state} dispatch={dispatch} />
        <GraphPanel story={story} state={state} />
      </main>
    </div>
  )
}
