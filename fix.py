import sys
for path in sys.argv[1:]:
    with open(path, 'rb') as f:
        content = f.read()
    if content.startswith(b'\xef\xbb\xbf'):
        content = content[3:]
    with open(path, 'wb') as f:
        f.write(content)
    print(f"Fixed: {path}")
