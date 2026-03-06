#!/bin/bash
set -e

echo "🏕️ Camp Work - Raspberry Pi Setup"
echo "=================================="

# Docker installieren (falls nicht vorhanden)
if ! command -v docker &> /dev/null; then
    echo "📦 Docker installieren..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "⚠️  Bitte neu einloggen damit Docker-Gruppenberechtigung greift."
    echo "   Dann dieses Script erneut ausführen."
    exit 0
fi

# Docker Compose Plugin prüfen
if ! docker compose version &> /dev/null; then
    echo "📦 Docker Compose Plugin installieren..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

# Verzeichnis erstellen
mkdir -p ~/camp-work
cd ~/camp-work

# docker-compose.yml herunterladen
echo "📥 docker-compose.yml herunterladen..."
curl -fsSL https://raw.githubusercontent.com/PhilKsr/camp-work/main/docker-compose.yml -o docker-compose.yml

# .env Datei erstellen
if [ ! -f .env ]; then
    echo "🔑 Bitte MapTiler API Key eingeben:"
    read -r MAPTILER_KEY
    echo "NEXT_PUBLIC_MAPTILER_KEY=$MAPTILER_KEY" > .env
    echo "PORT=3000" >> .env
fi

# GHCR Login
echo "🔐 GitHub Container Registry Login..."
echo "   (GitHub Personal Access Token mit 'read:packages' Berechtigung nötig)"
docker login ghcr.io

# Container starten
echo "🚀 Camp Work starten..."
docker compose pull
docker compose up -d

echo ""
echo "✅ Camp Work läuft auf http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📡 Für Tailscale-Zugriff:"
echo "   sudo tailscale up"
echo "   Dann erreichbar unter: http://$(hostname).tailnet-name:3000"
echo ""
echo "🔄 Automatische Updates sind via Watchtower aktiviert."
echo "   Neue Versionen werden stündlich geprüft."