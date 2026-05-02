/**
 * Hook simple pour lire et écrire le paramètre "tab" dans l'URL.
 * Retourne [tab, setTab] où tab est la valeur actuelle (ou defaultTab si absent)
 * et setTab change l'URL via navigate (préserve l'historique pour les flèches du navigateur).
 */
import { useSearchParams } from 'react-router-dom'

export function useTab(defaultTab = 'dashboard') {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || defaultTab

  const setTab = (newTab) => {
    const params = new URLSearchParams(searchParams)
    if (newTab === defaultTab) {
      params.delete('tab')
    } else {
      params.set('tab', newTab)
    }
    setSearchParams(params)
  }

  return [tab, setTab]
}
