LA DEXÃADA â€” GAME DESIGN DOCUMENT
Version: 0.6 â€” Four-Character Dual-Boss Combat Prototype
Document Status: Implementation Specification
Target Platform: PC (Phaser, browser)
Genre: Turn-Based RPG with Real-Time Directional Defense
Visual Perspective: 2D character-based combat with foreground/background depth
Prototype Scope: Four playable characters, two bosses, one arena, and standard and tutorial configurations of the dual-boss combat encounter.
Note to the implementer: This document is intended to be self-contained. Implement the mechanics and values described here without relying on previous versions. Numerical values, timings, character positions, camera settings, and animation references must be stored in configuration files whenever possible.
________________________________________
1. GAME OVERVIEW
1.1. Game Description
La DexÃ­ada is a fantasy RPG inspired by Greek mythology, set in XantharchÃ­a, a world where gods, divine heirs, and mortals coexist within a society shaped by magic.
The combat system combines turn-based strategic decisions with real-time directional defense. During their turns, players select attacks or abilities for their characters. During enemy turns, they must identify the direction of incoming attacks and press the corresponding defensive key at the correct moment.
The player controls a party of four characters:
â€¢	Dexios: A lightning-based fighter who uses electricity and Chaos energy.
â€¢	Furai: A tiger-themed fighter specializing in physical attacks, armor breaking, and defensive counterattacks.
â€¢	Sahira: A jackal-themed fighter and healer with strong defensive capabilities.
â€¢	Hazel Lancaster: A precision defender who alternates between Ignis (fire) and Glacio (ice).
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
15.	Preserve the standard combat scene and provide a separate tutorial-configured scene with the same combat logic.

The standard scene remains `escena_combate_dificil`. The tutorial scene, `escena_tutorial`, reuses the same combat implementation with a configured 0.75 multiplier on god-origin damage (rounded up with `Math.ceil`) and a 1.5 multiplier on combat and action-command timings. Player-origin damage, boss HP, attack counts, healing amounts, turn order, and the standard scene's damage and timing remain unchanged. `escena_select` presents equally sized 700 × 360 Tutorial and Combat ovals symmetrically at X=560 and X=1360. The left button is labeled `tutorial`, uses `assets/backgrounds/tutorial.png`, and starts a fresh tutorial encounter; the existing `COMBAT START` artwork, label, and destination remain unchanged apart from its position.
1.3. Out of Scope
This prototype will not include exploration, interactive dialogue, inventory, character progression, equipment selection, additional bosses beyond Iobrontes and Kosmelys, multiple arenas, or a complete save system.
Character speed statistics will also be excluded. Turn order will remain fixed throughout the encounter.

1.4. Hazel Lancaster â€” Fourth Playable Character
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
â€¢	Classical Greek-inspired architecture.
â€¢	Stone columns and monumental structures.
â€¢	A statue representing Iobrontes.
â€¢	Banners displaying his divine symbol.
â€¢	Decorations and architectural elements inspired by lightning.
â€¢	An opening revealing a stormy, gray sky.
â€¢	Cold ambient lighting with possible purple lightning flashes.
The environment should remain mostly static, although subtle environmental effects may be added.
2.2. Visual Style
The game uses hand-drawn 2D character artwork following the visual references provided in the assets directory.
The intended style is not pixel art.
Characters should retain the appearance, proportions, clothing, and recognizable design details of their supplied reference images.
Technical Resolution
Target Resolution: 1920 Ã— 1080 pixels
Aspect Ratio: 16:9
Recommended starting asset dimensions:
Asset	Recommended Dimensions
Arena background	1920 Ã— 1080 px
Playable character canvases	Approximately 512 Ã— 1024 px
Iobrontes canvas	Approximately 768 Ã— 1024 px
Lightning effects	256â€“512 px, depending on the effect
Attack icons	128 Ã— 128 px
Character images must support transparency.
Assets should be scaled at runtime while preserving their original proportions.
2.3. Screen Composition
The arena must communicate depth through character placement, scaling, and floor perspective.
The four playable characters stand closer to the camera, facing Iobrontes and Kosmelys.
Iobrontes and Kosmelys stand farther away, facing the party and the camera. Both bosses must be visible simultaneously.
Party Formation
Furai â€” Left
â€¢	Positioned on the left side of the party.
â€¢	Slightly farther away from the camera.
â€¢	His feet should be higher on the screen than Dexios's.
â€¢	Facing Iobrontes.
Dexios â€” Center
â€¢	Positioned in the center of the party formation.
â€¢	Standing slightly closer to the camera than Furai.
â€¢	Seen primarily from behind, facing Iobrontes.
â€¢	Retains his combat stance with his left arm and left leg forward.
Sahira â€” Right
â€¢	Positioned on the right side of the formation.
â€¢	Slightly closer to the camera than Dexios.
â€¢	Her feet should appear lower on the screen than the other party members' feet.
â€¢	Facing Iobrontes.
Hazel â€” Configured fourth position
â€¢	Use Hazel's configured position and depth so her sprite remains readable without unnecessarily moving the established characters.
â€¢	Facing Iobrontes.
Iobrontes â€” Background
â€¢	Positioned approximately in the center of the arena.
â€¢	Standing farther away than all four party members.
â€¢	Facing the playable characters.
â€¢	His upright posture must communicate divine authority.
Kosmelys â€” Background
â€¢	Positioned near Iobrontes in the background area.
â€¢	Separated enough from Iobrontes to distinguish both sprites, attacks, and effects.
â€¢	Facing the playable characters.
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
â€¢	Zoom multiplier: approximately 1.08.
â€¢	Camera transition duration: 0.2â€“0.3 seconds.
â€¢	Return transition: approximately 0.3 seconds.
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
â€¢	Idle
â€¢	Attacking
â€¢	Defending
â€¢	Taking damage
â€¢	Healing
â€¢	Special ability
â€¢	Counterattacking
â€¢	Defeated
Kosmelys uses `kosmelys_base.png` as her idle frame, `kosmelys_derecha.png`, `kosmelys_izquierda.png`, and `kosmelys_arriba.png` for directional attacks, `kosmelys_escudo.png` for Portal Shield, and `kosmelys_mr.png` for Meteor Rain. Use a clearly labeled placeholder for the missing downward attack frame. Resolve the Portal Shield file using its actual supplied filename and extension. Return her to `kosmelys_base.png` after an action unless Portal Shield remains active. Do not change the supplied artwork's design.
When a character begins an action, the appropriate frame must replace their idle frame.
Once the action ends, the character returns to the idle frame unless they have been defeated.
Dexios, Furai, and Sahira gently move up and down while in their base idle frame.
If a supplied asset is a static frame rather than a complete sprite sheet, simple movements and effects may be produced through Phaser, such as:
â€¢	Small positional movements.
â€¢	Slight scaling.
â€¢	Recoil.
â€¢	Character flashes.
â€¢	Projectile movements.
â€¢	Lightning effects.
â€¢	Camera movement.
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
  â†“
Iobrontes
  â†“
Kosmelys
  â†“
Dexios
  â†“
Iobrontes
  â†“
Kosmelys
  â†“
Sahira
  â†“
Hazel (provisional)
  â†“
Iobrontes
  â†“
Kosmelys
  â†“
Repeat
Iobrontes and Kosmelys each act three times during every complete ten-position cycle. Hazel's turn is configuration-controlled; every other turn keeps its existing relative position.
Incapacitated Characters
When a playable character reaches zero health:
â€¢	They become incapacitated.
â€¢	They cannot execute attacks or abilities.
â€¢	Their turn is automatically skipped.
â€¢	The combat continues with the remaining characters.
â€¢	Their HUD must indicate that they are incapacitated.
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
â€¢	The selected character is visually highlighted.
â€¢	The camera moves slightly toward the selected character.
â€¢	The character's name or HUD receives a targeting indicator.
â€¢	The other party members remain visible but are not eligible to perform defensive actions.
During Lightning Chain, WASD controls only the targeted character. During Watch the Thunder, Space triggers a simultaneous jump for the party.
Inputs must not activate defensive animations for other party members.
After the chain finishes, the camera returns to the default view and the targeting indicator disappears.
________________________________________
5. PLAYABLE CHARACTER â€” DEXIOS
5.1. Starting Statistics
Attribute	Initial Value	Maximum
Health	100	100
Mana	100	100
Chaos Energy	0	100
Initial Frame: dexios_base
Downward defense frame: dexios_abajo
Dexios specializes in electrical attacks and Chaos energy.
5.2. Ability 1 â€” Triple Lightning
Damage: 5 Ã— 3 = 15
Mana Cost: 0
Type: Three-hit physical/electrical attack
Frame: dexios_ataque
Dexios performs three consecutive strikes against Iobrontes.
Each strike:
â€¢	Deals 5 damage.
â€¢	Produces a yellow lightning effect.
â€¢	Updates the boss's health.
The attack consumes no Mana.
Each individual impact must be visible.
5.3. Ability 2 â€” Electric Arc
Damage: 30
Mana Cost: 20
Type: Electrical attack
Frame: dexios_blanco
Dexios unleashes a large white lightning attack toward Iobrontes.
The attack deals 30 damage in one hit.
When selected, 20 Mana is consumed.
The attack must include a visible white lightning effect.
5.4. Ability 3 â€” Chaotic Lightning
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
â€¢	An unblocked lightning hit deals 10 damage and grants 20 Chaos energy.
â€¢	An imperfect block deals 5 damage and grants 20 Chaos energy.
â€¢	A perfect parry deals 0 damage and grants no Chaos energy.
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
6. PLAYABLE CHARACTER â€” FURAI
6.1. Starting Statistics
Attribute	Initial Value	Maximum
Health	80	80
Spiritual Energy	0	100
Initial Frame: furai_base
Furai specializes in physical attacks and techniques associated with the tiger.
6.2. Ability 1 â€” Tiger Spear
Damage: 15
Spiritual Energy Cost: 0
Type: Single physical strike
Frame: furai_ataque
Furai performs a single physical attack against Iobrontes.
The attack deals 15 damage and produces a visible impact effect.
It does not consume Spiritual Energy. A successful hit restores 30 Spiritual Energy, up to 100.
6.3. Ability 2 â€” Tiger Fang
Damage: 20 Ã— 2 = 40
Spiritual Energy Cost: 20
Type: Two-hit physical attack
Frame: furai_tigre
Furai attacks Iobrontes twice in succession.
Each hit deals 20 damage, for a total of 40.
Each hit must have its own impact effect.
The ability consumes 20 Spiritual Energy when executed.
6.4. Ability 3 â€” Armor Break
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
â€¢	Triple Lightning: 15 â†’ 20 total damage.
â€¢	Tiger Fang: 40 â†’ 60 total damage.
â€¢	Electric Arc: 30 â†’ 60 damage.
â€¢	Chaotic Lightning: 70 â†’ 140 damage.
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
7. PLAYABLE CHARACTER â€” SAHIRA
7.1. Starting Statistics
Attribute	Initial Value	Maximum
Health	125	125
Initial Frame: sahira_base
Sahira specializes in physical attacks, healing, and defensive techniques.
7.2. Ability 1 â€” Jackal Strike
Damage: 15
Uses: Unlimited
Type: Single physical strike
Frame: sahira_ataque
Sahira performs a physical attack against Iobrontes.
The attack deals 15 damage and produces a visible impact effect.
It has no per-fight use limit.
7.3. Ability 2 â€” Hippopotamus Healing
Healing: Full restoration of the selected ally's Health
Uses: 4 per fight
Type: Healing ability
Frame: sahira_cura
Sahira performs a healing ability that completely restores one selected party member's health.
When this ability is selected, a targeting menu appears.
The player can choose:
â€¢	Dexios
â€¢	Furai
â€¢	Sahira
â€¢	Hazel
The healing effect restores the selected character to their maximum Health value.
Each successful use consumes one of the four uses available for the fight.
Healing Target Selection
1.	The player selects Hippopotamus Healing.
2.	The game displays all four party members.
3.	The player selects the character to heal.
4.	Sahira's healing frame activates.
5.	A healing effect appears over the selected character.
6.	The character's Health is restored to maximum.
For the initial implementation, healing applies to conscious party members only and does not revive incapacitated allies. Incapacitated characters remain visible in the selection interface but are disabled as healing targets.
This rule can be changed later if revival abilities are introduced.
7.4. Ability 3 â€” Hippopotamus Shield
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
8. BOSS â€” IOBRONTES
8.1. Starting Statistics
Attribute	Initial Value	Maximum
Health	550	550
Initial Sprite: iobrontes_base
Iobrontes is one of two independent bosses in the prototype. He has three actions: Lightning Chain, Watch the Thunder, and Divine Retribution. His co-boss, Kosmelys, has separate statistics, abilities, health, and turns as specified in the dual-boss combat sections.
Before each action, the game displays its name in white at the center of the screen for one second. The action begins only after this announcement disappears.
Iobrontes chooses Lightning Chain 50% of the time, Watch the Thunder 30% of the time, and Divine Retribution 20% of the time.
8.2. Ability â€” Lightning Chain
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
â€¢	Up
â€¢	Down
â€¢	Left
â€¢	Right
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
8.3. Ability â€” Watch the Thunder
Frame: iobrontes_wtt
Sound: assets/sfx/trueno.mp3
Target Count: All active party members
Damage per Target: 50
Casting Time: 0.6 seconds
Jump Window: 0.3 seconds
Iobrontes launches one long purple lightning beam from himself across Furai, Dexios, and Sahira. After the 0.6-second casting time, a white contracting timing ring appears around each active party member while the beam spans the whole party during the 0.3-second jump window.
Pressing Space during the jump window makes all active party members jump at the same time. Use each character's current-form jump frame, including Hazel's Ignis or Glacio jump. A successful team jump avoids the attack completely. There is no perfect or imperfect result: each character who does not jump takes 50 damage, unless an active Hippopotamus Shield blocks that hit.
The attack is one event, not a chain. Resolve damage for all active characters together when the jump window closes.
8.4. Ability â€” Divine Retribution
Frame: iobrontes_armadura
Sound: assets/sfx/armadura.mp3
Target Count: Self, then the first playable character whose attack damages Iobrontes
Retaliation Damage: 30
Duration: 2 playable-character turns
Divine Retribution covers Iobrontes in an electric shield. The next attack that damages him still deals its normal damage, then the shield immediately retaliates against its attacker for 30 damage and disappears.
The shield lasts until that hit occurs or two playable-character turns have ended, whichever comes first. Count turns whether or not the character attacks Iobrontes; a skipped incapacitated-character turn also counts. If Dexios and Sahira take their turns without damaging Iobrontes, the shield has expired by Furai's next turn.
Whenever the shield is consumed or expires, Iobrontes returns to iobrontes_base. If another action temporarily changes his frame while the shield remains active, restore iobrontes_armadura when that action's frame ends.
8.5. Boss â€” Kosmelys
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
Phase 1 â€” Wind-up
Duration: 0.187 seconds
Iobrontes prepares the attack and indicates its direction.
The appropriate directional frame becomes visible.
A warning marker appears on the side corresponding to the attack.
Defensive inputs during this phase are ignored without penalty.
Phase 2 â€” Projectile Travel
Duration: 0.373 seconds
The lightning projectile travels toward the targeted character.
A timing ring appears around the target and contracts toward them.
The ring reaches its final size at the moment of visual impact.
Phase 3 â€” Defensive Resolution
All timing is measured relative to the moment of impact, called T.
The defensive window opens 0.5 seconds before impact and closes 0.1 seconds after impact.
Timing	Correct Input Result	Indicator
Before T âˆ’ 0.5 s	Ignored	Neutral
T âˆ’ 0.5 s to T âˆ’ 0.1 s	Imperfect block	Yellow
T âˆ’ 0.1 s to T + 0.1 s	Perfect parry	White, glowing
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
â€¢	Dexios deals 5 damage for every individual perfect parry.
â€¢	Furai deals 20 damage only if all three parries in the chain are perfect.
9.5. Perfect-Parry Tracking
For Furai, the game must track whether every attack in the current Lightning Chain was perfectly parried.
A simple chain tracking structure can contain:
â€¢	Target character.
â€¢	Current lightning index.
â€¢	Number of perfect parries.
â€¢	Whether any imperfect block occurred.
â€¢	Whether any failed defense occurred.
At the end of the third attack:
â€¢	If Furai has three perfect parries, trigger their special counterattack.
â€¢	Otherwise, do not trigger the special counterattack.
The tracking data must be reset when the next Lightning Chain begins.
Dexios does not require a three-hit counterattack condition because his perfect parries resolve individually. Sahira does not require a three-hit counterattack condition.
9.6. Defensive Feedback
Each defensive result must produce immediate visual feedback.
Perfect Parry
â€¢	Bright electrical effect.
â€¢	Strong impact feedback.
â€¢	Text: PERFECT.
â€¢	Counterattack when applicable.
Imperfect Block
â€¢	Defensive impact effect.
â€¢	Text: BLOCK.
â€¢	Character-specific damage calculation.
Failed Defense
â€¢	Visible lightning impact.
â€¢	Damaged frame.
â€¢	Text: FAIL.
â€¢	Full 10 damage applied.
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
â€¢	Health: Green bar â€” 100 / 100.
â€¢	Mana: Blue bar â€” 100 / 100.
â€¢	Chaos Energy: Red bar â€” 0 / 100.
Furai
â€¢	Health: Green bar â€” 80 / 80.
â€¢	Spiritual Energy: White bar â€” 0 / 100.
Sahira
â€¢	Health: Green bar â€” 125 / 125.
â€¢	No Mana bar; show ability-use counts for Hippopotamus Healing (4) and Hippopotamus Shield (10).
Hazel
â€¢	Health: Green bar â€” 80 / 80.
â€¢	No Mana or Chaos bar; show the current Ignis/Glacio form instead.
The HUD should display the character's name, current values, and maximum values.
The three character panels should be clearly grouped and should not cover important battlefield animations.
Active Character Indicator
During a party member's turn, their HUD panel must be highlighted.
Only the current character's ability menu should be active.
Incapacitated Character Indicator
When a character reaches zero Health:
â€¢	Their HUD becomes visually disabled.
â€¢	Their Health bar displays zero.
â€¢	Their turn is skipped.
â€¢	Their action menu is no longer available.
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
Hippopotamus Healing	4 uses per fight
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
â€¢	Neutral before the defensive window.
â€¢	Yellow during the imperfect-block window.
â€¢	White and glowing during the perfect-parry window.
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
â€¢	`dexios.mp3` plays for Triple Lightning, Electric Arc, and Chaotic Lightning.
â€¢	`iobrontes.mp3` plays once for each bolt in Lightning Chain.
â€¢	`trueno.mp3` plays for Watch the Thunder.
â€¢	`armadura.mp3` plays for Divine Retribution.
â€¢	`furai.mp3` plays for Tiger Spear.
â€¢	`tigre.mp3` plays for Tiger Fang.
â€¢	`tigre.mp3` plays for Armor Break.
â€¢	`sahira.mp3` plays for Jackal Strike.
â€¢	`cura.mp3` plays for Hippopotamus Healing.
â€¢	`cura.mp3` plays for Hippopotamus Shield.
â€¢	`perfect_block.mp3` plays for every perfect block by Dexios, Furai, Sahira, or Hazel.
â€¢	`ataque_cosmico.mp3` plays on each Cosmic Rays projectile cast and midpoint direction change.
â€¢	`abrir_portal.mp3` plays once when Portal Shield activates.
â€¢	`teleport_ataque.mp3` plays once per ability redirected by Portal Shield.
â€¢	`meteor_fall.mp3` plays when each Meteor Rain meteor begins its descent.
Existing generic effects may be used for other combat feedback.
Sound effects should support the combat without overpowering the background music.
11.4. Audio Behavior
â€¢	Background music starts when the encounter begins, subject to browser audio playback restrictions.
â€¢	Music continues while the battle remains active.
â€¢	On victory, music transitions to the looping victory track; on defeat, music stops.
â€¢	Sound effects play alongside the music.
â€¢	Audio volumes should be independently adjustable through configuration.
â€¢	A mute option is recommended for testing.
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
â€¢	Character starting statistics.
â€¢	Maximum Health, Mana, Spiritual Energy, and Chaos energy.
â€¢	Attack damage.
â€¢	Ability costs.
â€¢	Chaos energy generation.
â€¢	Enemy attack damage.
â€¢	Boss ability-selection probabilities and availability rules.
â€¢	Turn order.
â€¢	Projectile timing.
â€¢	Defense timing windows.
â€¢	Ability phase timing, including sequential multi-hit and Meteor Rain events.
â€¢	Character positions and scales.
â€¢	Camera zoom and transition speed.
â€¢	Animation references.
â€¢	Visual effects.
â€¢	Audio volume.
â€¢	Audio resource paths and sound-effect event configuration.
â€¢	Both bosses' Health, positions, scales, status effects, ability availability, and independent turn states.
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
â€¢	One target for the full chain.
â€¢	Three independently randomized directions.
â€¢	Three separate timing windows.
â€¢	Three defensive results.
â€¢	Character-specific block and parry calculations.
â€¢	Chain-level perfect-parry tracking.
â€¢	A final counterattack when applicable.
â€¢	Automatic cancellation if the target becomes incapacitated.
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
20.	Jackal Strike has no use limit. Hippopotamus Healing restores a selected conscious ally to maximum Health and can be used four times per fight.
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
47.	The battle remains visually readable at 1920 Ã— 1080 resolution.
48.	Kosmelys's Cosmic Rays targets one party member for both projectiles; each changes direction at its midpoint, moves the same effect to the new directional origin without resetting remaining travel time, and resolves damage exactly once.
49.	Cosmic Rays applies the specified Dexios, Furai, and Sahira defensive and counterattack rules.
50.	Meteor Rain launches five meteors one at a time, with no overlapping projectile, targeting indicator, defensive window, or unresolved event; each new meteor begins falling as soon as the previous perfect-parry window closes.
51.	The first Meteor Rain meteor has a 0.5-second casting phase and 0.5-second travel; following meteors begin falling immediately after the preceding window closes and travel for 0.7 seconds. Every meteor has a 0.4-second normal-block window from T âˆ’ 0.7 to T âˆ’ 0.3, a 0.4-second perfect-parry window from T âˆ’ 0.3 to T + 0.1, and resolves only after T + 0.1.
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
Stage 1 â€” Battlefield and Party Formation
â€¢	Load the supplied temple background.
â€¢	Place Iobrontes and Kosmelys in the background.
â€¢	Place Furai, Dexios, Sahira, and Hazel in the requested formation.
â€¢	Configure sprite scaling and drawing order.
â€¢	Implement the initial HUD.
â€¢	Register Kosmelys's supplied sprites and effects from `kosmelys_assets/` without changing their visual design.
Stage 2 â€” Combat State and Turn Order
â€¢	Create the character statistics.
â€¢	Implement the fixed ten-position turn sequence, with Hazel immediately after Sahira provisionally.
â€¢	Add incapacitation logic.
â€¢	Add victory and defeat conditions.
Stage 3 â€” Playable Character Abilities
â€¢	Implement Dexios's attacks and Chaos energy.
â€¢	Implement Furai's physical attacks and Armor Break.
â€¢	Implement Sahira's attack and healing ability.
â€¢	Implement Hazel's Ignis/Glacio forms, two abilities per form, and full-damage imperfect defense.
â€¢	Add resource costs and target selection.
Stage 4 â€” Iobrontes's Attacks
â€¢	Implement random target selection.
â€¢	Implement the three directional lightning attacks.
â€¢	Load the corresponding directional frames.
â€¢	Implement projectile movement and attack timing.
â€¢	Add Watch the Thunder, its team-wide beam, casting, jump window, and damage resolution.
â€¢	Add Divine Retribution, its electric shield, retaliation damage, and two-player-turn expiration.
â€¢	Select between Iobrontes's three actions with the specified probabilities and announce each action before it begins.
â€¢	Add Kosmelys's Cosmic Rays, Portal Shield, and sequential Meteor Rain actions, with independent ability selection and boss state.
â€¢	Add the two independent boss Health bars, with Kosmelys's bar directly below Iobrontes's.
Stage 5 â€” Defensive Mechanics
â€¢	Implement WASD controls.
â€¢	Implement the directional warning system.
â€¢	Implement the contracting timing ring.
â€¢	Implement imperfect blocks and perfect parries.
â€¢	Add each character's unique defensive calculations.
â€¢	Implement three-perfect-parry counterattacks.
Stage 6 â€” Camera and Visual Feedback
â€¢	Add target highlighting.
â€¢	Add camera zoom and return transitions.
â€¢	Add hit reactions.
â€¢	Add damage numbers and defense result labels.
â€¢	Add lightning and impact effects.
Stage 7 â€” Audio
â€¢	Add alternating background battle music.
â€¢	Add existing and Kosmelys-specific combat sound effects.
â€¢	Balance audio levels.
Stage 8 â€” Final Integration and Testing
â€¢	Verify all damage calculations.
â€¢	Verify resource consumption.
â€¢	Verify the fixed turn sequence.
â€¢	Test incapacitated-character behavior.
â€¢	Test all defensive windows.
â€¢	Verify that animations and camera transitions do not interrupt combat.
â€¢	Confirm victory and defeat behavior.
â€¢	Verify the ten-position dual-boss turn order, both boss health bars, and the requirement to defeat both bosses for victory.
â€¢	Verify independent boss states, ability selection, and defeated-boss turn skipping.
________________________________________
16. VISUAL REFERENCES
The project's asset directory will contain the supplied reference frames for:
â€¢	Dexios
â€¢	Furai
â€¢	Sahira
â€¢	Hazel's Ignis and Glacio forms
â€¢	Iobrontes
â€¢	Kosmelys
â€¢	The temple background
â€¢	Additional combat effects, where available
â€¢	Dexios, Furai, Sahira, and Hazel's form-specific jump frames
â€¢	Iobrontes's Watch the Thunder frame
â€¢	Iobrontes's Divine Retribution electric-armor frame
These assets establish the visual identity and character appearances of the prototype.
The code must reference them through their registered names, allowing images to be replaced or improved without requiring changes to the core combat systems.
________________________________________
Core Design Specification â€” Version 0.5


