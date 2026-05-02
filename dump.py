import os

output_file = "project_dump.txt"
extensions = {".java", ".properties", ".xml", ".yaml", ".yml", ".dart", ".gradle"}
exclude_dirs = {"target", "build", ".git", ".idea", "node_modules", "__pycache__"}

with open(output_file, "w", encoding="utf-8") as out:
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                path = os.path.join(root, file)
                out.write(f"\n{'='*60}\n")
                out.write(f"FICHIER : {path}\n")
                out.write(f"{'='*60}\n")
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        out.write(f.read())
                except Exception as e:
                    out.write(f"[Erreur de lecture : {e}]\n")

print(f"Dump généré : {output_file}")