import { useEffect, useState } from 'react'
import { parseCsv } from '../utils/csv'

export function useCsv(url) {
  const [result, setResult] = useState({
    url: null,
    rows: null,
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
        return response.text()
      })
      .then((text) => {
        if (!cancelled) {
          setResult({ url, rows: parseCsv(text), error: null, loading: false })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            url,
            rows: null,
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
    return { rows: null, loading: Boolean(url), error: null }
  }
  return { rows: result.rows, loading: result.loading, error: result.error }
}
