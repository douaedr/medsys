path = r"C:\Users\douae\Desktop\PFA\medsys-fixed\ms-patient-personnel\src\main\java\com\hospital\patient\controller\ChefServiceController.java"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = """import com.hospital.patient.dto.*;
import com.hospital.patient.entity.Service;
import com.hospital.patient.security.JwtService;
import com.hospital.patient.service.ChefServiceManager;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;"""

new = """import com.hospital.patient.client.AuthServiceClient;
import com.hospital.patient.dto.*;
import com.hospital.patient.entity.Service;
import com.hospital.patient.security.JwtService;
import com.hospital.patient.service.ChefServiceManager;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;"""

content = content.replace(old, new)

old2 = """    private final ChefServiceManager manager;
    private final JwtService jwtService;"""

new2 = """    private final ChefServiceManager manager;
    private final JwtService jwtService;
    private final AuthServiceClient authServiceClient;"""

content = content.replace(old2, new2)

old3 = """    /* ------ Helpers ------ */"""

new3 = """    /* ------ Personnel par role ------ */

    @GetMapping("/infirmiers")
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

    /* ------ Helpers ------ */"""

content = content.replace(old3, new3)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("OK - endpoints ajoutes")
