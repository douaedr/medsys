f = r'C:\Users\douae\Desktop\PFA\medsys-fixed\medsys-web\src\api\api.js'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

# Supprimer APPT_API du debut
c = c.replace("const APPT_API = axios.create({ baseURL: '/api' })\nwithAuth(APPT_API)\n", "")

# L'ajouter apres la definition de withAuth
c = c.replace("withAuth(AUTH_API)", "withAuth(AUTH_API)\nconst APPT_API = axios.create({ baseURL: '/api' })\nwithAuth(APPT_API)")

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
print('Done')