# LA DEXÃADA â€” DUAL BOSS FIGHT UPDATE
**Design Document Update â€” Kosmelys Implementation**

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

## 1.1. Iobrontes â€” Health Update

Iobrontes's maximum Health is increased to **550 HP**.

Update his initial Health, maximum Health, HUD display, and any related configuration values.

All of his previously implemented abilities and mechanics must remain functional, including Divine Retribution if it is already present in the current build.

Do not change the existing attack probabilities unless required by another explicit instruction.

## 1.2. Kosmelys â€” New Boss

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

The existing playable charactersâ€”Furai, Dexios, Sahira, and Hazelâ€”remain in their current formation.

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

# 2. KOSMELYS â€” CHARACTER ASSETS AND ANIMATION STATES

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
| Attack Down | `kosmelys_abajo.png` |
| Portal Shield | `kosmelys_escudo.png` |
| Meteor Rain | `kosmelys_mr.png` |

The file for Portal Shield should be resolved using its actual supplied filename and extension.

Preserve the actual filenames, including capitalization, because asset paths may be case-sensitive.

When Kosmelys performs an attack, she must switch from her idle frame to the corresponding action frame.

After her action finishes, she must return to `kosmelys_base.png`, except while Portal Shield remains active.

If an asset is missing, use an explicitly labeled temporary placeholder rather than an unrelated image.

---

# 3. KOSMELYS â€” ATTACK 1: COSMIC RAYS

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

- Initial direction Left â†’ `kosmelys_izquierda.png`
- Initial direction Right â†’ `kosmelys_derecha.png`
- Initial direction Up â†’ `kosmelys_arriba.png`
- Initial direction Down â†’ a labeled temporary placeholder because no down frame was supplied

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

# 4. KOSMELYS â€” ATTACK 2: PORTAL SHIELD

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

**Furai â€” Armor Break**

Armor Break does not deal direct damage.

For this implementation, applying Armor Break does not trigger Portal Shield's attack redirection.

The existing tiger mark and damage amplification mechanics remain unchanged.

Armor Break should be associated with the enemy it is applied to. A mark applied to Iobrontes should not automatically amplify damage against Kosmelys.

**Dexios â€” Chaotic Lightning**

If Chaotic Lightning is redirected, its offensive damage is redirected to the selected party member.

Any self-damage associated with the ability remains attached to Dexios according to the existing implementation.

**Sahira â€” Hippopotamus Shield**

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

# 5. KOSMELYS â€” ATTACK 3: METEOR RAIN

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
| Before T âˆ’ 0.7 s | Input ignored |
| T âˆ’ 0.7 s to T âˆ’ 0.3 s | Normal block (0.4 s) |
| T âˆ’ 0.3 s to T + 0.1 s | Perfect parry (0.4 s) |
| After T + 0.1 s | Failed defense if no valid input was registered |

For the first meteor, the attack sequence starts at 0 ms and impact occurs at 1000 ms; its active window opens at 300 ms, the perfect-parry period begins at 700 ms, and the window closes at 1100 ms. Each following meteor's impact occurs 700 ms after it starts falling; its active window opens immediately, the perfect-parry period begins at 400 ms, and the window closes at 800 ms. Do not resolve damage at the visual impact time.

The timing indicator is yellow during the normal-block window, white and glowing during the perfect-parry window, and inactive after the window closes. Sahira has no perfect-parry mechanic: any correct W input during either active period is a normal successful block.

The meteor reaches the target visually at T, but damage is not finalized at that moment. Wait until T + 0.1 seconds, then resolve the result and apply damage or counterattack. This allows a valid perfect parry shortly after visual impact. Every meteor resolves damage exactly once.

## 5.4. Sequential Meteor Sequence â€” No Overlap

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

Each meteor requires an individual defensive response. The correct input is always **W â€” Defend Up**. Every meteor has its own attack identifier, target, projectile, casting and travel timers, input result, and resolution state. One W press resolves only the current meteor; it cannot block multiple meteors. In this sequential system, input overlap is not possible.

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
| Dexios â€” Triple Lightning | Iobrontes or Kosmelys |
| Dexios â€” Electric Arc | Iobrontes or Kosmelys |
| Dexios â€” Chaotic Lightning | Iobrontes or Kosmelys |
| Furai â€” Tiger Spear | Iobrontes or Kosmelys |
| Furai â€” Tiger Fang | Iobrontes or Kosmelys |
| Furai â€” Armor Break | Iobrontes or Kosmelys |
| Sahira â€” Jackal Strike | Iobrontes or Kosmelys |
| Sahira â€” Hippopotamus Healing | Conscious playable ally |
| Sahira â€” Hippopotamus Shield | Conscious playable ally |

Healing and defensive support abilities retain their ally selection menus.

Enemy-targeting abilities must correctly interact with Portal Shield when Kosmelys is protected.

## 6.3. Targeting Visuals

The selected enemy should receive a visible outline, marker, or other targeting indicator.

The interface must show which boss is currently selected before the attack begins.

If the player cancels target selection, the game should return to the ability menu without spending resources or ending the turn.

Resource costs are deducted only after the ability and its target are confirmed.

---

# 7. AUDIO â€” ALTERNATING BATTLE MUSIC

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

Watch the Thunder â†’ Cosmic Strike â†’ Watch the Thunder â†’ Cosmic Strike â†’ Repeat.

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
â”‚
â”œâ”€â”€ dexios/
â”‚   â””â”€â”€ [existing Dexios frames]
â”‚
â”œâ”€â”€ furai/
â”‚   â””â”€â”€ [existing Furai frames]
â”‚
â”œâ”€â”€ sahira/
â”‚   â””â”€â”€ [existing Sahira frames]
â”‚
â”œâ”€â”€ iobrontes/
â”‚   â””â”€â”€ [existing Iobrontes frames]
â”‚
â”œâ”€â”€ kosmelys/
â”‚   â”œâ”€â”€ kosmelys_base.png
â”‚   â”œâ”€â”€ kosmelys_derecha.png
â”‚   â”œâ”€â”€ kosmelys_izquierda.png
â”‚   â”œâ”€â”€ kosmelys_arriba.png
â”‚   â”œâ”€â”€ kosmelys_escudo.png
â”‚   â”œâ”€â”€ kosmelys_herida.png
â”‚   â””â”€â”€ kosmelys_mr.png
â”‚
â”œâ”€â”€ effects/
â”‚   â”œâ”€â”€ cosmico.png
â”‚   â”œâ”€â”€ portal.png
â”‚   â”œâ”€â”€ meteoro.png
â”‚   â”œâ”€â”€ tiger-mark.png
â”‚   â”œâ”€â”€ hippo-mark.png
â”‚   â””â”€â”€ [existing combat effects]
â”‚
â”œâ”€â”€ music/
â”‚   â”œâ”€â”€ watch_the_thunder.mp3
â”‚   â”œâ”€â”€ cosmic_strike.mp3
â”‚   â””â”€â”€ nike.mp3
â”‚
â”œâ”€â”€ sfx/
â”‚   â”œâ”€â”€ ataque_cosmico.mp3
â”‚   â”œâ”€â”€ abrir_portal.mp3
â”‚   â”œâ”€â”€ teleport_ataque.mp3
â”‚   â”œâ”€â”€ meteor_fall.mp3
â”‚   â””â”€â”€ [existing sound effects]
â”‚
â””â”€â”€ backgrounds/
    â””â”€â”€ escenario.png
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

The player wins only when **both Iobrontes and Kosmelys are permanently defeated**.

Each boss begins in NORMAL. Its first Health depletion triggers HEIR MODE after the current player ability finishes; its Health is restored to its full maximum and its combat turn is not reset. The bosses transform independently, and the surviving boss continues acting normally. A boss in HEIR is permanently defeated when its Health is depleted again.

Once permanently defeated, a boss:

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
- Sahira has no Mana. Jackal Strike is unlimited; Hippopotamus Healing has four uses and Hippopotamus Shield has ten uses per battle.
- Sahira can heal or protect any conscious ally, including Hazel.
- Hazel's two elemental forms share 80 Health; her form-specific actions, costs, and precision defense are defined in section 1.4.
- Hippopotamus Shield can protect against damaging attacks, including eligible redirected attacks and meteors.
- Iobrontes retains his existing abilities and unique defensive interactions.
- Kosmelys's Portal Shield only redirects attacks intended for Kosmelys.

Boss-specific status effects must not automatically transfer from one boss to the other.

## 9.6. Heir Mode

Heir Mode uses independent NORMAL, HEIR, and DEFEATED states for each boss. Normal-phase depletion queues one transformation after the active ability resolves, preventing later hits from carrying over to the restored phase. Transformation refills Iobrontes to 550 HP or Kosmelys to 450 HP, switches the boss sprites and turn-order icon, clears its temporary defense and Armor Break state, and does not grant an extra turn.

HEIR damage is doubled while preserving each character's defensive behavior. Iobrontes uses five Lightning Chain strikes, two separately defendable Watch the Thunder sweeps, and 60-damage Divine Retribution. Kosmelys uses three Cosmic Rays projectiles and eight sequential meteors; Portal Shield keeps its existing behavior and does not double redirected player damage. Existing attack probabilities, turn order, perfect-defense rules, and playable-character counterattacks remain unchanged.

Use the exact phase sprite and portrait filenames in section 17, including Iobrontes's `heredero` and Kosmelys's `heredera` naming. Ultimate sprites remain unused.

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
- Every meteor's normal-block window runs from T âˆ’ 0.7 to T âˆ’ 0.3, and its perfect-parry window runs from T âˆ’ 0.3 to T + 0.1; damage resolves only after T + 0.1.
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
  â†“
Iobrontes
  â†“
Kosmelys
  â†“
Dexios
  â†“
Iobrontes
  â†“
Kosmelys
  â†“
Sahira
  â†“
Hazel (provisional)
  â†“
Iobrontes
  â†“
Kosmelys
  â†“
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

Furai â†’ Iobrontes â†’ Dexios â†’ Iobrontes â†’ Sahira â†’ Hazel (provisional) â†’ Iobrontes â†’ Repeat.

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

**End of Dual Boss Update â€” Kosmelys Implementation**

**This is version 0.6, incorporating Hazel as the fourth playable character.**

Nuevos cambios:
1.	Que las flechas direccionales para la defensa muestre la tecla adecuada para defenderse entre W, A, S y D. TambiÃ©n para el ataque de Ã¡rea como Watch the thunder tiene que mostrarse la barra espaciadora bien.
2.	Aumenta un 0.5 segundos de tiempo entre ataques de Iobrontes y Kosmelys

# LA DEXÃADA â€” REDISEÃ‘O COMPLETO DE LA INTERFAZ DE COMBATE EN PHASER

## 1. OBJETIVO PRINCIPAL

Quiero realizar un rediseÃ±o completo de la interfaz de combate de **La DexÃ­ada**, mi videojuego desarrollado en Phaser.

La finalidad es transformar la interfaz actual en una experiencia JRPG mucho mÃ¡s cinematogrÃ¡fica, elegante y dinÃ¡mica, conservando todas las mecÃ¡nicas de combate existentes.

He preparado tres bocetos que deben servir como referencias visuales para la implementaciÃ³n.

**IMPORTANTE: Este trabajo consiste en rediseÃ±ar la interfaz, no en reconstruir el sistema de combate.**

Debes examinar primero cÃ³mo estÃ¡ organizado actualmente el cÃ³digo, identificar los sistemas que ya funcionan y reutilizarlos.

No debes modificar los sprites originales, las habilidades, las estadÃ­sticas, los cÃ¡lculos de daÃ±o ni las reglas del combate.

---

## 2. ARCHIVOS DE REFERENCIA

### 2.1. Bocetos de interfaz

He creado tres imÃ¡genes que muestran cÃ³mo debe funcionar y verse la nueva interfaz.

Sus nombres son:

**boceto_combate**

Es la imagen principal que muestra la distribuciÃ³n completa de la interfaz durante el combate.

Define:
- Posiciones generales de los personajes.
- DistribuciÃ³n de los dos bosses.
- Cola de turnos en la esquina superior izquierda.
- InformaciÃ³n de los enemigos en la zona superior.
- Estado de los aliados en la parte inferior derecha.
- DistribuciÃ³n general de los elementos permanentes del HUD.

**boceto_elegir_ataque**

Muestra cÃ³mo debe verse la pantalla durante el turno de un personaje jugable.

Define:
- Zoom cinematogrÃ¡fico hacia el personaje activo.
- MenÃº de habilidades.
- PosiciÃ³n aproximada de la ventana.
- DistribuciÃ³n de las tres opciones de ataque.
- ComposiciÃ³n de la cÃ¡mara durante la elecciÃ³n.

**boceto_objetivo**

Muestra cÃ³mo debe verse la pantalla cuando el jugador selecciona a quÃ© enemigo atacar.

Define:
- Zoom hacia los dos bosses.
- ComposiciÃ³n que permite visualizar ambos enemigos ampliados.
- Flecha indicadora del objetivo.
- SelecciÃ³n de uno de los dos dioses.

### Instrucciones sobre los bocetos

Debes examinar las tres imÃ¡genes antes de implementar los cambios.

Los bocetos representan el diseÃ±o y la composiciÃ³n que quiero conseguir.

No son imÃ¡genes que deban utilizarse como fondos del juego ni interfaces estÃ¡ticas.

**Debes recrear sus elementos mediante objetos reales de Phaser**, conectados a los sistemas existentes.

Respeta especialmente las posiciones relativas, tamaÃ±os, agrupaciones de elementos y cambios de cÃ¡mara.

Puedes mejorar los acabados, la tipografÃ­a y la ornamentaciÃ³n para obtener una interfaz profesional, pero sin alterar sustancialmente la composiciÃ³n de los bocetos.

---

## 3. ARCHIVOS DE ICONOS DE PERSONAJES

Los siguientes archivos serÃ¡n utilizados para representar a cada personaje en la interfaz:

| Archivo | Personaje |
|---|---|
| `iobrontes_icono` | IÃ³brontÄ“s |
| `kosmelys_icono` | Kosmelys |
| `dexios_icono` | Dexios |
| `sahira_icono` | Sahira |
| `furai_icono` | Furai |

Estos nombres identifican los recursos grÃ¡ficos. Utiliza las extensiones y rutas reales que encuentres en el proyecto.

### Uso de los iconos

Los iconos se utilizarÃ¡n principalmente en dos elementos:

**A. Cola de turnos**

Los cinco iconos deben poder aparecer en la cola situada en la esquina superior izquierda.

Cada icono representa quiÃ©n actuarÃ¡ en ese turno.

Un mismo personaje puede aparecer varias veces si tiene varias acciones dentro de los prÃ³ximos seis turnos.

**B. Panel de estado de aliados**

Los iconos de los cuatro aliados deben aparecer junto a sus datos de estado: manÃ¡ para Dexios, energÃ­a espiritual blanca para Furai, usos disponibles para Sahira y forma elemental para Hazel.

### Requisitos tÃ©cnicos

- Cargar los archivos mediante el sistema de recursos de Phaser.
- Reutilizar las texturas cargadas.
- Mantener sus proporciones originales.
- No estirar ni deformar las imÃ¡genes.
- No sustituirlos por letras o cÃ­rculos de colores si los archivos estÃ¡n disponibles.
- Utilizar mÃ¡scaras circulares o marcos decorativos cuando corresponda.
- No duplicar innecesariamente los archivos originales.

Si algÃºn recurso no se encuentra, identifica cuÃ¡l falta e informa del problema.

---

## 4. RESOLUCIÃ“N Y DISTRIBUCIÃ“N GENERAL

La interfaz estÃ¡ diseÃ±ada para una resoluciÃ³n de referencia de:

**1920 Ã— 1080 pÃ­xeles â€” 16:9**

Utiliza `boceto_combate` como principal referencia para distribuir los elementos.

### DistribuciÃ³n

**Esquina superior izquierda**

Cola de los siguientes seis turnos.

**Parte superior**

InformaciÃ³n de los dos jefes.

**Zona central**

Escenario y sprites de combate.

**Lateral inferior derecho**

Panel de estado de los personajes jugables.

**Paneles temporales**

MenÃºs de habilidades y selecciÃ³n de objetivos, que aparecerÃ¡n Ãºnicamente cuando corresponda.

### Posicionamiento de personajes

Mantener el escenario y los sprites actuales.

La distribuciÃ³n de los aliados debe seguir el boceto:

- Furai a la izquierda.
- Dexios en la zona central.
- Sahira hacia la derecha.
- Hazel ocupa una posiciÃ³n configurable que no debe desplazar innecesariamente a los demÃ¡s personajes.

Los enemigos serÃ¡n:

- IÃ³brontÄ“s.
- Kosmelys.

No cambiar sus diseÃ±os grÃ¡ficos ni reemplazar sus animaciones.

Ajustar las posiciones y escalas Ãºnicamente cuando sea necesario para reproducir la composiciÃ³n visual deseada.

---

## 5. COLA DE TURNOS

En la esquina superior izquierda debe aparecer una columna compacta con los iconos de los prÃ³ximos seis turnos.

La cola muestra:

**El turno actual + los cinco siguientes.**

Por ejemplo:

1. Furai.
2. IÃ³brontÄ“s.
3. Kosmelys.
4. Dexios.
5. IÃ³brontÄ“s.
6. Kosmelys.

Esta secuencia es Ãºnicamente ilustrativa.

La interfaz debe consultar el sistema real de turnos del juego y representar su secuencia autÃ©ntica.

### Funcionamiento

Cuando empieza el combate:
- Mostrar los seis turnos correspondientes.

Cuando comienza un turno:
- El icono correspondiente ocupa la primera posiciÃ³n.
- El primer icono debe diferenciarse del resto.

Cuando termina un turno:
- La lista avanza.
- Desaparece el turno completado.
- Los demÃ¡s ascienden.
- Se incorpora el siguiente turno al final.

Si un personaje queda derrotado:
- La lista debe respetar el sistema existente que omite sus acciones.
- No debe presentar como ejecutable un turno que realmente no ocurrirÃ¡.

Si un personaje o boss actÃºa varias veces:
- Su icono aparecerÃ¡ tantas veces como corresponda.

### Apariencia

- Iconos compactos.
- OrganizaciÃ³n vertical.
- SeparaciÃ³n uniforme.
- Marcos sutiles.
- Turno activo destacado.
- Los otros cinco iconos ligeramente menos prominentes.

Se puede aÃ±adir una transiciÃ³n visual breve al actualizar la cola.

No quiero textos enormes ni paneles que oculten gran parte del escenario.

---

## 6. INFORMACIÃ“N DE LOS DOS BOSSES

En la parte superior deben mostrarse los indicadores de vida de ambos enemigos.

Seguir la distribuciÃ³n de `boceto_combate`.

### IÃ“BRONTÄ’S

Mostrar:
- Nombre: IÃ“BRONTÄ’S.
- TÃ­tulo divino correspondiente.
- Barra de vida morada.
- Vida actual y mÃ¡xima, si esos valores ya se muestran en el juego.

### KOSMELYS

