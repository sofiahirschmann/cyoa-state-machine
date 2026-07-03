import { nodeById, isEnding, availableChoices } from './lib/machine'

export default function StoryPanel({ story, state, dispatch }) {
  const node = nodeById(story, state.currentId)
  const ending = isEnding(story, state.currentId)
  const choices = availableChoices(story, state)
  const totalEndings = story.nodes.filter((n) => n.ending).length

  return (
    <section className="story-panel">
      <div className="story-scroll">
        {ending && <div className="ending-banner">THE END</div>}
        <p className="story-text">{node.text}</p>
        <img
          key={state.currentId}
          className="scene-img"
          src={`${import.meta.env.BASE_URL}scenes/${state.currentId}.jpg`}
          alt=""
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />

        {!ending && (
          <div className="choices">
            {choices.map((choice, i) => (
              <button
                key={`${state.currentId}-${i}`}
                className="choice-btn"
                onClick={() => dispatch({ type: 'CHOOSE', choiceIndex: i })}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {ending && (
          <div className="ending-actions">
            <p className="endings-count">
              Endings found: {state.endingsFound.length} / {totalEndings}
            </p>
            <button className="choice-btn" onClick={() => dispatch({ type: 'RESTART' })}>
              Play again
            </button>
          </div>
        )}
      </div>

      <footer className="story-controls">
        <button
          className="ctrl-btn"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={state.history.length === 0}
        >
          ↩ Undo
        </button>
        <span className="step-count">step {state.history.length}</span>
        <button className="ctrl-btn" onClick={() => dispatch({ type: 'RESTART' })}>
          ⟲ Restart
        </button>
      </footer>
    </section>
  )
}
