# 🔌 Supabase Connection - CORRECTED Setup

## ⚠️ IMPORTANT: Use API URL (Not Database Connection String!)

The Supabase Python client uses the **REST API**, not direct database connections.

---

## ✅ Correct Setup

### What You Need from Supabase:

1. **Go to:** Supabase → Settings → **API** (not Database!)
2. **Copy these 2 values:**
   - **Project URL** (starts with `https://`)
   - **anon public** key (long JWT token)

### Your backend/.env should be:

```env
SUPABASE_URL=https://wyzuxvovmsfpvivijltr.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5enV4dm92bXNmcHZpdmlqbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NzQ4NzcsImV4cCI6MjA1MjM1MDg3N30.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note:** Replace with YOUR actual values from Supabase Settings → API

---

## ❌ Common Mistake

**DON'T use the database connection string:**
```env
# ❌ WRONG - This is for direct database connections
SUPABASE_URL=postgresql://postgres.wyzuxvovmsfpvivijltr:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

**DO use the API URL:**
```env
# ✅ CORRECT - This is for Supabase Python client
SUPABASE_URL=https://wyzuxvovmsfpvivijltr.supabase.co
```

---

## 📍 Where to Find Your Credentials

### Step 1: Get Project URL
1. Supabase Dashboard
2. Click **Settings** (gear icon, bottom left)
3. Click **API**
4. Under "Project URL" → Copy the `https://` URL

### Step 2: Get anon Key
1. Same page (Settings → API)
2. Under "Project API keys"
3. Find **anon** **public** (NOT service_role)
4. Click "Copy" or select and copy the entire key

---

## 🧪 Test Your Connection

After updating `backend/.env`:

```bash
cd backend
.\venv\Scripts\python.exe test_supabase.py
```

**Expected output:**
```
✅ SUPABASE_URL found: https://wyzuxvovmsfpvivijltr...
✅ SUPABASE_KEY found: eyJhbGciOiJIUzI1NiIs...
✅ Using standard Supabase API URL
✅ Supabase client created successfully
✅ Database connection successful!
✅ Found 30 categories in database
🎉 All tests passed!
```

---

## 🔧 Fix Your .env File Now

Based on your screenshot, your `.env` should be:

```env
# Supabase Configuration
SUPABASE_URL=https://wyzuxvovmsfpvivijltr.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5enV4dm92bXNmcHZpdmlqbHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NzQ4NzcsImV4cCI6MjA1MjM1MDg3N30.[YOUR_ACTUAL_KEY_HERE]

# Rest of config...
SCRAPE_SCHEDULE=0 8,14,20 * * *
TIMEZONE=Asia/Kuala_Lumpur
# ... etc
```

**Action:** 
1. Open `backend/.env`
2. Change line 2 from `postgresql://...` to `https://wyzuxvovmsfpvivijltr.supabase.co`
3. Make sure line 3 has your anon key (get from Settings → API)
4. Save file
5. Run test again

---

## 📝 Summary

| What | Where to Get | Format |
|------|-------------|--------|
| **SUPABASE_URL** | Settings → API → Project URL | `https://xxxxx.supabase.co` |
| **SUPABASE_KEY** | Settings → API → anon public | `eyJhbGciOiJIUzI1NiIs...` (very long) |

**NOT from Settings → Database!** That's for direct database connections, which we don't use.

---

**Once you update your .env with the HTTPS URL, run the test again!** 🚀