Mostrar:
- Nombre: KOSMELYS.
- TÃ­tulo divino correspondiente.
- Barra de vida naranja o dorada.
- Vida actual y mÃ¡xima, si corresponde.

Mantener los tÃ­tulos completos y los valores establecidos en los datos actuales del juego.

### Comportamiento

Las barras deben actualizarse automÃ¡ticamente cuando cada boss recibe daÃ±o o recupera vida.

Los indicadores no deben perder su posiciÃ³n cuando la cÃ¡mara aplica zoom.

Si un boss es derrotado, su indicador debe reflejar el estado correspondiente.

El diseÃ±o visual debe transmitir importancia y solemnidad, sin resultar demasiado recargado.

---

## 7. PANEL DE ESTADO DE ALIADOS

La interfaz actual tiene paneles grandes en la parte inferior.

Quiero sustituirlos por el diseÃ±o compacto de `boceto_combate`.

En la parte inferior derecha aparecerÃ¡ una columna vertical con los personajes jugables.

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
- Blanca: energÃ­a espiritual (0â€“100).
- Tiger Spear y Tiger Parry exitosos conceden 30 puntos de energÃ­a espiritual.
- Tiger Fang cuesta 20 de energÃ­a espiritual; Armor Break cuesta 25.

### SAHIRA

Icono: `sahira_icono`

Barras:
- Verde: HP.
- Sin barra de manÃ¡. Jackal Strike no tiene lÃ­mite de usos; Hippopotamus Healing tiene 4 usos y Hippopotamus Shield tiene 10 usos por pelea.

### HAZEL LANCASTER

Mostrar su retrato de Ignis (`hazel_fuego_icono`) o Glacio (`hazel_hielo_icono`), 80 / 80 HP y un indicador de forma en lugar de una barra de manÃ¡:

- IGNIS en naranja.
- GLACIO en azul claro.
- Sin barras de manÃ¡ ni caos.

### Comportamiento de las barras

- Deben representar los valores reales.
- Deben actualizarse al recibir daÃ±o.
- Deben actualizarse al utilizar habilidades.
- Deben actualizarse al recuperar recursos.
- Deben conservar los valores entre turnos.
- Deben reflejar correctamente cuando un personaje ha sido derrotado.

No reiniciar ni reemplazar las estadÃ­sticas originales.

### DiseÃ±o

Quiero barras horizontales pequeÃ±as, fÃ¡ciles de leer, situadas junto a los iconos.

El panel debe ocupar mucho menos espacio que la interfaz anterior.

---

## 8. SELECCIÃ“N DE HABILIDADES â€” ZOOM AL PERSONAJE

Tomar como referencia exacta:

**`boceto_elegir_ataque`**

Cuando empieza el turno de un personaje controlado por el jugador, la cÃ¡mara debe realizar un zoom cinematogrÃ¡fico hacia Ã©l.

### Secuencia

1. Termina el turno anterior.
2. Se identifica al personaje activo.
3. Se actualiza la cola de turnos.
4. La cÃ¡mara se desplaza hacia el personaje activo.
5. Se realiza un zoom muy pronunciado.
6. Aparece una ventana translÃºcida con sus habilidades.
7. Se habilita la selecciÃ³n por teclado y mouse.

### CÃ¡mara

El personaje debe ocupar una porciÃ³n importante de la pantalla.

Quiero que el zoom sea notorio, no un acercamiento mÃ­nimo.

Debe permitir apreciar los detalles de su sprite.

Evitar recortar excesivamente su cuerpo o sus animaciones.

### Ventana de habilidades

Debe ser un rectÃ¡ngulo con fondo oscuro translÃºcido.

Quiero que el escenario siga siendo parcialmente visible detrÃ¡s de la ventana.

Dentro aparecerÃ¡n las habilidades disponibles del personaje: tres para quienes tengan tres acciones y exactamente dos para Hazel, segÃºn su forma.

Ejemplo de distribuciÃ³n:

1 â€” Primera habilidad

2 â€” Segunda habilidad

3 â€” Tercera habilidad

Los nombres y funciones deben obtenerse del sistema actual.

No inventar habilidades nuevas ni sustituir las existentes.

### Control por teclado

- Tecla `1`: seleccionar habilidad 1.
- Tecla `2`: seleccionar habilidad 2.
- Tecla `3`: seleccionar habilidad 3.

### Control con mouse

Cada habilidad debe ser un botÃ³n interactivo.

Al pasar el cursor:
- Resaltar ligeramente la habilidad.
- Mostrar claramente que es seleccionable.

Al hacer clic:
- Seleccionar esa habilidad.

### Restricciones

Si una habilidad no tiene suficiente manÃ¡ o no cumple los requisitos para ejecutarse:
- Debe mostrarse deshabilitada.
- No debe poder seleccionarse.
- El sistema no debe gastar recursos.

Las acciones solo se ejecutan cuando la selecciÃ³n sea vÃ¡lida.

### Posicionamiento

El panel debe seguir la composiciÃ³n de `boceto_elegir_ataque`.

No debe tapar completamente al personaje.

Debe situarse de forma que tanto el personaje como sus habilidades sean claramente visibles.

---

## 9. SELECCIÃ“N DE OBJETIVOS â€” ZOOM A LOS BOSSES

Tomar como referencia:

**`boceto_objetivo`**

Cuando el jugador elige una habilidad que requiere seleccionar un enemigo, se activa el modo de selecciÃ³n de objetivo.

### Secuencia

1. El jugador selecciona una habilidad.
2. El menÃº de habilidades desaparece.
3. La cÃ¡mara sale del zoom del aliado.
4. Se desplaza hacia la zona de los bosses.
5. Se aplica un zoom muy pronunciado.
6. Ambos bosses deben verse grandes.
7. Aparece una flecha indicando el objetivo al que se estÃ¡ apuntando.
8. El jugador selecciona uno de los bosses.

### Apariencia

Los dos jefes deben seguir siendo visibles durante la selecciÃ³n.

No quiero que el zoom termine mostrando exclusivamente a uno de ellos.

Se debe poder comparar visualmente ambos objetivos.

### Flecha indicadora

La flecha debe seÃ±alar claramente al boss seleccionado.

Debe estar posicionada cerca de Ã©l, sin taparlo innecesariamente.

El objetivo seÃ±alado debe distinguirse de manera inmediata.

Se puede aÃ±adir un pequeÃ±o resplandor o borde de selecciÃ³n, pero evitar efectos excesivos.

### Control por teclado

- Tecla `1`: seleccionar y confirmar a IÃ³brontÄ“s.
- Tecla `2`: seleccionar y confirmar a Kosmelys.

### Control con mouse

El jugador podrÃ¡ hacer clic directamente sobre el sprite del boss correspondiente.

Al pasar el mouse sobre un enemigo:
- La flecha debe indicar ese objetivo.
- Debe existir una respuesta visual que muestre que puede seleccionarse.

Al hacer clic:
- Se confirma el objetivo.

El sistema debe utilizar las zonas interactivas de los sprites correctamente, incluso cuando la cÃ¡mara tenga zoom.

### ConfirmaciÃ³n

Al elegir un objetivo vÃ¡lido:

1. Se guarda el objetivo seleccionado.
2. Se cierra la interfaz de selecciÃ³n.
3. Se prepara la cÃ¡mara para la ejecuciÃ³n del ataque.
4. Se reproduce la habilidad existente.
5. Se aplican los efectos segÃºn las mecÃ¡nicas actuales.
6. Se actualizan los recursos y la vida de los personajes.

### Enemigos derrotados

No permitir seleccionar a un enemigo que ya no pueda recibir ataques segÃºn las reglas actuales.

Si queda un solo enemigo disponible, el sistema debe permitir seleccionarlo correctamente.

Las habilidades que no necesitan objetivo o afectan a todos los enemigos deben conservar su lÃ³gica actual y no abrir una selecciÃ³n individual innecesaria.

---

## 10. CANCELAR SELECCIÃ“N â€” ESCAPE Y BACK

Durante la selecciÃ³n de objetivos quiero poder retroceder.

### Teclado

Pulsar `Escape`.

### Mouse

AÃ±adir un botÃ³n visible que diga:

**Back**

### Comportamiento

Al pulsar Escape o hacer clic en Back:

1. Cancelar la selecciÃ³n del enemigo.
2. No ejecutar ninguna habilidad.
3. No consumir manÃ¡.
4. No modificar las estadÃ­sticas.
5. No terminar el turno.
6. Desactivar el modo de selecciÃ³n de objetivo.
7. Volver a enfocar al personaje activo.
8. Restaurar el zoom de selecciÃ³n de habilidades.
9. Volver a mostrar las tres habilidades.

De esta manera, el jugador podrÃ¡ cambiar de opiniÃ³n antes de confirmar el ataque.

El botÃ³n Back solo debe aparecer cuando tenga sentido retroceder.

---

## 11. SISTEMA DE CÃMARA

La cÃ¡mara es uno de los elementos mÃ¡s importantes del rediseÃ±o.

Quiero distinguir tres encuadres principales.

### A. CÃMARA GENERAL

Es la vista normal del combate.

Se muestran:
- Los aliados.
- Los bosses.
- El escenario.
- La cola de turnos.
- Los indicadores de estado.

La composiciÃ³n debe corresponder a `boceto_combate`.

### B. CÃMARA DE HABILIDADES

Se activa cuando llega el turno de un aliado.

Debe:
- Enfocar al personaje activo.
- Acercar considerablemente la cÃ¡mara.
- Mantener al personaje bien encuadrado.
- Mostrar el panel translÃºcido de habilidades.

La composiciÃ³n debe corresponder a `boceto_elegir_ataque`.

### C. CÃMARA DE OBJETIVOS

Se activa al elegir una habilidad que necesita objetivo.

Debe:
- Desplazarse hacia los bosses.
- Acercar considerablemente la cÃ¡mara.
- Mantener visibles a ambos.
- Mostrar la flecha del objetivo.
- Permitir la selecciÃ³n por teclado o mouse.

La composiciÃ³n debe corresponder a `boceto_objetivo`.

### Transiciones

No quiero cambios instantÃ¡neos y bruscos entre los encuadres.

Utilizar interpolaciones suaves para:
- Movimiento de cÃ¡mara.
- Zoom.
- RestauraciÃ³n del encuadre general.

Las transiciones deben ser rÃ¡pidas y fluidas, sin volver lento el ritmo del combate.

Los valores exactos de zoom y duraciÃ³n deben ajustarse segÃºn la posiciÃ³n real y las dimensiones de los sprites.

No establecer valores arbitrarios sin comprobar cÃ³mo se ven en pantalla.

### Muy importante

El sistema de cÃ¡mara no debe alterar:
- Las ventanas de parry.
- La duraciÃ³n de los ataques.
- Las animaciones defensivas.
- Los tiempos de reacciÃ³n.
- El funcionamiento de habilidades.

El zoom debe ser una presentaciÃ³n visual, no una modificaciÃ³n de las reglas del combate.

---

## 12. INTERFAZ PERMANENTE E INTERFAZ CONTEXTUAL

Quiero separar correctamente los elementos permanentes de los temporales.

### Elementos permanentes

Deben mantenerse correctamente posicionados:
- Cola de turnos.
- InformaciÃ³n de los bosses.
- Panel de estado de aliados.

### Elementos contextuales

AparecerÃ¡n Ãºnicamente durante ciertas acciones:
- MenÃº de habilidades.
- Flecha de selecciÃ³n de objetivo.
- BotÃ³n Back.
- Indicadores de defensa ya existentes.

### InteracciÃ³n con el zoom

Los elementos del HUD deben permanecer anclados a la pantalla.

**No quiero que las barras de vida ni los iconos se hagan enormes cuando la cÃ¡mara acerca a un personaje.**

Utilizar una soluciÃ³n apropiada para Phaser, como una cÃ¡mara independiente para la interfaz o elementos con `setScrollFactor(0)` cuando corresponda.

El menÃº contextual debe estar visualmente situado segÃºn el boceto, pero mantenerse legible e interactivo durante los acercamientos.

---

## 13. CONTROLES DE LA NUEVA INTERFAZ

### SelecciÃ³n de habilidades

| Entrada | AcciÃ³n |
|---|---|
| 1 | Primera habilidad |
| 2 | Segunda habilidad |
| 3 | Tercera habilidad |
| Mouse | Seleccionar una habilidad |

### SelecciÃ³n de objetivos

| Entrada | AcciÃ³n |
|---|---|
| 1 | Seleccionar a IÃ³brontÄ“s |
| 2 | Seleccionar a Kosmelys |
| Mouse | Seleccionar haciendo clic en el boss |
| Escape | Volver a habilidades |
| Back | Volver a habilidades |

### Controles defensivos

Conservar los controles actuales:

| Entrada | AcciÃ³n |
|---|---|
| W | Defender arriba |
| A | Defender izquierda |
| S | Defender abajo |
| D | Defender derecha |
| Space | Saltar o esquivar cuando corresponda |

Para Hazel, la direcciÃ³n correcta antes del Perfect Parry no reduce el daÃ±o: solo la Parada Perfecta evita el golpe. Esto no cambia las defensas ni los contraataques de los otros personajes.

TambiÃ©n conservar los controles existentes para:
- Reiniciar el combate.
- Controlar el audio.
- Cualquier otra acciÃ³n implementada.

### Evitar conflictos

Las teclas `1`, `2` y `3` deben interpretarse segÃºn la fase activa.

Por ejemplo:

Si estoy seleccionando habilidades, `1` significa primera habilidad.

Si estoy seleccionando un objetivo, `1` significa atacar a IÃ³brontÄ“s.

Durante una defensa, esas teclas no deben activar accidentalmente habilidades o selecciones.

No debe ser posible ejecutar dos acciones por una sola pulsaciÃ³n.

---

## 14. TURNOS ENEMIGOS Y DEFENSAS

Cuando llegue el turno de un boss:

- Actualizar la cola de turnos.
- Ocultar los menÃºs de habilidades.
- Desactivar la selecciÃ³n de objetivos.
- Ejecutar el comportamiento enemigo existente.
- Mostrar las animaciones correspondientes.
- Mantener visibles los indicadores necesarios.

Durante los ataques enemigos, el jugador debe seguir pudiendo defenderse con las mecÃ¡nicas originales.

No modificar:
- Parry perfecto.
- Parry imperfecto.
- Bloqueos direccionales.
- Saltos evasivos.
- Contraataques.
- Costes de recursos.
- CÃ¡lculos de daÃ±o.
- Ventanas de tiempo.

En particular, conservar las diferencias entre las defensas de Dexios, Furai y Sahira.

Sahira debe mantener su sistema especial de bloqueo, sin incorporar un parry perfecto que no existe en su diseÃ±o.
Hazel no puede bloquear eficazmente: el bloqueo imperfecto y el fallo aplican el daÃ±o completo de Lightning Chain, Cosmic Rays y Meteor Rain. Solo una parada perfecta evita ese daÃ±o y Hazel nunca realiza un contraataque. Hippopotamus Shield y el salto en equipo siguen funcionando segÃºn sus reglas existentes.

Las animaciones de cÃ¡mara no deben interferir con la sincronizaciÃ³n del ataque enemigo ni con la posibilidad de reaccionar a tiempo.

---

## 15. ESTILO ARTÃSTICO

Quiero una interfaz que encaje con la estÃ©tica de La DexÃ­ada.

InspiraciÃ³n:
- MitologÃ­a griega.
- FantasÃ­a.
- JRPG.
- Combate cinematogrÃ¡fico.

### Colores

Paleta principal:
- Morado.
- Dorado.
- Negro translÃºcido.

Colores funcionales:
- Verde: vida.
- Azul: manÃ¡.
- Rojo: caos.
- Morado: vida de IÃ³brontÄ“s.
- Naranja o dorado: vida de Kosmelys.

### OrnamentaciÃ³n

Se pueden incorporar:
- Bordes dorados finos.
- Patrones de grecas griegas.
- PequeÃ±os sÃ­mbolos divinos.
- Detalles decorativos discretos.

Evitar:
- Marcos excesivamente grandes.
- Ventanas demasiado opacas.
- Efectos visuales innecesarios.
- Texto demasiado pequeÃ±o.
- Exceso de ornamentaciÃ³n.

La prioridad es mantener una interfaz legible y elegante.

Los personajes deben seguir siendo los protagonistas visuales.

---

## 16. IMPLEMENTACIÃ“N TÃ‰CNICA EN PHASER

Antes de escribir cÃ³digo, inspecciona el proyecto actual.

Identifica:
- Escena principal de combate.
- Sistema de turnos.
- Sistema de habilidades.
- Sistema de objetivos.
- Controles de teclado.
- Controles del mouse.
- CÃ¡maras.
- GestiÃ³n de sprites.
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

Los tres bocetos son referencias de diseÃ±o, mientras que los cinco iconos son recursos que se mostrarÃ¡n en el juego.

No inventar rutas ni cambiar sus nombres innecesariamente.
Preserve the supplied filenames exactly. In particular, map the Ignis idle to its actual `hazel__fuego_base.png` filename and the Glacio jump to `hazelo_hielo_salto.png`; retain logical animation keys in configuration rather than renaming these files.

### OrganizaciÃ³n de la interfaz

Recomiendo separar los sistemas de:

1. Cola de turnos.
2. Indicadores de vida de bosses.
3. Panel de estado de aliados.
4. MenÃº de habilidades.
5. SelecciÃ³n de objetivos.
6. Transiciones de cÃ¡mara.

Pueden implementarse como componentes o funciones independientes segÃºn la estructura existente.

Evitar reescribir el sistema completo cuando sea posible reutilizar componentes actuales.

### Estados de interfaz

Gestionar claramente los estados:

- `PLAYER_ABILITY_SELECT`
- `ENEMY_TARGET_SELECT`
- `ACTION_EXECUTION`
- `ENEMY_TURN`
- `DEFENSE_PHASE`
- `BATTLE_END`

Estos nombres son orientativos. Si ya existe una mÃ¡quina de estados, integrarse en ella en lugar de crear otra que entre en conflicto.

### Seguridad de interacciones

- No registrar varias veces un mismo evento de teclado.
- No permitir clics duplicados.
- Bloquear acciones incompatibles durante las transiciones.
- Eliminar o desactivar correctamente los listeners que dejen de utilizarse.
- Evitar que Escape provoque varias cancelaciones.
- No permitir confirmar un objetivo mientras la cÃ¡mara todavÃ­a estÃ¡ cambiando si eso genera errores.
- No permitir acciones despuÃ©s de finalizar el combate.

### ResoluciÃ³n

Trabajar sobre la resoluciÃ³n base de 1920 Ã— 1080.

Mantener proporciones, posiciones relativas y legibilidad si cambia el tamaÃ±o de la ventana.

No deformar los sprites ni los iconos.

---

## 17. EJEMPLO DEL FLUJO COMPLETO

Este es el comportamiento que quiero observar al jugar.

### PASO 1 â€” EMPIEZA EL TURNO DE DEXIOS

- La cola de turnos muestra a Dexios en primera posiciÃ³n.
- La cÃ¡mara se acerca cinematogrÃ¡ficamente a Dexios.
- Aparece el menÃº de habilidades.

La apariencia debe seguir `boceto_elegir_ataque`.

### PASO 2 â€” SELECCIONO UNA HABILIDAD

Pulso la tecla `2`.

El juego identifica la segunda habilidad real de Dexios.

Comprueba sus requisitos.

Si necesita seleccionar un objetivo, pasa a la siguiente fase.

### PASO 3 â€” ZOOM A LOS BOSSES

- El menÃº de habilidades desaparece.
- La cÃ¡mara se desplaza hacia IÃ³brontÄ“s y Kosmelys.
- Ambos aparecen grandes.
- Aparece la flecha de selecciÃ³n.

La apariencia debe seguir `boceto_objetivo`.

### PASO 4 â€” ELIJO UN OBJETIVO

Puedo pulsar:

- `1` para IÃ³brontÄ“s.
- `2` para Kosmelys.

TambiÃ©n puedo hacer clic directamente en cualquiera de ellos.

### PASO 5 â€” OPCIÃ“N DE RETROCEDER

Si no quiero realizar ese ataque, pulso Escape o hago clic en Back.

Entonces:
- Se cancela la selecciÃ³n.
- La cÃ¡mara regresa a Dexios.
- Reaparece el menÃº de habilidades.
- No he gastado recursos ni perdido el turno.

### PASO 6 â€” CONFIRMO EL ATAQUE

Si confirmo un enemigo:
- Desaparece la interfaz de selecciÃ³n.
- La cÃ¡mara presenta la acciÃ³n.
- Dexios realiza su ataque correspondiente.
- Se ejecutan las animaciones existentes.
- Se calculan los daÃ±os.
- Se actualizan las barras.
- Termina el turno.

### PASO 7 â€” SIGUIENTE TURNO

- La cola avanza.
- Se identifica al siguiente personaje.
- Si es aliado, se activa su selecciÃ³n de habilidades.
- Si es enemigo, se ejecuta su comportamiento.
- El combate continÃºa normalmente.

---

## 18. ELEMENTOS QUE DEBEN PERMANECER INTACTOS

No modificar las reglas existentes del juego.

Especialmente:

- Orden de turnos.
- EstadÃ­sticas.
- Vida mÃ¡xima.
- ManÃ¡ mÃ¡ximo.
- Caos de Dexios.
- Habilidades individuales.
- DaÃ±os.
- Costes.
- Estados alterados.
- Parrys.
- Ventanas de defensa.
- Bloqueos direccionales.
- Evasiones.
- Contraataques.
- Animaciones de los sprites.
- MecÃ¡nicas especiales de los bosses.
- Condiciones de victoria.
- Condiciones de derrota.
- Audio.
- Reinicio del combate.

Si una modificaciÃ³n visual requiere cambiar parte del cÃ³digo existente, conservar su comportamiento original.

La nueva interfaz debe utilizar los sistemas del combate, no sustituirlos por sistemas paralelos incompatibles.

---

## 19. ORDEN RECOMENDADO DE IMPLEMENTACIÃ“N

Quiero que realices el rediseÃ±o de forma ordenada.

### Etapa 1 â€” Analizar el proyecto

Examinar la estructura del cÃ³digo y localizar los recursos.

Determinar quÃ© sistemas pueden reutilizarse.

### Etapa 2 â€” Implementar la interfaz general

Utilizar `boceto_combate`.

Crear:
- Cola de turnos.
- InformaciÃ³n de bosses.
- Panel de estado de aliados.
- DistribuciÃ³n general.

Comprobar que todas las barras muestran valores reales.

### Etapa 3 â€” SelecciÃ³n de habilidades

