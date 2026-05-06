f = r'C:\Users\douae\Desktop\PFA\medsys-fixed\medsys-web\src\api\api.js'
with open(f, 'r', encoding='utf-8') as file:
    lines = file.readlines()

for i, line in enumerate(lines):
    if 'getRdv' in line and 'axios.get' in line:
        lines[i] = "  getRdv: () => APPT_API.get('/appointments/me'),\n"
        print(f'Fixed line {i+1}')

with open(f, 'w', encoding='utf-8') as file:
    file.writelines(lines)
