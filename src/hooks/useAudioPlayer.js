import { useCallback, useEffect, useRef, useState } from 'react'

export function useAudioPlayer() {
  const currentAudio = useRef(null)
  const playbackId = useRef(0)
  const [error, setError] = useState('')

  const stopAudio = useCallback(() => {
    playbackId.current += 1
    if (currentAudio.current) {
      currentAudio.current.onended = null
      currentAudio.current.onerror = null
      currentAudio.current.pause()
    }
    currentAudio.current = null
  }, [])

  const playSequence = useCallback(
    (files) => {
      stopAudio()
      setError('')

      const currentPlaybackId = playbackId.current
      let index = 0
      const playNext = () => {
        if (currentPlaybackId !== playbackId.current) return
        if (index >= files.length) {
          currentAudio.current = null
          return
        }

        const file = files[index]
        const audio = new Audio(`${import.meta.env.BASE_URL}audio/${file}.m4a`)
        currentAudio.current = audio
        index += 1

        audio.onended = playNext
        audio.onerror = () => {
          if (currentPlaybackId !== playbackId.current) return
          currentAudio.current = null
          setError(`Le vocal « ${file} » n’a pas pu être chargé.`)
        }
        audio.play().catch((playError) => {
          if (currentPlaybackId !== playbackId.current) return
          currentAudio.current = null
          setError(
            `Lecture audio impossible : ${playError.message || 'le navigateur a bloqué le son.'}`,
          )
        })
      }

      if (files.length) playNext()
    },
    [stopAudio],
  )

  useEffect(() => stopAudio, [stopAudio])

  return { playSequence, audioError: error }
}
