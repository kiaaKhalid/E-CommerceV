#!/bin/bash

# ===========================================
# 🛑 Script d'arrêt E-Commerce Complet
# ===========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          🛑 ARRÊT DE TOUS LES SERVICES                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Arrêter le Backend
echo -e "${YELLOW}🔧 Arrêt du Backend...${NC}"
if [ -f .backend.pid ]; then
    kill $(cat .backend.pid) 2>/dev/null
    rm .backend.pid
fi
lsof -ti :3001 | xargs kill -9 2>/dev/null
echo -e "${GREEN}✅ Backend arrêté${NC}"

# Arrêter le Frontend
echo -e "${YELLOW}🎨 Arrêt du Frontend...${NC}"
if [ -f .frontend.pid ]; then
    kill $(cat .frontend.pid) 2>/dev/null
    rm .frontend.pid
fi
lsof -ti :5173 | xargs kill -9 2>/dev/null
echo -e "${GREEN}✅ Frontend arrêté${NC}"

# Arrêter le Monitoring Docker
echo -e "${YELLOW}📊 Arrêt du Monitoring...${NC}"
if command -v docker &> /dev/null; then
    docker-compose -f docker-compose.monitoring.yml down 2>/dev/null
    echo -e "${GREEN}✅ Monitoring arrêté${NC}"
else
    echo -e "${YELLOW}⚠️  Docker non disponible${NC}"
fi

echo -e "\n${GREEN}🛑 Tous les services ont été arrêtés.${NC}"
