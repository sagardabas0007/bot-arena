#!/usr/bin/env python3
"""
Bot Arena Agent API Demo
Registers 10 agents, fills a game, and races them through all 3 levels.
Moves are interleaved round-robin with shuffle to avoid gridlock.
"""

import requests
import time
import random

BASE = "http://localhost:5001/api/agent"

def hdr(key):
    return {"x-agent-key": key, "Content-Type": "application/json"}

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def subsection(title):
    print(f"\n{'─'*60}")
    print(f"  {title}")
    print(f"{'─'*60}")

# ──────────────────────────────────────────────
section("BOT ARENA - FULL GAME DEMO")
# ──────────────────────────────────────────────

agents = []
print("\n>>> Registering 10 agents...")
for i in range(10):
    name = f"racer-{i:02d}"
    r = requests.post(f"{BASE}/register", json={"name": name, "description": f"Demo racer #{i}"})
    d = r.json()["data"]
    agents.append({"name": name, "apiKey": d["apiKey"], "botId": d["botId"], "id": d["id"]})
    print(f"  {name} registered")
main = agents[0]

# Profile
section("AGENT PROFILE")
r = requests.get(f"{BASE}/me", headers=hdr(main["apiKey"]))
p = r.json()["data"]
print(f"  Name: {p['name']}  |  Skill: {p['skillRating']}  |  Bot: {p['botId'][:8]}...")

# List arenas
section("AVAILABLE ARENAS")
r = requests.get(f"{BASE}/arenas", headers=hdr(main["apiKey"]))
arenas = r.json()["data"]
for a in arenas:
    tag = " *" if a.get("recommended") else ""
    print(f"  T{a['tier']}: {a['name']:<20} {a['difficulty']:<10} {a['gridRows']}x{a['gridCols']}  ${a['entryFee']}{tag}")
arena_id = arenas[0]["id"]
print(f"\n  >>> Selected: {arenas[0]['name']}")

# Create game, all 10 join
section("CREATE GAME & JOIN ALL 10")
r = requests.post(f"{BASE}/games/create-and-join", headers=hdr(main["apiKey"]), json={"arenaId": arena_id})
game_id = r.json()["data"]["gameId"]
print(f"  Game: {game_id[:16]}...")
print(f"  {main['name']} joined (1/10)")
for agent in agents[1:]:
    r = requests.post(f"{BASE}/games/join", headers=hdr(agent["apiKey"]), json={"gameId": game_id})
    jd = r.json()["data"]
    extra = " >>> AUTO-STARTED!" if jd.get("autoStarted") else ""
    print(f"  {agent['name']} joined ({jd['participantCount']}/10){extra}")

# Show initial state and grid
section("LEVEL 1 - INITIAL STATE")
r = requests.get(f"{BASE}/games/{game_id}/state", headers=hdr(main["apiKey"]))
state = r.json()["data"]
live = state.get("liveData", {})
print(f"  Status: {state['status']}  |  Grid: {state['arena']['gridRows']}x{state['arena']['gridCols']}")
print(f"  Start: (0,0)  Goal: ({live['endPosition']['x']},{live['endPosition']['y']})  Time: {state['arena']['timeLimit']}s")
if live.get("grid"):
    print(f"\n  Grid (0=open 1=wall 2=start 3=goal):")
    for row in live["grid"]:
        print(f"    {''.join(str(c) for c in row)}")
r = requests.get(f"{BASE}/games/{game_id}/path", headers=hdr(main["apiKey"]))
pd = r.json()["data"]
print(f"\n  Optimal path: {pd['stepsRemaining']} steps")
print(f"  Route: {' '.join(pd['directions'])}")


def get_safe_alt_dirs(agent, game_id, blocked_dir):
    """Get directions that won't collide with obstacles by checking the grid."""
    r = requests.get(f"{BASE}/games/{game_id}/state", headers=hdr(agent["apiKey"]))
    s = r.json()["data"]
    if not s.get("liveData") or not s["liveData"].get("myPosition"):
        return []
    pos = s["liveData"]["myPosition"]
    grid = s["liveData"]["grid"]
    rows, cols = len(grid), len(grid[0])

    deltas = {"up": (0, -1), "down": (0, 1), "left": (-1, 0), "right": (1, 0)}
    safe = []
    for d, (dx, dy) in deltas.items():
        if d == blocked_dir:
            continue
        nx, ny = pos["x"] + dx, pos["y"] + dy
        if 0 <= nx < cols and 0 <= ny < rows and grid[ny][nx] != 1:
            safe.append(d)
    return safe


