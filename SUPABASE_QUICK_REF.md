# 🔌 Supabase Connection - Quick Reference

## ⚡ Quick Setup (Choose ONE option)

### Option 1: Session Pooler (RECOMMENDED) ⭐
**Best for:** Production, VPS deployment, connection reliability

```env
# In backend/.env
SUPABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get:**
1. Supabase → Settings → Database
2. Connection string → **Session mode** tab
3. Copy the entire postgresql:// URL
4. Replace `[YOUR-PASSWORD]` with your database password
5. Get anon key from Settings → API

---

### Option 2: API URL (Alternative)
**Best for:** Local development, testing

```env
# In backend/.env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get:**
1. Supabase → Settings → API
2. Copy Project URL
3. Copy anon public key

---

## 🧪 Test Your Connection

```bash
cd backend
.\venv\Scripts\python.exe test_supabase.py
```

**Expected output:**
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

### "Invalid URL" error
→ Use **Session Pooler** (Option 1) instead of API URL

### "Categories table not found"
→ Run `supabase_schema.sql` in Supabase SQL Editor

### "Invalid API key"
→ Use the **anon public** key (not service_role)

### Connection timeout
→ Switch to **Session Pooler** (port 6543)

---

## 📋 Complete Example

**Your backend/.env should look like this:**

```env
# Supabase - Session Pooler (RECOMMENDED)
SUPABASE_URL=postgresql://postgres.abcdefgh:MySecurePassword123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYwNjc2MDAsImV4cCI6MTk2MTY0MzYwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Scraper Settings
SCRAPE_SCHEDULE=0 8,14,20 * * *
TIMEZONE=Asia/Kuala_Lumpur

# ... rest of config
```

---

## ✅ Checklist

Before running the app:

- [ ] Supabase project created
- [ ] Database password saved
- [ ] Session pooler URL copied (with password filled in)
- [ ] anon key copied
- [ ] `backend/.env` updated
- [ ] `supabase_schema.sql` executed in SQL Editor
- [ ] Test script passes (`test_supabase.py`)

---

**Need help?** Check `SUPABASE_SETUP.md` for detailed instructions.
