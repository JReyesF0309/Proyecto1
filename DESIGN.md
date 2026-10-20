# LA DEXÍADA — GAME DESIGN DOCUMENT

**Version:** 0.1 — Combat Prototype  
**Document Status:** Initial Implementation Specification  
**Target Platform:** PC  
**Genre:** Turn-Based RPG with Real-Time Directional Defense  
**Visual Perspective:** 2D character-based combat  
**Prototype Scope:** One playable character, one boss, one arena, and one complete combat encounter.

---

# 1. GAME OVERVIEW

## 1.1. Game Description

*La Dexíada* is a fantasy RPG inspired by Greek mythology, set in Xantharchía, a world where gods, divine heirs, and mortals coexist within a society shaped by magic.

The combat system combines turn-based strategic attacks with real-time directional defense. Players choose attacks during their turn but must react to incoming enemy attacks by identifying their direction and pressing the corresponding defensive key.

The player controls Dexios, a fighter who specializes in close combat and lightning, in a battle against Iobrontes, God of Thunder and the twelfth heir of Zeus.

The prototype aims to demonstrate the core combat loop, directional attack recognition, defensive timing, character animations, resource management, and the game's visual identity.

## 1.2. Prototype Objectives

The prototype must:

- Implement a complete battle that ends in victory or defeat.
- Allow the player to select and perform three unique attacks with Dexios.
- Implement four directional attacks for Iobrontes.
- Include directional defense with two successful outcomes: imperfect block and perfect parry.
- Display health, mana, and Chaos energy resources.
- Implement basic idle, attack, defense, damage, victory, and defeat animations.
- Establish the 2D art direction and user interface for future development.

## 1.3. Out of Scope

This prototype will not include exploration, interactive dialogue, inventory, character progression, additional playable characters, multiple arenas, equipment selection, or a complete save system.

The focus is exclusively on delivering one functional and visually representative combat encounter.

# 2. SETTING AND ART DIRECTION

## 2.1. Arena: Temple of Iobrontes

The battle takes place inside a Greek temple dedicated to Iobrontes.

The arena must convey the solemnity of a sacred place and the presence of a deity associated with lightning and storms.

The environment will include:

- Classical Greek-inspired architecture, including columns and stone structures.
- A statue of Iobrontes placed in the background.
- Banners and flags displaying the god's personal symbol.
- Decorative reliefs and architectural ornaments inspired by lightning and thunderstorms.
- An opening in the background revealing a gray, stormy sky filled with dark clouds.
- Cool ambient lighting, with possible purple lightning flashes illuminating parts of the temple.

The environment will remain mostly static during combat. Optional environmental animations may include distant lightning, subtle changes in illumination, and gently moving banners.

## 2.2. Visual Style

The game will use hand-drawn 2D illustrations and animations, following the visual style of the reference images that will be attached at the end of this document.

The art style does not need to resemble pixel art. The pixel dimensions specified below refer to the resolution of the graphical assets, not to their visual style.

Characters must have readable silhouettes, clearly distinguishable magical effects, and animations that allow the player to recognize attacks and defensive actions.

### Recommended Resolution

The target display resolution is **1920 × 1080 pixels, with a 16:9 aspect ratio**.

Recommended starting dimensions for graphical assets:

| Asset | Recommended Dimensions |
|---|---|
| Temple background | 1920 × 1080 px |
| Dexios character canvas | Approximately 512 × 1024 px |
| Iobrontes character canvas | Approximately 768 × 1024 px |
| Lightning effects | 256 × 256 to 512 × 512 px, depending on the effect |
| Attack icons | 128 × 128 px |
| Major UI elements | Approximately 128–512 px wide, depending on function |

Character frames should be exported as transparent PNG files when using frame-by-frame animation. The proposed dimensions are guidelines; the original proportions of each character and effect must be preserved.

Character assets should be produced at a resolution that allows them to appear approximately 600–750 pixels tall on screen without noticeable loss of quality.

## 2.3. Screen Composition

Dexios will appear in the foreground, with his back facing the camera and his body oriented toward Iobrontes. He will preferably occupy the left side of the screen.

Iobrontes will stand opposite Dexios, facing him from a slightly greater distance. His posture must be upright, solemn, and imposing to emphasize his status as a divine boss.

The relative character sizes should make Iobrontes feel powerful without obstructing the readability of his attacks.

The user interface must be positioned so that it does not obscure essential character animations or directional attack indicators.

