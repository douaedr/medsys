path = r"C:\Users\douae\Desktop\PFA\medsys-fixed\ms-auth\src\main\java\com\hospital\auth\enums\Role.java"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = "    // FEAT 1 \u2014 Chef de service\n    CHEF_SERVICE\n}"
new = "    // FEAT 1 \u2014 Chef de service\n    CHEF_SERVICE,\n    // FEAT 12 - Personnel soignant\n    INFIRMIER,\n    AIDE_SOIGNANT,\n    BRANCARDIER\n}"

if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK - roles ajoutes")
else:
    print("ERREUR - bloc non trouve")
