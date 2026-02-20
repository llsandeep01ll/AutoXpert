from pathlib import Path
from collections import Counter

DATASET_DIR = Path(r"D:\COCO_dataset\dataset_types")    # <--- change if needed
splits = ["train", "test", "val"]

for split in splits:
    label_dir = DATASET_DIR / split / "labels"
    counter = Counter()

    for lbl in label_dir.glob("*.txt"):
        with open(lbl, "r") as f:
            for line in f:
                if line.strip():
                    cls_id = line.split()[0]
                    counter[cls_id] += 1

    print(f"\n=== {split.upper()} ===")
    if counter:
        for cls_id, freq in counter.items():
            print(f"Class {cls_id}: {freq}")
    else:
        print("NO LABELS FOUND.")
