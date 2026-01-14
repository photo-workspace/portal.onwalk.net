'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE, normalizeLanguage, type Language } from './language'

type LanguageState = {
  language: Language
  setLanguage: (lang: Language) => void
  hydrateLanguage: () => void
}

const STORAGE_KEY = 'cloudnative-suite.language'

function detectPreferredLanguage(): Language {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  const normalizedStored = normalizeLanguage(stored)
  if (normalizedStored) {
    return normalizedStored
  }

  const cookieValue = typeof document !== 'undefined' ? document.cookie : ''
  if (cookieValue) {
    const cookieMatch = cookieValue
      .split(';')
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${LANGUAGE_COOKIE}=`))
    if (cookieMatch) {
      const value = cookieMatch.split('=')[1]
      const normalizedCookie = normalizeLanguage(value)
      if (normalizedCookie) {
        return normalizedCookie
      }
    }
  }

  const [primaryLocale] = window.navigator.languages?.length
    ? window.navigator.languages
    : [window.navigator.language]

  if (typeof primaryLocale === 'string') {
    const normalized = primaryLocale.toLowerCase()
    if (normalized.startsWith('en')) {
      return 'en'
    }
    if (normalized.startsWith('zh')) {
      return 'zh'
    }
  }

  return DEFAULT_LANGUAGE
}

function syncDocumentLanguage(language: Language) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.lang = language
  document.documentElement.dataset.language = language
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: detectPreferredLanguage(),
  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language)
      document.cookie = `${LANGUAGE_COOKIE}=${language}; Path=/; Max-Age=31536000; SameSite=Lax`
    }
    syncDocumentLanguage(language)
    set({ language })
  },
  hydrateLanguage: () => {
    const preferred = detectPreferredLanguage()
    syncDocumentLanguage(preferred)
    set({ language: preferred })
  },
}))

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const { hydrateLanguage } = useLanguageStore.getState()
    hydrateLanguage()
    const unsubscribe = useLanguageStore.subscribe((state, prevState) => {
      if (state.language !== prevState.language) {
        syncDocumentLanguage(state.language)
      }
    })
    return unsubscribe
  }, [])

  return children
}

export function useLanguage() {
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  return { language, setLanguage }
}
