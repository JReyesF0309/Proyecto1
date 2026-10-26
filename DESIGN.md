LA DEXÍADA — GAME DESIGN DOCUMENT
Version: 0.3 — Three-Character Combat Prototype
Document Status: Implementation Specification
Target Platform: PC (Phaser, browser)
Genre: Turn-Based RPG with Real-Time Directional Defense
Visual Perspective: 2D character-based combat with foreground/background depth
Prototype Scope: Three playable characters, two bosses, one arena, and one complete dual-boss combat encounter.
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
The party faces Iobrontes, God of Thunder and the Tenth Heir of Zeus, and Kosmelys, Goddess of Space and Tenth Heir of Hera, inside Iobrontes's temple.
The prototype focuses entirely on this dual-boss combat encounter, demonstrating the game's core mechanics, character abilities, directional defense system, party management, and visual identity.
1.2. Prototype Objectives
The prototype must:
1.	Implement a complete three-character party versus Iobrontes and Kosmelys.
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
13.	Implement Kosmelys's Cosmic Rays, Portal Shield, and sequential Meteor Rain with their specified targeting, defense, damage, counterattack, probability, and audio behavior.
14.	Keep the two bosses' health, status, abilities, and turns independent; victory requires defeating both bosses.
1.3. Out of Scope
This prototype will not include exploration, interactive dialogue, inventory, character progression, equipment selection, additional bosses beyond Iobrontes and Kosmelys, multiple arenas, or a complete save system.
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
The player controls three characters while Iobrontes and Kosmelys act as independent enemy bosses.
Each character has unique attacks and defensive behavior.
The combat continues until both bosses are defeated or all three party members are incapacitated.
4.2. Fixed Turn Order
The prototype will not calculate turn order using character speed.
Instead, the following sequence is fixed:
Turn Position	Acting Character
1	Furai
2	Iobrontes
3	Kosmelys
4	Dexios
5	Iobrontes
6	Kosmelys
7	Sahira
8	Iobrontes
9	Kosmelys
After turn position 9, the sequence restarts at position 1.
Furai
  ↓
Iobrontes
  ↓
Kosmelys
  ↓
Dexios
  ↓
Iobrontes
  ↓
Kosmelys
  ↓
Sahira
  ↓
Iobrontes
  ↓
Kosmelys
  ↓
