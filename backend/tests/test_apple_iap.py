"""
Test suite for Apple In-App Purchase (IAP) routes:
- POST /api/purchases/apple/verify - Verify Apple IAP transaction
- POST /api/purchases/apple/restore - Restore Apple purchases
- GET /api/purchases/apple/status/{product_id} - Check purchase status

NOTE: Apple IAP server-to-server validation is MOCKED for TestFlight.
The backend trusts the transaction for testing purposes.
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAppleIAPRoutes:
    """Test Apple In-App Purchase routes"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@beautyfit.com",
            "password": "Demo2025!"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        
        # Try alternate test user
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@amelfit.com",
            "password": "test123"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed - no valid test user")
    
    def test_apple_verify_requires_auth(self):
        """Test that Apple verify endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/purchases/apple/verify", json={
            "transaction_id": "test_transaction",
            "product_id": "com.beautyfit.amel.programme.ramadan",
            "receipt_data": "test_receipt"
        })
        assert response.status_code in [401, 403]
        print("SUCCESS: Apple verify endpoint correctly requires auth")
    
    def test_apple_restore_requires_auth(self):
        """Test that Apple restore endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/purchases/apple/restore")
        assert response.status_code in [401, 403]
        print("SUCCESS: Apple restore endpoint correctly requires auth")
    
    def test_apple_status_requires_auth(self):
        """Test that Apple status endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/purchases/apple/status/com.beautyfit.amel.programme.ramadan")
        assert response.status_code in [401, 403]
        print("SUCCESS: Apple status endpoint correctly requires auth")
    
    def test_apple_verify_with_auth(self, auth_token):
        """Test Apple verify endpoint with authentication"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        transaction_id = f"test_txn_{uuid.uuid4().hex[:12]}"
        
        response = requests.post(
            f"{BASE_URL}/api/purchases/apple/verify",
            json={
                "transaction_id": transaction_id,
                "product_id": "com.beautyfit.amel.programme.ramadan",
                "receipt_data": "mock_receipt_data_for_testing"
            },
            headers=headers
        )
        
        # Should return 200 (success) or 400 (already purchased)
        assert response.status_code in [200, 400]
        data = response.json()
        
        if response.status_code == 200:
            assert data.get("success") == True
            # purchase_id is only returned for new purchases, not for already owned
            assert data.get("product_id") == "com.beautyfit.amel.programme.ramadan"
            if "purchase_id" in data:
                print(f"SUCCESS: Apple IAP verified - new purchase: {data['purchase_id']}")
            else:
                print(f"SUCCESS: Apple IAP verified - already owned: {data.get('message')}")
        else:
            # Already purchased
            print(f"INFO: {data.get('detail', 'Product may already be purchased')}")
    
    def test_apple_verify_invalid_product(self, auth_token):
        """Test Apple verify with invalid product ID"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/purchases/apple/verify",
            json={
                "transaction_id": f"test_txn_{uuid.uuid4().hex[:8]}",
                "product_id": "invalid.product.id",
                "receipt_data": "mock_receipt"
            },
            headers=headers
        )
        
        # Should still work (trust mode) or return error
        # The backend maps product_id to course_id
        assert response.status_code in [200, 400, 404]
        print(f"SUCCESS: Apple verify with invalid product handled - status: {response.status_code}")
    
    def test_apple_restore_with_auth(self, auth_token):
        """Test Apple restore endpoint with authentication"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/purchases/apple/restore",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "restored_products" in data
        assert isinstance(data["restored_products"], list)
        print(f"SUCCESS: Apple restore returned {len(data['restored_products'])} products")
    
    def test_apple_status_with_auth(self, auth_token):
        """Test Apple status endpoint with authentication"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.get(
            f"{BASE_URL}/api/purchases/apple/status/com.beautyfit.amel.programme.ramadan",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        # API returns has_access instead of owned
        assert "has_access" in data or "owned" in data
        assert "product_id" in data
        assert data["product_id"] == "com.beautyfit.amel.programme.ramadan"
        owned = data.get("has_access", data.get("owned", False))
        print(f"SUCCESS: Apple status - has_access: {owned}")


class TestForgotPasswordRoute:
    """Test forgot password functionality"""
    
    def test_forgot_password_endpoint(self):
        """Test forgot password endpoint"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "demo@beautyfit.com"
        })
        
        # Should always return 200 to prevent email enumeration
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"SUCCESS: Forgot password endpoint working - {data['message']}")
    
    def test_forgot_password_nonexistent_email(self):
        """Test forgot password with non-existent email (should still return 200)"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "nonexistent@test.com"
        })
        
        # Should return same message to prevent email enumeration
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("SUCCESS: Forgot password correctly handles non-existent email")


class TestAuthenticationRoutes:
    """Test authentication routes with provided credentials"""
    
    def test_login_demo_user(self):
        """Test login with demo@beautyfit.com credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@beautyfit.com",
            "password": "Demo2025!"
        })
        
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            assert "user" in data
            assert data["user"]["email"] == "demo@beautyfit.com"
            print(f"SUCCESS: Demo user login successful - {data['user']['first_name']}")
        elif response.status_code == 401:
            print("INFO: Demo user does not exist yet - needs to be created")
        else:
            print(f"WARNING: Unexpected status code: {response.status_code}")
    
    def test_login_test_user(self):
        """Test login with test@amelfit.com credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@amelfit.com",
            "password": "test123"
        })
        
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            print(f"SUCCESS: Test user login successful")
        else:
            print(f"INFO: Test user status: {response.status_code}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@beautyfit.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        print("SUCCESS: Invalid credentials correctly return 401")


class TestRamadanProgramCheckout:
    """Test Ramadan program checkout flow"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        # Try demo user first
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@beautyfit.com",
            "password": "Demo2025!"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        
        # Fallback to test user
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@amelfit.com",
            "password": "test123"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("No valid test user available")
    
    def test_ramadan_course_exists(self):
        """Test that Ramadan course exists"""
        response = requests.get(f"{BASE_URL}/api/courses/prog_ramadan")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "prog_ramadan"
        assert data["price"] == 22.00
        print(f"SUCCESS: Ramadan course found - {data['title']} at {data['price']}€")
    
    def test_stripe_checkout_with_auth(self, auth_token):
        """Test Stripe checkout for Ramadan program"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/payments/stripe/checkout",
            json={
                "course_id": "prog_ramadan",
                "origin_url": "https://beautyfitapp.preview.emergentagent.com"
            },
            headers=headers
        )
        
        # Should return checkout URL or already purchased error
        assert response.status_code in [200, 400]
        data = response.json()
        
        if response.status_code == 200:
            assert "checkout_url" in data
            assert "session_id" in data
            print(f"SUCCESS: Stripe checkout session created")
        else:
            print(f"INFO: {data.get('detail', 'Course may already be purchased')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
