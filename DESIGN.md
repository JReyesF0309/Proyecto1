LA DEXÍADA — GAME DESIGN DOCUMENT
Version: 0.6 — Four-Character Dual-Boss Combat Prototype
Document Status: Implementation Specification
Target Platform: PC (Phaser, browser)
Genre: Turn-Based RPG with Real-Time Directional Defense
Visual Perspective: 2D character-based combat with foreground/background depth
Prototype Scope: Four playable characters, two bosses, one arena, and one complete dual-boss combat encounter.
Note to the implementer: This document is intended to be self-contained. Implement the mechanics and values described here without relying on previous versions. Numerical values, timings, character positions, camera settings, and animation references must be stored in configuration files whenever possible.
________________________________________
1. GAME OVERVIEW
1.1. Game Description
La Dexíada is a fantasy RPG inspired by Greek mythology, set in Xantharchía, a world where gods, divine heirs, and mortals coexist within a society shaped by magic.
The combat system combines turn-based strategic decisions with real-time directional defense. During their turns, players select attacks or abilities for their characters. During enemy turns, they must identify the direction of incoming attacks and press the corresponding defensive key at the correct moment.
The player controls a party of four characters:
•	Dexios: A lightning-based fighter who uses electricity and Chaos energy.
•	Furai: A tiger-themed fighter specializing in physical attacks, armor breaking, and defensive counterattacks.
•	Sahira: A jackal-themed fighter and healer with strong defensive capabilities.
•	Hazel Lancaster: A precision defender who alternates between Ignis (fire) and Glacio (ice).
The party faces Iobrontes, God of Thunder and the Tenth Heir of Zeus, and Kosmelys, Goddess of Space and Tenth Heir of Hera, inside Iobrontes's temple.
The prototype focuses entirely on this dual-boss combat encounter, demonstrating the game's core mechanics, character abilities, directional defense system, party management, and visual identity.
1.2. Prototype Objectives
The prototype must:
1.	Implement a complete four-character party versus Iobrontes and Kosmelys.
2.	Use a fixed turn order without a speed-stat system.
3.	Allow each playable character to execute their unique abilities.
4.	Implement Iobrontes's three-hit directional Lightning Chain, team-targeting Watch the Thunder, and Divine Retribution.
5.	Allow the targeted character to defend using WASD and all active characters to jump together using Space.
6.	Implement the distinct defensive mechanics for Dexios, Furai, Sahira, and Hazel.
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

1.4. Hazel Lancaster — Fourth Playable Character
Hazel starts each battle with 80 / 80 Health in Ignis form. Her Ignis and Glacio forms share the same Health; switching forms does not restore or change it. Hazel has no Mana, Chaos, or ability costs. Her HUD shows IGNIS in orange or GLACIO in light blue in place of a resource bar, and switches between the supplied fire and ice portraits.

Hazel has exactly two abilities in each form:

| Form | Ability | Targets | Effect |
|---|---|---|---|
| Ignis | Flame Dance | Every living boss | 30 fire damage to each; use the `hazel_fuego_dance` action frame and `fuego` impact effect. |
| Ignis | Glacio Shift | One selected living boss | Show `hazel_cambio`, change to Glacio, then launch one `hielo_debil` projectile for 10 damage. |
| Glacio | Figure Shards | One selected living boss | Use the `hazel_hielo_shards` action frame and `hielo` impact effect for 60 damage. |
| Glacio | Ignis Shift | Every living boss | Show `hazel_cambio`, change to Ignis, then launch one `fuego_debil` projectile per living boss for 5 damage each. |

Both Shift actions are a single turn action. Multi-target attacks skip individual boss selection; single-target attacks use the existing living-boss selection flow. Each action plays its specified `flame`, `shard`, and/or `shift` sound once at release/transformation, applies damage once per valid target, and returns Hazel to the idle sprite for her current form. A boss at zero Health cannot be targeted or damaged.

Hazel uses the existing directional input and timing windows. A correct normal/imperfect block and a missed/wrong-direction input each cause full incoming attack damage; only a Perfect Parry avoids damage. Hazel has no parry counterattack. Existing protective effects, including Sahira's Hippopotamus Shield, still apply. The team-wide Space jump and direct/unavoidable boss attacks retain their existing rules.

Keep Hazel's fixed turn slot editable and label its current placement immediately after Sahira as provisional; do not change the relative order of the other turns or introduce Speed-based initiative.
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
The four playable characters stand closer to the camera, facing Iobrontes and Kosmelys.
Iobrontes and Kosmelys stand farther away, facing the party and the camera. Both bosses must be visible simultaneously.
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
Hazel — Configured fourth position
•	Use Hazel's configured position and depth so her sprite remains readable without unnecessarily moving the established characters.
•	Facing Iobrontes.
Iobrontes — Background
•	Positioned approximately in the center of the arena.
•	Standing farther away than all four party members.
•	Facing the playable characters.
•	His upright posture must communicate divine authority.
Kosmelys — Background
•	Positioned near Iobrontes in the background area.
•	Separated enough from Iobrontes to distinguish both sprites, attacks, and effects.
•	Facing the playable characters.
Formation Diagram
                  TEMPLE BACKGROUND

              IOBRONTES   KOSMELYS

       FURAI     HAZEL
                     DEXIOS
                                  SAHIRA


                        CAMERA
This diagram indicates approximate spatial relationships, not exact pixel coordinates.
All positions and scales must be stored as editable configuration values.
Scene Layering
From back to front:
1.	Temple background and sky.
2.	Iobrontes.
3.	Kosmelys.
4.	Background magical effects.
5.	Furai.
6.	Dexios.
7.	Sahira.
8.	Foreground magical effects.
9.	Combat HUD and directional indicators.
The final draw order may be adjusted dynamically for attack effects, but the party formation must maintain a consistent sense of depth.
2.4. Camera Behavior
The camera normally displays the complete battlefield, including all four playable characters, Iobrontes, and Kosmelys.
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
Boss positions and scales must also be configurable. Keep both bosses visible together without allowing their sprites, attacks, or effects to obscure one another.
________________________________________
3. ASSET AND ANIMATION SYSTEM
3.1. Asset Availability
All provided character frames will be included in the project's asset directory.
The implementation must load the supplied graphical resources using their specified asset names.
The asset loading system must allow images to be replaced without modifying the combat logic. Kosmelys's frames and effects are provided in `kosmelys_assets/`; preserve their actual filenames and capitalization, and register them through the asset configuration system.
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
Kosmelys uses `kosmelys_base.png` as her idle frame, `kosmelys_derecha.png`, `kosmelys_izquierda.png`, and `kosmelys_arriba.png` for directional attacks, `kosmelys_escudo.png` for Portal Shield, and `kosmelys_mr.png` for Meteor Rain. Use a clearly labeled placeholder for the missing downward attack frame. Resolve the Portal Shield file using its actual supplied filename and extension. Return her to `kosmelys_base.png` after an action unless Portal Shield remains active. Do not change the supplied artwork's design.
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
The player controls four characters while Iobrontes and Kosmelys act as independent enemy bosses.
Each character has unique attacks and defensive behavior.
The combat continues until both bosses are defeated or all four party members are incapacitated.
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
8	Hazel (provisional)
9	Iobrontes
10	Kosmelys
Hazel's configured slot immediately after Sahira is provisional. After turn position 10, the sequence restarts at position 1.
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
Hazel (provisional)
  ↓
Iobrontes
  ↓
Kosmelys
  ↓
