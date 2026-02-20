
# import io
# import torch
# import numpy as np
# from PIL import Image
# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# import uvicorn
# import timm
# import torchvision.transforms as T

# # ---------------------------------------
# # CONFIG
# device = "cuda" if torch.cuda.is_available() else "cpu"

# # model paths
# severity_model_path = "D:/major_project/convnextb_finetuned.pth"
# type_model_path     = "D:/major_project/mobilenetv3_large_100_type_best.pth"
# yolo_model_path     = "D:/major_project/runs/detect/train2/weights/best.pt"

# severity_classes = ["mild", "moderate", "severe"]
# type_classes     = ["Dent","Scratch","Crack","glass shatter","lamp broken","tire flat"]
# # ---------------------------------------

# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], allow_headers=["*"], allow_methods=["*"]
# )

# # Load YOLO
# from ultralytics import YOLO
# yolo_model = YOLO(yolo_model_path).to(device)
# yolo_model.eval()

# # Load severity classifier
# severity_model = timm.create_model("convnext_base", pretrained=False, num_classes=len(severity_classes))
# severity_model.load_state_dict(torch.load(severity_model_path, map_location=device))
# severity_model.to(device)
# severity_model.eval()

# # Load type classifier
# type_model = timm.create_model("mobilenetv3_large_100", pretrained=False, num_classes=len(type_classes))
# type_model.load_state_dict(torch.load(type_model_path, map_location=device))
# type_model.to(device)
# type_model.eval()

# # transforms (use same norm for both classifiers)
# tfm = T.Compose([
#     T.Resize((224,224)),
#     T.ToTensor(),
#     T.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
# ])


# @app.post("/predict")
# async def predict(file: UploadFile = File(...)):
#     raw = await file.read()
#     img = Image.open(io.BytesIO(raw)).convert("RGB")

#     # YOLO inference
#     results = yolo_model(img, verbose=False)[0]

#     output = []
#     for box in results.boxes:
#         x1,y1,x2,y2 = map(int, box.xyxy[0])
#         cls_name = yolo_model.names[int(box.cls)]

#         crop = img.crop((x1,y1,x2,y2))
#         crop_t = tfm(crop).unsqueeze(0).to(device)

#         # severity prediction
#         with torch.no_grad():
#             sev_pred = severity_model(crop_t).argmax(dim=1).item()
#             severity_label = severity_classes[sev_pred]

#         # type prediction
#         with torch.no_grad():
#             type_pred = type_model(crop_t).argmax(dim=1).item()
#             type_label = type_classes[type_pred]

#         output.append({
#             "part": cls_name,
#             "severity": severity_label,
#             "damage_type": type_label,
#             "x1": x1, "y1": y1, "x2": x2, "y2": y2
#         })

#     return {"predictions": output}


# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=5000)


import io
import torch
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import timm
import torchvision.transforms as T
import requests
from math import radians, sin, cos, asin, sqrt
import time
from functools import lru_cache


service_cache = {}  # key -> {"timestamp": ..., "data": ...}
CACHE_TTL = 300      # 5 minutes (change if needed)

# ---------------------------------------
# CONFIG
device = "cuda" if torch.cuda.is_available() else "cpu"

severity_model_path = "convnextb_finetuned.pth"
type_model_path     = "mobilenetv3_large_100_type_best.pth"
yolo_model_path     = "runs/detect/train/weights/best.pt"


severity_classes = ["mild", "moderate", "severe"]
type_classes     = ["Dent","Scratch","Crack","glass shatter","lamp broken","tire flat"]
# ---------------------------------------

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------
# LOAD MODELS
# ---------------------------------------
from ultralytics import YOLO
yolo_model = YOLO(yolo_model_path).to(device)
yolo_model.eval()

severity_model = timm.create_model("convnext_base", pretrained=False, num_classes=len(severity_classes))
severity_model.load_state_dict(torch.load(severity_model_path, map_location=device))
severity_model.to(device)
severity_model.eval()

type_model = timm.create_model("mobilenetv3_large_100", pretrained=False, num_classes=len(type_classes))
type_model.load_state_dict(torch.load(type_model_path, map_location=device))
type_model.to(device)
type_model.eval()

tfm = T.Compose([
    T.Resize((224,224)),
    T.ToTensor(),
    T.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
])

# ---------------------------------------
# HELPER: haversine distance
# ---------------------------------------
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

# ---------------------------------------
# 1️⃣ DAMAGE PREDICTION ENDPOINT (unchanged)
# ---------------------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    raw = await file.read()
    img = Image.open(io.BytesIO(raw)).convert("RGB")

    results = yolo_model(img, verbose=False)[0]

    output = []
    for box in results.boxes:
        x1,y1,x2,y2 = map(int, box.xyxy[0])
        cls_name = yolo_model.names[int(box.cls)]

        crop = img.crop((x1,y1,x2,y2))
        crop_t = tfm(crop).unsqueeze(0).to(device)

        # severity prediction
        with torch.no_grad():
            sev_pred = severity_model(crop_t).argmax(dim=1).item()
            severity_label = severity_classes[sev_pred]

        # type prediction
        with torch.no_grad():
            type_pred = type_model(crop_t).argmax(dim=1).item()
            type_label = type_classes[type_pred]

        output.append({
            "part": cls_name,
            "severity": severity_label,
            "damage_type": type_label,
            "x1": x1, "y1": y1, "x2": x2, "y2": y2
        })

    return {"predictions": output}