Utilizar `boceto_elegir_ataque`.

Implementar:
- Zoom al aliado.
- MenÃº translÃºcido.
- Controles 1, 2 y 3.
- Botones interactivos.

### Etapa 4 â€” SelecciÃ³n de objetivos

Utilizar `boceto_objetivo`.

Implementar:
- Zoom a los bosses.
- Flecha de selecciÃ³n.
- Teclas 1 y 2.
- SelecciÃ³n con mouse.
- Escape.
- BotÃ³n Back.

### Etapa 5 â€” IntegraciÃ³n con el combate

Conectar los sistemas nuevos a:
- Habilidades existentes.
- Consumo de recursos.
- Turnos.
- DaÃ±o.
- Animaciones.
- Estados de derrota.

### Etapa 6 â€” Pruebas

Comprobar al menos:

- Turnos de los tres aliados.
- Turnos de ambos bosses.
- SelecciÃ³n de las tres habilidades.
- SelecciÃ³n de IÃ³brontÄ“s.
- SelecciÃ³n de Kosmelys.
- CancelaciÃ³n mediante Escape.
- CancelaciÃ³n mediante Back.
- Clics del mouse.
- ActualizaciÃ³n de las barras.
- ActualizaciÃ³n de los seis turnos.
- Comportamiento cuando un personaje muere.
- Comportamiento cuando un boss muere.
- Defensas durante los turnos enemigos.
- Condiciones de victoria y derrota.
- Posicionamiento de la UI durante todos los zooms.
- RestauraciÃ³n correcta de la cÃ¡mara.

### Etapa 7 â€” Acabados visuales

Cuando todo funcione, aÃ±adir:
- Transiciones suaves.
- Resaltados.
- Bordes decorativos.
- PequeÃ±as animaciones de los paneles.
- Ajustes de espaciado, tipografÃ­a y proporciones.

---

## 20. RESULTADO FINAL ESPERADO

Quiero que el sistema de combate tenga tres presentaciones principales:

**1. Vista general â€” `boceto_combate`**

Muestra todo el combate, los enemigos, los aliados, las barras y la cola de turnos.

**2. ElecciÃ³n de habilidades â€” `boceto_elegir_ataque`**

Zoom cinematogrÃ¡fico al personaje activo con un menÃº translÃºcido de tres habilidades seleccionables mediante teclado o mouse.

**3. ElecciÃ³n de objetivo â€” `boceto_objetivo`**

Zoom cinematogrÃ¡fico a los dos dioses, con una flecha indicadora del objetivo, selecciÃ³n mediante teclado o mouse y opciÃ³n Back para regresar.

Los iconos de los personajes deben obtenerse de los archivos indicados anteriormente y de los retratos suministrados de Hazel para sus dos formas.

**La prioridad es que esta nueva interfaz funcione correctamente dentro del combate que ya existe, que respete mis bocetos y que haga mucho mÃ¡s cinematogrÃ¡fica la experiencia del jugador.**

No quiero que reconstruyas todo el juego ni que cambies sus mecÃ¡nicas.

Quiero una nueva presentaciÃ³n visual profesional, dinÃ¡mica y funcional sobre el sistema ya implementado.

# LA DEXÃADA â€” VISUAL, UI AND GAMEPLAY CORRECTIONS

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

## 2. HAZEL â€” GLACIO DEFENSIVE ANIMATION BUG

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

## 3. HAZEL â€” ARMOR BREAK COMPATIBILITY

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

## 4. UNIVERSAL GAME FONT â€” ARCHEOLOGICAPS

Apply the supplied font:

`Archeologicaps.ttf`

The font family is:

`Archeologicaps`

Use it as the universal typeface throughout La DexÃ­ada.

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

## 5. FURAI â€” RESOURCE LABEL CORRECTION

In Furai's HUD, change the resource label to:

**ESPÃRITU**

Do not display:

- E. ESPIRITUAL
- ENERGÃA ESPIRITUAL
- ESPIRITUAL

The displayed label must be exactly:

`ESPÃRITU`

Keep the existing resource bar, values, colors, functionality, and resource calculations unchanged.

Apply the Archeologicaps font to this label.

Make sure the accented character Ã renders correctly.

## 6. HAZEL â€” ELEMENTAL STATUS INDICATOR

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

## 7. SAHIRA â€” ALLY SELECTION MENU LAYOUT

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

If the available screen space becomes insufficient, the panel may reposition itself or use an internal scroll area, but the preferred presentation at 1920 Ã— 1080 is to display all four allies simultaneously.

### Input and Targeting

Preserve existing ally selection controls.

The player must still be able to select allies using the keyboard or mouse.

Incapacitated characters remain unavailable as healing or shield targets according to the existing rules.

Do not alter the abilities' healing amounts, resource costs, or protection mechanics.

## 8. BOSS HEALTH BARS â€” ALWAYS VISIBLE DURING PLAYER ATTACKS

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
11. Furai's resource label reads `ESPÃRITU`, including the accented `Ã`.
12. Hazel's `IGNIS` and `GLACIO` labels are centered, legible, and update after a successful shift.
13. All four ally targets fit inside the selection panel and remain keyboard- and mouse-selectable.
14. Both boss Health bars remain visible and update during player actions, including each hit in a multi-hit attack.
15. Healing amount and target rules, shielding, resource calculations, turn order, defensive timing, boss behavior, and standard-scene damage rules remain unchanged; tutorial combat applies only its configured god-damage and timing modifiers.

Combat sprites for Dexios, Furai, Sahira, Hazel, Iobrontes, and Kosmelys are generated as transparent 1536 Ã— 1536 PNGs in `assets/normalized/`; the original artwork remains untouched. Run `.\scripts\normalize-character-sprites.ps1` to reproduce them. Normalized frames share the configured 1320 ground baseline and reference visible height in `GAME_CONFIG`, so Phaser uses one character scale without rescanning alpha bounds at runtime. The party spacing follows `bocetos/boceto_combate.jpeg`; compact numeric HUD values use a readable UI font, while decorative text retains Archeologicaps. Per-frame exceptions live in `GAME_CONFIG.sprite.frameScale` (Dexios and Hazel Ignis/Glacio defense frames at 50% or 110%). Hazel's attack frames are `hazel_fuego_dance` and `hazel_hielo_shards`, held for `GAME_CONFIG.timing.hazelAttackPoseMs` before returning to idle. Pressing H on the welcome scene opens `escena_pruebahazel` (`src/hazel-test-scene.ts`), a sandbox with Hazel's forms, abilities, targeting, jump, and free W/A/S/D dodge poses against two refilling boss dummies. Pressing S opens `escena_sahira_prueba` (`src/sahira-test-scene.ts`), the equivalent sandbox for Sahira's Jackal Strike, Hippopotamus Healing and Shield (self-targeted, with the real use limits), jump, and dodges. Pressing D opens `escena_dexios_prueba` (`src/dexios-test-scene.ts`) for Dexios' three attacks with mana/chaos costs, chaos gained from damage, jump, and dodges. Pressing F opens `escena_furai_prueba` (`src/furai-test-scene.ts`) for Furai's Tiger Spear, Tiger Fang (spirit cost), Armor Break, spirit gain, jump, and dodges.

# LA DEXÃADA â€” CHARACTER SPRITE NORMALIZATION AND UI FIXES

## IMPORTANT INSTRUCTIONS

The current Phaser combat prototype is functional. All existing gameplay mechanics must remain unchanged.

Your task is to correct the visual issues affecting character proportions, sprite consistency, battlefield positioning, and text readability.

**Do not rebuild the game from scratch.**

Do not modify:
- Combat mechanics or damage calculations.
- Character abilities or resource costs.
- Boss behavior or attack probabilities.
- Turn order.
- Defensive timing windows.
- Music or sound effects.
- Existing gameplay functionality.

Work only on the visual corrections described below.

Before modifying files, inspect the current sprite loading, scaling, positioning, rendering, and UI systems.

Make a backup or use version control so the original assets and implementation can be restored if necessary.

---

# 1. NORMALIZE CHARACTER SPRITES TO 1536 Ã— 1536

The current game suffers from inconsistent character scaling because the supplied sprites have different canvas dimensions, transparent margins, and visible character bounds.

Normalize the major combat character frames using a consistent transparent canvas measuring:

**1536 Ã— 1536 pixels**

This applies to:
- Dexios
- Furai
- Sahira
- Hazel  â€” Ignis and Glacio
- Iobrontes
- Kosmelys

## 1.1. Image Processing

For each character sprite:

1. Load the original PNG.
2. Detect its visible nontransparent content.
3. Determine the appropriate character bounds.
4. Scale the visible character proportionally to a consistent reference size for that character.
5. Preserve the original aspect ratio.
6. Position the artwork inside a transparent 1536 Ã— 1536 canvas.
7. Maintain consistent alignment between frames belonging to the same character.
8. Export the normalized sprite as a new PNG.

Do not stretch, deform, crop, or distort the original artwork.

Do not automatically enlarge every character to fill the entire canvas.

## 1.2. Preserve Original Assets

Do not overwrite or delete the original PNG files.

Store normalized sprites in separate directories, such as:

`assets/normalized/dexios/`

`assets/normalized/furai/`

`assets/normalized/sahira/`

`assets/normalized/hazel/`

`assets/normalized/iobrontes/`

`assets/normalized/kosmelys/`

Preserve the existing filenames so they can be associated with the correct animation states.

Update the asset manifest to reference normalized sprites.

Do not change unrelated assets, such as projectile effects, attack illustrations, UI icons, backgrounds, or music.

## 1.3. Consistent Character Scaling

Every frame belonging to the same character must maintain a consistent apparent anatomical size.

For example, Hazel must not become larger or smaller when switching between:

- Ignis idle.
- Glacio idle.
- Directional defenses.
- Attacks.
- Transformations.
- Damaged frames.
- Jump frames.

Use the standing idle sprite as the primary reference for each character's body proportions.

For extended poses, attacks, and jumps, preserve their intended movement and silhouette rather than forcing their visible bounds to match the idle frame.

If a pose requires more space, adjust its internal offset without changing the character's anatomical scale.

## 1.4. Ground Alignment

For standing animations, align the character's feet to a consistent internal baseline.

Use a configurable reference such as:

`groundBaselineY = 1320`

within the 1536 Ã— 1536 canvas.

This value is a starting reference and may be adjusted.

Jumping animations must preserve their intended vertical displacement relative to the character's normal ground position.

Do not artificially place the feet of a jumping character on the ground.

The character's game-world ground anchor must remain stable during animation changes.

## 1.5. Phaser Scaling

After normalization:

- Use one primary scale configuration per character.
- Preserve a consistent ground origin.
- Use configurable frame-specific offsets only when necessary.
- Do not automatically assume that all 1536 Ã— 1536 images must have the same displayed size.
- Do not apply a second alpha-bounds normalization that reverses the normalization performed on the images.

All normalizing and scaling operations must be deterministic and reproducible.

Avoid expensive image processing during gameplay. Prepare normalized sprites as assets before runtime.

---

# 2. CORRECT THE BATTLEFIELD FORMATION

The current battlefield contains an important positioning issue:

**Hazel Lancaster overlaps Sahira.**

This must be corrected.

## 2.1. Authoritative Reference

Use the existing file:

`boceto_combate.jpeg`

as the primary reference for character positions, relative sizes, camera perspective, and battlefield composition.

Inspect this image before changing any positions.

The current game must follow the reference rather than inventing a new formation.

If the reference cannot be found, report that instead of guessing.

## 2.2. Hazel and Sahira

Hazel and Sahira must have separate, clearly readable silhouettes.

Correct:

- Horizontal position.
- Vertical position.
- Ground anchoring.
- Character scale.
- Sprite draw depth.
- Associated character name labels.

Hazel must not visually cover Sahira's body or make her difficult to distinguish.

Preserve the overall party formation and perspective established by `boceto_combate.jpeg`.

## 2.3. Perspective

The game must preserve its foreground/background depth.

Characters closer to the camera may appear larger.

Characters farther away may appear smaller.

However, this scaling must be consistent with the supplied composition reference.

Do not make characters unnaturally large or small simply to compensate for transparent PNG margins.

## 2.4. Camera

Preserve the current cinematic camera system.

Do not change its gameplay behavior.

Ensure the corrected character positions remain visually appropriate during:

- Normal battlefield view.
- Ability selection.
- Enemy targeting.
- Defensive sequences.
- Attack animations.

Character name labels must not overlap one another.

---

# 3. FIX HAZEL'S ELEMENTAL ANIMATION BUG

Hazel currently displays an Ignis sprite for a fraction of a second when performing a defensive action in Glacio mode.

This must be corrected.

Her current elemental form must determine the sprite used from the very first frame.

## 3.1. Required Behavior

When Hazel is in Glacio mode, all defensive, jumping, damaged, and idle states must use Glacio sprites.

When Hazel is in Ignis mode, those states must use Ignis sprites.

The game must never temporarily display the opposite form.

## 3.2. Technical Correction

Inspect the animation state machine and eliminate any hard-coded fallback to Ignis.

Use Hazel's current elemental mode as the authoritative state.

Ensure that:

- The correct frame is selected before the animation becomes visible.
- Previous animation callbacks cannot restore an outdated elemental sprite.
- Returning to idle always uses the current form.
- Jumping and taking damage do not reset the elemental mode.
- The transformation updates the animation state and HUD consistently.

Preserve Hazel's existing defensive rules and elemental abilities.

---

# 4. FIX NUMERICAL TEXT RENDERING

The current interface displays many numeric values using glyphs that resemble Roman numerals or decorative symbols.

This makes the gameplay information difficult to understand.

All game values must be displayed using standard readable digits:

**0 1 2 3 4 5 6 7 8 9**

## 4.1. Font Policy

Continue using the supplied font:

`Archeologicaps.ttf`

for decorative and thematic text, including:

- Character names.
- Boss names.
- Titles.
- Attack names.
- Turn announcements.
- Status labels.
- Main menu headings.

However, use a clear, readable interface font for numerical values and very small text.

This applies to:

- Health numbers.
- Mana numbers.
- Chaos numbers.
- Spirit numbers.
- Damage numbers.
- Ability costs.
- Boss Health values.
- Small ability descriptions.

Do not use Roman numeral conversion or substitute decorative glyphs for numeric values.

If the font itself contains stylized numeral glyphs, use a different font for numeric data.

## 4.2. Layout

After applying the fonts:

- Adjust text sizes.
- Correct letter spacing.
- Remove clipping.
- Align values inside their corresponding panels.
- Avoid overlapping text.
- Ensure values remain readable during camera movement.

Dynamic numbers must continue updating normally.

---

# 5. ADDITIONAL HUD CORRECTIONS

## 5.1. Furai

The name of Furai's resource must be displayed exactly as:

**ESPÃRITU**

Remove longer variations such as "EnergÃ­a espiritual".

Preserve the existing resource values and mechanics.

## 5.2. Hazel

Hazel's elemental status indicator must be:

- Larger.
- Horizontally centered.
- Easy to read.
- Clearly separated from her Health bar.

Display:

**IGNIS** in orange.

**GLACIO** in light blue.

The indicator and character portrait must update immediately after transformation.

Hazel must not have a Mana bar.

## 5.3. Sahira's Ally Selection Menu

When Sahira uses Hippopotamus Healing or Hippopotamus Shield, the ally selection panel must show:

1. Furai
2. Dexios
3. Sahira
4. Hazel Lancaster

Arrange all four options vertically.

Ensure every option fits completely inside the panel.

The fourth option must not overflow its container.

Use consistent spacing, widths, heights, and typography.

Preserve keyboard and mouse selection.

## 5.4. Boss Health Bars

Iobrontes's and Kosmelys's Health bars must remain visible during all player actions, including:

- Ability selection.
- Target selection.
- Offensive timing.
- Attack animations.
- Damage resolution.
- Multi-hit sequences.
- Elemental transformations.

Keep both Health bars in a persistent screen-space HUD layer.

Do not hide them during cinematic attacks or camera transitions.

They must update after each damage event.

---

# 6. HAZEL AND ARMOR BREAK

Hazel's offensive abilities must correctly consume Furai's Armor Break mark when damaging the marked boss.

Apply the existing first-hit-only rule to multi-hit attacks.

Expected damage:

| Ability | Normal | Armor Break |
|---|---|---|
| Flame Dance | 30 per enemy | 60 to marked enemy |
| Figure Shards | 60 | 120 |
| Glacio Shift | 10 | 20 |
| Ignis Shift | 5 per enemy | 10 to marked enemy |

For area attacks, the damage multiplier applies only to the marked boss.

The mark must only disappear when an eligible damaging ability successfully applies its amplified damage.

If an attack fails its offensive timing or is redirected without damaging the marked boss, the mark remains active.

Do not change the existing Armor Break balance or duration.

---

# 7. PERFORMANCE AND WORKFLOW REQUIREMENTS

The previous large correction task caused prolonged execution and build problems.

Avoid repeating this issue.

Follow a controlled workflow:

1. Inspect the affected files and existing architecture.
2. Record the current working state using version control or a backup.
3. Normalize the character sprites as a separate preparation stage.
4. Verify the normalized assets visually before using them.
5. Update character scaling and positioning.
6. Fix text rendering and HUD layouts.
7. Fix Hazel's animation and Armor Break integration.
8. Run one build after each completed stage.
9. Stop if a build fails and identify the exact error before continuing.

Do not repeatedly rerun the same failing build without making a relevant correction.

Do not modify unrelated systems.

Do not generate new character artwork.

Preserve the original visual designs supplied by the user.

If sprite normalization creates excessive memory usage or rendering problems, do not force all normalized images to load at once. Report the issue and use a more efficient asset-loading approach while preserving the visual requirements.

---

# 8. FINAL VALIDATION

Verify all of the following:

1. All character frames use consistent 1536 Ã— 1536 transparent canvases where applicable.
2. Original assets are preserved.
3. Normalized sprites are loaded correctly by Phaser.
4. Character proportions are stable across animations.
5. No character visually jumps in position due to inconsistent sprite margins.
6. Hazel and Sahira no longer overlap.
7. Battlefield positions follow `boceto_combate.jpeg`.
8. Hazel uses the correct Glacio or Ignis defensive sprite immediately.
9. Health, Mana, Chaos, Spirit, damage, and cost numbers are readable.
10. Archeologicaps remains applied to decorative text.
11. Furai's resource label reads ESPÃRITU.
12. Hazel's elemental status is larger and centered.
13. Sahira's ally selection menu contains four correctly arranged options.
14. Both boss Health bars remain visible during player attacks.
15. Hazel can consume Armor Break correctly.
16. All existing gameplay mechanics remain functional.
17. The existing turn order remains unchanged.
18. The game runs successfully in the browser.
19. The production build succeeds without errors.

---

# 9. UPDATE DESIGN.md

Update the existing `DESIGN.md` to describe:

- The new sprite normalization standard.
- Character ground anchoring.
- Visible-bounds-based scaling.
- Battlefield positions based on `boceto_combate.jpeg`.
- Hazel's corrected animation behavior.
- The revised typography policy.
- The corrected HUD layouts.
- Persistent boss Health bars.
- Hazel's Armor Break compatibility.

Integrate these corrections into the corresponding existing sections.

Do not append another duplicated specification at the end of the document.

---

# FINAL REQUIREMENT

The existing game is playable.

**Your goal is to improve its visual consistency and usability without breaking its combat systems.**

Preserve the game's existing functionality.

After each completed stage, report what was changed and whether the build succeeded.

If a stage cannot be completed safely, stop and explain the blocker instead of continuing with potentially destructive modifications.

# LA DEXÃADA â€” OFFENSIVE ACTION COMMAND SYSTEM
## Implementation Specification â€” Timing Minigames and Cinematic Attack Introductions

### CRITICAL INSTRUCTIONS

The current Phaser combat prototype is functional. This update introduces character-specific offensive and support action commands, inspired by the interactive timing mechanics of turn-based RPGs.

Heir Mode is implemented for Iobrontes and Kosmelys. Preserve its phase transitions, full-Health restoration, damage scaling, sprite and icon changes, and permanent-defeat rules as documented in sections 9.6 and 17.

**DO NOT REBUILD THE GAME FROM SCRATCH.**

Preserve all currently functional systems, including:

- Four playable characters: Dexios, Furai, Sahira, and Hazel.
- Both existing bosses and their current Health values.
- The fixed turn order.
- Boss attacks and probabilities.
- Directional defense and perfect-parry mechanics.
- Character statistics and resource costs.
- Armor Break and Hippopotamus Shield.
- Hazel's Ignis/Glacio transformations.
- Victory and defeat conditions.
- Existing character positions and sprite scaling.
- Music, sounds, HUD, and camera behavior.

Preserve the offensive action-command system alongside the implemented Heir Mode behavior and its interactions with existing damage and support systems.

The rules below supersede any previous generic offensive timing implementation.

---

# 1. CINEMATIC ABILITY INTRODUCTION

Every playable-character ability must begin with a cinematic presentation.

## 1.1. Presentation Strip

A horizontal black strip with decorative golden borders enters the screen from the left.

It must have a fast, visually appealing sliding animation that conveys speed.

### Dimensions

Target game resolution: 1920 Ã— 1080.

The strip must:

- Span the entire horizontal width of the game screen.
- Be centered vertically.
- Occupy 40% of the screen height.
- Extend 20% above and 20% below the screen's vertical center.

At 1920 Ã— 1080, the visible strip is approximately 432 pixels tall.

Its vertical bounds are approximately Y = 324 to Y = 756.

The dimensions must scale proportionally with the game's actual viewport.

### Animation Sequence

1. The player confirms an ability and any required target.
2. The strip slides rapidly into view from the left.
3. The corresponding attack illustration appears inside the strip.
4. The strip remains fully visible for exactly 1 second.
5. The strip exits rapidly to the right using a matching speed effect.
6. The normal battlefield becomes fully visible.
7. The ability-specific action command begins.
8. The player performs the action command, if one is required.
9. The ability animation, projectile, effect, and damage resolution begin after the action-command result is determined.

The one-second hold starts only after the strip has finished entering.

The attack must not execute during the introduction.

## 1.2. Attack Illustration

Each ability uses its own supplied cinematic illustration.

Scale the illustration proportionally so its visible height fits the approximately 40%-screen-height strip.

Preserve its aspect ratio.

Do not stretch, deform, or crop important character details.

The supplied attack illustration is separate from the battlefield animation sprite.

Use the attack illustration in the cinematic strip and preserve the normal action frames for the subsequent attack animation.

## 1.3. Rendering

The strip must appear above the battlefield but must not permanently remove any existing HUD elements.

After it exits:

