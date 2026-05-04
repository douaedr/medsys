path = r"C:\Users\douae\Desktop\PFA\medsys-fixed\medsys-web\src\pages\PatientPortalPage.jsx"

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Corriger la ligne avec description input cassee (ligne ~388)
    if 'ant.description' in line and 'placeholder=' in line:
        lines[i] = '                          className="input" placeholder="ex: Allergie a la penicilline" />\n'
        print(f"Ligne {i+1} corrigee")
    # Corriger les caracteres corrompus restants
    if 'Ã†â€™Ã‚Â©' in line:
        lines[i] = line.replace('Ã†â€™Ã‚Â©', 'e')
        print(f"Ligne {i+1} encodage corrige")
    if 'Ã¢â€â‚¬' in line:
        lines[i] = line.replace('Ã¢â€â‚¬', '-')
        print(f"Ligne {i+1} tiret corrige")

with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)

print("DONE!")
