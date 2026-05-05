path = r"C:\Users\douae\Desktop\PFA\medsys-fixed\ms-patient-personnel\src\main\java\com\hospital\patient\controller\ChefServiceController.java"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Ajouter import AuthServiceClient
old1 = "import com.hospital.patient.dto.*;"
new1 = "import com.hospital.patient.client.AuthServiceClient;\nimport com.hospital.patient.dto.*;"
content = content.replace(old1, new1, 1)

# Ajouter le champ
old2 = "    private final ChefServiceManager manager;\n    private final JwtService jwtService;"
new2 = "    private final ChefServiceManager manager;\n    private final JwtService jwtService;\n    private final AuthServiceClient authServiceClient;"
content = content.replace(old2, new2, 1)

# Ajouter les endpoints avant la derniere accolade
old3 = "    private Long chefId(HttpServletRequest req)"
new3 = """    @GetMapping("/infirmiers")
    public ResponseEntity<List<CollegueDTO>> getInfirmiers() {
        return ResponseEntity.ok(authServiceClient.getByRole("INFIRMIER"));
    }

    @GetMapping("/secretaires")
    public ResponseEntity<List<CollegueDTO>> getSecretaires() {
        return ResponseEntity.ok(authServiceClient.getByRole("SECRETARY"));
    }

    @GetMapping("/aides-soignants")
    public ResponseEntity<List<CollegueDTO>> getAidesSoignants() {
        return ResponseEntity.ok(authServiceClient.getByRole("AIDE_SOIGNANT"));
    }

    @GetMapping("/brancardiers")
    public ResponseEntity<List<CollegueDTO>> getBrancardiers() {
        return ResponseEntity.ok(authServiceClient.getByRole("BRANCARDIER"));
    }

    private Long chefId(HttpServletRequest req)"""
content = content.replace(old3, new3, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("OK")
