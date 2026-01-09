'use client'

import { useLanguage } from './LanguageProvider'
import { onwalkCopy } from './onwalk'

export function useOnwalkCopy() {
  const { language } = useLanguage()
  return onwalkCopy[language]
}
