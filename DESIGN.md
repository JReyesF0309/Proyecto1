LA DEXÍADA — GAME DESIGN DOCUMENT
Version: 0.3 — Three-Character Combat Prototype
Document Status: Implementation Specification
Target Platform: PC (Phaser, browser)
Genre: Turn-Based RPG with Real-Time Directional Defense
Visual Perspective: 2D character-based combat with foreground/background depth
Prototype Scope: Three playable characters, one boss, one arena, and one complete combat encounter.
Note to the implementer: This document is intended to be self-contained. Implement the mechanics and values described here without relying on previous versions. Numerical values, timings, character positions, camera settings, and animation references must be stored in configuration files whenever possible.
________________________________________
1. GAME OVERVIEW
1.1. Game Description
La Dexíada is a fantasy RPG inspired by Greek mythology, set in Xantharchía, a world where gods, divine heirs, and mortals coexist within a society shaped by magic.
The combat system combines turn-based strategic decisions with real-time directional defense. During their turns, players select attacks or abilities for their characters. During enemy turns, they must identify the direction of incoming attacks and press the corresponding defensive key at the correct moment.
The player controls a party of three characters:
•	Dexios: A lightning-based fighter who uses electricity and Chaos energy.
•	Furai: A tiger-themed fighter specializing in physical attacks, armor breaking, and defensive counterattacks.
•	Sahira: A jackal-themed fighter and healer with strong defensive capabilities.
The party faces Iobrontes, God of Thunder and the Twelfth Heir of Zeus, inside his temple.
The prototype focuses entirely on one combat encounter, demonstrating the game's core mechanics, character abilities, directional defense system, party management, and visual identity.
1.2. Prototype Objectives
The prototype must:
1.	Implement a complete three-character party versus one boss encounter.
2.	Use a fixed turn order without a speed-stat system.
3.	Allow each playable character to execute their unique abilities.
4.	Implement Iobrontes's three-hit directional Lightning Chain, team-targeting Watch the Thunder, and Divine Retribution.
5.	Allow the targeted character to defend using WASD and all active characters to jump together using Space.
6.	Implement different defensive mechanics for Dexios, Furai, and Sahira.
7.	Include party health and resource management.
8.	Implement healing, armor breaking, Chaos generation, and counterattacks.
9.	Display all required character sprites and effects.
10.	Use a slight camera zoom to emphasize the character targeted by Iobrontes.
11.	Include background battle music.
12.	Establish a functional system that can later be expanded with more characters and encounters.
1.3. Out of Scope
This prototype will not include exploration, interactive dialogue, inventory, character progression, equipment selection, additional bosses, multiple arenas, or a complete save system.
Character speed statistics will also be excluded. Turn order will remain fixed throughout the encounter.
________________________________________
2. SETTING AND ART DIRECTION
2.1. Arena: Temple of Iobrontes
The battle takes place inside a Greek temple dedicated to Iobrontes.
The environment must convey the solemnity of a sacred place and the presence of a deity associated with lightning and storms.
The provided background image must be used as the main arena reference and scene asset.
The temple's visual identity includes:
•	Classical Greek-inspired architecture.
•	Stone columns and monumental structures.
•	A statue representing Iobrontes.
•	Banners displaying his divine symbol.
•	Decorations and architectural elements inspired by lightning.
•	An opening revealing a stormy, gray sky.
•	Cold ambient lighting with possible purple lightning flashes.
The environment should remain mostly static, although subtle environmental effects may be added.
2.2. Visual Style
The game uses hand-drawn 2D character artwork following the visual references provided in the assets directory.
The intended style is not pixel art.
Characters should retain the appearance, proportions, clothing, and recognizable design details of their supplied reference images.
Technical Resolution
Target Resolution: 1920 × 1080 pixels
Aspect Ratio: 16:9
Recommended starting asset dimensions:
Asset	Recommended Dimensions
Arena background	1920 × 1080 px
Playable character canvases	Approximately 512 × 1024 px
Iobrontes canvas	Approximately 768 × 1024 px
Lightning effects	256–512 px, depending on the effect
Attack icons	128 × 128 px
Character images must support transparency.
Assets should be scaled at runtime while preserving their original proportions.
2.3. Screen Composition
The arena must communicate depth through character placement, scaling, and floor perspective.
The three playable characters stand closer to the camera, facing Iobrontes.
Iobrontes stands farther away, facing the party and the camera.
Party Formation
Furai — Left
•	Positioned on the left side of the party.
•	Slightly farther away from the camera.
•	His feet should be higher on the screen than Dexios's.
•	Facing Iobrontes.
Dexios — Center
•	Positioned in the center of the party formation.
•	Standing slightly closer to the camera than Furai.
•	Seen primarily from behind, facing Iobrontes.
•	Retains his combat stance with his left arm and left leg forward.
Sahira — Right
•	Positioned on the right side of the formation.
•	Slightly closer to the camera than Dexios.
•	Her feet should appear lower on the screen than the other party members' feet.
•	Facing Iobrontes.
Iobrontes — Background
•	Positioned approximately in the center of the arena.
•	Standing farther away than all three party members.
•	Facing the playable characters.
•	His upright posture must communicate divine authority.
Formation Diagram
                  TEMPLE BACKGROUND

                      IOBRONTES


       FURAI
                     DEXIOS
                                  SAHIRA


                        CAMERA