Repeat
Iobrontes and Kosmelys each act three times during every complete nine-position cycle.
Incapacitated Characters
When a playable character reaches zero health:
•	They become incapacitated.
•	They cannot execute attacks or abilities.
•	Their turn is automatically skipped.
•	The combat continues with the remaining characters.
•	Their HUD must indicate that they are incapacitated.
For the initial implementation, only the incapacitated party member's turn is skipped. Boss positions in the fixed turn sequence remain unchanged. A defeated boss's remaining turns are skipped, not transferred to the other boss.
This means a boss may receive consecutive turns if a skipped party-member turn falls between two boss turns.
The battle only ends in defeat when all three playable characters have zero health.
4.3. Target Selection
During each Lightning Chain, Iobrontes selects exactly one active party member at random and keeps that target for all three lightning attacks.
Watch the Thunder targets all active party members simultaneously and requires no single-target selection.
For Cosmic Rays, Kosmelys selects one conscious playable character once per ability and keeps that target for both projectiles. Meteor Rain selects a conscious playable character independently for each of its five sequential meteors.
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
Health	550	550
Initial Sprite: iobrontes_base
Iobrontes is one of two independent bosses in the prototype. He has three actions: Lightning Chain, Watch the Thunder, and Divine Retribution. His co-boss, Kosmelys, has separate statistics, abilities, health, and turns as specified in the dual-boss combat sections.
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
The combat alternates between `assets/music/watch_the_thunder.mp3` and `assets/music/cosmic_strike.mp3`, playing each track from beginning to end while the encounter is active. Do not overlap or individually loop the battle tracks. When both bosses reach 0 Health, stop the active battle track and transition to `assets/music/nike.mp3`, which loops throughout the victory screen until the battle restarts.
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
•	`ataque_cosmico.mp3` plays on each Cosmic Rays projectile cast and midpoint direction change.
•	`abrir_portal.mp3` plays once when Portal Shield activates.
•	`teleport_ataque.mp3` plays once per ability redirected by Portal Shield.
•	`meteor_fall.mp3` plays when each Meteor Rain meteor begins its descent.
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
The player wins only when both Iobrontes and Kosmelys reach 0 Health. Iobrontes begins with 550 Health and Kosmelys with 450 Health. Defeating one boss does not end combat; the other continues taking its scheduled turns.
Once both bosses have reached zero Health:
1.	The current action finishes or is safely interrupted.
2.	The combat state changes to Victory.
3.	Combat inputs are disabled.
4.	The bosses' defeat frames or placeholders are displayed.
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
•	Boss ability-selection probabilities and availability rules.
•	Turn order.
•	Projectile timing.
•	Defense timing windows.
•	Ability phase timing, including sequential multi-hit and Meteor Rain events.
•	Character positions and scales.
•	Camera zoom and transition speed.
•	Animation references.
•	Visual effects.
•	Audio volume.
•	Audio resource paths and sound-effect event configuration.
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
13.4. Boss Attack Logic
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
Kosmelys independently selects Cosmic Rays (50%), Portal Shield (30%), or Meteor Rain (20%). If Portal Shield is unavailable because it is already active, redistribute its probability proportionally among the available abilities. Cosmic Rays targets one conscious character with both sequential projectiles, changes each projectile's direction once at its travel midpoint, and resolves each projectile once. Meteor Rain resolves five meteors strictly sequentially: the first has a 0.5-second casting phase and 0.5-second travel, and each following meteor begins falling as soon as the preceding perfect-parry window closes, with 0.7-second travel. Every meteor uses normal-block and perfect-parry windows relative to impact, character-specific results, and any eligible counterattacks. Portal Shield redirects one entire offensive ability to a conscious party member and observes its one-character-turn duration.
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
1.	The game displays all three playable characters, Iobrontes, and Kosmelys.
2.	The characters follow the required foreground/background formation.
3.	The fixed turn order works correctly.
4.	Incapacitated characters have their turns skipped.
5.	Iobrontes only targets active characters.
6.	The battle ends when both bosses reach zero Health or all three party members are incapacitated.
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
25.	Iobrontes begins with 550 Health; Kosmelys begins with 450 Health.
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
45.	Watch the Thunder and Cosmic Strike alternate without individually looping during combat.
46.	Sound effects accompany major combat actions.
47.	The battle remains visually readable at 1920 × 1080 resolution.
48.	Kosmelys's Cosmic Rays targets one party member for both projectiles; each changes direction at its midpoint, moves the same effect to the new directional origin without resetting remaining travel time, and resolves damage exactly once.
49.	Cosmic Rays applies the specified Dexios, Furai, and Sahira defensive and counterattack rules.
50.	Meteor Rain launches five meteors one at a time, with no overlapping projectile, targeting indicator, defensive window, or unresolved event; each new meteor begins falling as soon as the previous perfect-parry window closes.
51.	The first Meteor Rain meteor has a 0.5-second casting phase and 0.5-second travel; following meteors begin falling immediately after the preceding window closes and travel for 0.7 seconds. Every meteor has a 0.4-second normal-block window from T − 0.7 to T − 0.3, a 0.4-second perfect-parry window from T − 0.3 to T + 0.1, and resolves only after T + 0.1.
52.	Dexios counterattacks Kosmelys for 5 damage after every meteor he perfectly parries.
53.	Furai deals one 20-damage Tiger Parry after Meteor Rain only if he was targeted at least once and perfectly parried every meteor assigned to him.
54.	Sahira blocks any meteor with a correct W input in the full 0.8-second window; she has no perfect-parry result or counterattack.
55.	Meteor Rain applies Chaos generation, target exclusion for incapacitated characters, and the no-zoom camera behavior.
56.	Kosmelys's ability selection uses the 50% / 30% / 20% distribution and proportionally redistributes unavailable Portal Shield probability.
57.	The four Kosmelys sound effects play at their specified cast, direction-change, activation, redirection, and meteor-fall events without interrupting music.
58.	The dual-boss encounter keeps the nine-position turn order and ends in victory only after both bosses are defeated.
________________________________________
15. SUGGESTED IMPLEMENTATION ORDER
The prototype should be developed in stages, with each stage tested before moving to the next.
Stage 1 — Battlefield and Party Formation
•	Load the supplied temple background.
•	Place Iobrontes and Kosmelys in the background.
•	Place Furai, Dexios, and Sahira in the requested formation.
•	Configure sprite scaling and drawing order.
•	Implement the initial HUD.
Stage 2 — Combat State and Turn Order
•	Create the character statistics.
•	Implement the fixed nine-position turn sequence.
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
•	Add Kosmelys's Cosmic Rays, Portal Shield, and sequential Meteor Rain actions, with independent ability selection and boss state.
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
•	Add alternating background battle music.
•	Add existing and Kosmelys-specific combat sound effects.
•	Balance audio levels.
Stage 8 — Final Integration and Testing
•	Verify all damage calculations.
•	Verify resource consumption.
•	Verify the fixed turn sequence.
•	Test incapacitated-character behavior.
•	Test all defensive windows.
•	Verify that animations and camera transitions do not interrupt combat.
•	Confirm victory and defeat behavior.
•	Verify the nine-position dual-boss turn order, both boss health bars, and the requirement to defeat both bosses for victory.
________________________________________
16. VISUAL REFERENCES
The project's asset directory will contain the supplied reference frames for:
•	Dexios
•	Furai
•	Sahira
•	Iobrontes
•	Kosmelys
•	The temple background
•	Additional combat effects, where available
•	Dexios, Furai, and Sahira jump frames
•	Iobrontes's Watch the Thunder frame
•	Iobrontes's Divine Retribution electric-armor frame
These assets establish the visual identity and character appearances of the prototype.
The code must reference them through their registered names, allowing images to be replaced or improved without requiring changes to the core combat systems.
________________________________________
Core Design Specification — Version 0.3


# LA DEXÍADA — DUAL BOSS FIGHT UPDATE
**Design Document Update — Kosmelys Implementation**

**Target file:** `DESIGN.md`  
**Scope:** Expand the existing combat prototype into a simultaneous dual-boss encounter featuring Iobrontes and Kosmelys.

## IMPORTANT IMPLEMENTATION INSTRUCTIONS

Update the existing game and incorporate every change described below into `DESIGN.md`.

Do not rebuild the game from scratch. Preserve the existing combat mechanics, character statistics, attacks, defensive systems, animations, sound effects, and user interface unless a change is explicitly requested.

Kosmelys must be integrated as a second, fully functional boss fighting alongside Iobrontes.

Both bosses must be present on the battlefield simultaneously, with independent Health bars, abilities, combat states, and turns.

Reorganize the assets directory to accommodate the new Kosmelys sprites, effects, and music while keeping all previously implemented resources functional.

Any new values required for the implementation, including timing, damage, animation paths, probabilities, positioning, and camera behavior, should be placed in configuration files rather than hard-coded.

---

# 1. BOSS HEALTH AND DUAL-BOSS INTERFACE

## 1.1. Iobrontes — Health Update

Iobrontes's maximum Health is increased to **550 HP**.

Update his initial Health, maximum Health, HUD display, and any related configuration values.

All of his previously implemented abilities and mechanics must remain functional, including Divine Retribution if it is already present in the current build.

Do not change the existing attack probabilities unless required by another explicit instruction.

## 1.2. Kosmelys — New Boss

