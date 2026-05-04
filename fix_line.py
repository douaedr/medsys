path = r"C:\Users\douae\Desktop\PFA\medsys-fixed\medsys-web\src\pages\PatientPortalPage.jsx"

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Corriger la ligne 242 (index 241)
for i, line in enumerate(lines):
    if 'placeholder' in line and ('Â' in line or '\xa2' in line or 'â"' in line or '\x00' in line):
        lines[i] = lines[i].split('placeholder=')[0] + 'placeholder="••••••••" />\n'
        print(f"Ligne {i+1} corrigee: {lines[i].strip()}")

with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)

print("DONE!")
