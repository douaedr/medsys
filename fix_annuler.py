f = r'C:\Users\douae\Desktop\PFA\medsys-fixed\medsys-web\src\api\api.js'
with open(f, 'r', encoding='utf-8') as file:
    lines = file.readlines()

for i, line in enumerate(lines):
    if 'annulerRdv' in line:
        lines[i] = "  annulerRdv: (id) => APPT_API.delete('/appointments', { data: { appointmentId: id } }),\n"
        print(f'Fixed line {i+1}')

with open(f, 'w', encoding='utf-8') as file:
    file.writelines(lines)