This diagram indicates approximate spatial relationships, not exact pixel coordinates.
All positions and scales must be stored as editable configuration values.
Scene Layering
From back to front:
1.	Temple background and sky.
2.	Iobrontes.
3.	Background magical effects.
4.	Furai.
5.	Dexios.
6.	Sahira.
7.	Foreground magical effects.
8.	Combat HUD and directional indicators.
The final draw order may be adjusted dynamically for attack effects, but the party formation must maintain a consistent sense of depth.
2.4. Camera Behavior
The camera normally displays the complete battlefield, including all three playable characters and Iobrontes.
When Iobrontes selects a target:
1.	The game identifies the chosen character.
2.	The camera smoothly moves and zooms slightly toward that character.
3.	The targeted character becomes visually emphasized.
4.	Iobrontes begins his attack sequence.
5.	The player performs the defensive inputs.
6.	After the three attacks resolve, the camera returns smoothly to its normal position.
The camera must make the selected target obvious without hiding the boss or obstructing directional indicators.
Suggested initial camera values:
•	Zoom multiplier: approximately 1.08.
•	Camera transition duration: 0.2–0.3 seconds.
•	Return transition: approximately 0.3 seconds.
These values are adjustable and must not be hard-coded.
________________________________________
3. ASSET AND ANIMATION SYSTEM
3.1. Asset Availability
All provided character frames will be included in the project's asset directory.
The implementation must load the supplied graphical resources using their specified asset names.
The asset loading system must allow images to be replaced without modifying the combat logic.
The names written in this document identify the required animation poses or frames.
3.2. Animation Requirements
A state-based visual system must manage the displayed frame or animation for each character.
Possible states include:
•	Idle
•	Attacking
•	Defending
•	Taking damage
•	Healing
•	Special ability
•	Counterattacking
•	Defeated
When a character begins an action, the appropriate frame must replace their idle frame.
Once the action ends, the character returns to the idle frame unless they have been defeated.
Dexios, Furai, and Sahira gently move up and down while in their base idle frame.
If a supplied asset is a static frame rather than a complete sprite sheet, simple movements and effects may be produced through Phaser, such as:
•	Small positional movements.
•	Slight scaling.
•	Recoil.
•	Character flashes.
•	Projectile movements.
•	Lightning effects.
•	Camera movement.
These effects must not change the appearance or design of the provided character artwork.
3.3. Missing Asset Policy
If a required frame is unavailable, the game must use a clearly identified temporary placeholder.
The implementation must not substitute an unrelated character image or incorrectly oriented sprite.
Missing assets must not prevent the combat logic from functioning.
________________________________________
4. COMBAT SYSTEM
4.1. General Structure
Combat is turn-based.
The player controls three characters while Iobrontes acts as the enemy boss.
Each character has unique attacks and defensive behavior.
The combat continues until the boss is defeated or all three party members are incapacitated.
4.2. Fixed Turn Order
The prototype will not calculate turn order using character speed.
Instead, the following sequence is fixed:
Turn Position	Acting Character
1	Furai
2	Iobrontes
3	Dexios
4	Iobrontes
5	Sahira
6	Iobrontes
After turn position 6, the sequence restarts at position 1.
Furai
  ↓
Iobrontes
  ↓
Dexios
  ↓
Iobrontes
  ↓
Sahira
  ↓
Iobrontes
  ↓
