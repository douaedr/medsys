path = r"C:\Users\douae\Desktop\PFA\medsys-fixed\medsys-web\src\pages\chef\GestionEmploiDuTemps.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = "roleLabel = r => ({ MEDECIN: 'M\u00e9decin', PERSONNEL: 'Personnel', SECRETARY: 'Secr\u00e9taire', NURSE: 'Infirmier(e)' }[r] || r)\n  const roleColor = r => ({ MEDECIN: '#0ea5e9', PERSONNEL: '#10b981', SECRETARY: '#f59e0b', NURSE: '#10b981' }[r] || '#64748b')"

new = "roleLabel = r => ({ MEDECIN: 'M\u00e9decin', INFIRMIER: 'Infirmier(e)', SECRETARY: 'Secr\u00e9taire', AIDE_SOIGNANT: 'Aide soignant', BRANCARDIER: 'Brancardier', PERSONNEL: 'Personnel' }[r] || r)\n  const roleColor = r => ({ MEDECIN: '#0ea5e9', INFIRMIER: '#10b981', SECRETARY: '#f59e0b', AIDE_SOIGNANT: '#8b5cf6', BRANCARDIER: '#f97316', PERSONNEL: '#64748b' }[r] || '#64748b')"

if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK - roleLabel et roleColor mis a jour")
else:
    print("ERREUR - bloc non trouve")