- Restore the full battlefield.
- Keep character and boss HUD data synchronized.
- Show the action command near the selected target.
- Prevent any lingering black overlays.
- Preserve the cinematic camera system.

Both boss Health bars must remain visible during the actual attack execution and damage resolution.

Do not interrupt the active battle music.

---

# 2. UNIVERSAL ACTION-COMMAND RESULTS

The following rules apply to ordinary damaging abilities unless explicitly overridden by an ability-specific rule.

| Result | Damage Multiplier | Feedback |
|---|---:|---|
| FAIL | 0.50Ã— | FAIL |
| NORMAL | 1.00Ã— | NORMAL |
| PERFECT | 1.20Ã— | GOLPE CRÃTICO |

### Fail

A completely failed action command causes the attack to deal 50% of its established damage.

The attack still executes unless its ability-specific rules explicitly state otherwise.

### Normal

A normally completed action command deals 100% of the original ability damage.

### Perfect

A perfectly completed action command deals 120% of the original ability damage.

Display:

`GOLPE CRÃTICO`

Every time the player achieves an individual Perfect result, play:

`assets/sfx/perfect_block.mp3`

The sound must play once per individual successful Perfect timing event.

Do not accidentally play multiple copies for the same event.

## 2.1. Numerical Calculation

Use the currently configured base damage for each ability.

Examples:

| Base Damage | Fail | Normal | Perfect |
|---|---:|---:|---:|
| 10 | 5 | 10 | 12 |
| 15 | 7.5 | 15 | 18 |
| 20 | 10 | 20 | 24 |
| 30 | 15 | 30 | 36 |
| 60 | 30 | 60 | 72 |
| 70 | 35 | 70 | 84 |

Use the game's existing damage-rounding convention for noninteger results, or define one centralized integer-rounding rule if necessary.

Never let different abilities use inconsistent rounding.

## 2.2. Multi-Hit Attacks

When an ability has multiple independently timed hits:

- Evaluate every hit separately.
- Apply the corresponding multiplier to that hit.
- Allow mixed results within a single attack.
- Apply damage only during attack execution, not during the timing minigame.
- Update the target's Health after each resolved hit.
- Play the Perfect sound for each perfect hit.

For example, Tiger Fang may produce one Normal hit and one Perfect hit.

The damage must reflect those separate outcomes.

## 2.3. Abilities Without a Timing Test

Abilities marked as having no action-command test still display their cinematic introduction if an illustration is provided.

After the introduction, execute the existing ability normally.

Do not apply an automatic Perfect bonus.

These abilities retain their original 100% effect.

---

# 3. DEXIOS â€” ACTION COMMANDS

## 3.1. Triple Lightning

Cinematic illustration:

`dexios_ataque_amarillo`

Action command:

**No timing test.**

After the cinematic introduction, execute Triple Lightning normally.

Preserve:

- Three separate lightning strikes.
- Five base damage per strike.
- Fifteen total base damage.
- Existing lightning effects and sounds.
- Existing Armor Break compatibility.

No offensive timing multiplier applies to this ability.

## 3.2. Electric Arc

Cinematic illustration:

`dexios_ataque_blanco`

Action command:

**Three sequential contracting-circle timing events.**

Each event displays a circular timing indicator around the selected enemy.

The circle contracts toward its target over approximately 1.2 seconds.

Let T represent the timing circle's intended impact moment.

### Timing Windows

| Timing | Result |
|---|---|
| T âˆ’ 1.1 s to T âˆ’ 0.7 s | FAIL |
| T âˆ’ 0.7 s to T âˆ’ 0.3 s | NORMAL |
| T âˆ’ 0.3 s to T + 0.1 s | PERFECT |

Required key:

`W`

### Sequence

1. The first circle appears on the selected boss.
2. The player presses W within a timing window.
3. The first result is recorded.
4. The second circle appears.
5. The player presses W again.
6. The second result is recorded.
7. The third circle appears.
8. The player presses W for the third time.
9. The third result is recorded.
10. After all three timing events, Dexios executes Electric Arc.

Each timing result affects its corresponding lightning strike independently.

### Damage Distribution

The existing Electric Arc has 30 total base damage.

For this implementation, distribute this as three strikes of 10 base damage each.

For example:

- Strike 1: FAIL = 5.
- Strike 2: NORMAL = 10.
- Strike 3: PERFECT = 12.

Total: 27 damage.

Preserve the existing overall resource cost and attack identity.

**Specification clarification:** The source description mentions three timing circles but also says W is pressed twice. For now, implement three W inputs for three circles and clearly report this provisional interpretation. Do not introduce any additional attacks beyond these three.

## 3.3. Chaotic Lightning

Cinematic illustration:

`dexios_ataque_rojo`

Action command:

**Three consecutive randomized directional inputs.**

The required keys are randomly selected from:

`W`, `A`, `S`, `D`

Each input receives its own two-second countdown.

### Sequence

1. Display the first random directional key on the selected enemy.
2. Start a two-second timer.
3. The player presses the matching key.
4. If correct, record the timing result and display the next random key.
5. Repeat until all three keys have been resolved.

The same direction may appear more than once.

### Timing Results

For each key:

- Correct input during the first second: PERFECT.
- Correct input during the second second: NORMAL.
- Failure to complete the input within two seconds: FAIL.

A wrong key also fails the sequence.

### Overall Result

**PERFECT:** All three inputs are completed as Perfect.

**NORMAL:** All three inputs are completed successfully, but at least one is Normal.

**FAIL:** Any required input is failed.

The entire action command must finish before the attack animation executes.

### Special Failure Rule

Chaotic Lightning has a unique failure consequence.

If the action command fails:

- Do not damage either boss.
- Deal 30 damage to every conscious playable character, including Dexios.
- Display a red electrical impact effect on each affected ally.
- Play the existing electrical attack sound.
- Show the failed-action feedback.
- Resolve the resulting incapacitations and resource changes through the existing combat system.

The failure effect represents Dexios losing control of his Chaos energy.

Do not additionally apply the ordinary 50% failed-attack damage to a boss.

Do not accidentally stack the ordinary 20 self-damage of Chaotic Lightning on top of the special 30-damage party failure. The failure replaces that normal self-damage consequence.

On NORMAL or PERFECT, preserve Chaotic Lightning's existing Chaos cost and its normal self-damage rule.

Use the 100% or 120% multiplier for damage against the chosen boss.

Keep existing Armor Break interactions.

---

# 4. FURAI â€” ACTION COMMANDS

## 4.1. Tiger Spear

Cinematic illustration:

`furai_ataque_lanza`

Action command:

**No timing test.**

Execute the attack normally after the cinematic introduction.

Preserve:

- Existing base damage.
- Existing Spirit generation.
- Existing animation and sound.
- Existing Armor Break compatibility.

## 4.2. Tiger Fang

Cinematic illustration:

`furai_ataque_tigre`

Action command:

**Two sequential contracting-circle timing events.**

Use the same timing windows as Electric Arc.

### First Strike

Required key:

`A`

### Second Strike

Required key:

`D`

Each strike has an independent result.

Timing windows:

- FAIL: T âˆ’ 1.1 to T âˆ’ 0.7.
- NORMAL: T âˆ’ 0.7 to T âˆ’ 0.3.
- PERFECT: T âˆ’ 0.3 to T + 0.1.

After both tests, execute the two-hit attack.

Apply each multiplier only to its corresponding hit.

Keep the established two-hit damage values and Spirit cost.

Do not multiply the entire ability twice.

## 4.3. Armor Break

Cinematic illustration:

`furai_ataque_break`

Action command:

**Three-second horizontal circle control.**

### Visual Layout

Display a vertical rectangle centered on the selected enemy.

Rectangle dimensions:

- Width: L.
- Height: 2L.
- Initial L: 100 pixels.

Therefore, the starting dimensions are approximately:

100 Ã— 200 pixels.

Inside the rectangle, place a circle with diameter:

`0.2L`

With L = 100, the circle diameter is 20 pixels.

The circle begins near the center of the rectangle.

It moves horizontally, initially choosing either left or right randomly.

### Controls

`A` changes the circle's movement toward the left.

`D` changes the circle's movement toward the right.

These keys modify its movement direction rather than teleporting the circle.

The challenge is to keep the circle inside the rectangle for three seconds.

### Failure

If any part of the circle crosses the rectangle's horizontal boundary, the challenge fails.

Do not apply Armor Break.

### Success

If the player keeps the circle inside the rectangle for all three seconds, the challenge succeeds.

Apply the existing Armor Break tiger mark to the selected enemy.

This test has only two outcomes:

- SUCCESS: Armor Break applies normally.
- FAIL: Armor Break does not apply.

There is no 120% Perfect version of Armor Break.

### Movement Configuration

The supplied reference specifies a starting movement speed of:

`0.2L per second`

With L = 100, this equals 20 pixels per second.

Make the speed configurable and preserve the requested three-second duration.

Do not silently replace the mechanic with a different minigame.

If the configured speed makes the challenge impossible to fail from its starting position, report this balancing issue and propose a configurable speed adjustment rather than changing the rule without explanation.

---

# 5. SAHIRA â€” ACTION COMMANDS

## 5.1. Jackal Strike

Cinematic illustration:

`sahira_ataque_chacal`

Action command:

**No timing test.**

Execute normally.

Preserve unlimited uses and existing damage.

## 5.2. Hippopotamus Healing

Cinematic illustration:

`sahira_ataque_hipo`

Action command:

**No timing test.**

After the ally is selected and the introduction finishes, execute the healing ability normally.

Preserve:

- Full healing.
- Four uses per battle.
- Existing conscious-target restriction.
- Existing healing animation and sound.

Do not add a timing penalty to healing.

## 5.3. Hippopotamus Shield

Action command:

**Moving circle synchronization.**

No dedicated cinematic illustration is specified for this ability.

Use the standard introduction layout with its ability name and any existing appropriate shield illustration if one is already supplied. Do not invent new artwork.

### Visual Setup

After selecting an ally, display a stationary circle centered on that ally.

Stationary circle radius:

`R = 100 pixels`

A second, moving circle travels from left to right.

Moving circle radius:

`0.5R = 50 pixels`

Starting movement speed:

`0.2R per second`

Required input:

`Space`

### Outcome â€” Perfect

If Space is pressed when the moving circle is fully inside the stationary circle without touching its borders:

- Apply Hippopotamus Shield with 2 charges.
- Display PERFECT.
- Play `perfect_block.mp3`.

### Outcome â€” Normal

If at least 50% of the moving circle is inside the stationary circle, but it intersects or touches the stationary circle's boundary:

- Apply Hippopotamus Shield with 1 charge.
- Display NORMAL.

### Outcome â€” Fail

If Space is pressed when the moving circle is outside the valid overlap area, or the opportunity expires:

- Apply no shield.
- Display FAIL.

The game's existing Hippopotamus Shield effect must support a variable number of charges.

Do not change the defensive behavior of an individual charge.

Keep the shield's existing ability-use limit.

### Important

Use geometric circle overlap when evaluating the input, not only the distance between their centers.

Make the movement speed, starting position, and timeout configurable.

Ensure the minigame has a reachable success window and finishes within a reasonable duration.

Preserve the supplied initial speed as the starting specification; flag any balance issue rather than silently modifying it.

---

# 6. HAZEL LANCASTER â€” ACTION COMMANDS

Hazel's abilities use her current Ignis or Glacio mode.

Do not alter the existing form-switching mechanics.

## 6.1. Flame Dance

Cinematic illustration:

`hazel_fuego_ataque_dance`

Action command:

**Four-key directional sequence.**

Display the following sequence over the selected enemy area:

`W â†’ A â†’ S â†’ D`

The player has two seconds total to complete all four inputs in the correct order.

The countdown begins when the sequence becomes interactive.

### Success

All four inputs are entered correctly before two seconds expire.

Result:

- Execute Flame Dance.
- Deal 100% of its established damage to each living boss.

### Failure

Any incorrect input, or failure to complete all four inputs before the timer expires.

Result:

- Execute the failure animation or feedback.
- Deal 0 damage.

There is no 120% Perfect damage bonus.

This ability has only SUCCESS and FAIL outcomes.

Preserve its existing area-of-effect targeting and elemental effects.

## 6.2. Figure Shards

Cinematic illustration:

`hazel_hielo_ataque_shards`

Action command:

**Rapid S-key pressing.**

Display a counter starting at:

`10`

Show the required key:

`S`

The player must press S ten times within three seconds.

Every valid S press reduces the counter by one.

### Success

The counter reaches zero before the three-second timer expires.

Result:

- Execute Figure Shards.
- Deal 100% of its established damage to the selected living boss.

### Failure

The counter does not reach zero before the timer expires.

Result:

- Deal 0 damage.
- Display FAIL.

There is no 120% Perfect bonus.

Only count genuine keydown presses, not continuous automatic key repetition from holding the key.

Preserve the existing ice-shard animation and effects.

## 6.3. Glacio Shift

Cinematic illustration:

`hazel_ataque_cambio`

Action command:

**No timing test.**

After the cinematic presentation:

1. Execute the transformation animation.
2. Change Hazel from Ignis to Glacio.
3. Launch the existing `hielo_debil` projectile.
4. Deal the established 10 damage to one selected living boss.
5. Update Hazel's HUD, portrait, and idle frame.

Preserve its existing transformation behavior.

## 6.4. Ignis Shift

No separate cinematic illustration or timing test is specified.

Reuse `hazel_ataque_cambio` for the cinematic introduction if that is the existing shared transformation illustration.

Do not create new artwork.

Action command:

**No timing test.**

After the introduction:

1. Execute the transformation animation.
2. Change Hazel from Glacio to Ignis.
3. Launch the existing `fuego_debil` projectile toward each living boss.
4. Deal the established 5 damage to each target.
5. Update Hazel's HUD, portrait, and idle frame.

Preserve existing area-of-effect and Portal Shield behavior.

---

# 7. ACTION-COMMAND UI

The minigame interface must visually integrate with the current La DexÃ­ada combat presentation.

## 7.1. Positioning

Most action commands appear around the selected target.

The UI must:

- Remain fully visible.
- Avoid covering important character sprites unnecessarily.
- Avoid overlapping boss Health bars.
- Adapt to the current camera position.
- Respect the screen boundaries.
- Maintain correct visual layering.

Use screen-space overlays or suitable camera transformations where necessary.

## 7.2. Input Handling

Use the existing keyboard-input architecture.

The system must prevent one key press from activating multiple actions.

For example, pressing W during Electric Arc must not also trigger a defensive animation.

Each action command must own its input events while active.

Do not allow:

- Duplicate input registration.
- Held-key repeat exploits.
- Simultaneous minigames.
- Actions from inactive characters.
- New ability selection during an unresolved action command.

## 7.3. Timing Synchronization

Timing must use actual elapsed time rather than unreliable frame counts.

The minigames should remain consistent if the game briefly drops frames.

Use the Phaser time or update system consistently.

Keep all timing values configurable.

## 7.4. Visual Feedback

Display a clear result after each action command:

- FAIL
- NORMAL
- PERFECT
- GOLPE CRÃTICO
- SUCCESS, when appropriate

Use the established UI fonts and styling.

Do not change the game's existing typography configuration.

When a Perfect event occurs, play `perfect_block.mp3`.

Avoid overlapping the sound repeatedly for one single event.

---

# 8. INTEGRATION WITH EXISTING COMBAT MECHANICS

## 8.1. Damage Processing

All new offensive results must use the existing centralized damage-processing system.

Preserve:

- Target validation.
- Armor Break multipliers.
- Boss Health limits.
- Defensive boss effects.
- Portal Shield redirection.
- Chaos generation.
- Victory and defeat checks.
- Damage numbers and hit effects.

Do not create a separate damage system for action commands.

The action command determines the result multiplier or success state.

The existing combat system applies the final effects.

## 8.2. Armor Break

Armor Break continues to double the first eligible hit against the marked boss.

The timing multiplier must affect only the corresponding successful hit.

For example:

If Tiger Fang hits a boss carrying Armor Break, only its first strike receives Armor Break's doubling effect.

Its two timing results are applied independently.

A failed hit that still causes 50% damage remains an eligible damaging hit.

An attack that causes zero damage must not consume Armor Break.

Preserve boss-specific Armor Break behavior for area-of-effect abilities.

## 8.3. Resource Costs

Do not change the existing resource costs, use limits, or resource-generation values.

The system should determine affordability before starting an action.

Once the player confirms an ability, use the existing execution and cost-consumption rules.

A failed offensive action command does not automatically refund the ability's cost.

Chaotic Lightning's special failure must not cause duplicate costs or duplicate self-damage.

For abilities whose failure prevents the effect entirely, preserve the configured use-consumption behavior and prevent duplicate charges.

## 8.4. Portal Shield

The new action-command system must remain compatible with Kosmelys's Portal Shield.

First evaluate the action command.

Then resolve the completed ability through the existing targeting, redirection, and damage pipeline.

Do not redirect the visual timing minigame itself.

Do not allow attacks to damage both the original and redirected target accidentally.

## 8.5. Multi-Hit Ability Execution

A multi-hit ability must collect its required timing results before executing the attack.

Once the tests finish:

1. Play the attack animation.
2. Release its corresponding projectile or effect.
3. Resolve each hit sequentially.
4. Apply the recorded damage modifier for that hit.
5. Update the boss Health bar.
6. Advance to the next hit.
7. Finish the action only after every hit resolves.

The next character's turn must not begin until the entire action is complete.

## 8.6. No Gameplay Changes Outside These Requirements

Do not modify:

- Boss AI.
- Boss attack probabilities.
- Defensive timing windows.
- Enemy projectile behavior.
- Existing boss Health.
- Current victory conditions.
- Character turn positions.
- Character movement or battlefield layout.
- Existing audio sequencing.
- Character sprite normalization.
- Camera zoom configuration.

---

# 9. CONFIGURATION SYSTEM

Create configurable action-command definitions rather than writing independent hard-coded timing systems for every ability.

Suggested command types:

- NONE
- CIRCLE_TIMING
- DIRECTION_SEQUENCE
- HORIZONTAL_CONTROL
- CIRCLE_OVERLAP
- RAPID_PRESS

Each ability configuration should reference:

- Cinematic illustration asset.
- Command type.
- Required keys.
- Duration.
- Timing windows.
- Number of repetitions.
- Result multipliers or success effects.
- Feedback labels.
- Sound-effect references.

The system must support adding new abilities and new command types later without rewriting the existing combat engine.

Avoid unnecessary architectural changes beyond this feature.

---

# 10. SAFE IMPLEMENTATION ORDER

This is a significant update.

Implement it in small, independently testable stages.

### Stage 1 â€” Cinematic Strip

- Implement the reusable black-and-gold presentation strip.
- Add its left-entry and right-exit animations.
- Load and display each available attack illustration.
- Connect it to the existing ability-confirmation flow.
- Verify that no existing abilities break.

Build and test before proceeding.

### Stage 2 â€” Timing Engine

- Implement the configurable action-command controller.
- Add timing windows.
- Add keyboard input isolation.
- Add result evaluation.
- Add the 50% / 100% / 120% damage multipliers.
- Add Perfect feedback and sound.

Build and test before proceeding.

### Stage 3 â€” Dexios

Implement:

- Triple Lightning without a test.
- Electric Arc with sequential W timing.
- Chaotic Lightning with three randomized directional inputs and special failure.

Test each ability independently.

### Stage 4 â€” Furai

Implement:

- Tiger Spear without a test.
- Tiger Fang with A/D timing.
- Armor Break with the horizontal control challenge.

Verify Spirit generation and Armor Break.

### Stage 5 â€” Sahira

Implement:

- Jackal Strike without a test.
- Hippopotamus Healing without a test.
- Hippopotamus Shield with the moving-circle challenge.

Verify the variable number of shield charges and ability-use limits.

### Stage 6 â€” Hazel

Implement:

- Flame Dance directional sequence.
- Figure Shards rapid S pressing.
- Glacio Shift without a test.
- Ignis Shift without a test.

Verify both transformations and all attack targets.

### Stage 7 â€” Integration Testing

Verify the complete combat loop with the new commands.

Do not continue to the next stage when the current stage fails to build or causes a gameplay regression.

---

# 11. ACCEPTANCE TESTS

Verify all of the following:

1. Every playable ability displays its cinematic introduction.
2. The black-and-gold strip occupies 40% of screen height.
3. The strip enters from the left and exits to the right.
4. The corresponding attack illustration is correctly scaled.
5. The strip remains fully visible for one second.
6. Action commands begin after the strip disappears.
7. Damage and support effects execute only after their action command finishes.
8. Ordinary failed attacks deal 50% damage.
9. Normal attacks deal 100% damage.
10. Perfect attacks deal 120% damage.
11. Critical-hit feedback appears correctly.
12. Perfect timing plays `perfect_block.mp3`.
13. Electric Arc evaluates its three timing events independently.
14. Tiger Fang evaluates its two timing events independently.
15. Chaotic Lightning uses three sequential random directional inputs.
16. Chaotic Lightning's failure damages the party for 30 each without damaging a boss.
17. Armor Break's circle-control minigame lasts three seconds.
18. Failed Armor Break does not apply its tiger mark.
19. Hippopotamus Shield awards 0, 1, or 2 charges according to the circle-overlap result.
20. Flame Dance requires W, A, S, D within two seconds.
21. Figure Shards requires ten S presses within three seconds.
22. Hazel's Shift actions still transform her correctly.
23. Abilities without action commands execute normally.
24. Multi-hit damage calculations remain consistent.
25. Armor Break interacts correctly with timing multipliers.
26. Portal Shield still redirects attacks correctly.
27. Character resource costs and use limits remain unchanged.
28. Boss Health bars update correctly after damage.
29. No duplicate input or damage events occur.
30. The fixed turn order remains unchanged.
31. All current enemy attacks remain functional.
32. All existing defensive mechanics remain functional.
33. The game still reaches its normal victory and defeat conditions.
34. The production build succeeds.
35. The browser game remains fully playable.

---

# 12. UPDATE DESIGN.md

Once each stage is implemented and tested, update the relevant sections of `DESIGN.md`.

Document:

- Cinematic attack-introduction rules.
- The 40%-height presentation strip.
- Character-specific action commands.
- Timing windows and required keys.
- Damage multipliers.
- Special failure rules.
- Variable Hippopotamus Shield charges.
- Perfect and critical-hit feedback.
- Integration with Armor Break and Portal Shield.
- New asset references.
- Action-command configuration requirements.

Integrate this information into the existing sections rather than appending contradictory duplicate specifications.

Do not add Heir Mode to the implementation or to this update.

---

# FINAL REQUIREMENTS

