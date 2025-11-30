#!/bin/bash

# ===========================================
# 🚀 Script de démarrage E-Commerce Complet
# ===========================================

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🛒 E-COMMERCE PLATFORM - DÉMARRAGE COMPLET              ║"
echo "║     Frontend + Backend + Monitoring + Logging               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Répertoire racine du projet
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Fonction pour vérifier si un port est utilisé
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Fonction pour tuer un processus sur un port
kill_port() {
    if check_port $1; then
        echo -e "${YELLOW}⚠️  Port $1 occupé, arrêt du processus...${NC}"
        lsof -ti :$1 | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Fonction pour vérifier si Docker est démarré
check_docker() {
    docker info > /dev/null 2>&1
    return $?
}

# ===========================================
# 1. NETTOYAGE DES PORTS
# ===========================================
echo -e "\n${CYAN}📋 Étape 1/5: Vérification des ports...${NC}"

kill_port 3001  # Backend
kill_port 5173  # Frontend Vite

echo -e "${GREEN}✅ Ports libérés${NC}"

# ===========================================
# 2. VÉRIFICATION DOCKER
# ===========================================
echo -e "\n${CYAN}🐳 Étape 2/5: Vérification de Docker...${NC}"

DOCKER_AVAILABLE=false
if command -v docker &> /dev/null; then
    if check_docker; then
        echo -e "${GREEN}✅ Docker est démarré${NC}"
        DOCKER_AVAILABLE=true
    else
        echo -e "${YELLOW}⚠️  Docker est installé mais pas démarré${NC}"
        echo -e "${YELLOW}   Tentative de démarrage de Docker Desktop...${NC}"
        open -a Docker 2>/dev/null
        
        # Attendre que Docker démarre (max 30 secondes)
        for i in {1..15}; do
            sleep 2
            if check_docker; then
                echo -e "${GREEN}✅ Docker démarré avec succès${NC}"
                DOCKER_AVAILABLE=true
                break
            fi
            echo -e "${YELLOW}   Attente du démarrage de Docker... ($i/15)${NC}"
        done
        
        if [ "$DOCKER_AVAILABLE" = false ]; then
            echo -e "${RED}❌ Docker n'a pas pu démarrer - Monitoring ignoré${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Docker non installé - Monitoring ignoré${NC}"
fi

# ===========================================
# 3. INSTALLATION DES DÉPENDANCES
# ===========================================
echo -e "\n${CYAN}📦 Étape 3/5: Installation des dépendances...${NC}"

# Backend
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances backend...${NC}"
    cd backend && npm install && cd ..
else
    echo -e "${GREEN}✅ Dépendances backend OK${NC}"
fi

# Frontend
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances frontend...${NC}"
    cd frontend && npm install && cd ..
else
    echo -e "${GREEN}✅ Dépendances frontend OK${NC}"
fi

# ===========================================
# 4. DÉMARRAGE DES SERVICES
# ===========================================
echo -e "\n${CYAN}🚀 Étape 4/5: Démarrage des services...${NC}"

# Créer le dossier logs s'il n'existe pas
mkdir -p backend/logs

# Démarrer le Backend
echo -e "${BLUE}🔧 Démarrage du Backend (port 3001)...${NC}"
cd backend
nohup npm start > logs/backend-startup.log 2>&1 &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
for i in {1..10}; do
    sleep 1
    if check_port 3001; then
        echo -e "${GREEN}✅ Backend démarré (PID: $BACKEND_PID)${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Erreur démarrage Backend - Voir backend/logs/backend-startup.log${NC}"
        cat backend/logs/backend-startup.log
    fi
done

# Démarrer le Frontend
echo -e "${BLUE}🎨 Démarrage du Frontend (port 5173)...${NC}"
cd frontend
nohup npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

# Attendre que le frontend démarre
for i in {1..10}; do
    sleep 1
    if check_port 5173; then
        echo -e "${GREEN}✅ Frontend démarré (PID: $FRONTEND_PID)${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Erreur démarrage Frontend${NC}"
    fi
done

# Démarrer Prometheus + Grafana (Monitoring)
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo -e "${BLUE}📊 Démarrage du Monitoring (Prometheus + Grafana)...${NC}"
    docker-compose -f docker-compose.monitoring.yml up -d 2>/dev/null
    
    # Attendre que le monitoring démarre
    for i in {1..10}; do
        sleep 1
        if check_port 9090 && check_port 3000; then
            echo -e "${GREEN}✅ Monitoring démarré (Prometheus: 9090, Grafana: 3000)${NC}"
            break
        fi
        if [ $i -eq 10 ]; then
            echo -e "${YELLOW}⚠️  Monitoring partiellement démarré - Vérifiez Docker${NC}"
        fi
    done
fi

# ===========================================
# 5. RÉSUMÉ
# ===========================================
echo -e "\n${CYAN}📋 Étape 5/5: Résumé...${NC}"

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🎉 SERVICES DÉMARRÉS                      ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  🎨 Frontend (React)     : http://localhost:5173             ║"
echo "║  🔧 Backend (Node.js)    : http://localhost:3001             ║"
if [ "$DOCKER_AVAILABLE" = true ]; then
echo "║  📊 Grafana Dashboard    : http://localhost:3000             ║"
echo "║     └─ Login: admin / admin123                               ║"
echo "║  📈 Prometheus           : http://localhost:9090             ║"
fi
echo "║  🔍 Métriques API        : http://localhost:3001/metrics     ║"
echo "║  💚 Health Check         : http://localhost:3001/health      ║"
echo "║                                                              ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  📁 Logs: backend/logs/                                      ║"
echo "║     ├─ combined-*.log   (tous les logs)                      ║"
echo "║     ├─ error-*.log      (erreurs uniquement)                 ║"
echo "║     ├─ access-*.log     (requêtes HTTP)                      ║"
echo "║     └─ audit-*.log      (actions utilisateurs)               ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  🛑 Pour arrêter: ./stop-all.sh                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Sauvegarder les PIDs pour l'arrêt
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo -e "${GREEN}🚀 Plateforme E-Commerce prête !${NC}"
echo -e "${YELLOW}Appuyez sur Ctrl+C pour voir les logs en temps réel ou ouvrez un navigateur.${NC}"
