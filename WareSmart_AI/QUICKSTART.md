# 🚀 WareSmart AI - Quick Start Guide

## Overview
WareSmart AI is a complete, production-ready warehouse management system with an AI-powered decision engine. Everything is built, tested, and ready to run!

## ⚡ Fastest Way to Start

### Windows (PowerShell)
```powershell
# Terminal 1 - Start Backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2 - Start Frontend (after backend is running)
cd frontend
npm run dev
```

### Linux/Mac (Bash)
```bash
# Terminal 1 - Start Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed.py
python -m uvicorn app.main:app --reload

# Terminal 2 - Start Frontend
cd frontend
npm install  # Skip if already done
npm run dev
```

---

## 📍 Access Points

After both servers start, open your browser:

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend** | http://localhost:5173 | Main warehouse dashboard |
| **Backend API** | http://127.0.0.1:8000 | API server |
| **API Docs** | http://127.0.0.1:8000/docs | Interactive Swagger UI |
| **ReDoc** | http://127.0.0.1:8000/redoc | Alternative API docs |

---

## ✅ What to Expect

When you open http://localhost:5173, you'll see:

1. **Dashboard** with 4 key metrics:
   - 📦 Total Inventory (178 units in demo)
   - 🛒 Pending Orders (7 orders)
   - 🚨 Urgent Orders (4 critical orders)
   - ❤️ Warehouse Health (82% - excellent)

2. **Priority Orders Table** - AI-ranked fulfillment queue
   - Order numbers, customers, priorities, and SLAs
   - One-click "Allocate" button for stock allocation
   - Status dropdown for order workflow

3. **Inventory Monitor** - Real-time stock visibility
   - 6 products across 4 categories
   - Available quantities and reorder levels
   - Color-coded stock status (Healthy/Low/Out)

4. **Warehouse Zones** - Workload utilization heat map
   - Zone A, B, C, D workload tracking
   - Utilization percentages
   - Capacity monitoring

5. **Exceptions Section** - Alerts and issues
   - Low stock alerts
   - Out of stock items
   - Recommended reorder quantities

6. **AI Copilot** - Ask natural language questions:
   - "What products need reordering?"
   - "Which orders should we prioritize?"
   - "Where is the biggest bottleneck?"

---

## 🎯 Try These Actions

### Action 1: View Order Details
1. Go to "Priority Orders" table
2. Click on any order (e.g., ORD-1042)
3. See customer, SLA, priority score, and line items

### Action 2: Allocate an Order
1. Find an order with status "Created"
2. Click "Allocate" button
3. Watch status change to "Allocated" or "Partially Allocated"
4. See inventory update in real-time

### Action 3: Change Order Status
1. Use the dropdown in the "Status" column
2. Move order through workflow: Allocated → Picking → Packing → Quality Check → Dispatched
3. When "Dispatched", inventory automatically decreases

### Action 4: Ask the Copilot
1. Scroll to "AI Copilot" section at bottom
2. Click quick questions or type your own
3. Watch AI analyze warehouse data and respond
4. Try: "Show me all urgent orders"

### Action 5: Refresh Dashboard
1. Click "🔄 Refresh" button in top right
2. All data updates in real-time
3. Changes from order operations reflect immediately

---

## 📊 Demo Data Included

The system comes pre-loaded with realistic data:

### Products (6 items)
- Wireless Mouse (Zone A, 72 in stock)
- Mechanical Keyboard (Zone B, 19 in stock)
- HD Webcam (Zone C, OUT OF STOCK)
- USB-C Hub (Zone A, 27 in stock)
- Wireless Headset (Zone C, 44 in stock)
- 24-inch Monitor (Zone D, 16 in stock)

### Orders (7 items)
- ORD-1042: Priya Retail, Express delivery, 4h SLA, Critical priority
- ORD-1048: Tech Corner, Standard, 18h SLA, High priority
- ORD-1051: Startup Hub, Express, 9h SLA, Critical priority
- ... and 4 more

### Warehouse Exceptions
- Missing items from picking
- Damaged goods alert
- Stock count mismatches

---

## 🔧 If Something Doesn't Work

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt

# Recreate database
python seed.py

# Try again
python -m uvicorn app.main:app --reload
```

### Frontend won't start
```bash
# Clear everything
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend can't reach backend
- Verify backend is running on port 8000
- Check browser console (F12) for CORS errors
- Firewall may be blocking localhost:8000 (unlikely)

### Database errors
```bash
# Fresh start
python seed.py  # Recreates database
python -m uvicorn app.main:app --reload
```

---

## 🎓 How The System Works

### Priority Scoring Algorithm
Every order gets a score (0-100) based on:
- **Express Delivery**: +40 points
- **High Value Orders**: +25 points
- **Tight SLA (< 6 hours)**: +30 points

Higher scores = higher priority = processed first

### Allocation Process
1. System checks product availability
2. Reserves stock for the order
3. Updates order status
4. Reduces available inventory
5. Flags exceptions if can't fully allocate

### AI Copilot
- **Fast & Reliable**: Uses warehouse data directly
- **Rule-Based**: No external API needed by default
- **Optional Gemini**: Can integrate Google AI for more sophisticated responses
- **Fallback**: Always has reliable answer ready

---

## 📈 Production Deployment

When ready for production:

### Backend
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
npm run build      # Creates optimized dist/ folder
npm install -g serve
serve -s dist -l 3000
```

Then:
- Frontend serves from port 3000
- Backend serves from port 8000
- Configure reverse proxy (Nginx/Apache)
- Deploy to cloud (AWS/Azure/GCP)

---

## 💡 Tips for Success

1. **Keep Both Terminals Open**: You need backend + frontend running simultaneously
2. **Refresh Browser**: After making backend changes, refresh page (Ctrl+R / Cmd+R)
3. **Check Logs**: Errors appear in terminal output
4. **Try All Features**: Allocate orders, check inventory, ask copilot questions
5. **Change Data**: Edit seed.py to modify demo data and re-run `python seed.py`

---

## 🎯 Next Steps

1. ✅ **Start Both Servers** - Backend + Frontend
2. ✅ **Open Dashboard** - http://localhost:5173
3. ✅ **Explore Features** - Try allocating orders
4. ✅ **Ask AI Questions** - Use the copilot
5. ✅ **Read COMPLETION.md** - For detailed documentation
6. ✅ **Check API Docs** - http://127.0.0.1:8000/docs

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Start Backend | `python -m uvicorn app.main:app --reload` |
| Start Frontend | `npm run dev` |
| Recreate Database | `python seed.py` |
| Build Frontend | `npm run build` |
| View API Docs | http://127.0.0.1:8000/docs |
| Test API | `curl http://127.0.0.1:8000/api/dashboard` |

---

## 🎉 You're Ready!

Everything is set up, tested, and working. Just start the servers and explore!

**Questions?** Check COMPLETION.md for detailed documentation.

---

**WareSmart AI - Smart Warehouse Decision System** 🏭📊🤖