The current prototype already works.

**Preserve its functionality while introducing the new offensive action-command system.**

Do not recreate existing systems unnecessarily.

Do not generate missing artwork.

Do not implement Heir Mode.

Work in controlled stages, test each stage, and report the changed files and results.

If a specification is ambiguous or a minigame's parameters produce unintended behavior, report the issue clearly instead of silently changing the requested rules.

---

# IMPLEMENTATION NOTES â€” ACTION COMMANDS

Implemented in `src/action-commands.ts` (config, runner, multipliers) and wired in `src/combat-scene.ts` (`runCommand`).

- Every player ability shows the black-and-gold strip (40% of screen height, enters from the left, 1 s hold, exits to the right) using `assets/cinematics/*.png`. Hippopotamus Shield reuses `sahira_ataque_hipo`; both Hazel shifts reuse `hazel_ataque_cambio`.
- Results: FAIL x0.5, NORMAL x1, PERFECT x1.2, rounded with `Math.round` (`applyResultMultiplier`). Perfect plays `perfect_block.mp3` once per event and shows "GOLPE CRÃTICO" at impact.
- Electric Arc is now 3 hits x 10 damage (30 total), one W circle per hit. Tiger Fang: A then D circles, one per hit.
- Chaotic Lightning: 3 random WASD keys, 2 s each (Perfect in the first second). Failure: no boss damage, 30 damage to every conscious hero, no self-damage. The existing self-damage is 10 (not 20); it is unchanged on NORMAL/PERFECT.
- Armor Break: 3 s horizontal-control challenge (L=100, speed doubled to 0.4L/s on request); failure applies no mark. At 40 px/s the ball leaves the rectangle after 1 s without input, so it is failable.
- Hippopotamus Shield: Space on the moving circle; geometric overlap gives 2 charges (fully inside), 1 charge (>= 50% overlap) or 0. Speed was doubled to 0.4R/s on request; from offset -150 px the perfect window opens after 2.5 s and the timeout is 15 s (configurable, balance flag).
- Flame Dance: W-A-S-D within 2 s (success = 100%, fail = 0). Figure Shards: 10 S presses in 3 s (success = 100%, fail = 0). Wrong-key input is ignored in circle commands.
- Armor Break and Portal Shield still resolve through the existing damage pipeline; the command is evaluated first and is never redirected.

# LA DEXÍADA — CHARACTER INTRODUCTION SCREENS

## 1. GENERAL REQUIREMENTS

Add a cinematic character introduction panel that appears automatically when the player enters each character's existing tutorial/trial scene.

This applies to:

- Dexios
- Furai
- Sahira
- Hazel Lancaster

The introduction must appear before the tutorial begins.

**IMPORTANT:** Preserve all existing tutorials, combat mechanics, abilities, controls, character positions, animations, and gameplay systems.

Do not rebuild the tutorial scenes.

## 2. INTRODUCTION PANEL DESIGN

### Dimensions and Appearance

Create a centered rectangular panel occupying approximately:

- 80% of the screen width.
- 80% of the screen height.

At 1920 × 1080, the panel should measure approximately 1536 × 864 pixels.

Panel appearance:

- Black background.
- 90% opacity.
- Elegant golden borders.
- Greek-inspired visual styling consistent with La Dexíada.
- Optional subtle entrance and exit fading animations.

The panel must remain above all battlefield elements and tutorial controls while active.

### Layout

Divide the panel into two main sections.

**LEFT SECTION — CHARACTER ILLUSTRATION**

Display the character's corresponding full-body illustration.

- The complete character must be visible.
- Scale proportionally to fit the available panel height, approximately 80% of the game's screen height.
- Preserve the illustration's original aspect ratio.
- Do not stretch, deform, or crop the character.
- Use the actual visible artwork bounds when accounting for transparent margins.
- Center the character horizontally within the illustration section.
- Allow sufficient padding to keep the sprite within the golden borders.

Important: Some reference sprites contain floating character-name labels. These labels must not appear in the introduction screen.

If these names are separate game text objects, hide them while the introduction is visible.

If the labels are embedded in the images, create cleaned copies for the introductions without modifying or overwriting the original source files. Do not alter the character artwork itself.

**RIGHT SECTION — CHARACTER INFORMATION**

Display:

1. Character title.
2. Character subtitle.
3. Character description.

The title and subtitle must use the existing `Archeologicaps` font.

The description must use a readable font with proper lowercase characters, preferably the secondary EB Garamond font if it is already installed.

Keep a consistent layout across all four introductions.

Use sufficient text wrapping, line spacing, internal margins, and vertical spacing.

**Texts must never overlap each other, the character illustration, or the panel borders.**

Do not scale text down excessively to fit. Adjust the text column or spacing when necessary.

## 3. DEXIOS INTRODUCTION

**Sprite:** `dexios.png`

**Text color:** Red.

**Title:** Dexios

**Subtitle:** The unstable Thunderbolt

**Description:**

Dexios is a balanced fighter and potion-maker (not yet in this prototype). He gathers chaotic energy as he receives damage, which he can use to perform Chaotic Lightning, a very powerful attack that also inflicts self-damage.

If he blocks normally, he receives only 5 damage. However, if his timing is perfect, he prevents all incoming damage and deals 5 damage back to the attacker for each successfully parried hit.

### Presentation

- Display Dexios's full-body illustration on the left.
- Display his name prominently in red.
- Display the subtitle directly below his name.
- Place the description below the subtitle.
- Use a bright, readable shade of red with sufficient contrast against the black panel.
- Preserve the original Dexios artwork.

## 4. FURAI INTRODUCTION

**Sprite:** `furai.png`

**Text color:** Purple.

**Title:** Furai

**Subtitle:** The errant Tiger

**Description:**

Furai is a quick fighter. He gathers Spirit by attacking with Tiger Spear and performing counterattacks, allowing him to use his other two abilities. One of these abilities can strengthen his allies' attacks.

If he blocks normally, he receives only 5 damage. However, if his timing is perfect, he prevents all incoming damage. If he perfectly blocks every attack in an enemy's attack sequence, he performs a powerful counterattack dealing 20 damage.

### Presentation

- Display Furai's full-body illustration on the left.
- Use purple for his title and thematic text.
- Keep the description readable against the dark background.
- Preserve the existing character artwork.

## 5. SAHIRA INTRODUCTION

**Sprite:** `sahira.png`

**Text color:** Green.

**Title:** Sahira

**Subtitle:** The desheran Champion

**Description:**

Sahira is a tank fighter. She does not deal much damage, but she has more Health than her allies and possesses abilities that can either heal or protect them.

Her support abilities have a limited number of uses, so choose carefully when to activate them.

As long as she blocks in the correct direction during the defensive window, she prevents all incoming damage.

### Presentation

- Display Sahira's full-body illustration on the left.
- Use green for her title and thematic text.
- Organize her description in readable paragraphs.
- Preserve the existing artwork and visual identity.

## 6. HAZEL LANCASTER INTRODUCTION

Hazel's introduction includes an additional interactive visual feature.

### Sprites

**Ignis form:** `Hazel_fuego.png`

**Glacio form:** `Hazel_hielo.png`

Verify the exact filename capitalization and extensions in the assets directory.

### Title

Hazel

### Subtitle

The elegant striker

### Main Description

**Text color:** Yellow.

Hazel is a highly offensive fighter. She does not have many Health points and must perform Perfect Parries to prevent incoming damage.

She has two elemental forms and can switch between them using a transformation ability.

### Ignis Description

**Text color:** Orange.

**Text:**

Ignis: Her flame ballet form can deal great damage to all enemies.

### Glacio Description

**Text color:** Light blue / Cyan.

**Text:**

Glacio: Her ice figure-skating form can deal huge damage to a single opponent.

### Layout

Display the following on the right side:

1. Hazel — title in Archeologicaps.
2. The elegant striker — subtitle in Archeologicaps.
3. Main description in yellow.
4. Ignis description in orange.
5. Glacio description in light blue.

Keep the descriptions in clearly separated paragraphs.

Do not overlap or combine the colored descriptions.

### Interactive Elemental Illustration

Below Hazel's full-body illustration, add a button that switches the displayed illustration between Ignis and Glacio.

Also allow the player to switch illustrations by pressing:

`H`

Display the H key indicator in gold, following the existing game's visual style for keyboard instructions.

Example button label:

`[H] CAMBIAR FORMA`

### Expected Behavior

Hazel's introduction initially displays her Ignis illustration.

When the player presses H or clicks the button:

- Replace `Hazel_fuego.png` with `Hazel_hielo.png`.
- Preserve the illustration's overall position and display scale.
- Use a subtle transition if desired.

When H is pressed again:

- Replace `Hazel_hielo.png` with `Hazel_fuego.png`.

The player may switch between the two illustrations as many times as desired.

**This is only an illustration-preview feature inside the introduction panel.**

It must not change Hazel's actual battle form, combat state, Health, abilities, HUD, or resources.

The text on the right must remain visible in both illustration modes.

The transformation-preview button must remain inside the golden introduction panel.

## 7. CONTINUE BUTTON AND TUTORIAL TRANSITION

Every character introduction must include a clear Continue button.

Suggested label:

`CONTINUAR`

Place it toward the bottom-right of the introduction panel.

When the player clicks Continue or presses Enter:

1. Close the introduction panel.
2. Restore the normal tutorial interface.
3. Enable the existing tutorial controls.
4. Begin or resume the character's tutorial exactly as currently implemented.

While the introduction panel is open:

- Prevent unintended combat actions.
- Pause or block tutorial inputs.
- Avoid advancing the tutorial automatically.
- Prevent multiple introduction windows from appearing simultaneously.

For Hazel, H must control only the illustration preview while her introduction is open.

Do not allow the H key to trigger unrelated gameplay actions.

## 8. TYPOGRAPHY AND RESPONSIVE LAYOUT

Use Archeologicaps for:

- Character titles.
- Character subtitles.
- Continue button labels.
- The H key indicator.

Use a readable secondary font for longer descriptions.

At the target resolution of 1920 × 1080, recommended initial sizes are:

- Character name: 52–64 px.
- Subtitle: 30–36 px.
- Description: 24–28 px.
- Button label: 26–30 px.

These sizes are adjustable according to actual font metrics.

### Important Layout Requirements

- Use actual text measurement and wrapping.
- Do not position each paragraph at arbitrary fixed coordinates that may cause overlap.
- Use a consistent vertical layout for all information blocks.
- Keep all content inside the introduction panel.
- Prevent text clipping.
- Prevent descriptions from covering the character sprite.
- Ensure Hazel's three colored description sections fit correctly.
- Ensure the Continue button never covers the descriptions.

The four introduction screens must remain visually consistent despite their differing amounts of text.

## 9. TECHNICAL IMPLEMENTATION

Create a reusable character introduction component rather than four completely separate implementations.

Store the content in a configurable object containing:

- Character ID.
- Sprite paths.
- Title.
- Subtitle.
- Description text.
- Text colors.
- Optional secondary descriptions.
- Optional interactive illustration-switching settings.

The component should receive the character ID and display the corresponding information automatically.

Reuse the current game's asset-loading and UI systems.

Do not create duplicate scenes if the existing tutorial architecture can support an opening overlay.

Ensure illustrations are loaded before the panel becomes visible.

Avoid visible sprite flickering or layout shifting.

## 10. ACCEPTANCE TESTING

Verify:

1. Dexios's introduction appears immediately upon entering his tutorial.
2. Furai's introduction appears immediately upon entering his tutorial.
3. Sahira's introduction appears immediately upon entering her tutorial.
4. Hazel's introduction appears immediately upon entering her tutorial.
5. Every panel occupies approximately 80% of the screen width and height.
6. Every panel has a 90%-opaque black background and golden borders.
7. Character illustrations are fully visible and proportionally scaled.
8. Floating reference names do not appear.
9. Titles and subtitles use Archeologicaps.
10. All descriptions use a readable font with lowercase characters.
11. Dexios's text follows the red theme.
12. Furai's text follows the purple theme.
13. Sahira's text follows the green theme.
14. Hazel's main description is yellow.
15. Hazel's Ignis description is orange.
16. Hazel's Glacio description is light blue.
17. Hazel's illustration-switching button works with mouse input.
18. Pressing H switches Hazel's displayed illustration correctly.
19. The H key indicator is displayed in gold.
20. Switching illustrations does not modify Hazel's actual combat form.
21. No text overlaps any other element.
22. Every Continue button opens the existing tutorial correctly.
23. Pressing Enter closes each introduction and opens the existing tutorial.
24. All existing tutorial interactions continue to work.
25. The production build succeeds.

## 11. DESIGN DOCUMENT

Update `DESIGN.md` to document the new character introduction system.

Include the panel appearance, typography, character descriptions, artwork references, and Hazel's interactive illustration preview.

Do not duplicate existing sections unnecessarily.

## FINAL REQUIREMENT

Implement only the new tutorial character-introduction panels.

Do not modify gameplay mechanics, combat balancing, action commands, boss attacks, or character progression.

Preserve the game's current functional state.

# LA DEXÍADA — HEIR MODE IMPLEMENTATION

## Complete Implementation Specification — Iobrontes and Kosmelys

### 1. CRITICAL INSTRUCTIONS

The current La Dexíada Phaser combat prototype is fully functional.

Implement a second combat phase called **HEIR MODE** for Iobrontes and Kosmelys.

This update introduces:

- Automatic transformation upon the first HP depletion.
- Full HP restoration.
- Double outgoing damage.
- Expanded attack sequences.
- New Heir Mode character sprites.
- New Heir Mode character icons.
- Permanent defeat upon the second HP depletion.

Preserve all existing gameplay systems that are not explicitly modified below.

Do not rebuild the game from scratch.

Do not change playable-character abilities, offensive action commands, defensive timing windows, resources, status effects, audio, arena composition, or the fixed turn order except where necessary to support the new boss phases.

All new values must be configurable.

**The supplied sprite filenames are final. Use them exactly as specified, including the distinction between `heredero` and `heredera`.**

---

# 2. BOSS PHASE SYSTEM

Each boss must have its own independent phase state:

- NORMAL
- HEIR
- DEFEATED

Both bosses begin in NORMAL state.

## 2.1. First HP Depletion

When a NORMAL boss reaches 0 HP:

1. Do not permanently defeat that boss.
2. Finish resolving the current player ability safely.
3. Temporarily suspend turn advancement.
4. Trigger the boss's Heir Mode transformation.
5. Restore its HP to its full original maximum.
6. Switch its visual assets to the Heir set.
7. Switch its HUD and turn-order icons.
8. Activate the Heir Mode damage multiplier.
9. Activate the expanded Heir attack sequences.
10. Resume combat without granting an additional turn.

A boss can transform only once per battle.

## 2.2. Second HP Depletion

When a boss already in HEIR state reaches 0 HP:

- Mark it as permanently DEFEATED.
- Prevent it from performing future attacks.
- Skip its future turns.
- Remove it from valid enemy target selection.
- Preserve the surviving boss's independent combat behavior.

Victory occurs only when both bosses are permanently DEFEATED.

## 2.3. Independent Transformations

The two bosses must transform independently.

One boss may remain NORMAL while the other is in HEIR.

Both may enter HEIR during the same encounter.

Defeating one boss permanently must not interrupt the other boss's phase or scheduled turns.

---

# 3. IOBRONTES — HEIR MODE ASSETS

Normal maximum Health: **550 HP**.

On first depletion, restore to **550 / 550 HP**.

Use the following exact Heir asset names:

| State | Asset |
|---|---|
| Idle | `iobrontes_heredero_base` |
| Attack right | `iobrontes_heredero_derecha` |
| Attack left | `iobrontes_heredero_izquierda` |
| Attack up | `iobrontes_heredero_arriba` |
| Attack down | `iobrontes_heredero_abajo` |
| Taking damage | `iobrontes_heredero_herido` |
| Divine Retribution armor | `iobrontes_heredero_armadura` |
| Watch the Thunder | `iobrontes_heredero_wtt` |
| Portrait / turn-order icon | `iobrontes_heredero_icono` |

Additional supplied asset:

`iobrontes_heredero_ultimate`

**Do not use `iobrontes_heredero_ultimate` in any gameplay action.**

It is reserved for an ability that has not yet been designed.

Do not implement or invent that ability.

## 3.1. Sprite Switching

Once Iobrontes transforms, all animations must use Heir sprites.

Examples:

- Lightning Chain upward attack uses `iobrontes_heredero_arriba`.
- Lightning Chain downward attack uses `iobrontes_heredero_abajo`.
- Divine Retribution uses `iobrontes_heredero_armadura`.
- Watch the Thunder uses `iobrontes_heredero_wtt`.
- Damage reactions use `iobrontes_heredero_herido`.
- Returning to idle uses `iobrontes_heredero_base`.

Do not briefly display normal-form frames after transformation.

Preserve Iobrontes's position, sprite scaling, grounding, and battlefield depth.

---

# 4. IOBRONTES — HEIR MODE ABILITIES

His existing three abilities remain unchanged in their general behavior and selection probabilities.

However, their damage and attack counts change in HEIR state.

## 4.1. Lightning Chain

### NORMAL State

Preserve the existing behavior:

- 3 lightning strikes.
- 10 base damage per strike.
- One selected conscious ally per entire chain.
- Independent random attack direction for each strike.

### HEIR State

Modify the attack to:

**5 lightning strikes, each dealing 20 base damage.**

All five strikes must target the same randomly selected conscious ally.

Each strike independently selects a direction from:

- W — Up
- A — Left
- S — Down
- D — Right

The same direction may appear multiple times.

### Heir Attack Sequence

1. Select one conscious party member.
2. Announce Lightning Chain using the current attack announcement system.
3. Prepare the first lightning strike.
4. Display the corresponding Heir directional sprite.
5. Launch the strike.
6. Allow the player to defend.
7. Resolve the defensive result.
8. Repeat for strikes 2, 3, 4, and 5.
9. Trigger any eligible defensive counterattack.
10. Finish the action and advance the turn.

All five strikes must be sequential.

Do not launch multiple strikes simultaneously.

### Defensive Mechanics

Preserve the existing defensive timing windows.

Do not make the lightning attacks faster or slower merely because the boss is in Heir Mode.

Apply the doubled base damage through the combat damage system.

For characters with normal/imperfect damage reduction, scale their resulting damage consistently with the Heir multiplier.

Sahira still prevents all damage with a valid directional block.

Hazel still requires a Perfect Parry to avoid damage.

Dexios retains his 5-damage automatic counterattack per Perfect Parry.

### Furai's Tiger Parry

Furai must perfectly parry all **five** lightning strikes in a Heir Lightning Chain to trigger his 20-damage Tiger Parry.

In NORMAL state, the requirement remains three Perfect Parries.

The number of required perfect defenses must be calculated from the actual number of strikes in the current enemy action, not hard-coded to three.

---

## 4.2. Watch the Thunder

### NORMAL State

Preserve:

- One sweeping lightning attack.
- 50 damage per character who fails to jump.
- One team-wide Space-jump opportunity.

### HEIR State

Watch the Thunder now consists of:

**Two consecutive lightning sweeps.**

Each sweep deals:

**100 base damage per affected character.**

### Required Sequence

1. Iobrontes prepares Watch the Thunder.
2. Display `iobrontes_heredero_wtt`.
3. Launch the first sweep.
4. Open the existing team-jump timing window.
5. Resolve the first sweep.
6. Begin the second sweep.
7. Open a new, independent team-jump timing window.
8. Resolve the second sweep.
9. Finish the enemy action.

The player must press Space separately for each sweep.

A successful jump on the first sweep does not automatically avoid the second.

The second sweep must have its own independent timing opportunity.

Each successful jump prevents all damage from that sweep.

Each failed jump causes the corresponding 100 damage, subject to existing protective effects.

Do not modify the existing 0.6-second casting and 0.3-second jump-window durations unless a new setting is explicitly required to coordinate the second sweep.

Keep the camera in the appropriate wide battlefield view.

Do not advance the turn between the two sweeps.

---

## 4.3. Divine Retribution

### NORMAL State

Preserve:

- Electric armor.
- 30 retaliation damage.
- Existing duration of two playable-character turns.
- Existing behavior when the armor is triggered or expires.

### HEIR State

Divine Retribution deals:

**60 retaliation damage.**

Use:

`iobrontes_heredero_armadura`

Preserve the existing armor duration and activation behavior.

Do not double its duration.

The electric armor must still end when an eligible damaging player attack triggers the retaliation or its duration expires.

After it ends, return Iobrontes to:

`iobrontes_heredero_base`

Do not return him to his normal-form sprite.

---

# 5. KOSMELYS — ADD MISSING NORMAL SPRITE

The normal-form Kosmelys sprite set has been updated.

A previously missing asset is now available:

`kosmelys_abajo`

Register and load this asset.

When Kosmelys performs a downward-direction attack in NORMAL state, use:

`kosmelys_abajo`

Do not use an unrelated placeholder or incorrectly oriented sprite.

Preserve all existing Normal Kosmelys sprites and behavior.

---

# 6. KOSMELYS — HEIR MODE ASSETS

Normal maximum Health: **450 HP**.

On first depletion, restore to **450 / 450 HP**.

**Important naming difference: Kosmelys uses `heredera`, not `heredero`.**

Use the following exact asset names:

| State | Asset |
|---|---|
| Idle | `kosmelys_heredera_base` |
| Attack right | `kosmelys_heredera_derecha` |
| Attack left | `kosmelys_heredera_izquierda` |
| Attack up | `kosmelys_heredera_arriba` |
| Attack down | `kosmelys_heredera_abajo` |
| Taking damage | `kosmelys_heredera_herida` |
| Portal Shield | `kosmelys_heredera_escudo` |
| Meteor Rain | `kosmelys_heredera_mr` |
| Portrait / turn-order icon | `kosmelys_heredera_icono` |

Additional supplied asset:

`kosmelys_heredera_ultimate`

**Do not use `kosmelys_heredera_ultimate` in combat.**

No Ultimate ability is currently defined for Kosmelys.

Do not implement one.

## 6.1. Sprite Switching

Once Kosmelys enters Heir Mode, all actions must use her Heir sprites.

Examples:

- Cosmic Rays upward attack uses `kosmelys_heredera_arriba`.
- Cosmic Rays downward attack uses `kosmelys_heredera_abajo`.
- Portal Shield uses `kosmelys_heredera_escudo`.
- Meteor Rain uses `kosmelys_heredera_mr`.
- Damage reactions use `kosmelys_heredera_herida`.
- Returning to idle uses `kosmelys_heredera_base`.

All Heir sprites must retain her existing position, perspective, scale, and grounding.

---