Repeat
Iobrontes and Kosmelys each act three times during every complete ten-position cycle. Hazel's turn is configuration-controlled; every other turn keeps its existing relative position.
Incapacitated Characters
When a playable character reaches zero health:
•	They become incapacitated.
•	They cannot execute attacks or abilities.
•	Their turn is automatically skipped.
•	The combat continues with the remaining characters.
•	Their HUD must indicate that they are incapacitated.
For the initial implementation, only the incapacitated party member's turn is skipped. Boss positions in the fixed turn sequence remain unchanged. A defeated boss's remaining turns are skipped, not transferred to the other boss.
This means a boss may receive consecutive turns if a skipped party-member turn falls between two boss turns.
The battle only ends in defeat when all four playable characters have zero health.
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
Spiritual Energy	0	100
Initial Frame: furai_base
Furai specializes in physical attacks and techniques associated with the tiger.
6.2. Ability 1 — Tiger Spear
Damage: 15
Spiritual Energy Cost: 0
Type: Single physical strike
Frame: furai_ataque
Furai performs a single physical attack against Iobrontes.
The attack deals 15 damage and produces a visible impact effect.
It does not consume Spiritual Energy. A successful hit restores 30 Spiritual Energy, up to 100.
6.3. Ability 2 — Tiger Fang
Damage: 20 × 2 = 40
Spiritual Energy Cost: 20
Type: Two-hit physical attack
Frame: furai_tigre
Furai attacks Iobrontes twice in succession.
Each hit deals 20 damage, for a total of 40.
Each hit must have its own impact effect.
The ability consumes 20 Spiritual Energy when executed.
6.4. Ability 3 — Armor Break
Damage: 0
Spiritual Energy Cost: 25
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
•	Tiger Fang: 40 → 60 total damage.
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
Each successful Tiger Parry restores 30 Spiritual Energy, up to 100.
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
Initial Frame: sahira_base
Sahira specializes in physical attacks, healing, and defensive techniques.
7.2. Ability 1 — Jackal Strike
Damage: 15
Uses: Unlimited
Type: Single physical strike
Frame: sahira_ataque
Sahira performs a physical attack against Iobrontes.
The attack deals 15 damage and produces a visible impact effect.
It has no per-fight use limit.
7.3. Ability 2 — Hippopotamus Healing
Healing: Full restoration of the selected ally's Health
Uses: 2 per fight
Type: Healing ability
Frame: sahira_cura
Sahira performs a healing ability that completely restores one selected party member's health.
When this ability is selected, a targeting menu appears.
The player can choose:
•	Dexios
•	Furai
•	Sahira
•	Hazel
The healing effect restores the selected character to their maximum Health value.
Each successful use consumes one of the two uses available for the fight.
Healing Target Selection
1.	The player selects Hippopotamus Healing.
2.	The game displays all four party members.
3.	The player selects the character to heal.
4.	Sahira's healing frame activates.
5.	A healing effect appears over the selected character.
6.	The character's Health is restored to maximum.
For the initial implementation, healing applies to conscious party members only and does not revive incapacitated allies. Incapacitated characters remain visible in the selection interface but are disabled as healing targets.
This rule can be changed later if revival abilities are introduced.
7.4. Ability 3 — Hippopotamus Shield
Uses: 10 per fight
Type: Defensive support ability
Frame: sahira_cura
Sound: cura.mp3
Sahira selects one conscious ally to protect. The `assets/effects/hippo-mark.png` image appears at the center of the target and displays the two remaining blocked attacks.
Each successful use consumes one of the ten uses available for the fight. The shield prevents all damage from the target's next two incoming attacks that are not perfectly parried, then disappears. An incoming attack consumes one shield charge unless the target performs a perfect parry. Incapacitated allies cannot be selected.
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
Pressing Space during the jump window makes all active party members jump at the same time. Use each character's current-form jump frame, including Hazel's Ignis or Glacio jump. A successful team jump avoids the attack completely. There is no perfect or imperfect result: each character who does not jump takes 50 damage, unless an active Hippopotamus Shield blocks that hit.
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
8.5. Boss — Kosmelys
Full Title: Kosmelys, Goddess of Space, Tenth Heir of Hera
Role: Second boss
Element: Space / Cosmic Magic
Initial Health: 450
Maximum Health: 450
Initial Sprite: `kosmelys_base.png`
Asset Source: `kosmelys_assets/`
Kosmelys fights alongside Iobrontes in the same arena. Her Health, abilities, combat state, temporary status effects, and turns are independent. She selects Cosmic Rays (50%), Portal Shield (30%), or Meteor Rain (20%) independently from Iobrontes. If Portal Shield is already active and unavailable, redistribute its probability proportionally across the available abilities; do not waste her turn. Preserve Iobrontes's existing ability probabilities.
Kosmelys's abilities are specified in the dual-boss update below: Cosmic Rays fires two 15-damage projectiles at the same selected conscious character; Portal Shield redirects one complete offensive ability to one randomly selected conscious party member and lasts one playable-character turn; Meteor Rain targets five sequential meteors at a conscious party member, selecting again for each meteor. Use the ability-specific direction changes, timing windows, defensive outcomes, counterattacks, animation, and damage rules specified in the detailed ability sections below.
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
God of Thunder, Tenth Heir of Zeus
Below the name is a purple lightning-themed Health bar.
Health: 550 / 550
The bar updates whenever Iobrontes takes damage.
Its appearance should be inspired by purple lightning, matching his attacks and divine identity.
Kosmelys's independent Health bar appears directly below Iobrontes's. It displays:
Kosmelys
Goddess of Space, Tenth Heir of Hera
Health: 450 / 450
Use purple styling with a cosmic or spatial appearance. Update both bars independently, and do not hide either bar merely because the other boss has been defeated.
10.2. Party HUD
The player must be able to see the status of all four playable characters.
Each character has an individual HUD panel.
Dexios
•	Health: Green bar — 100 / 100.
•	Mana: Blue bar — 100 / 100.
•	Chaos Energy: Red bar — 0 / 100.
Furai
•	Health: Green bar — 80 / 80.
•	Spiritual Energy: White bar — 0 / 100.
Sahira
•	Health: Green bar — 125 / 125.
•	No Mana bar; show ability-use counts for Hippopotamus Healing (2) and Hippopotamus Shield (10).
Hazel
•	Health: Green bar — 80 / 80.
•	No Mana or Chaos bar; show the current Ignis/Glacio form instead.
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
Tiger Fang	20 Spiritual Energy
Armor Break	25 Spiritual Energy
Sahira
Ability	Cost
Jackal Strike	Unlimited
Hippopotamus Healing	2 uses per fight
Hippopotamus Shield	10 uses per fight
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
11.1. Welcome Music
The `escena_bienvenida` scene plays `assets/music/start.mp3` on a loop. Stop the track when the scene shuts down and combat begins.
11.2. Background Battle Music
The combat alternates between `assets/music/watch_the_thunder.mp3` and `assets/music/cosmic_strike.mp3`, playing each track from beginning to end while the encounter is active. Do not overlap or individually loop the battle tracks. When both bosses reach 0 Health, stop the active battle track and transition to `assets/music/nike.mp3`, which loops throughout the victory screen until the battle restarts.
11.3. Sound Effects
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
•	`perfect_block.mp3` plays for every perfect block by Dexios, Furai, Sahira, or Hazel.
•	`ataque_cosmico.mp3` plays on each Cosmic Rays projectile cast and midpoint direction change.
•	`abrir_portal.mp3` plays once when Portal Shield activates.
•	`teleport_ataque.mp3` plays once per ability redirected by Portal Shield.
•	`meteor_fall.mp3` plays when each Meteor Rain meteor begins its descent.
Existing generic effects may be used for other combat feedback.
Sound effects should support the combat without overpowering the background music.
11.4. Audio Behavior
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
The player loses when Dexios, Furai, Sahira, and Hazel all reach 0 Health.
The defeat condition requires all four party members to be incapacitated.
If only one or two characters are incapacitated, the battle continues.
When all four reach zero Health:
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
•	Maximum Health, Mana, Spiritual Energy, and Chaos energy.
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
•	Both bosses' Health, positions, scales, status effects, ability availability, and independent turn states.
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
1.	The game displays all four playable characters, Iobrontes, and Kosmelys.
2.	The characters follow the required foreground/background formation.
3.	The fixed turn order works correctly.
4.	Incapacitated characters have their turns skipped.
5.	Iobrontes only targets active characters.
6.	The battle ends when both bosses reach zero Health or all four party members are incapacitated.
7.	Both bosses remain visible simultaneously and have independent Health bars, actions, combat states, and defeated states.
8.	Defeating one boss does not end the encounter; the surviving boss continues acting at its scheduled positions, and defeated boss turns are skipped rather than transferred.
Dexios
7.	Triple Lightning deals three hits of 5 damage and consumes no Mana.
8.	Electric Arc deals 30 damage and consumes 20 Mana.
9.	Chaotic Lightning deals 70 damage and consumes 50 Chaos energy.
10.	Dexios gains 20 Chaos energy per damaging enemy hit.
11.	His imperfect block causes 5 damage.
12.	Every perfect parry prevents damage and deals 5 damage to Iobrontes.
Furai
13.	Tiger Spear deals 15 damage.
14.	Tiger Fang deals two hits of 20 damage and costs 20 Spiritual Energy.
15.	Armor Break doubles the next qualifying offensive ability's damage.
Armor Break costs 25 Spiritual Energy. Successful Tiger Spear hits and successful Tiger Parry counterattacks each restore 30 Spiritual Energy, up to 100.
16.	The purple tiger mark remains visible until consumed.
17.	Furai takes 5 damage from imperfect blocks.
18.	Three perfect parries in the same chain trigger a 20-damage counterattack.
Sahira
19.	Jackal Strike deals 15 damage.
20.	Jackal Strike has no use limit. Hippopotamus Healing restores a selected conscious ally to maximum Health and can be used twice per fight.
21.	The healing ability allows the selection of Dexios, Furai, Sahira, or Hazel.
Hippopotamus Shield can be used ten times per fight and can protect any conscious ally, including Hazel.
22.	Sahira takes no damage from imperfect blocks.
24.	Hippopotamus Shield blocks the next two attacks against a selected active ally and can be used ten times per fight.
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
58.	The dual-boss encounter keeps the existing relative turn order, places Hazel immediately after Sahira provisionally, and ends in victory only after both bosses are defeated.
59.	The Kosmelys Health bar displays her title and 450 / 450 Health directly below Iobrontes's 550 / 550 Health bar; both bars update independently and remain visible until the encounter ends.
60.	Kosmelys's `kosmelys_base.png`, directional attack frames, Portal Shield frame, and Meteor Rain frame are registered with their supplied filenames; missing frames use labeled placeholders.
61.	Kosmelys independently selects Cosmic Rays, Portal Shield, and Meteor Rain with the 50% / 30% / 20% distribution, proportionally redistributing unavailable Portal Shield probability.
62.	Portal Shield redirects one complete attack to one conscious party member and expires after one playable-character turn; boss-specific statuses do not transfer between bosses.
63.	The asset directory preserves all existing resources and includes Kosmelys's sprites, effects, and music at their configured paths.
64.	Hazel starts every battle at 80 / 80 Health in Ignis; changing form preserves her Health and updates her portrait, form label, ability menu, idle, defense, jump, and hurt frames.
65.	Hazel has no Mana, Chaos, or ability costs and has exactly two abilities for each form.
66.	Flame Dance deals 30 damage to each living boss, uses `fuego` per target, and does not open boss selection.
67.	Glacio Shift selects one living boss, displays `hazel_cambio`, switches to Glacio, then launches one `hielo_debil` projectile for 10 damage as a single turn action.
68.	Figure Shards selects one living boss and deals 60 damage using `hielo`; Ignis Shift switches form and launches one `fuego_debil` projectile for 5 damage at each living boss without opening boss selection.
69.	Hazel's correct normal block and missed/wrong-direction defenses each take full incoming damage from Lightning Chain, Cosmic Rays, and Meteor Rain; only a Perfect Parry avoids damage, with no Hazel counterattack.
70.	Hazel can be selected for healing, shielding, Lightning Chain, Cosmic Rays, Meteor Rain, and Watch the Thunder; she participates in the shared Space jump and cannot act or be newly targeted when incapacitated.
71.	For Hazel AoE attacks, Portal Shield affects only the Kosmelys portion; Iobrontes receives the normal portion. Treat this as the proposed AoE convention without changing redirection behavior for other abilities.
72.	Hazel's provisional turn follows Sahira; the existing relative order of every other turn remains unchanged.
73.	Hazel's `flame`, `shard`, and `shift` sounds and supplied sprites/effects load through the existing configuration and asset systems without interrupting battle or victory music.
________________________________________
15. SUGGESTED IMPLEMENTATION ORDER
The prototype should be developed in stages, with each stage tested before moving to the next.
Stage 1 — Battlefield and Party Formation
•	Load the supplied temple background.
•	Place Iobrontes and Kosmelys in the background.
•	Place Furai, Dexios, Sahira, and Hazel in the requested formation.
•	Configure sprite scaling and drawing order.
•	Implement the initial HUD.
•	Register Kosmelys's supplied sprites and effects from `kosmelys_assets/` without changing their visual design.
Stage 2 — Combat State and Turn Order
•	Create the character statistics.
•	Implement the fixed ten-position turn sequence, with Hazel immediately after Sahira provisionally.
•	Add incapacitation logic.
•	Add victory and defeat conditions.
Stage 3 — Playable Character Abilities
•	Implement Dexios's attacks and Chaos energy.
•	Implement Furai's physical attacks and Armor Break.
•	Implement Sahira's attack and healing ability.
•	Implement Hazel's Ignis/Glacio forms, two abilities per form, and full-damage imperfect defense.
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
•	Add the two independent boss Health bars, with Kosmelys's bar directly below Iobrontes's.
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
•	Verify the ten-position dual-boss turn order, both boss health bars, and the requirement to defeat both bosses for victory.
•	Verify independent boss states, ability selection, and defeated-boss turn skipping.
________________________________________
16. VISUAL REFERENCES
The project's asset directory will contain the supplied reference frames for:
•	Dexios
•	Furai
•	Sahira
•	Hazel's Ignis and Glacio forms
•	Iobrontes
•	Kosmelys
•	The temple background
•	Additional combat effects, where available
•	Dexios, Furai, Sahira, and Hazel's form-specific jump frames
•	Iobrontes's Watch the Thunder frame
•	Iobrontes's Divine Retribution electric-armor frame
These assets establish the visual identity and character appearances of the prototype.
The code must reference them through their registered names, allowing images to be replaced or improved without requiring changes to the core combat systems.
________________________________________
Core Design Specification — Version 0.5


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

