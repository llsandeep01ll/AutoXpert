
import cv2
import os

# ---------- CONFIG ----------
images_dir = "D:/COCO_dataset/test/images"           # folder with .jpg/.png images
labels_dir = "D:/COCO_dataset/test/labels"           # folder with YOLO .txt labels
output_labels_dir = "D:/COCO_dataset/test/updated_labels"  # folder to save updated labels
os.makedirs(output_labels_dir, exist_ok=True)

# Optional: Map of known class IDs to names (just for display)
class_map = {
    0: "dent",
    1: "scratch",
    2: "crack",
    3: "glass shatter",
    4: "lamp broken",
    5: "tire flat"
}
# ----------------------------

def process_image(image_path, label_path, output_label_path):
    img = cv2.imread(image_path)
    if img is None:
        print(f"⚠️ Could not load {image_path}")
        return

    h, w, _ = img.shape

    if not os.path.exists(label_path):
        print(f"⚠️ No label file for {image_path}")
        return
    with open(label_path, "r") as f:
        lines = f.readlines()

    updated_labels = []

    for i, line in enumerate(lines):
        parts = line.strip().split()
        if len(parts) != 5:
            continue
        class_id = int(parts[0])
        x_center, y_center, bw, bh = map(float, parts[1:])

        # Convert to pixel coords for drawing
        x_min = int((x_center - bw / 2) * w)
        y_min = int((y_center - bh / 2) * h)
        x_max = int((x_center + bw / 2) * w)
        y_max = int((y_center + bh / 2) * h)

        # Copy image so each bbox is drawn fresh
        display_img = img.copy()
        cv2.rectangle(display_img, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
        label_text = f"{class_id} ({class_map.get(class_id, 'unknown')})"
        cv2.putText(display_img, label_text, (x_min, y_min - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Show image
        cv2.imshow("Labeling Tool", display_img)

        print(f"Image: {os.path.basename(image_path)} | Box {i+1}/{len(lines)}")
        print(f"Current class = {class_id} ({class_map.get(class_id, 'unknown')}), "
              f"BBox = {x_min,y_min,x_max,y_max}")

        # Ask for new class ID
        new_class = input("Enter new class ID (or press Enter to keep same): ")
        if new_class.strip() == "":
            new_class = class_id
        else:
            new_class = int(new_class)

        updated_labels.append(f"{new_class} {x_center} {y_center} {bw} {bh}\n")

        # 👇 Wait for you to press a key in the window before moving on
        cv2.waitKey(0)

    # Save updated labels
    with open(output_label_path, "w") as f:
        f.writelines(updated_labels)

    print(f"✅ Saved updated labels to {output_label_path}\n")
    cv2.destroyAllWindows()


# ---------- MAIN LOOP ----------
for img_file in os.listdir(images_dir):
    if not (img_file.endswith(".jpg") or img_file.endswith(".png")):
        continue

    image_path = os.path.join(images_dir, img_file)
    label_file = os.path.splitext(img_file)[0] + ".txt"
    label_path = os.path.join(labels_dir, label_file)
    output_label_path = os.path.join(output_labels_dir, label_file)

    process_image(image_path, label_path, output_label_path)

print("🎉 Done relabeling dataset!")
