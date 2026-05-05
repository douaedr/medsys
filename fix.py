import sys, re

path = r"C:\Users\douae\Desktop\PFA\medsys-fixed\medsys-web\src\pages\chef\GestionEmploiDuTemps.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = """  // Charger personnel depuis user_accounts via auth
  useEffect(() => {
    fetch('http://localhost:8081/api/v1/chef/medecins', { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setPersonnel(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(() => {
        // fallback: charger les plannings du chef
        fetch(`${API}/edt/chef/${chefId}`, { headers })
          .then(r => r.ok ? r.json() : [])
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              const ids = [...new Set(data.map(p => p.personnelId))]
              const fakePersonnel = ids.map(id => ({ id, email: `Personnel #${id}`, role: 'PERSONNEL' }))
              setPersonnel(fakePersonnel)
              setSelected(fakePersonnel[0])
            }
          })
      })
  }, [])"""

new = """  // Charger tout le personnel du service (tous roles)
  useEffect(() => {
    const endpoints = [
      { url: 'http://localhost:8081/api/v1/chef/medecins', role: 'MEDECIN' },
      { url: 'http://localhost:8081/api/v1/chef/infirmiers', role: 'INFIRMIER' },
      { url: 'http://localhost:8081/api/v1/chef/secretaires', role: 'SECRETARY' },
      { url: 'http://localhost:8081/api/v1/chef/aides-soignants', role: 'AIDE_SOIGNANT' },
      { url: 'http://localhost:8081/api/v1/chef/brancardiers', role: 'BRANCARDIER' },
    ]
    Promise.all(
      endpoints.map(e =>
        fetch(e.url, { headers })
          .then(r => r.ok ? r.json() : [])
          .then(data => (Array.isArray(data) ? data : []).map(p => ({ ...p, role: p.role || e.role })))
          .catch(() => [])
      )
    ).then(results => {
      const list = results.flat()
      setPersonnel(list)
      if (list.length > 0) setSelected(list[0])
    })
  }, [])"""

if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK - useEffect mis a jour")
else:
    print("ERREUR - bloc non trouve")
