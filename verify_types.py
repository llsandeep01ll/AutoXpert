from pathlib import Path

# ORIGINAL YOLO dataset
YOLO_DIR  = Path(r"D:\COCO_dataset\dataset_types")

# CLASSIFICATION dataset created by crop script
CLASS_DIR = Path(r"D:\COCO_dataset\types_classification")

CLASS_MAP = {
    "0": "Dent",
    "1": "Scratch",
    "2": "Crack",
    "3": "glass shatter",
    "4": "lamp broken",
    "5": "tire flat",
}

# reverse mapping (folder name → class_id)
REV_MAP = {v: k for k,v in CLASS_MAP.items()}

splits = ["train", "test", "val"]

errors = []

for split in splits:
    class_split_folder = CLASS_DIR / split

    for cls_folder in class_split_folder.iterdir():
        if not cls_folder.is_dir():
            continue

        expected_cls_id = REV_MAP.get(cls_folder.name)
        if expected_cls_id is None:
            continue  # skip unknown folders

        for img_file in cls_folder.glob("*.jpg"):
            name = img_file.stem      # e.g. 000123_1
            if "_" not in name:
                errors.append(f"{img_file} has no idx separated by '_'")
                continue

            orig, idx = name.split("_")
            idx = int(idx)

            label_file = YOLO_DIR / split / "labels" / f"{orig}.txt"
            if not label_file.exists():
                errors.append(f"{img_file}: original label file NOT FOUND: {label_file}")
                continue

            lines = open(label_file).read().strip().splitlines()

            if idx >= len(lines):
                errors.append(f"{img_file}: idx {idx} out of range (labels only {len(lines)})")
                continue

            actual_cls_id = lines[idx].split()[0]

            if actual_cls_id != expected_cls_id:
                errors.append(
                    f"{img_file}: folder={cls_folder.name} expects {expected_cls_id} but label line {idx} has {actual_cls_id}"
                )

print("\n=== FINAL VERIFICATION RESULT ===")
if not errors:
    print("✅ ALL GOOD — classification dataset matches YOLO labels!")
else:
    print(f"❌ {len(errors)} mismatches found:")
    for e in errors:
        print(" -", e)
