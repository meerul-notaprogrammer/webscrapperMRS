# 🔧 Supabase Setup Instructions

## ⚠️ Current Status
Your `.env` file exists but needs Supabase credentials!

## 📋 Step-by-Step Setup

### Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com
2. Click "Start your project" or "New Project"
3. Sign in with GitHub (or create account)
4. Click "New Project"
5. Fill in:
   - **Name:** eperolehan-scraper
   - **Database Password:** (create a strong password - save it!)
   - **Region:** Southeast Asia (Singapore) - closest to Malaysia
6. Click "Create new project"
7. Wait ~2 minutes for provisioning

### Step 2: Get Your Credentials (1 minute)

**IMPORTANT:** Use Session Pooler for better reliability!

#### Option A: Session Pooler (RECOMMENDED) ⭐

1. In Supabase dashboard, click **Settings** → **Database**
2. Scroll to **Connection string** section
3. Click the **Session mode** tab (NOT Transaction mode)
4. You'll see a connection string like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
   ```
5. Copy this entire string
6. Also get your **anon key** from Settings → API

**Your .env should look like:**
```env
SUPABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Option B: API URL (Alternative)

1. Click **Settings** (gear icon in left sidebar)
2. Click **API** in the settings menu
3. Copy **Project URL** - looks like `https://xxxxx.supabase.co`
4. Copy **anon public** key from API Keys section

**Your .env should look like:**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Update Your .env File (1 minute)

1. Open `backend/.env` in your text editor
2. Find these lines:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

3. Replace with your actual values:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

4. Save the file

### Step 4: Create Database Tables (2 minutes)

1. In Supabase dashboard, click **SQL Editor** (in left sidebar)
2. Click **New Query**
3. Open `backend/supabase_schema.sql` in your text editor
4. Copy the ENTIRE contents (Ctrl+A, Ctrl+C)
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"
8. Click **Table Editor** to verify tables were created

### Step 5: Test Connection (1 minute)

Run the test script again:
```bash
cd backend
.\venv\Scripts\python.exe test_supabase.py
```

You should see:
```
✅ SUPABASE_URL found
✅ SUPABASE_KEY found
✅ Supabase client created successfully
✅ Database connection successful!
✅ Found 30 categories in database
🎉 All tests passed!
```

---

## 🐛 Troubleshooting

### Error: "Invalid URL"
- Check that SUPABASE_URL starts with `https://`
- Make sure there are no extra spaces
- Verify the URL is from Supabase Settings → API

### Error: "Invalid API key"
- Make sure you copied the `anon` `public` key (not the `service_role` key)
- Check for extra spaces or line breaks
- The key should be very long (200+ characters)

### Error: "Categories table not found"
- You need to run `supabase_schema.sql` in Supabase SQL Editor
- Go to Supabase → SQL Editor → New Query
- Paste the entire schema file and click Run

### Error: "python-dotenv could not parse"
- Your `.env` file might have syntax errors
- Make sure each line is: `KEY=value` (no spaces around =)
- No quotes needed around values
- Example:
  ```env
  SUPABASE_URL=https://xxxxx.supabase.co
  SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

---

## ✅ Quick Checklist

- [ ] Supabase project created
- [ ] Project URL copied
- [ ] anon public key copied
- [ ] `backend/.env` updated with URL
- [ ] `backend/.env` updated with key
- [ ] `supabase_schema.sql` run in SQL Editor
- [ ] Tables visible in Table Editor
- [ ] Test script passes

---

## 🎯 What You Need

From Supabase Settings → API:

1. **Project URL** (looks like):
   ```
   https://abcdefghijklmnop.supabase.co
   ```

2. **anon public key** (looks like):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjA2NzYwMCwiZXhwIjoxOTYxNjQzNjAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

**Once you have these, update `backend/.env` and run the test again!**
