#!/usr/bin/env python3
import os
import zipfile

def export_project():
    exclude_dirs = {'node_modules', '.git', 'dist', '.cache', '__pycache__'}
    exclude_files = {'package-lock.json'}

    os.makedirs('public', exist_ok=True)
    out_zip = 'public/TradeJournal-Project-Export.zip'

    with zipfile.ZipFile(out_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk('.'):
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            for f in files:
                if f in exclude_files or f.endswith('.zip'):
                    continue
                file_path = os.path.join(root, f)
                arcname = os.path.relpath(file_path, '.')
                z.write(file_path, arcname)

    size = os.path.getsize(out_zip)
    print(f"Project ZIP created: {out_zip} ({size} bytes)")

if __name__ == '__main__':
    export_project()