Add Kosmelys as a second boss.

**Full Title:** Kosmelys, Goddess of Space, Tenth Heir of Hera.

| Attribute | Value |
|---|---|
| Maximum Health | 450 |
| Initial Health | 450 |
| Role | Second boss |
| Element | Space / Cosmic Magic |
| Initial Sprite | `kosmelys_base.png` |
| Asset Source | `kosmelys_assets/` |

Kosmelys appears in the same arena as Iobrontes and fights alongside him.

Both bosses must be visible simultaneously.

The existing three playable characters—Furai, Dexios, and Sahira—remain in their current formation.

Kosmelys should be positioned near Iobrontes, in the background area of the battlefield, while maintaining enough separation to make their sprites, attacks, and effects visually distinguishable.

The exact positions and scales of both bosses must be adjustable through configuration.

## 1.3. Boss Health Bars

The boss interface must display two independent Health bars.

**Iobrontes**

- Display name: Iobrontes
- Subtitle: God of Thunder, Tenth Heir of Zeus
- Health: 550 / 550
- Bar color: Purple, with lightning-inspired styling

**Kosmelys**

- Display name: Kosmelys
- Subtitle: Goddess of Space, Tenth Heir of Hera
- Health: 450 / 450
- Bar color: Purple, with cosmic or spatial styling

Kosmelys's Health bar must be positioned directly below Iobrontes's Health bar.

Both bars must update independently when the corresponding boss receives damage.

Neither Health bar should disappear merely because the other boss has been defeated.

---

# 2. KOSMELYS — CHARACTER ASSETS AND ANIMATION STATES

All Kosmelys frames are provided in the `kosmelys_assets` directory.

Use the supplied artwork without changing her visual design.

Her default idle frame is:

`kosmelys_base.png`

Register the following animation states:

| State | Asset |
|---|---|
| Idle | `kosmelys_base.png` |
| Attack Right | `kosmelys_derecha.png` |
| Attack Left | `kosmelys_izquierda.png` |
| Attack Up | `kosmelys_arriba.png` |
| Attack Down | Temporary labeled placeholder (no supplied down frame) |
| Portal Shield | `kosmelys_escudo.png` |
| Meteor Rain | `kosmelys_mr.png` |

The file for Portal Shield should be resolved using its actual supplied filename and extension.

Preserve the actual filenames, including capitalization, because asset paths may be case-sensitive.

When Kosmelys performs an attack, she must switch from her idle frame to the corresponding action frame.

After her action finishes, she must return to `kosmelys_base.png`, except while Portal Shield remains active.

If an asset is missing, use an explicitly labeled temporary placeholder rather than an unrelated image.

---

# 3. KOSMELYS — ATTACK 1: COSMIC RAYS

## 3.1. Basic Description

**Ability Name:** Cosmic Rays  
**Number of Projectiles:** 2  
**Damage per Projectile:** 15  
**Maximum Total Damage:** 30  
**Target Count:** 1 playable character for both projectiles  
**Element:** Cosmic / Spatial  
**Projectile Effect:** `cosmico.png`

At the beginning of the ability, Kosmelys selects one random conscious playable character. Both projectiles target that same character; the target cannot change between projectiles. Only the targeted character responds to each projectile, and the player must not switch defensive control to another party member during the ability.

Each projectile is a separate attack event with its own direction, animation, movement, defensive timing, and damage resolution.

The projectiles must be launched sequentially, not as one combined hit. The second projectile begins only after the first has resolved.

The main mechanic is that **each cosmic projectile changes its attack direction exactly halfway through its journey**.

This makes Cosmic Rays fundamentally different from Iobrontes's Lightning Chain.

The player must observe the projectile's final direction before attempting to defend. The camera remains slightly focused on the selected target throughout both attacks, using the existing slight zoom behavior without obstructing directional indicators or the projectile's direction change.

## 3.2. Initial Direction

For each cosmic projectile, the game selects an initial direction. The two projectiles should use different initial directions.

The possible directions are:

- Up
- Down
- Left
- Right

When the initial direction is selected, Kosmelys activates the corresponding directional frame.

For example:

- Initial direction Left → `kosmelys_izquierda.png`
- Initial direction Right → `kosmelys_derecha.png`
- Initial direction Up → `kosmelys_arriba.png`
- Initial direction Down → a labeled temporary placeholder because no down frame was supplied

The projectile begins moving toward its target while Kosmelys displays the relevant casting pose.

## 3.3. Mid-Flight Direction Change

When a projectile reaches exactly **50% of its total travel time**, its direction changes.

The game randomly selects a new direction, but the new direction must be different from the original one.

The new direction is selected from the other three possibilities.

At this exact moment:

1. The original trajectory visibly changes.
2. The `cosmico.png` effect disappears from its previous trajectory.
3. The same projectile effect reappears at the appropriate attack origin for the newly selected direction and redirects toward the same target.
4. Kosmelys switches to the frame corresponding to the new direction.
5. The directional warning updates.
6. The player must now defend against the new direction.

The effect's relocation is a visual repositioning of the same attack event. It must not create an additional damaging projectile, reset the target, restart the casting sequence, or cause damage to be applied twice. Preserve the projectile's remaining travel time after the change. Both projectiles follow this behavior independently.

### Example

Kosmelys initially launches a cosmic projectile from the left.

Her displayed frame is:

`kosmelys_izquierda.png`

Halfway through the projectile's journey, the game changes its direction to Up.

Kosmelys immediately changes to:

`kosmelys_arriba.png`

The cosmic projectile changes trajectory and approaches the target from above.

The correct defensive input becomes **W**, not A.

The projectile continues its remaining movement and resolves according to the final direction.

This mechanic must happen independently for both cosmic projectiles.

## 3.4. Projectile Speed and Timing

Each Cosmic Rays projectile travels at **60% of the speed of an Iobrontes Lightning Chain projectile**.

