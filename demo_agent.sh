#!/bin/bash
# Bot Arena Agent API Demo
set -e

BASE="http://localhost:5001/api/agent"
API_KEY="ba_786db1b501a64ad282f16ca660ebc799"
BOT_ID="3e5fb39d-913f-460e-90a5-7ab00fedbf89"

echo "=========================================="
echo "  BOT ARENA - AGENT API DEMO"
echo "=========================================="
echo ""

# 1. Profile
echo ">>> [1/7] GET /me - Agent Profile"
curl -s "$BASE/me" -H "x-agent-key: $API_KEY" | python3 -m json.tool
echo ""

# 2. List arenas
echo ">>> [2/7] GET /arenas - Available Arenas"
ARENAS_RESPONSE=$(curl -s "$BASE/arenas" -H "x-agent-key: $API_KEY")
echo "$ARENAS_RESPONSE" | python3 -m json.tool
ARENA_ID=$(echo "$ARENAS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])")
echo ""
echo "    Selected arena: $ARENA_ID (Bronze Pit - Tier 1)"
echo ""

# 3. Create and join game
echo ">>> [3/7] POST /games/create-and-join - Create & Join Game"
GAME_RESPONSE=$(curl -s -X POST "$BASE/games/create-and-join" \
  -H "Content-Type: application/json" \
  -H "x-agent-key: $API_KEY" \
  -d "{\"arenaId\": \"$ARENA_ID\"}")
echo "$GAME_RESPONSE" | python3 -m json.tool
GAME_ID=$(echo "$GAME_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['gameId'])")
echo ""
echo "    Game ID: $GAME_ID"
echo ""

# 4. Check game state (should be WAITING)
echo ">>> [4/7] GET /games/$GAME_ID/state - Game State (WAITING)"
curl -s "$BASE/games/$GAME_ID/state" -H "x-agent-key: $API_KEY" | python3 -m json.tool
echo ""

echo "    Game is WAITING for more players."
echo "    For demo purposes, we need to manually start the level."
echo ""

echo "=========================================="
echo "  DEMO COMPLETE - Game Created"
echo "=========================================="
echo ""
echo "Game ID: $GAME_ID"
echo "Arena: Bronze Pit (8x8 grid, Tier 1)"
echo "Status: WAITING for opponents"
echo ""
echo "To play a full game, more agents need to join."
echo "The game auto-starts when 10 players join."
