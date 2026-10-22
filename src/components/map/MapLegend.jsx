import { useCallback, useEffect, useRef, useState } from 'react'
import { getRiskWolofLabel, LEGEND_ITEMS } from '../../utils/riskStyles'
import { AudioButton } from '../AudioButton'

const riskAudio = {
  Faible: 'wo_faible',
  Moyen: 'wo_moyen',
  Élevé: 'wo_eleve',
  'Très élevé': 'wo_tres_eleve',
  'Non évalué': 'wo_non_evalue',
}

export function MapLegend({ year, showBuildings, language = 'fr', playAudio }) {
  const isWolof = language === 'wo'
  const legendRef = useRef(null)
  const dragRef = useRef(null)
  const positionRef = useRef(null)
  const [position, setPosition] = useState(null)
  const [collapsed, setCollapsed] = useState(
    () => window.matchMedia('(max-width: 600px)').matches,
  )

  const setClampedPosition = useCallback((left, top) => {
    const legend = legendRef.current
    const mapShell = legend?.parentElement
    if (!legend || !mapShell) return

    const legendRect = legend.getBoundingClientRect()
    const nextPosition = {
      left: Math.max(0, Math.min(left, mapShell.clientWidth - legendRect.width)),
      top: Math.max(0, Math.min(top, mapShell.clientHeight - legendRect.height)),
    }

    positionRef.current = nextPosition
    setPosition(nextPosition)
  }, [])

  const handleDragStart = useCallback(
    (event) => {
      event.preventDefault()
      event.stopPropagation()
      const legend = legendRef.current
      const mapShell = legend?.parentElement
      if (!legend || !mapShell) return

      const legendRect = legend.getBoundingClientRect()
      const shellRect = mapShell.getBoundingClientRect()
      dragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - legendRect.left,
        offsetY: event.clientY - legendRect.top,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      setClampedPosition(
        legendRect.left - shellRect.left,
        legendRect.top - shellRect.top,
      )
    },
    [setClampedPosition],
  )

  const handleDragMove = useCallback(
    (event) => {
      const drag = dragRef.current
      const mapShell = legendRef.current?.parentElement
      if (!drag || drag.pointerId !== event.pointerId || !mapShell) return

      event.preventDefault()
      event.stopPropagation()
      const shellRect = mapShell.getBoundingClientRect()
      setClampedPosition(
        event.clientX - shellRect.left - drag.offsetX,
        event.clientY - shellRect.top - drag.offsetY,
      )
    },
    [setClampedPosition],
  )

  const handleDragEnd = useCallback((event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    event.stopPropagation()
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  const handleDragKeyDown = useCallback(
    (event) => {
      const offsets = {
        ArrowUp: [0, -16],
        ArrowDown: [0, 16],
        ArrowLeft: [-16, 0],
        ArrowRight: [16, 0],
      }
      const offset = offsets[event.key]
      if (!offset) return

      event.preventDefault()
      event.stopPropagation()
      const legend = legendRef.current
      const mapShell = legend?.parentElement
      if (!legend || !mapShell) return

      const currentPosition = positionRef.current
      const shellRect = mapShell.getBoundingClientRect()
      const legendRect = legend.getBoundingClientRect()
      setClampedPosition(
        (currentPosition?.left ?? legendRect.left - shellRect.left) + offset[0],
        (currentPosition?.top ?? legendRect.top - shellRect.top) + offset[1],
      )
    },
    [setClampedPosition],
  )

  useEffect(() => {
    const mobileLayout = window.matchMedia('(max-width: 600px)')
    const updateCollapsed = (event) => setCollapsed(event.matches)

    mobileLayout.addEventListener('change', updateCollapsed)
    return () => mobileLayout.removeEventListener('change', updateCollapsed)
  }, [])

  useEffect(() => {
    const mapShell = legendRef.current?.parentElement
    if (!mapShell || typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(() => {
      const currentPosition = positionRef.current
      if (currentPosition) {
        setClampedPosition(currentPosition.left, currentPosition.top)
      }
    })
    observer.observe(mapShell)
    observer.observe(legendRef.current)
    return () => observer.disconnect()
  }, [setClampedPosition])

  return (
    <div
      ref={legendRef}
      className={`map-legend${collapsed ? ' map-legend--collapsed' : ''}`}
      style={
        position
          ? { left: position.left, top: position.top, bottom: 'auto' }
          : undefined
      }
      aria-label={isWolof ? 'Leeralu njàqare' : 'Légende des niveaux de risque'}
    >
      <div className="map-legend__header">
        <p className="map-legend__title">
          {isWolof ? 'Leeral' : 'Risque d’érosion'}
          {isWolof ? (
            <AudioButton file="wo_legende" playAudio={playAudio} label="Leeral" />
          ) : null}
        </p>
        <button
          type="button"
          className="map-legend__drag-handle"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          onKeyDown={handleDragKeyDown}
          onClick={(event) => event.stopPropagation()}
          aria-label={
            isWolof
              ? 'Yóbbu leeral bi ak laabi arrow yi'
              : 'Déplacer la légende avec la souris, le toucher ou les flèches du clavier'
          }
          title={
            isWolof
              ? 'Tàbbi te yóbbu, walla jëfandikoo laabi arrow yi'
              : 'Glisser pour déplacer · flèches du clavier pour ajuster'
          }
        >
          <span aria-hidden="true">⠿</span>
        </button>
        <button
          type="button"
          className="map-legend__toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          aria-controls="map-legend-content"
          aria-label={
            collapsed
              ? isWolof
                ? 'Wone leeral bi'
                : 'Afficher la légende complète'
              : isWolof
                ? 'Nëbbal leeral bi'
                : 'Replier la légende'
          }
        >
          <span aria-hidden="true">{collapsed ? '+' : '−'}</span>
        </button>
      </div>
      <div id="map-legend-content" hidden={collapsed}>
        <ul>
          {LEGEND_ITEMS.map((item) => (
            <li key={item.label}>
              <span
                className="map-legend__swatch"
                style={{ backgroundColor: item.color }}
              />
              {isWolof ? getRiskWolofLabel(item.label) : item.label}
              {isWolof ? (
                <AudioButton
                  file={riskAudio[item.label]}
                  playAudio={playAudio}
                  label={getRiskWolofLabel(item.label)}
                />
              ) : null}
            </li>
          ))}
        </ul>
        <p className="map-legend__bande">
          <span className="map-legend__swatch map-legend__swatch--bande" />
          {isWolof ? 'Fi géej gi mën a jot' : `Bande menacée ${year}`}
          {isWolof ? (
            <AudioButton
              file="wo_bande_menacee"
              playAudio={playAudio}
              label="Fi géej gi mën a jot"
            />
          ) : null}
        </p>
        {showBuildings ? (
          <p className="map-legend__bande map-legend__bande--buildings">
            <span className="map-legend__swatch map-legend__swatch--buildings" />
            {isWolof ? 'Kër yi' : `Bâtiments menacés ${year}`}
            {isWolof ? (
              <AudioButton file="wo_maison" playAudio={playAudio} label="Kër" />
            ) : null}
          </p>
        ) : null}
        <p className="map-legend__bande map-legend__bande--trait">
          <span className="map-legend__swatch map-legend__swatch--trait-2030" />
          {isWolof ? 'Fi tefes bi mën a nekk ci 2030' : 'Côte projetée 2030'}
          {isWolof ? (
            <AudioButton
              file="wo_cote_2030"
              playAudio={playAudio}
              label="Fi tefes bi mën a nekk ci 2030"
            />
          ) : null}
        </p>
        <p className="map-legend__bande map-legend__bande--trait">
          <span className="map-legend__swatch map-legend__swatch--trait-2035" />
          {isWolof ? 'Fi tefes bi mën a nekk ci 2035' : 'Côte projetée 2035'}
          {isWolof ? (
            <AudioButton
              file="wo_cote_2035"
              playAudio={playAudio}
              label="Fi tefes bi mën a nekk ci 2035"
            />
          ) : null}
        </p>
      </div>
    </div>
  )
}