This refers to movement speed, not total animation duration.

Therefore, Cosmic Rays projectiles should travel more slowly than Lightning Chain projectiles.

If the effective Lightning Chain travel time is 0.373 seconds for the same travel distance, the corresponding Cosmic Rays travel time should be approximately:

0.373 / 0.60 = 0.622 seconds.

This calculation is a reference. The implementation should compare effective projectile movement rather than blindly copying durations if projectile distances differ.

The speed reduction must not accidentally be applied twice.

The projectile must remain visually readable throughout the direction change.

The direction changes exactly once at the 50% travel point. Each projectile has an independent defensive window and resolves separately. The direction change and subsequent defense must not produce more than one damage resolution for a projectile.

## 3.5. Defensive Input and Character-Specific Results

Cosmic Rays uses the existing directional defense system.

The targeted character uses WASD:

| Key | Direction |
|---|---|
| W | Up |
| A | Left |
| S | Down |
| D | Right |

However, the defense must be evaluated using the projectile's **final direction**, not its initial one.

Because the projectile changes direction halfway through its journey, the implementation must ensure that the player cannot successfully resolve the attack before the final direction has been revealed.

Required behavior:

1. Show the projectile's initial direction during the first half of its movement.
2. Change the direction exactly at the midpoint.
3. Open the valid defensive input period at or after the direction change, so the player cannot resolve the attack before its final direction has been revealed.
4. Display the usual defense timing indicator.
5. Evaluate the input exclusively against the new direction.
6. Resolve the attack once its defensive window closes, exactly once.

The existing character-specific block damage rules remain active. A failed defense causes 15 damage. Successful imperfect blocks follow the existing character-specific blocking rules, and a perfect parry prevents damage. Configure precise Cosmic Rays input thresholds because the direction change leaves less reaction time than Lightning Chain.

**Dexios:** Each perfect parry prevents all damage and independently deals 5 counterdamage to Kosmelys. Perfect-parrying both projectiles deals 10 total counterdamage. Dexios does not need to parry both projectiles to trigger an individual counterattack.

**Furai:** He must perfectly parry both projectiles from the same Cosmic Rays ability to activate one counterattack. If both are parried, he takes no damage, displays `Tiger Parry`, activates `furai_ataque`, deals 20 damage to Kosmelys, then returns to his idle frame. If only one is perfectly parried, that projectile deals no damage but does not trigger a counterattack. A normal block or failed defense on either projectile prevents the chain counterattack. The counterattack can trigger only once per Cosmic Rays ability. This Cosmic Rays rule is separate from the three-parry Lightning Chain rule.

**Sahira:** She has no perfect parry or counterattack. Any correct directional input during the active defensive window prevents all damage. She must block both projectiles separately.

---

# 4. KOSMELYS — ATTACK 2: PORTAL SHIELD

## 4.1. Basic Description

**Ability Name:** Portal Shield  
**Type:** Defensive / Attack Redirection  
**Direct Damage:** 0  
**Activation Frame:** `kosmelys_escudo.png`
**Redirection Effect:** `portal.png`  
**Duration:** One allied character's turn

Kosmelys creates a spatial shield around herself.

The shield remains active until:

- A qualifying attack against Kosmelys triggers its redirection effect, or
- The next playable character finishes their turn without activating the shield.

Whichever happens first ends the shield.

While the shield remains active, Kosmelys displays her Portal Shield frame.

## 4.2. Attack Redirection

If a playable character attacks Kosmelys while Portal Shield is active, Kosmelys redirects that attack toward a random conscious playable character.

The redirected target may be:

- Dexios
- Furai
- Sahira

The target is selected randomly from all party members who still have Health remaining.

The character who launched the original attack may also be selected.

### Redirection Sequence

1. A playable character selects an offensive ability.
2. The player chooses Kosmelys as the target.
3. The game detects that Portal Shield is active.
4. The attack is intercepted by Kosmelys's spatial barrier.
5. The game randomly selects a conscious party member.
6. A portal effect appears over the newly selected target, using `portal.png`.
7. The attack is redirected toward that character.
8. The redirected attack applies its damage to the selected party member.
9. Portal Shield is consumed.
10. Kosmelys returns to `kosmelys_base.png`.

Kosmelys must not take damage from an attack successfully redirected by Portal Shield.

## 4.3. Multi-Hit Attacks

An offensive ability containing multiple hits is treated as **one ability** for the purposes of Portal Shield.

For example, Triple Lightning has three hits.

If Dexios uses Triple Lightning against a protected Kosmelys:

1. Portal Shield activates once.
2. One random conscious party member is selected.
3. All three hits are redirected toward that same character.
4. Each hit retains its original damage.
5. The shield disappears after the full ability resolves.

The game must not select a different random target for each hit.

The same principle applies to Furai's Tiger Fang.

## 4.4. Interaction with Other Abilities

**Furai — Armor Break**

Armor Break does not deal direct damage.

For this implementation, applying Armor Break does not trigger Portal Shield's attack redirection.

The existing tiger mark and damage amplification mechanics remain unchanged.

Armor Break should be associated with the enemy it is applied to. A mark applied to Iobrontes should not automatically amplify damage against Kosmelys.

**Dexios — Chaotic Lightning**

If Chaotic Lightning is redirected, its offensive damage is redirected to the selected party member.

Any self-damage associated with the ability remains attached to Dexios according to the existing implementation.

**Sahira — Hippopotamus Shield**

If the selected party member has an active Hippopotamus Shield, the redirected attack can be absorbed according to the existing shield rules.

For multi-hit attacks, each damaging hit is treated separately when consuming Hippopotamus Shield charges.

**Healing Abilities**

Healing does not target Kosmelys and therefore cannot activate Portal Shield.

## 4.5. Defensive Input During Redirection

For the first implementation, Portal Shield's redirection should resolve as a magical attack reflection rather than as another real-time directional attack.