Repeat
Iobrontes therefore acts three times during every complete six-position cycle.
Incapacitated Characters
When a playable character reaches zero health:
•	They become incapacitated.
•	They cannot execute attacks or abilities.
•	Their turn is automatically skipped.
•	The combat continues with the remaining characters.
•	Their HUD must indicate that they are incapacitated.
For the initial implementation, only the incapacitated party member's turn is skipped. Iobrontes's positions in the fixed turn sequence remain unchanged.
This means Iobrontes may receive consecutive turns if a skipped party-member turn falls between two boss turns.
The battle only ends in defeat when all three playable characters have zero health.
4.3. Target Selection
During each Lightning Chain, Iobrontes selects exactly one active party member at random and keeps that target for all three lightning attacks.
Watch the Thunder targets all active party members simultaneously and requires no single-target selection.
4.4. Targeting Feedback
The game must clearly communicate which character Iobrontes is attacking.
Before a Lightning Chain begins:
•	The selected character is visually highlighted.
•	The camera moves slightly toward the selected character.
•	The character's name or HUD receives a targeting indicator.
•	The other party members remain visible but are not eligible to perform defensive actions.
During Lightning Chain, WASD controls only the targeted character. During Watch the Thunder, Space triggers a simultaneous jump for the party.
Inputs must not activate defensive animations for other party members.
After the chain finishes, the camera returns to the default view and the targeting indicator disappears.
________________________________________
5. PLAYABLE CHARACTER — DEXIOS
5.1. Starting Statistics
Attribute	Initial Value	Maximum
Health	100	100
Mana	100	100
Chaos Energy	0	100
Initial Frame: dexios_base
Downward defense frame: dexios_abajo
Dexios specializes in electrical attacks and Chaos energy.
5.2. Ability 1 — Triple Lightning
Damage: 5 × 3 = 15
Mana Cost: 0
Type: Three-hit physical/electrical attack
Frame: dexios_ataque
Dexios performs three consecutive strikes against Iobrontes.
Each strike:
•	Deals 5 damage.
•	Produces a yellow lightning effect.
•	Updates the boss's health.
The attack consumes no Mana.
Each individual impact must be visible.
5.3. Ability 2 — Electric Arc
Damage: 30
Mana Cost: 20
Type: Electrical attack
Frame: dexios_blanco
Dexios unleashes a large white lightning attack toward Iobrontes.
The attack deals 30 damage in one hit.
When selected, 20 Mana is consumed.
The attack must include a visible white lightning effect.
5.4. Ability 3 — Chaotic Lightning
Damage: 70
Chaos Energy Cost: 50
Type: Chaos-based electrical attack
Frame: dexios_rojo
Dexios unleashes a large red lightning attack.
The attack deals 70 damage to Iobrontes and consumes 50 Chaos energy and inflicts 20 self-damage.
The attack must use visually distinctive red lightning effects.
5.5. Chaos Energy
Dexios gains 20 Chaos energy whenever he takes damage from an enemy attack.
Examples:
•	An unblocked lightning hit deals 10 damage and grants 20 Chaos energy.
•	An imperfect block deals 5 damage and grants 20 Chaos energy.
•	A perfect parry deals 0 damage and grants no Chaos energy.
Chaos energy cannot exceed 100.
Each damaging hit is processed separately. Therefore, taking damage from three lightning bolts in a single chain may generate up to 60 Chaos energy.
5.6. Defensive Frames
Defensive Direction	Frame
Right	dexios_derecha
Left	dexios_izquierda
Up	dexios_arriba
Down	dexios_abajo
Damaged Frame: dexios_herido
5.7. Defensive Results
Result	Damage Received	Counterattack
Perfect parry	0	5
Imperfect block	5	0
Failed defense	10	0
Dexios can perform a perfect parry against each individual lightning bolt.
Every successful perfect parry triggers a 5-damage counterattack against Iobrontes.
If Dexios perfectly parries all three lightning attacks in a chain, he deals 15 counterattack damage in total.
There is no additional three-hit parry bonus for Dexios.
________________________________________
6. PLAYABLE CHARACTER — FURAI
6.1. Starting Statistics
Attribute	Initial Value	Maximum
Health	80	80
Mana	150	150
Initial Frame: furai_base
Furai specializes in physical attacks and techniques associated with the tiger.
6.2. Ability 1 — Tiger Spear
Damage: 15
Mana Cost: 0
Type: Single physical strike
Frame: furai_ataque
Furai performs a single physical attack against Iobrontes.
The attack deals 15 damage and produces a visible impact effect.
It does not consume Mana.
6.3. Ability 2 — Tiger Fang
Damage: 15 × 2 = 30
Mana Cost: 20
Type: Two-hit physical attack
Frame: furai_tigre
Furai attacks Iobrontes twice in succession.
Each hit deals 15 damage, for a total of 30.
Each hit must have its own impact effect.
The ability consumes 20 Mana when executed.
6.4. Ability 3 — Armor Break
Damage: 0
Mana Cost: 20
Type: Debuff
Frame: furai_romper
Furai applies an armor-breaking mark to Iobrontes.
The ability does not deal direct damage.
Instead, it causes the next qualifying offensive attack against Iobrontes to deal double damage.
Visual Effect
The `assets/effects/tiger-mark.png` image appears centered on Iobrontes.
The mark remains visible until its effect has been consumed.
Armor Break Rules
1.	Furai activates Armor Break.
2.	Iobrontes receives the purple tiger mark.
3.	The next player-selected damaging attack against Iobrontes deals double damage.
4.	The mark disappears after the empowered attack resolves.
For multi-hit attacks, the damage of only the first hit within that one ability is doubled.
Examples:
•	Triple Lightning: 15 → 20 total damage.
•	Tiger Fang: 30 → 45 total damage.
•	Electric Arc: 30 → 60 damage.
•	Chaotic Lightning: 70 → 140 damage.
For this prototype, automatic defensive counterattacks do not consume the mark. The effect waits for the next damaging attack chosen from a playable character's ability menu.
Armor Break cannot stack with itself. Reapplying it while active refreshes the same effect instead of multiplying damage again.
6.5. Defensive Frames
Defensive Direction	Frame
Right	furai_derecha
Left	furai_izquierda
Up	furai_arriba
Down	furai_abajo
Damaged Frame: furai_herido
6.6. Defensive Results
Result	Damage Received	Counterattack
Perfect parry on one bolt	0	0
Imperfect block	5	0
Failed defense	10	0
Three consecutive perfect parries	0 across the chain	20
Furai's counterattack mechanic is different from Dexios's.
A successful perfect parry prevents all damage from the individual bolt, but does not immediately damage Iobrontes.
Furai only performs his counterattack if he perfectly parries all three lightning bolts in the same enemy chain.
When this happens:
1.	All three attacks deal zero damage to Furai.
2.	The message "Parry perfecto" appears.
3.	The frame furai_ataque is activated.
4.	Furai counterattacks Iobrontes.
5.	Iobrontes receives 20 damage.
If even one attack in the chain is an imperfect block or failed defense, the special counterattack does not occur.
Perfectly blocked individual attacks still deal zero damage.
________________________________________
7. PLAYABLE CHARACTER — SAHIRA
7.1. Starting Statistics
Attribute	Initial Value	Maximum
Health	125	125
Mana	80	80
Initial Frame: sahira_base
Sahira specializes in physical attacks, healing, and defensive techniques.
7.2. Ability 1 — Jackal Strike
Damage: 15
Mana Cost: 0
Type: Single physical strike
Frame: sahira_ataque
Sahira performs a physical attack against Iobrontes.
The attack deals 15 damage and produces a visible impact effect.
It does not consume Mana.
7.3. Ability 2 — Hippopotamus Healing
Healing: Full restoration of the selected ally's Health
Mana Cost: 40
Type: Healing ability
Frame: sahira_cura
Sahira performs a healing ability that completely restores one selected party member's health.
When this ability is selected, a targeting menu appears.
The player can choose:
•	Dexios
•	Furai
•	Sahira
The healing effect restores the selected character to their maximum Health value.
The ability consumes 40 Mana when successfully executed.
Healing Target Selection
1.	The player selects Hippopotamus Healing.
2.	The game displays the three party members.
3.	The player selects the character to heal.
4.	Sahira's healing frame activates.
5.	A healing effect appears over the selected character.
6.	The character's Health is restored to maximum.
For the initial implementation, healing applies to conscious party members only and does not revive incapacitated allies. Incapacitated characters remain visible in the selection interface but are disabled as healing targets.
This rule can be changed later if revival abilities are introduced.
7.4. Ability 3 — Hippopotamus Shield
Mana Cost: 0
Type: Defensive support ability
Frame: sahira_cura
Sound: cura.mp3
Sahira selects one conscious ally to protect. The `assets/effects/hippo-mark.png` image appears at the center of the target and displays the two remaining blocked attacks.
The shield prevents all damage from the target's next two incoming attacks that are not perfectly parried, then disappears. An incoming attack consumes one shield charge unless the target performs a perfect parry. Incapacitated allies cannot be selected.
7.5. Defensive Frames
Defensive Direction	Frame
Right	sahira_derecha
Left	sahira_izquierda
Up	sahira_arriba
Down	sahira_abajo
Damaged Frame: sahira_herido
7.6. Defensive Results
Sahira has stronger blocking capabilities than the other characters.
Result	Damage Received	Counterattack
Perfect parry on one bolt	0	0
Imperfect block	0	0
Failed defense	10	0
Unlike Dexios and Furai, Sahira takes no damage from an imperfect block.
Her defense only fails to protect her when the player presses the wrong directional input or misses the defensive window entirely.
________________________________________
8. BOSS — IOBRONTES
8.1. Starting Statistics
Attribute	Initial Value	Maximum
Health	500	500
Initial Sprite: iobrontes_base
Iobrontes is the only enemy in the prototype. He has three actions: Lightning Chain, Watch the Thunder, and Divine Retribution.
Before each action, the game displays its name in white at the center of the screen for one second. The action begins only after this announcement disappears.
Iobrontes chooses Lightning Chain 50% of the time, Watch the Thunder 30% of the time, and Divine Retribution 20% of the time.
8.2. Ability — Lightning Chain
Ability Name: Lightning Chain
Number of Attacks: 3
Damage per Unblocked Attack: 10
Target Count: 1
Damage Type: Lightning
Lightning Color: Purple
Iobrontes selects one active party member and unleashes three consecutive lightning attacks against them.
Each attack has a 0.187-second casting (wind-up) time before its lightning bolt launches.
Lightning Chain's attack rate is reduced by 33%: its wind-up, projectile travel, result display, and interval between bolts are lengthened accordingly. Projectile travel takes 0.373 seconds.
Each bolt independently chooses a direction at random from:
•	Up
•	Down
•	Left
•	Right
The same direction may appear more than once during a chain.
Directional Frames
Attack Direction	Frame
Right	iobrontes_derecha
Left	iobrontes_izquierda
Up	iobrontes_arriba
Down	iobrontes_abajo
Damaged Frame: iobrontes_herido
Attack Sequence
1.	Iobrontes selects an active party member.
2.	The camera focuses slightly on that target.
3.	The first lightning direction is selected.
4.	Iobrontes displays the corresponding directional frame.
5.	The first lightning attack travels toward the target.
6.	The player attempts to defend.
7.	The attack is resolved.
8.	Iobrontes displays the frame corresponding to the second attack.
9.	The second lightning attack travels toward the same target.
10.	The player attempts to defend again.
11.	The second attack is resolved.
12.	Iobrontes displays the frame corresponding to the third attack.
13.	The third lightning attack travels toward the same target.
14.	The player attempts the final defense.
15.	The third attack is resolved.
16.	Any eligible three-perfect-parry counterattack is activated.
17.	The camera returns to its normal position.
18.	The next turn begins.
Each attack must have a distinct visual animation and its own defensive timing window.
Iobrontes must not launch all three lightning bolts simultaneously.
Damage Rules
Each lightning bolt deals 10 damage if the target fails to defend.
A successful imperfect block reduces the damage according to the targeted character's defensive rules.
A perfect parry prevents all damage and may trigger a counterattack.
The maximum unblocked damage of one complete Lightning Chain is 30.
8.3. Ability — Watch the Thunder
Frame: iobrontes_wtt
Sound: assets/sfx/trueno.mp3
Target Count: All active party members
Damage per Target: 50
Casting Time: 0.6 seconds
Jump Window: 0.3 seconds
Iobrontes launches one long purple lightning beam from himself across Furai, Dexios, and Sahira. After the 0.6-second casting time, a white contracting timing ring appears around each active party member while the beam spans the whole party during the 0.3-second jump window.
Pressing Space during the jump window makes all active party members jump at the same time. Use furai_salto, dexios_salto, and sahira_salto for their respective jump frames. A successful team jump avoids the attack completely. There is no perfect or imperfect result: each character who does not jump takes 50 damage, unless an active Hippopotamus Shield blocks that hit.
The attack is one event, not a chain. Resolve damage for all active characters together when the jump window closes.
8.4. Ability — Divine Retribution
Frame: iobrontes_armadura
Sound: assets/sfx/armadura.mp3
Target Count: Self, then the first playable character whose attack damages Iobrontes
Retaliation Damage: 30
Duration: 2 playable-character turns
Divine Retribution covers Iobrontes in an electric shield. The next attack that damages him still deals its normal damage, then the shield immediately retaliates against its attacker for 30 damage and disappears.
The shield lasts until that hit occurs or two playable-character turns have ended, whichever comes first. Count turns whether or not the character attacks Iobrontes; a skipped incapacitated-character turn also counts. If Dexios and Sahira take their turns without damaging Iobrontes, the shield has expired by Furai's next turn.
Whenever the shield is consumed or expires, Iobrontes returns to iobrontes_base. If another action temporarily changes his frame while the shield remains active, restore iobrontes_armadura when that action's frame ends.
________________________________________
9. DIRECTIONAL DEFENSE AND PARRY SYSTEM
9.1. Core Mechanic
During Lightning Chain, the targeted playable character must identify the incoming lightning direction and perform the corresponding defensive action.
The system uses four directions.
Key	Defensive Action
W	Defend Up
A	Defend Left
S	Defend Down (Lightning Chain)
Space	Jump with the whole party (Watch the Thunder)
D	Defend Right
These controls apply exclusively to the character currently targeted by Iobrontes.
Other characters cannot defend on behalf of the target.
Each lightning bolt has an independent defensive input opportunity.
Space is accepted only during Watch the Thunder's jump window.
9.2. Attack Timing
Each lightning bolt follows three phases.
Phase 1 — Wind-up
Duration: 0.187 seconds
Iobrontes prepares the attack and indicates its direction.
The appropriate directional frame becomes visible.
A warning marker appears on the side corresponding to the attack.
Defensive inputs during this phase are ignored without penalty.
Phase 2 — Projectile Travel
Duration: 0.373 seconds
The lightning projectile travels toward the targeted character.
A timing ring appears around the target and contracts toward them.
The ring reaches its final size at the moment of visual impact.
Phase 3 — Defensive Resolution
All timing is measured relative to the moment of impact, called T.
The defensive window opens 0.5 seconds before impact and closes 0.1 seconds after impact.
Timing	Correct Input Result	Indicator
Before T − 0.5 s	Ignored	Neutral
T − 0.5 s to T − 0.1 s	Imperfect block	Yellow
T − 0.1 s to T + 0.1 s	Perfect parry	White, glowing
After T + 0.1 s	No valid defense	Inactive
Only the first directional input made during the active window is accepted.
An incorrect directional input results in a failed defense.
Inputs made before the defensive window opens do not automatically trigger a defense later.
9.3. Impact and Damage Synchronization
The visual impact and the final damage calculation must be handled separately.
The lightning visually reaches the target at time T.
However, the defensive window remains active until T + 0.1 seconds.
Therefore:
1.	At time T, the lightning reaches the character visually.
2.	The game records the apparent impact but does not finalize damage.
3.	The player may still perform a perfect parry until T + 0.1 seconds.
4.	When the defensive window closes, the game determines the result.
5.	The correct damage, block, or counterattack result is applied.
6.	The corresponding feedback is displayed.
This avoids unfair situations where the player performs a technically valid parry shortly after the visible impact but has already taken damage.
The impact animation may be briefly held or visually extended until the result is finalized.
No damage may be applied twice.
Each lightning bolt must resolve exactly once.
9.4. Defense Result Matrix
Character	Failed Defense	Imperfect Block	Perfect Parry
Dexios	10 damage	5 damage	0 damage, 5 counterdamage
Furai	10 damage	5 damage	0 damage
Sahira	10 damage	0 damage	0 damage
Additional chain effects:
•	Dexios deals 5 damage for every individual perfect parry.
•	Furai deals 20 damage only if all three parries in the chain are perfect.
9.5. Perfect-Parry Tracking
For Furai, the game must track whether every attack in the current Lightning Chain was perfectly parried.
A simple chain tracking structure can contain:
•	Target character.
•	Current lightning index.
•	Number of perfect parries.
•	Whether any imperfect block occurred.
•	Whether any failed defense occurred.
At the end of the third attack:
•	If Furai has three perfect parries, trigger their special counterattack.
•	Otherwise, do not trigger the special counterattack.
The tracking data must be reset when the next Lightning Chain begins.
Dexios does not require a three-hit counterattack condition because his perfect parries resolve individually. Sahira does not require a three-hit counterattack condition.
9.6. Defensive Feedback
Each defensive result must produce immediate visual feedback.
Perfect Parry
•	Bright electrical effect.
•	Strong impact feedback.
•	Text: PERFECT.
•	Counterattack when applicable.
Imperfect Block
•	Defensive impact effect.
•	Text: BLOCK.
•	Character-specific damage calculation.
Failed Defense
•	Visible lightning impact.
•	Damaged frame.
•	Text: FAIL.
•	Full 10 damage applied.
For Furai's successful triple-perfect chain, display the additional message:
"Tiger Parry"
This message appears once, after the third successful perfect parry.
9.7. Team Jump
During Watch the Thunder, Space makes every active party member jump simultaneously. The input is available only during the 0.3-second jump window after Iobrontes's 0.6-second casting time.
A successful jump avoids the attack for the entire party. A character who does not jump takes 50 damage, subject to Hippopotamus Shield. This attack has no perfect-parry or imperfect-block outcomes.
Show a white ring contracting around each active character throughout the jump window. Use each character's dedicated jump frame while the team is airborne.
________________________________________
10. USER INTERFACE (HUD)
10.1. Boss HUD
Iobrontes's HUD appears near the top of the screen.
It displays:
Iobrontes
God of Thunder, Twelfth Heir of Zeus
Below the name is a purple lightning-themed Health bar.
Health: 500 / 500
The bar updates whenever Iobrontes takes damage.
Its appearance should be inspired by purple lightning, matching his attacks and divine identity.
10.2. Party HUD
The player must be able to see the status of all three playable characters.
Each character has an individual HUD panel.
Dexios
•	Health: Green bar — 100 / 100.
•	Mana: Blue bar — 100 / 100.
•	Chaos Energy: Red bar — 0 / 100.
Furai
•	Health: Green bar — 80 / 80.
•	Mana: Blue bar — 150 / 150.
Sahira
•	Health: Green bar — 125 / 125.
•	Mana: Blue bar — 80 / 80.
The HUD should display the character's name, current values, and maximum values.
The three character panels should be clearly grouped and should not cover important battlefield animations.
Active Character Indicator
During a party member's turn, their HUD panel must be highlighted.
Only the current character's ability menu should be active.
Incapacitated Character Indicator
When a character reaches zero Health:
•	Their HUD becomes visually disabled.
•	Their Health bar displays zero.
•	Their turn is skipped.
•	Their action menu is no longer available.
10.3. Ability Menu
The active character's ability menu appears during their turn.
The menu displays the available abilities and their costs.
Dexios
Ability	Cost
Triple Lightning	Free
Electric Arc	20 Mana
Chaotic Lightning	50 Chaos Energy
Furai
Ability	Cost
Tiger Spear	Free
Tiger Fang	20 Mana
Armor Break	20 Mana
Sahira
Ability	Cost
Jackal Strike	Free
Hippopotamus Healing	40 Mana
Hippopotamus Shield	Free
Abilities that cannot be afforded must appear disabled.
Sahira's healing ability opens an ally-selection interface before executing.
Hippopotamus Shield also opens ally selection before protecting the selected ally.
10.4. Directional Attack Indicators
During Lightning Chain, the selected character receives a visual targeting indicator. During Watch the Thunder, each active party member receives a contracting white timing ring.
The following elements are required:
Directional Warning
An arrow or marker showing the direction of the incoming lightning.
Timing Ring
A ring surrounding the targeted character that contracts as the lightning approaches.
Timing Colors
•	Neutral before the defensive window.
•	Yellow during the imperfect-block window.
•	White and glowing during the perfect-parry window.
Result Label
A brief label indicating the defensive result.
The indicators must be clearly readable without covering the character's silhouette.
10.5. Armor Break Indicator
When Furai's Armor Break is active, a purple tiger mark appears centered on Iobrontes.
The mark remains visible until the next qualifying damaging ability consumes the effect.
It must disappear immediately after the empowered attack resolves.
10.6. Enemy Attack Announcement
Before any Iobrontes action, display its name in white at the center of the screen for one second. Hide the message before beginning the action.
________________________________________
11. AUDIO AND MUSIC
11.1. Background Battle Music
The combat must include continuously playing background music using `assets/music/watch_the_thunder.mp3`.
The battle track loops while the encounter is active.
When Iobrontes reaches 0 health, the battle track transitions to `assets/music/nike.mp3`, which loops throughout the victory screen until the battle restarts.
11.2. Sound Effects
Use the supplied sound effects in `assets/sfx/`:
•	`dexios.mp3` plays for Triple Lightning, Electric Arc, and Chaotic Lightning.
•	`iobrontes.mp3` plays once for each bolt in Lightning Chain.
•	`trueno.mp3` plays for Watch the Thunder.
•	`armadura.mp3` plays for Divine Retribution.
•	`furai.mp3` plays for Tiger Spear.
•	`tigre.mp3` plays for Tiger Fang.
•	`tigre.mp3` plays for Armor Break.
•	`sahira.mp3` plays for Jackal Strike.
•	`cura.mp3` plays for Hippopotamus Healing.
•	`cura.mp3` plays for Hippopotamus Shield.
•	`perfect_block.mp3` plays for every perfect block by Dexios, Furai, or Sahira.
Existing generic effects may be used for other combat feedback.
Sound effects should support the combat without overpowering the background music.
11.3. Audio Behavior
•	Background music starts when the encounter begins, subject to browser audio playback restrictions.
•	Music continues while the battle remains active.
•	On victory, music transitions to the looping victory track; on defeat, music stops.
•	Sound effects play alongside the music.
•	Audio volumes should be independently adjustable through configuration.
•	A mute option is recommended for testing.
________________________________________
12. VICTORY AND DEFEAT CONDITIONS
12.1. Victory Condition
The player wins when:
Iobrontes reaches 0 Health.
The boss begins with 500 Health.
Once his Health reaches zero:
1.	The current action finishes or is safely interrupted.
2.	The combat state changes to Victory.
3.	Combat inputs are disabled.
4.	Iobrontes's defeat frame or placeholder is displayed.
5.	A victory message appears.
12.2. Defeat Condition
The player loses when:
Dexios, Furai, and Sahira all reach 0 Health.
The defeat condition requires all three party members to be incapacitated.
If only one or two characters are incapacitated, the battle continues.
When all three reach zero Health:
1.	The combat state changes to Defeat.
2.	Combat inputs are disabled.
3.	The party is shown defeated.
4.	A defeat message appears.
12.3. Health Limits
Health values cannot fall below zero or rise above the character's maximum Health.
When a character reaches zero Health, they immediately become incapacitated.
The combat system must not allow defeated characters to perform additional actions.
________________________________________
13. TECHNICAL IMPLEMENTATION REQUIREMENTS
13.1. Game Engine
The prototype will be developed using Phaser and must be playable in a desktop browser.
The project must support keyboard input, 2D sprites, graphical effects, audio, and camera transitions.
13.2. Configuration System
The following values must be editable without changing the main combat logic:
•	Character starting statistics.
•	Maximum Health, Mana, and Chaos energy.
•	Attack damage.
•	Ability costs.
•	Chaos energy generation.
•	Enemy attack damage.
•	Turn order.
•	Projectile timing.
•	Defense timing windows.
•	Character positions and scales.
•	Camera zoom and transition speed.
•	Animation references.
•	Visual effects.
•	Audio volume.
13.3. Combat State Management
The combat system should use clearly separated states.
Recommended states:
1.	BATTLE_START
2.	PLAYER_TURN
3.	PLAYER_ACTION
4.	ENEMY_TARGET_SELECTION
5.	ENEMY_ATTACK
6.	DEFENSE_WINDOW
7.	DAMAGE_RESOLUTION
8.	TURN_END
9.	VICTORY
10.	DEFEAT
The system must prevent contradictory actions, such as selecting a new attack while another attack is still executing.
13.4. Enemy Attack Logic
Choose Lightning Chain 50% of the time, Watch the Thunder 30% of the time, and Divine Retribution 20% of the time at the start of each Iobrontes turn. Announce the selected action in white at the center of the screen for one second, and start it only after the announcement disappears.
Each Lightning Chain must be treated as one enemy action containing three separate attack events. The structure must support:
•	One target for the full chain.
•	Three independently randomized directions.
•	Three separate timing windows.
•	Three defensive results.
•	Character-specific block and parry calculations.
•	Chain-level perfect-parry tracking.
•	A final counterattack when applicable.
•	Automatic cancellation if the target becomes incapacitated.
Watch the Thunder is one enemy action targeting all active party members. It has a 0.6-second casting time followed by a 0.3-second team jump window, deals 50 damage to each character who does not jump, and has no directional or parry outcomes.
Divine Retribution activates a two-playable-turn electric shield using iobrontes_armadura and armadura.mp3. The next damaging attack against Iobrontes deals its normal damage and triggers 30 damage to its attacker; the shield then ends. It also ends after two playable-character turns, whether or not either character attacked, and Iobrontes returns to iobrontes_base on either ending.
The next turn must not begin until the current enemy action, including its damage and any applicable counterattack, has resolved.
13.5. Damage and Resource Processing
Every damaging action must:
1.	Determine the base damage.
2.	Apply any active damage modifiers.
3.	Calculate the final damage.
4.	Update the target's Health.
5.	Update any resources generated by the event.
6.	Check for incapacitation or victory.
7.	Trigger the appropriate visual feedback.
Each event must resolve only once.
13.6. Asset References
All frame names provided in this GDD must be registered through the asset configuration system.
The implementation should use the supplied frames directly rather than replacing them with unrelated artwork.
Animations or effects missing from the asset directory may temporarily use labeled placeholders.
________________________________________
14. PROTOTYPE ACCEPTANCE CRITERIA
The prototype will be considered complete when the following conditions are satisfied.
General Combat
1.	The game displays all three playable characters and Iobrontes.
2.	The characters follow the required foreground/background formation.
3.	The fixed turn order works correctly.
4.	Incapacitated characters have their turns skipped.
5.	Iobrontes only targets active characters.
6.	The battle ends when Iobrontes reaches zero Health or all three party members are incapacitated.
Dexios
7.	Triple Lightning deals three hits of 5 damage and consumes no Mana.
8.	Electric Arc deals 30 damage and consumes 20 Mana.
9.	Chaotic Lightning deals 70 damage and consumes 50 Chaos energy.
10.	Dexios gains 20 Chaos energy per damaging enemy hit.
11.	His imperfect block causes 5 damage.
12.	Every perfect parry prevents damage and deals 5 damage to Iobrontes.
Furai
13.	Tiger Spear deals 15 damage.
14.	Tiger Fang deals two hits of 15 damage.
15.	Armor Break doubles the next qualifying offensive ability's damage.
16.	The purple tiger mark remains visible until consumed.
17.	Furai takes 5 damage from imperfect blocks.
18.	Three perfect parries in the same chain trigger a 20-damage counterattack.
Sahira
19.	Jackal Strike deals 15 damage.
20.	Hippopotamus Healing restores a selected active ally to maximum Health.
21.	The healing ability allows the selection of Dexios, Furai, or Sahira.
22.	Sahira takes no damage from imperfect blocks.
24.	Hippopotamus Shield costs no Mana and blocks the next two attacks against a selected active ally.
Iobrontes
25.	Iobrontes begins with 500 Health.
26.	Iobrontes chooses Lightning Chain 50% of the time, Watch the Thunder 30% of the time, and Divine Retribution 20% of the time.
27.	The attack name appears in white at the center of the screen for one second, then disappears before the attack begins.
28.	Lightning Chain targets one active party member and contains three sequential attacks.
29.	Each Lightning Chain attack chooses an independent random direction and deals 10 unblocked damage.
30.	The corresponding Iobrontes directional frame activates for each Lightning Chain attack.
31.	Watch the Thunder uses iobrontes_wtt and trueno.mp3, targets all active party members, and deals 50 damage to each character who does not jump.
32.	Watch the Thunder has a 0.6-second casting time and a 0.3-second jump window. The team can avoid it by pressing Space once during the window.
33.	Divine Retribution uses iobrontes_armadura and armadura.mp3.
34.	Divine Retribution's shield lets the next damaging attack deal its normal damage, retaliates against its attacker for 30 damage, then ends.
35.	Divine Retribution also expires after two playable-character turns, even if they do not attack. Iobrontes returns to iobrontes_base when the shield ends.
Defense and Camera
36.	WASD controls only the character being targeted by Lightning Chain.
37.	Space triggers a simultaneous team jump only during the Watch the Thunder jump window.
38.	The timing ring correctly displays the active defensive or jump window.
39.	Damage resolution occurs after the Lightning Chain defensive window closes at T + 0.1 seconds.
40.	Defensive results are calculated separately for every Lightning Chain bolt.
41.	The camera returns to its normal position after Lightning Chain.
Visuals and Audio
42.	All supplied character frames are loaded through configurable asset references.
43.	Missing assets use visible placeholders.
44.	Attacks display their specified lightning colors and impact effects.
45.	Background music plays and loops during combat.
46.	Sound effects accompany major combat actions.
47.	The battle remains visually readable at 1920 × 1080 resolution.
________________________________________
15. SUGGESTED IMPLEMENTATION ORDER
The prototype should be developed in stages, with each stage tested before moving to the next.
Stage 1 — Battlefield and Party Formation
•	Load the supplied temple background.
•	Place Iobrontes in the background.
•	Place Furai, Dexios, and Sahira in the requested formation.
•	Configure sprite scaling and drawing order.
•	Implement the initial HUD.
Stage 2 — Combat State and Turn Order
•	Create the character statistics.
•	Implement the fixed six-position turn sequence.
•	Add incapacitation logic.
•	Add victory and defeat conditions.
Stage 3 — Playable Character Abilities
•	Implement Dexios's attacks and Chaos energy.
•	Implement Furai's physical attacks and Armor Break.
•	Implement Sahira's attack and healing ability.
•	Add resource costs and target selection.
Stage 4 — Iobrontes's Attacks
•	Implement random target selection.
•	Implement the three directional lightning attacks.
•	Load the corresponding directional frames.
•	Implement projectile movement and attack timing.
•	Add Watch the Thunder, its team-wide beam, casting, jump window, and damage resolution.
•	Add Divine Retribution, its electric shield, retaliation damage, and two-player-turn expiration.
•	Select between Iobrontes's three actions with the specified probabilities and announce each action before it begins.
Stage 5 — Defensive Mechanics
•	Implement WASD controls.
•	Implement the directional warning system.
•	Implement the contracting timing ring.
•	Implement imperfect blocks and perfect parries.
•	Add each character's unique defensive calculations.
•	Implement three-perfect-parry counterattacks.
Stage 6 — Camera and Visual Feedback
•	Add target highlighting.
•	Add camera zoom and return transitions.
•	Add hit reactions.
•	Add damage numbers and defense result labels.
•	Add lightning and impact effects.
Stage 7 — Audio
•	Add looping background battle music.
•	Add combat sound effects.
•	Balance audio levels.
Stage 8 — Final Integration and Testing
•	Verify all damage calculations.
•	Verify resource consumption.
•	Verify the fixed turn sequence.
•	Test incapacitated-character behavior.
•	Test all defensive windows.
•	Verify that animations and camera transitions do not interrupt combat.
•	Confirm victory and defeat behavior.
________________________________________
16. VISUAL REFERENCES
The project's asset directory will contain the supplied reference frames for:
•	Dexios
•	Furai
•	Sahira
•	Iobrontes
•	The temple background
•	Additional combat effects, where available
•	Dexios, Furai, and Sahira jump frames
•	Iobrontes's Watch the Thunder frame
•	Iobrontes's Divine Retribution electric-armor frame
These assets establish the visual identity and character appearances of the prototype.
The code must reference them through their registered names, allowing images to be replaced or improved without requiring changes to the core combat systems.
________________________________________
End of Document — Version 0.3