The existing playable characters—Furai, Dexios, Sahira, and Hazel—remain in their current formation.

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

All four playable characters must remain visible. Only one meteor and one targeting indicator are active at a time.

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

If all four playable characters are defeated, stop the battle music and trigger the existing defeat sequence.

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

The player loses only when Dexios, Furai, Sahira, and Hazel have all reached zero Health.

If one or two playable characters are incapacitated, the battle continues.

## 9.4. Compatibility with Existing Abilities

All existing mechanics must continue functioning in the dual-boss encounter.

In particular:

- Dexios continues generating Chaos energy when taking eligible damage.
- Furai uses Spirit instead of Mana; successful Tiger Spear and Tiger Parry actions each grant 30 Spirit, capped at 100. Tiger Spear deals 15 damage at no cost; Tiger Fang deals 20 damage per hit (40 total) for 20 Spirit; Armor Break retains its effect and costs 25 Spirit.
- Sahira has no Mana. Jackal Strike is unlimited; Hippopotamus Healing has two uses and Hippopotamus Shield has ten uses per battle.
- Sahira can heal or protect any conscious ally, including Hazel.
- Hazel's two elemental forms share 80 Health; her form-specific actions, costs, and precision defense are defined in section 1.4.
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
- Hazel's area attacks damage every living boss separately; they never damage a defeated boss.
- For Hazel's area attacks, Portal Shield may redirect only the portion directed at Kosmelys; the other boss still receives its normal portion. This is the current proposed convention for the shared AoE interaction.
- Furai's Armor Break applies to the chosen boss only.
- Sahira's and Hazel's defensive behavior follows their character-specific rules.
- Hazel is included in all conscious-ally target pools, enemy attack target pools, and the shared Watch the Thunder jump.
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
- The fixed ten-position turn order preserves the prior relative ordering, with Hazel immediately after Sahira provisionally.
- The dual-boss victory and defeat conditions remain unchanged.

---

# 11. NEW FIXED TURN ORDER

The prototype continues to use a fixed turn sequence.

Do not implement character Speed statistics or dynamic initiative calculations.

The current test-build combat order is:

| Position | Acting Character |
|---|---|
| 1 | Furai |
| 2 | Iobrontes |
| 3 | Kosmelys |
| 4 | Dexios |
| 5 | Iobrontes |
| 6 | Kosmelys |
| 7 | Sahira |
| 8 | Hazel (provisional: after Sahira) |
| 9 | Iobrontes |
| 10 | Kosmelys |

After position 10, the sequence returns to position 1. Hazel's slot is configuration-controlled and provisional; all other turns retain their existing relative order.

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
Hazel (provisional)
  ↓
Iobrontes
  ↓
Kosmelys
  ↓
