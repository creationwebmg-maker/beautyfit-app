from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

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

# Create the main app
app = FastAPI(title="Amel Fit Coach API")

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
    fitness_goal: Optional[str] = None

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

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        return {"message": "If the email exists, a reset link will be sent"}
    
    reset_token = str(uuid.uuid4())
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "email": request.email,
        "token": reset_token,
        "expires": expires.isoformat(),
        "used": False
    })
    
    logger.info(f"Password reset token for {request.email}: {reset_token}")
    return {"message": "If the email exists, a reset link will be sent", "reset_token": reset_token}

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
        payment_methods=["card"]
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

# ==================== ROOT ====================

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
