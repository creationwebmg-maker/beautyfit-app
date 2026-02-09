from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import shutil
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import base64
import json
import re
import resend
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'amel-fit-coach-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

# Admin password (simple auth for admin)
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'amel2024admin')

# Emergent LLM Key for GPT-4o
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Resend Email Config
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'contact@beautyfitbyamel.fr')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Upload directories
UPLOAD_DIR = ROOT_DIR / "uploads"
VIDEOS_DIR = UPLOAD_DIR / "videos"
THUMBNAILS_DIR = UPLOAD_DIR / "thumbnails"

# Ensure directories exist
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)

# Create the main app
app = FastAPI(title="Amel Fit Coach API")

# Health check endpoint for Kubernetes (must be at root level, not under /api)
@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes"""
    return {"status": "healthy", "service": "beautyfit-api"}

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    fitness_goal: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    first_name: str
    fitness_goal: Optional[str] = None
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    duration_minutes: int
    level: str
    price: float
    video_url: Optional[str] = None
    teaser_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

class CourseResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    category: str
    duration_minutes: int
    level: str
    price: float
    video_url: Optional[str] = None
    teaser_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: str

class PurchaseResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    course_id: str
    course_title: str
    amount: float
    payment_method: str
    status: str
    created_at: str

class NotificationSettings(BaseModel):
    enabled: bool = True
    training_days: List[str] = []
    training_time: Optional[str] = None

class NotificationSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    training_days: Optional[List[str]] = None
    training_time: Optional[str] = None

class CheckoutRequest(BaseModel):
    course_id: str
    payment_method: str = "stripe"
    origin_url: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    phone: Optional[str] = None
    height: Optional[str] = None
    current_weight: Optional[str] = None
    target_weight: Optional[str] = None
    fitness_goal: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class AppleAuthRequest(BaseModel):
    identity_token: str
    authorization_code: Optional[str] = None
    email: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None

# ==================== CALORIE TRACKER MODELS ====================

class CalorieAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    meal_description: Optional[str] = None  # Pour l'analyse par texte
    meal_type: Optional[str] = "repas"  # petit-dejeuner, dejeuner, diner, collation

class FoodItem(BaseModel):
    name: str
    quantity: str
    calories: int
    proteins: float
    carbs: float
    fats: float

class CalorieAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    foods: List[FoodItem]
    total_calories: int
    total_proteins: float
    total_carbs: float
    total_fats: float
    meal_type: str
    analysis_text: str
    created_at: str

class MealHistoryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    foods: List[dict]
    total_calories: int
    total_proteins: float
    total_carbs: float
    total_fats: float
    meal_type: str
    analysis_text: str
    created_at: str

class DailyGoal(BaseModel):
    calories: int = 2000
    proteins: float = 50.0
    carbs: float = 250.0
    fats: float = 65.0

class DailyGoalUpdate(BaseModel):
    calories: Optional[int] = None
    proteins: Optional[float] = None
    carbs: Optional[float] = None
    fats: Optional[float] = None

# ==================== PROGRESS/STATS MODELS ====================

class SessionCompleteRequest(BaseModel):
    week_id: int
    seance_id: int
    steps: int
    duration_minutes: int
    phases_completed: int

class SessionRecord(BaseModel):
    id: str
    user_id: str
    week_id: int
    seance_id: int
    steps: int
    duration_minutes: int
    phases_completed: int
    completed_at: str

class UserStatsResponse(BaseModel):
    total_steps: int
    weekly_steps: int
    weekly_goal: int
    sessions_completed: int
    total_minutes: int
    current_streak: int
    best_streak: int
    last_session_date: Optional[str]

# ==================== CALORIE PROFILE MODELS ====================

class CalorieProfileRequest(BaseModel):
    age: str
    height: str
    current_weight: str
    target_weight: str
    gender: Optional[str] = "femme"
    activity_level: str
    goal: str
    does_suhoor: str
    meals_count: str
    eating_habits: List[str] = []
    hydration: str
    sleep_hours: str
    ramadan_feelings: List[str] = []

class CalorieNeedsResponse(BaseModel):
    daily_calories: int
    proteins: int
    carbs: int
    fats: int
    bmr: int
    tdee: int
    recommendations: List[str]
    meal_distribution: Dict[str, int]

# ==================== SITE CONTENT MODELS ====================

class ProgramContent(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    price: float
    image_url: str
    badge: Optional[str] = None
    badge_icon: Optional[str] = None
    order: int = 0

class HeroContent(BaseModel):
    title: str
    subtitle: Optional[str] = None
    button_text: str
    image_url: str

class MarqueeContent(BaseModel):
    texts: List[str]
    separator: str = "✦"

class ColorTheme(BaseModel):
    linen: str = "#F7F5F2"
    sky: str = "#D2DDE7"
    berry: str = "#D5A0A8"
    sunrise: str = "#EE9F80"
    watermelon: str = "#E37E7F"

class SiteContent(BaseModel):
    hero: HeroContent
    programs: List[ProgramContent]
    marquee: MarqueeContent
    colors: ColorTheme
    logo_url: str
    updated_at: Optional[str] = None

class SiteContentUpdate(BaseModel):
    hero: Optional[HeroContent] = None
    programs: Optional[List[ProgramContent]] = None
    marquee: Optional[MarqueeContent] = None
    colors: Optional[ColorTheme] = None
    logo_url: Optional[str] = None

# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "fitness_goal": user_data.fitness_goal,
        "created_at": now,
        "notification_settings": {
            "enabled": True,
            "training_days": [],
            "training_time": None
        }
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email)
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        first_name=user_data.first_name,
        fitness_goal=user_data.fitness_goal,
        created_at=now
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"])
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        first_name=user["first_name"],
        fitness_goal=user.get("fitness_goal"),
        created_at=user["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest):
    # Check if user exists
    existing_user = await db.users.find_one({"email": request.email}, {"_id": 0})
    
    if existing_user:
        # Update existing user with Google info
        await db.users.update_one(
            {"email": request.email},
            {"$set": {
                "google_picture": request.picture,
                "last_login": datetime.now(timezone.utc).isoformat()
            }}
        )
        user = existing_user
    else:
        # Create new user from Google auth
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        first_name = request.name.split()[0] if request.name else "Utilisateur"
        
        user = {
            "id": user_id,
            "email": request.email,
            "first_name": first_name,
            "google_picture": request.picture,
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
        if "_id" in user:
            del user["_id"]
    
    # Create token
    token = create_token(user["id"], user["email"])
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        first_name=user["first_name"],
        fitness_goal=user.get("fitness_goal"),
        created_at=user["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/apple", response_model=TokenResponse)
async def apple_auth(request: AppleAuthRequest):
    """Handle Sign in with Apple authentication"""
    import requests
    from jwt.algorithms import RSAAlgorithm
    from cryptography.hazmat.primitives import serialization
    
    try:
        # Decode the identity token header to get the key ID
        unverified_header = jwt.get_unverified_header(request.identity_token)
        kid = unverified_header.get("kid")
        
        if not kid:
            raise HTTPException(status_code=401, detail="Invalid token: missing key ID")
        
        # Fetch Apple's public keys
        apple_keys_response = requests.get("https://appleid.apple.com/auth/keys")
        apple_keys = apple_keys_response.json()
        
        # Find the correct public key
        public_key_info = None
        for key in apple_keys.get("keys", []):
            if key.get("kid") == kid:
                public_key_info = key
                break
        
        if not public_key_info:
            raise HTTPException(status_code=401, detail="Unable to find matching public key")
        
        # Convert JWK to PEM format
        public_key = RSAAlgorithm.from_jwk(json.dumps(public_key_info))
        public_key_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        # Decode and verify the token
        decoded_token = jwt.decode(
            request.identity_token,
            public_key_pem,
            algorithms=["RS256"],
            audience="com.beautyfit.amel"
        )
        
        # Extract user info from token
        apple_user_id = decoded_token.get("sub")
        user_email = request.email or decoded_token.get("email")
        
        if not apple_user_id:
            raise HTTPException(status_code=400, detail="Invalid token: missing user identifier")
        
        # Check if user exists by Apple ID or email
        existing_user = await db.users.find_one(
            {"$or": [{"apple_user_id": apple_user_id}, {"email": user_email}]},
            {"_id": 0}
        )
        
        if existing_user:
            # Update existing user with Apple info
            await db.users.update_one(
                {"id": existing_user["id"]},
                {"$set": {
                    "apple_user_id": apple_user_id,
                    "last_login": datetime.now(timezone.utc).isoformat()
                }}
            )
            user = existing_user
        else:
            # Create new user from Apple auth
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            first_name = request.given_name or "Utilisateur"
            
            user = {
                "id": user_id,
                "email": user_email,
                "first_name": first_name,
                "apple_user_id": apple_user_id,
                "auth_provider": "apple",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user)
            if "_id" in user:
                del user["_id"]
        
        # Create token
        token = create_token(user["id"], user["email"])
        
        user_response = UserResponse(
            id=user["id"],
            email=user["email"],
            first_name=user["first_name"],
            fitness_goal=user.get("fitness_goal"),
            created_at=user["created_at"]
        )
        
        return TokenResponse(access_token=token, user=user_response)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        logger.error(f"Apple auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Return same message to prevent email enumeration
        return {"message": "Si l'email existe, un lien de réinitialisation sera envoyé"}
    
    # Generate a secure reset code (6 digits)
    reset_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.delete_many({"email": request.email})
    await db.password_resets.insert_one({
        "email": request.email,
        "token": reset_code,
        "expires": expires.isoformat(),
        "used": False
    })
    
    # Send email via Resend
    if RESEND_API_KEY:
        try:
            resend.Emails.send({
                "from": f"Beautyfit By Amel <{FROM_EMAIL}>",
                "to": [request.email],
                "subject": "Réinitialisation de ton mot de passe - Beautyfit",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #E37E7F; font-family: 'Playfair Display', serif;">Beautyfit By Amel</h1>
                    </div>
                    
                    <p style="color: #333;">Bonjour {user.get('first_name', 'toi')} 👋</p>
                    
                    <p style="color: #666;">Tu as demandé à réinitialiser ton mot de passe. Voici ton code de vérification :</p>
                    
                    <div style="background: linear-gradient(135deg, #E37E7F, #EE9F80); padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 8px;">{reset_code}</span>
                    </div>
                    
                    <p style="color: #666;">Ce code expire dans <strong>1 heure</strong>.</p>
                    
                    <p style="color: #999; font-size: 14px;">Si tu n'as pas demandé cette réinitialisation, ignore simplement cet email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        © 2025 Beautyfit By Amel - Ton coach fitness personnel
                    </p>
                </div>
                """
            })
            logger.info(f"Password reset email sent to {request.email}")
        except Exception as e:
            logger.error(f"Failed to send reset email: {e}")
    
    return {"message": "Si l'email existe, un code de réinitialisation sera envoyé"}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    reset = await db.password_resets.find_one({
        "token": request.token,
        "used": False
    })
    
    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    expires = datetime.fromisoformat(reset["expires"])
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token expired")
    
    await db.users.update_one(
        {"email": reset["email"]},
        {"$set": {"password_hash": hash_password(request.new_password)}}
    )
    
    await db.password_resets.update_one(
        {"token": request.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password updated successfully"}

# ==================== USER ROUTES ====================

@api_router.get("/user/profile", response_model=UserResponse)
async def get_profile(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        first_name=user["first_name"],
        fitness_goal=user.get("fitness_goal"),
        created_at=user["created_at"]
    )

@api_router.put("/user/profile", response_model=UserResponse)
async def update_profile(update: ProfileUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return UserResponse(
        id=updated_user["id"],
        email=updated_user["email"],
        first_name=updated_user["first_name"],
        fitness_goal=updated_user.get("fitness_goal"),
        created_at=updated_user["created_at"]
    )

@api_router.get("/user/purchases", response_model=List[PurchaseResponse])
async def get_purchases(user: dict = Depends(get_current_user)):
    purchases = await db.purchases.find(
        {"user_id": user["id"], "status": "completed"},
        {"_id": 0}
    ).to_list(100)
    return purchases

@api_router.get("/user/notifications", response_model=NotificationSettings)
async def get_notification_settings(user: dict = Depends(get_current_user)):
    settings = user.get("notification_settings", {
        "enabled": True,
        "training_days": [],
        "training_time": None
    })
    return NotificationSettings(**settings)

@api_router.put("/user/notifications", response_model=NotificationSettings)
async def update_notification_settings(
    settings: NotificationSettingsUpdate,
    user: dict = Depends(get_current_user)
):
    current = user.get("notification_settings", {
        "enabled": True,
        "training_days": [],
        "training_time": None
    })
    
    update_data = {k: v for k, v in settings.model_dump().items() if v is not None}
    current.update(update_data)
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"notification_settings": current}}
    )
    
    return NotificationSettings(**current)