The redirected target receives damage directly unless protected by an appropriate defensive effect such as Hippopotamus Shield.

WASD is not activated for this redirection.

This rule keeps the ability focused on strategic decision-making rather than duplicating Cosmic Rays or Lightning Chain.

## 4.6. Shield Expiration

Portal Shield lasts for only **one playable character turn**.

For example:

1. Kosmelys activates Portal Shield.
2. Furai's turn begins.
3. Furai chooses to attack Iobrontes rather than Kosmelys.
4. Furai finishes his action.
5. Kosmelys's Portal Shield expires automatically.
6. Kosmelys returns to her base frame.

The shield does not last for an entire party rotation.

If Kosmelys is attacked during the protected turn, the shield is consumed immediately after that attack is redirected.

Portal Shield cannot stack with itself.

If the shield is already active, Kosmelys should not waste another action refreshing it unless an explicit refresh mechanic is added later.

---

# 5. KOSMELYS — ATTACK 3: METEOR RAIN

## 5.1. Basic Description

**Ability Name:** Meteor Rain  
**Type:** Sequential Multi-Target Cosmic Attack  
**Number of Meteors:** 5  
**Damage per Meteor:** 20  
**Maximum Total Damage:** 100 across all targets  
**Casting Frame:** `kosmelys_mr.png`  
**Meteor Effect:** `meteoro.png`

Kosmelys summons five meteors that fall one after another toward the playable characters. The attack sequences must be strictly sequential and must never overlap.

Each meteor independently selects a target from the conscious party members.

Unlike Cosmic Rays, this ability may require the player to defend different characters in succession.

All meteors approach from above.

Therefore, their required defensive direction is always **Up (W)**.

## 5.2. Target Selection

Each meteor randomly selects one conscious party member.

Eligible targets are:

- Furai
- Dexios
- Sahira

The same character may be selected multiple times.

For example, a five-meteor sequence could target:

1. Dexios
2. Sahira
3. Dexios
4. Furai
5. Sahira

Each target must be visually identifiable before its meteor reaches the character.

If a character becomes incapacitated before a later meteor selects its target, that character must be removed from the random target pool.

## 5.3. Individual Meteor Timing and Defensive Windows

The first meteor has a 0.5-second casting/preparation phase followed by 0.5 seconds of visible travel. Each subsequent meteor begins falling as soon as the previous meteor's defense window closes and travels for 0.7 seconds. The impact time is T. Each meteor's 0.8-second defense window is:

| Timing relative to impact T | Result |
|---|---|
| Before T − 0.7 s | Input ignored |
| T − 0.7 s to T − 0.3 s | Normal block (0.4 s) |
| T − 0.3 s to T + 0.1 s | Perfect parry (0.4 s) |
| After T + 0.1 s | Failed defense if no valid input was registered |

For the first meteor, the attack sequence starts at 0 ms and impact occurs at 1000 ms; its active window opens at 300 ms, the perfect-parry period begins at 700 ms, and the window closes at 1100 ms. Each following meteor's impact occurs 700 ms after it starts falling; its active window opens immediately, the perfect-parry period begins at 400 ms, and the window closes at 800 ms. Do not resolve damage at the visual impact time.

The timing indicator is yellow during the normal-block window, white and glowing during the perfect-parry window, and inactive after the window closes. Sahira has no perfect-parry mechanic: any correct W input during either active period is a normal successful block.

The meteor reaches the target visually at T, but damage is not finalized at that moment. Wait until T + 0.1 seconds, then resolve the result and apply damage or counterattack. This allows a valid perfect parry shortly after visual impact. Every meteor resolves damage exactly once.

## 5.4. Sequential Meteor Sequence — No Overlap

Each meteor must complete its entire attack sequence before the next meteor begins. There must never be more than one active meteor, targeting indicator, defensive window, or unresolved meteor attack at the same time.

For each of the five meteors, in order:

1. Randomly select one conscious playable character.
2. Display the targeting indicator above that character.
3. For the first meteor, begin the 0.5-second casting phase. For each following meteor, begin its fall immediately after the previous defensive window closes.
4. Launch `meteoro.png` toward the target; the first meteor travels for 0.5 seconds and each following meteor travels for 0.7 seconds.
5. Allow the player to defend using W during the active defensive window.
6. Wait until the defensive window closes at T + 0.1 seconds.
7. Resolve the block, perfect parry, or failed defense.
8. Apply damage and any applicable counterattack.
9. Display the defensive result and remove the resolved meteor.
10. Begin the next meteor's fall immediately, without an extra delay or casting phase.

Repeat until all five meteors have resolved. The meteor must disappear before the next one begins. Do not advance to the next combat turn until the ability and any eligible counterattack have fully completed.

## 5.5. Defensive Inputs and Character-Specific Results

Each meteor requires an individual defensive response. The correct input is always **W — Defend Up**. Every meteor has its own attack identifier, target, projectile, casting and travel timers, input result, and resolution state. One W press resolves only the current meteor; it cannot block multiple meteors. In this sequential system, input overlap is not possible.

**Dexios**

- Normal block: receives 5 damage.
- Perfect parry: receives 0 damage and independently counterattacks Kosmelys for 5 damage.
- Failed defense: receives 20 damage.
- Each individual perfect parry triggers its own 5-damage counterattack against Kosmelys; Dexios need not perfect-parry the full Meteor Rain.
- If Dexios takes damage, he continues to generate Chaos energy according to the existing rules.

**Furai**

