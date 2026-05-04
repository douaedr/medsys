import os
import re

src = r"C:\Users\douae\Desktop\PFA\medsys-fixed\medsys-web\src"

replacements = [
    ('Ã©', 'e'), ('Ã¨', 'e'), ('Ãª', 'e'), ('Ã ', 'a'), ('Ã¢', 'a'),
    ('Ã®', 'i'), ('Ã¯', 'i'), ('Ã´', 'o'), ('Ã»', 'u'), ('Ã¹', 'u'),
    ('Ã§', 'c'), ('Ã‚', ''), ('Ãƒ', ''), ('â€™', "'"), ('â€"', '-'),
    ('â€¦', '...'), ('â€˜', "'"), ('â€œ', '"'), ('â€', '"'),
]

for root, dirs, files in os.walk(src):
    for fname in files:
        if fname.endswith('.jsx') or fname.endswith('.js') or fname.endswith('.ts'):
            path = os.path.join(root, fname)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                original = content
                for bad, good in replacements:
                    content = content.replace(bad, good)
                if content != original:
                    with open(path, 'w', encoding='utf-8', newline='\n') as f:
                        f.write(content)
                    print(f"OK - {fname}")
                else:
                    print(f"-- {fname} (pas change)")
            except Exception as e:
                print(f"ERREUR {fname}: {e}")

print("DONE!")
