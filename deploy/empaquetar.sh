#!/usr/bin/env bash
# Empaqueta lo que necesitan el servidor y el Controlador (PC): mollendo-api,
# mollendo-portal y deploy, tal como están en la carpeta del proyecto (con los
# cambios sin commit), SIN documentos (.md) ni las guías de Prisma para IA.
#
# En la PC, en la carpeta del proyecto (Git Bash):
#   bash deploy/empaquetar.sh                  → crea mollendo.tgz
#   bash deploy/empaquetar.sh /ruta/otro.tgz   → con otro nombre
set -euo pipefail

cd "$(dirname "$0")/.."
SALIDA="${1:-$PWD/mollendo.tgz}"
INDICE="$(mktemp)"
trap 'rm -f "$INDICE"' EXIT

# Un índice aparte: incluye los cambios sin commit sin tocar el índice del proyecto.
export GIT_INDEX_FILE="$INDICE"
git read-tree HEAD
git add -A mollendo-api mollendo-portal deploy 2>/dev/null
ARBOL="$(git write-tree)"
unset GIT_INDEX_FILE

git archive --format=tar.gz -o "$SALIDA" "$ARBOL" -- mollendo-api mollendo-portal deploy \
  ':(exclude,glob)**/*.md' ':(exclude)mollendo-api/.agents' ':(exclude)mollendo-api/skills-lock.json'
echo "Paquete: $SALIDA ($(du -h "$SALIDA" | cut -f1))"
