import os
from collections import Counter

# Base dataset path
base_dir = r"D:/COCO_dataset/dataset_severity"

# Function to count class frequencies in a given split
def count_class_frequencies(split):
    labels_dir = os.path.join(base_dir, split, "labels")
    class_counts = Counter()

    if not os.path.exists(labels_dir):
        print(f"⚠️ No labels folder found in {split}")
        return class_counts

    label_files = [f for f in os.listdir(labels_dir) if f.endswith(".txt")]
    print(f"\n📂 Processing {split}: {len(label_files)} label files")

    for file in label_files:
        with open(os.path.join(labels_dir, file), "r") as f:
            for line in f:
                parts = line.strip().split()
                if parts:
                    class_id = int(parts[0])
                    class_counts[class_id] += 1

    return class_counts

# Main loop for each split
splits = ["train", "val", "test"]
for split in splits:
    counts = count_class_frequencies(split)
    if counts:
        print(f"\n🔹 Class Distribution in {split}:")
        total = sum(counts.values())
        for cls_id, freq in sorted(counts.items()):
            print(f"  Class {cls_id}: {freq} instances ({freq/total:.2%})")
        print(f"  Total labels in {split}: {total}")
    else:
        print(f"❌ No label data found for {split}")