# 3. CHARACTERS

## 3.1. Dexios — Playable Character

Dexios is the only playable character in the prototype.

### Starting Statistics

| Attribute | Starting Value | Maximum Value |
|---|---:|---:|
| Health | 100 | 100 |
| Mana | 100 | 100 |
| Chaos Energy | 0 | 100 |

Dexios will begin combat in a stable fighting stance.

His left foot will be positioned forward and his right foot behind. His left arm will be extended forward defensively, while his right arm will remain farther back, ready to strike.

The pose must communicate readiness for combat and allow smooth transitions into offensive and defensive animations.

### Required Animations

1. **Idle:** Subtle breathing, slight shoulder movement, and small weight shifts while maintaining the fighting stance.
2. **Triple Lightning:** Three consecutive close-combat strikes accompanied by yellow lightning.
3. **Electric Arc:** Dexios gathers a white electrical charge between both hands and releases an electric arc toward Iobrontes.
4. **Chaotic Lightning:** Dexios concentrates Chaos energy and performs a punch surrounded by red lightning.
5. **High Defense:** A defensive movement against an incoming attack from above.
6. **Left Defense:** A defensive movement against an incoming attack from the left.
7. **Right Defense:** A defensive movement against an incoming attack from the right.
8. **Defensive Jump:** A jump intended to evade an attack coming from below.
9. **Perfect Parry:** A faster, more forceful defensive response accompanied by a distinctive visual effect indicating that the attack has been avoided and countered.
10. **Hit Reaction:** A brief reaction when Dexios takes damage.
11. **Victory:** A short animation indicating that Dexios has defeated the boss.
12. **Defeat:** An animation showing Dexios falling or becoming unable to continue fighting.

Defense and parry animations may share animation frames where appropriate, provided that the visual feedback clearly distinguishes an imperfect block from a perfect parry.

## 3.2. Iobrontes — Boss Character

Iobrontes is the boss of the encounter and cannot be controlled by the player.

His posture will be upright, solemn, and confident. He must communicate divine authority and superiority, even when taking damage.

### Starting Statistics

| Attribute | Starting Value | Maximum Value |
|---|---:|---:|
| Health | 200 | 200 |

### Required Animations

1. **Idle:** Minimal breathing or body movement while maintaining a majestic posture.
2. **Left-Side Attack:** Preparation and release of a purple lightning attack originating from the left.
3. **Right-Side Attack:** Preparation and release of a purple lightning attack originating from the right.
4. **Top Attack:** A purple lightning strike descending from above.
5. **Bottom Attack:** A purple lightning strike emerging from below.
6. **Hit Reaction:** A brief reaction when struck by Dexios.
7. **Defeat:** An animation indicating that Iobrontes has lost the battle.

All four attacks must share a consistent visual identity while remaining clearly distinguishable through their direction, trajectory, and warning cues.

# 4. COMBAT SYSTEM

## 4.1. Turn Structure

Combat follows an alternating turn-based system.

The initial sequence is:

1. Dexios begins his turn.
2. The player selects and executes an attack.
3. The attack resolves and character statistics are updated.
4. If Iobrontes is still alive, his turn begins.
5. Iobrontes selects and executes one of his directional attacks.
6. The player must respond using the appropriate defensive input.
7. Damage and defensive effects are resolved.
8. The game checks whether either combatant has reached zero health.
9. If both characters remain alive, a new turn begins with Dexios.

This sequence continues until either Dexios or Iobrontes reaches zero health.

The game must prevent a new attack from being executed while a previous action is still being resolved.

## 4.2. Dexios's Attacks

Dexios has three selectable attacks displayed in the lower section of the user interface.

### Attack 1: Triple Lightning

**Type:** Close-combat attack  
**Mana Cost:** 0  
**Total Damage:** 15  
**Number of Hits:** 3  
**Damage per Hit:** 5

Dexios performs three consecutive strikes accompanied by yellow lightning.

Each hit must trigger its own visual effect and update Iobrontes's health. The attack has no mana cost.

If Iobrontes is defeated during the sequence, the remaining hits must not cause additional damage or generate combat errors.

### Attack 2: Electric Arc

**Type:** Ranged magical attack  
**Mana Cost:** 10  
**Damage:** 30

Dexios raises both hands and gathers a white electrical charge between them. After the charging animation, he releases the electric arc toward Iobrontes.

