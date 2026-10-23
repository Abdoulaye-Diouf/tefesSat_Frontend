import { useEffect, useRef } from 'react'

export function VideoModal({ onClose }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    closeButtonRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      if (video) {
        video.pause()
        video.currentTime = 0
      }
    }
  }, [])

  const handleDialogKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose()
      return
    }
    if (event.key !== 'Tab') return

    const focusable = dialogRef.current?.querySelectorAll(
      'button, video, [href], [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="video-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className="video-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
        onKeyDown={handleDialogKeyDown}
      >
        <header className="video-modal__header">
          <h2 id="video-modal-title">Vidéo TefesSat</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="video-modal__close"
            onClick={onClose}
            aria-label="Fermer la vidéo"
          >
            ×
          </button>
        </header>
        <video
          ref={videoRef}
          className="video-modal__player"
          controls
          playsInline
          preload="metadata"
        >
          <source
            src={`${import.meta.env.BASE_URL}video_tefessat.mp4`}
            type="video/mp4"
          />
          Votre navigateur ne prend pas en charge la lecture vidéo.
        </video>
      </section>
    </div>
  )
}
