Bash
#!/bin/bash

# Déplacement dans le dossier où se trouve le script
cd "$(dirname "$0")"

# Création des dossiers si nécessaires
mkdir -p "logs"
mkdir -p "back/data"

# Vérification de l'environnement virtuel Python (adapté pour Mac : bin/python)
if [ ! -f ".venv/bin/python" ]; then
    echo "Virtualenv introuvable. Tentative de creation de .venv..."
    # Try python3 then python
    if command -v python3 >/dev/null 2>&1; then
        python3 -m venv .venv
    elif command -v python >/dev/null 2>&1; then
        python -m venv .venv
    else
        echo "Aucun interpreteur Python trouve. Installez Python 3 puis relancez."
        read -p "Appuyez sur Entrée pour quitter..."
        exit 1
    fi
    # upgrade pip if available
    if [ -f ".venv/bin/pip" ]; then
        .venv/bin/pip install --upgrade pip >/dev/null 2>&1 || echo "pip update failed"
    fi
    echo "Virtualenv cree."
fi

# Lancement du serveur en arrière-plan et redirection des logs
.venv/bin/python back/server.py > logs/server.log 2>&1 &

# Pause de 2 secondes
sleep 2

# Ouverture du navigateur par défaut sur l'adresse locale
open "http://127.0.0.1:3000/"

echo ""
echo "Campus Connect est lancé."
echo "Fermez cette fenêtre pour arrêter le lancement."

# Maintient le terminal ouvert (équivalent de pause)
read -p "Appuyez sur Entrée pour quitter..."