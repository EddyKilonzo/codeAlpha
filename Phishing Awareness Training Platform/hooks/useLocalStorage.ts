"use client"

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return
      const parsed = JSON.parse(item) as T
      setStoredValue(parsed)
    } catch {
      // Corrupted or unavailable — fall back to default without crashing
    }
  }, [key])

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value)
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Quota exceeded or storage unavailable — state still updates in memory
    }
  }, [key])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