The attack must include a preparation animation, a release animation, and a visual impact effect on the boss.

### Attack 3: Chaotic Lightning

**Type:** High-damage special attack  
**Chaos Energy Cost:** 50  
**Damage to Iobrontes:** 70  
**Damage to Dexios:** 20

Dexios concentrates Chaos energy in his arm and delivers a punch surrounded by red lightning.

The attack must look visually distinct from his regular electrical attacks.

The required Chaos energy is consumed when the attack is executed. Both the damage to Iobrontes and the self-inflicted damage to Dexios must then be applied.

For the initial implementation, self-inflicted damage will not generate additional Chaos energy. This prevents the ability's cost from being partially refunded by its own drawback.

## 4.3. Mana Management

Dexios begins combat with 100 Mana.

Mana is consumed when an applicable attack is executed. If Dexios does not have enough Mana, that attack cannot be performed.

Triple Lightning does not consume Mana.

For this prototype, Mana does not regenerate automatically because no recovery mechanic has been defined.

## 4.4. Chaos Energy Management

Chaos energy begins at 0 and has a maximum value of 100.

Dexios gains 10 Chaos energy whenever he takes damage from an enemy attack.

Chaos energy cannot exceed 100.

Chaotic Lightning requires 50 Chaos energy to execute. The player must therefore manage the resource and decide when to use the special attack.

As a provisional rule, an imperfect block that causes 5 damage will still grant 10 Chaos energy. A perfect parry, which prevents all damage, will not generate Chaos energy.

# 5. DIRECTIONAL DEFENSE AND PARRY SYSTEM

## 5.1. Core Mechanic

Directional defense is the defining gameplay feature of *La Dexíada*.

Unlike a conventional turn-based RPG, the player cannot resolve the enemy's turn simply by waiting for the animation to finish. They must identify the origin of the attack and respond using the correct directional input.

Each of Iobrontes's attacks has a base damage value of 20 before defensive effects are applied.

## 5.2. Iobrontes's Attacks

Enemy attacks will not appear as selectable options in the player's interface. Their direction will be communicated through Iobrontes's animations, visual effects, and directional warning cues.

| Attack | Direction | Required Response | Base Damage |
|---|---|---|---:|
| Left Lightning | From the left | Left Defense | 20 |
| Right Lightning | From the right | Right Defense | 20 |
| Top Lightning | From above | High Defense | 20 |
| Bottom Lightning | From below | Defensive Jump | 20 |

All four attacks will use purple lightning and deal the same base damage in this prototype.

## 5.3. Controls

The initial implementation will use keyboard controls.

| Key | Action |
|---|---|
| W | High Defense |
| A | Left Defense |
| D | Right Defense |
| S | Defensive Jump |

Defensive actions will be triggered by a new key press rather than simply by holding a key down.

Each enemy attack can only be resolved once.

## 5.4. Enemy Attack Timing

To make the attack timing consistent and implementable, each enemy attack follows this initial sequence.

**Phase 1 — Wind-up: 1 second**

Iobrontes prepares the attack. A visual warning indicates the direction from which the lightning will come.

**Phase 2 — Projectile Travel: 2 seconds**

The lightning moves toward Dexios. Its trajectory remains visible so that the player can follow the incoming attack.

**Phase 3 — Resolution**

The attack reaches the player, and the game applies the result of the defensive action. If the attack is successfully blocked, the defensive animation plays and the appropriate damage values are applied.

The initial defensive reaction window is **1 second from the moment the directional warning appears**.

- **0–0.6 seconds:** Perfect parry window.
- **After 0.6 seconds and up to 1 second:** Imperfect block window.
- **No valid response within 1 second:** The attack is not blocked.

The game should continue to display the incoming attack after the input window closes, allowing the player to see the consequences of their response.

These timings are initial design values and should be tested and adjusted during playtesting.

## 5.5. Defensive Outcomes

| Outcome | Damage to Dexios | Damage to Iobrontes |
|---|---:|---:|
| Perfect parry | 0 | 5 |
| Imperfect block | 5 | 0 |
| Failed or incorrect response | 20 | 0 |
| No valid response | 20 | 0 |

### Perfect Parry

A perfect parry requires the player to press the correct directional key within the first 0.6 seconds of the reaction window.

The attack is completely negated, and Dexios counters for 5 damage.

The action must provide immediate and noticeable visual feedback, such as a sharp electrical flash, a brief impact effect, and a distinctive counterattack animation.

