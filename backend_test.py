import requests
import sys
import json
from datetime import datetime

class AmelFitCoachAPITester:
    def __init__(self, base_url="https://fitness-ramadan.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True)
                    return True, response_data
                except:
                    self.log_test(name, True, "No JSON response")
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {error_data}")
                except:
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_seed_data(self):
        """Seed sample courses data"""
        return self.run_test("Seed Data", "POST", "seed", 200)

    def test_get_courses(self):
        """Test getting all courses"""
        return self.run_test("Get All Courses", "GET", "courses", 200)

    def test_get_categories(self):
        """Test getting course categories"""
        return self.run_test("Get Course Categories", "GET", "courses/categories", 200)

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "TestPass123!",
            "first_name": "TestUser",
            "fitness_goal": "weight_loss"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, test_data)
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   ✅ Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_login(self):
        """Test user login with existing user"""
        # First register a user
        timestamp = datetime.now().strftime('%H%M%S')
        register_data = {
            "email": f"login_test_{timestamp}@example.com",
            "password": "TestPass123!",
            "first_name": "LoginTest",
            "fitness_goal": "toning"
        }
        
        # Register user
        reg_success, reg_response = self.run_test("Register for Login Test", "POST", "auth/register", 200, register_data)
        
        if not reg_success:
            return False
            
        # Now test login
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if success and 'access_token' in response:
            print(f"   ✅ Login successful, token: {response['access_token'][:20]}...")
            return True
        return False

    def test_get_profile(self):
        """Test getting user profile"""
        return self.run_test("Get User Profile", "GET", "user/profile", 200, auth_required=True)

    def test_get_user_courses(self):
        """Test getting user's purchased courses"""
        return self.run_test("Get User Courses", "GET", "user/courses", 200, auth_required=True)

    def test_get_specific_course(self):
        """Test getting a specific course"""
        # First get all courses to get a course ID
        success, courses_data = self.run_test("Get Courses for Detail Test", "GET", "courses", 200)
        
        if success and courses_data and len(courses_data) > 0:
            course_id = courses_data[0]['id']
            return self.run_test("Get Specific Course", "GET", f"courses/{course_id}", 200)
        else:
            self.log_test("Get Specific Course", False, "No courses available to test")
            return False

    def test_check_course_access(self):
        """Test checking course access"""
        # First get all courses to get a course ID
        success, courses_data = self.run_test("Get Courses for Access Test", "GET", "courses", 200)
        
        if success and courses_data and len(courses_data) > 0:
            course_id = courses_data[0]['id']
            return self.run_test("Check Course Access", "GET", f"courses/{course_id}/access", 200, auth_required=True)
        else:
            self.log_test("Check Course Access", False, "No courses available to test")
            return False

    def test_stripe_checkout(self):
        """Test Stripe checkout creation"""
        # First get all courses to get a course ID
        success, courses_data = self.run_test("Get Courses for Stripe Test", "GET", "courses", 200)
        
        if success and courses_data and len(courses_data) > 0:
            course_id = courses_data[0]['id']
            checkout_data = {
                "course_id": course_id,
                "payment_method": "stripe",
                "origin_url": "https://fitness-ramadan.preview.emergentagent.com"
            }
            return self.run_test("Stripe Checkout Creation", "POST", "payments/stripe/checkout", 200, checkout_data, auth_required=True)
        else:
            self.log_test("Stripe Checkout Creation", False, "No courses available to test")
            return False

    def test_notification_settings(self):
        """Test notification settings"""
        # Get current settings
        get_success, _ = self.run_test("Get Notification Settings", "GET", "user/notifications", 200, auth_required=True)
        
        # Update settings
        update_data = {
            "enabled": True,
            "training_days": ["monday", "wednesday", "friday"],
            "training_time": "18:00"
        }
        update_success, _ = self.run_test("Update Notification Settings", "PUT", "user/notifications", 200, update_data, auth_required=True)
        
        return get_success and update_success

    def test_invalid_endpoints(self):
        """Test invalid endpoints return proper errors"""
        # Test non-existent course
        invalid_course_success, _ = self.run_test("Invalid Course ID", "GET", "courses/invalid-id", 404)
        
        # Test unauthorized access
        unauthorized_success, _ = self.run_test("Unauthorized Profile Access", "GET", "user/profile", 401)
        
        return invalid_course_success and unauthorized_success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Amel Fit Coach API Tests")
        print("=" * 50)
        
        # Test basic endpoints first
        self.test_seed_data()
        self.test_get_courses()
        self.test_get_categories()
        
        # Test authentication
        if self.test_register():
            self.test_get_profile()
            self.test_get_user_courses()
            self.test_check_course_access()
            self.test_stripe_checkout()
            self.test_notification_settings()
        
        # Test login separately
        self.test_login()
        
        # Test specific course endpoint
        self.test_get_specific_course()
        
        # Test error cases
        self.test_invalid_endpoints()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
            return 1

def main():
    tester = AmelFitCoachAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())