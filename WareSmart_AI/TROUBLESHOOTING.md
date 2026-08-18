# 🔧 WareSmart AI - Troubleshooting & Advanced Guide

## Common Issues & Solutions

### 🔴 Backend Issues

#### Backend won't start
**Error**: `python: can't open file 'uvicorn'` or similar

**Solution**:
```bash
# Use python -m to run uvicorn module
python -m uvicorn app.main:app --reload

# Or reinstall dependencies
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

#### Port 8000 already in use
**Error**: `Address already in use`

**Solution**:
```bash
# Find and kill process using port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>

# Or use different port
python -m uvicorn app.main:app --port 8001
```

#### ModuleNotFoundError: No module named 'google'
**Error**: `from google import genai` fails

**Solution**:
```bash
# This is OK - Gemini is optional
# Copilot will use fallback rule-based engine
# To enable Gemini:
pip install google-genai
# Then set GEMINI_API_KEY in .env
```

#### Database locked error
**Error**: `database is locked`

**Solution**:
```bash
# Stop backend server
# Delete warehouse.db
# Reseed database
python seed.py
# Restart backend
python -m uvicorn app.main:app --reload
```

---

### 🔴 Frontend Issues

#### Frontend won't start
**Error**: `Cannot find module` or `VITE` errors

**Solution**:
```bash
cd frontend
# Clear everything
rm -rf node_modules package-lock.json

# Reinstall fresh
npm install
npm run dev
```

#### Port 5173 already in use
**Error**: `Error: listen EADDRINUSE: address already in use :::5173`

**Solution**:
```bash
# Use different port
npm run dev -- --port 3000

# Or kill process on 5173
netstat -ano | findstr :5173  # Windows
lsof -i :5173                  # Linux/Mac
```

#### Vite config error
**Error**: `vite.config.js not found`

**Solution**:
- The file should be in `frontend/vite.config.js`
- If missing, create it:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
})
```

#### npm execution policy error (Windows)
**Error**: `PSSecurityException` or "scripts disabled"

**Solution**:
```powershell
# Use npm.cmd directly
&"C:\Program Files\nodejs\npm.cmd" install
&"C:\Program Files\nodejs\npm.cmd" run dev

# Or run as admin and change policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 🔴 API Connectivity Issues

#### Frontend can't reach backend
**Error**: `Failed to fetch` or `NetworkError`

**Solution**:
1. **Verify backend is running**:
   ```bash
   # Should see "Uvicorn running on http://127.0.0.1:8000"
   ```

2. **Check backend is listening**:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   # Linux/Mac
   lsof -i :8000
   ```

3. **Test API directly**:
   ```bash
   curl http://127.0.0.1:8000/api/dashboard
   # Should return JSON data
   ```

4. **Check CORS settings** in `backend/app/main.py`:
   ```python
   allow_origins=['http://localhost:5173','http://127.0.0.1:5173']
   ```
   - If using different port, add it to `allow_origins`

5. **Check console errors** (F12 in browser):
   - Look for CORS errors
   - Check Network tab for failed requests

---

### 🔴 Database Issues

#### Database file too large or corrupted
**Solution**:
```bash
cd backend
# Backup original (optional)
copy warehouse.db warehouse.db.backup

# Remove and recreate
del warehouse.db
python seed.py
python -m uvicorn app.main:app --reload
```

#### Data not persisting
**Symptom**: Changes don't save after restart

**Solution**:
```bash
# Ensure you're in backend directory
cd backend

# Check database file exists
dir | findstr warehouse.db

# Restart backend
python -m uvicorn app.main:app --reload
```

---

### 🔴 AI Copilot Issues

#### Copilot not responding
**Symptom**: "Thinking..." never completes

**Solution**:
1. Check backend logs for errors
2. Verify API endpoint is responding:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/copilot \
     -H "Content-Type: application/json" \
     -d '{"message":"test"}'
   ```
3. Should return JSON with `answer` field

#### Gemini API key not working
**Error**: Gemini responses fail

**Solution**:
1. Verify `.env` file in backend directory:
   ```
   GEMINI_API_KEY=sk-...
   GEMINI_MODEL=gemini-2.5-flash
   ```
2. Test key at: https://aistudio.google.com
3. Restart backend after updating `.env`
4. System falls back to rule-based if key invalid

#### Copilot returns generic response
**Reason**: Question doesn't match known patterns

**Solution**:
- Try questions from the demo list
- Use keywords: "prioritize", "reorder", "urgent", "health", etc.
- Copilot is designed for warehouse-specific queries

---

## 🔍 Debugging Tips

### Enable Verbose Logging

**Backend**:
```python
# In app/main.py, add at top:
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend** (Browser Console):
```javascript
// Enable all logs
localStorage.setItem('debug', '*')
// Refresh page
```

