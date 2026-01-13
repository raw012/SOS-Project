from fastapi import FastAPI
from database import SessionLocal
from models import AED
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 展示阶段先全放开，之后可收紧
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Emergency SOS backend is running"}

@app.get("/api/aeds")
def get_all_aeds():
    db = SessionLocal()
    aeds = db.query(AED).all()
    db.close()
    return aeds

import math

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two points on Earth (meters)
    """
    R = 6371000  # Earth radius in meters

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = math.sin(d_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(d_lambda / 2) ** 2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

from fastapi import Query

@app.get("/api/aeds/nearby")
def get_nearby_aeds(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    limit: int = 5
):
    db = SessionLocal()
    aeds = db.query(AED).all()
    db.close()

    results = []

    for aed in aeds:
        distance = haversine(lat, lng, aed.latitude, aed.longitude)
        results.append({
            "id": aed.id,
            "name": aed.name,
            "latitude": aed.latitude,
            "longitude": aed.longitude,
            "building_name": aed.building_name,
            "location_description": aed.location_description,
            "distance_meters": round(distance)
        })

    results.sort(key=lambda x: x["distance_meters"])
    return results[:limit]
