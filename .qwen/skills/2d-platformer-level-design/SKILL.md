---
name: 2d-platformer-level-design
description: Best practices for designing 2D platformer levels with proper platform heights, varied routes, and meaningful hazards
source: auto-skill
extracted_at: '2026-06-09T17:31:25.206Z'
---

# 2D Platformer Level Design Guidelines

## Platform Height Calculations

**Critical:** Calculate maximum jump height before placing platforms.

Formula: `max_height = (jumpForce²) / (2 * gravity)`

Example:
- jumpForce = -11, gravity = 0.55
- max_height = (11²) / (2 * 0.55) = 110px

**Rule:** Platform height differences should be ≤ 90-95% of max jump height to account for player positioning and timing.

## Level Structure

### Avoid Repetitive Patterns
- Don't create identical sections repeated N times
- Vary platform heights, widths, and spacing
- Create distinct areas with different challenges

### Multiple Routes
Provide 2-3 paths through each level:
- **Lower route:** Ground level, often faster but with more enemies
- **Middle route:** Moderate platforms, balanced risk/reward
- **Upper route:** Harder to reach, bonus coins/rewards

### Platform Placement
- **Stagger platforms vertically:** Don't place them directly above each other (blocks jumps)
- **Create natural flow:** Ascend → traverse → descend pattern
- **Ensure reachability:** Test that each platform can be reached from adjacent ones
- **Vary spacing:** Mix short and long horizontal gaps

## Hazard Placement

### Spikes/Obstacles
**Only place on platforms where they create actual danger:**
- On ground sections between gaps
- On wider platforms to create obstacles
- Near platform edges to challenge precision

**Never place:**
- Over bottomless pits (falling kills anyway)
- Where they serve no gameplay purpose

### Enemy Placement
- **Walker:** On ground and wide platforms
- **Flyer:** In air between platforms, varying heights
- **Jumper:** On platforms with vertical space above

## Boss Fight Design

### Platform Requirements
- Boss should be reachable from multiple platforms
- Platforms at varying heights for different attack patterns
- Ensure player can jump ONTO boss (not just at it)
- Provide escape routes from boss attacks

### Boss Height
- Position boss so player can stomp from nearby platforms
- Test jump trajectory from all player-accessible platforms

## Common Pitfalls

1. **Platforms too high:** Player can't reach them
2. **Blocked jumps:** Platform above another prevents jumping up
3. **Repetitive design:** Same pattern copied 4x feels lazy
4. **Meaningless hazards:** Spikes over pits add nothing
5. **Unreachable boss:** Player can't jump high enough to hit it

## Testing Checklist

- [ ] Can player reach every platform?
- [ ] Are there multiple routes through the level?
- [ ] Do hazards create actual danger?
- [ ] Is the boss reachable and beatable?
- [ ] Does the level feel varied, not repetitive?
- [ ] Are jump heights consistent with physics?
