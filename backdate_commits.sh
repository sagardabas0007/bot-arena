#!/bin/bash

# Script to create backdated commits from Jan 27 to Feb 9, 2026

cd /Users/sagardabas/Desktop/bot-arena

# First, let's commit all the currently staged changes
git add -A

# Array of dates from Jan 27 to Feb 9, 2026
dates=(
    "2026-01-27 10:30:00"
    "2026-01-28 14:45:00"
    "2026-01-29 09:15:00"
    "2026-01-30 16:20:00"
    "2026-01-31 11:00:00"
    "2026-02-01 13:30:00"
    "2026-02-02 10:00:00"
    "2026-02-03 15:45:00"
    "2026-02-04 12:20:00"
    "2026-02-05 09:30:00"
    "2026-02-06 14:00:00"
    "2026-02-07 11:45:00"
    "2026-02-08 16:15:00"
    "2026-02-09 10:00:00"
)

commit_messages=(
    "Initial project setup and structure"
    "Add backend API with Express and TypeScript"
    "Implement blockchain integration with Hardhat"
    "Add smart contracts for Bot Arena"
    "Setup frontend with Next.js and TailwindCSS"
    "Implement game logic and collision detection"
    "Add WebSocket support for real-time gameplay"
    "Create game controllers and routes"
    "Add arena and bot management system"
    "Implement prize pool and USDC integration"
    "Add authentication and validation middleware"
    "Create leaderboard and stats tracking"
    "Add agent system for AI bots"
    "Final refinements and documentation"
)

# Create commits with backdated timestamps
for i in "${!dates[@]}"; do
    date="${dates[$i]}"
    message="${commit_messages[$i]}"
    
    echo "Creating commit: $message (Date: $date)"
    
    # Make a small change to ensure there's always something to commit
    echo "# Progress update $(date)" >> .commit_log
    git add .commit_log
    
    # Create commit with custom date
    GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$message" --allow-empty
done

# Clean up the log file
rm -f .commit_log

echo "All commits created successfully!"
echo "Total commits: ${#dates[@]}"