# 7. KOSMELYS — HEIR MODE ABILITIES

Kosmelys retains Cosmic Rays, Portal Shield, and Meteor Rain.

Preserve the existing ability-selection probabilities:

- Cosmic Rays: 50%.
- Portal Shield: 30%.
- Meteor Rain: 20%.

Preserve the existing redistribution behavior when Portal Shield is already active.

## 7.1. Cosmic Rays

### NORMAL State

Preserve:

- 2 cosmic projectiles.
- 15 base damage each.
- Both target the same conscious ally.
- Each projectile changes its attack direction halfway through its travel.
- Each projectile resolves independently.

### HEIR State

Cosmic Rays now launches:

**3 cosmic projectiles dealing 30 base damage each.**

All three projectiles target one randomly selected conscious ally.

That target remains the same throughout the full three-projectile attack.

### Required Sequence

For every projectile:

1. Select its initial direction randomly.
2. Display the corresponding Heir directional sprite.
3. Launch the cosmic projectile.
4. At the midpoint of travel, select a different final direction.
5. Replace the projectile's visual origin and effect according to the new direction.
6. Update Kosmelys's directional sprite.
7. Preserve the remaining projectile travel time.
8. Allow the player to defend according to the final direction.
9. Resolve the defensive result.

Repeat sequentially for three projectiles.

Preserve the existing `cosmico` visual effect and `ataque_cosmico.mp3` sound behavior.

The sound must play at the appropriate projectile launch and direction-change events.

Do not accidentally apply damage twice when a projectile changes direction.

### Defensive Mechanics

Preserve all existing character-specific defensive rules.

- Dexios can counterattack for 5 damage per Perfect Parry.
- Sahira avoids damage with a correct directional block.
- Hazel avoids damage only with a Perfect Parry.

Furai's Tiger Parry condition must adapt to the expanded sequence.

In NORMAL state, Furai must perfectly parry both Cosmic Rays projectiles to perform his 20-damage counterattack.

In HEIR state, he must perfectly parry **all three** projectiles.

Do not change Tiger Parry's damage.

---

## 7.2. Portal Shield

Portal Shield retains its existing functionality.

In Heir Mode:

- Use `kosmelys_heredera_escudo`.
- Preserve its existing duration.
- Preserve its existing target-redirection rules.
- Preserve its existing sound effects.
- Preserve its existing interaction with Armor Break and offensive action commands.

**Portal Shield does not double reflected or redirected player damage.**

The Heir damage multiplier applies to Kosmelys's own damaging attacks, not to player-origin attacks redirected through Portal Shield.

After Portal Shield expires, restore:

`kosmelys_heredera_base`

---

## 7.3. Meteor Rain

### NORMAL State

Preserve:

- 5 meteors.
- 20 base damage per meteor.
- Sequential meteor resolution.
- A new randomly selected conscious target for each meteor.
- Upward defense using W.
- Existing defensive timing windows.

### HEIR State

Meteor Rain now launches:

**8 meteors, each dealing 40 base damage.**

Each meteor independently selects a random conscious party member.

Every meteor comes from above and requires:

`W`

### Required Sequence

1. Kosmelys begins Meteor Rain.
2. Display `kosmelys_heredera_mr`.
3. Select the first conscious target.
4. Launch the first meteor.
5. Open the appropriate defensive timing window.
6. Resolve its damage or defensive result.
7. Select the next conscious target.
8. Launch the next meteor.
9. Repeat until all eight meteors have resolved.
10. Finish the enemy action.

Meteor attacks must remain strictly sequential.

Do not allow:

- Multiple unresolved meteors simultaneously.
- Overlapping defensive windows.
- Multiple simultaneous targeting indicators.
- Damage from an already-resolved meteor being applied again.

Preserve the established first-meteor timing and subsequent-meteor travel timings.

### Defensive Mechanics

Preserve the existing per-character mechanics:

- Dexios deals 5 counterdamage per Perfect Parry.
- Sahira blocks all damage with a correct W input.
- Hazel requires a Perfect Parry.
- Furai can trigger Tiger Parry if every meteor assigned to him during the current Meteor Rain action is perfectly parried, provided at least one meteor targeted him.

The Furai condition must work with eight meteors instead of five.

Do not change Tiger Parry's 20-damage counterattack.

Preserve all existing Meteor Rain sounds and effects.

---

# 8. DAMAGE MULTIPLIER RULES

Both bosses have a permanent outgoing damage multiplier determined by their current phase.

NORMAL:

`damageMultiplier = 1`

HEIR:

`damageMultiplier = 2`

This modifier applies to boss-origin damaging attacks and retaliation damage.

It must not double:

- Player-origin attacks.
- Player automatic counterattacks.
- Healing.
- Player resource gains.
- Armor Break multipliers.
- Redirected player attacks from Portal Shield.

### Character Defense

All four playable characters retain their existing defensive properties.

Ensure doubled damage is correctly processed through the existing defense system.

Normal/imperfect blocks must preserve their relative damage-reduction behavior.

Perfect defenses continue preventing damage entirely.

Sahira continues preventing all damage with valid directional blocks.

Hazel continues receiving full damage unless she performs a Perfect Parry.

Hippopotamus Shield retains its existing protective behavior.

Do not alter enemy attack timing windows simply because damage is doubled.

---

# 9. MULTI-HIT TRANSFORMATION SAFETY

A major issue can occur if a boss reaches zero HP during a multi-hit attack.

The same player-selected ability must not defeat the Normal phase and then immediately damage the newly restored Heir phase.

### Required Behavior

When a NORMAL boss reaches zero HP during a player action:

1. Set its Health to zero.
2. Mark its Heir transformation as pending.
3. Prevent any remaining hits of that same ability from damaging that boss.
4. Allow the ability to finish its remaining visual sequence safely.
5. Continue processing any other valid targets when appropriate.
6. After the ability finishes, begin the transformation.
7. Restore the boss to full HP.
8. Continue the battle.

For area-of-effect attacks, independently evaluate each boss.

If both bosses reach zero Normal HP during the same ability, queue both transformations and resolve them without duplicating turns or entering victory.

Do not trigger normal-defeat victory logic while either boss has a pending Heir transformation.

---

# 10. HEIR TRANSFORMATION PRESENTATION

Create a short transformation sequence when a boss first reaches zero HP.

The sequence must be clear and visually impactful, but it does not need new cinematic artwork.

Use the supplied Heir sprites.

### Suggested Sequence

1. Finish the player ability.
2. Pause combat progression.
3. Focus the camera on the transforming boss.
4. Display a brief purple magical flash or transformation effect.
5. Show the announcement:

   `MODO HEREDERO`

6. Replace the boss's Normal base sprite with its Heir base sprite.
7. Replace its Normal icon with the Heir icon.
8. Refill its HP bar.
9. Return the camera to the appropriate battle composition.
10. Resume the turn sequence.

The presentation must not allow the player to perform actions while it is active.

Do not create additional boss attacks during transformation.

Do not use either Ultimate sprite.

---

# 11. HUD AND ICON UPDATES

The Heir Mode transformation must update every relevant visual reference.

### Iobrontes

Normal icon:

`iobrontes_icono`

Heir icon:

`iobrontes_heredero_icono`

### Kosmelys

Normal icon:

`kosmelys_icono`

Heir icon:

`kosmelys_heredera_icono`

Update:

- Turn-order preview.
- Boss HUD portrait, if displayed.
- Target-selection portrait, if displayed.
- Any other existing interface using the boss icon.

The current boss phase must be the source of truth for selecting these icons.

Do not leave cached Normal icons after transformation.

### Health Bars

When entering Heir Mode:

- Iobrontes refills to 550 / 550.
- Kosmelys refills to 450 / 450.

Both boss Health bars must remain visible during attacks.

Preserve the current HUD layout and colors.

Optionally display a small HEIR label to distinguish the second phase, without rearranging the HUD.

---

# 12. STATUS EFFECTS AND TURN ORDER

## 12.1. Existing Effects

When a boss transforms, clear any pending temporary Normal-phase defensive state:

- Iobrontes's active Divine Retribution armor.
- Kosmelys's active Portal Shield.

Also clear any active Armor Break mark on the transforming boss.

These effects must not accidentally persist into the new Heir phase.

The boss may activate its own defensive abilities again normally after transformation.

## 12.2. Turn Order

Preserve the current fixed turn sequence.

Do not add new turns.

Do not reset the turn order when a boss transforms.

Do not change the order or frequency of playable-character turns.

When a boss is permanently defeated, skip its remaining scheduled turns according to the existing rules.

---

# 13. CONFIGURATION REQUIREMENTS

Do not hard-code individual Heir values throughout the combat scene.

Define phase-specific boss configurations.

Suggested values:

### Iobrontes

NORMAL:
- Max HP: 550
- Damage multiplier: 1
- Lightning Chain: 3 strikes
- Watch the Thunder: 1 sweep
- Divine Retribution: 30 retaliation

HEIR:
- Max HP: 550
- Damage multiplier: 2
- Lightning Chain: 5 strikes
- Watch the Thunder: 2 sweeps
- Divine Retribution: 60 retaliation

### Kosmelys

NORMAL:
- Max HP: 450
- Damage multiplier: 1
- Cosmic Rays: 2 projectiles
- Meteor Rain: 5 meteors
- Portal Shield: unchanged

HEIR:
- Max HP: 450
- Damage multiplier: 2
- Cosmic Rays: 3 projectiles
- Meteor Rain: 8 meteors
- Portal Shield: unchanged

Avoid applying the damage multiplier twice to values already expressed as Heir damage.

For example, 20 damage for a Heir Lightning Chain bolt is the final base incoming damage before the defending character's protection calculations, not an additional value to multiply by two again.

---

# 14. ASSET LOADING

Load the existing Normal asset sets and the new Heir asset sets using the project's asset management system.

Preserve exact filenames and capitalization.

Do not rename the supplied images.

Do not modify their artwork.

Do not rescale all character sprites globally.

If the Heir sprites have different transparent padding, ensure that their visible sizes and grounding remain consistent with the normal forms.

Use the game's existing sprite-normalization and positioning configuration.

Register `kosmelys_abajo` in the Normal Kosmelys asset set.

The two Ultimate files may be registered as unused future assets if convenient, but must not be displayed or connected to any ability.

---

# 15. IMPLEMENTATION WORKFLOW

Implement in controlled stages.

### Stage 1 — Assets

- Register all Heir sprites.
- Register Heir icons.
- Register `kosmelys_abajo`.
- Confirm asset paths and filename spelling.

### Stage 2 — Boss Phase State

- Add NORMAL, HEIR, and DEFEATED states.
- Implement first-depletion transformation conditions.
- Implement second-depletion permanent defeat.
- Prevent premature victory.

### Stage 3 — Transformation Presentation

- Add transformation announcement.
- Add visual phase transition.
- Restore boss HP.
- Switch sprites and icons.

### Stage 4 — Iobrontes Heir Combat

- Implement five-hit Lightning Chain.
- Implement two-sweep Watch the Thunder.
- Implement 60-damage Divine Retribution.
- Test Furai's expanded Tiger Parry requirement.

### Stage 5 — Kosmelys Heir Combat

- Implement three-hit Cosmic Rays.
- Implement eight-meteor Meteor Rain.
- Preserve Portal Shield behavior.
- Test all character defenses and counters.

### Stage 6 — Integration

- Verify simultaneous and independent transformations.
- Verify fixed turn order.
- Verify permanent defeat and victory.
- Verify HUD updates.
- Verify sprite restoration after attacks.
- Run the production build.

Do not proceed with unrelated changes.

---

# 16. ACCEPTANCE TESTS

Verify:

1. Iobrontes transforms once when his Normal HP first reaches zero.
2. Kosmelys transforms once when her Normal HP first reaches zero.
3. Iobrontes restores to 550 HP.
4. Kosmelys restores to 450 HP.
5. Both bosses use their correct Heir base sprites.
6. All Heir directional sprites load correctly.
7. Heir damage-reaction sprites work.
8. Heir defensive ability sprites work.
9. Boss icons change everywhere required.
10. Normal Kosmelys uses the new `kosmelys_abajo` frame.
11. Normal Lightning Chain still has three strikes.
12. Heir Lightning Chain has five strikes.
13. Heir Lightning Chain deals 20 base damage per strike.
14. Normal Watch the Thunder still has one sweep.
15. Heir Watch the Thunder has two independently defendable sweeps.
16. Each Heir Watch the Thunder sweep deals 100 base damage.
17. Heir Divine Retribution retaliates for 60 damage.
18. Normal Cosmic Rays still has two projectiles.
19. Heir Cosmic Rays has three projectiles.
20. Each Heir Cosmic Rays projectile deals 30 base damage.
21. Normal Meteor Rain still has five meteors.
22. Heir Meteor Rain has eight meteors.
23. Each Heir Meteor Rain meteor deals 40 base damage.
24. Portal Shield does not double redirected damage.
25. Furai's chain-based Tiger Parry adapts to the new attack counts.
26. Sahira's valid blocks still prevent all damage.
27. Hazel still requires Perfect Parries.
28. Dexios still counterattacks for 5 damage per eligible Perfect Parry.
29. The two bosses transform independently.
30. A transformation does not grant an extra turn.
31. A multi-hit ability cannot damage the Normal and Heir phases of the same boss.
32. Armor Break and temporary defensive states clear correctly on transformation.
33. Both Ultimate sprites remain unused.
34. A boss in HEIR becomes permanently defeated on its next HP depletion.
35. Victory occurs only after both bosses are permanently defeated.
36. No existing playable-character abilities are broken.
37. The production build succeeds.
38. The game remains fully playable in the browser.

---

# 17. DESIGN.MD UPDATE

Update the existing `DESIGN.md` to incorporate the implemented Heir Mode behavior.

Document:

- Boss phase state transitions.
- Full HP restoration.
- Damage doubling.
- Expanded Heir attack counts.
- Correct sprite and icon filenames.
- New Normal Kosmelys downward sprite.
- Transformation presentation.
- Phase-specific defensive interactions.
- Permanent defeat conditions.
- Existing Ultimate assets remaining unused.

Integrate these rules into the existing boss and combat sections.

Do not append contradictory duplicate specifications.

---

# FINAL REQUIREMENT

Implement the complete Heir Mode system while preserving the existing functional combat prototype.

Use the supplied final asset names exactly.

Do not implement Ultimate abilities.

Do not redesign or rebuild the existing combat engine.

Report the modified files, any missing assets, build status, and results of the Heir Mode tests.

# LA DEXÍADA — TUTORIAL COMBAT SCENE AND SAHIRA HEALING UPDATE

## CRITICAL INSTRUCTIONS

The current Phaser combat scene is functional, including the existing boss phases, attacks, offensive action commands, defensive mechanics, characters, HUD, music, and animations.

Implement the following changes without rebuilding the existing combat system.

There are three tasks:

1. Increase Sahira's Hippopotamus Healing to four uses per battle.
2. Create a new combat scene called `escena_tutorial`, preserving the complete functionality of the existing combat scene.
3. Update `select-scene` with two symmetrical combat-selection buttons.

Preserve every existing gameplay mechanic unless explicitly modified below.

---

# 1. SAHIRA — HIPPOPOTAMUS HEALING

Increase the maximum number of Hippopotamus Healing uses from 2 to **4 uses per battle**.

### Required Behavior

- Sahira begins every battle with 4 available Hippopotamus Healing charges.
- Each successful healing action consumes one charge.
- The ability becomes unavailable when all four charges have been consumed.
- Healing continues restoring the selected conscious ally to full Health.
- Healing does not revive incapacitated characters.
- The HUD and ability menu must display the correct remaining charges.
- Restarting a battle restores all four charges.

This change must apply to BOTH the original combat scene and `escena_tutorial`.

Do not change Hippopotamus Shield or its existing use limits.

Do not change Sahira's defensive mechanics.

---

# 2. CREATE `escena_tutorial`

Create a new Phaser scene called:

`escena_tutorial`

This must be a fully functional copy of the existing main combat scene.

The original scene must remain available and must continue working exactly as before.

### 2.1. Preserve Existing Functionality

The new scene must include everything currently implemented in the original combat scene:

- Dexios, Furai, Sahira, and Hazel Lancaster.
- Iobrontes and Kosmelys.
- The existing fixed turn order.
- The current character stats and resources.
- All playable-character abilities.
- Offensive action-command minigames.
- Cinematic attack strips.
- Directional defense.
- Normal blocks and Perfect Parries.
- Character-specific counterattacks.
- Armor Break.
- Hippopotamus Healing and Shield.
- Hazel's Ignis and Glacio forms.
- All normal boss attacks.
- Both bosses' Heir Modes.
- Heir Mode transformations and asset switching.
- Expanded Heir Mode attacks.
- Boss status effects and defensive abilities.
- Existing camera movements.
- Current character positions and scaling.
- All sprites and animations.
- All HUD and turn-order elements.
- Existing audio and music.
- Victory and defeat conditions.
- Restart functionality.

**The new scene must play exactly like the original combat scene, except for the two tutorial modifiers described below.**

### 2.2. Architecture

Prefer reusing the existing combat implementation with configurable scene-specific modifiers.

A recommended approach is:

- Original combat scene: standard combat configuration.
- `escena_tutorial`: tutorial combat configuration.

Both scenes should share the same underlying combat logic wherever possible.

Do not create two unnecessarily independent implementations that will become difficult to maintain.

However, `escena_tutorial` must exist as a separately accessible Phaser scene.

The tutorial configuration must not accidentally modify the original scene.

### 2.3. Tutorial Instructional Pop-Ups

Only `escena_tutorial` displays instructional pop-ups. A welcome message blocks the first turn until dismissed; each supported boss ability displays its explanation once per encounter, before its first execution. The modal pauses combat, and Enter closes it and resumes the deferred action. Attack counts are read from the active phase configuration, including Heir Mode, while the standard combat scene receives no instructional messages. The complete message and presentation requirements are specified in **LA DEXÍADA — TUTORIAL COMBAT POP-UP SYSTEM** below.

---

# 3. TUTORIAL DAMAGE MODIFIER

In `escena_tutorial`, all damage originating from the gods must be multiplied by:

**0.75**

This modifier applies to both Iobrontes and Kosmelys.

When the resulting damage is fractional, round UP to the next integer using `Math.ceil()`.

### Formula

```javascript
tutorialDamage = Math.ceil(originalDamage * 0.75);
```

### Examples

| Original Damage | Tutorial Damage |
|---|---|
| 10 | 8 |
| 15 | 12 |
| 20 | 15 |
| 30 | 23 |
| 40 | 30 |
| 50 | 38 |
| 60 | 45 |
| 100 | 75 |

## 3.1. Iobrontes

Apply the modifier to:

- Lightning Chain.
- Watch the Thunder.
- Divine Retribution retaliation.

This also applies when Iobrontes is in Heir Mode.

### Example — Normal Lightning Chain

Original:

3 strikes dealing 10 damage each.

Tutorial:

3 strikes dealing 8 damage each before character-specific defense calculations.

### Example — Heir Lightning Chain

Original:

5 strikes dealing 20 damage each.

Tutorial:

5 strikes dealing 15 damage each before character-specific defense calculations.

### Example — Heir Watch the Thunder

Original:

2 sweeps dealing 100 damage each.

Tutorial:

2 sweeps dealing 75 damage each.

The number of attacks must remain unchanged.

## 3.2. Kosmelys

Apply the modifier to:

- Cosmic Rays.
- Meteor Rain.

This also applies when Kosmelys is in Heir Mode.

### Example — Normal Cosmic Rays

Original:

2 cosmic projectiles dealing 15 damage each.

Tutorial:

2 cosmic projectiles dealing 12 damage each.

### Example — Heir Cosmic Rays

Original:

3 cosmic projectiles dealing 30 damage each.

Tutorial:

3 cosmic projectiles dealing 23 damage each.

### Example — Heir Meteor Rain

Original:

8 meteors dealing 40 damage each.

Tutorial:

8 meteors dealing 30 damage each.

## 3.3. Defensive Calculations

The tutorial multiplier must be applied once to the boss attack's configured damage, after its normal or Heir damage has been determined.

Then apply the existing character-specific defense mechanics.

Do not independently multiply the same attack again during damage resolution.

Preserve:

- Dexios's normal and perfect defense mechanics.
- Furai's normal and perfect defense mechanics.
- Sahira's complete damage prevention on valid directional blocks.
- Hazel's Perfect-Parry-only damage prevention.
- Hippopotamus Shield.
- All existing automatic counterattack behavior.

For example, an imperfect block must continue using the existing defensive reduction logic against the tutorial-adjusted incoming damage.

If damage reduction produces a fractional result, use the same consistent upward-rounding policy.

## 3.4. Exclusions

Do not reduce damage originating from playable characters.

The following must retain their original values:

- Player offensive abilities.
- Offensive timing multipliers.
- Armor Break damage.
- Dexios's automatic counterattacks.
- Furai's Tiger Parry.
- Chaotic Lightning's self-damage or failure backlash.
- Other player-origin damage effects.

Kosmelys's Portal Shield redirects player-origin damage. This redirected damage must not receive the gods' 0.75 modifier.

Do not change healing amounts.

Do not change maximum HP values.

---

# 4. TUTORIAL ATTACK AND TIMING SPEED

In `escena_tutorial`, all combat attack timings and action-command timings must be multiplied by:

**1.5**

The purpose is to make the combat easier by allowing the player more time to react.

### Formula

```javascript
tutorialDuration = originalDuration * 1.5;
```

The original combat scene must continue using its existing timing values.

## 4.1. Enemy Attacks

Apply the 1.5 multiplier to:

- Attack preparation and wind-up.
- Projectile travel duration.
- Delays between sequential projectiles.
- Defensive reaction windows.
- Normal-block windows.
- Perfect-Parry windows.
- Team-jump windows.
- Relevant attack animation durations.
- Combat timing indicators.

This must apply to all normal and Heir boss attacks.

### Example — Lightning Chain

If the existing attack wind-up is 0.187 seconds:

Tutorial wind-up:

0.2805 seconds.

If projectile travel is 0.373 seconds:

Tutorial travel:

0.5595 seconds.

The complete attack sequence must remain synchronized.

### Example — Watch the Thunder

Normal casting duration:

0.6 seconds.

Tutorial casting duration:

0.9 seconds.

Normal jump window:

0.3 seconds.

Tutorial jump window:

0.45 seconds.

The same modifier must apply independently to both sweeps in Heir Mode.

### Example — Meteor Rain

If a meteor normally takes 0.7 seconds to travel:

Tutorial travel duration:

1.05 seconds.

Keep meteors strictly sequential.

