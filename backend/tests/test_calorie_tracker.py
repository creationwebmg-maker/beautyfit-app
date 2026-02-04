"""
Test suite for Calorie Tracker feature - Amel Fit Coach
Tests: Authentication, Calorie Analysis, Today Summary, History, Goal Management
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@amelfit.com"
TEST_PASSWORD = "test123"

# Sample food image base64 (small valid JPEG)
SAMPLE_IMAGE_BASE64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k="


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401


class TestCalorieTrackerAPIs:
    """Test Calorie Tracker API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_get_today_summary(self):
        """Test GET /api/calories/today - returns today's calorie summary"""
        response = requests.get(f"{BASE_URL}/api/calories/today", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "date" in data
        assert "meals_count" in data
        assert "consumed" in data
        assert "goal" in data
        assert "remaining" in data
        
        # Verify consumed structure
        assert "calories" in data["consumed"]
        assert "proteins" in data["consumed"]
        assert "carbs" in data["consumed"]
        assert "fats" in data["consumed"]
        
        # Verify goal structure
        assert "calories" in data["goal"]
        assert "proteins" in data["goal"]
        assert "carbs" in data["goal"]
        assert "fats" in data["goal"]
    
    def test_get_meal_history(self):
        """Test GET /api/calories/history - returns meal history"""
        response = requests.get(f"{BASE_URL}/api/calories/history?limit=10", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Should return a list
        assert isinstance(data, list)
        
        # If there are meals, verify structure
        if len(data) > 0:
            meal = data[0]
            assert "id" in meal
            assert "foods" in meal
            assert "total_calories" in meal
            assert "meal_type" in meal
            assert "created_at" in meal
    
    def test_get_daily_goal(self):
        """Test GET /api/calories/goal - returns user's daily goal"""
        response = requests.get(f"{BASE_URL}/api/calories/goal", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify goal structure
        assert "calories" in data
        assert "proteins" in data
        assert "carbs" in data
        assert "fats" in data
        
        # Verify default values are reasonable
        assert data["calories"] > 0
        assert data["proteins"] > 0
    
    def test_update_daily_goal(self):
        """Test PUT /api/calories/goal - updates user's daily goal"""
        new_goal = {
            "calories": 2500,
            "proteins": 60.0
        }
        response = requests.put(f"{BASE_URL}/api/calories/goal", 
                               json=new_goal, 
                               headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify updated values
        assert data["calories"] == 2500
        assert data["proteins"] == 60.0
        
        # Reset to default
        requests.put(f"{BASE_URL}/api/calories/goal", 
                    json={"calories": 2000, "proteins": 50.0}, 
                    headers=self.headers)
    
    def test_analyze_meal_unauthorized(self):
        """Test POST /api/calories/analyze without auth - should fail"""
        response = requests.post(f"{BASE_URL}/api/calories/analyze", json={
            "image_base64": SAMPLE_IMAGE_BASE64,
            "meal_type": "dejeuner"
        })
        assert response.status_code in [401, 403]
    
    def test_today_summary_unauthorized(self):
        """Test GET /api/calories/today without auth - should fail"""
        response = requests.get(f"{BASE_URL}/api/calories/today")
        assert response.status_code in [401, 403]
    
    def test_history_unauthorized(self):
        """Test GET /api/calories/history without auth - should fail"""
        response = requests.get(f"{BASE_URL}/api/calories/history")
        assert response.status_code in [401, 403]


class TestAccountPage:
    """Test Account page related endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Authentication failed")
    
    def test_get_user_profile(self):
        """Test GET /api/user/profile - returns user profile"""
        response = requests.get(f"{BASE_URL}/api/user/profile", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert "email" in data
        assert "first_name" in data
    
    def test_get_user_purchases(self):
        """Test GET /api/user/purchases - returns user purchases"""
        response = requests.get(f"{BASE_URL}/api/user/purchases", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Should return a list
        assert isinstance(data, list)
    
    def test_get_user_courses(self):
        """Test GET /api/user/courses - returns user's purchased courses"""
        response = requests.get(f"{BASE_URL}/api/user/courses", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Should return a list
        assert isinstance(data, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
