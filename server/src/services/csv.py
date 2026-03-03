import os, shutil, re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
CSV_BASE = os.path.join(SERVER_DIR, "database", "csv")
CSV_DIR = os.path.join(CSV_BASE, "active")
TRASH_DIR = os.path.join(CSV_BASE, "trash")

os.makedirs(CSV_DIR, exist_ok=True)
os.makedirs(TRASH_DIR, exist_ok=True)

def sanitize_filename(name: str) -> str:
    name = name.strip().lower()
    name = re.sub(r"[^\w\-]", "_", name)
    return name


def unique_csv_filename(name: str) -> str:
    base_name = name
    counter = 1
    filename = f"{base_name}.csv"
    while os.path.exists(os.path.join(CSV_DIR, filename)):
        filename = f"{base_name}_{counter}.csv"
        counter += 1
    return filename


def write_csv(name: str, content: str) -> str:
    filename = unique_csv_filename(name)
    path = os.path.join(CSV_DIR, filename)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return filename


def read_csv(name: str) -> str:
    path = os.path.join(CSV_DIR, name)
    if not os.path.exists(path): return ""
    with open(path, "r", encoding="utf-8") as f: return f.read()


def move_to_trash(name: str) -> str:
    src_path = os.path.join(CSV_DIR, name)
    if not os.path.exists(src_path): return None
    trash_path = os.path.join(TRASH_DIR, name)
    shutil.move(src_path, trash_path)
    return name


def restore_from_trash(name: str):
    trash_path = os.path.join(TRASH_DIR, name)
    if not os.path.exists(trash_path): return None
    restored_path = os.path.join(CSV_DIR, name)
    shutil.move(trash_path, restored_path)
    return name


def delete_file(name: str):
    path = os.path.join(CSV_DIR, name)
    if os.path.exists(path):
        os.remove(path)
