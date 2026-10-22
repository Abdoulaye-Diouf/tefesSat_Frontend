export function AudioButton({ file, playAudio, label }) {
  return (
    <button
      type="button"
      className="audio-button"
      onClick={() => playAudio([file])}
      aria-label={`Écouter : ${label}`}
      title={`Écouter : ${label}`}
    >
      <span aria-hidden="true">🔊</span>
    </button>
  )
}