def play_level_interleaved(level_num, agents, game_id):
    subsection(f"LEVEL {level_num} - RACING!")

    stats = {a["name"]: {"moves": 0, "collisions": 0, "finished": False, "eliminated": False, "ft": None}
             for a in agents}
    active = list(agents)
    path_cache = {}

    max_rounds = 300
    for round_num in range(max_rounds):
        if not active:
            break

        # Shuffle order each round to break deadlocks
        random.shuffle(active)
        still_active = []

        for agent in active:
            name = agent["name"]

            # Quick state check
            r = requests.get(f"{BASE}/games/{game_id}/state", headers=hdr(agent["apiKey"]))
            s = r.json()["data"]

            if s["agent"]["eliminated"]:
                stats[name]["eliminated"] = True
                continue
            if not s.get("liveData"):
                continue
            if s["liveData"].get("finished"):
                if not stats[name]["finished"]:
                    stats[name]["finished"] = True
                    stats[name]["ft"] = s["liveData"].get("finishTime")
                continue

            # Get/refresh path if needed
            if name not in path_cache or not path_cache[name]:
                r = requests.get(f"{BASE}/games/{game_id}/path", headers=hdr(agent["apiKey"]))
                dirs = r.json()["data"].get("directions", [])
                path_cache[name] = dirs
            dirs = path_cache.get(name, [])
            if not dirs:
                still_active.append(agent)
                continue

            # Attempt one move along the optimal path
            d = dirs[0]
            r = requests.post(f"{BASE}/games/{game_id}/move",
                headers=hdr(agent["apiKey"]), json={"direction": d})
            resp = r.json()
            if not resp["success"]:
                still_active.append(agent)
                continue

            result = resp["data"]
            stats[name]["moves"] += 1

            if result.get("isCollision"):
                stats[name]["collisions"] += 1
                path_cache.pop(name, None)
                still_active.append(agent)
            elif result.get("blocked"):
                # Try a SAFE alternate direction (no obstacle)
                safe_alts = get_safe_alt_dirs(agent, game_id, d)
                random.shuffle(safe_alts)
                moved = False
                for alt in safe_alts:
                    r2 = requests.post(f"{BASE}/games/{game_id}/move",
                        headers=hdr(agent["apiKey"]), json={"direction": alt})
                    r2j = r2.json()
                    if r2j.get("success") and r2j["data"].get("success"):
                        stats[name]["moves"] += 1
                        moved = True
                        if r2j["data"].get("finished"):
                            stats[name]["finished"] = True
                            stats[name]["ft"] = r2j["data"].get("finishTime")
                        break
                path_cache.pop(name, None)  # re-plan from new position
                if not stats[name]["finished"]:
                    still_active.append(agent)
            elif result.get("finished"):
                stats[name]["finished"] = True
                stats[name]["ft"] = result.get("finishTime")
                path_cache.pop(name, None)
            else:
                path_cache[name] = dirs[1:]
                still_active.append(agent)

        active = still_active
        finished_count = sum(1 for s in stats.values() if s["finished"])
        if round_num > 0 and round_num % 30 == 0:
            print(f"  ... round {round_num}: {finished_count}/{len(agents)} finished, {len(active)} still racing")

    # Results
    print(f"\n  {'Agent':<12} {'Result':<8} {'Moves':<7} {'Hits':<6} {'Time':<10}")
    print(f"  {'─'*46}")
    ordered = sorted(stats.items(), key=lambda x: (
        not x[1]["finished"], x[1]["ft"] or 999999,
    ))
    for name, s in ordered:
        res = "ELIM" if s["eliminated"] else ("DONE" if s["finished"] else "DNF")
        ft = f"{s['ft']}ms" if s['ft'] else "-"
        print(f"  {name:<12} {res:<8} {s['moves']:<7} {s['collisions']:<6} {ft:<10}")

    time.sleep(0.3)
    r = requests.get(f"{BASE}/games/{game_id}/state", headers=hdr(agents[0]["apiKey"]))
    st = r.json()["data"]
    print(f"\n  >>> Status: {st['status']} (level {st['currentLevel']})")
    return st


# Play all 3 levels
state = play_level_interleaved(1, agents, game_id)
if state["status"] == "LEVEL_2":
    state = play_level_interleaved(2, agents, game_id)
if state["status"] == "LEVEL_3":
    state = play_level_interleaved(3, agents, game_id)

# ──────────────────────────────────────────────
section("FINAL LEADERBOARD")
# ──────────────────────────────────────────────
r = requests.get(f"{BASE}/games/{game_id}/leaderboard", headers=hdr(main["apiKey"]))
lb = r.json()["data"]
print(f"  Status: {lb['status']}  |  Prize: ${lb['prizePool']}  |  My Rank: #{lb['myRank']}")
print()
print(f"  {'#':<4} {'Agent':<12} {'Pos':<5} {'Hits':<6} {'Status':<16}")
print(f"  {'─'*46}")
for i, e in enumerate(lb["rankings"]):
    elim = f"Elim Lvl {e['eliminatedAt']}" if e["eliminated"] else "Winner!" if e["position"] == 1 and lb["status"] == "COMPLETED" else "Active"
    me = " <<<" if e["isMe"] else ""
    print(f"  {i+1:<4} {e['username']:<12} {e['position']:<5} {e['collisions']:<6} {elim:<16}{me}")

if lb["status"] == "COMPLETED":
    r = requests.get(f"{BASE}/games/{game_id}/state", headers=hdr(main["apiKey"]))
    final = r.json()["data"]
    if final.get("winner"):
        w = final["winner"]
        tag = " (THAT'S YOU!)" if w.get("isMe") else ""
        print(f"\n  WINNER: {w.get('username', '???')}{tag}")

section("FINAL STATS (racer-00)")
r = requests.get(f"{BASE}/stats", headers=hdr(main["apiKey"]))
st = r.json()["data"]
print(f"  Skill: {st['agent']['skillRating']}  |  Games: {st['stats']['totalGames']}  |  Wins: {st['stats']['wins']}  |  Rate: {st['stats']['winRate']}%")
print(f"  Collisions: {st['stats']['totalCollisions']}  |  Earnings: ${st['stats']['totalEarnings']}")

section("DEMO COMPLETE!")
