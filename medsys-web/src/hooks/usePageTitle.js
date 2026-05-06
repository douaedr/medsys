import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — MedSys` : 'MedSys - Gestion Hospitaliere'
    return () => { document.title = 'MedSys - Gestion Hospitaliere' }
  }, [title])
}
