#!/bin/bash
# CDGI No-Dues Portal - Quick Setup Script

echo "╔════════════════════════════════════════════════════╗"
echo "║   CDGI No-Dues Portal - Initialization Setup      ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo -e "${YELLOW}[1/5]${NC} Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 16+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version) found${NC}"

# Step 2: Install dependencies
echo ""
echo -e "${YELLOW}[2/5]${NC} Installing dependencies..."
if npm install; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Step 3: Setup environment file
echo ""
echo -e "${YELLOW}[3/5]${NC} Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp server/.env.example .env
    echo -e "${GREEN}✓ Created .env file from template${NC}"
    echo -e "${YELLOW}  ⚠ Please edit .env with your configuration:${NC}"
    echo "    - MONGO_URI (local or MongoDB Atlas)"
    echo "    - EMAIL_USER, EMAIL_PASS (Gmail or other)"
    echo "    - JWT_SECRET (change to secure random value)"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Step 4: Setup frontend env
echo ""
echo -e "${YELLOW}[4/5]${NC} Setting up frontend environment..."
if [ ! -f "client/.env.local" ]; then
    echo "VITE_API_URL=http://localhost:3000" > client/.env.local
    echo -e "${GREEN}✓ Created client/.env.local${NC}"
else
    echo -e "${GREEN}✓ client/.env.local already exists${NC}"
fi

# Step 5: Final instructions
echo ""
echo -e "${YELLOW}[5/5]${NC} Setup complete!"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✓ Setup Complete - Ready to Run!           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure .env file:"
echo "   ${YELLOW}Edit .env file with your MongoDB and email settings${NC}"
echo ""
echo "2. Start MongoDB (if using local):"
echo "   ${YELLOW}mongod${NC} (or start MongoDB service)"
echo ""
echo "3. Open two terminals:"
echo ""
echo "   Terminal 1 - Start Backend:"
echo "   ${YELLOW}npm run backend:dev${NC}"
echo "   Should show: 🚀 CDGI No-Dues Backend Server running on http://localhost:3000"
echo ""
echo "   Terminal 2 - Start Frontend:"
echo "   ${YELLOW}cd client && npm run dev${NC}"
echo "   Should show: Local: http://localhost:5173"
echo ""
echo "4. Open in browser:"
echo "   ${YELLOW}http://localhost:5173${NC}"
echo ""
echo "5. Test the system:"
echo "   - Register new student account"
echo "   - Verify email"
echo "   - Login as student, faculty, or admin"
echo "   - Test complete no-dues workflow"
echo ""
echo "📚 Documentation:"
echo "   - Backend: ${YELLOW}BACKEND_README.md${NC}"
echo "   - Setup:   ${YELLOW}SETUP_GUIDE.md${NC}"
echo ""
echo "✨ Happy coding!"
echo ""