### Imperfect Block

An imperfect block occurs when the correct directional key is pressed after the perfect parry window but before the full 1-second reaction window expires.

Dexios successfully defends against the attack but takes 5 damage.

The visual feedback should communicate that the defense was successful but not perfectly timed.

### Failed Defense

If the player presses the wrong directional key or provides no valid input within the reaction window, the defense fails and Dexios takes the attack's full 20 damage.

For the first implementation, the first directional input registered during the reaction window will resolve the defense attempt. The player cannot repeatedly test different directions to obtain a successful block.

# 6. USER INTERFACE (HUD)

## 6.1. Iobrontes's HUD

Iobrontes's interface will be positioned near the top of the screen and visually associated with his position in the arena.

It will display:

**Iobrontes**  
*God of Thunder, Twelfth Heir of Zeus*

A health bar with a purple lightning-inspired design will appear underneath the name.

- Starting health: 200.
- Maximum health: 200.
- The bar decreases proportionally to damage received.
- A numerical health value will be displayed for clarity during testing.
- The name and subtitle will use a Greek-inspired typeface while prioritizing readability.

## 6.2. Dexios's HUD

Dexios's interface will appear in the lower-right corner of the screen.

It will display his name and three distinct resource bars.

**Health**
- Color: Green.
- Starting and maximum value: 100.

**Mana**
- Color: Blue.
- Starting and maximum value: 100.

**Chaos Energy**
- Color: Red.
- Starting value: 0.
- Maximum value: 100.

Below the resource bars, the interface will display the three available attacks:

- Triple Lightning.
- Electric Arc.
- Chaotic Lightning.

Each attack option must show its name and resource cost. If Dexios does not have enough of the required resource, the attack must appear visually disabled and cannot be selected.

Triple Lightning will be displayed with no Mana cost.

All resource values and bars must update immediately after any relevant change in character statistics.

## 6.3. Combat Indicators

During Iobrontes's turn, the screen must clearly communicate that the player needs to defend.

Directional indicators should appear in a visible position, preferably near the attack trajectory or Dexios, without obscuring the character or important action.

The direction of each attack must also be recognizable from the lightning's animation and trajectory rather than relying on color alone.

Additional visual effects may distinguish a perfect parry from an imperfect block and a failed defense.

# 7. VICTORY AND DEFEAT CONDITIONS

## 7.1. Victory

Victory occurs when Iobrontes reaches zero health.

The combat system stops, attack and defense inputs are disabled, and Iobrontes's defeat animation plays, followed by Dexios's victory animation.

## 7.2. Defeat

Defeat occurs when Dexios reaches zero health.

The combat system stops, combat inputs are disabled, and Dexios's defeat animation plays.

Health values cannot fall below zero in the user interface. Once either combatant is defeated, subsequent effects must not continue to apply damage to that defeated character.

# 8. PROTOTYPE ACCEPTANCE CRITERIA

The prototype will be considered functional when all of the following requirements are met:

1. The battle can start and end without critical errors.
2. Dexios can execute all three attacks with the correct damage and resource costs.
3. Triple Lightning deals 15 total damage across three hits and consumes no Mana.
4. Electric Arc deals 30 damage and consumes 10 Mana.
5. Chaotic Lightning deals 70 damage to Iobrontes, costs 50 Chaos energy, and inflicts 20 damage on Dexios.
6. Iobrontes can execute all four directional attacks.
7. The player can perform all four defensive actions using the assigned keyboard controls.
8. An imperfect block limits incoming damage to 5.
9. A perfect parry prevents all incoming damage and deals 5 damage to Iobrontes.
10. Failed defenses deal the full 20 damage.
11. Chaos energy increases correctly when Dexios takes eligible damage and allows the use of Chaotic Lightning.
12. Dexios's three resource bars and Iobrontes's health bar update correctly.
13. Idle, attack, defense, and defeat animations play without incorrect overlaps.
14. The battle remains visually readable at a resolution of 1920 × 1080 pixels.

# 9. VISUAL REFERENCES

Reference images of Dexios, Iobrontes, the temple, the user interface, and magical effects will be attached at the end of this document.

These images establish the intended visual style, proportions, and overall presentation of the prototype.

They should not automatically be treated as final animation-ready assets. Character illustrations must be adapted to the required poses, animation frames, and visual effects needed for the combat system.

---

**End of Document — Version 0.1**