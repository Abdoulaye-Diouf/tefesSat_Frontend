import { useEffect, useState } from 'react'

/**
 * Charge un GeoJSON depuis une URL (fichier local via Vite ?url ou /public).
 * @param {string | null | undefined} url
 */
export function useGeoJson(url) {
  const [result, setResult] = useState({
    url: null,
    data: null,
    error: null,
    loading: false,
  })

  useEffect(() => {
    if (!url) return

    let cancelled = false

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} — ${url}`)
        }
        return response.json()
      })
      .then((json) => {
        if (!cancelled) {
          setResult({ url, data: json, error: null, loading: false })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            url,
            data: null,
            error: err instanceof Error ? err : new Error(String(err)),
            loading: false,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [url])

  if (result.url !== url) {
    return { data: null, loading: Boolean(url), error: null }
  }
  return { data: result.data, loading: result.loading, error: result.error }
}
