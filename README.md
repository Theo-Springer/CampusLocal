# Campus Connect

Application de démonstration Campus Connect avec interface front, backend local Python et persistance dans un fichier JSON.

## Lancement

Le plus simple est de double-cliquer sur `start.bat`.

Ce script :
- démarre le backend Python dans `back/server.py`
- ouvre automatiquement le site dans le navigateur
- écrit les logs dans `logs/server.log`

## Comptes de test

- Compte classique : `demo@campus.local` / `demo123`
- Compte admin : `admin@campus.local` / `admin123`

## Structure

- `front/` : interface web statique
- `back/` : serveur Python et données persistantes
- `logs/` : journaux de lancement
- `start.bat` : lanceur Windows pour les personnes non techniques

## Remarques

- Ne lance qu'une seule instance du backend en même temps.
- Le fichier de données est stocké dans `back/data/app-data.json`.