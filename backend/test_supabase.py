"""
Test Supabase connectivity
Run this to verify your Supabase credentials are correct
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("🔍 Testing Supabase Connectivity")
print("=" * 60)
print()

# Check if credentials exist
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

print("1️⃣ Checking environment variables...")
if not supabase_url:
    print("❌ SUPABASE_URL not found in .env file")
    print("   Please add: SUPABASE_URL=https://your-project.supabase.co")
    sys.exit(1)
else:
    print(f"✅ SUPABASE_URL found: {supabase_url[:30]}...")

if not supabase_key:
    print("❌ SUPABASE_KEY not found in .env file")
    print("   Please add: SUPABASE_KEY=your_anon_key")
    sys.exit(1)
else:
    print(f"✅ SUPABASE_KEY found: {supabase_key[:20]}...")

print()
print("2️⃣ Testing Supabase connection...")

try:
    from supabase import create_client, Client
    
    # Check if using session pooler
    if "6543" in supabase_url or "pooler" in supabase_url.lower():
        print("ℹ️  Detected session pooler URL (recommended for production)")
    elif "5432" in supabase_url:
        print("ℹ️  Detected direct database connection")
    else:
        print("ℹ️  Using standard Supabase API URL")
    
    # Create client
    client: Client = create_client(supabase_url, supabase_key)
    print("✅ Supabase client created successfully")
    
except ImportError:
    print("❌ Supabase library not installed")
    print("   Run: pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    error_msg = str(e)
    print(f"❌ Error creating Supabase client: {error_msg}")
    
    if supabase_url.startswith("postgresql://"):
        print()
        print("⚠️  WRONG URL TYPE!")
        print("   You're using a PostgreSQL connection string, but the Supabase")
        print("   Python client needs the HTTPS API URL.")
        print()
        print("📋 Fix:")
        print("   1. Go to Supabase → Settings → API (NOT Database!)")
        print("   2. Copy 'Project URL' (starts with https://)")
        print("   3. Update backend/.env:")
        print(f"      SUPABASE_URL=https://{supabase_url.split('@')[-1].split(':')[0].replace('aws-1-ap-northeast-2.pooler.supabase.com', '').replace('5432/postgres', '')}")
        print()
        print("   Example:")
        print("   SUPABASE_URL=https://wyzuxvovmsfpvivijltr.supabase.co")
    elif "Invalid URL" in error_msg or "invalid" in error_msg.lower():
        print()
        print("💡 Make sure you're using the API URL:")
        print("   1. Go to Supabase → Settings → API")
        print("   2. Copy 'Project URL' (should start with https://)")
        print("   3. Update backend/.env with this URL")
        print()
        print("   Example:")
        print("   SUPABASE_URL=https://your-project.supabase.co")
    
    sys.exit(1)

print()
print("3️⃣ Testing database connection...")

try:
    # Try to query categories table (should exist after running schema)
    response = client.table("categories").select("code, name").limit(5).execute()
    
    if response.data:
        print(f"✅ Database connection successful!")
        print(f"✅ Found {len(response.data)} categories in database")
        print()
        print("Sample categories:")
        for cat in response.data[:3]:
            print(f"   - {cat['code']}: {cat['name']}")
    else:
        print("⚠️  Database connected but no categories found")
        print("   Did you run the supabase_schema.sql in Supabase SQL Editor?")
        
except Exception as e:
    error_msg = str(e)
    
    if "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
        print("❌ Categories table not found")
        print()
        print("📋 Next steps:")
        print("   1. Go to your Supabase project dashboard")
        print("   2. Click 'SQL Editor' in the left menu")
        print("   3. Click 'New Query'")
        print("   4. Copy the entire contents of backend/supabase_schema.sql")
        print("   5. Paste and click 'Run'")
        print("   6. Run this test again")
    elif "Invalid API key" in error_msg or "401" in error_msg:
        print("❌ Invalid Supabase credentials")
        print()
        print("📋 Next steps:")
        print("   1. Go to Supabase → Settings → API")
        print("   2. Copy 'Project URL' and 'anon public' key")
        print("   3. Update backend/.env with correct values")
        print("   4. Run this test again")
    else:
        print(f"❌ Database query failed: {error_msg}")
    
    sys.exit(1)

print()
print("4️⃣ Testing write permissions...")

try:
    # Try to insert a test scrape log
    test_log = {
        "scrape_time": "2026-01-07T16:30:00",
        "tenders_found": 0,
        "new_tenders": 0,
        "updated_tenders": 0,
        "errors": "Test connection",
        "duration_seconds": 0,
        "status": "success"
    }
    
    response = client.table("scrape_logs").insert(test_log).execute()
    
    if response.data:
        print("✅ Write permissions working!")
        
        # Clean up test log
        log_id = response.data[0]['id']
        client.table("scrape_logs").delete().eq("id", log_id).execute()
        print("✅ Test log cleaned up")
    else:
        print("⚠️  Write test returned no data")
        
except Exception as e:
    print(f"❌ Write test failed: {e}")
    print("   Check RLS policies in Supabase")
    sys.exit(1)

print()
print("=" * 60)
print("🎉 All tests passed! Supabase is ready to use!")
print("=" * 60)
print()
print("Next steps:")
print("1. ✅ Supabase connection verified")
print("2. 📦 Install backend dependencies: pip install -r requirements.txt")
print("3. 🎭 Install Playwright browser: playwright install chromium")
print("4. 🚀 Start the API: python main.py")
print()
