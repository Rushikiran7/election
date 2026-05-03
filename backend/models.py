from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    pincode = Column(String(6), index=True, nullable=False)
    language_preference = Column(String(2), default="en") # en, ta, te, hi
    
    # Relationship to Complaints (optional, if tracking user complaints)
    # complaints = relationship("Complaint", back_populates="user")

class Constituency(Base):
    __tablename__ = "constituencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    pincode_start = Column(String(6), index=True) # Simplified logic for range or prefix
    pincode_end = Column(String(6), index=True)
    
    candidates = relationship("Candidate", back_populates="constituency")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    party = Column(String, nullable=False)
    party_symbol_url = Column(String)
    manifesto_summary = Column(String)
    
    constituency_id = Column(Integer, ForeignKey("constituencies.id"))
    constituency = relationship("Constituency", back_populates="candidates")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    location_pincode = Column(String(6), nullable=False)
    is_resolved = Column(Boolean, default=False)
    # user_id = Column(Integer, ForeignKey("users.id"))
    # user = relationship("User", back_populates="complaints")