@api_router.delete("/user/account")
async def delete_account(user: dict = Depends(get_current_user)):
    await db.users.delete_one({"id": user["id"]})
    await db.purchases.delete_many({"user_id": user["id"]})
    return {"message": "Account deleted successfully"}

# ==================== COURSES ROUTES ====================

@api_router.get("/courses", response_model=List[CourseResponse])
async def get_courses(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    
    courses = await db.courses.find(query, {"_id": 0}).to_list(100)
    return courses

@api_router.get("/courses/categories")
async def get_categories():
    categories = await db.courses.distinct("category")
    return {"categories": categories}

@api_router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@api_router.post("/courses", response_model=CourseResponse)
async def create_course(course: CourseCreate):
    course_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    course_doc = {
        "id": course_id,
        **course.model_dump(),
        "created_at": now
    }
    
    await db.courses.insert_one(course_doc)
    return CourseResponse(**course_doc)

@api_router.get("/user/courses", response_model=List[CourseResponse])
async def get_user_courses(user: dict = Depends(get_current_user)):
    purchases = await db.purchases.find(
        {"user_id": user["id"], "status": "completed"},
        {"_id": 0}
    ).to_list(100)
    
    course_ids = [p["course_id"] for p in purchases]
    if not course_ids:
        return []
    
    courses = await db.courses.find(
        {"id": {"$in": course_ids}},
        {"_id": 0}
    ).to_list(100)
    return courses

@api_router.get("/courses/{course_id}/access")
async def check_course_access(course_id: str, user: dict = Depends(get_current_user)):
    purchase = await db.purchases.find_one({
        "user_id": user["id"],
        "course_id": course_id,
        "status": "completed"
    })
    return {"has_access": purchase is not None}

# ==================== PAYMENT ROUTES ====================

COURSE_PRICES = {}

async def get_course_price(course_id: str) -> float:
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return float(course["price"])

@api_router.post("/payments/stripe/checkout")
async def create_stripe_checkout(
    request: Request,
    checkout_data: CheckoutRequest,
    user: dict = Depends(get_current_user)
):
    course = await db.courses.find_one({"id": checkout_data.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    existing_purchase = await db.purchases.find_one({
        "user_id": user["id"],
        "course_id": checkout_data.course_id,
        "status": "completed"
    })
    if existing_purchase:
        raise HTTPException(status_code=400, detail="Course already purchased")
    
    amount = float(course["price"])
    host_url = checkout_data.origin_url
    
    success_url = f"{host_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/courses/{checkout_data.course_id}"
    
    webhook_url = f"{str(request.base_url)}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    metadata = {
        "user_id": user["id"],
        "course_id": checkout_data.course_id,
        "course_title": course["title"]
    }
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
        payment_methods=["card", "link"]
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    transaction_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    await db.payment_transactions.insert_one({
        "id": transaction_id,
        "session_id": session.session_id,
        "user_id": user["id"],
        "course_id": checkout_data.course_id,
        "course_title": course["title"],
        "amount": amount,
        "currency": "eur",
        "payment_method": "stripe",
        "status": "pending",
        "payment_status": "initiated",
        "metadata": metadata,
        "created_at": now
    })
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/payments/stripe/status/{session_id}")
async def get_stripe_status(
    request: Request,
    session_id: str,
    user: dict = Depends(get_current_user)
):
    transaction = await db.payment_transactions.find_one(
        {"session_id": session_id, "user_id": user["id"]},
        {"_id": 0}
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.get("payment_status") == "paid":
        return {
            "status": "complete",
            "payment_status": "paid",
            "course_id": transaction["course_id"]
        }
    
    webhook_url = f"{str(request.base_url)}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": status.status,
                "payment_status": status.payment_status
            }}
        )
        
        if status.payment_status == "paid":
            existing = await db.purchases.find_one({
                "session_id": session_id,
                "status": "completed"
            })
            
            if not existing:
                purchase_id = str(uuid.uuid4())
                now = datetime.now(timezone.utc).isoformat()
                
                await db.purchases.insert_one({
                    "id": purchase_id,
                    "user_id": transaction["user_id"],
                    "course_id": transaction["course_id"],
                    "course_title": transaction["course_title"],
                    "amount": transaction["amount"],
                    "payment_method": "stripe",
                    "session_id": session_id,
                    "status": "completed",
                    "created_at": now
                })
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "course_id": transaction["course_id"]
        }
    except Exception as e:
        logger.error(f"Error checking Stripe status: {e}")
        return {
            "status": transaction.get("status", "unknown"),
            "payment_status": transaction.get("payment_status", "unknown"),
            "course_id": transaction["course_id"]
        }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    webhook_url = f"{str(request.base_url)}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.event_type == "checkout.session.completed":
            session_id = webhook_response.session_id
            metadata = webhook_response.metadata
            
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": "complete",
                    "payment_status": "paid"
                }}
            )
            
            transaction = await db.payment_transactions.find_one(
                {"session_id": session_id},
                {"_id": 0}
            )
            
            if transaction:
                existing = await db.purchases.find_one({
                    "session_id": session_id,
                    "status": "completed"
                })
                
                if not existing:
                    purchase_id = str(uuid.uuid4())
                    now = datetime.now(timezone.utc).isoformat()
                    
                    await db.purchases.insert_one({
                        "id": purchase_id,
                        "user_id": transaction["user_id"],
                        "course_id": transaction["course_id"],
                        "course_title": transaction["course_title"],
                        "amount": transaction["amount"],
                        "payment_method": "stripe",
                        "session_id": session_id,
                        "status": "completed",
                        "created_at": now
                    })
        
        return {"status": "processed"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# PayPal placeholder (basic implementation)
@api_router.post("/payments/paypal/create")
async def create_paypal_order(
    checkout_data: CheckoutRequest,
    user: dict = Depends(get_current_user)
):
    course = await db.courses.find_one({"id": checkout_data.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {
        "message": "PayPal integration - redirect to PayPal",
        "amount": course["price"],
        "currency": "EUR",
        "course_id": checkout_data.course_id
    }

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data():
    existing = await db.courses.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded"}
    
    courses = [
        {
            "id": "prog_ramadan",
            "title": "Programme Ramadan Marche",
            "description": "Aller bien, même à jeun. Un programme de marche adapté au jeûne avec 4 semaines progressives.",
            "category": "Ramadan",
            "duration_minutes": 30,
            "level": "Tous niveaux",
            "price": 22.00,
            "thumbnail_url": "https://customer-assets.emergentagent.com/job_amelcoach/artifacts/300dg799_IMG_7778.jpeg",
            "teaser_url": None,
            "video_url": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Cardio Brûle-Graisses",
            "description": "Une séance intense pour brûler un maximum de calories et booster votre métabolisme.",
            "category": "Cardio",
            "duration_minutes": 30,
            "level": "Intermédiaire",
            "price": 9.99,
            "thumbnail_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600",
            "teaser_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Abdos Sculptés",
            "description": "Travaillez vos abdominaux en profondeur pour un ventre plat et tonique.",
            "category": "Abdos",
            "duration_minutes": 20,
            "level": "Débutant",
            "price": 7.99,
            "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
            "teaser_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Renforcement Full Body",
            "description": "Une séance complète pour tonifier l'ensemble de votre corps.",
            "category": "Full Body",
            "duration_minutes": 45,
            "level": "Intermédiaire",
            "price": 12.99,
            "thumbnail_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600",
            "teaser_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Yoga Détente",
            "description": "Relaxez-vous et améliorez votre souplesse avec cette séance de yoga.",
            "category": "Yoga",
            "duration_minutes": 40,
            "level": "Débutant",
            "price": 8.99,
            "thumbnail_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600",
            "teaser_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "HIIT Explosif",
            "description": "Entraînement par intervalles haute intensité pour des résultats rapides.",
            "category": "Cardio",
            "duration_minutes": 25,
            "level": "Avancé",
            "price": 11.99,
            "thumbnail_url": "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600",
            "teaser_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Fessiers en Béton",
            "description": "Sculptez vos fessiers avec ces exercices ciblés et efficaces.",
            "category": "Renforcement",
            "duration_minutes": 25,
            "level": "Intermédiaire",
            "price": 9.99,
            "thumbnail_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600",
            "teaser_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.courses.insert_many(courses)
    return {"message": "Data seeded successfully", "courses_created": len(courses)}

@api_router.post("/init-ramadan-course")
async def init_ramadan_course():
    """Ensure the Ramadan course exists in the database"""
    existing = await db.courses.find_one({"id": "prog_ramadan"}, {"_id": 0})
    if existing:
        return {"message": "Ramadan course already exists", "course_id": existing["id"]}
    
    ramadan_course = {
        "id": "prog_ramadan",
        "title": "Programme Ramadan Marche",
        "description": "Aller bien, même à jeun. Un programme de marche adapté au jeûne avec 4 semaines progressives.",
        "category": "Ramadan",
        "duration_minutes": 30,
        "level": "Tous niveaux",
        "price": 22.00,
        "thumbnail_url": "https://customer-assets.emergentagent.com/job_amelcoach/artifacts/300dg799_IMG_7778.jpeg",
        "teaser_url": None,
        "video_url": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.courses.insert_one(ramadan_course)
    return {"message": "Ramadan course created", "course_id": "prog_ramadan"}

# ==================== ADMIN ROUTES ====================

class AdminLogin(BaseModel):
    password: str

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    duration_minutes: Optional[int] = None
    level: Optional[str] = None
    price: Optional[float] = None
    video_url: Optional[str] = None
    teaser_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    if credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    
    # Create admin token
    payload = {
        "sub": "admin",
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/admin/upload/video")
async def upload_video(
    file: UploadFile = File(...),
    admin: dict = Depends(get_admin_user)
):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "mp4"
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = VIDEOS_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the URL
    return {"url": f"/uploads/videos/{filename}", "filename": filename}

@api_router.post("/admin/upload/thumbnail")
async def upload_thumbnail(
    file: UploadFile = File(...),
    admin: dict = Depends(get_admin_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = THUMBNAILS_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the URL
    return {"url": f"/uploads/thumbnails/{filename}", "filename": filename}

@api_router.post("/admin/courses", response_model=CourseResponse)
async def admin_create_course(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    duration_minutes: int = Form(...),
    level: str = Form(...),
    price: float = Form(...),
    video: Optional[UploadFile] = File(None),
    teaser: Optional[UploadFile] = File(None),
    thumbnail: Optional[UploadFile] = File(None),
    video_url: Optional[str] = Form(None),
    teaser_url: Optional[str] = Form(None),
    thumbnail_url: Optional[str] = Form(None),
    admin: dict = Depends(get_admin_user)
):
    course_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Handle video upload
    final_video_url = video_url
    if video and video.filename:
        file_ext = video.filename.split(".")[-1] if "." in video.filename else "mp4"
        filename = f"{course_id}_video.{file_ext}"
        file_path = VIDEOS_DIR / filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        final_video_url = f"/uploads/videos/{filename}"
    
    # Handle teaser upload
    final_teaser_url = teaser_url
    if teaser and teaser.filename:
        file_ext = teaser.filename.split(".")[-1] if "." in teaser.filename else "mp4"
        filename = f"{course_id}_teaser.{file_ext}"
        file_path = VIDEOS_DIR / filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(teaser.file, buffer)
        final_teaser_url = f"/uploads/videos/{filename}"
    
    # Handle thumbnail upload
    final_thumbnail_url = thumbnail_url
    if thumbnail and thumbnail.filename:
        file_ext = thumbnail.filename.split(".")[-1] if "." in thumbnail.filename else "jpg"
        filename = f"{course_id}_thumb.{file_ext}"
        file_path = THUMBNAILS_DIR / filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(thumbnail.file, buffer)
        final_thumbnail_url = f"/uploads/thumbnails/{filename}"
    
    course_doc = {
        "id": course_id,
        "title": title,
        "description": description,
        "category": category,
        "duration_minutes": duration_minutes,
        "level": level,
        "price": price,
        "video_url": final_video_url,
        "teaser_url": final_teaser_url,
        "thumbnail_url": final_thumbnail_url,
        "created_at": now
    }
    
    await db.courses.insert_one(course_doc)
    return CourseResponse(**course_doc)

@api_router.put("/admin/courses/{course_id}", response_model=CourseResponse)
async def admin_update_course(
    course_id: str,
    update: CourseUpdate,
    admin: dict = Depends(get_admin_user)
):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.courses.update_one({"id": course_id}, {"$set": update_data})
    
    updated_course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    return CourseResponse(**updated_course)

@api_router.delete("/admin/courses/{course_id}")
async def admin_delete_course(
    course_id: str,
    admin: dict = Depends(get_admin_user)
):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Delete associated files if they exist
    if course.get("video_url") and course["video_url"].startswith("/uploads/"):
        video_path = ROOT_DIR / course["video_url"].lstrip("/")
        if video_path.exists():
            video_path.unlink()
    
    if course.get("teaser_url") and course["teaser_url"].startswith("/uploads/"):
        teaser_path = ROOT_DIR / course["teaser_url"].lstrip("/")
        if teaser_path.exists():
            teaser_path.unlink()
    
    if course.get("thumbnail_url") and course["thumbnail_url"].startswith("/uploads/"):
        thumb_path = ROOT_DIR / course["thumbnail_url"].lstrip("/")
        if thumb_path.exists():
            thumb_path.unlink()
    
    await db.courses.delete_one({"id": course_id})
    return {"message": "Course deleted successfully"}

@api_router.get("/admin/courses", response_model=List[CourseResponse])
async def admin_get_all_courses(admin: dict = Depends(get_admin_user)):
    courses = await db.courses.find({}, {"_id": 0}).to_list(100)
    return courses

# ==================== SITE CONTENT MANAGEMENT ====================

DEFAULT_SITE_CONTENT = {
    "id": "main",
    "hero": {
        "title": "Atteins tes objectifs",
        "subtitle": None,
        "button_text": "VOIR LES PROGRAMMES",
        "image_url": "https://customer-assets.emergentagent.com/job_amelcoach/artifacts/re8f9wte_IMG_7767.jpeg"
    },
    "programs": [
        {
            "id": "prog1",
            "title": "ÉLIMINER LES EXCÈS DE L'ÉTÉ !",
            "subtitle": "Programme",
            "price": 35.00,
            "image_url": "https://customer-assets.emergentagent.com/job_amelcoach/artifacts/88u8asez_95A93139-7811-47B4-93DA-A287FFD4E1DA.png",
            "badge": None,
            "badge_icon": None,
            "order": 0
        },
        {
            "id": "prog2",
            "title": "PROGRAMME RAMADHÂN",
            "subtitle": "Programme",
            "price": 22.00,
            "image_url": "https://customer-assets.emergentagent.com/job_amelcoach/artifacts/300dg799_IMG_7778.jpeg",
            "badge": "🌙",
            "badge_icon": "moon",
            "order": 1
        },
        {
            "id": "prog3",
            "title": "RAMADAN MINIMALISTE",
            "subtitle": "Programme",
            "price": 19.00,
            "image_url": "https://images.unsplash.com/photo-1628258115387-23c428be3ac4",
            "badge": "✨",
            "badge_icon": "sparkle",
            "order": 2
        }
    ],
    "marquee": {
        "texts": ["BEAUTYFIT", "TRANSFORME TOI", "DÉPASSE TES LIMITES"],
        "separator": "✦"
    },
    "colors": {
        "linen": "#F7F5F2",
        "sky": "#D2DDE7",
        "berry": "#D5A0A8",
        "sunrise": "#EE9F80",
        "watermelon": "#E37E7F"
    },
    "logo_url": "https://customer-assets.emergentagent.com/job_amelcoach/artifacts/fru1zare_BEAUTYFIT.png"
}

@api_router.get("/site-content")
async def get_site_content():
    """Get site content - public endpoint"""
    content = await db.site_content.find_one({"id": "main"}, {"_id": 0})
    if not content:
        return DEFAULT_SITE_CONTENT
    return content

@api_router.get("/admin/site-content")
async def admin_get_site_content(admin: dict = Depends(get_admin_user)):
    """Get site content for admin"""
    content = await db.site_content.find_one({"id": "main"}, {"_id": 0})
    if not content:
        # Initialize with default content
        await db.site_content.insert_one(DEFAULT_SITE_CONTENT)
        return DEFAULT_SITE_CONTENT
    return content

@api_router.put("/admin/site-content")
async def admin_update_site_content(
    update: SiteContentUpdate,
    admin: dict = Depends(get_admin_user)
):
    """Update site content"""
    existing = await db.site_content.find_one({"id": "main"}, {"_id": 0})
    
    if not existing:
        existing = DEFAULT_SITE_CONTENT.copy()
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.site_content.update_one(
        {"id": "main"},
        {"$set": update_data},
        upsert=True
    )
    
    updated = await db.site_content.find_one({"id": "main"}, {"_id": 0})
    return updated

@api_router.put("/admin/site-content/hero")
async def admin_update_hero(
    hero: HeroContent,
    admin: dict = Depends(get_admin_user)
):
    """Update hero section"""
    await db.site_content.update_one(
        {"id": "main"},
        {"$set": {"hero": hero.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"message": "Hero updated", "hero": hero}

@api_router.put("/admin/site-content/programs")
async def admin_update_programs(
    programs: List[ProgramContent],
    admin: dict = Depends(get_admin_user)
):
    """Update programs"""
    await db.site_content.update_one(
        {"id": "main"},
        {"$set": {"programs": [p.model_dump() for p in programs], "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"message": "Programs updated", "programs": programs}

@api_router.put("/admin/site-content/colors")
async def admin_update_colors(
    colors: ColorTheme,
    admin: dict = Depends(get_admin_user)
):
    """Update color theme"""
    await db.site_content.update_one(
        {"id": "main"},
        {"$set": {"colors": colors.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"message": "Colors updated", "colors": colors}

@api_router.post("/admin/upload/image")
async def admin_upload_image(
    file: UploadFile = File(...),
    admin: dict = Depends(get_admin_user)
):
    """Upload image for site content"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"site_{uuid.uuid4()}.{file_ext}"
    file_path = THUMBNAILS_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"url": f"/uploads/thumbnails/{filename}", "filename": filename}

# ==================== ROOT ====================

# ==================== CALORIE TRACKER ROUTES ====================

@api_router.post("/calories/analyze", response_model=CalorieAnalysisResponse)
async def analyze_meal_calories(
    request: CalorieAnalysisRequest,
    user: dict = Depends(get_current_user)
):
    """Analyze a meal photo or text description and return nutritional information using GPT-4o"""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    # Validate that we have either image or text
    if not request.image_base64 and not request.meal_description:
        raise HTTPException(status_code=400, detail="Veuillez fournir une image ou une description du repas")
    
    try:
        # Initialize GPT-4o chat
        session_id = f"calorie_analysis_{user['id']}_{uuid.uuid4().hex[:8]}"
        
        # Different system message based on input type
        if request.meal_description:
            system_msg = """Tu es un expert nutritionniste. Analyse la description du repas fournie par l'utilisateur.
Pour chaque aliment mentionné, estime:
- Le nom de l'aliment
- La quantité approximative (en grammes ou portions standard)
- Les calories
- Les protéines (g)
- Les glucides (g)
- Les lipides (g)

Réponds UNIQUEMENT en JSON valide avec ce format exact:
{
    "foods": [
        {"name": "nom", "quantity": "100g", "calories": 150, "proteins": 5.0, "carbs": 20.0, "fats": 3.0}
    ],
    "total_calories": 150,
    "total_proteins": 5.0,
    "total_carbs": 20.0,
    "total_fats": 3.0,
    "analysis_text": "Description courte du repas analysé"
}"""
        else:
            system_msg = """Tu es un expert nutritionniste. Analyse l'image du repas et identifie tous les aliments visibles.
Pour chaque aliment, estime:
- Le nom de l'aliment
- La quantité approximative (en grammes ou portions)
- Les calories
- Les protéines (g)
- Les glucides (g)
- Les lipides (g)

Réponds UNIQUEMENT en JSON valide avec ce format exact:
{
    "foods": [
        {"name": "nom", "quantity": "100g", "calories": 150, "proteins": 5.0, "carbs": 20.0, "fats": 3.0}
    ],
    "total_calories": 150,
    "total_proteins": 5.0,
    "total_carbs": 20.0,
    "total_fats": 3.0,
    "analysis_text": "Description courte du repas analysé"
}"""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_msg
        )
        chat.with_model("openai", "gpt-4o")
        
        # Create message based on input type
        if request.meal_description:
            # Text-based analysis
            user_message = UserMessage(
                text=f"Analyse ce repas et donne-moi les informations nutritionnelles en JSON: {request.meal_description}"
            )
        else:
            # Image-based analysis
            image_content = ImageContent(image_base64=request.image_base64)
            user_message = UserMessage(
                text="Analyse ce repas et donne-moi les informations nutritionnelles détaillées en JSON.",
                file_contents=[image_content]
            )
        
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        try:
            # Try to extract JSON from the response
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                analysis_data = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse AI response: {response}")
            # Provide default response if parsing fails
            analysis_data = {
                "foods": [{"name": "Repas non identifié", "quantity": "1 portion", "calories": 400, "proteins": 15.0, "carbs": 50.0, "fats": 15.0}],
                "total_calories": 400,
                "total_proteins": 15.0,
                "total_carbs": 50.0,
                "total_fats": 15.0,
                "analysis_text": "Impossible d'analyser précisément ce repas. Estimation approximative fournie."
            }
        
        # Save to database
        meal_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        meal_doc = {
            "id": meal_id,
            "user_id": user["id"],
            "foods": analysis_data.get("foods", []),
            "total_calories": analysis_data.get("total_calories", 0),
            "total_proteins": analysis_data.get("total_proteins", 0.0),
            "total_carbs": analysis_data.get("total_carbs", 0.0),
            "total_fats": analysis_data.get("total_fats", 0.0),
            "meal_type": request.meal_type,
            "analysis_text": analysis_data.get("analysis_text", ""),
            "created_at": now
        }
        
        await db.meal_history.insert_one(meal_doc)
        
        return CalorieAnalysisResponse(**meal_doc)
        
    except Exception as e:
        logger.error(f"Error analyzing meal: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")

@api_router.get("/calories/history", response_model=List[MealHistoryResponse])
async def get_meal_history(
    date: Optional[str] = None,
    limit: int = 20,
    user: dict = Depends(get_current_user)
):
    """Get meal history for the current user"""
    query = {"user_id": user["id"]}
    
    if date:
        # Filter by date (YYYY-MM-DD)
        start = f"{date}T00:00:00"
        end = f"{date}T23:59:59"
        query["created_at"] = {"$gte": start, "$lte": end}
    
    meals = await db.meal_history.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(limit)
    
    return meals

@api_router.get("/calories/today")
async def get_today_summary(user: dict = Depends(get_current_user)):
    """Get today's calorie summary"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    start = f"{today}T00:00:00"
    end = f"{today}T23:59:59"
    
    meals = await db.meal_history.find(
        {
            "user_id": user["id"],
            "created_at": {"$gte": start, "$lte": end}
        },
        {"_id": 0}
    ).to_list(100)
    
    total_calories = sum(m.get("total_calories", 0) for m in meals)
    total_proteins = sum(m.get("total_proteins", 0) for m in meals)
    total_carbs = sum(m.get("total_carbs", 0) for m in meals)
    total_fats = sum(m.get("total_fats", 0) for m in meals)
    
    # Get user's daily goal
    user_data = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    daily_goal = user_data.get("daily_goal", {
        "calories": 2000,
        "proteins": 50.0,
        "carbs": 250.0,
        "fats": 65.0
    })
    
    return {
        "date": today,
        "meals_count": len(meals),
        "consumed": {
            "calories": total_calories,
            "proteins": round(total_proteins, 1),
            "carbs": round(total_carbs, 1),
            "fats": round(total_fats, 1)
        },
        "goal": daily_goal,
        "remaining": {
            "calories": max(0, daily_goal["calories"] - total_calories),
            "proteins": max(0, round(daily_goal["proteins"] - total_proteins, 1)),
            "carbs": max(0, round(daily_goal["carbs"] - total_carbs, 1)),
            "fats": max(0, round(daily_goal["fats"] - total_fats, 1))
        }
    }

@api_router.get("/calories/goal", response_model=DailyGoal)
async def get_daily_goal(user: dict = Depends(get_current_user)):
    """Get user's daily nutritional goal"""
    user_data = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    goal = user_data.get("daily_goal", {
        "calories": 2000,
        "proteins": 50.0,
        "carbs": 250.0,
        "fats": 65.0
    })
    return DailyGoal(**goal)

@api_router.put("/calories/goal", response_model=DailyGoal)
async def update_daily_goal(
    goal: DailyGoalUpdate,
    user: dict = Depends(get_current_user)
):
    """Update user's daily nutritional goal"""
    current_goal = {
        "calories": 2000,
        "proteins": 50.0,
        "carbs": 250.0,
        "fats": 65.0
    }
    
    user_data = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    if user_data and "daily_goal" in user_data:
        current_goal.update(user_data["daily_goal"])
    
    update_data = {k: v for k, v in goal.model_dump().items() if v is not None}
    current_goal.update(update_data)
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"daily_goal": current_goal}}
    )
    
    return DailyGoal(**current_goal)

@api_router.delete("/calories/meal/{meal_id}")
async def delete_meal(
    meal_id: str,
    user: dict = Depends(get_current_user)
):
    """Delete a meal from history"""
    result = await db.meal_history.delete_one({
        "id": meal_id,
        "user_id": user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Repas non trouvé")
    
    return {"message": "Repas supprimé"}

@api_router.post("/calories/calculate-needs", response_model=CalorieNeedsResponse)
async def calculate_calorie_needs(
    profile: CalorieProfileRequest,
    user: dict = Depends(get_current_user)
):
    """Calculate personalized calorie needs based on profile"""
    try:
        # Parse numeric values
        age = int(profile.age)
        height = float(profile.height)
        current_weight = float(profile.current_weight)
        target_weight = float(profile.target_weight)
        
        # Calculate BMR (Mifflin-St Jeor formula for women)
        if profile.gender == "femme":
            bmr = (10 * current_weight) + (6.25 * height) - (5 * age) - 161
        else:
            bmr = (10 * current_weight) + (6.25 * height) - (5 * age) + 5
        
        # Activity multipliers
        activity_multipliers = {
            "sedentary": 1.2,
            "light": 1.375,
            "active": 1.55,
            "very_active": 1.725
        }
        
        multiplier = activity_multipliers.get(profile.activity_level, 1.375)
        tdee = int(bmr * multiplier)
        
        # Adjust based on goal
        goal_adjustments = {
            "weight_loss": -500,  # Deficit of 500 kcal
            "maintain": 0,
            "muscle_gain": 300,  # Surplus of 300 kcal
            "wellness": -200  # Slight deficit for well-being
        }
        
        adjustment = goal_adjustments.get(profile.goal, 0)
        daily_calories = max(1200, tdee + adjustment)  # Minimum 1200 kcal
        
        # Calculate macros
        # For weight loss: higher protein, moderate carbs, lower fat
        # For muscle gain: high protein, high carbs, moderate fat
        if profile.goal == "weight_loss":
            proteins = int(current_weight * 1.8)  # 1.8g per kg
            fats = int(daily_calories * 0.25 / 9)  # 25% from fat
            carbs = int((daily_calories - (proteins * 4) - (fats * 9)) / 4)
        elif profile.goal == "muscle_gain":
            proteins = int(current_weight * 2.0)  # 2g per kg
            fats = int(daily_calories * 0.25 / 9)
            carbs = int((daily_calories - (proteins * 4) - (fats * 9)) / 4)
        else:
            proteins = int(current_weight * 1.5)  # 1.5g per kg
            fats = int(daily_calories * 0.30 / 9)  # 30% from fat
            carbs = int((daily_calories - (proteins * 4) - (fats * 9)) / 4)
        
        # Generate recommendations based on profile
        recommendations = []
        
        # Hydration recommendations
        if profile.hydration in ["less_1l", "1_1.5l"]:
            recommendations.append("Augmente ton hydratation ! Vise au moins 2L d'eau entre l'iftar et le suhoor.")
        
        # Sleep recommendations
        if profile.sleep_hours in ["less_5h", "5_6h"]:
            recommendations.append("Essaie de dormir plus ! Le manque de sommeil augmente la faim et le stockage des graisses.")
        
        # Suhoor recommendations
        if profile.does_suhoor == "no":
            recommendations.append("Le suhoor est important ! Il t'aide à maintenir ton énergie pendant la journée.")
        elif profile.does_suhoor == "sometimes":
            recommendations.append("Essaie de faire le suhoor tous les jours pour plus d'énergie.")
        
        # Eating habits recommendations
        if "Je mange souvent frit pendant Ramadan" in profile.eating_habits:
            recommendations.append("Limite les fritures. Privilégie les cuissons au four ou à la vapeur.")
        if "Je consomme beaucoup de sucre" in profile.eating_habits:
            recommendations.append("Réduis le sucre progressivement. Remplace par des fruits frais.")
        if "Je grignote après l'iftar" in profile.eating_habits:
            recommendations.append("Prends un iftar complet pour éviter les grignotages.")
        if "Je mange tard la nuit" in profile.eating_habits:
            recommendations.append("Essaie de terminer tes repas 2h avant de dormir.")
        if "J'ai souvent des envies incontrôlées" in profile.eating_habits:
            recommendations.append("Les envies sont souvent liées à la déshydratation. Bois d'abord !")
        
        # Feelings recommendations
        if "Fatigue intense" in profile.ramadan_feelings:
            recommendations.append("La fatigue peut être liée au manque de fer. Mange des lentilles et épinards.")
        if "Constipation" in profile.ramadan_feelings:
            recommendations.append("Ajoute plus de fibres : légumes, fruits secs, son d'avoine.")
        if "Ballonnements" in profile.ramadan_feelings:
            recommendations.append("Mange lentement à l'iftar et évite les boissons gazeuses.")
        
        # General recommendations
        if profile.goal == "weight_loss":
            recommendations.append("Pour perdre du poids sainement, vise une perte de 0.5kg par semaine maximum.")
        
        # If no specific recommendations, add generic ones
        if len(recommendations) < 3:
            recommendations.append("Commence l'iftar par des dattes et de l'eau, puis attends 15 min avant le repas.")
            recommendations.append("Privilégie les protéines à chaque repas pour maintenir ta masse musculaire.")
        
        # Meal distribution based on meals_count
        meals_count = int(profile.meals_count)
        if meals_count == 1:
            meal_distribution = {"Iftar": daily_calories}
        elif meals_count == 2:
            if profile.does_suhoor == "yes":
                meal_distribution = {
                    "Iftar": int(daily_calories * 0.65),
                    "Suhoor": int(daily_calories * 0.35)
                }
            else:
                meal_distribution = {
                    "Iftar": int(daily_calories * 0.60),
                    "Collation": int(daily_calories * 0.40)
                }
        else:
            if profile.does_suhoor == "yes":
                meal_distribution = {
                    "Iftar": int(daily_calories * 0.45),
                    "Collation": int(daily_calories * 0.25),
                    "Suhoor": int(daily_calories * 0.30)
                }
            else:
                meal_distribution = {
                    "Iftar": int(daily_calories * 0.50),
                    "Collation 1": int(daily_calories * 0.25),
                    "Collation 2": int(daily_calories * 0.25)
                }
        
        # Save profile to user
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {
                "calorie_profile": profile.model_dump(),
                "daily_goal": {
                    "calories": daily_calories,
                    "proteins": float(proteins),
                    "carbs": float(carbs),
                    "fats": float(fats)
                }
            }}
        )
        
        return CalorieNeedsResponse(
            daily_calories=daily_calories,
            proteins=proteins,
            carbs=carbs,
            fats=fats,
            bmr=int(bmr),
            tdee=tdee,
            recommendations=recommendations[:6],  # Max 6 recommendations
            meal_distribution=meal_distribution
        )
        
    except Exception as e:
        logger.error(f"Error calculating calorie needs: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul: {str(e)}")

# ==================== PROGRESS/STATS ROUTES ====================

@api_router.post("/progress/session")
async def complete_session(
    request: SessionCompleteRequest,
    user: dict = Depends(get_current_user)
):
    """Record a completed workout session"""
    try:
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        session_doc = {
            "id": session_id,
            "user_id": user["id"],
            "week_id": request.week_id,
            "seance_id": request.seance_id,
            "steps": request.steps,
            "duration_minutes": request.duration_minutes,
            "phases_completed": request.phases_completed,
            "completed_at": now.isoformat()
        }
        
        await db.sessions.insert_one(session_doc)
        
        # Update user stats
        await update_user_stats(user["id"], request.steps, request.duration_minutes)
        
        return {"message": "Session enregistrée", "session_id": session_id}
        
    except Exception as e:
        logger.error(f"Error recording session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def update_user_stats(user_id: str, steps: int, minutes: int):
    """Update user's cumulative stats and streak"""
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")
    
    # Get current user stats
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    current_stats = user.get("stats", {})
    
    # Calculate streak
    last_session_date = current_stats.get("last_session_date")
    current_streak = current_stats.get("current_streak", 0)
    best_streak = current_stats.get("best_streak", 0)
    
    if last_session_date:
        last_date = datetime.fromisoformat(last_session_date.replace("Z", "+00:00")).date()
        today_date = now.date()
        diff = (today_date - last_date).days
        
        if diff == 0:
            # Same day, don't increment streak
            pass
        elif diff == 1:
            # Consecutive day
            current_streak += 1
        else:
            # Streak broken
            current_streak = 1
    else:
        current_streak = 1
    
    best_streak = max(best_streak, current_streak)
    
    # Update stats
    new_stats = {
        "total_steps": current_stats.get("total_steps", 0) + steps,
        "total_minutes": current_stats.get("total_minutes", 0) + minutes,
        "sessions_completed": current_stats.get("sessions_completed", 0) + 1,
        "current_streak": current_streak,
        "best_streak": best_streak,
        "last_session_date": today,
        "weekly_goal": current_stats.get("weekly_goal", 20000)
    }
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"stats": new_stats}}
    )

@api_router.get("/progress/stats", response_model=UserStatsResponse)
async def get_user_stats(user: dict = Depends(get_current_user)):
    """Get user's progress statistics"""
    try:
        # Get user data
        user_data = await db.users.find_one({"id": user["id"]}, {"_id": 0})
        stats = user_data.get("stats", {})
        
        # Calculate weekly steps (last 7 days)
        now = datetime.now(timezone.utc)
        week_ago = (now - timedelta(days=7)).isoformat()
        
        weekly_sessions = await db.sessions.find({
            "user_id": user["id"],
            "completed_at": {"$gte": week_ago}
        }, {"_id": 0}).to_list(100)
        
        weekly_steps = sum(s.get("steps", 0) for s in weekly_sessions)
        
        return UserStatsResponse(
            total_steps=stats.get("total_steps", 0),
            weekly_steps=weekly_steps,
            weekly_goal=stats.get("weekly_goal", 20000),
            sessions_completed=stats.get("sessions_completed", 0),
            total_minutes=stats.get("total_minutes", 0),
            current_streak=stats.get("current_streak", 0),
            best_streak=stats.get("best_streak", 0),
            last_session_date=stats.get("last_session_date")
        )
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/progress/sessions")
async def get_session_history(
    limit: int = 20,
    user: dict = Depends(get_current_user)
):
    """Get user's session history"""
    sessions = await db.sessions.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("completed_at", -1).to_list(limit)
    
    return sessions

@api_router.get("/progress/weekly-activity")
async def get_weekly_activity(user: dict = Depends(get_current_user)):
    """Get activity for each day of the current week"""
    now = datetime.now(timezone.utc)
    
    # Get start of week (Monday)
    start_of_week = now - timedelta(days=now.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get sessions for this week
    sessions = await db.sessions.find({
        "user_id": user["id"],
        "completed_at": {"$gte": start_of_week.isoformat()}
    }, {"_id": 0}).to_list(100)
    
    # Create activity map for each day
    activity = {}
    for i in range(7):
        day_date = (start_of_week + timedelta(days=i)).strftime("%Y-%m-%d")
        activity[day_date] = False
    
    for session in sessions:
        session_date = session["completed_at"][:10]  # Extract YYYY-MM-DD
        if session_date in activity:
            activity[session_date] = True
    
    # Convert to array format [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    days = ["L", "M", "M", "J", "V", "S", "D"]
    result = []
    for i in range(7):
        day_date = (start_of_week + timedelta(days=i)).strftime("%Y-%m-%d")
        result.append({
            "day": days[i],
            "date": day_date,
            "active": activity[day_date]
        })
    
    return result

@api_router.put("/progress/weekly-goal")
async def update_weekly_goal(
    goal: int,
    user: dict = Depends(get_current_user)
):
    """Update user's weekly step goal"""
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"stats.weekly_goal": goal}}
    )
    return {"message": "Objectif mis à jour", "weekly_goal": goal}

# ==================== APPLE IAP ROUTES ====================

class ApplePurchaseVerifyRequest(BaseModel):
    transaction_id: str
    product_id: str
    receipt_data: Optional[str] = None

class ApplePurchaseResponse(BaseModel):
    success: bool
    transaction_id: str
    product_id: str
    message: str

# Product ID to course mapping
APPLE_PRODUCT_MAPPING = {
    "com.beautyfit.amel.programme.ramadan": "prog_ramadan"
}

@api_router.post("/purchases/apple/verify", response_model=ApplePurchaseResponse)
async def verify_apple_purchase(
    request: ApplePurchaseVerifyRequest,
    user: dict = Depends(get_current_user)
):
    """
    Verify an Apple In-App Purchase transaction.
    
    In production, this should validate the receipt with Apple's servers.
    For now, we trust the transaction and grant access.
    
    NOTE: Full Apple Server-to-Server validation requires:
    - Apple API Key (from App Store Connect)
    - JWT token generation for Apple API
    - Calling https://api.storekit.itunes.apple.com/inApps/v1/transactions/{transactionId}
    """
    
    logger.info(f"Apple IAP verification for user {user['id']}, product {request.product_id}")
    
    # Validate product ID
    if request.product_id not in APPLE_PRODUCT_MAPPING:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    course_id = APPLE_PRODUCT_MAPPING[request.product_id]
    
    try:
        # Check if already purchased
        existing = await db.purchases.find_one({
            "user_id": user["id"],
            "course_id": course_id,
            "status": "completed"
        })
        
        if existing:
            logger.info(f"User {user['id']} already owns {course_id}")
            return ApplePurchaseResponse(
                success=True,
                transaction_id=request.transaction_id,
                product_id=request.product_id,
                message="Achat déjà enregistré - Accès maintenu"
            )
        
        # Get course details
        course = await db.courses.find_one({"id": course_id}, {"_id": 0})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Record the purchase
        purchase_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        purchase_record = {
            "id": purchase_id,
            "user_id": user["id"],
            "course_id": course_id,
            "course_title": course["title"],
            "amount": course["price"],
            "payment_method": "apple_iap",
            "apple_transaction_id": request.transaction_id,
            "apple_product_id": request.product_id,
            "status": "completed",
            "created_at": now
        }
        
        await db.purchases.insert_one(purchase_record)
        
        logger.info(f"Apple IAP recorded: {purchase_id} for user {user['id']}")
        
        return ApplePurchaseResponse(
            success=True,
            transaction_id=request.transaction_id,
            product_id=request.product_id,
            message="Achat vérifié avec succès - Accès accordé"
        )
        
    except Exception as e:
        logger.error(f"Apple IAP verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/purchases/apple/restore")
async def restore_apple_purchases(user: dict = Depends(get_current_user)):
    """
    Restore Apple In-App Purchases for a user.
    Returns list of products the user has already purchased via Apple IAP.
    """
    
    logger.info(f"Restoring Apple purchases for user {user['id']}")
    
    try:
        # Find all Apple IAP purchases for this user
        purchases = await db.purchases.find({
            "user_id": user["id"],
            "payment_method": "apple_iap",
            "status": "completed"
        }, {"_id": 0}).to_list(100)
        
        restored_products = []
        for purchase in purchases:
            apple_product_id = purchase.get("apple_product_id")
            if apple_product_id:
                restored_products.append(apple_product_id)
        
        return {
            "success": True,
            "restored_products": restored_products,
            "count": len(restored_products)
        }
        
    except Exception as e:
        logger.error(f"Apple restore error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/purchases/apple/status/{product_id}")
async def check_apple_purchase_status(
    product_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Check if a user has purchased a specific Apple IAP product.
    """
    
    if product_id not in APPLE_PRODUCT_MAPPING:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    course_id = APPLE_PRODUCT_MAPPING[product_id]
    
    purchase = await db.purchases.find_one({
        "user_id": user["id"],
        "course_id": course_id,
        "status": "completed"
    })
    
    return {
        "product_id": product_id,
        "has_access": purchase is not None,
        "payment_method": purchase.get("payment_method") if purchase else None
    }

@api_router.get("/")
async def root():
    return {"message": "Amel Fit Coach API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
