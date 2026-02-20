import os
import random
from pathlib import Path
from PIL import Image, ImageEnhance

ROOT = Path(r"D:/COCO_dataset/types_classification/train")

classes = [p.name for p in ROOT.iterdir() if p.is_dir()]   # auto detect
print("Classes detected:", classes)
# augment operations
def augment_image(img: Image.Image):
    # random flip
    if random.random() < 0.5:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)

    # random rotate
    angle = random.choice([0, 90, 180, 270])
    img = img.rotate(angle, expand=True)

    # brightness
    img = ImageEnhance.Brightness(img).enhance(random.uniform(0.8, 1.3))

    # contrast
    img = ImageEnhance.Contrast(img).enhance(random.uniform(0.8, 1.4))

    return img


# count images per class
counts = {}
for cls in classes:
    folder = ROOT / cls
    counts[cls] = len(list(folder.glob("*.jpg")))

print("before balancing counts:", counts)

# target = max class size
target = max(counts.values())

for cls in classes:
    folder = ROOT / cls
    imgs = sorted(list(folder.glob("*.jpg")))
    need = target - len(imgs)

    if need <= 0:
        print(f"{cls} already at target")
        continue

    print(f"{cls}: needs {need} augmentations")

    # randomly sample with replacement (safe)
    for i in range(need):
        src = random.choice(imgs)
        try:
            img = Image.open(src).convert("RGB")
        except:
            print("skip bad:", src)
            continue

        aug = augment_image(img)
        new_name = folder / f"{src.stem}_aug{i}.jpg"
        aug.save(new_name)

print("✅ balancing complete")
