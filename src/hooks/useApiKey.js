import { useState, useCallback } from 'react'

const KEY = 'neurocarta_rapidapi_key'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(KEY) ?? '')

  const saveApiKey = useCallback((key) => {
    localStorage.setItem(KEY, key)
    setApiKeyState(key)
  }, [])

  return { apiKey, saveApiKey }
}
