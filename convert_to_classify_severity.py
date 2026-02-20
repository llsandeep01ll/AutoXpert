import cv2
import os
from pathlib import Path

# === CONFIGURATION ===
DATASET_DIR = Path(r"D:\COCO_dataset\dataset_types")  # root containing train/test/val
OUTPUT_DIR = Path(r"D:\COCO_dataset\types_classification")  # output folder

# YOLO class ID to class name mapping
CLASS_MAP = {
    "0": "Dent",
    "1": "Scratch",
    "2": "Crack",
    "3": "glass shatter",
    "4": "lamp broken",
    "5": "tire flat",
}

# Image extension list
IMAGE_EXTS = {".jpg", ".jpeg", ".png"}

# Create output directories for each class under train/test/val
def create_output_folders():
    for split in ["train", "test", "val"]:
        for class_name in CLASS_MAP.values():
            (OUTPUT_DIR / split / class_name).mkdir(parents=True, exist_ok=True)

def yolo_to_xyxy(yolo_bbox, img_w, img_h):
    """Convert normalized YOLO (x_center, y_center, w, h) to pixel (x1, y1, x2, y2)."""
    x_center, y_center, w, h = yolo_bbox
    x_center *= img_w
    y_center *= img_h
    w *= img_w
    h *= img_h

    x1 = int(x_center - w / 2)
    y1 = int(y_center - h / 2)
    x2 = int(x_center + w / 2)
    y2 = int(y_center + h / 2)

    # clip coordinates
    x1 = max(0, x1)
    y1 = max(0, y1)
    x2 = min(img_w - 1, x2)
    y2 = min(img_h - 1, y2)
    return x1, y1, x2, y2


def process_split(split_name):
    image_dir = DATASET_DIR / split_name / "images"
    label_dir = DATASET_DIR / split_name / "labels"

    if not image_dir.exists() or not label_dir.exists():
        print(f"⚠️ Skipping {split_name} — missing folders.")
        return

    counter = 0

    for image_file in image_dir.glob("*"):
        if image_file.suffix.lower() not in IMAGE_EXTS:
            continue

        label_file = label_dir / (image_file.stem + ".txt")
        if not label_file.exists():
            continue

        img = cv2.imread(str(image_file))
        if img is None:
            print(f"⚠️ Could not read {image_file}")
            continue

        img_h, img_w = img.shape[:2]

        crop_index = 0  # <-- NEW  reset for each image

        with open(label_file, "r") as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) != 5:
                    continue

                class_id, x_center, y_center, w, h = parts
                if class_id not in CLASS_MAP:
                    continue

                x1, y1, x2, y2 = yolo_to_xyxy(
                    (float(x_center), float(y_center), float(w), float(h)),
                    img_w, img_h
                )

                cropped = img[y1:y2, x1:x2]
                if cropped.size == 0:
                    continue

                class_name = CLASS_MAP[class_id]
                output_folder = OUTPUT_DIR / split_name / class_name

                # save with original name + index
                output_path = output_folder / f"{image_file.stem}_{crop_index}.jpg"
                cv2.imwrite(str(output_path), cropped)
                crop_index += 1


    print(f"✅ {split_name}: saved {counter} cropped images.")


def main():
    create_output_folders()
    for split in ["train", "test", "val"]:
        process_split(split)
    print("\n🎯 Conversion complete! All crops saved in:", OUTPUT_DIR)


if __name__ == "__main__":
    main()