## 4.2. Defensive Timing Windows

Scale every timing-window boundary consistently relative to the intended impact moment.

For example:

Normal:

- Normal block: T−0.5 to T−0.1.
- Perfect Parry: T−0.1 to T+0.1.

Tutorial:

- Normal block: T−0.75 to T−0.15.
- Perfect Parry: T−0.15 to T+0.15.

The resulting windows must be 1.5 times longer.

Do not merely slow the projectile visually while leaving the input windows unchanged.

Impact synchronization, damage resolution, and feedback must also respect the scaled timing.

## 4.3. Offensive Action Commands

The tutorial timing modifier also applies to the playable characters' offensive action-command minigames.

Examples:

- Electric Arc timing circles.
- Tiger Fang timing circles.
- Chaotic Lightning directional inputs.
- Furai's Armor Break minigame.
- Sahira's Hippopotamus Shield minigame.
- Hazel's Flame Dance directional sequence.
- Hazel's Figure Shards rapid-input challenge.

### Examples

A 2-second action command becomes:

3 seconds.

A 3-second action command becomes:

4.5 seconds.

For Chaotic Lightning, the Perfect and Normal thresholds must also scale by 1.5.

For example:

- Original Perfect window: first 1 second.
- Tutorial Perfect window: first 1.5 seconds.
- Original complete input limit: 2 seconds.
- Tutorial complete input limit: 3 seconds.

For movement-based minigames, slow moving indicators proportionally so their complete trajectories and reaction opportunities last 1.5 times longer.

Do not simply multiply the challenge duration while leaving moving objects at their original speed.

Maintain consistent success and failure conditions.

## 4.4. Animation Synchronization

Visual indicators, attack projectiles, timing rings, input windows, sound effects, and damage resolution must remain synchronized.

If necessary, adjust animation durations or tween speeds to match the tutorial timing configuration.

Do not change the artwork itself.

Avoid applying the 1.5 multiplier twice to the same duration.

## 4.5. What Must Remain Unchanged

Do not modify:

- Attack damage from playable characters.
- Number of attacks.
- Ability costs.
- Resource regeneration.
- Boss attack probabilities.
- Boss maximum HP.
- Turn order.
- Enemy targeting behavior.
- Character movement or battlefield positioning.
- Music playback speed.
- General non-combat interface animations.

Only combat-related attack timing and timing challenges receive the 1.5 multiplier.

---

# 5. CONFIGURATION SYSTEM

Create separate, configurable combat modifiers.

Suggested configuration:

```javascript
const COMBAT_MODES = {
  normal: {
    bossDamageMultiplier: 1,
    combatTimingMultiplier: 1
  },
  tutorial: {
    bossDamageMultiplier: 0.75,
    combatTimingMultiplier: 1.5
  }
};
```

Use the game's existing configuration architecture where possible.

Do not hard-code `0.75` and `1.5` throughout individual attack implementations.

The scene configuration must be the authoritative source for these modifiers.

The original combat scene must continue using the normal configuration.

`escena_tutorial` must use the tutorial configuration.

---

# 6. SELECT SCENE — TWO COMBAT BUTTONS

Modify the existing `select-scene`.

Currently, there is a button near the top of the screen that opens the original combat scene.

Keep that button, but reposition it slightly to the right.

Add a second matching button on the left.

Both buttons must be horizontally symmetrical around the screen's vertical centerline.

## 6.1. Left Button — Tutorial

Create a new button on the LEFT side.

### Appearance

- Black oval background.
- Golden border.
- Same size and visual style as the existing combat button.
- Centered image: `tutorial.png`.
- Text displayed below the image: `tutorial`.

Use the existing font style for the button label.

The text must remain readable and centered.

### Behavior

Clicking this button must open:

`escena_tutorial`

The new scene must start a completely new tutorial-configured combat encounter.

## 6.2. Right Button — Original Combat

Keep the existing button on the RIGHT side.

Preserve:

- Its existing image.
- Its existing text.
- Its existing black oval styling.
- Its existing golden border.
- Its existing click behavior.
- Its destination: the original combat scene.

The only requested change is its horizontal position.

Move it slightly to the right to create a symmetrical layout with the new Tutorial button.

Do not replace its artwork or rename it.

## 6.3. Symmetrical Positioning

Use the screen's horizontal center as the reference.

At 1920 × 1080:

Screen center X:

960.

Suggested initial button centers:

- Tutorial button: X = 760.
- Original combat button: X = 1160.

These values may be adjusted depending on the existing oval dimensions.

The important requirement is:

```text
distance(leftButton, screenCenter)
=
distance(rightButton, screenCenter)
```

Both buttons must share:

- The same vertical position.
- The same dimensions.
- The same layout structure.
- Equivalent spacing around the centerline.

Preserve other existing elements in `select-scene`.

Do not move or redesign unrelated buttons.

## 6.4. Asset Loading

Load `tutorial.png` through the existing asset system.

Verify its actual location and extension.

Do not generate new artwork or substitute an unrelated image.

If it is missing, report it clearly.

---

# 7. RESTART AND SCENE INDEPENDENCE

Both scenes must be independently playable and restartable.

### Original Combat

- Uses normal boss damage.
- Uses normal combat timing.
- Uses existing combat functionality.
- Uses four Hippopotamus Healing charges.

### Tutorial Combat

- Uses 75% boss-origin damage, rounded upward.
- Uses 150% combat attack/timing durations.
- Uses the same abilities, bosses, transformations, and combat mechanics.
- Uses four Hippopotamus Healing charges.

Restarting either scene must restore:

- Both bosses' initial Health.
- Both bosses' initial phase.
- All playable-character Health and resources.
- Sahira's four healing charges.
- Other limited-use abilities.
- Existing status effects.
- The established initial turn order.

Restarting the tutorial must not accidentally launch the original scene.

Likewise, restarting original combat must not launch `escena_tutorial`.

Avoid shared mutable state leaking between scenes.

Ensure that audio, timers, tweens, event listeners, and keyboard handlers are cleaned up appropriately when changing scenes.

---

# 8. IMPLEMENTATION ORDER

Implement the update in small stages.

### Stage 1 — Sahira

- Update Hippopotamus Healing to four uses.
- Verify its HUD display.
- Verify charges reset on battle restart.

### Stage 2 — Tutorial Scene

- Register `escena_tutorial`.
- Reuse or duplicate the existing combat scene behavior.
- Ensure the new scene loads and runs correctly.
- Preserve boss phases and existing combat functionality.

### Stage 3 — Damage Modifier

- Implement the 0.75 boss-origin damage modifier.
- Apply upward rounding.
- Verify Normal and Heir attacks.
- Preserve defensive calculations.

### Stage 4 — Timing Modifier

- Implement the 1.5 timing multiplier.
- Apply it consistently to enemy attacks.
- Apply it to offensive action commands.
- Verify timing indicators and visual synchronization.

### Stage 5 — Select Scene

- Add the Tutorial button on the left.
- Move the existing combat button to the right.
- Preserve their visual style.
- Verify both scene transitions.

### Stage 6 — Validation

- Test the original combat scene.
- Test `escena_tutorial`.
- Test both scenes after restarting.
- Test all boss attacks.
- Test the Heir phases.
- Test the action-command minigames.
- Run the production build.

Do not rewrite unrelated code.

---

# 9. ACCEPTANCE TESTS

Verify all of the following:

1. Sahira begins with four Hippopotamus Healing charges.
2. Healing correctly consumes one charge per successful use.
3. Healing becomes unavailable after four uses.
4. Both combat scenes have the four-charge healing system.
5. The original combat scene remains functional.
6. `escena_tutorial` loads successfully.
7. The new scene contains the same four playable characters.
8. The new scene contains the same two bosses.
9. Both Heir Modes work in the tutorial scene.
10. Tutorial boss damage uses the 0.75 multiplier.
11. Fractional tutorial damage rounds upward.
12. Player damage remains unchanged.
13. Normal and Heir attack counts remain unchanged.
14. Defensive timing windows are 1.5 times longer.
15. Projectile travel and preparation durations are 1.5 times longer.
16. Offensive action commands allow 1.5 times the original duration.
17. Moving timing indicators remain synchronized with their input windows.
18. Perfect-Parry behavior remains unchanged.
19. The original combat scene retains its normal timing and damage.
20. The Tutorial button appears on the left of `select-scene`.
21. The existing Combat button appears on the right.
22. Both buttons are symmetrical relative to the screen's vertical center.
23. The Tutorial button uses `tutorial.png`.
24. The existing Combat button retains its image, label, and functionality.
25. Clicking Tutorial opens `escena_tutorial`.
26. Clicking Combat opens the original combat scene.
27. Restarting either scene restarts that same scene.
28. No combat state leaks between scenes.
29. Existing music and sound effects continue working.
30. The production build succeeds.
31. Both scenes remain fully playable.

---

# 10. UPDATE DESIGN.md

Update the existing game design documentation to reflect:

- Hippopotamus Healing having four uses.
- The new `escena_tutorial`.
- The 0.75 tutorial boss-damage modifier.
- Upward damage rounding.
- The 1.5 combat timing modifier.
- Preservation of the original combat scene.
- The revised two-button layout in `select-scene`.
- The Tutorial button's image and scene destination.

Integrate these changes into the existing relevant sections.

Do not append contradictory duplicate documentation.

---

# FINAL REQUIREMENT

Preserve the existing functional game while introducing a separate tutorial combat scene.

Both scenes must use the same combat mechanics and character systems, with only the specified scene modifiers.

Do not redesign the battle or alter existing abilities beyond the requested changes.

When finished, report:

- Files modified.
- How the tutorial scene was created.
- How damage and timing modifiers were implemented.
- How Sahira's healing charges were updated.
- How the selection screen was modified.
- Any missing assets or build errors.

# LA DEXÍADA — TUTORIAL COMBAT POP-UP SYSTEM

## 1. CRITICAL INSTRUCTIONS

The existing `escena_tutorial` is already functional. It uses the same combat mechanics as the original battle, with reduced boss damage and slower combat timing.

The objective of this update is to introduce **instructional pop-up windows** that teach players how the enemy attacks work.

Do not rebuild the combat system or modify existing mechanics.

All pop-up content must be displayed in **English**.

The system must include:

- One introductory tutorial message when the scene begins.
- One instructional pop-up for each of the six existing boss abilities.
- Automatic combat pausing while a pop-up is displayed.
- Enter-key interaction to close each pop-up and resume gameplay.
- A consistent visual design matching the existing game's UI.

**These pop-ups must exist only in `escena_tutorial`. The original combat scene must remain unchanged.**

---

# 2. POP-UP WINDOW DESIGN

## 2.1. Dimensions

Every tutorial pop-up must appear in the center of the screen.

The window must occupy:

- 60% of the screen width.
- 60% of the screen height.

At the target resolution of 1920 × 1080, the window measures approximately:

- Width: 1152 pixels.
- Height: 648 pixels.

The window must be centered symmetrically around both the horizontal and vertical screen axes.

## 2.2. Appearance

Use the following design:

- Black background.
- Golden borders.
- Elegant styling consistent with La Dexíada.
- High text contrast.
- Sufficient internal padding.
- No unnecessary decorations or additional artwork.

The window must appear above the battlefield, characters, attacks, and existing HUD.

The background battle scene should remain visible around the window.

## 2.3. Typography

Use the game's existing title font, **Archeologicaps**, for:

- Pop-up titles.
- Major headings.
- Enter-key instruction labels.

Use the existing secondary font that supports conventional lowercase letters for:

- Explanatory paragraphs.
- Descriptive text.
- Longer instructions.

Do not use Archeologicaps for the descriptive paragraphs.

Text must wrap correctly without clipping or overlapping the window borders.

Use a readable font size and comfortable line spacing.

## 2.4. Keyboard Instructions

Whenever a message mentions a keyboard key, display that key using the existing game's golden key-indicator style.

This applies to:

- W
- A
- S
- D
- Space
- Enter

Do not display these as ordinary unstyled text if the game already has a reusable golden key component.

At the bottom of every pop-up, display a clear instruction such as:

**[ENTER] CONTINUE**

The Enter key must appear in the same golden style as other keyboard indicators.

---

# 3. POP-UP INTERACTION

## 3.1. Enter to Continue

The player closes the currently displayed pop-up by pressing:

`Enter`

When Enter is pressed:

1. Close the pop-up.
2. Restore the normal combat view.
3. Resume the gameplay sequence exactly where it was interrupted.
4. Restore the appropriate gameplay controls.

Do not require mouse input.

## 3.2. Blocking Gameplay Input

While a pop-up is visible:

- The player cannot select attacks.
- The player cannot activate abilities.
- WASD inputs must not trigger defensive animations.
- Space must not activate jumps or minigames.
- Boss actions cannot advance.
- Combat damage cannot resolve.
- The turn order cannot advance.
- Timed combat events cannot expire.

Only the pop-up's Enter interaction should be processed.

Prevent the same Enter press from unintentionally activating another game action after the window closes.

## 3.3. Pause Synchronization

The tutorial must pause correctly without breaking attack timing.

When an enemy ability is selected for the first time, display its explanatory pop-up **before that ability's casting animation, projectile movement, or reaction timer begins**.

After closing the pop-up, the attack should begin normally from its initial state.

Do not allow the attack's timer to run invisibly behind the instructional window.

Do not simply hide an already-running attack animation.

Prefer pausing or deferring the relevant combat action at the state-machine level.

The existing slower tutorial timing multiplier must remain active.

Background music may continue playing normally while the pop-up is visible.

---

# 4. INITIAL TUTORIAL MESSAGE

Immediately upon entering `escena_tutorial`, display the introductory pop-up.

It must appear before the first combat turn or attack begins.

### Title

WELCOME TO THE DEXIAD

### Description

Welcome to combat in The Dexiad!

In this tutorial, the gods will deal less damage and take more time to perform their abilities, giving you a better opportunity to practice.

You can also freely train each character's abilities in their dedicated practice section.

### Interaction

Display the golden Enter key indicator at the bottom of the window.

The battle begins only after the player presses Enter to close this introductory message.

Do not automatically close it after a timer.

---

# 5. FIRST-USE ENEMY ABILITY POP-UPS

Each of the six existing enemy abilities must display its own explanatory pop-up the first time it is used during the tutorial encounter.

The six abilities are:

### Iobrontes
1. Lightning Chain
2. Watch the Thunder
3. Divine Retribution

### Kosmelys
4. Cosmic Rays
5. Meteor Rain
6. Portal Shield

Each pop-up appears **only once per tutorial battle**, regardless of how many times the corresponding ability is used afterward.

The system must track each ability independently.

The message must appear after the enemy has selected the ability but before the ability begins executing.

---

# 6. IOBRONTES — ATTACK TUTORIALS

## 6.1. Lightning Chain

### Title

LIGHTNING CHAIN

### Description

Iobrontes launches 3 consecutive lightning bolts from four possible directions.

Defend yourself by pressing W, A, S, or D according to the direction of the incoming attack, timing your input as the circle closes.

### Display Requirements

The W, A, S, and D keys must use the existing golden key style.

Preserve all current defensive mechanics.

Do not modify Lightning Chain's damage, timing, or targeting behavior.

## 6.2. Watch the Thunder

### Title

WATCH THE THUNDER

### Description

Iobrontes unleashes a powerful attack that strikes your entire party.

Jump to avoid the attack by pressing Space during the timing window.

### Display Requirements

Display Space as a golden key indicator.

The ability must not begin until the player closes the instructional window.

## 6.3. Divine Retribution

### Title

DIVINE RETRIBUTION

### Description

Iobrontes surrounds his body with electricity, creating a temporary protective state.

If you attack him while this effect is active, he will still receive damage, but your attacking character will suffer a powerful retaliation.

### Display Requirements

This ability does not require a specific defensive key instruction.

Do not alter the existing Divine Retribution duration, retaliation damage, or expiration rules.

---

# 7. KOSMELYS — ATTACK TUTORIALS

## 7.1. Cosmic Rays

### Title

COSMIC RAYS

### Description

Kosmelys launches 2 consecutive cosmic attacks from four possible directions.

Defend yourself by pressing W, A, S, or D according to the incoming direction as the timing circle closes.

Be careful! Each projectile changes direction halfway through its journey. You must defend against its final direction.

### Display Requirements

The W, A, S, and D keys must use the existing golden key style.

Do not change the existing direction-change mechanic.

## 7.2. Meteor Rain

### Title

METEOR RAIN

### Description

Kosmelys unleashes a barrage of 5 meteors, randomly targeting members of your party.

Press W as the timing circle closes to defend against each incoming meteor and avoid damage.

### Display Requirements

The W key must use the golden key style.

Preserve the existing sequential meteor system.

Do not start the first meteor before the player closes the pop-up.

## 7.3. Portal Shield

### Title

PORTAL SHIELD

### Description

Kosmelys protects herself with a spatial portal that remains active until an allied character performs an action.

If she receives an attack while the portal is active, she redirects that attack toward a randomly selected member of your party.

### Display Requirements

No special keyboard instruction is needed for this explanation.

Preserve the existing Portal Shield redirection rules, duration, and interactions with player abilities.

---

# 8. HEIR MODE COMPATIBILITY

Both bosses can enter Heir Mode during the tutorial battle.

The first-use tutorial messages must remain accurate when a boss uses an expanded Heir Mode attack for the first time.

### Normal / Heir Attack Counts

| Ability | Normal Mode | Heir Mode |
|---|---:|---:|
| Lightning Chain | 3 bolts | 5 bolts |
| Watch the Thunder | 1 sweep | 2 sweeps |
| Cosmic Rays | 2 projectiles | 3 projectiles |
| Meteor Rain | 5 meteors | 8 meteors |

Use the actual current boss phase to display the appropriate attack count in the corresponding description.

For example, if Iobrontes first uses Lightning Chain after transforming into Heir Mode, the pop-up must say:

"Iobrontes launches 5 consecutive lightning bolts..."

Similarly, if Kosmelys first uses Meteor Rain while in Heir Mode, it must describe 8 meteors rather than 5.

For Heir Watch the Thunder, explain that the attack performs two consecutive sweeps and requires a separate Space input for each.

The first-use flag belongs to the ability, not separately to each phase.

Therefore, if Lightning Chain was already explained in Normal Mode, do not repeat the pop-up merely because Iobrontes entered Heir Mode.

Do not modify boss damage values, attack counts, or timing mechanics to match the tutorial text. The text must reflect the existing gameplay configuration.

---

# 9. FIRST-USE TRACKING

Create a centralized tutorial pop-up tracking system.

Suggested structure:

```javascript
const tutorialMessagesSeen = {
  introduction: false,
  lightningChain: false,
  watchTheThunder: false,
  divineRetribution: false,
  cosmicRays: false,
  meteorRain: false,
  portalShield: false
};
```

### Required Behavior

- On entering a fresh tutorial battle, all flags are false.
- The introduction is displayed immediately.
- When an enemy selects an ability, check its corresponding flag.
- If false, show that ability's pop-up before executing the attack.
- Mark the explanation as seen when the player closes it.
- Resume the selected enemy ability.
- On later uses of that same ability, execute it normally without pausing.

When the tutorial battle is restarted, reset all flags so the explanations can appear again.

Do not share this tracking state with the original combat scene.

Do not persist the flags across separate tutorial battles unless an explicit save feature is added later.

---

# 10. REUSABLE POP-UP COMPONENT

Implement a reusable tutorial instructional window rather than seven separate UI implementations.

The component should support:

- Title.
- Description.
- Styled keyboard keys embedded in the description.
- Optional dynamic values such as the number of attacks.
- Enter-to-continue functionality.
- Combat pause / resume callback.
- Automatic text wrapping.
- Consistent sizing and positioning.

Store the tutorial messages in a central configuration object so their wording can be edited easily.

Separate tutorial content from combat execution logic.

Do not duplicate boss attack implementations just to display instructional messages.

---

# 11. SCENE AND GAMEPLAY RESTRICTIONS

This update must not modify:

- Boss damage.
- Tutorial damage multipliers.
- Tutorial speed multipliers.
- Heir Mode.
- Offensive action commands.
- Character abilities.
- Character statistics.
- Character positions.
- HUD layouts.
- Existing combat animations.
- Sound effects.
- Music playback.
- The fixed turn order.
- Victory and defeat conditions.

The original combat scene must not show these pop-ups.

Only `escena_tutorial` receives this instructional system.

---

# 12. ACCEPTANCE TESTS

Verify all the following:

1. The introduction appears immediately upon entering `escena_tutorial`.
2. The initial combat turn does not begin until the introduction is closed.
3. Each instructional window occupies 60% of the screen width and height.
4. Every pop-up is centered horizontally and vertically.
5. Every pop-up has a black background and golden borders.
6. All titles use Archeologicaps.
7. All explanatory text uses the readable lowercase-capable font.
8. Keyboard keys appear using the existing golden style.
9. Enter closes the currently displayed pop-up.
10. No gameplay input is accepted while a pop-up is open.
11. Combat timing does not continue behind the pop-up.
12. Lightning Chain displays its explanation on first use.
13. Watch the Thunder displays its explanation on first use.
14. Divine Retribution displays its explanation on first use.
15. Cosmic Rays displays its explanation on first use.
16. Meteor Rain displays its explanation on first use.
17. Portal Shield displays its explanation on first use.
18. Each explanation appears only once per tutorial encounter.
19. The selected boss attack executes normally after closing its explanation.
20. No projectile, animation, or damage event is skipped or duplicated.
21. Heir Mode attack descriptions use their correct current attack counts.
22. The existing tutorial damage and timing modifiers continue working.
23. Restarting the tutorial resets the instructional-message tracking.
24. The original combat scene remains unchanged.
25. All text fits within its window without overlap or clipping.
26. The production build succeeds.
27. The tutorial battle remains fully playable from beginning to victory or defeat.

---

# 13. DESIGN.MD UPDATE

Update the existing `DESIGN.md` to document:

- The new tutorial instructional pop-up system.
- The initial welcome message.
- The six first-use boss-ability explanations.
- The 60%-screen centered black-and-gold window.
- The Enter-to-continue behavior.
- Correct combat pausing.
- First-use tracking and reset behavior.
- Heir Mode-aware instructional text.

Integrate the new requirements into the existing tutorial-scene documentation.

Do not create contradictory or duplicated sections.

---

# FINAL REQUIREMENT

Implement only the instructional pop-up system for `escena_tutorial`.

The pop-ups must teach the player how each existing boss ability works without altering the ability itself.

Preserve the existing functional combat system and ensure every paused enemy attack resumes correctly after the player presses Enter.

When finished, report the files modified, the pop-ups implemented, and the results of the build and gameplay tests.