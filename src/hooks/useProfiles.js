import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'neurocarta_profiles'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useProfiles() {
  const [profiles, setProfiles] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    } catch {
      // quota exceeded — silently fail
    }
  }, [profiles])

  const addProfile = useCallback((data) => {
    const profile = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    setProfiles(prev => [profile, ...prev])
    return profile
  }, [])

  const updateProfile = useCallback((id, data) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
  }, [])

  const deleteProfile = useCallback((id) => {
    setProfiles(prev => prev.filter(p => p.id !== id))
  }, [])

  const importProfiles = useCallback((incoming) => {
    if (!Array.isArray(incoming)) throw new Error('El archivo no contiene un array de fichas')
    const normalized = incoming.map(p => ({
      ...p,
      id: p.id ?? generateId(),
      createdAt: p.createdAt ?? new Date().toISOString(),
    }))
    setProfiles(normalized)
    return normalized.length
  }, [])

  const exportProfiles = useCallback(() => {
    const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `neurocarta_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [profiles])

  return { profiles, addProfile, updateProfile, deleteProfile, importProfiles, exportProfiles }
}
