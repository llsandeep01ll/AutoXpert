# AUTOXPERT

AUTOXPERT is a smart web application that helps users analyze vehicle damage using Artificial Intelligence.

You can:
- Upload a photo of your damaged vehicle
- Get an instant damage report
- Find nearby vehicle service centers

Everything is designed to be simple and easy to use.


## Application Workflow (With Screenshots)

###  Landing Page

<img width="1856" height="871" alt="Screenshot 2026-02-20 214822" src="https://github.com/user-attachments/assets/c98921a7-fe27-4c0f-92dc-2def4091725b" />

---

###  Service Center Finder

<img width="1858" height="850" alt="Screenshot 2026-02-20 215006" src="https://github.com/user-attachments/assets/2d0e969a-de43-4d6e-9f1d-f585e321d5bf" />

---

###  Nearby Store Details 

<img width="1849" height="866" alt="Screenshot 2026-02-20 215028" src="https://github.com/user-attachments/assets/394ed3f3-d26e-47a3-984b-5bac60c88b69" />

---

###  Interactive Map View

<img width="1856" height="857" alt="Screenshot 2026-02-20 215110" src="https://github.com/user-attachments/assets/994e8db8-1ac3-44e4-99db-6cc7d528c321" />

---

###  Upload Vehicle Image

<img width="1853" height="866" alt="Screenshot 2026-02-20 215144" src="https://github.com/user-attachments/assets/9cb597e0-7e71-48d7-b598-af27d9a77ec2" />

---

###  Image Selected and AI Processing

<img width="1860" height="1013" alt="Screenshot 2026-02-20 215738" src="https://github.com/user-attachments/assets/6bf0e087-f4e8-422e-abea-e9aebe4fdee5" />

---

###  Damage Detection Results

<img width="1854" height="868" alt="Screenshot 2026-02-20 215902" src="https://github.com/user-attachments/assets/d2c2d962-c569-4244-b9f7-27b2124dfdef" />

---

###   Detailed Damage Cards

<img width="1854" height="866" alt="Screenshot 2026-02-20 220003" src="https://github.com/user-attachments/assets/3d2e2fdb-6df1-432b-9e6a-3d42440ca56e" />

---

###  Chatbot Assisstant with Damage Description 

<img width="1861" height="869" alt="Screenshot 2026-02-20 220320" src="https://github.com/user-attachments/assets/71ede2d5-1aa1-4074-afef-faeacddcc43c" />

---

###  Chatbot Assisstant Report

<img width="1854" height="876" alt="Screenshot 2026-02-20 220347" src="https://github.com/user-attachments/assets/e45e3ab8-cbc8-43c9-ad7f-3c4921b79026" />

---



## What This Project Does

AUTOXPERT combines two main features:

### 1. Vehicle Damage Detection

- You upload a photo of your car.
- The system analyzes the image using AI.
- It highlights damaged areas.
- It tells you:
  - Which part is damaged
  - What type of damage it is (dent, scratch, crack, etc.)
  - How serious the damage is (Minor, Moderate, Severe)

---

### 2. Nearby Service Center Finder

- The system detects your location (with permission).
- It finds service centers within 10 km.
- It shows them on a map.
- You can open directions in Google Maps.

---

## Technologies Used (Simple Explanation)

### Frontend (What users see)

- React – Used to build the user interface
- Vite – Helps run the project faster during development
- Material UI – Pre-built design components
- Leaflet – Used to show maps

### Backend (Server Side)

- Python – Main programming language
- FastAPI – Framework to handle requests
- PyTorch – Used for AI models
- YOLOv8 – Detects damaged parts in the image
- MobileNetV3 – Identifies type of damage
- ConvNeXt – Checks how serious the damage is

---

## How the System Works (Step-by-Step)

1. User opens the website.
2. User uploads a vehicle image.
3. The image is sent to the backend server.
4. AI models analyze the image.
5. The system returns:
   - Highlighted damaged areas
   - Damage type
   - Severity level
6. User can optionally find nearby service centers.

---

## How to Run This Project on Your Computer

### Requirements

- Python 3.8 or higher
- Node.js 16 or higher
- Internet connection

---

### Step 1: Download the Project

```bash
git clone https://github.com/llsandeep01ll/AutoXpert.git
cd autoxpert
```

---

### Step 2: Setup Backend

```bash
python -m venv myenv
myenv\Scripts\activate   # Windows
# source myenv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Run backend:

```bash
python app.py
```

Backend runs at:
http://localhost:5000

---

### Step 3: Setup Frontend

```bash
cd car_damage_frontend
npm install
npm run dev
```

Frontend runs at:
http://localhost:5173

Open that link in your browser.



## Future Improvements

- Repair cost estimation
- Mobile app version
- Insurance claim integration
- User account system
- Appointment booking feature

---

## Who Is This Project For?

- Students learning AI
- Developers exploring image detection
- Anyone interested in vehicle automation
- Beginners wanting to understand AI applications

---

## Author

Sandeep N V

