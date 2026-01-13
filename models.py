from sqlalchemy import Column, String, Float, Boolean
from database import Base

class AED(Base):
    __tablename__ = "aeds"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    building_name = Column(String)
    location_description = Column(String)

    is_outdoor = Column(Boolean, default=True)