- Normal block: receives 5 damage.
- Perfect parry on an individual meteor: receives 0 damage, with no immediate counterattack.
- Failed defense: receives 20 damage.
- Furai must perfectly parry every meteor assigned to him during this Meteor Rain to trigger one 20-damage counterattack. He must be targeted at least once; meteors assigned to other characters do not count against him.
- Track all meteors assigned to Furai during the ability. Initialize this tracking for each Meteor Rain, and clear it when the ability ends. If any assigned meteor is normally blocked or missed, he does not qualify.
- After all five meteors resolve, check Furai's assigned results. If all are perfect parries, display `Tiger Parry`, activate `furai_ataque`, deal 20 damage to Kosmelys, and return Furai to his idle frame. This counterattack triggers at most once per Meteor Rain.

Example: for the targets Dexios, Furai, Sahira, Furai, Dexios, Furai must perfectly parry meteors 2 and 4. If both are perfect parries, he counterattacks; if either is a normal block or failed defense, he does not.

**Sahira**

- She has no perfect-parry or counterattack mechanic.
- Any correct W input during the full 0.8-second window prevents all damage.
- A failed defense causes 20 damage.
- Do not display a Perfect Parry result. Show a single successful-block indicator throughout the active window.

## 5.6. Camera, Targeting, and Sound Effects

**Meteor Rain must not use individual target camera zooms.**

The camera stays at its normal battlefield position throughout the ability.

All three playable characters must remain visible. Only one meteor and one targeting indicator are active at a time.

The game must communicate the current target through:

- A warning indicator above the targeted character.
- The falling meteor's visible trajectory.
- A timing indicator associated with that character.
- Distinct visual effects at impact.

Play `meteor_fall.mp3` once for each meteor when its visible descent begins. The audio system must allow separate sound instances if needed without cutting off another meteor sound.

## 5.7. Damage Resolution

Each meteor deals 20 damage if it is not successfully defended against.

Damage is calculated separately for each meteor only after its defensive window closes at T + 0.1 seconds.

If a meteor is prevented by Hippopotamus Shield, consume one shield charge for that hit.

If a targeted character becomes incapacitated, safely resolve or cancel that pending attack without errors; exclude the character from subsequent target selection.

The ability ends only after all five meteor sequences have resolved or the battle has entered a terminal state.

---

# 6. PLAYER ATTACK TARGET SELECTION

The combat system must now support choosing between two enemy bosses.

Before executing an offensive ability, the player must select the intended enemy target:

- Iobrontes
- Kosmelys

Both bosses must appear as selectable targets while they are conscious.

## 6.1. Target Selection Sequence

1. The active playable character opens their ability menu.
2. The player selects an ability.
3. If the ability targets an enemy, a boss selection interface appears.
4. The player chooses Iobrontes or Kosmelys.
5. The selected boss is visually highlighted.
6. The character executes the ability.
7. Damage and effects are applied to the selected boss.

If one boss has been defeated, that boss becomes unavailable as a target.

The remaining boss must continue fighting normally.

## 6.2. Ability Targeting Rules

| Ability | Target Type |
|---|---|
| Dexios — Triple Lightning | Iobrontes or Kosmelys |
| Dexios — Electric Arc | Iobrontes or Kosmelys |
| Dexios — Chaotic Lightning | Iobrontes or Kosmelys |
| Furai — Tiger Spear | Iobrontes or Kosmelys |
| Furai — Tiger Fang | Iobrontes or Kosmelys |
| Furai — Armor Break | Iobrontes or Kosmelys |
| Sahira — Jackal Strike | Iobrontes or Kosmelys |
| Sahira — Hippopotamus Healing | Conscious playable ally |
| Sahira — Hippopotamus Shield | Conscious playable ally |

Healing and defensive support abilities retain their ally selection menus.

Enemy-targeting abilities must correctly interact with Portal Shield when Kosmelys is protected.

## 6.3. Targeting Visuals

The selected enemy should receive a visible outline, marker, or other targeting indicator.

The interface must show which boss is currently selected before the attack begins.

If the player cancels target selection, the game should return to the ability menu without spending resources or ending the turn.

Resource costs are deducted only after the ability and its target are confirmed.

---

# 7. AUDIO — ALTERNATING BATTLE MUSIC

The current battle soundtrack must be expanded to alternate between two songs.

The existing battle track is:

`watch_the_thunder.mp3`

The new battle track is:

`cosmic_strike.mp3`

Both audio files must be loaded from the project's music assets directory.

## 7.1. Playback Sequence

At the beginning of combat, play:

**Watch the Thunder**

When the song finishes naturally, immediately start:

**Cosmic Strike**

When Cosmic Strike finishes naturally, immediately restart:

**Watch the Thunder**

This sequence repeats continuously while the encounter remains active.

The intended playback order is:

Watch the Thunder → Cosmic Strike → Watch the Thunder → Cosmic Strike → Repeat.

## 7.2. Playback Rules

- Each song must play from beginning to end.
- Do not loop either song individually.
- The music system must automatically detect when the current track finishes.
- The next track begins immediately after the previous one ends.
- Do not play both tracks simultaneously.
- Avoid gaps, unintended silence, or unwanted overlap between tracks.
- The alternation must work regardless of which boss is currently taking a turn.

The music alternation is independent of turn order and attack selection.

## 7.3. Victory and Defeat

When both bosses are defeated:

1. Stop the active battle track.
2. Transition to the existing victory music, `nike.mp3`.
3. Continue the normal victory sequence.

If all three playable characters are defeated, stop the battle music and trigger the existing defeat sequence.

The alternating music system must stop once combat ends.

Browser autoplay restrictions must still be respected.

## 7.4. Kosmelys Sound Effects

Register the following sound effects in the existing audio configuration. They play alongside background music and must not interrupt it. Store their paths and volume values in the existing audio configuration.

