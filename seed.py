from database import SessionLocal
from models import AED

AED_SEED = [
    # Central Campus
    {
        "id": "ucsd-geisel-1",
        "name": "Geisel Library AED",
        "latitude": 32.8810,
        "longitude": -117.2376,
        "building_name": "Geisel Library",
        "location_description": "Near main entrance",
        "is_outdoor": False,
    },
    {
        "id": "ucsd-price-center-1",
        "name": "Price Center AED",
        "latitude": 32.8796,
        "longitude": -117.2357,
        "building_name": "Price Center",
        "location_description": "Food court level, near central corridor",
        "is_outdoor": False,
    },
    {
        "id": "ucsd-warren-lecture-1",
        "name": "Warren Lecture Hall AED",
        "latitude": 32.8834,
        "longitude": -117.2401,
        "building_name": "Warren Lecture Hall",
        "location_description": "Ground floor near main entrance",
        "is_outdoor": False,
    },
    {
        "id": "ucsd-peterson-hall-1",
        "name": "Peterson Hall AED",
        "latitude": 32.8807,
        "longitude": -117.2349,
        "building_name": "Peterson Hall",
        "location_description": "Lobby area",
        "is_outdoor": False,
    },
    {
        "id": "ucsd-center-hall-1",
        "name": "Center Hall AED",
        "latitude": 32.8818,
        "longitude": -117.2336,
        "building_name": "Center Hall",
        "location_description": "First floor near elevator lobby",
        "is_outdoor": False,
    },

    # Engineering / Science
    {
        "id": "ucsd-cse-1",
        "name": "Computer Science & Engineering AED",
        "latitude": 32.8816,
        "longitude": -117.2331,
        "building_name": "CSE Building",
        "location_description": "Near main entrance",
        "is_outdoor": False,
    },
    {
        "id": "ucsd-atkinson-1",
        "name": "Atkinson Hall AED",
        "latitude": 32.8839,
        "longitude": -117.2430,
        "building_name": "Atkinson Hall",
        "location_description": "Lobby near elevators",
        "is_outdoor": False,
    },
    {
        "id": "ucsd-apm-1",
        "name": "Applied Physics & Mathematics AED",
        "latitude": 32.8826,
        "longitude": -117.2344,
        "building_name": "APM Building",
        "location_description": "First floor hallway",
        "is_outdoor": False,
    },

    # Recreation
    {
        "id": "ucsd-canyonview-1",
        "name": "Canyonview Sports Facility AED",
        "latitude": 32.8864,
        "longitude": -117.2425,
        "building_name": "Canyonview Sports Facility",
        "location_description": "Near entrance desk",
        "is_outdoor": False,
    },
    {
        "id": "ucsd-rimac-1",
        "name": "RIMAC Arena AED",
        "latitude": 32.8849,
        "longitude": -117.2406,
        "building_name": "RIMAC Arena",
        "location_description": "Main lobby",
        "is_outdoor": False,
    },

    # Pepper Canyon / East Campus (approximate)
    {
        "id": "ucsd-pepper-canyon-1",
        "name": "Pepper Canyon AED",
        "latitude": 32.8775,
        "longitude": -117.2389,
        "building_name": "Pepper Canyon Apartments",
        "location_description": "Exterior wall near main walkway",
        "is_outdoor": True,
    },
    {
        "id": "ucsd-mesa-nueva-1",
        "name": "Mesa Nueva AED",
        "latitude": 32.8761,
        "longitude": -117.2414,
        "building_name": "Mesa Nueva",
        "location_description": "Near outdoor common area",
        "is_outdoor": True,
    },
]


def seed_data():
    db = SessionLocal()

    inserted = 0
    skipped = 0

    for item in AED_SEED:
        exists = db.query(AED).filter(AED.id == item["id"]).first()
        if exists:
            skipped += 1
            continue

        aed = AED(**item)
        db.add(aed)
        inserted += 1

    db.commit()
    db.close()

    print(f"Seeding finished. Inserted: {inserted}, Skipped(existing): {skipped}")


if __name__ == "__main__":
    seed_data()
