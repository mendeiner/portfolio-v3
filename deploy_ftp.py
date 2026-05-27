import os
import hashlib
import json
import ssl
from ftplib import FTP_TLS, error_perm
import io
import sys

FTP_HOST = "ftp.brunoedita.com.br"
FTP_USER = "brunoedita"
FTP_PASS = os.environ["FTP_PASSWORD"]
LOCAL_DIR = "dist"
MANIFEST_FILE = "deploy_manifest.json"
EXCLUDE_DIRS = {"videos"}
EXCLUDE_FILES = {".DS_Store", "Thumbs.db"}

def md5(filepath):
    h = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def ensure_remote_dir(ftp, remote_dir):
    parts = [p for p in remote_dir.split("/") if p]
    path = ""
    for part in parts:
        path = f"{path}/{part}" if path else part
        try:
            ftp.mkd(path)
        except error_perm:
            pass  # already exists

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

ftp = FTP_TLS(context=ctx)
ftp.connect(FTP_HOST, 21)
ftp.login(FTP_USER, FTP_PASS)
ftp.prot_p()  # encrypt data channel
ftp.set_pasv(True)

# Load manifest from server (tracks file hashes from last deploy)
manifest = {}
try:
    buf = io.BytesIO()
    ftp.retrbinary(f"RETR {MANIFEST_FILE}", buf.write)
    manifest = json.loads(buf.getvalue().decode())
    print(f"Loaded manifest with {len(manifest)} entries")
except Exception:
    print("No manifest found — first deploy, uploading everything")

new_manifest = {}
uploaded = 0
skipped = 0
errors = 0

for root, dirs, files in os.walk(LOCAL_DIR):
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
    for filename in files:
        if filename in EXCLUDE_FILES:
            continue
        local_path = os.path.join(root, filename)
        rel_path = os.path.relpath(local_path, LOCAL_DIR).replace(os.sep, "/")
        file_hash = md5(local_path)
        new_manifest[rel_path] = file_hash

        if manifest.get(rel_path) == file_hash:
            skipped += 1
            continue

        remote_dir = "/".join(rel_path.split("/")[:-1])
        if remote_dir:
            ensure_remote_dir(ftp, remote_dir)

        with open(local_path, "rb") as f:
            try:
                ftp.storbinary(f"STOR {rel_path}", f)
                uploaded += 1
                print(f"  ↑ {rel_path}")
            except Exception as e:
                print(f"  ✗ {rel_path}: {e}", file=sys.stderr)
                errors += 1

# Save updated manifest to server
ftp.storbinary(f"STOR {MANIFEST_FILE}", io.BytesIO(json.dumps(new_manifest).encode()))
ftp.quit()

print(f"\n{'='*40}")
print(f"Uploaded : {uploaded}")
print(f"Skipped  : {skipped} (unchanged)")
print(f"Errors   : {errors}")

if errors:
    sys.exit(1)