| Combat event | Sound file | Playback requirement |
|---|---|---|
| Each Cosmic Rays projectile cast | `ataque_cosmico.mp3` | Play at the actual cast event. |
| Each Cosmic Rays projectile direction change | `ataque_cosmico.mp3` | Play at the actual midpoint direction-change event. |
| Portal Shield activation | `abrir_portal.mp3` | Play once when `kosmelys_escudo` activates; do not repeat while the shield remains active. |
| Portal Shield redirection | `teleport_ataque.mp3` | Play when `portal.png` appears above the redirected target; once per redirected ability, not per hit. Do not play if the shield expires without redirecting an attack. |
| Each falling Meteor Rain meteor | `meteor_fall.mp3` | Play when that meteor begins its visible descent. |

Cosmic Rays normally produces four `ataque_cosmico.mp3` events per ability: one cast and one direction change for each of its two projectiles. Allow separate sound instances to play when necessary. Meteor Rain produces five `meteor_fall.mp3` events per ability, one as each sequential meteor begins falling. If a previous sound is still playing when the next meteor starts, allow the new sound instance without cutting off the previous one. Do not replace the battle music or existing sound effects.

---

# 8. ASSET DIRECTORY REORGANIZATION

Reorganize the asset directory to clearly separate each character's frames, enemy effects, music, and sound effects.

The recommended structure is:

```text
assets/
│
├── dexios/
│   └── [existing Dexios frames]
│
├── furai/
│   └── [existing Furai frames]
│
├── sahira/
│   └── [existing Sahira frames]
│
├── iobrontes/
│   └── [existing Iobrontes frames]
│
├── kosmelys/
│   ├── kosmelys_base.png
│   ├── kosmelys_derecha.png
│   ├── kosmelys_izquierda.png
│   ├── kosmelys_arriba.png
│   ├── kosmelys_escudo.png
│   ├── kosmelys_herida.png
│   └── kosmelys_mr.png
│
├── effects/
│   ├── cosmico.png
│   ├── portal.png
│   ├── meteoro.png
│   ├── tiger-mark.png
│   ├── hippo-mark.png
│   └── [existing combat effects]
│
├── music/
│   ├── watch_the_thunder.mp3
│   ├── cosmic_strike.mp3
│   └── nike.mp3
│
├── sfx/
│   ├── ataque_cosmico.mp3
│   ├── abrir_portal.mp3
│   ├── teleport_ataque.mp3
│   ├── meteor_fall.mp3
│   └── [existing sound effects]
│
└── backgrounds/
    └── escenario.png
```

The Kosmelys character frames are supplied in `kosmelys_assets/`. Copy them into `assets/kosmelys/`, and place `cosmico.png`, `portal.png`, and `meteoro.png` in `assets/effects/`. The supplied directory has no down-attack frame, so display a labeled temporary placeholder instead.

Use the exact filename and extension found in the supplied asset directory when registering each file. The names above represent the expected organization and must not be used to silently rename files whose actual names differ.

### Asset Migration Rules

1. Preserve all existing asset files.
2. Do not delete or overwrite existing sprites.
3. Update all asset references in the Phaser preload system.
4. Keep character frames separate from projectile effects.
5. Update the asset configuration or manifest file.
6. Verify that every existing attack still loads its correct resources.
7. Verify that every Kosmelys ability displays the intended frame and effect.
8. Update `DESIGN.md` to reflect the new paths and asset organization.

The asset reorganization must not break any previously implemented combat mechanics.

---

# 9. DUAL-BOSS COMBAT RULES

## 9.1. Independent Bosses

Iobrontes and Kosmelys are independent enemies.

Each boss has:

- Its own Health.
- Its own ability selection.
- Its own action animations.
- Its own combat turn.
- Its own temporary status effects.
- Its own defeated state.

Both bosses must be present at the beginning of the encounter.

## 9.2. Victory Condition

The player wins only when **both Iobrontes and Kosmelys reach zero Health**.

Defeating one boss does not end the battle.

The surviving boss continues acting normally.

Once defeated, a boss:

- Cannot be selected as a target.
- Cannot use abilities.
- Cannot receive additional turns.
- Cannot activate defensive effects.
- No longer participates in enemy target selection or attack resolution.

The existing victory music and victory screen must trigger only after both bosses have been defeated.

## 9.3. Defeat Condition

The defeat condition remains unchanged.

The player loses when Dexios, Furai, and Sahira have all reached zero Health.

If one or two playable characters are incapacitated, the battle continues.

## 9.4. Compatibility with Existing Abilities

All existing mechanics must continue functioning in the dual-boss encounter.

In particular:

- Dexios continues generating Chaos energy when taking eligible damage.
- Furai's Armor Break remains attached to its selected boss.
- Sahira can heal or protect conscious allies.
- Hippopotamus Shield can protect against damaging attacks, including eligible redirected attacks and meteors.
- Iobrontes retains his existing abilities and unique defensive interactions.
- Kosmelys's Portal Shield only redirects attacks intended for Kosmelys.

Boss-specific status effects must not automatically transfer from one boss to the other.

## 9.5. Kosmelys Ability Selection

Kosmelys has three available abilities:

1. Cosmic Rays
2. Portal Shield
3. Meteor Rain

Select an ability using these configurable probabilities, independently from Iobrontes's ability-selection system:

| Ability | Probability |
|---|---:|
| Cosmic Rays | 50% |
| Portal Shield | 30% |
| Meteor Rain | 20% |
| **Total** | **100%** |

These probabilities apply each time Kosmelys selects an ability. If Portal Shield is already active and cannot be selected again, redistribute its 30% probability proportionally across the currently available attacks for that selection; do not waste Kosmelys's turn. For example, when only Cosmic Rays and Meteor Rain remain available, redistribute their probabilities in the original 50:20 ratio. Keep the selected attack's existing announcement, frame activation, animation, damage, and resolution behavior.

Existing Iobrontes attack probabilities must remain unchanged.

---

# 10. TECHNICAL VALIDATION

After implementing the dual-boss update, verify the following behavior.

### Kosmelys