### Check Database State

```bash
# Windows (using Python)
python -c "from app.database import SessionLocal; from app.models import Product; s = SessionLocal(); print([p.name for p in s.query(Product).all()])"

# Or use sqlite3 directly
sqlite3 warehouse.db "SELECT name, stock FROM products;"
```

### Test API Manually

```bash
# Get dashboard
curl http://127.0.0.1:8000/api/dashboard | jq

# Get products
curl http://127.0.0.1:8000/api/products | jq

# Get orders
curl http://127.0.0.1:8000/api/orders | jq

# Test copilot
curl -X POST http://127.0.0.1:8000/api/copilot \
  -H "Content-Type: application/json" \
  -d '{"message":"What products need reordering?"}' | jq
```

---

## 🚀 Performance Tips

### Optimize Backend
```bash
# Use production mode (no reload)
python -m uvicorn app.main:app --host 0.0.0.0

# Use workers for concurrency
python -m uvicorn app.main:app --workers 4
```

### Optimize Frontend
```bash
# Build optimized version
npm run build

# Check bundle size
npm run build -- --report  # If supported
```

---

## 🔐 Security Checklist

Before production:
- ☐ Change CORS origins to production URLs
- ☐ Use HTTPS/SSL certificates
- ☐ Hide Gemini API key (never in git)
- ☐ Use environment variables for config
- ☐ Implement authentication/authorization
- ☐ Use database migrations
- ☐ Enable request rate limiting
- ☐ Validate all inputs
- ☐ Use CSRF tokens
- ☐ Implement audit logging

---

## 📊 Database Schema Inspection

### View All Tables
```bash
sqlite3 warehouse.db ".tables"
```

### View Table Schema
```bash
sqlite3 warehouse.db ".schema products"
sqlite3 warehouse.db ".schema orders"
sqlite3 warehouse.db ".schema items"
sqlite3 warehouse.db ".schema exceptions"
```

### Check Data
```bash
sqlite3 warehouse.db "SELECT COUNT(*) FROM products;"
sqlite3 warehouse.db "SELECT COUNT(*) FROM orders;"
sqlite3 warehouse.db "SELECT * FROM orders LIMIT 5;"
```

---

## 🔄 Reset Everything

### Complete Fresh Start

**Windows**:
```powershell
# Backend
cd backend
del warehouse.db
python seed.py
python -m uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
rm -r node_modules
npm install
npm run dev
```

**Linux/Mac**:
```bash
# Backend
cd backend
rm -f warehouse.db
python seed.py
python -m uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

## 📚 Advanced Customization

### Change Database to PostgreSQL

1. Install PostgreSQL adapter:
   ```bash
   pip install psycopg2-binary
   ```

2. Update `backend/app/database.py`:
   ```python
   from sqlalchemy import create_engine
   
   DATABASE_URL = "postgresql://user:password@localhost/waresmart"
   engine = create_engine(DATABASE_URL)
   ```

3. Run migrations (if using Alembic)

### Add Authentication

1. Install dependencies:
   ```bash
   pip install python-jose cryptography
   ```

2. Add auth middleware to `backend/app/main.py`

3. Protect endpoints with `Depends(get_current_user)`

### Add Frontend State Management

**For Redux**:
```bash
npm install @reduxjs/toolkit react-redux
```

**For Zustand**:
```bash
npm install zustand
```

---

## 🧪 Testing

### Backend Tests
```bash
pip install pytest
pytest backend/
```

### Frontend Tests
```bash
npm install --save-dev vitest
npm run test
```

---

## 📞 Getting Help

1. **Check logs**: Terminal output usually shows the issue
2. **Read error messages**: Very descriptive
3. **Try simple test**: `curl` the API directly
4. **Check documentation**: [COMPLETION.md](COMPLETION.md)
5. **Recreate database**: `python seed.py`
6. **Fresh installation**: Delete node_modules, reinstall

---

## 🎓 Learning Resources

- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **SQLAlchemy**: https://www.sqlalchemy.org/
- **SQLite**: https://www.sqlite.org/

---

**WareSmart AI - Smart Warehouse Decision System** 🏭📊🤖
