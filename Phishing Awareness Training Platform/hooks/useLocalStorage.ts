"use client"

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item) setStoredValue(JSON.parse(item) as T)
    } catch {
      // ignore
    }
  }, [key])

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore
    }
  }

  return [storedValue, setValue]
}