- Kosmelys spawns alongside Iobrontes.
- She starts with 450 Health.
- Her Health bar appears below Iobrontes's.
- Cosmic Rays launches two projectiles.
- Each projectile deals 15 damage if undefended.
- One conscious party member is selected once and targeted by both projectiles.
- The camera remains slightly focused on that selected character through both projectiles.
- Every cosmic projectile changes direction at the exact midpoint of its journey.
- The new direction always differs from its initial direction.
- The two projectiles use different initial directions.
- Kosmelys switches to the corresponding frame when the direction changes.
- The `cosmico.png` effect disappears from its old trajectory and reappears at the new directional origin.
- Repositioning preserves the target and remaining travel time, does not restart casting, and never creates an extra damage event.
- Cosmic Rays moves at 60% of Lightning Chain's projectile speed.
- Dexios counterattacks for 5 damage after each Cosmic Rays perfect parry.
- Furai counterattacks for 20 damage only after perfectly parrying both Cosmic Rays projectiles; one missed or normal-blocked projectile prevents the counter.
- Sahira blocks each Cosmic Rays projectile separately and has no perfect parry or counterattack.
- Portal Shield redirects one complete offensive ability to one randomly selected conscious party member.
- Portal Shield expires after one allied turn if not triggered.
- Portal Shield uses `portal.png` when redirecting damage.
- Portal Shield activation and redirection sounds play only at their specified events.
- Meteor Rain launches five meteors.
- Every meteor deals 20 damage if undefended.
- All meteor attacks originate from above.
- Meteors can target the same character repeatedly.
- Meteors resolve strictly one at a time: no more than one meteor, targeting indicator, defensive window, or unresolved event is active.
- The first meteor has a 0.5-second casting phase and 0.5-second travel; every following meteor begins falling as soon as the previous defense window closes and travels for 0.7 seconds.
- Every meteor's normal-block window runs from T − 0.7 to T − 0.3, and its perfect-parry window runs from T − 0.3 to T + 0.1; damage resolves only after T + 0.1.
- Dexios counterattacks for 5 damage after every Meteor Rain perfect parry.
- Furai counterattacks once for 20 damage after all five meteors only if every meteor targeting him was perfectly parried and he was targeted at least once.
- Sahira blocks any meteor with a correct W input during the full 0.8-second window, without a perfect-parry result.
- `meteor_fall.mp3` plays when each meteor begins its visible descent.
- Meteor Rain does not zoom the camera toward individual targets.
- Kosmelys's ability probabilities are 50% Cosmic Rays, 30% Portal Shield, and 20% Meteor Rain; when Portal Shield is unavailable, redistribute its probability proportionally across the available attacks.
- `ataque_cosmico.mp3` plays on each projectile cast and direction change; `abrir_portal.mp3` on shield activation; `teleport_ataque.mp3` on redirection.
- All four new Kosmelys sound files are registered with configurable paths and volumes and do not interrupt the battle music.

### Existing Combat

- Iobrontes starts with 550 Health.
- All previously specified Iobrontes and playable-character mechanics remain functional.
- Both bosses have independent Health values.
- Enemy-targeting abilities can select either boss.
- Healing and support abilities continue selecting allies.
- Furai's Armor Break applies to the chosen boss only.
- Sahira's defensive behavior remains unchanged.
- Incapacitated characters cannot act or be selected as new attack targets.
- The fight continues after one boss is defeated.
- Victory occurs only when both bosses are defeated.

### Assets and Audio

- All existing assets remain functional.
- Kosmelys's frames load correctly.
- `cosmico.png`, `portal.png`, and `meteoro.png` display correctly.
- The two battle songs alternate automatically.
- Victory music starts only when both bosses have been defeated.
- The asset manifest and `DESIGN.md` reflect the new project structure.
- The fixed nine-position turn order remains unchanged.
- The dual-boss victory and defeat conditions remain unchanged.

---

# 11. NEW FIXED TURN ORDER

The prototype continues to use a fixed turn sequence.

Do not implement character Speed statistics or dynamic initiative calculations.

The new combat order is:

| Position | Acting Character |
|---|---|
| 1 | Furai |
| 2 | Iobrontes |
| 3 | Kosmelys |
| 4 | Dexios |
| 5 | Iobrontes |
| 6 | Kosmelys |
| 7 | Sahira |
| 8 | Iobrontes |
| 9 | Kosmelys |

After position 9, the sequence returns to position 1.

### Complete Turn Cycle

```text
Furai
  ↓
Iobrontes
  ↓
Kosmelys
  ↓
Dexios
  ↓
Iobrontes
  ↓
Kosmelys
  ↓
Sahira
  ↓
Iobrontes
  ↓
Kosmelys
  ↓
REPEAT
```

Each complete nine-position cycle contains:

- One turn for Furai.
- One turn for Dexios.
- One turn for Sahira.
- Three turns for Iobrontes.
- Three turns for Kosmelys.

## 11.1. Incapacitated Characters

If a playable character has zero Health, skip their turn.

The other positions in the sequence remain unchanged.

Do not remove the boss turns that occur before or after the incapacitated character's turn.

## 11.2. Defeated Bosses

If Iobrontes or Kosmelys has zero Health, skip that boss's remaining turns.

The surviving boss continues acting whenever its own position is reached.

Do not transfer turns from a defeated boss to the surviving boss.

For example, if Kosmelys is defeated, the sequence continues with the remaining active turn positions:

Furai → Iobrontes → Dexios → Iobrontes → Sahira → Iobrontes → Repeat.

## 11.3. Turn Resolution

Each action must finish completely before the next turn begins.

This includes:

- Attack animations.
- Projectile movement.
- Defensive input windows.
- Damage calculations.
- Status effect activation or expiration.
- Counterattacks.
- Camera transitions.
- Victory or defeat checks.

A new turn must not begin while a previous action is still being resolved.

**This nine-position sequence is the required turn order for the current dual-boss prototype.**

---

**End of Dual Boss Update — Kosmelys Implementation**