REPEAT
```

Each complete ten-position cycle contains:

- One turn for Furai.
- One turn for Dexios.
- One turn for Sahira.
- One turn for Hazel (provisional placement).
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

Furai → Iobrontes → Dexios → Iobrontes → Sahira → Hazel (provisional) → Iobrontes → Repeat.

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

**This ten-position sequence is the current test-build turn order; Hazel's position immediately after Sahira is provisional.**

---

**End of Dual Boss Update — Kosmelys Implementation**

**This is version 0.6, incorporating Hazel as the fourth playable character.**

Nuevos cambios:
1.	Que las flechas direccionales para la defensa muestre la tecla adecuada para defenderse entre W, A, S y D. También para el ataque de área como Watch the thunder tiene que mostrarse la barra espaciadora bien.
2.	Aumenta un 0.5 segundos de tiempo entre ataques de Iobrontes y Kosmelys

# LA DEXÍADA — REDISEÑO COMPLETO DE LA INTERFAZ DE COMBATE EN PHASER

## 1. OBJETIVO PRINCIPAL

Quiero realizar un rediseño completo de la interfaz de combate de **La Dexíada**, mi videojuego desarrollado en Phaser.

La finalidad es transformar la interfaz actual en una experiencia JRPG mucho más cinematográfica, elegante y dinámica, conservando todas las mecánicas de combate existentes.

He preparado tres bocetos que deben servir como referencias visuales para la implementación.

**IMPORTANTE: Este trabajo consiste en rediseñar la interfaz, no en reconstruir el sistema de combate.**

Debes examinar primero cómo está organizado actualmente el código, identificar los sistemas que ya funcionan y reutilizarlos.

No debes modificar los sprites originales, las habilidades, las estadísticas, los cálculos de daño ni las reglas del combate.

---

## 2. ARCHIVOS DE REFERENCIA

### 2.1. Bocetos de interfaz

He creado tres imágenes que muestran cómo debe funcionar y verse la nueva interfaz.

Sus nombres son:

**boceto_combate**

Es la imagen principal que muestra la distribución completa de la interfaz durante el combate.

Define:
- Posiciones generales de los personajes.
- Distribución de los dos bosses.
- Cola de turnos en la esquina superior izquierda.
- Información de los enemigos en la zona superior.
- Estado de los aliados en la parte inferior derecha.
- Distribución general de los elementos permanentes del HUD.

**boceto_elegir_ataque**

Muestra cómo debe verse la pantalla durante el turno de un personaje jugable.

Define:
- Zoom cinematográfico hacia el personaje activo.
- Menú de habilidades.
- Posición aproximada de la ventana.
- Distribución de las tres opciones de ataque.
- Composición de la cámara durante la elección.

**boceto_objetivo**

Muestra cómo debe verse la pantalla cuando el jugador selecciona a qué enemigo atacar.

Define:
- Zoom hacia los dos bosses.
- Composición que permite visualizar ambos enemigos ampliados.
- Flecha indicadora del objetivo.
- Selección de uno de los dos dioses.

### Instrucciones sobre los bocetos

Debes examinar las tres imágenes antes de implementar los cambios.

Los bocetos representan el diseño y la composición que quiero conseguir.

No son imágenes que deban utilizarse como fondos del juego ni interfaces estáticas.

**Debes recrear sus elementos mediante objetos reales de Phaser**, conectados a los sistemas existentes.

Respeta especialmente las posiciones relativas, tamaños, agrupaciones de elementos y cambios de cámara.

Puedes mejorar los acabados, la tipografía y la ornamentación para obtener una interfaz profesional, pero sin alterar sustancialmente la composición de los bocetos.

---

## 3. ARCHIVOS DE ICONOS DE PERSONAJES

Los siguientes archivos serán utilizados para representar a cada personaje en la interfaz:

| Archivo | Personaje |
|---|---|
| `iobrontes_icono` | Ióbrontēs |
| `kosmelys_icono` | Kosmelys |
| `dexios_icono` | Dexios |
| `sahira_icono` | Sahira |
| `furai_icono` | Furai |

Estos nombres identifican los recursos gráficos. Utiliza las extensiones y rutas reales que encuentres en el proyecto.

### Uso de los iconos

Los iconos se utilizarán principalmente en dos elementos:

**A. Cola de turnos**

Los cinco iconos deben poder aparecer en la cola situada en la esquina superior izquierda.

Cada icono representa quién actuará en ese turno.

Un mismo personaje puede aparecer varias veces si tiene varias acciones dentro de los próximos seis turnos.

**B. Panel de estado de aliados**

Los iconos de los cuatro aliados deben aparecer junto a sus datos de estado: maná para Dexios, energía espiritual blanca para Furai, usos disponibles para Sahira y forma elemental para Hazel.

### Requisitos técnicos

- Cargar los archivos mediante el sistema de recursos de Phaser.
- Reutilizar las texturas cargadas.
- Mantener sus proporciones originales.
- No estirar ni deformar las imágenes.
- No sustituirlos por letras o círculos de colores si los archivos están disponibles.
- Utilizar máscaras circulares o marcos decorativos cuando corresponda.
- No duplicar innecesariamente los archivos originales.

Si algún recurso no se encuentra, identifica cuál falta e informa del problema.

---

## 4. RESOLUCIÓN Y DISTRIBUCIÓN GENERAL

La interfaz está diseñada para una resolución de referencia de:

**1920 × 1080 píxeles — 16:9**

Utiliza `boceto_combate` como principal referencia para distribuir los elementos.

### Distribución

**Esquina superior izquierda**

Cola de los siguientes seis turnos.

**Parte superior**

Información de los dos jefes.

**Zona central**

Escenario y sprites de combate.

**Lateral inferior derecho**

Panel de estado de los personajes jugables.

**Paneles temporales**

Menús de habilidades y selección de objetivos, que aparecerán únicamente cuando corresponda.

### Posicionamiento de personajes

Mantener el escenario y los sprites actuales.

La distribución de los aliados debe seguir el boceto:

- Furai a la izquierda.
- Dexios en la zona central.
- Sahira hacia la derecha.
- Hazel ocupa una posición configurable que no debe desplazar innecesariamente a los demás personajes.

Los enemigos serán:

- Ióbrontēs.
- Kosmelys.

No cambiar sus diseños gráficos ni reemplazar sus animaciones.

Ajustar las posiciones y escalas únicamente cuando sea necesario para reproducir la composición visual deseada.

---

## 5. COLA DE TURNOS

En la esquina superior izquierda debe aparecer una columna compacta con los iconos de los próximos seis turnos.

La cola muestra:

**El turno actual + los cinco siguientes.**

Por ejemplo:

1. Furai.
2. Ióbrontēs.
3. Kosmelys.
4. Dexios.
5. Ióbrontēs.
6. Kosmelys.

Esta secuencia es únicamente ilustrativa.

La interfaz debe consultar el sistema real de turnos del juego y representar su secuencia auténtica.

### Funcionamiento

Cuando empieza el combate:
- Mostrar los seis turnos correspondientes.

Cuando comienza un turno:
- El icono correspondiente ocupa la primera posición.
- El primer icono debe diferenciarse del resto.

Cuando termina un turno:
- La lista avanza.
- Desaparece el turno completado.
- Los demás ascienden.
- Se incorpora el siguiente turno al final.

Si un personaje queda derrotado:
- La lista debe respetar el sistema existente que omite sus acciones.
- No debe presentar como ejecutable un turno que realmente no ocurrirá.

Si un personaje o boss actúa varias veces:
- Su icono aparecerá tantas veces como corresponda.

### Apariencia

- Iconos compactos.
- Organización vertical.
- Separación uniforme.
- Marcos sutiles.
- Turno activo destacado.
- Los otros cinco iconos ligeramente menos prominentes.

Se puede añadir una transición visual breve al actualizar la cola.

No quiero textos enormes ni paneles que oculten gran parte del escenario.

---

## 6. INFORMACIÓN DE LOS DOS BOSSES

En la parte superior deben mostrarse los indicadores de vida de ambos enemigos.

Seguir la distribución de `boceto_combate`.

### IÓBRONTĒS

Mostrar:
- Nombre: IÓBRONTĒS.
- Título divino correspondiente.
- Barra de vida morada.
- Vida actual y máxima, si esos valores ya se muestran en el juego.

### KOSMELYS

Mostrar:
- Nombre: KOSMELYS.
- Título divino correspondiente.
- Barra de vida naranja o dorada.
- Vida actual y máxima, si corresponde.

Mantener los títulos completos y los valores establecidos en los datos actuales del juego.

### Comportamiento

Las barras deben actualizarse automáticamente cuando cada boss recibe daño o recupera vida.

Los indicadores no deben perder su posición cuando la cámara aplica zoom.

Si un boss es derrotado, su indicador debe reflejar el estado correspondiente.

El diseño visual debe transmitir importancia y solemnidad, sin resultar demasiado recargado.

---

## 7. PANEL DE ESTADO DE ALIADOS

La interfaz actual tiene paneles grandes en la parte inferior.

Quiero sustituirlos por el diseño compacto de `boceto_combate`.

En la parte inferior derecha aparecerá una columna vertical con los personajes jugables.

### DEXIOS

Icono: `dexios_icono`

Barras:
- Verde: HP.
- Azul: MP.
- Roja: CHAOS.

### FURAI

Icono: `furai_icono`

Barras:
- Verde: HP.
- Blanca: energía espiritual (0–100).
- Tiger Spear y Tiger Parry exitosos conceden 30 puntos de energía espiritual.
- Tiger Fang cuesta 20 de energía espiritual; Armor Break cuesta 25.

### SAHIRA

Icono: `sahira_icono`

Barras:
- Verde: HP.
- Sin barra de maná. Jackal Strike no tiene límite de usos; Hippopotamus Healing tiene 2 usos y Hippopotamus Shield tiene 10 usos por pelea.

### HAZEL LANCASTER

Mostrar su retrato de Ignis (`hazel_fuego_icono`) o Glacio (`hazel_hielo_icono`), 80 / 80 HP y un indicador de forma en lugar de una barra de maná:

- IGNIS en naranja.
- GLACIO en azul claro.
- Sin barras de maná ni caos.

### Comportamiento de las barras

- Deben representar los valores reales.
- Deben actualizarse al recibir daño.
- Deben actualizarse al utilizar habilidades.
- Deben actualizarse al recuperar recursos.
- Deben conservar los valores entre turnos.
- Deben reflejar correctamente cuando un personaje ha sido derrotado.

No reiniciar ni reemplazar las estadísticas originales.

### Diseño

Quiero barras horizontales pequeñas, fáciles de leer, situadas junto a los iconos.

El panel debe ocupar mucho menos espacio que la interfaz anterior.

---

## 8. SELECCIÓN DE HABILIDADES — ZOOM AL PERSONAJE

Tomar como referencia exacta:

**`boceto_elegir_ataque`**

Cuando empieza el turno de un personaje controlado por el jugador, la cámara debe realizar un zoom cinematográfico hacia él.

### Secuencia

1. Termina el turno anterior.
2. Se identifica al personaje activo.
3. Se actualiza la cola de turnos.
4. La cámara se desplaza hacia el personaje activo.
5. Se realiza un zoom muy pronunciado.
6. Aparece una ventana translúcida con sus habilidades.
7. Se habilita la selección por teclado y mouse.

### Cámara

El personaje debe ocupar una porción importante de la pantalla.

Quiero que el zoom sea notorio, no un acercamiento mínimo.

Debe permitir apreciar los detalles de su sprite.

Evitar recortar excesivamente su cuerpo o sus animaciones.

### Ventana de habilidades

Debe ser un rectángulo con fondo oscuro translúcido.

Quiero que el escenario siga siendo parcialmente visible detrás de la ventana.

Dentro aparecerán las habilidades disponibles del personaje: tres para quienes tengan tres acciones y exactamente dos para Hazel, según su forma.

Ejemplo de distribución:

1 — Primera habilidad

2 — Segunda habilidad

3 — Tercera habilidad

Los nombres y funciones deben obtenerse del sistema actual.

No inventar habilidades nuevas ni sustituir las existentes.

### Control por teclado

- Tecla `1`: seleccionar habilidad 1.
- Tecla `2`: seleccionar habilidad 2.
- Tecla `3`: seleccionar habilidad 3.

### Control con mouse

Cada habilidad debe ser un botón interactivo.

Al pasar el cursor:
- Resaltar ligeramente la habilidad.
- Mostrar claramente que es seleccionable.

Al hacer clic:
- Seleccionar esa habilidad.

### Restricciones

Si una habilidad no tiene suficiente maná o no cumple los requisitos para ejecutarse:
- Debe mostrarse deshabilitada.
- No debe poder seleccionarse.
- El sistema no debe gastar recursos.

Las acciones solo se ejecutan cuando la selección sea válida.

### Posicionamiento

El panel debe seguir la composición de `boceto_elegir_ataque`.

No debe tapar completamente al personaje.

Debe situarse de forma que tanto el personaje como sus habilidades sean claramente visibles.

---

## 9. SELECCIÓN DE OBJETIVOS — ZOOM A LOS BOSSES

Tomar como referencia:

**`boceto_objetivo`**

Cuando el jugador elige una habilidad que requiere seleccionar un enemigo, se activa el modo de selección de objetivo.

### Secuencia

1. El jugador selecciona una habilidad.
2. El menú de habilidades desaparece.
3. La cámara sale del zoom del aliado.
4. Se desplaza hacia la zona de los bosses.
5. Se aplica un zoom muy pronunciado.
6. Ambos bosses deben verse grandes.
7. Aparece una flecha indicando el objetivo al que se está apuntando.
8. El jugador selecciona uno de los bosses.

### Apariencia

Los dos jefes deben seguir siendo visibles durante la selección.

No quiero que el zoom termine mostrando exclusivamente a uno de ellos.

Se debe poder comparar visualmente ambos objetivos.

### Flecha indicadora

La flecha debe señalar claramente al boss seleccionado.

Debe estar posicionada cerca de él, sin taparlo innecesariamente.

El objetivo señalado debe distinguirse de manera inmediata.

Se puede añadir un pequeño resplandor o borde de selección, pero evitar efectos excesivos.

### Control por teclado

- Tecla `1`: seleccionar y confirmar a Ióbrontēs.
- Tecla `2`: seleccionar y confirmar a Kosmelys.

### Control con mouse

El jugador podrá hacer clic directamente sobre el sprite del boss correspondiente.

Al pasar el mouse sobre un enemigo:
- La flecha debe indicar ese objetivo.
- Debe existir una respuesta visual que muestre que puede seleccionarse.

Al hacer clic:
- Se confirma el objetivo.

El sistema debe utilizar las zonas interactivas de los sprites correctamente, incluso cuando la cámara tenga zoom.

### Confirmación

Al elegir un objetivo válido:

1. Se guarda el objetivo seleccionado.
2. Se cierra la interfaz de selección.
3. Se prepara la cámara para la ejecución del ataque.
4. Se reproduce la habilidad existente.
5. Se aplican los efectos según las mecánicas actuales.
6. Se actualizan los recursos y la vida de los personajes.

### Enemigos derrotados

No permitir seleccionar a un enemigo que ya no pueda recibir ataques según las reglas actuales.

Si queda un solo enemigo disponible, el sistema debe permitir seleccionarlo correctamente.

Las habilidades que no necesitan objetivo o afectan a todos los enemigos deben conservar su lógica actual y no abrir una selección individual innecesaria.

---

## 10. CANCELAR SELECCIÓN — ESCAPE Y BACK

Durante la selección de objetivos quiero poder retroceder.

### Teclado

Pulsar `Escape`.

### Mouse

Añadir un botón visible que diga:

**Back**

### Comportamiento

Al pulsar Escape o hacer clic en Back:

1. Cancelar la selección del enemigo.
2. No ejecutar ninguna habilidad.
3. No consumir maná.
4. No modificar las estadísticas.
5. No terminar el turno.
6. Desactivar el modo de selección de objetivo.
7. Volver a enfocar al personaje activo.
8. Restaurar el zoom de selección de habilidades.
9. Volver a mostrar las tres habilidades.

De esta manera, el jugador podrá cambiar de opinión antes de confirmar el ataque.

El botón Back solo debe aparecer cuando tenga sentido retroceder.

---

## 11. SISTEMA DE CÁMARA

La cámara es uno de los elementos más importantes del rediseño.

Quiero distinguir tres encuadres principales.

### A. CÁMARA GENERAL

Es la vista normal del combate.

Se muestran:
- Los aliados.
- Los bosses.
- El escenario.
- La cola de turnos.
- Los indicadores de estado.

La composición debe corresponder a `boceto_combate`.

### B. CÁMARA DE HABILIDADES

Se activa cuando llega el turno de un aliado.

Debe:
- Enfocar al personaje activo.
- Acercar considerablemente la cámara.
- Mantener al personaje bien encuadrado.
- Mostrar el panel translúcido de habilidades.

La composición debe corresponder a `boceto_elegir_ataque`.

### C. CÁMARA DE OBJETIVOS

Se activa al elegir una habilidad que necesita objetivo.

Debe:
- Desplazarse hacia los bosses.
- Acercar considerablemente la cámara.
- Mantener visibles a ambos.
- Mostrar la flecha del objetivo.
- Permitir la selección por teclado o mouse.

La composición debe corresponder a `boceto_objetivo`.

### Transiciones

No quiero cambios instantáneos y bruscos entre los encuadres.

Utilizar interpolaciones suaves para:
- Movimiento de cámara.
- Zoom.
- Restauración del encuadre general.

Las transiciones deben ser rápidas y fluidas, sin volver lento el ritmo del combate.

Los valores exactos de zoom y duración deben ajustarse según la posición real y las dimensiones de los sprites.

No establecer valores arbitrarios sin comprobar cómo se ven en pantalla.

### Muy importante

El sistema de cámara no debe alterar:
- Las ventanas de parry.
- La duración de los ataques.
- Las animaciones defensivas.
- Los tiempos de reacción.
- El funcionamiento de habilidades.

El zoom debe ser una presentación visual, no una modificación de las reglas del combate.

---

## 12. INTERFAZ PERMANENTE E INTERFAZ CONTEXTUAL

Quiero separar correctamente los elementos permanentes de los temporales.

### Elementos permanentes

Deben mantenerse correctamente posicionados:
- Cola de turnos.
- Información de los bosses.
- Panel de estado de aliados.

### Elementos contextuales

Aparecerán únicamente durante ciertas acciones:
- Menú de habilidades.
- Flecha de selección de objetivo.
- Botón Back.
- Indicadores de defensa ya existentes.

### Interacción con el zoom

Los elementos del HUD deben permanecer anclados a la pantalla.

**No quiero que las barras de vida ni los iconos se hagan enormes cuando la cámara acerca a un personaje.**

Utilizar una solución apropiada para Phaser, como una cámara independiente para la interfaz o elementos con `setScrollFactor(0)` cuando corresponda.

El menú contextual debe estar visualmente situado según el boceto, pero mantenerse legible e interactivo durante los acercamientos.

---

## 13. CONTROLES DE LA NUEVA INTERFAZ

### Selección de habilidades

| Entrada | Acción |
|---|---|
| 1 | Primera habilidad |
| 2 | Segunda habilidad |
| 3 | Tercera habilidad |
| Mouse | Seleccionar una habilidad |

### Selección de objetivos

| Entrada | Acción |
|---|---|
| 1 | Seleccionar a Ióbrontēs |
| 2 | Seleccionar a Kosmelys |
| Mouse | Seleccionar haciendo clic en el boss |
| Escape | Volver a habilidades |
| Back | Volver a habilidades |

### Controles defensivos

Conservar los controles actuales:

| Entrada | Acción |
|---|---|
| W | Defender arriba |
| A | Defender izquierda |
| S | Defender abajo |
| D | Defender derecha |
| Space | Saltar o esquivar cuando corresponda |

Para Hazel, la dirección correcta antes del Perfect Parry no reduce el daño: solo la Parada Perfecta evita el golpe. Esto no cambia las defensas ni los contraataques de los otros personajes.

También conservar los controles existentes para:
- Reiniciar el combate.
- Controlar el audio.
- Cualquier otra acción implementada.

### Evitar conflictos

Las teclas `1`, `2` y `3` deben interpretarse según la fase activa.

Por ejemplo:

Si estoy seleccionando habilidades, `1` significa primera habilidad.

Si estoy seleccionando un objetivo, `1` significa atacar a Ióbrontēs.

Durante una defensa, esas teclas no deben activar accidentalmente habilidades o selecciones.

No debe ser posible ejecutar dos acciones por una sola pulsación.

---

## 14. TURNOS ENEMIGOS Y DEFENSAS

Cuando llegue el turno de un boss:

- Actualizar la cola de turnos.
- Ocultar los menús de habilidades.
- Desactivar la selección de objetivos.
- Ejecutar el comportamiento enemigo existente.
- Mostrar las animaciones correspondientes.
- Mantener visibles los indicadores necesarios.

Durante los ataques enemigos, el jugador debe seguir pudiendo defenderse con las mecánicas originales.

No modificar:
- Parry perfecto.
- Parry imperfecto.
- Bloqueos direccionales.
- Saltos evasivos.
- Contraataques.
- Costes de recursos.
- Cálculos de daño.
- Ventanas de tiempo.

En particular, conservar las diferencias entre las defensas de Dexios, Furai y Sahira.

Sahira debe mantener su sistema especial de bloqueo, sin incorporar un parry perfecto que no existe en su diseño.
Hazel no puede bloquear eficazmente: el bloqueo imperfecto y el fallo aplican el daño completo de Lightning Chain, Cosmic Rays y Meteor Rain. Solo una parada perfecta evita ese daño y Hazel nunca realiza un contraataque. Hippopotamus Shield y el salto en equipo siguen funcionando según sus reglas existentes.

Las animaciones de cámara no deben interferir con la sincronización del ataque enemigo ni con la posibilidad de reaccionar a tiempo.

---

## 15. ESTILO ARTÍSTICO

Quiero una interfaz que encaje con la estética de La Dexíada.

Inspiración:
- Mitología griega.
- Fantasía.
- JRPG.
- Combate cinematográfico.

### Colores

Paleta principal:
- Morado.
- Dorado.
- Negro translúcido.

Colores funcionales:
- Verde: vida.
- Azul: maná.
- Rojo: caos.
- Morado: vida de Ióbrontēs.
- Naranja o dorado: vida de Kosmelys.

### Ornamentación

Se pueden incorporar:
- Bordes dorados finos.
- Patrones de grecas griegas.
- Pequeños símbolos divinos.
- Detalles decorativos discretos.

Evitar:
- Marcos excesivamente grandes.
- Ventanas demasiado opacas.
- Efectos visuales innecesarios.
- Texto demasiado pequeño.
- Exceso de ornamentación.

La prioridad es mantener una interfaz legible y elegante.

Los personajes deben seguir siendo los protagonistas visuales.

---

## 16. IMPLEMENTACIÓN TÉCNICA EN PHASER

Antes de escribir código, inspecciona el proyecto actual.

Identifica:
- Escena principal de combate.
- Sistema de turnos.
- Sistema de habilidades.
- Sistema de objetivos.
- Controles de teclado.
- Controles del mouse.
- Cámaras.
- Gestión de sprites.
- Sistema de carga de recursos.
- Paneles existentes.
- Animaciones de ataque y defensa.

### Recursos

Localiza los archivos:

- `boceto_combate`
- `boceto_elegir_ataque`
- `boceto_objetivo`
- `iobrontes_icono`
- `kosmelys_icono`
- `dexios_icono`
- `sahira_icono`
- `furai_icono`
- Hazel's Ignis and Glacio sprites and portraits from `assets/hazel/`.
- Hazel's `fuego.png`, `fuego_debil.png`, `hielo.png`, and `hielo_debil.png` effects.
- `flame.mp3`, `shard.mp3`, and `shift.mp3` from the existing sound-effects directory.

Busca sus extensiones y rutas reales.

Los tres bocetos son referencias de diseño, mientras que los cinco iconos son recursos que se mostrarán en el juego.

No inventar rutas ni cambiar sus nombres innecesariamente.
Preserve the supplied filenames exactly. In particular, map the Ignis idle to its actual `hazel__fuego_base.png` filename and the Glacio jump to `hazelo_hielo_salto.png`; retain logical animation keys in configuration rather than renaming these files.

### Organización de la interfaz

Recomiendo separar los sistemas de:

1. Cola de turnos.
2. Indicadores de vida de bosses.
3. Panel de estado de aliados.
4. Menú de habilidades.
5. Selección de objetivos.
6. Transiciones de cámara.

Pueden implementarse como componentes o funciones independientes según la estructura existente.

Evitar reescribir el sistema completo cuando sea posible reutilizar componentes actuales.

### Estados de interfaz

Gestionar claramente los estados:

- `PLAYER_ABILITY_SELECT`
- `ENEMY_TARGET_SELECT`
- `ACTION_EXECUTION`
- `ENEMY_TURN`
- `DEFENSE_PHASE`
- `BATTLE_END`

Estos nombres son orientativos. Si ya existe una máquina de estados, integrarse en ella en lugar de crear otra que entre en conflicto.

### Seguridad de interacciones

- No registrar varias veces un mismo evento de teclado.
- No permitir clics duplicados.
- Bloquear acciones incompatibles durante las transiciones.
- Eliminar o desactivar correctamente los listeners que dejen de utilizarse.
- Evitar que Escape provoque varias cancelaciones.
- No permitir confirmar un objetivo mientras la cámara todavía está cambiando si eso genera errores.
- No permitir acciones después de finalizar el combate.

### Resolución

Trabajar sobre la resolución base de 1920 × 1080.

Mantener proporciones, posiciones relativas y legibilidad si cambia el tamaño de la ventana.

No deformar los sprites ni los iconos.

---

## 17. EJEMPLO DEL FLUJO COMPLETO

Este es el comportamiento que quiero observar al jugar.

### PASO 1 — EMPIEZA EL TURNO DE DEXIOS

- La cola de turnos muestra a Dexios en primera posición.
- La cámara se acerca cinematográficamente a Dexios.
- Aparece el menú de habilidades.

La apariencia debe seguir `boceto_elegir_ataque`.

### PASO 2 — SELECCIONO UNA HABILIDAD

Pulso la tecla `2`.

El juego identifica la segunda habilidad real de Dexios.

Comprueba sus requisitos.

Si necesita seleccionar un objetivo, pasa a la siguiente fase.

### PASO 3 — ZOOM A LOS BOSSES

- El menú de habilidades desaparece.
- La cámara se desplaza hacia Ióbrontēs y Kosmelys.
- Ambos aparecen grandes.
- Aparece la flecha de selección.

La apariencia debe seguir `boceto_objetivo`.

### PASO 4 — ELIJO UN OBJETIVO

Puedo pulsar:

- `1` para Ióbrontēs.
- `2` para Kosmelys.

También puedo hacer clic directamente en cualquiera de ellos.

### PASO 5 — OPCIÓN DE RETROCEDER

Si no quiero realizar ese ataque, pulso Escape o hago clic en Back.

Entonces:
- Se cancela la selección.
- La cámara regresa a Dexios.
- Reaparece el menú de habilidades.
- No he gastado recursos ni perdido el turno.

### PASO 6 — CONFIRMO EL ATAQUE

Si confirmo un enemigo:
- Desaparece la interfaz de selección.
- La cámara presenta la acción.
- Dexios realiza su ataque correspondiente.
- Se ejecutan las animaciones existentes.
- Se calculan los daños.
- Se actualizan las barras.
- Termina el turno.

### PASO 7 — SIGUIENTE TURNO

- La cola avanza.
- Se identifica al siguiente personaje.
- Si es aliado, se activa su selección de habilidades.
- Si es enemigo, se ejecuta su comportamiento.
- El combate continúa normalmente.

---

## 18. ELEMENTOS QUE DEBEN PERMANECER INTACTOS

No modificar las reglas existentes del juego.

Especialmente:

- Orden de turnos.
- Estadísticas.
- Vida máxima.
- Maná máximo.
- Caos de Dexios.
- Habilidades individuales.
- Daños.
- Costes.
- Estados alterados.
- Parrys.
- Ventanas de defensa.
- Bloqueos direccionales.
- Evasiones.
- Contraataques.
- Animaciones de los sprites.
- Mecánicas especiales de los bosses.
- Condiciones de victoria.
- Condiciones de derrota.
- Audio.
- Reinicio del combate.

Si una modificación visual requiere cambiar parte del código existente, conservar su comportamiento original.

La nueva interfaz debe utilizar los sistemas del combate, no sustituirlos por sistemas paralelos incompatibles.

---

## 19. ORDEN RECOMENDADO DE IMPLEMENTACIÓN

Quiero que realices el rediseño de forma ordenada.

### Etapa 1 — Analizar el proyecto

Examinar la estructura del código y localizar los recursos.

Determinar qué sistemas pueden reutilizarse.

### Etapa 2 — Implementar la interfaz general

Utilizar `boceto_combate`.

Crear:
- Cola de turnos.
- Información de bosses.
- Panel de estado de aliados.
- Distribución general.

Comprobar que todas las barras muestran valores reales.

### Etapa 3 — Selección de habilidades

Utilizar `boceto_elegir_ataque`.

Implementar:
- Zoom al aliado.
- Menú translúcido.
- Controles 1, 2 y 3.
- Botones interactivos.

### Etapa 4 — Selección de objetivos

Utilizar `boceto_objetivo`.

Implementar:
- Zoom a los bosses.
- Flecha de selección.
- Teclas 1 y 2.
- Selección con mouse.
- Escape.
- Botón Back.

### Etapa 5 — Integración con el combate

Conectar los sistemas nuevos a:
- Habilidades existentes.
- Consumo de recursos.
- Turnos.
- Daño.
- Animaciones.
- Estados de derrota.

### Etapa 6 — Pruebas

Comprobar al menos:

- Turnos de los tres aliados.
- Turnos de ambos bosses.
- Selección de las tres habilidades.
- Selección de Ióbrontēs.
- Selección de Kosmelys.
- Cancelación mediante Escape.
- Cancelación mediante Back.
- Clics del mouse.
- Actualización de las barras.
- Actualización de los seis turnos.
- Comportamiento cuando un personaje muere.
- Comportamiento cuando un boss muere.
- Defensas durante los turnos enemigos.
- Condiciones de victoria y derrota.
- Posicionamiento de la UI durante todos los zooms.
- Restauración correcta de la cámara.

### Etapa 7 — Acabados visuales

Cuando todo funcione, añadir:
- Transiciones suaves.
- Resaltados.
- Bordes decorativos.
- Pequeñas animaciones de los paneles.
- Ajustes de espaciado, tipografía y proporciones.

---

## 20. RESULTADO FINAL ESPERADO

Quiero que el sistema de combate tenga tres presentaciones principales:

**1. Vista general — `boceto_combate`**

Muestra todo el combate, los enemigos, los aliados, las barras y la cola de turnos.

**2. Elección de habilidades — `boceto_elegir_ataque`**

Zoom cinematográfico al personaje activo con un menú translúcido de tres habilidades seleccionables mediante teclado o mouse.

**3. Elección de objetivo — `boceto_objetivo`**

Zoom cinematográfico a los dos dioses, con una flecha indicadora del objetivo, selección mediante teclado o mouse y opción Back para regresar.

Los iconos de los personajes deben obtenerse de los archivos indicados anteriormente y de los retratos suministrados de Hazel para sus dos formas.

**La prioridad es que esta nueva interfaz funcione correctamente dentro del combate que ya existe, que respete mis bocetos y que haga mucho más cinematográfica la experiencia del jugador.**

No quiero que reconstruyas todo el juego ni que cambies sus mecánicas.

Quiero una nueva presentación visual profesional, dinámica y funcional sobre el sistema ya implementado.

# LA DEXÍADA — VISUAL, UI AND GAMEPLAY CORRECTIONS

Apply the following corrections to the existing Phaser combat prototype and update `DESIGN.md` accordingly.

**IMPORTANT:** Do not rebuild the game from scratch. Preserve all existing combat mechanics, characters, abilities, animations, sound effects, timing systems, boss behavior, resource management, and turn order unless explicitly modified below.

Fix the underlying causes of the problems, not just their visible symptoms.

## 1. CHARACTER PROPORTIONS AND BATTLEFIELD POSITIONING

The current battlefield has inconsistent character proportions and positioning.

Some characters appear significantly smaller or larger than intended. Hazel, in particular, appears too small compared with the other playable characters.

### Main Visual Reference

**Use `boceto_combate.jpeg` as the primary reference for battlefield composition and character placement.**

Locate and inspect this file in the project assets.

The positioning and visual arrangement shown in this sketch take priority over previous approximate positioning instructions.

Use it to determine:

- The relative positions of Furai, Dexios, Sahira, and Hazel.
- The placement of Iobrontes and Kosmelys.
- The distance between the playable characters and the bosses.
- The relative visual size of each character.
- The overall perspective and composition of the battlefield.

Do not invent a new formation when the reference already establishes one.

If the reference cannot be located, report the missing file instead of guessing the intended layout.

### Scaling Requirements

Do not calculate character size using the full PNG canvas dimensions alone.

Some character images contain significant transparent padding, causing their visible figures to appear incorrectly scaled.

Instead:

1. Determine the visible character bounds inside each PNG.
2. Use the actual visible character height as the scaling reference.
3. Preserve each character's original aspect ratio.
4. Apply perspective-based scaling according to their battlefield position.
5. Anchor sprites using the characters' feet rather than their image centers.
6. Ensure every animation frame maintains the same apparent character size.
7. Store all positions and scale values in configuration files.

Do not stretch or deform the character artwork.

### Animation Consistency

Characters must not visibly grow, shrink, or jump to different ground positions when switching animation frames.

This applies to all playable characters and both bosses.

Hazel must maintain consistent proportions across both Ignis and Glacio forms.

### Character Name Labels

Correct the positions of battlefield character labels.

Sahira's and Hazel's names currently overlap.

Each name must appear in a readable position associated with its character, without overlapping another name, character sprite, or interface element.

## 2. HAZEL — GLACIO DEFENSIVE ANIMATION BUG

Hazel currently displays an Ignis defensive sprite for a fraction of a second when attempting to defend in Glacio mode.

This must be fixed.

### Required Behavior

Hazel must display the correct elemental frame immediately, from the very first frame of every action.

When Hazel is in Glacio mode, use only Glacio frames for:

- Directional defenses.
- Perfect parries.
- Jumping.
- Taking damage.
- Returning to idle.

When Hazel is in Ignis mode, use the corresponding Ignis frames.

### Technical Requirements

- Hazel's current elemental mode must be the authoritative source for animation selection.
- Do not initialize actions using a default Ignis frame.
- Select the correct sprite before displaying the defensive action.
- Prevent outdated animation callbacks from restoring frames belonging to the previous form.
- Returning to idle must always restore the base frame of Hazel's current mode.
- Verify that the same problem does not occur during jumping or damage reactions.

Do not change Hazel's existing defensive mechanics.

She still receives full damage from an imperfect block and avoids directional damage only through a perfect parry.

## 3. HAZEL — ARMOR BREAK COMPATIBILITY

Hazel currently cannot consume Furai's Armor Break mark.

This must be fixed.

All of Hazel's damaging abilities must interact with Armor Break through the same centralized damage calculation system used by the other playable characters.

### Flame Dance

Base damage: 30 per enemy.

Against a boss with Armor Break:

- Damage becomes 60 against the marked boss.
- Other unmarked enemies receive their normal 30 damage.

The mark is consumed after damage is successfully applied.

### Figure Shards

Base damage: 60 to one enemy.

Against a marked boss:

- Damage becomes 120.
- The mark is consumed.

### Glacio Shift

Base damage: 10 to one selected enemy.

Against a marked boss:

- Damage becomes 20.
- The mark is consumed.

Hazel must still transform to Glacio normally.

### Ignis Shift

Base damage: 5 to every active enemy.

Against a marked boss:

- The marked boss receives 10 damage.
- Other unmarked bosses receive 5 damage.

Hazel must still transform to Ignis normally.

### General Rules

- Armor Break only modifies damage against the boss carrying the mark.
- Area-of-effect abilities must evaluate enemy status effects independently.
- Failed offensive timing must not consume Armor Break.
- Portal Shield redirection must not incorrectly consume Armor Break on a boss that receives no damage.
- Preserve the existing rule that only the first hit of a multi-hit ability receives the Armor Break multiplier.
- Do not modify Armor Break's existing duration or stacking rules.

## 4. UNIVERSAL GAME FONT — ARCHEOLOGICAPS

Apply the supplied font:

`Archeologicaps.ttf`

The font family is:

`Archeologicaps`

Use it as the universal typeface throughout La Dexíada.

Store the font in the project's public font assets directory, for example:

`public/assets/fonts/Archeologicaps.ttf`

Register the font using `@font-face` and ensure it finishes loading before creating Phaser text objects.

### Required Font Coverage

Use Archeologicaps for:

- Game title.
- Character names.
- Boss names and titles.
- Health values.
- Mana and resource values.
- Ability names and costs.
- Turn-order interface.
- Ability selection.
- Ally and enemy selection.
- Timing instructions.
- Damage numbers.
- Attack announcements.
- Combat messages.
- Status effects.
- Victory and defeat screens.
- Audio controls.
- All other game text.

Apply it to both HTML interface elements and Phaser canvas text.

Do not leave UI elements using default system fonts.

Maintain the existing text colors and visual hierarchy.

Adjust font sizes, spacing, and container dimensions where necessary to prevent overflow or clipping.

## 5. FURAI — RESOURCE LABEL CORRECTION

In Furai's HUD, change the resource label to:

**ESPÍRITU**

Do not display:

- E. ESPIRITUAL
- ENERGÍA ESPIRITUAL
- ESPIRITUAL

The displayed label must be exactly:

`ESPÍRITU`

Keep the existing resource bar, values, colors, functionality, and resource calculations unchanged.

Apply the Archeologicaps font to this label.

Make sure the accented character Í renders correctly.

## 6. HAZEL — ELEMENTAL STATUS INDICATOR

Improve the visual presentation of Hazel's elemental form indicator in her HUD.

Currently, the text indicating Ignis or Glacio is too small and poorly positioned.

### Required Changes

- Center the elemental mode label horizontally within its designated HUD area.
- Make the text noticeably larger.
- Use the Archeologicaps font.
- Keep the label fully visible without clipping.
- Ensure it does not overlap Hazel's Health bar, name, or portrait.

### Ignis Mode

Display:

`IGNIS`

Color: Orange.

### Glacio Mode

Display:

`GLACIO`

Color: Light blue / Cyan.

The label must update immediately after a successful elemental transformation.

Use the same centered positioning and font size in both forms.h modes.

Do not create a Mana bar for Hazel.

Her HUD must continue displaying her Health and current elemental form.

## 7. SAHIRA — ALLY SELECTION MENU LAYOUT

There is a layout problem when Sahira selects an ally for:

- Hippopotamus Healing.
- Hippopotamus Shield.

The ally selection interface now contains four playable characters:

1. Furai
2. Dexios
3. Sahira
4. Hazel Lancaster

Currently, Hazel's selection box extends outside the intended attack-menu container.

This must be fixed.

### Required Layout

Arrange all four ally selection options vertically in a clean and organized layout.

Every option must:

- Fit entirely inside the selection panel.
- Have consistent width and height.
- Maintain equal vertical spacing.
- Display the correct character name.
- Remain fully visible and selectable.
- Use the Archeologicaps font.

The ally selection panel must be large enough to accommodate four options without clipping or overlapping other interface elements.

If necessary, increase the panel height or adjust the spacing of its contents.

### Dynamic Layout

The interface must adapt to the number of playable characters.

Do not use fixed positioning that only works for three allies.

Use a layout system that calculates the required height and distributes the selection options vertically.

If the available screen space becomes insufficient, the panel may reposition itself or use an internal scroll area, but the preferred presentation at 1920 × 1080 is to display all four allies simultaneously.

### Input and Targeting

Preserve existing ally selection controls.

The player must still be able to select allies using the keyboard or mouse.

Incapacitated characters remain unavailable as healing or shield targets according to the existing rules.

Do not alter the abilities' healing amounts, resource costs, or protection mechanics.

## 8. BOSS HEALTH BARS — ALWAYS VISIBLE DURING PLAYER ATTACKS

There is an interface problem where Iobrontes's and Kosmelys's Health bars disappear while a playable character performs an attack.

**Both boss Health bars must remain visible throughout all playable-character offensive actions.**

### Required Behavior

The Health bars of Iobrontes and Kosmelys must remain on screen during:

- Attack selection.
- Enemy target selection.
- Offensive timing minigames.
- Cinematic attack presentations.
- Attack animations.
- Projectile travel.
- Damage resolution.
- Multi-hit attack sequences.
- Elemental transformations that deal damage.

For example, when Dexios performs Triple Lightning, both boss Health bars must remain visible while the three hits resolve.

When Hazel performs Flame Dance, both boss Health bars must remain visible while damage is applied to each boss.

### UI Rendering Rules

The boss Health bars must be part of a persistent HUD layer.

They must not be hidden merely because the game enters an attack animation, cinematic state, or player-action state.

If camera zooms or pans occur during an attack, the Health bars must remain anchored to their intended screen positions.

If the offensive timing cinematic displays a centered black horizontal strip, the strip must not obscure the boss Health bars.

Use appropriate UI layering, camera exclusions, and rendering depth to keep the boss HUD visible above combat-world effects without covering important information.

### Health Updates

The bars must update in real time when damage is applied.

For multi-hit attacks, the Health bar should visibly decrease after each individual hit.

The bar must not disappear and then reappear with the final Health value.

If one boss is defeated, its Health bar should still display zero according to the existing encounter HUD rules.

Do not hide both Health bars simply because one boss has reached zero Health.

The Health bars may be hidden or replaced only when the game intentionally transitions away from the combat scene into the final victory or defeat screen.

## 9. REGRESSION TESTING

After implementing these corrections, verify the following:

1. Character positions follow `boceto_combate.jpeg`.
2. All characters have coherent visual proportions.
3. Hazel is no longer disproportionately small.
4. Animation changes do not cause sprites to grow, shrink, or change ground position unexpectedly.
5. Sahira's and Hazel's battlefield name labels remain readable and do not overlap.
6. Hazel uses Glacio-only defense, parry, jump, damage, and idle frames while in Glacio form.
7. Hazel's attacks consume Armor Break only when they successfully damage the marked boss.
8. Area attacks evaluate Armor Break independently for each boss, and multi-hit attacks double only the first successful hit.
9. Portal Shield redirection does not consume Armor Break when the boss takes no damage.
10. Archeologicaps is loaded before any Phaser scene creates text and is used by all game text.
11. Furai's resource label reads `ESPÍRITU`, including the accented `Í`.
12. Hazel's `IGNIS` and `GLACIO` labels are centered, legible, and update after a successful shift.
13. All four ally targets fit inside the selection panel and remain keyboard- and mouse-selectable.
14. Both boss Health bars remain visible and update during player actions, including each hit in a multi-hit attack.
15. Healing, shielding, resource calculations, turn order, defensive timing, boss behavior, and existing damage rules remain unchanged.

The battlefield coordinates and target visible heights are stored in `GAME_CONFIG`. Sprite sizing uses each frame's non-transparent pixel bounds, preserves its aspect ratio, and anchors the visible feet to the configured ground position.