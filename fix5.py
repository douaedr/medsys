path = r"C:\Users\douae\Desktop\PFA\medsys-fixed\ms-patient-personnel\src\main\java\com\hospital\patient\controller\ChefServiceController.java"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Supprimer le doublon - garder seulement une occurrence
import re
# Compter les occurrences
count = content.count("private final AuthServiceClient authServiceClient;")
print(f"Occurrences authServiceClient: {count}")

if count > 1:
    # Supprimer la premiere occurrence (celle du fix3)
    content = content.replace("    private final AuthServiceClient authServiceClient;\n", "", 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK - doublon supprime")
else:
    print("Pas de doublon")
