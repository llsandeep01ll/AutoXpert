import os

# Base dataset path
base_dir = r"D:/COCO_dataset/dataset_parts"

def clean_labels(split):
    labels_dir = os.path.join(base_dir, split, "labels")

    if not os.path.exists(labels_dir):
        print(f"⚠️ No labels folder found in {split}")
        return

    label_files = [f for f in os.listdir(labels_dir) if f.endswith(".txt")]
    print(f"\n🧹 Cleaning {split}: {len(label_files)} label files")

    fixed_count = 0
    malformed_count = 0

    for file in label_files:
        path = os.path.join(labels_dir, file)
        new_lines = []

        with open(path, "r") as f:
            for line in f:
                parts = line.strip().split()
                if not parts:
                    continue
                try:
                    # Convert float-like class ID (e.g., "6.0") → int
                    parts[0] = str(int(float(parts[0])))
                    new_lines.append(" ".join(parts))
                except ValueError:
                    malformed_count += 1
                    print(f"⚠️ Skipping malformed line in {file}: {line.strip()}")

        # Write cleaned data back
        with open(path, "w") as f:
            f.write("\n".join(new_lines) + ("\n" if new_lines else ""))

        fixed_count += 1

    print(f"✅ {split} cleaned: {fixed_count} files processed, {malformed_count} malformed lines skipped.")


# Clean all three splits
for split in ["train", "val", "test"]:
    clean_labels(split)

print("\n🎯 Label cleanup complete! All class IDs are now integers.")