# ---------------------------------------
# 2️⃣ NEW: NEAREST SERVICE CENTRES ENDPOINT
# ---------------------------------------
# @app.get("/nearest-centres")
# def nearest_centres(lat: float, lon: float, radius: int = 5000):
#     """
#     Find nearest service centres (not brand-specific).
#     """

#     overpass_url = "https://overpass-api.de/api/interpreter"

#     query = f"""
#     [out:json];
#     node(around:{radius},{lat},{lon})["shop"="car_repair"];
#     out;
#     """

#     try:
#         res = requests.post(overpass_url, data=query, timeout=25)
#         data = res.json()
#     except:
#         return {"error": "Overpass API error"}

#     centres = []

#     for e in data.get("elements", []):
#         c_lat = e["lat"]
#         c_lon = e["lon"]
#         tags = e.get("tags", {})

#         name = tags.get("name", "Service Centre")
#         phone = tags.get("phone", "N/A")

#         dist = haversine(lat, lon, c_lat, c_lon)

#         centres.append({
#             "name": name,
#             "lat": c_lat,
#             "lon": c_lon,
#             "phone": phone,
#             "distance_km": round(dist, 2)
#         })

#     centres.sort(key=lambda x: x["distance_km"])

#     return {"centres": centres[:5]}   # return TOP 5

@app.get("/nearest-centres")
def nearest_centres(lat: float, lon: float, radius: int = 5000):
    """
    Find nearest service centres with caching.
    """

    # -------------------------------------------------------
    # 1️⃣ CACHE CHECK
    # -------------------------------------------------------
    key = f"{lat}:{lon}:{radius}"

    if key in service_cache:
        entry = service_cache[key]
        if time.time() - entry["timestamp"] < CACHE_TTL:
            return entry["data"]    # return cached response

    # -------------------------------------------------------
    # 2️⃣ PERFORM OVERPASS QUERY
    # -------------------------------------------------------
    overpass_url = "https://overpass-api.de/api/interpreter"

    query = f"""
    [out:json];
    node(around:{radius},{lat},{lon})["shop"="car_repair"];
    out;
    """

    try:
        res = requests.post(overpass_url, data=query, timeout=25)
        data = res.json()
    except:
        return {"error": "Overpass API error"}

    centres = []

    for e in data.get("elements", []):
        c_lat = e["lat"]
        c_lon = e["lon"]
        tags = e.get("tags", {})

        name = tags.get("name", "Service Centre")
        phone = tags.get("phone", "N/A")

        dist = haversine(lat, lon, c_lat, c_lon)

        centres.append({
            "name": name,
            "lat": c_lat,
            "lon": c_lon,
            "phone": phone,
            "distance_km": round(dist, 2)
        })

    centres.sort(key=lambda x: x["distance_km"])

    result = {"centres": centres[:5]}

    # -------------------------------------------------------
    # 3️⃣ SAVE TO CACHE
    # -------------------------------------------------------
    service_cache[key] = {
        "timestamp": time.time(),
        "data": result
    }

    return result


#added method
# polyline decoder for OSRM geometry
def decode_polyline(encoded):
    coordinates = []
    index = lat = lon = 0

    while index < len(encoded):
        for coord in (lat, lon):
            result = shift = 0
            while True:
                b = ord(encoded[index]) - 63
                index += 1
                result |= (b & 0x1F) << shift
                shift += 5
                if b < 0x20:
                    break
            dcoord = ~(result >> 1) if (result & 1) else (result >> 1)
            if coord is lat:
                lat += dcoord
            else:
                lon += dcoord
        coordinates.append((lat / 1e5, lon / 1e5))
    return coordinates
 
 #added method
@app.get("/route")
def get_route(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    """
    Uses OSRM to compute a route and return polyline coordinates.
    """
    url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}?overview=full&geometries=polyline"

    res = requests.get(url).json()
    if "routes" not in res or len(res["routes"]) == 0:
        return {"error": "No route found"}

    encoded = res["routes"][0]["geometry"]
    coords = decode_polyline(encoded)

    return {"polyline": coords}

#added method
@app.get("/centre-details")
def centre_details(lat: float, lon: float):
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&addressdetails=1&extratags=1"

    headers = {"User-Agent": "CarDamageAssessmentApp"}
    data = requests.get(url, headers=headers).json()

    address = data.get("display_name", "Unknown address")
    tags = data.get("extratags", {})

    return {
        "address": address,
        "phone": tags.get("phone", "N/A"),
        "opening_hours": tags.get("opening_hours", "N/A"),
        "website": tags.get("website", "N/A"),
        "rating": tags.get("rating", "N/A")
    }


# ---------------------------------------
# MAIN
# ---------------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
