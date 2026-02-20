from pathlib import Path

# Root dataset directory — update this to your dataset path
DATASET_DIR = Path(r"D:/COCO_dataset/dataset_types")

# Accepted image extensions
IMAGE_EXTS = {'.jpg', '.jpeg', '.png'}

# Label file extension
LABEL_EXT = '.txt'

# Dry run mode — True = just count, False = delete files
dry_run = False


def count_and_delete_with_x(folder: Path):
    image_dir = folder / "images"
    label_dir = folder / "labels"

    if not image_dir.exists() or not label_dir.exists():
        print(f"⚠️  Skipping {folder} — missing 'images' or 'labels' directory.")
        return 0, 0

    x_images = []
    x_labels = []

    for image_file in image_dir.glob("*"):
        if image_file.suffix.lower() not in IMAGE_EXTS:
            continue

        if 'x' in image_file.stem.lower():
            x_images.append(image_file)
            label_file = label_dir / (image_file.stem + LABEL_EXT)
            if label_file.exists():
                x_labels.append(label_file)

    # Report
    print(f"\n📁 Folder: {folder.name}")
    print(f"Images with 'x' in name: {len(x_images)}")
    print(f"Corresponding labels: {len(x_labels)}")

    # Delete if dry_run = False
    if not dry_run:
        for img in x_images:
            img.unlink()
        for lbl in x_labels:
            lbl.unlink()
        print(f"🗑️ Deleted {len(x_images)} images and {len(x_labels)} labels.")

    return len(x_images), len(x_labels)


def main():
    summary = {}
    for split in ["train", "test", "val"]:
        split_dir = DATASET_DIR / split
        img_count, lbl_count = count_and_delete_with_x(split_dir)
        summary[split] = (img_count, lbl_count)

    # Summary report
    print("\n========== SUMMARY ==========")
    for split, (imgs, lbls) in summary.items():
        print(f"{split.upper()}: images_with_x={imgs}, labels_with_x={lbls}")
    print("=============================\n")

    if dry_run:
        print("Dry run complete — no files deleted. Set dry_run=False to delete them safely.")


if __name__ == "__main__":
    main()
