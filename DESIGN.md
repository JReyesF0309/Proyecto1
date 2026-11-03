LA DEXÃADA â€” GAME DESIGN DOCUMENT
Version: 0.6 â€” Four-Character Dual-Boss Combat Prototype
Document Status: Implementation Specification
Target Platform: PC (Phaser, browser)
Genre: Turn-Based RPG with Real-Time Directional Defense
Visual Perspective: 2D character-based combat with foreground/background depth
Prototype Scope: Four playable characters, two bosses, one arena, and standard and tutorial configurations of the dual-boss combat encounter.
Note to the implementer: This document is intended to be self-contained. Implement the mechanics and values described here without relying on previous versions. Numerical values, timings, character positions, camera settings, and animation references must be stored in configuration files whenever possible.

All player-facing in-game text must be in English, including HUD labels, prompts, ability descriptions, action-command instructions, tutorials, dialogue, and battle outcomes.

## DOCUMENT AUTHORITY AND ORGANIZATION

The current implementation is authoritative. The core specification and final timing table at the front of this document are the consolidated reference for the current build. Appendix A preserves the original requirements and design notes in their original wording for traceability; some notes are superseded, while others retain detail for current features. They are not cumulative changes to implement. If an archived value or instruction conflicts with the current build, use the current implementation and final values in this document.

The system index is:

1. Core game overview, setting, assets, combat, characters, defense, audio, and acceptance criteria.
2. Dual-boss combat, Cosmic Rays, Portal Shield, Meteor Rain, targeting, and boss turn rules.
3. Combat HUD, camera, character selection, and target selection.
4. Character presentation, battlefield layout, sprite and HUD corrections.
5. Offensive action commands and their damage, timing, and ability interactions.
6. Character introduction screens.
7. Normal and Heir boss phases, transformations, and Heir abilities.
8. Tutorial combat configuration, tutorial pop-ups, and tutorial-specific behavior.
9. Narrative battle, dialogue, cinematics, and event sequencing.
10. Historical source notes retained in Appendix A.

## FINAL CONFIGURED TIMING VALUES

These are the current base values in milliseconds unless a different unit is shown. Tutorial combat uses a 1.5 timing multiplier; standard combat uses 1.0. Incoming-attack defensive windows and their projectile travel use an additional 1.5 multiplier in every mode, so the effective scale is 1.5 in standard combat and 2.25 in tutorial combat. Narrative mode also applies its existing 2.25 defense-window scale on top of the shared multiplier. Tutorial damage from bosses uses a separate 0.75 multiplier, rounded up.

### Camera

| Timing | Value |
|---|---:|
| Focus transition | 260 ms |
| Selection transition | 380 ms |
| Return transition | 300 ms |

### Combat and defense

| Timing | Value |
|---|---:|
| Enemy wind-up | 187 ms |
| Projectile travel | 373 ms |
| Defense opens before impact | 500 ms |
| Perfect-parry window starts before impact | 100 ms |
| Defense closes after impact | 100 ms |
| Incoming-attack window multiplier | 1.5× |
| Defense hint lead | 100 ms |
| Result display | 1,019 ms |
| Delay between Lightning Chain bolts | 373 ms |
| Enemy attack announcement | 1,000 ms |
| Gap between enemy turns | 500 ms |
| Watch the Thunder cast | 600 ms |
| Team jump input window | 300 ms |
| Team jump pose | 700 ms |
| Player multi-hit interval | 260 ms |
| Hazel attack pose | 700 ms |
| Player attack recovery | 500 ms |
| Sprite pose | 650 ms |
| Cosmic Rays wind-up | 187 ms |
| Cosmic Rays perfect-parry window | 100 ms |
| Meteor Rain first-meteor preparation | 500 ms |
| Meteor Rain first-meteor travel | 500 ms |
| Meteor Rain follow-up travel | 700 ms |
| Meteor defense opens before impact | 700 ms |
| Meteor normal-block window | 400 ms |
| Meteor perfect-parry window | 400 ms |
| Portal Shield visual effect | 620 ms |
| Kosmelys breathing cycle | 1,750 ms |
| Kosmelys breathing displacement | 4 px |
| Portal Shield duration | 1 playable-character turn |

For Meteor Rain, the normal-block window is the first 400 ms of the 800 ms defense window, and the perfect-parry window is the following 400 ms. Each meteor resolves after both windows close. The first meteor has a 500 ms preparation phase; following meteors have no preparation phase.

The table lists base values. Apply the incoming-attack window multiplier to defense-window boundaries and incoming projectile travel; tutorial combat also applies its existing 1.5 timing multiplier, and narrative mode also applies its configured 2.25 defense-window scale.

### Offensive action commands

| Action command | Final timing values |
|---|---|
| Presentation strip | 260 ms enter, 1,000 ms hold, 260 ms exit |
| Electric Arc | 1,500 ms fill; normal threshold at -700 ms, perfect threshold at -300 ms, window ends at +100 ms; 8,000 ms timeout |
| Chaotic Lightning | 3 directional inputs; 2,000 ms per input; perfect if entered within 1,000 ms |
| Tiger Fang | 1,200 ms timing circle; fail threshold -1,100 ms, normal threshold -700 ms, perfect threshold -300 ms, window ends at +100 ms; 350 ms between circles |
| Armor Break | 3,000 ms horizontal-control command at 175.5 px/s |
| Hippopotamus Shield | 15,000 ms timeout; moving-circle speed ratio 1.92 |
| Flame Dance | 4 directional inputs within 2,000 ms |
| Figure Shards | 10 presses within 3,000 ms |

Action-command timing thresholds are relative to the event indicated by that command. The tutorial timing multiplier applies to action commands as well as combat timing. Values are defined by `src/game-config.ts` and `src/action-commands.ts`.

## FINAL AUDIO CUES

| Scene or event | Audio asset | Behavior |
|---|---|---|
| Dexios practice scene | `assets/music/dexios_training.mp3` | Loops during the practice scene |
| Sahira practice scene | `assets/music/sahira_training.mp3` | Loops during the practice scene |
| Furai practice scene | `assets/music/furai_training.mp3` | Loops during the practice scene |
| Hazel practice scene | `assets/music/hazel_training.mp3` | Loops during the practice scene |
| Narrative scene opening | `assets/music/intro.mp3` | Plays during the opening |
| Narrative chaos wave | `assets/music/chaos.mp3` | Starts with the wave and loops until the battle music replaces it |
| Battle defeat | `assets/music/lose.mp3` | Starts when the lose condition is reached |
| Kosmelys enters Heir Mode | `assets/sfx/kosmelys_heredera.mp3` | Plays as her Heir transformation cinematic appears |
| Iobrontes enters Heir Mode | `assets/sfx/iobrontes_heredero.mp3` | Plays as his Heir transformation cinematic appears |

## NARRATIVE HEIR RECOVERY EVENT

In the narrative battle, trigger Dexios's dittany-potion scene exactly once after both bosses have entered Heir Mode at least once. This remains true if one boss enters Heir Mode and is permanently defeated before the other transforms. When the surviving boss enters Heir Mode, run the recovery scene even though the defeated boss's current phase is `defeated`. After the dialogue, revive and fully heal the party and restore Dexios's Mana, then resume the current turn sequence.

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

The standard scene remains `escena_combate_dificil`. The tutorial scene, `escena_tutorial`, reuses the same combat implementation with a configured 0.75 multiplier on god-origin damage (rounded up with `Math.ceil`) and a 1.5 multiplier on combat and action-command timings. Incoming-attack defensive windows and projectile travel also receive a shared 1.5 multiplier in both modes; tutorial mode stacks its timing multiplier on top. Player-origin damage, boss HP, attack counts, healing amounts, and turn order remain unchanged. `escena_select` presents equally sized 700 × 360 Tutorial and Combat ovals symmetrically at X=560 and X=1360. The left button is labeled `tutorial`, uses `assets/backgrounds/tutorial.png`, and starts a fresh tutorial encounter; the existing `COMBAT START` artwork, label, and destination remain unchanged apart from its position.
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
Configured camera values:
â€¢	Target zoom multiplier: 1.08.
â€¢	Focus transition: 260 ms.
â€¢	Selection transition: 380 ms.
â€¢	Return transition: 300 ms.
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
11	Iobrontes
12	Kosmelys
Hazel's configured slot immediately after Sahira is provisional. After turn position 12, the sequence restarts at position 1.
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
Iobrontes
  â†“
Kosmelys
  â†“
Repeat
Iobrontes and Kosmelys each act four times during every complete twelve-position cycle. Hazel's turn is configuration-controlled; every other turn keeps its existing relative position.
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
The attack deals 70 damage to the selected living boss, consumes 50 Chaos energy, and inflicts 10 self-damage on Dexios.
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
Base duration: 0.373 seconds. Incoming projectile travel is 1.5× in standard combat and 2.25× in tutorial combat.
The lightning projectile travels toward the targeted character.
A timing ring appears around the target and contracts toward them.
The ring reaches its final size at the moment of visual impact.
Phase 3 â€” Defensive Resolution
All timing is measured relative to the moment of impact, called T.
The defensive window opens 0.75 seconds before impact and closes 0.15 seconds after impact in standard combat. Tutorial combat uses a 2.25× total scale: it opens 1.125 seconds before impact and closes 0.225 seconds after impact. Narrative mode additionally applies its configured 2.25 defense-window scale.
Timing	Correct Input Result	Indicator
Before T âˆ’ 0.75 s (standard) / T âˆ’ 1.125 s (tutorial)	Ignored	Neutral
T âˆ’ 0.75 s to T âˆ’ 0.15 s (standard) / T âˆ’ 1.125 s to T âˆ’ 0.225 s (tutorial)	Imperfect block	Yellow
T âˆ’ 0.15 s to T + 0.15 s (standard) / T âˆ’ 0.225 s to T + 0.225 s (tutorial)	Perfect parry	White, glowing
After T + 0.15 s (standard) / T + 0.225 s (tutorial)	No valid defense	Inactive
Only the first directional input made during the active window is accepted.
An incorrect directional input results in a failed defense.
Inputs made before the defensive window opens do not automatically trigger a defense later.
9.3. Impact and Damage Synchronization
The visual impact and the final damage calculation must be handled separately.
The lightning visually reaches the target at time T.
However, the defensive window remains active until T + 0.15 seconds in standard combat or T + 0.225 seconds in tutorial combat.
Therefore:
1.	At time T, the lightning reaches the character visually.
2.	The game records the apparent impact but does not finalize damage.
3.	The player may still perform a perfect parry until the mode-specific defensive-window close time.
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
Watch the Thunder is one enemy action targeting all active party members. It has a 0.6-second base casting time followed by a 0.3-second base team jump window; the shared incoming-window multiplier applies to the jump window, and tutorial combat also applies its own timing multiplier. It deals 50 damage to each character who does not jump and has no directional or parry outcomes.
Divine Retribution activates a two-playable-turn electric shield using iobrontes_armadura and armadura.mp3. The next damaging attack against Iobrontes deals its normal damage and triggers 30 damage to its attacker; the shield then ends. It also ends after two playable-character turns, whether or not either character attacked, and Iobrontes returns to iobrontes_base on either ending.
Kosmelys independently selects Cosmic Rays (50%), Portal Shield (30%), or Meteor Rain (20%). If Portal Shield is unavailable because it is already active, redistribute its probability proportionally among the available abilities. Cosmic Rays targets one conscious character with both sequential projectiles, changes each projectile's direction once at its travel midpoint, and resolves each projectile once. Meteor Rain resolves five meteors strictly sequentially: the first has a 0.5-second base casting phase and 0.5-second base travel, and each following meteor begins falling as soon as the preceding defense window closes, with 0.7-second base travel. Apply the incoming-window multiplier to meteor travel and defense windows; tutorial combat also applies its own timing multiplier. Every meteor uses character-specific results and any eligible counterattacks. Portal Shield redirects one entire offensive ability to a conscious party member and observes its one-character-turn duration.
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
39.	Damage resolution occurs after the Lightning Chain defensive window closes at T + 0.15 seconds in standard combat or T + 0.225 seconds in tutorial combat.
40.	Defensive results are calculated separately for every Lightning Chain bolt.
41.	The camera returns to its normal position after Lightning Chain.
Visuals and Audio
42.	All supplied character frames are loaded through configurable asset references.
43.	Missing assets use visible placeholders.
44.	Attacks display their specified lightning colors and impact effects.
45.	Watch the Thunder and Cosmic Strike alternate without individually looping during combat.
46.	Sound effects accompany major combat actions.
47.	The battle remains visually readable at 1920 Ã— 1080 resolution.
48.	Kosmelys's Cosmic Rays targets one party member for both projectiles; each changes direction at its midpoint, shows no WASD key for the initial direction and shows the new key immediately after the change, moves the same effect to the new directional origin without resetting remaining travel time, and resolves damage exactly once.
49.	Cosmic Rays applies the specified Dexios, Furai, and Sahira defensive and counterattack rules.
50.	Meteor Rain launches five meteors one at a time, with no overlapping projectile, targeting indicator, defensive window, or unresolved event; each new meteor begins falling as soon as the previous perfect-parry window closes.
51.	The first Meteor Rain meteor has a 0.5-second base casting phase and 0.5-second base travel; following meteors begin falling immediately after the preceding window closes and have 0.7-second base travel. Apply the 1.5 shared incoming-window multiplier to meteor travel and defense windows, with tutorial timing scaling on top. Standard normal-block and perfect-parry windows are each 0.6 seconds; tutorial windows are each 0.9 seconds. Damage resolves after the mode-specific window close.
52.	Dexios counterattacks Kosmelys for 5 damage after every meteor he perfectly parries.
53.	Furai deals one 20-damage Tiger Parry after Meteor Rain only if he was targeted at least once and perfectly parried every meteor assigned to him.
54.	Sahira blocks any meteor with a correct W input in the full 1.2-second standard window or 1.8-second tutorial window; she has no perfect-parry result or counterattack.
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
â€¢	Implement the fixed twelve-position turn sequence, with Hazel immediately after Sahira provisionally.
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
â€¢	Verify the twelve-position dual-boss turn order, both boss health bars, and the requirement to defeat both bosses for victory.
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

## APPENDIX A - HISTORICAL SOURCE ARCHIVE

The material below this heading is retained so no original requirement, decision, test, or implementation detail is lost. It records how the current specification was developed; it is reference material, not a set of cumulative change requests. Apply the current behavior and configured values above when archived notes disagree.

The original camera guidance used an approximate 1.08 zoom, a 0.2-0.3 second focus transition, and an approximately 0.3 second return transition. The exact configured transition timings are listed above.


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

### A.1 Dual-boss combat and encounter rules

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

The base Lightning Chain travel time is 0.373 seconds. After the incoming-window multiplier, standard Lightning Chain travel is approximately 0.560 seconds and its corresponding Cosmic Rays travel is approximately:

0.560 / 0.60 = 0.933 seconds.

Tutorial timings apply their additional 1.5 combat multiplier to those durations. This calculation is a reference; compare effective projectile movement rather than blindly copying durations if projectile distances differ.

Apply the 60% movement-speed ratio once, independently of the combat timing multipliers.

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

1. Show the projectile's initial direction visually during the first half of its movement, but keep the direction warning (including its purple box and key) hidden.
2. Change the direction exactly at the midpoint.
3. Show the WASD key for the new direction as soon as the direction changes.
4. Open the valid defensive input period at or after the direction change, so the player cannot resolve the attack before its final direction has been revealed.
5. Display the usual defense timing indicator.
6. Evaluate the input exclusively against the new direction.
7. Resolve the attack once its defensive window closes, exactly once.

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

The first meteor has a 0.5-second base casting/preparation phase followed by 0.5 seconds of base visible travel. Each subsequent meteor begins falling as soon as the previous meteor's defense window closes and has 0.7 seconds of base travel. Apply the 1.5 incoming-window multiplier to travel and defense-window durations; tutorial mode adds its 1.5 combat multiplier. The impact time is T.

| Timing relative to impact T | Result |
|---|---|
| Standard: before T âˆ’ 1.05 s; tutorial: before T âˆ’ 1.575 s | Input ignored |
| Standard: T âˆ’ 1.05 s to T âˆ’ 0.45 s; tutorial: T âˆ’ 1.575 s to T âˆ’ 0.675 s | Normal block (0.6 s standard; 0.9 s tutorial) |
| Standard: T âˆ’ 0.45 s to T + 0.15 s; tutorial: T âˆ’ 0.675 s to T + 0.225 s | Perfect parry (0.6 s standard; 0.9 s tutorial) |
| After T + 0.15 s standard or T + 0.225 s tutorial | Failed defense if no valid input was registered |

In standard combat, the first meteor uses 500 ms of preparation and 750 ms of travel, so impact occurs at 1250 ms; its active window opens at 200 ms, the perfect-parry period begins at 800 ms, and the window closes at 1400 ms. Tutorial values are 750 ms of preparation and 1125 ms of travel; impact occurs at 1875 ms, the active window opens at 300 ms, the perfect-parry period begins at 1200 ms, and the window closes at 2100 ms. Each following meteor's window opens as it starts falling. Its travel is 1050 ms in standard combat and 1575 ms in tutorial combat; the perfect-parry period begins 600 ms / 900 ms after launch, and the window closes 150 ms / 225 ms after impact. Do not resolve damage at the visual impact time.

The timing indicator is yellow during the normal-block window, white and glowing during the perfect-parry window, and inactive after the window closes. Sahira has no perfect-parry mechanic: any correct W input during either active period is a normal successful block.

The meteor reaches the target visually at T, but damage is not finalized at that moment. Wait until the mode-specific defense window closes (T + 0.15 seconds in standard combat or T + 0.225 seconds in tutorial combat), then resolve the result and apply damage or counterattack. This allows a valid perfect parry shortly after visual impact. Every meteor resolves damage exactly once.

## 5.4. Sequential Meteor Sequence â€” No Overlap

Each meteor must complete its entire attack sequence before the next meteor begins. There must never be more than one active meteor, targeting indicator, defensive window, or unresolved meteor attack at the same time.

For each of the five meteors, in order:

1. Randomly select one conscious playable character.
2. Display the targeting indicator above that character.
3. For the first meteor, begin the 0.5-second casting phase. For each following meteor, begin its fall immediately after the previous defensive window closes.
4. Launch `meteoro.png` toward the target; the first meteor travels for 0.5 seconds and each following meteor travels for 0.7 seconds.
5. Allow the player to defend using W during the active defensive window.
6. Wait until the mode-specific defensive window closes.
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
- Any correct W input during the full 1.2-second standard window or 1.8-second tutorial window prevents all damage.
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

Damage is calculated separately for each meteor only after its mode-specific defensive window closes.

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
- The first meteor has a 0.5-second base casting phase and 0.5-second base travel; every following meteor begins falling as soon as the previous defense window closes and has 0.7-second base travel. Apply the shared incoming-window multiplier to travel and defense windows, and tutorial scaling on top.
- Every meteor's normal-block and perfect-parry windows each last 0.6 seconds in standard combat and 0.9 seconds in tutorial combat; damage resolves only after the mode-specific window closes.
- Dexios counterattacks for 5 damage after every Meteor Rain perfect parry.
- Furai counterattacks once for 20 damage after all five meteors only if every meteor targeting him was perfectly parried and he was targeted at least once.
- Sahira blocks any meteor with a correct W input during the full 1.2-second standard window or 1.8-second tutorial window, without a perfect-parry result.
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

### A.2 Combat interface and target selection

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

### A.3 Battlefield, sprite, and HUD corrections

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
### A.4 Offensive action commands

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

### A.5 Character introduction screens

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

### A.6 Heir Mode and boss transformations

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

### A.7 Tutorial combat, healing, and mode configuration

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

Incoming-attack defensive windows and their projectile travel also receive a shared 1.5 multiplier in every mode. Tutorial defensive windows and incoming projectile travel therefore use a combined 2.25 multiplier; do not apply the shared multiplier to unrelated combat or action-command durations.

### Formula

```javascript
tutorialDuration = originalDuration * 1.5;
```

The original combat scene retains its existing non-window timing values and action-command timings.

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

The tutorial multiplier applies to all normal and Heir boss attacks. In addition, the shared incoming-window multiplier applies to their defensive windows and projectile travel in every mode.

### Example — Lightning Chain

If the existing attack wind-up is 0.187 seconds:

Tutorial wind-up:

0.2805 seconds.

If base projectile travel is 0.373 seconds:

Tutorial travel:

0.83925 seconds (0.373 × 1.5 shared window scale × 1.5 tutorial scale).

The complete attack sequence must remain synchronized.

### Example — Watch the Thunder

Normal casting duration:

0.6 seconds.

Tutorial casting duration:

0.9 seconds.

Base jump window:

0.3 seconds.

Standard jump window:

0.45 seconds.

Tutorial jump window:

0.675 seconds.

The same modifier must apply independently to both sweeps in Heir Mode.

### Example — Meteor Rain

If a meteor's base travel is 0.7 seconds:

Tutorial travel duration:

1.575 seconds.

Keep meteors strictly sequential.

## 4.2. Defensive Timing Windows

Scale every timing-window boundary consistently relative to the intended impact moment.

For example:

Base values:

- Normal block: T−0.5 to T−0.1.
- Perfect Parry: T−0.1 to T+0.1.

Standard combat (1.5 shared scale):

- Normal block: T−0.75 to T−0.15.
- Perfect Parry: T−0.15 to T+0.15.

Tutorial combat (2.25 combined scale):

- Normal block: T−1.125 to T−0.225.
- Perfect Parry: T−0.225 to T+0.225.

The resulting windows are 1.5 times longer in standard combat and 2.25 times longer in tutorial combat, compared with the base values.

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

Apply the shared incoming-window multiplier once and the tutorial timing multiplier once. Their combined 2.25 scale applies only to incoming defensive windows and projectile travel.

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

The tutorial 1.5 multiplier applies to combat timings and timing challenges. The shared incoming-window multiplier applies only to incoming defensive windows and projectile travel in every mode.

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
14. Incoming defense windows and projectile travel use a 1.5 shared multiplier in standard combat and a 2.25 combined multiplier in tutorial combat; impact, indicators, and resolution remain synchronized.
15. Tutorial preparation durations remain 1.5 times longer; the shared incoming-window multiplier does not alter preparation phases.
16. Offensive action commands allow 1.5 times the original duration.
17. Moving timing indicators remain synchronized with their input windows.
18. Perfect-Parry behavior remains unchanged.
19. The original combat scene retains its normal non-window timing and damage; incoming defense windows and projectile travel use the shared 1.5 multiplier.
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

### A.8 Tutorial pop-ups

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

# LA DEXÍADA — NARRATIVE BATTLE IMPLEMENTATION

### A.9 Narrative battle, dialogue, and cinematics

## 1. OBJECTIVE

Implement a narrative version of the existing functional Phaser combat encounter.

Reuse the existing combat engine, boss phases, abilities, action commands, HUD, animations, and turn system. Do not rebuild combat or modify the normal battle or tutorial scenes.

The narrative battle adds dialogue, cinematic events, music transitions, and scripted battle progression.

**ALL dialogue text must be in English. Use the English lines provided below exactly.**

Preserve the existing combat mechanics and update `DESIGN.md` after implementation.

## 2. DIALOGUE PRESENTATION

Follow the supplied dialogue UI reference image.

Whenever dialogue appears:

- Keep the battlefield background visible beneath a translucent black overlay.
- Display large character portraits, emphasizing the active speaker.
- Display a dialogue box near the bottom with the speaker's name and text.
- Use Archeologicaps for character names and the existing lowercase-capable font for dialogue.
- Advance dialogue with Enter.
- Pause combat, timers, projectiles, damage resolution, action commands, and turn progression.
- Block gameplay inputs while dialogue is active.
- Prevent a single Enter press from advancing multiple lines.

Use a reusable dialogue manager and a sequential cinematic-event queue. Avoid overlapping dialogue windows.

## 3. OPENING SEQUENCE

Initially, display only the temple background.

No playable characters, bosses, combat HUD, or turn-order icons should be visible.

Display these dialogues in order:

| Speaker | Sprite | Dialogue |
|---|---|---|
| Hazel | `hazel_dialogo_feliz` | Your Majesty Kosmelys, thank you so much for training me these past few days. Now that my team has arrived, it's time for me to leave. |
| Kosmelys | `kosmelys_dialogo_feliz` | The honor was mine, little Hazel. You have great potential, but what impressed me most was your discipline and passion. I hope we meet again soon. We'll continue with the plan here. |
| Kosmelys | `kosmelys_dialogo_feliz` | Iobrontes is out on patrol. I'll let him know you said goodbye, my loyal friends. |

### Red Chaos Wave

After the third dialogue:

1. Close the dialogue window.
2. Display a red chaotic shockwave traveling from left to right.
3. Add a brief screen distortion and subtle camera shake.
4. Include a short dramatic silence before the next dialogue.

Use Phaser effects or existing assets. Do not generate new artwork.

### Dialogue After the Chaos Wave

| Speaker | Sprite | Dialogue |
|---|---|---|
| Sahira | `sahira_dialogo_confundida` | Something's wrong. Helíocles' waves have dissipated. |
| Hazel | `hazel_dialogo_preocupada` | Hmm... Kosmelys? |
| Kosmelys | `kosmelys_dialogo_cabizbaja` | … |
| Furai | `furai_dialogo_engarde` | Something seems to have affected the Sun Banner. Prepare for the worst! |
| Kosmelys | `kosmelys_dialogo_caotica` | What's wrong? Don't you want to be part of Xantharchía's golden age? |
| Dexios | `dexios_dialogo_engarde` | To your positions! |

Pause briefly on Kosmelys's silence.

Use a subtle dark flash when her expression changes to the corrupted smile.

## 4. FIRST BATTLE PHASE — KOSMELYS ALONE

After Dexios's final line:

- Close the dialogue interface.
- Show all four playable characters.
- Spawn Kosmelys at 450 HP.
- Begin the existing combat system.
- Start `cosmic_strike.mp3`.
- Keep Iobrontes absent.

Until his arrival, Iobrontes must have no visible sprite, HUD, active turns, or targeting availability.

Treat him as NOT YET ARRIVED, not DEFEATED.

Preserve Kosmelys's existing abilities, attack probabilities, and Normal/Heir mechanics.

## 5. IOBRONTES ARRIVAL TRIGGER

When Kosmelys's HP first becomes **strictly less than 150**, finish the current ability and pause combat.

Play `trueno.mp3` as distant thunder.

Then display:

| Speaker | Sprite | Dialogue |
|---|---|---|
| Dexios | `dexios_dialogo_molesto` | Damn it! He's realized we're here. We can't give up. We're getting out of this! |
| Furai | `furai_dialogo_expectativa` | Your call, man! |

Trigger this event only once.

If a powerful attack reduces Kosmelys directly from above 150 HP to zero, prioritize Iobrontes's arrival and queue Kosmelys's pending Heir transformation afterward.

## 6. IOBRONTES'S TRIUMPHANT ENTRANCE

This sequence uses cinematic images, NOT dialogue portraits.

After Furai's line:

1. Close the dialogue UI.
2. Start `watch_the_thunder.mp3`, replacing `cosmic_strike.mp3`.
3. Display `iobrontes_llegada1` over the battlefield.
4. Synchronize `trueno.mp3` and a brief, powerful camera shake with his landing.
5. Hold this image for exactly **3 seconds**.
6. Replace it with `iobrontes_llegada2`.
7. Hold the second image for exactly **3 seconds**.
8. Remove the cinematic overlay.

The images advance automatically, without Enter.

Combat remains paused throughout the cinematic.

Preserve the images' aspect ratios and avoid cropping important details.

### Post-Entrance Dialogue

| Speaker | Sprite | Dialogue |
|---|---|---|
| Iobrontes | `iobrontes_dialogo_feliz` | Did you think you'd have all the fun without me? |
| Sahira | `sahira_dialogo_molesta` | We can handle this. Our wills shall not yield! |

After the dialogue:

- Spawn Iobrontes with 550 HP.
- Enable his HUD, targeting, and scheduled turns.
- Preserve Kosmelys's remaining HP.
- Preserve all player HP, resources, and statuses.
- Continue the dual-boss battle without restarting it.

### Music

Starting with Iobrontes's entrance, alternate entire tracks:

`watch_the_thunder.mp3` → `cosmic_strike.mp3` → repeat.

Play each track fully before starting the next.

Do not overlap tracks or loop either song individually.

Preserve existing victory music behavior.

## 7. HEIR TRANSFORMATION DIALOGUES

The existing Heir Mode system is already functional.

Do not reimplement it.

Integrate the following dialogue and cinematic events into its current transformation flow.

### Kosmelys — First HP Depletion

Sprite: `kosmelys_dialogo_herida`

Dialogue:

"I underestimated you. It's time for you to witness the true power of the HEIR OF SPACE!"

After Enter:

1. Display `kosmelys_heredera_transformacion` as a foreground cinematic for **3 seconds**.
2. Execute her existing Heir transformation exactly once.
3. Restore her HP to 450.
4. Activate the existing Heir sprites and attacks.
5. Change her displayed title to exactly:

**KOSMELYS, HEIR OF SPACE**

6. Resume combat.

### Iobrontes — First HP Depletion

Sprite: `iobrontes_dialogo_herido`

Dialogue:

"Huh, the fun is only just beginning. HEIR OF THUNDER!"

After Enter:

1. Display `iobrontes_heredero_transformacion` for **3 seconds**.
2. Execute his existing Heir transformation exactly once.
3. Restore his HP to 550.
4. Activate the existing Heir sprites and attacks.
5. Change his displayed title to exactly:

**IOBRONTES, HEIR OF THUNDER**

6. Resume combat.

Both transformations must remain independent.

Update the titles in the boss HUD and other existing title displays.

## 8. FINAL BOSS DEFEAT DIALOGUES

These events can occur in either order, depending on which boss the player defeats first.

### Kosmelys — Permanent Defeat

Sprite: `kosmelys_heredera_dialogo_herida`

Dialogue:

"I'm sorry, Bas. The… golden… age…"

Then display:

Speaker: Hazel  
Sprite: `hazel_dialogo_triste`

"I'm sorry, Master."

After Hazel's dialogue, pause briefly and fade Kosmelys out of the battlefield.

Disable her future turns and continue combat against Iobrontes if he remains active.

### Iobrontes — Permanent Defeat

Sprite: `iobrontes_heredero_dialogo_herido`

Dialogue:

"El, forgive me. I wasn't… strong… enough…"

After this dialogue, pause briefly and fade Iobrontes out of the battlefield.

Disable his future turns and continue combat against Kosmelys if she remains active.

Do not trigger victory before all pending boss-defeat dialogues and exit animations are complete.

## 9. SPECIAL EVENT — BOTH BOSSES ENTER HEIR MODE

When BOTH bosses have entered Heir Mode, trigger this event exactly once.

Pause combat and display:

Speaker: Dexios  
Sprite: `dexios_dialogo_planta`

Dialogue:

"Hey, I made some potions using dittany. Here, take them, and let's win this!"

After Enter:

- Revive every incapacitated playable character.
- Restore all four characters to 100% Health.
- Restore Mana to maximum for characters who use Mana.
- Restore their active battlefield sprites and targeting eligibility.
- Update their HUD.
- Resume the existing turn sequence.

Do not reset Spirit, Chaos Energy, limited-use abilities, shields, or other resources that are not Health or Mana.

This is an automatic narrative event, not an inventory item.

Trigger it after the second Heir transformation finishes, before the next combat action.

## 10. FINAL VICTORY DIALOGUE

When both gods have been permanently defeated and their exit sequences are complete, show:

Speaker: Dexios  
Sprite: `dexios_dialogo_cansado`

Dialogue:

"At last, it's over."

After Enter, transition to the existing victory screen and victory music.

## 11. SCRIPTED EVENT SAFETY

Implement a centralized narrative-event queue.

Required event handling:

1. Finish the active combat ability safely.
2. Process Iobrontes's arrival when the HP threshold is crossed.
3. Process pending Heir transformation dialogue and cinematic events.
4. Trigger the dittany potion event once both transformations are complete.
5. Process final defeat dialogues and boss exits.
6. Trigger Dexios's final line once both bosses are permanently defeated.
7. Resume combat only when no narrative event is pending.

Each event must trigger once.

If multiple events become eligible after the same ability, queue them rather than overwriting them.

During dialogue and cinematics:

- Pause combat timers, damage, AI, and turn advancement.
- Block gameplay inputs.
- Prevent duplicate transformations and duplicated HP restoration.
- Keep dialogue UI above the battlefield.
- Restore the camera and HUD afterward.
- Clean up temporary tweens, overlays, sounds, and input listeners.

## 12. ASSET REGISTRATION

Register the supplied assets using their exact filenames and extensions.

### Cinematics

- `iobrontes_llegada1`
- `iobrontes_llegada2`
- `iobrontes_heredero_transformacion`
- `kosmelys_heredera_transformacion`

### Dexios

- `dexios_dialogo_planta`
- `dexios_dialogo_cansado`
- `dexios_dialogo_molesto`
- `dexios_dialogo_engarde`

### Furai

- `furai_dialogo_expectativa`
- `furai_dialogo_engarde`

### Sahira

- `sahira_dialogo_confundida`
- `sahira_dialogo_molesta`

### Hazel

- `hazel_dialogo_feliz`
- `hazel_dialogo_triste`
- `hazel_dialogo_preocupada`

### Kosmelys

- `kosmelys_dialogo_feliz`
- `kosmelys_dialogo_cabizbaja`
- `kosmelys_dialogo_caotica`
- `kosmelys_dialogo_herida`
- `kosmelys_heredera_dialogo_herida`

### Iobrontes

- `iobrontes_dialogo_feliz`
- `iobrontes_dialogo_herido`
- `iobrontes_heredero_dialogo_herido`

For Kosmelys's initial patrol dialogue, reuse `kosmelys_dialogo_feliz`.

For Dexios's final lowered-head dialogue, use `dexios_dialogo_cansado`.

Do not generate missing artwork.

## 13. IMPLEMENTATION ORDER

1. Register the dialogue and cinematic assets.
2. Implement the reusable dialogue interface.
3. Implement the opening dialogue and chaos wave.
4. Configure the Kosmelys-only combat phase.
5. Implement the HP threshold and Iobrontes entrance.
6. Integrate Heir dialogue and transformation cinematics.
7. Integrate permanent defeat dialogue and exits.
8. Add the dittany potion recovery event.
9. Add the final victory dialogue.
10. Update `DESIGN.md` and test the production build.

## 14. ACCEPTANCE TESTS

Verify:

- All dialogue appears in English.
- The opening starts with no battlers visible.
- The red chaos wave plays at the correct moment.
- Kosmelys initially fights alone.
- Iobrontes enters once Kosmelys falls below 150 HP.
- Both entrance images remain visible for 3 seconds each.
- Thunder, camera shake, and music synchronize correctly.
- Music alternates after Iobrontes arrives.
- Both bosses transform with their correct dialogue and cinematics.
- Their titles update to HEIR OF THUNDER and HEIR OF SPACE.
- Either boss can be permanently defeated first.
- Hazel apologizes after Kosmelys's final defeat.
- The dittany event revives and heals the party when both gods enter Heir Mode.
- Dexios's final line plays before the victory screen.
- No duplicate events, damage, turn advancement, or input bugs occur.
- The normal combat and tutorial scenes remain unchanged.
- `npm run build` succeeds.

## FINAL REQUIREMENT

Implement the narrative encounter by extending the existing combat system.

Use **English for every spoken dialogue line**, including opening, mid-battle, transformation, defeat, potion, and victory dialogue.

Keep the supplied sprite filenames unchanged.

Do not rebuild existing combat systems.

## Current implementation notes

- The narrative battle is available with **N · NARRATIVE BATTLE** from the selection screen and runs as a separate instance of the standard combat scene.
- Dialogue and cinematic overlays pause combat; the encounter event queue coordinates Iobrontes's arrival, both Heir transformations, dittany recovery, defeat sequences, and final victory.
- Hazel's `hazel_dialogo_feliz`, `hazel_dialogo_triste`, and `hazel_dialogo_preocupada` portraits load from `assets/hazel/`. Iobrontes and Kosmelys dialogue portraits are aligned to the right of the dialogue window.
- Dialogue text and controls keep an inset from the panel edges, portraits sit above the panel, and Hazel's Flame Dance/Figure Shards command illustrations are trimmed to visible artwork before fitting the black action strip vertically.

Report the modified files, implemented events, missing assets, and build results.

# LA DEXÍADA — CHAPTER 1: FIRST COMBAT IMPLEMENTATION

Implement the Chapter 1 navigation structure and the first fully playable combat encounter in the existing Phaser project, using the supplied final sprites, background artwork, music, and sound effects.

**CRITICAL REQUIREMENT: CHAPTER 29 MUST REMAIN COMPLETELY UNCHANGED.**

Chapter 29 is already complete and functional. Preserve its existing scenes, combat mechanics, player and boss statistics, action commands, defensive timings, narrative events, tutorials, cinematics, animations, assets, music, sound effects, UI, and gameplay behavior.

Reuse existing combat infrastructure where appropriate, but isolate every Chapter 1-specific change through new scenes and configuration.

Do not redesign the existing game or implement unrelated features.

## 1. NEW INITIAL CHAPTER SELECTION

Create a new Phaser scene:

`scene_chapter_select`

Make it the game's initial scene.

Display two selectable chapters:

- **CHAPTER 1 — TRAINING BEYOND THE WALLS**
- **CHAPTER 29 — COSMIC RAYS**

Use the established visual identity of La Dexíada:

- Dark interface.
- Gold borders and accents.
- Archeologicaps for uppercase titles.
- The existing readable font for descriptions.
- Keyboard and mouse interaction.
- Clear selection feedback.

### Navigation

Selecting Chapter 1 opens a new Chapter 1 welcome scene.

Selecting Chapter 29 opens the **existing Chapter 29 welcome scene**, preserving its original navigation flow.

Do not rename, rebuild, or replace the Chapter 29 scenes.

Only the initial entry point should change.

## 2. CHAPTER 1 WELCOME SCENE

Create:

`scene_ch1_welcome`

Reuse the existing Chapter 29 welcome scene's format, typography, layout, transition behavior, and interaction style, without modifying the original scene.

Display:

**CHAPTER 1**

**TRAINING BEYOND THE WALLS**

For now:

- No background illustration.
- No background music.
- Simple dark background.
- No narrative dialogue yet.

Continuing opens:

`scene_ch1_select`

Keep this welcome scene entirely independent from Chapter 29.

## 3. CHAPTER 1 COMBAT SELECTOR

Create:

`scene_ch1_select`

This is a temporary encounter-testing menu. The overworld will be implemented later.

Display seven encounter entries:

1. `COMBAT 1 — WILD BOAR`
2. `COMBAT 2 — TWO WILD BOARS`
3. `COMBAT 3 — WOLF`
4. `COMBAT 4 — TWO WOLVES`
5. `COMBAT 5 — TWO FURIOUS BOARS`
6. `COMBAT 6 — MIXED ENCOUNTER`
7. `COMBAT 7 — CHAPTER BOSS`

Only **Combat 1** is currently unlocked.

All other entries must appear disabled or locked. Do not create fake battles or placeholder encounters for them.

Selecting Combat 1 launches:

`scene_ch1_combat1`

Include an option to return to `scene_chapter_select`.

Keep the encounter entries configuration-driven so the remaining six battles can be added later without restructuring the selector.

## 4. CHAPTER 1 COMBAT 1 — GENERAL SETUP

Create:

`scene_ch1_combat1`

Encounter:

**DEXIOS VS. WILD BOAR**

Only these two combatants exist in this encounter.

Reuse the existing Phaser combat systems where possible:

- Turn-based combat.
- Combat states and turn progression.
- Ability selection.
- Health and damage processing.
- Directional defense.
- Normal Block.
- Perfect Parry.
- Counterattacks.
- Cinematic attack announcements.
- Camera movement and shake.
- Sprite state changes.
- Tutorial pop-ups.
- Victory and defeat screens.

All Chapter 1-specific behavior must be configured independently from Chapter 29.

### Battlefield background

Use the supplied artwork:

`ch1_combat1_background`

This is the actual background for Combat 1.

Load the asset from its real path and extension in the project.

Display it behind all combatants and effects, covering the 1920 × 1080 game viewport while preserving its aspect ratio as appropriately as possible.

Do not use the Chapter 29 Temple of Thunder background in this encounter.

### Character composition

Because this encounter contains only one playable character and one enemy, position the combatants more centrally than in Chapter 29.

- Dexios occupies the foreground, facing the Wild Boar.
- The Wild Boar stands farther away, facing Dexios.
- Leave enough distance for physical approach animations.
- Preserve proper character scale and visual grounding.
- Use the existing 2D anime character artwork.
- Maintain the established foreground/background depth conventions.

Character positions, sprite scale, and attack destinations must be configurable.

Do not spawn Furai, Sahira, Hazel, Iobrontes, or Kosmelys.

Do not display unused character HUDs.

## 5. COMBAT STATISTICS

### Dexios

- Maximum HP: **65**
- Starting HP: **65**
- Maximum Mana: **40**
- Starting Mana: **40**
- Initial Chaos: **0 / 100**
- Available ability: **Triple Lightning only**

Do not unlock Electric Arc or Chaotic Lightning.

The Chaos system is reserved for later Chapter 1 encounters. Do not display a Chaos meter yet.

### Wild Boar

- Display name: `WILD BOAR`
- Maximum HP: **20**
- Starting HP: **20**
- Available attack: `WILD BITE`
- Unblocked damage: **6**
- Attack direction: **UP**
- Required defensive key: **W**

The Wild Boar has no additional attacks.

### Turn order

Use this fixed sequence:

**Wild Boar → Dexios → Wild Boar → Dexios → repeat**

The Wild Boar always acts first.

No initiative or Speed statistics.

A defeated combatant must not receive another turn.

## 6. COMBAT HUD AND CONTROLS

Reuse the established black-and-gold combat UI design, adapted to this smaller encounter.

### Dexios HUD

Display a compact Dexios panel in the **bottom-right corner**.

Include:

- `dexios_icono`.
- Character name.
- HP bar.
- Current and maximum HP.

Mana remains internally tracked, but a Mana bar is optional for this first encounter because Triple Lightning has no cost.

Do not display Chaos yet.

Do not display empty party slots.

### Wild Boar HUD

Display the Wild Boar's name and HP bar near the upper area of the screen.

Keep the UI compact and unobtrusive.

### Turn-order HUD

Keep the established turn-order presentation in the **top-left corner**.

Display only Wild Boar and Dexios, representing their alternating turns.

Use the Wild Boar's supplied artwork for its turn indicator if a dedicated enemy icon is unavailable.

### Ability menu

During Dexios's turn, display only:

`TRIPLE LIGHTNING`

Reuse existing keyboard and menu interaction conventions.

Do not show unavailable abilities.

### Defensive input

Only W is required for Wild Bite.

Inputs must not accidentally activate combat actions while tutorial windows or animations are active.

## 7. ASSET REGISTRATION — EXACT NAMES

Use the final assets supplied in the project.

**All sprite and asset names are lowercase.**

Inspect the existing asset directory and use each file's actual path, extension, and capitalization. Do not invent paths or assume all media files have identical extensions.

### Existing Dexios sprite assets

Reuse these existing resources:

- `dexios_base`
- `dexios_derecha`
- `dexios_izquierda`
- `dexios_arriba`
- `dexios_abajo`
- `dexios_salto`
- `dexios_herido`
- `dexios_ataque_amarillo`
- `dexios_ataque_blanco`
- `dexios_ataque_rojo`
- `dexios_icono`
- `dexios_dialogo_molesto`
- `dexios_planta`
- `dexios_ataque`

Only load resources required by this scene if the existing preload architecture supports selective loading.

Preserve all existing Chapter 29 asset registrations.

### New Wild Boar sprites

- `boar_base`
- `boar_prepare`
- `boar_attack`
- `boar_hurt`

### New Dexios attack sprites

- `dexios_triple1`
- `dexios_triple2`
- `dexios_triple3`

### New background

- `ch1_combat1_background`

### New music

- `ch1_battle`

### New Wild Boar sound effects

- `boar_prepare`
- `boar_attack`
- `boar_hurt`

### Existing Dexios sound effect

- `dexios.mp3`

Also reuse the existing Perfect Parry sound effect.

### Important: sprite/audio filename collisions

Some supplied files share the same filename stem but have different media types.

For example:

- `boar_attack` exists as a visual sprite.
- `boar_attack` also exists as an audio file.
- The same applies to `boar_prepare` and `boar_hurt`.

Preserve their original filenames.

Register them with distinct, descriptive Phaser asset keys when necessary, for example:

- Sprite: `boar_attack`
- Audio: `boar_attack_sfx`
- Sprite: `boar_prepare`
- Audio: `boar_prepare_sfx`
- Sprite: `boar_hurt`
- Audio: `boar_hurt_sfx`
- Music: `ch1_battle_music`

These are internal registration keys, not instructions to rename the physical files.

### Asset rules

- Use the final supplied artwork.
- Do not create placeholder shapes or substitute artwork.
- Do not generate temporary Wild Boar sprites.
- Preserve original sprite proportions and transparency.
- Maintain consistent scale and grounding across poses.
- Do not modify or rename existing Chapter 29 assets.

## 8. MUSIC SYSTEM

Use the supplied Chapter 1 battle music:

`ch1_battle`

### Playback behavior

When `scene_ch1_combat1` begins:

1. Start `ch1_battle` from the beginning.
2. Play it as background battle music.
3. Loop it continuously while the fight remains active.
4. Keep the music independent of the Chapter 29 music system.

The music must continue normally during combat actions, defense windows, and tutorial pop-ups.

### On victory or defeat

- Stop or smoothly fade out `ch1_battle`.
- Do not automatically play `nike.mp3` or any Chapter 29 victory music.
- Do not restart the battle music while displaying the results screen.

### On scene exit or restart

- Stop and clean up the active Chapter 1 music instance.
- Restarting Combat 1 starts a fresh instance from the beginning.
- Never create overlapping copies of `ch1_battle`.
- Returning to the encounter selector must stop the combat music.

### Other scenes

- `scene_chapter_select`: no new music required.
- `scene_ch1_welcome`: no music.
- `scene_ch1_select`: no music required.
- `scene_ch1_combat1`: `ch1_battle` plays.

Preserve the Chapter 29 music system completely.

Follow existing browser audio-unlock handling and configurable audio-volume conventions.

## 9. WILD BOAR SOUND EFFECTS

Use the supplied sound effects to make the Wild Boar's behavior clear and impactful.

### `boar_prepare`

Play **once** when the Wild Boar enters its preparation animation.

Synchronize it with:

`boar_prepare`

This sound should announce that the enemy is preparing to attack.

### `boar_attack`

Play **once** when the Wild Boar switches to its attack sprite and begins lunging toward Dexios.

Synchronize it with:

`boar_attack`

Do not replay the attack sound continuously during the two-second movement.

### `boar_hurt`

Play whenever the Wild Boar actually receives a damaging hit.

Use it for:

- Each successful Triple Lightning impact.
- Dexios's Perfect Parry counterattack.

For Triple Lightning, this sound must accompany each of the three separate hits, alongside `dexios.mp3`.

Do not play `boar_hurt` when the Wild Boar receives no damage.

### Sound behavior

- Sound effects must not interrupt or restart `ch1_battle`.
- Each event must trigger its appropriate SFX once.
- Ensure rapid repeated hits remain audible without uncontrolled layering.
- Use the existing audio manager and volume settings where possible.
- Clean up scene-specific audio listeners on shutdown.

## 10. TRIPLE LIGHTNING — DEXIOS

Triple Lightning is Dexios's only available attack in Combat 1.

### Ability statistics

- Name: `TRIPLE LIGHTNING`
- Hits: **3**
- Damage per hit: **5**
- Total base damage: **15**
- Mana cost: **0**
- No timing challenge in this encounter.

### Cinematic introduction

When the player selects Triple Lightning:

1. Lock further ability input.
2. Display the existing cinematic black horizontal attack-announcement strip.
3. Preserve its existing gold border and animation behavior.
4. Display `TRIPLE LIGHTNING`.
5. Hold the announcement for **1 second**.
6. Complete the strip's exit transition.
7. Begin the physical attack animation.

This presentation must reuse the established system without changing Chapter 29's attack announcements.

### Physical attack sequence

Dexios must visibly approach the Wild Boar before striking.

Use this exact sprite sequence:

**`dexios_triple1 → dexios_triple2 → dexios_triple3`**

#### First hit

- Display `dexios_triple1`.
- Hold the attack pose for **0.5 seconds**.
- Apply **5 damage** at the start of the hit's impact.
- Play `dexios.mp3`.
- Play `boar_hurt` SFX if damage is applied.
- Briefly display `boar_hurt`.
- Apply a small camera shake.

#### Second hit

- Display `dexios_triple2`.
- Hold the attack pose for **0.5 seconds**.
- Apply another **5 damage**.
- Play `dexios.mp3` again.
- Play `boar_hurt` SFX again if damage is applied.
- Display the Wild Boar's damage reaction.
- Apply another small camera shake.

#### Third hit

- Display `dexios_triple3`.
- Hold the attack pose for **0.5 seconds**.
- Apply the final **5 damage**.
- Play `dexios.mp3` a third time.
- Play `boar_hurt` SFX again if damage is applied.
- Display the final damage reaction.
- Apply a third small camera shake.

### Attack completion

After the third animation:

1. Dexios smoothly moves back to his original combat position.
2. Restore `dexios_base`.
3. Restore the Wild Boar's idle sprite if it remains alive.
4. Restore any temporary camera offset or zoom.
5. End the action.
6. Proceed to the next turn or victory.

### Important requirements

- Each hit must visibly connect with the enemy.
- Use three different sprites, not repeated frames.
- Damage must be applied separately for every hit.
- `dexios.mp3` must play **three times**, once per strike.
- `boar_hurt` must play on each damaging impact.
- Each hit must have a separate camera shake.
- Keep shakes subtle and comfortable for inexperienced players.
- Do not apply 15 damage simultaneously.
- Never damage a defeated target.
- If the Wild Boar reaches zero HP before the sequence finishes, complete the remaining animation safely without additional damage or hurt sounds.
- Do not start another turn until the entire sequence finishes.

Make movement distances, timing, camera intensity, and sprite scaling configurable.

## 11. WILD BOAR — WILD BITE

The Wild Boar has exactly one attack:

`WILD BITE`

This attack comes from above and must be defended with **W**.

### Attack properties

- Base damage: **6**
- Normal Block damage: **3**
- Perfect Parry damage: **0**
- Perfect Parry counterattack: **5 damage to Wild Boar**

### Full attack duration

Wild Bite consists of:

- **1 second of anticipation.**
- **2 seconds of continuous forward lunging.**
- **0.2 seconds of post-impact Perfect Parry tolerance.**

Total attack-local timeline: **3.2 seconds**.

The attack announcement occurs before this timeline begins.

### Attack timeline

| Elapsed time | Animation / movement | Defensive input |
|---|---|---|
| 0.0–1.0 s | `boar_prepare` | Ignored |
| 1.0–2.0 s | `boar_attack`, first half of lunge | Normal Block |
| 2.0–3.0 s | `boar_attack`, second half of lunge | Perfect Parry |
| 3.0 s | Visual impact on Dexios | Perfect still available |
| 3.0–3.2 s | Post-impact tolerance | Perfect Parry |
| After 3.2 s | Resolve outcome | Closed |

### Phase A — Attack announcement

At the beginning of the Wild Boar's turn:

1. Announce `WILD BITE` using the existing enemy attack-announcement system.
2. Wait for the announcement to disappear.
3. Begin the attack-local timeline at 0.0 seconds.

Do not start anticipation while the announcement is still visible.

### Phase B — Anticipation (0–1 second)

- Display `boar_prepare`.
- Move the Wild Boar slightly forward into a preparation position.
- Play `boar_prepare` SFX once.
- Hold the preparation for **1 full second**.
- Defensive inputs during this phase are ignored.

No Block or Perfect Parry can be registered during anticipation.

### Phase C — First half of lunge (1–2 seconds)

- Switch to `boar_attack`.
- Play `boar_attack` SFX once.
- Begin a continuous **two-second** movement toward Dexios.
- Activate the Normal Block window.

If the player presses W during this first second of movement, register Normal Block.

The Wild Boar must visibly advance during this period.

### Phase D — Second half of lunge (2–3 seconds)

Continue the same movement without stopping or restarting the animation.

Activate the Perfect Parry window.

If the player presses W during this second second of movement, register Perfect Parry.

The Wild Boar reaches Dexios at exactly **3 seconds** after anticipation began.

### Phase E — Post-impact grace period (3–3.2 seconds)

At 3.0 seconds:

- Register the visual collision with Dexios.
- Hold or extend the contact feedback briefly.
- Keep accepting Perfect Parry inputs for an additional **0.2 seconds**.

Do not finalize damage at visual impact.

At 3.2 seconds, close the defensive window and resolve the outcome exactly once.

### Defensive result matrix

| Result | Dexios damage received | Wild Boar damage |
|---|---|---|
| Failed Defense | 6 | 0 |
| Normal Block | 3 | 0 |
| Perfect Parry | 0 | 5 |

### Input rules

- The correct defensive key is W.
- Before the lunge, defensive inputs are ignored.
- From 1.0 to 2.0 seconds, W registers Normal Block.
- From 2.0 to 3.2 seconds, W registers Perfect Parry.
- The first directional input during the active window determines the outcome.
- Wrong directional input during the active window counts as Failed Defense.
- Repeated W presses cannot upgrade a Normal Block into Perfect Parry.
- Missing the window results in Failed Defense.
- No damage or counterattack may resolve more than once.
- Exact timing boundaries must not produce duplicate events.

### Normal Block

- Display `dexios_arriba`.
- Display `BLOCK`.
- Apply **3 damage** to Dexios.

### Perfect Parry

- Display `dexios_arriba`.
- Display `PERFECT`.
- Play the existing Perfect Parry SFX.
- Prevent all incoming damage.
- Trigger Dexios's existing counterattack behavior.
- Apply exactly **5 damage** to the Wild Boar.
- Play `boar_hurt` SFX.
- Briefly display `boar_hurt`.

If the counterattack defeats the Wild Boar, finish its visual feedback and transition to victory without granting an extra turn.

### Failed Defense

- Display `dexios_herido`.
- Display `FAIL`.
- Apply **6 damage** to Dexios.

### Return to idle

After resolving Wild Bite:

1. Complete any counterattack.
2. Return the Wild Boar to its original position if still alive.
3. Restore `boar_base`.
4. Restore Dexios's idle state.
5. Clear defensive indicators.
6. Continue to Dexios's turn if the battle has not ended.

### Timing isolation

These generous defensive windows apply exclusively to Chapter 1 Combat 1.

Do not change the existing Chapter 29 defensive windows or enemy attacks.

## 12. BEGINNER TUTORIAL WINDOWS

Reuse the existing tutorial pop-up appearance from Chapter 29 without modifying its existing text or behavior.

### Visual appearance

- Centered dark panel.
- Approximately 90% opacity.
- Gold border.
- Archeologicaps for uppercase titles.
- Readable secondary font for message text.
- Enter to advance or close.

Pause combat completely while a tutorial window is open.

All attack timers, defensive windows, combat animations, damage resolution, and turn progression must remain paused.

The background battle music may continue normally.

### Tutorial A — First Wild Boar turn

Display the following messages before the first Wild Bite announcement.

**Message 1**

Title: `WELCOME TO COMBAT`

Text:

"Combat in La Dexíada is turn-based. Characters act one at a time, following the turn order shown in the upper-left corner."

**Message 2**

Title: `DEFENDING`

Text:

"Enemies can attack from different directions. Press the matching WASD key to defend. This Wild Boar attacks from above, so press W."

**Message 3**

Title: `PERFECT PARRY`

Text:

"A normal block reduces damage, but a Perfect Parry prevents all damage and lets Dexios counterattack. Watch the enemy's movement and time your defense!"

After closing the final message:

1. Resume gameplay.
2. Announce Wild Bite.
3. Begin the full 1-second preparation and 2-second lunge.

### Tutorial B — Dexios's first turn

Display this tutorial before the first ability-selection menu.

**Message 1**

Title: `YOUR TURN`

Text:

"Now it's Dexios's turn! Select an ability to attack your enemy. Each chosen ability uses one turn."

**Message 2**

Title: `TRIPLE LIGHTNING`

Text:

"Triple Lightning strikes the enemy three times. Each hit deals 5 damage, for a total of 15. This basic ability costs no Mana."

After closing the final message, activate the ability menu.

### Tutorial safeguards

- Each tutorial sequence appears only once per encounter attempt.
- Restarting Combat 1 resets its tutorial flags.
- Enter must not accidentally select an ability while dismissing a tutorial.
- No attacks can begin while a tutorial is visible.
- No overlapping tutorial windows.
- No stale keyboard input.
- All tutorial text remains in English.
- Do not add narrative dialogue yet.
- Chapter 29's tutorial content and mechanics remain unchanged.

## 13. VICTORY AND DEFEAT

### Victory

Victory occurs when the Wild Boar reaches 0 HP.

- Finish the current damaging animation or counterattack safely.
- Stop pending enemy actions.
- Disable combat input.
- Stop or fade out `ch1_battle`.
- Display the existing victory presentation adapted for Combat 1.
- Provide `RETRY` and `RETURN TO COMBAT SELECT`.

`RETURN TO COMBAT SELECT` opens `scene_ch1_select`.

Do not play the Chapter 29 victory music.

### Defeat

Defeat occurs when Dexios reaches 0 HP.

- Stop combat progression.
- Cancel unresolved attack events safely.
- Disable combat input.
- Stop or fade out `ch1_battle`.
- Display the existing defeat presentation.
- Provide `RETRY` and `RETURN TO COMBAT SELECT`.

### Retry

Restarting Combat 1 must restore:

- Dexios HP: 65/65.
- Dexios Mana: 40/40.
- Dexios Chaos: 0/100.
- Wild Boar HP: 20/20.
- Initial turn: Wild Boar.
- Initial sprite positions.
- Initial idle frames.
- Camera position and zoom.
- Tutorial flags.
- Defensive input state.
- Attack timelines.
- Any pending animation or audio events.

Restart `ch1_battle` from the beginning.

Do not leave duplicated event listeners, overlapping music, or stale timers.

## 14. IMPLEMENTATION ARCHITECTURE

Reuse the existing combat infrastructure wherever safe.

Do not duplicate the entire Chapter 29 combat engine unnecessarily.

Prefer configurable systems and cleanly separated scene behavior.

Create independent Chapter 1 configuration for:

- Player statistics.
- Enemy statistics.
- Available abilities.
- Turn sequence.
- Sprite references.
- Battlefield layout.
- Background artwork.
- Attack movement.
- Attack animation timings.
- Defensive windows.
- Counterattack behavior.
- HUD layout.
- Tutorial messages.
- Music and sound effects.
- Victory and defeat navigation.

### Critical Chapter 29 isolation

Chapter 1 must not alter:

- Chapter 29 Dexios HP, Mana, or Chaos.
- Chapter 29 Triple Lightning.
- Chapter 29 action-command minigames.
- Chapter 29 turn order.
- Chapter 29 parry timing.
- Chapter 29 enemy damage.
- Chapter 29 tutorial multipliers.
- Chapter 29 narrative dialogue.
- Iobrontes's entrance cinematic.
- Boss Heir Modes.
- Existing sprite animation behavior.
- Existing music sequencing.
- Existing victory and defeat logic.
- Any existing playable character abilities.

If shared code must be adjusted, preserve existing Chapter 29 behavior as the default and enable Chapter 1 changes only through an explicit scene-specific configuration.

## 15. ACCEPTANCE TESTS

Verify the following before finishing.

### Navigation

1. The game starts at `scene_chapter_select`.
2. Chapter 29 opens its original welcome screen and works unchanged.
3. Chapter 1 opens `scene_ch1_welcome`.
4. The Chapter 1 welcome screen has no music or background illustration.
5. `scene_ch1_select` displays seven encounters with only Combat 1 enabled.
6. Combat 1 starts `scene_ch1_combat1`.

### Assets and audio

7. `ch1_combat1_background` displays correctly.
8. All supplied Wild Boar sprites load correctly.
9. All three Triple Lightning sprites load correctly.
10. `ch1_battle` plays and loops exclusively during Combat 1.
11. `boar_prepare` SFX plays once at the beginning of anticipation.
12. `boar_attack` SFX plays once at the beginning of the lunge.
13. `boar_hurt` SFX plays on every damaging hit against the Wild Boar.
14. `dexios.mp3` plays independently for each Triple Lightning strike.
15. Music does not overlap, restart unexpectedly, or continue after leaving the combat.

### Combat mechanics

16. Dexios starts with 65 HP.
17. The Wild Boar starts with 20 HP.
18. The Wild Boar acts first.
19. Turn order alternates Wild Boar and Dexios.
20. Dexios has only Triple Lightning available.
21. The first Wild Bite triggers the beginner defense tutorial.
22. Tutorial pop-ups pause combat correctly.
23. Wild Bite uses exactly 1 second of anticipation and 2 seconds of movement.
24. Defensive input during anticipation is ignored.
25. W during the first second of movement produces Normal Block and 3 damage.
26. W during the second second of movement produces Perfect Parry and 0 damage.
27. Perfect Parry counterattacks for 5 damage.
28. A 0.2-second grace period remains after visual impact.
29. Wrong or missing defense causes 6 damage.
30. All damage resolves exactly once.
31. Repeated inputs cannot upgrade an earlier block.
32. The first Dexios turn triggers the Triple Lightning tutorial.
33. Triple Lightning displays the cinematic black strip for 1 second.
34. Dexios physically approaches the Wild Boar.
35. The attack plays `dexios_triple1`, `dexios_triple2`, and `dexios_triple3` in order.
36. Each attack sprite lasts 0.5 seconds.
37. Each strike deals exactly 5 damage and produces a separate impact, sound, and subtle camera shake.
38. Dexios returns to his original position after attacking.
39. A Perfect Parry followed by a complete Triple Lightning can defeat the 20-HP Wild Boar.
40. Victory, defeat, retry, and return navigation all work.
41. Restarting the battle fully resets gameplay, tutorials, animations, and audio.

### Regression tests

42. Chapter 29's welcome scene remains unchanged.
43. Chapter 29 normal combat remains unchanged.
44. Chapter 29 tutorial remains unchanged.
45. Chapter 29 narrative combat and cinematics remain unchanged.
46. Existing Chapter 29 sound effects, music, attacks, stats, timings, HUD, and Heir Modes still work correctly.

## FINAL SCOPE

Implement only:

- `scene_chapter_select`
- `scene_ch1_welcome`
- `scene_ch1_select`
- `scene_ch1_combat1`
- Wild Boar combat and Wild Bite.
- Dexios's new Triple Lightning animation for Chapter 1.
- Beginner tutorial windows.
- Chapter 1 battle music and sound effects.
- Combat 1 victory, defeat, retry, and navigation.

Do not implement the overworld, additional encounters, wolves, furious boars, potions, Electric Arc, Chaotic Lightning, or the Chapter 1 boss yet.

Do not add narrative dialogues yet.

**The finished result must be a polished, beginner-friendly, fully playable first encounter with final artwork and audio, while keeping Chapter 29 completely intact.**

# LA DEXÍADA — CHAPTER 1 COMBAT 2 + GLOBAL CHAPTER 1 HOTKEYS

Extend the existing, working Phaser project by implementing Chapter 1 Combat 2 and adding consistent keyboard shortcuts throughout Chapter 1.

**IMPORTANT: The current implementation is the source of truth.** Combat 1 has already been implemented, tested, and manually adjusted. Inspect its actual source code before modifying anything. Preserve all of its current behavior, positioning, animations, UI adjustments, timings, and audio synchronization.

**CHAPTER 29 MUST REMAIN COMPLETELY UNCHANGED**, including its normal, tutorial, narrative, and practice scenes.

Do not rebuild the chapter selection, welcome screens, or Combat 1. They already exist.

## 1. KEYBOARD SHORTCUTS — CHAPTER 1

Implement these shortcuts across the Chapter 1 flow, including its welcome scene, encounter selector, Combat 1, and Combat 2.

| Key | Action |
|---|---|
| R | Restart the current scene |
| N | Toggle background music on/off |
| M | Toggle sound effects on/off |
| Escape | Return to the previous scene |

### R — Restart

Pressing R must immediately restart the current Chapter 1 scene.

In combat, this must work during:

- Player turns and ability selection.
- Enemy turns and defensive windows.
- Attack animations.
- Tutorial pop-ups.
- Target selection.
- Victory and defeat screens.

Restart the entire encounter from its initial state, including HP, Mana, enemies, turn order, tutorial flags, camera, sprites, and pending actions.

Cancel and clean up all previous timers, tweens, event listeners, attack callbacks, and combat sequences before restarting.

Prevent key-repeat events from causing multiple restarts.

Restarting a combat must not reset the user's music/SFX preferences.

### N — Toggle music

Pressing N toggles Chapter 1 background music.

- If music is playing, mute or pause it immediately.
- If music is disabled, re-enable the current scene's appropriate music.
- Use the existing audio system where possible.
- Do not create duplicate music instances.
- Music preferences must persist when restarting a Chapter 1 encounter or moving between Chapter 1 scenes.
- Muting music must not mute SFX.
- Do not start battle music on scenes that do not normally use it.
- After victory or defeat, re-enabling music must not restart an already concluded battle soundtrack.

Combat 1 and Combat 2 both use the existing `ch1_battle` track.

### M — Toggle SFX

Pressing M toggles Chapter 1 sound effects.

This includes:

- `dexios.mp3`
- `boar_prepare`
- `boar_attack`
- `boar_hurt`
- The existing Perfect Parry SFX.
- Other applicable Chapter 1 gameplay sound effects.

Muting SFX must not stop background music.

The SFX preference persists between Chapter 1 scenes and restarts.

Use the existing sound manager and avoid uncontrolled overlapping sound instances.

### Escape — Previous scene

Escape must immediately return to the previous Chapter 1 navigation scene:

- `scene_ch1_combat1` → `scene_ch1_select`
- `scene_ch1_combat2` → `scene_ch1_select`
- `scene_ch1_select` → `scene_ch1_welcome`
- `scene_ch1_welcome` → `scene_chapter_select`

On `scene_chapter_select`, Escape may do nothing because it has no parent scene.

Escape must work even during an attack, a tutorial, target selection, or a result screen.

Properly stop and clean up combat timers, animations, audio, and listeners before changing scenes.

For Chapter 1, Escape is reserved for returning to the previous scene; it must not simultaneously cancel targeting or perform another action.

### Hotkey implementation rules

Create a reusable Chapter 1 input handler or helper, rather than implementing four unrelated copies.

Each keyboard action must be processed only once per key press.

Do not register duplicate listeners after restarting or navigating between scenes.

Handle the shortcuts before normal combat input so they remain responsive during temporary input locks.

The hotkeys must not interfere with WASD defense, number-key ability selection, or Enter tutorial navigation.

Keep this implementation isolated from Chapter 29. Do not replace or alter Chapter 29's existing keyboard controls.

## 2. ENABLE COMBAT 2

Update the existing encounter selector:

`scene_ch1_select`

Enable:

`COMBAT 2 — TWO WILD BOARS`

Selecting this entry must start:

`scene_ch1_combat2`

Combat 1 remains available and unchanged.

Encounters 3–7 remain locked.

Do not recreate the selector or modify its established visual layout beyond enabling Combat 2.

## 3. CREATE SCENE_CH1_COMBAT2

Create the new scene:

`scene_ch1_combat2`

Encounter:

**DEXIOS VS. TWO WILD BOARS**

Reuse the working Combat 1 systems wherever possible, including:

- Combat scene layout.
- Dexios's statistics.
- Sprite scaling and grounding.
- Triple Lightning animation.
- Wild Bite timing.
- Directional defense.
- Perfect Parry and counterattack.
- Tutorial pop-up system.
- Combat HUD.
- Turn-order display.
- Attack-announcement strip.
- Victory and defeat screens.
- Music and SFX.
- Camera effects.

Do not overwrite or break the functional Combat 1 implementation.

Prefer reusable encounter configuration and independently managed enemy instances. Avoid unnecessarily duplicating the entire combat engine.

## 4. BATTLEFIELD AND ENEMY POSITIONS

Use the existing Chapter 1 background:

`ch1_combat1_background`

Do not create or require a new environment asset.

Display two Wild Boars standing **side by side** in the enemy area:

- **Wild Boar 1:** Left.
- **Wild Boar 2:** Right.

Both face Dexios, who remains alone in the foreground.

Position them at a similar depth and scale.

Leave sufficient horizontal separation so their silhouettes, hit reactions, and selection highlights remain individually readable.

Their positions must allow each Wild Boar to perform Wild Bite independently without colliding visually with the other enemy.

Each Wild Boar must have its own:

- Stable unique ID.
- HP and combat state.
- Sprite instance.
- Original battlefield position.
- Current animation state.
- Alive/defeated flag.
- Turn slot.
- Target-selection indicator.
- Attack animation and movement state.

Do not implement the two Wild Boars as a single shared enemy entity.

Their positions and scales must be configurable.

## 5. CHARACTER STATISTICS

### Dexios

Keep the Chapter 1 values:

- HP: **65 / 65**
- Mana: **40 / 40**
- Initial Chaos: **0 / 100**
- Only available ability: **Triple Lightning**

Do not unlock Electric Arc or Chaotic Lightning.

Keep the existing Combat 1 Dexios HUD, attack animation, and resource behavior.

### Wild Boar 1

- Unique ID: `boar_1`
- Display name: `WILD BOAR 1`
- HP: **20 / 20**
- Available attack: `WILD BITE`
- Unblocked damage: **6**

### Wild Boar 2

- Unique ID: `boar_2`
- Display name: `WILD BOAR 2`
- HP: **20 / 20**
- Available attack: `WILD BITE`
- Unblocked damage: **6**

Both Wild Boars use the same sprites, attack properties, and sound effects as the existing Combat 1 Wild Boar.

They must have independent HP, turns, animations, and damage resolution.

## 6. FIXED TURN ORDER

Use the following turn sequence:

**Wild Boar 1 → Wild Boar 2 → Dexios → repeat**

The first Wild Boar attacks first.

The second Wild Boar attacks only after the first has fully completed Wild Bite, including defensive resolution, possible counterattack, and return animation.

Dexios acts after both surviving Wild Boars have completed their scheduled turns.

### Defeated enemy behavior

When a Wild Boar reaches 0 HP:

- Mark that individual enemy as defeated.
- Stop its pending actions.
- Disable its targeting.
- Skip all its future turn slots.
- Do not transfer its turns to the surviving Wild Boar.
- Do not remove the surviving enemy's existing turn.

Example:

If Wild Boar 1 is defeated, the remaining sequence becomes:

**Wild Boar 2 → Dexios → repeat**

If Wild Boar 2 is defeated:

**Wild Boar 1 → Dexios → repeat**

Victory occurs only when **both Wild Boars have 0 HP**.

If Dexios reaches 0 HP, resolve defeat immediately after the current damaging event finishes safely. Do not continue additional enemy turns.

### Turn-order HUD

Show three entries in the top-left:

1. Wild Boar 1
2. Wild Boar 2
3. Dexios

Distinguish the two Wild Boars by position or their numeric labels, even if they use the same portrait.

Update the active-turn indicator correctly.

Skip defeated enemy turns.

Do not display unrelated Chapter 29 combatants.

## 7. NEW MECHANIC — ENEMY TARGET SELECTION

Combat 2 introduces target selection for Dexios.

This is the primary new gameplay mechanic.

### Player flow

During Dexios's turn:

1. Display his existing ability menu.
2. The only available ability is `TRIPLE LIGHTNING`.
3. When Triple Lightning is selected, open a target-selection interface.
4. Show both living Wild Boars as available targets.
5. Wait for the player to select one of them.
6. Confirm the target.
7. Show the existing Triple Lightning cinematic introduction.
8. Execute the complete Triple Lightning sequence against the selected Wild Boar only.
9. Finish the attack and proceed to the next scheduled turn.

### Selection controls

Use the established target-selection conventions from the project.

Support:

- Press **1** to target Wild Boar 1 (left).
- Press **2** to target Wild Boar 2 (right).
- Clicking a living Wild Boar or its target-selection UI entry.

Clearly highlight the currently selected or hovered enemy.

Use a readable visual indicator such as a gold outline, selection marker, or existing target-selection highlight.

Do not allow selection of a defeated Wild Boar.

Do not attack automatically before the target has been confirmed while both enemies remain alive.

### When only one Wild Boar remains

If there is only one living enemy, automatically select that enemy when Triple Lightning is chosen.

Do not require an unnecessary target-selection step when there is no meaningful choice.

### Important targeting behavior

The selected target remains fixed for the entire Triple Lightning action.

Do not redirect later strikes to the other Wild Boar.

Each attack must reference the selected enemy's unique ID, not an ambiguous shared sprite or enemy index that may change when one enemy dies.

Clear target-selection indicators after confirmation or battle termination.

Prevent overlapping target menus, double confirmation, or execution of multiple attacks from one selection.

## 8. TRIPLE LIGHTNING — TWO-ENEMY COMPATIBILITY

Preserve the existing, fully functional Combat 1 Triple Lightning implementation.

Do not redesign its current movement, presentation, or audio synchronization.

The attack still uses:

`dexios_triple1 → dexios_triple2 → dexios_triple3`

Properties:

- Three hits.
- **5 damage per hit.**
- **15 total possible damage.**
- No Mana cost.
- No timed action command.
- Existing cinematic black announcement strip.
- Existing physical approach toward the target.
- Existing hit reactions and small camera shakes.
- `dexios.mp3` on each strike.
- `boar_hurt` SFX on each damaging impact.

### Changes required for Combat 2

Dexios must approach the **selected Wild Boar**, whether it is on the left or right.

Calculate the attack destination relative to the chosen enemy's position.

Do not always move toward Wild Boar 1 or the center of the enemy formation.

Only the selected target:

- Receives damage.
- Displays `boar_hurt`.
- Plays its hurt sound.
- Updates its HP bar.

The other Wild Boar remains idle and does not receive damage.

If the selected Wild Boar reaches 0 HP before all three hits finish, complete the animation safely without damaging the defeated enemy or automatically transferring the remaining hits.

Dexios must return to his original position after the attack.

Do not change the already-tested Triple Lightning behavior in Combat 1 or Chapter 29.

## 9. WILD BITE — REUSE EXISTING MECHANICS

Each Wild Boar independently uses the exact Wild Bite mechanics already implemented in Combat 1.

**Do not redesign or retune the working attack.**

Retain the following intended configuration:

- 1 second of anticipation.
- 2 seconds of forward movement toward Dexios.
- First second of movement: Normal Block window.
- Second second of movement: Perfect Parry window.
- 0.2-second Perfect Parry tolerance after visual impact.
- Required key: W.

### Defensive outcomes

| Result | Damage to Dexios | Counterattack |
|---|---|---|
| Failed Defense | 6 | 0 |
| Normal Block | 3 | 0 |
| Perfect Parry | 0 | 5 to the attacking Wild Boar |

Use the exact current Combat 1 behavior for:

- `boar_prepare`
- `boar_attack`
- `boar_base`
- `dexios_arriba`
- `dexios_herido`
- BLOCK / PERFECT / FAIL feedback.
- Camera movement and restoration.
- Attack sounds.
- Defensive input registration.
- Damage resolution.

### Independent attacker identification

When Wild Boar 1 attacks, Dexios's Perfect Parry must damage **Wild Boar 1**.

When Wild Boar 2 attacks, the counterattack must damage **Wild Boar 2**.

Never apply a counterattack to the wrong enemy.

Each boar's lunge must begin from its own original position and return there after the action.

Only one Wild Bite animation and defensive window may be active at a time.

If a Perfect Parry defeats the attacking Wild Boar, complete the counterattack animation and proceed to the next valid turn or victory.

## 10. ENEMY HUD AND DAMAGE FEEDBACK

Display independent enemy health indicators.

- Wild Boar 1: 20/20 HP.
- Wild Boar 2: 20/20 HP.

Both health bars must update independently.

The active enemy and selected enemy must be visually distinguishable.

Maintain a readable layout without covering the characters or attack effects.

When one Wild Boar is defeated, its health bar should show 0 HP or transition to the established defeated appearance, while the surviving Wild Boar remains clearly visible.

Do not hide the surviving Wild Boar's HUD.

When a Wild Boar receives a hit, only its own sprite displays `boar_hurt`.

## 11. NEW BEGINNER TUTORIAL — TARGET SELECTION

Combat 2 teaches the player to select between multiple enemies.

Reuse the Chapter 1 tutorial window style:

- Dark background with approximately 90% opacity.
- Gold border.
- Archeologicaps uppercase title.
- Readable body text.
- Enter to advance.
- Combat paused while the tutorial is visible.

Display this tutorial **once**, the first time Dexios selects Triple Lightning while both Wild Boars are alive, immediately before the target-selection interface becomes interactive.

### Tutorial text

**Title: `CHOOSING A TARGET`**

"Some battles have more than one enemy. After selecting an ability, choose which enemy to attack. Press 1 for the Wild Boar on the left or 2 for the one on the right. You can also click an enemy to select it."

After pressing Enter:

- Close the tutorial.
- Activate target selection.
- Do not automatically attack.
- Do not allow the Enter key that closed the tutorial to confirm a target.

### Tutorial rules

- Show the new tutorial only once per Combat 2 attempt.
- Reset it when Combat 2 restarts.
- Do not repeat Combat 1's basic turn and defense tutorials unnecessarily.
- Do not change the existing Combat 1 tutorial.
- Do not change Chapter 29 tutorial behavior.
- R and Escape must remain functional while the tutorial is open.

All player-facing text must be in English.

## 12. ASSETS, MUSIC, AND SOUND EFFECTS

Reuse all existing Chapter 1 assets. No new artwork or audio is required for Combat 2.

### Background

`ch1_combat1_background`

### Wild Boar sprites

- `boar_base`
- `boar_prepare`
- `boar_attack`
- `boar_hurt`

Both Wild Boars may share the same loaded textures but must use separate sprite instances.

### Dexios attack sprites

- `dexios_triple1`
- `dexios_triple2`
- `dexios_triple3`

Reuse Dexios's existing idle, defensive, damaged, and icon sprites.

### Music

`ch1_battle`

Use the same battle music as Combat 1.

- Play during Combat 2.
- Loop while the encounter is active.
- Respect the N music toggle.
- Stop or fade out on victory, defeat, restart, or scene exit as appropriate.
- Never play overlapping duplicate instances.

### SFX

Reuse:

- `boar_prepare`
- `boar_attack`
- `boar_hurt`
- `dexios.mp3`
- Existing Perfect Parry SFX.

Each boar must play its attack SFX only during its own turn.

Dexios's three strikes retain their separate sound events.

Respect the M SFX toggle.

Preserve existing sprite/audio asset-key distinctions where identical filename stems exist.

Do not rename physical assets.

## 13. VICTORY, DEFEAT, AND RETRY

### Victory

Victory requires both Wild Boars to be defeated.

Defeating only one Wild Boar must not end the combat.

Once the second Wild Boar reaches zero HP:

- Finish any active attack animation or counterattack safely.
- Prevent further enemy turns.
- Disable combat input.
- Stop battle music.
- Show the existing Chapter 1 victory interface.
- Offer Retry and Return to Combat Select.

### Defeat

Defeat occurs if Dexios reaches zero HP.

Stop the combat safely and show the existing Chapter 1 defeat interface.

Offer the same retry and return options.

### Retry

Restart Combat 2 with:

- Dexios: 65/65 HP.
- Dexios Mana: 40/40.
- Chaos: 0/100.
- Wild Boar 1: 20/20 HP.
- Wild Boar 2: 20/20 HP.
- Initial turn: Wild Boar 1.
- Both Wild Boars at their original positions.
- No active target.
- Tutorial flags reset.
- Camera restored.
- All pending timers, tweens, and previous input events cleared.

Keep the user's music and SFX toggle preferences.

## 14. SCENE ISOLATION AND CODE SAFETY

Preserve the working Chapter 1 Combat 1 exactly as it currently behaves.

Do not revert the manual fixes that have already been made to its scene.

If code must be reused, extract or extend existing working components conservatively.

The only intended changes to existing Chapter 1 scenes are:

- Enable the new hotkeys.
- Enable Combat 2 in the selector.
- Add navigation to `scene_ch1_combat2`.

Combat 2 must have its own enemy instances, battle state, tutorial flags, and encounter configuration.

Do not alter Chapter 29's:

- Scene navigation.
- Combat turn order.
- Dexios abilities.
- Defensive timing.
- Bosses and Heir Modes.
- Tutorial.
- Narrative battle.
- Music and SFX behavior.
- HUD.
- Keyboard controls.

**Do not implement the overworld, wolves, furious boars, Electric Arc, potions, or later Chapter 1 encounters yet.**

## 15. ACCEPTANCE TESTS

Verify all of the following:

1. Chapter 1 Combat 1 still behaves exactly as before, apart from the newly requested shortcuts.
2. `scene_ch1_select` allows Combat 1 and Combat 2.
3. Combats 3–7 remain locked.
4. Combat 2 displays Dexios and two distinct Wild Boars standing side by side.
5. Both Wild Boars start with 20 HP each.
6. Dexios starts with 65 HP and 40 Mana.
7. The turn order is Wild Boar 1 → Wild Boar 2 → Dexios.
8. Each Wild Boar uses Wild Bite independently.
9. Wild Bite retains its existing preparation, movement, defense timing, damage, SFX, and animation behavior.
10. A Perfect Parry always counterattacks the Wild Boar that actually attacked.
11. On Dexios's turn, selecting Triple Lightning opens target selection while two enemies are alive.
12. Pressing 1 selects the left Wild Boar; pressing 2 selects the right Wild Boar.
13. Mouse selection works.
14. The selected Wild Boar receives the three separate Triple Lightning hits.
15. The unselected Wild Boar receives no damage or hurt effects.
16. Dexios approaches the correct target and returns to his original position.
17. Defeating one Wild Boar skips only that enemy's future turns.
18. With one enemy alive, target selection defaults to the surviving enemy.
19. Victory occurs only when both Wild Boars are defeated.
20. The target-selection tutorial appears once and correctly pauses combat.
21. R immediately restarts the active Chapter 1 scene, even during an attack or tutorial.
22. N toggles only music; M toggles only SFX.
23. Audio preferences persist across Chapter 1 scene transitions and restarts.
24. Escape always returns to the previous Chapter 1 scene.
25. No duplicate event handlers, audio tracks, damage events, or overlapping attack sequences.
26. Chapter 29's normal, tutorial, narrative, and practice scenes still work unchanged.
27. The project builds successfully using its existing build command.

After implementing, report the files modified, the new scene registered, any unresolved issues, and the build/test results.

**FINAL OBJECTIVE:** Add a beginner-friendly two-enemy battle that teaches target selection, using the existing functional Chapter 1 combat system, while introducing reliable Chapter 1 shortcuts and preserving Chapter 29 entirely.

# LA DEXÍADA — CHAPTER 1: COMBAT 3 — WOLF

Implement Chapter 1 Combat 3 in the existing Phaser project, using the new wolf sprites and sound effects.

**CRITICAL: Preserve the current working implementation.** Combats 1 and 2 already function correctly and have received manual adjustments. Inspect their actual source code and reuse the existing mechanics without overwriting those adjustments.

**Chapter 29 must remain completely unchanged**, including normal combat, tutorial, narrative mode, practice scenes, animations, music, controls, statistics, and timings.

The current working code takes precedence over older implementation notes in DESIGN.md. This task introduces only the new encounter and its lateral-defense tutorial.

## 1. ENABLE COMBAT 3

In the existing `scene_ch1_select`, unlock:

`COMBAT 3 — WOLF`

Selecting it must launch:

`scene_ch1_combat3`

Keep Combats 1 and 2 fully functional and selectable. Combats 4–7 remain locked.

Preserve the existing selector's appearance, navigation, fonts, spacing, and interaction behavior.

## 2. COMBAT 3 SETUP

Create:

`scene_ch1_combat3`

Encounter:

**DEXIOS VS. ONE WOLF**

Reuse the existing Chapter 1 combat infrastructure.

### Battlefield

Use the existing:

`ch1_combat1_background`

Only Dexios and one Wolf are visible.

- Dexios stands in his existing Chapter 1 foreground position.
- The Wolf initially stands in the enemy area, facing Dexios.
- Maintain the existing character-grounding and sprite-scaling conventions.
- Leave enough space on both sides of Dexios for the Wolf to approach from either direction.
- Keep the camera, HUD, combat effects, and presentation consistent with Combats 1 and 2.

Do not spawn any other enemies or party members.

### Dexios statistics

- HP: **65/65**
- Mana: **40/40**
- Chaos: **0/100**, hidden as in the earlier Chapter 1 encounters.
- Available ability: **Triple Lightning only**.

Do not unlock Electric Arc or Chaotic Lightning.

### Wolf statistics

- Display name: `WOLF`
- HP: **35/35**
- Attack: `WOLF LUNGE`
- Unblocked damage: **10**
- Normal Block damage: **5**
- Perfect Parry damage: **0**
- Dexios Perfect Parry counterattack: **5 damage to Wolf**

The Wolf has exactly one attack, which can originate from either lateral direction.

### Fixed turn order

**Wolf → Dexios → Wolf → Dexios → repeat**

The Wolf always acts first.

No Speed or initiative calculations.

Victory occurs when the Wolf reaches 0 HP. Defeat occurs when Dexios reaches 0 HP.

## 3. EXACT WOLF SPRITE NAMES

Register and use the supplied final sprites:

- `wolf_base`
- `wolf_prepare_left`
- `wolf_prepare_right`
- `wolf_attack_left`
- `wolf_attack_right`
- `wolf_hurt`

Use the existing asset-directory conventions, actual extensions, and original filenames.

These are the correct names. Do not substitute nonexistent generic visual frames such as `wolf_prepare` or `wolf_attack`.

### Sprite meanings

**wolf_base:** Normal idle stance.

**wolf_prepare_left:** Preparation pose when attacking Dexios from his left side.

**wolf_prepare_right:** Preparation pose when attacking Dexios from his right side.

**wolf_attack_left:** Lunging attack arriving from Dexios's left.

**wolf_attack_right:** Lunging attack arriving from Dexios's right.

**wolf_hurt:** Reaction when the Wolf takes damage from Triple Lightning or Dexios's counterattack.

Use the actual supplied left/right artwork. Do not unnecessarily flip the sprites horizontally.

The wolf's sprite orientation must match its physical attack direction.

## 4. WOLF AUDIO ASSETS

Use the supplied audio files:

- `wolf_prepare`
- `wolf_attack`
- `wolf_hurt`

These are **sound effects**, distinct from the directional visual sprites.

Register audio using separate Phaser keys when appropriate:

- `wolf_prepare_sfx`
- `wolf_attack_sfx`
- `wolf_hurt_sfx`

The registered key names may follow the existing audio manager, but the physical asset filenames must not be changed.

### Audio triggers

**wolf_prepare SFX**

Play once when the Wolf enters its anticipation pose.

Use the same sound for left and right anticipation.

**wolf_attack SFX**

Play once when the Wolf begins its two-second lunge.

Use the same sound for both attack directions.

**wolf_hurt SFX**

Play when the Wolf receives actual damage:

- Each damaging Triple Lightning impact.
- Each successful Perfect Parry counterattack.

Do not play the hurt sound when no damage is received.

### Existing audio to reuse

- Battle music: `ch1_battle`
- Dexios attack: `dexios.mp3`, once for each Triple Lightning hit.
- Existing Perfect Parry sound effect.

Keep the existing sound volumes, audio handling, and independent music/SFX channels.

Do not create duplicate music instances.

Respect the existing Chapter 1 audio hotkeys:

- N: toggle music.
- M: toggle SFX.

## 5. WOLF LUNGE — LATERAL ATTACKS

The Wolf's only ability is:

`WOLF LUNGE`

Unlike the Wild Boar, which always attacks from above, the Wolf approaches from either the left or right.

The player must recognize the incoming direction from the Wolf's physical movement.

### Attack directions

**Attack from Dexios's left:**

- Wolf moves to the left side of Dexios.
- Uses `wolf_prepare_left`.
- Lunges using `wolf_attack_left`.
- Correct defensive key: **A**.
- Dexios uses `dexios_izquierda` when blocking.

**Attack from Dexios's right:**

- Wolf moves to the right side of Dexios.
- Uses `wolf_prepare_right`.
- Lunges using `wolf_attack_right`.
- Correct defensive key: **D**.
- Dexios uses `dexios_derecha` when blocking.

Directions are defined relative to Dexios, not the Wolf's own left/right orientation.

An attack originating from the screen-left side of Dexios must be defended with A. An attack originating from the screen-right side must be defended with D.

### Direction sequence

For this beginner encounter, use:

- First Wolf attack: **LEFT**, requiring A.
- Second Wolf attack: **RIGHT**, requiring D.
- Subsequent attacks: randomly choose LEFT or RIGHT with equal probability.

Store this behavior in encounter-specific configuration so it can be adjusted later.

This guarantees that the player experiences both lateral defenses without relying entirely on randomness.

## 6. PHYSICAL POSITIONING AND MOVEMENT

The Wolf must visibly demonstrate where its attack will originate.

### Attack preparation

At the start of its turn:

1. Choose the attack direction.
2. Move the Wolf toward the appropriate flank of Dexios.
3. Ensure this movement clearly positions the Wolf on the left or right side.
4. Announce `WOLF LUNGE` using the established enemy attack-announcement system.
5. Once the announcement has finished, begin the timed anticipation.

This preliminary flank positioning is not part of the two-second lunge or defensive timing window.

Do not start the defensive timer until the Wolf reaches its chosen attack-start position and the announcement is complete.

### Wolf movement rules

- The Wolf must remain visible during its approach.
- It must face toward Dexios.
- The direction must be visually recognizable before the attack.
- It must not teleport abruptly between sides.
- Positioning should be smooth and clearly readable.
- The attack should not pass through Dexios or overshoot its intended impact point.
- Store flank positions and movement durations in editable Chapter 1 configuration.

After attacking, return the Wolf to its original battlefield position and `wolf_base`, unless it has been defeated.

All positions and scales must respect the existing Chapter 1 rendering conventions.

## 7. WOLF LUNGE — EXACT TIMINGS

**Reuse the same timing structure already working for Wild Bite.**

The Wolf has:

- **1 second anticipation.**
- **2 seconds continuous lunge toward Dexios.**
- **0.2 seconds post-impact Perfect Parry tolerance.**

The following timeline starts after the attack announcement and flank positioning are complete.

| Time | Animation / action | Defensive input |
|---|---|---|
| 0.0–1.0 s | `wolf_prepare_left/right` | Ignored |
| 1.0–2.0 s | First second of `wolf_attack_left/right` movement | Normal Block |
| 2.0–3.0 s | Second second of movement | Perfect Parry |
| 3.0 s | Wolf visually reaches Dexios | Perfect still valid |
| 3.0–3.2 s | Post-impact grace period | Perfect Parry |
| After 3.2 s | Resolve defense once | Closed |

### Anticipation: 0–1 second

- Display the appropriate `wolf_prepare_left` or `wolf_prepare_right`.
- Play `wolf_prepare` SFX once.
- The Wolf visibly prepares to leap.
- Ignore defensive inputs during this stage.

### Normal Block: 1–2 seconds

- Switch to the appropriate `wolf_attack_left` or `wolf_attack_right`.
- Play `wolf_attack` SFX once.
- Begin the two-second forward lunge.
- Accept the correct directional key for Normal Block.

The Wolf must physically advance during this entire period.

### Perfect Parry: 2–3 seconds

- Continue the same lunge without restarting it.
- Accept the correct directional key for Perfect Parry.
- The Wolf reaches Dexios at exactly 3.0 seconds.

### Post-impact tolerance: 3–3.2 seconds

- Display the visual contact at 3.0 seconds.
- Continue accepting Perfect Parry inputs for another 0.2 seconds.
- Do not finalize damage before the grace period closes.
- Resolve the defensive outcome exactly once at the end.

### Defensive results

| Outcome | Dexios damage | Wolf damage |
|---|---|---|
| Failed Defense | 10 | 0 |
| Normal Block | 5 | 0 |
| Perfect Parry | 0 | 5 |

### Input rules

- Attack from left: A is correct.
- Attack from right: D is correct.
- W and S are incorrect for Wolf Lunge.
- Ignore inputs during anticipation.
- Only the first directional input during the active defense window counts.
- Incorrect directions produce Failed Defense.
- Repeated inputs cannot upgrade Normal Block to Perfect Parry.
- A valid Perfect Parry prevents all damage.
- Missing the defensive window causes full damage.
- Never apply damage or a counterattack more than once.

### Defensive feedback

**Normal Block**

- Use `dexios_izquierda` or `dexios_derecha`, matching the attack side.
- Display `BLOCK`.
- Apply 5 damage to Dexios.

**Perfect Parry**

- Use the correct directional defense sprite.
- Display `PERFECT`.
- Play the existing Perfect Parry SFX.
- Apply 0 damage to Dexios.
- Execute Dexios's existing counterattack.
- Deal exactly 5 damage to the Wolf.
- Display `wolf_hurt` and play its hurt SFX.

**Failed Defense**

- Display `FAIL`.
- Use `dexios_herido`.
- Apply 10 damage to Dexios.

Use the existing Chapter 1 defensive indicator and visual-feedback system. Adapt the warning direction and displayed keys to the selected flank.

## 8. NEW TUTORIAL — LEFT AND RIGHT DEFENSE

Combat 3 introduces lateral directional defense.

Use the existing Chapter 1 tutorial pop-up system.

Preserve its styling:

- Centered dark panel.
- Approximately 90% opacity.
- Gold border.
- Archeologicaps titles.
- Readable descriptive text.
- Enter to advance.
- Entire combat paused while the window is visible.

### Tutorial timing

Show this tutorial once, immediately before the first Wolf attack begins.

The Wolf must not reposition, attack, or advance its timers while the tutorial is visible.

### Message 1

Title:

`SIDE ATTACKS`

Text:

"Some enemies attack from the sides instead of above. Watch where the enemy moves before striking. Press A to defend against attacks from Dexios's left, or D to defend against attacks from his right."

### Message 2

Title:

`TIMING YOUR DEFENSE`

Text:

"Press the correct key early during the enemy's approach to block and reduce damage. Wait until the enemy gets closer for a Perfect Parry, which prevents all damage and lets Dexios counterattack!"

After the second message:

1. Close the tutorial.
2. Resume the encounter.
3. Start the Wolf's first LEFT attack normally.
4. Let the player practice defending with A.

The Wolf's second attack must come from the RIGHT so the player practices D.

Do not repeat the tutorial on the second attack.

### Tutorial safeguards

- Display this tutorial only once per attempt.
- Reset the tutorial flag when Combat 3 restarts.
- Do not repeat the introductory turn-based tutorial from Combat 1.
- Do not repeat the target-selection tutorial from Combat 2.
- Enter must not trigger a combat action after dismissing the tutorial.
- No attack timers advance while reading.
- R and Escape remain functional during tutorial windows.
- Keep all text in English.

Do not add narrative dialogue yet.

## 9. DEXIOS — TRIPLE LIGHTNING

Reuse the existing Chapter 1 Triple Lightning implementation without changing its animation or timing.

### Properties

- Three separate hits.
- 5 damage per hit.
- Maximum total: 15.
- No Mana cost.
- No action-command minigame.

### Visual sequence

1. Player selects Triple Lightning.
2. Show the established cinematic black announcement strip.
3. Dexios physically approaches the Wolf.
4. Display `dexios_triple1` for 0.5 seconds and apply the first 5 damage.
5. Display `dexios_triple2` for 0.5 seconds and apply the second 5 damage.
6. Display `dexios_triple3` for 0.5 seconds and apply the third 5 damage.
7. Dexios returns to his original position and idle sprite.

For each successful hit:

- Play `dexios.mp3`.
- Play `wolf_hurt` SFX.
- Briefly display the `wolf_hurt` sprite.
- Update the Wolf's HP.
- Apply the existing subtle camera shake.

The Wolf must be the only damaged target.

If the Wolf reaches zero HP before the three-hit sequence finishes, complete the animation safely without further damage.

Do not introduce Electric Arc yet.

No target-selection interface is necessary because there is only one enemy.

## 10. COMBAT HUD AND TURN ORDER

Preserve the existing Chapter 1 HUD design.

### Dexios

Keep the established compact panel in the bottom-right corner, displaying his icon and HP.

### Wolf

Display:

`WOLF`

Its independent health bar starts at 35/35 and updates when damaged.

### Turn-order panel

Display only:

**Wolf → Dexios → repeat**

Use `wolf_base` as the turn-order portrait if a separate icon is not provided.

Preserve the existing highlight and turn-transition behavior.

## 11. MUSIC, HOTKEYS, AND NAVIGATION

Reuse the existing Chapter 1 music:

`ch1_battle`

- Start it when Combat 3 begins.
- Loop it while the battle is active.
- Stop or fade it on victory, defeat, or scene exit.
- Do not create overlapping music instances.
- Respect the existing music mute state.

Keep the existing Chapter 1 keyboard shortcuts:

| Key | Function |
|---|---|
| R | Restart Combat 3 |
| N | Toggle music |
| M | Toggle SFX |
| Escape | Return to `scene_ch1_select` |

These shortcuts must work during:

- Enemy attacks.
- Defensive windows.
- Player turns.
- Ability animations.
- Tutorial messages.
- Victory and defeat screens.

Do not reimplement the global Chapter 1 shortcuts if they are already functioning through shared utilities. Reuse them.

Restarting must preserve the current music/SFX toggle preferences.

Ensure proper cleanup of audio instances, timers, input listeners, camera effects, and tweens.

## 12. VICTORY, DEFEAT, AND RESTART

### Victory

When Wolf HP reaches zero:

- Finish the current action or counterattack safely.
- Cancel pending enemy turns.
- Stop battle music.
- Display the existing Chapter 1 victory presentation.
- Offer Retry and Return to Combat Select.

### Defeat

When Dexios reaches zero HP:

- Stop the combat safely.
- Prevent pending attacks from continuing.
- Display the existing Chapter 1 defeat presentation.
- Offer Retry and Return to Combat Select.

### Restart values

- Dexios HP: 65/65.
- Dexios Mana: 40/40.
- Dexios Chaos: 0/100.
- Wolf HP: 35/35.
- First turn: Wolf.
- First Wolf attack: LEFT.
- Second Wolf attack: RIGHT.
- Tutorial flag reset.
- Sprite positions reset.
- Camera reset.
- Timers and attack states cleared.
- Battle music restarted according to the user's current music preference.

Do not leave stale events, duplicated input listeners, or overlapping music after restarting.

## 13. IMPLEMENTATION SAFETY

Inspect the existing working Combat 1 and Combat 2 code before implementing Combat 3.

Reuse their existing systems rather than rebuilding them.

The new encounter should differ primarily through configuration:

- One Wolf enemy instead of Wild Boars.
- 35 HP.
- 10 base attack damage.
- Left/right attack selection.
- Direction-specific sprites.
- Direction-specific defensive input.
- Wolf SFX.
- New tutorial text.
- One Wolf/Dexios alternating turn order.

If shared Chapter 1 helpers require small changes, preserve their existing behavior for Combats 1 and 2.

Do not globally modify Dexios's stats or defensive timing.

**Chapter 29 must remain completely intact.**

Do not implement Combat 4, Electric Arc, two wolves, furious boars, potion crafting, overworld exploration, or Chapter 1 narrative sequences yet.

## 14. ACCEPTANCE TESTS

Verify the following before finishing:

1. Combat 3 is unlocked in `scene_ch1_select`.
2. Combats 1 and 2 still work unchanged.
3. Combats 4–7 remain locked.
4. `scene_ch1_combat3` loads successfully.
5. Only Dexios and one Wolf appear.
6. Wolf starts with 35 HP; Dexios starts with 65 HP.
7. Turn order is Wolf → Dexios.
8. The Wolf's first attack comes from the left and requires A.
9. Its second attack comes from the right and requires D.
10. Subsequent attack directions are randomized.
11. `wolf_prepare_left` and `wolf_attack_left` are used for left attacks.
12. `wolf_prepare_right` and `wolf_attack_right` are used for right attacks.
13. Wolf repositioning clearly communicates the incoming direction.
14. Anticipation lasts 1 second.
15. Lunging movement lasts 2 seconds.
16. Normal Block applies during the first second of movement.
17. Perfect Parry applies during the second second of movement.
18. The 0.2-second post-impact grace period works.
19. Normal Block deals exactly 5 damage.
20. Failed Defense deals exactly 10 damage.
21. Perfect Parry prevents damage and counterattacks for exactly 5.
22. The Wolf reacts with `wolf_hurt` when damaged.
23. `wolf_prepare`, `wolf_attack`, and `wolf_hurt` sound effects trigger at the correct moments.
24. Triple Lightning still uses all three separate attack sprites and impacts.
25. Its three damaging hits play `dexios.mp3` and the Wolf hurt sound.
26. The lateral-defense tutorial appears once and pauses combat.
27. R, N, M, and Escape work correctly.
28. Retry resets the encounter completely.
29. Victory occurs when the Wolf reaches 0 HP.
30. Chapter 29 remains unchanged and functional.
31. The existing project build succeeds.

After implementation, report the files modified, registered assets, tests performed, and any remaining issues.

**FINAL GOAL:** Build the third beginner-friendly Chapter 1 encounter, introducing left/right directional defense through clearly visible Wolf movement, while preserving all existing working battles and Chapter 29.
# LA DEXÍADA — CHAPTER 1, COMBAT 4: ELECTRIC ARC

Implement Chapter 1 Combat 4 in the existing Phaser project.

This encounter introduces Dexios's Mana bar, his Electric Arc ability, and the first offensive timing challenge in Chapter 1.

**CRITICAL: Preserve all existing working functionality.**

Chapter 1 Combats 1, 2, and 3 have already been implemented and adjusted. Inspect their current source code and reuse their established combat systems, sprites, timings, scene transitions, HUD conventions, and input management.

**Chapter 29 must remain completely untouched**, including its existing Electric Arc, action commands, normal battle, tutorial, narrative sequences, characters, music, and timing values.

Do not rebuild the existing combat engine.

## 1. ENABLE COMBAT 4

Update the existing encounter selector:

`scene_ch1_select`

Unlock:

`COMBAT 4 — TWO WOLVES`

Selecting this entry starts:

`scene_ch1_combat4`

Combats 1–3 remain unlocked and fully functional.

Combats 5–7 remain locked.

Preserve the existing selector's layout and visual style.

## 2. COMBAT 4 — GENERAL SETUP

Create:

`scene_ch1_combat4`

Encounter:

**DEXIOS VS. TWO WOLVES**

Reuse the existing Chapter 1 battle background:

`ch1_combat1_background`

There are exactly three combatants:

- Dexios, in the foreground.
- Wolf 1, on the left side of the enemy formation.
- Wolf 2, on the right side.

The Wolves should stand side by side with sufficient space for independent attack animations, targeting highlights, and HP displays.

Keep the current Chapter 1 depth, scaling, and sprite-grounding conventions.

### Dexios

- HP: **65/65**
- Maximum Mana: **40**
- Starting Mana: **40/40**
- Chaos: **0/100**, not displayed yet.

Available abilities:

1. `TRIPLE LIGHTNING`
2. `ELECTRIC ARC`

Do not unlock Chaotic Lightning.

### Wolf 1

- ID: `wolf_1`
- Name: `WOLF 1`
- HP: **35/35**
- Attack: `WOLF LUNGE`
- Failed-defense damage: **10**
- Normal-block damage: **5**
- Perfect Parry: **0 damage and 5 counterdamage**

### Wolf 2

- ID: `wolf_2`
- Name: `WOLF 2`
- HP: **35/35**
- Attack: `WOLF LUNGE`
- Failed-defense damage: **10**
- Normal-block damage: **5**
- Perfect Parry: **0 damage and 5 counterdamage**

Each Wolf must have its own health, turn slot, sprite instance, animation state, original position, and targeting state.

## 3. FIXED TURN ORDER

Use:

**Wolf 1 → Wolf 2 → Dexios → repeat**

Wolf 1 always acts first.

Wolf 2 attacks only after Wolf 1 has completed its full action, including any Perfect Parry counterattack.

Dexios acts after both surviving Wolves have taken their scheduled turns.

When one Wolf is defeated:

- Skip its future turns.
- Do not transfer its turn to the other Wolf.
- Keep the surviving Wolf active.
- Continue combat normally.

Victory requires both Wolves to reach zero HP.

Defeat occurs when Dexios reaches zero HP.

Keep the existing top-left turn-order interface with only these three combatants.

## 4. MANA BAR — FIRST INTRODUCTION

Combat 4 is the first Chapter 1 encounter in which Mana is visible and relevant.

Add Dexios's Mana bar to his existing bottom-right HUD.

Display:

`MANA 40/40`

Use the established blue Mana styling from La Dexíada, matching the existing UI design.

The Mana bar must:

- Appear below the HP bar.
- Show current and maximum Mana numerically.
- Update immediately when Mana is consumed.
- Never fall below zero.
- Never exceed 40.
- Remain clearly readable without covering the battle.

Mana starts at **40/40** every time Combat 4 begins or restarts.

### Mana costs

| Ability | Mana cost |
|---|---|
| Triple Lightning | 0 |
| Electric Arc | 10 |

Electric Arc consumes **10 Mana when the action is committed**, including when its timing challenge fails.

If Dexios has fewer than 10 Mana, Electric Arc must be unavailable and clearly disabled.

Triple Lightning remains available at all times.

Do not introduce Mana regeneration or additional resource mechanics in this encounter.

Do not automatically add the Mana bar to earlier Chapter 1 encounters unless their current implementation already supports it.

## 5. EXISTING WOLF MECHANICS

Reuse the fully functional Wolf mechanics from Combat 3.

Each Wolf uses:

`WOLF LUNGE`

The attack originates from either Dexios's left or right.

### Existing Wolf sprites

- `wolf_base`
- `wolf_prepare_left`
- `wolf_prepare_right`
- `wolf_attack_left`
- `wolf_attack_right`
- `wolf_hurt`

### Existing Wolf SFX

- `wolf_prepare`
- `wolf_attack`
- `wolf_hurt`

Preserve the working Combat 3 attack animations, positioning, visual indicators, camera movement, and sound synchronization.

### Directional defenses

- Attack from Dexios's left: defend with **A**.
- Attack from Dexios's right: defend with **D**.

Use `dexios_izquierda` and `dexios_derecha` for the matching defenses.

### Wild Lunge timing

Keep the existing Wolf Lunge timing unchanged:

- 1 second of anticipation.
- 2 seconds of continuous forward movement.
- First second of movement: Normal Block.
- Second second of movement: Perfect Parry.
- 0.2 seconds of post-impact Perfect Parry tolerance.

Defensive result:

| Outcome | Dexios damage | Counterattack |
|---|---|---|
| Failed Defense | 10 | 0 |
| Normal Block | 5 | 0 |
| Perfect Parry | 0 | 5 to attacking Wolf |

Both Wolves can independently attack from either side.

For the first round, configure Wolf 1 to attack from the left and Wolf 2 from the right, allowing the player to practice both defenses. Subsequent directions can be randomized with equal probability.

This first-round direction setup applies only to Combat 4. Do not change Combat 3's existing attack sequence.

Only one Wolf attacks at a time.

Perfect Parry counterdamage must always be applied to the Wolf that performed the attack.

## 6. TARGET SELECTION

Reuse the multi-enemy targeting system implemented in Combat 2.

When Dexios selects either Triple Lightning or Electric Arc:

1. Show the two living Wolves as possible targets.
2. Press 1 to select Wolf 1.
3. Press 2 to select Wolf 2.
4. Mouse selection must also work.
5. Highlight the selected or hovered enemy.
6. Confirm the target before starting the ability.

Do not automatically attack while two enemies remain alive.

If only one Wolf remains, select that Wolf automatically.

Defeated Wolves cannot be targeted.

The selected target must remain fixed throughout the entire chosen ability.

Do not redirect attacks to another Wolf midway through an animation.

Do not repeat Combat 2's target-selection tutorial.

## 7. TRIPLE LIGHTNING — UNCHANGED

Preserve the existing Chapter 1 Triple Lightning implementation.

- Three hits of 5 damage.
- Maximum total: 15 damage.
- No Mana cost.
- No offensive timing challenge.
- Existing cinematic black attack-announcement strip.
- Existing physical approach.
- Existing sequence:

`dexios_triple1 → dexios_triple2 → dexios_triple3`

Each hit retains its current animation, sound, camera shake, and damage synchronization.

Triple Lightning must target only the selected Wolf.

**Do not modify its current gameplay behavior.**

Electric Arc is the first Chapter 1 ability that introduces an offensive timing challenge.

## 8. NEW ELECTRIC ARC ASSETS

Register the supplied final assets using their exact physical filenames and extensions.

### Visual sprites

- `dexios_arc_charging`
- `dexios_arc_releasing`

### Sound effects

- `electric_arc_charging`
- `electric_arc_releasing`

Use the project's existing asset-loading conventions.

The charging sprite represents Dexios accumulating white electricity in his hands.

The releasing sprite represents Dexios performing the charged electrical attack.

Register sound effects separately from sprite assets.

Do not create placeholder sprites or substitute other Dexios artwork.

Reuse the existing background music:

`ch1_battle`

## 9. ELECTRIC ARC — ABILITY STATISTICS

Ability name:

`ELECTRIC ARC`

Properties:

- Target: one selected living Wolf.
- Mana cost: **10**.
- Normal damage: **35**.
- Perfect damage: **40**.
- Failed timing challenge: **0 damage**.
- Charging duration: **2 seconds**.
- Timing inputs: **A + D held simultaneously, then released**.

The Mana cost is paid when the action begins, regardless of the eventual timing result.

This ability consumes Dexios's turn even if the challenge fails.

Do not use the existing Chapter 29 Electric Arc damage, cost, or timing settings.

All new values apply only to Chapter 1 Combat 4.

## 10. ELECTRIC ARC — CINEMATIC INTRODUCTION

When the player chooses Electric Arc and confirms a target:

1. Lock the ability and target-selection controls.
2. Consume 10 Mana.
3. Show the existing black cinematic attack-announcement strip.
4. Display `ELECTRIC ARC`.
5. Preserve the existing Chapter 1 announcement animation and hold duration.
6. Once the announcement finishes, begin the new charging action command.

Do not allow multiple simultaneous Electric Arc commands.

## 11. ELECTRIC ARC — CHARGING ANIMATION

When the action command starts:

1. Change Dexios's sprite to `dexios_arc_charging`.
2. Play `electric_arc_charging` SFX once.
3. Smoothly zoom the camera toward Dexios.
4. Keep Dexios clearly visible while maintaining the selected Wolf as the intended target.
5. Display the offensive timing challenge prominently.
6. Begin the 2-second charge.

The camera zoom should resemble the established combat-camera style without obscuring the timing indicators.

The charging SFX must play when the charging pose begins, not during the cinematic introduction.

If the sound is longer than the action command, stop or fade it when charging ends. Do not let it overlap uncontrollably with the release sound.

Keep camera zoom parameters configurable.

## 12. ELECTRIC ARC — DIAGONAL TIMING CHALLENGE

Create the new visual timing challenge discussed for Electric Arc.

The challenge consists of **two diagonal progress bars converging toward a shared intersection**.

### Visual layout

- The left diagonal begins near the lower-left side of the timing interface.
- It rises diagonally toward the upper-right.
- Associate this bar with **A**.

- The right diagonal begins near the lower-right side.
- It rises diagonally toward the upper-left.
- Associate this bar with **D**.

The two bars form a symmetrical inverted-V / converging structure, meeting near the upper-center of the challenge interface.

The intersection is the ideal release point.

### Input instructions

Display concise English instructions:

`HOLD A + D`

Then:

`RELEASE AT THE INTERSECTION!`

Both keys must be held to begin charging.

Once both keys are held, the two progress indicators advance simultaneously toward the central intersection.

Both indicators must remain synchronized.

The indicators take **2 full seconds to reach the intersection**.

The player should release the held keys as close as possible to the moment the bars meet.

Use the first release after both keys have been held as the decisive release event, and evaluate the challenge once. Releasing the other key afterward must not produce a second result.

Inputs must be handled only by the active action command. Do not trigger Dexios's normal defensive animations when A or D is being used for Electric Arc.

### Time reference

Let:

**T = 2.0 seconds after charging progress begins.**

T is the moment when the two bars reach the intersection.

### Timing result windows

| Release timing | Result | Damage |
|---|---|---|
| Earlier than T − 1.5 s | FAIL | 0 |
| T − 1.5 s to T − 0.5 s | NORMAL | 35 |
| T − 0.5 s to T + 0.5 s | PERFECT | 40 |
| Later than T + 0.5 s | FAIL | 0 |

Numerically, measured from the start of bar progression:

- **0.0–0.5 s:** FAIL if released.
- **0.5–1.5 s:** NORMAL.
- **1.5–2.5 s:** PERFECT.
- **After 2.5 s:** FAIL.

At exactly 1.5 seconds, PERFECT takes priority over NORMAL.

At exactly 2.5 seconds, the last valid PERFECT input is accepted; later releases fail.

### Post-intersection grace period

The bars reach their shared intersection at 2.0 seconds.

They must not continue moving past their intended meeting point.

Instead, retain a clear visual intersection or brief charged glow during the additional **0.5-second Perfect window**.

This allows the player to release slightly after the ideal moment while keeping the interface understandable.

If the player continues holding beyond 2.5 seconds, automatically resolve the challenge as FAIL. Do not allow indefinite charging.

### Input safeguards

- Both A and D must be held before charging progress begins.
- Releasing before the valid NORMAL window results in FAIL.
- The first release after a valid dual-key hold determines the result.
- Never process the challenge twice.
- Ignore unrelated combat inputs during the command.
- Do not allow R or Escape to leave active timers or charging SFX behind.
- Pause the challenge if a legitimate tutorial/modal pause occurs.
- Clear held-key state when the action ends.
- Ensure the next enemy defense does not inherit A/D input from this action command.

## 13. ELECTRIC ARC — RESULT FEEDBACK

After the player releases:

Determine the result.

### NORMAL

- Display `NORMAL`.
- Final damage: **35**.
- Proceed to the physical attack animation.

### PERFECT

- Display `PERFECT`.
- Final damage: **40**.
- Proceed to the physical attack animation.
- Use a slightly stronger electrical flash or impact effect than NORMAL, without adding extra damage beyond 40.

### FAIL

- Display `FAIL`.
- Deal **0 damage**.
- Do not execute the physical strike.
- Do not play the releasing attack SFX.
- Stop the charging sound.
- Smoothly return the camera to the normal battlefield view.
- Restore `dexios_base`.
- Complete Dexios's turn normally.

Do not refund the 10 Mana spent on a failed command.

Result feedback must be clear and consistent with the established La Dexíada UI.

## 14. ELECTRIC ARC — PHYSICAL RELEASE

For a NORMAL or PERFECT result:

1. End the charging animation.
2. Stop the charging SFX if still playing.
3. Transition Dexios to `dexios_arc_releasing`.
4. Move Dexios physically toward the selected Wolf.
5. Play `electric_arc_releasing` SFX once.
6. Maintain the attack sprite for **1 second**.
7. Synchronize the actual hit with the visible strike.
8. Apply exactly 35 damage for NORMAL or 40 for PERFECT.
9. Display `wolf_hurt`.
10. Play `wolf_hurt` SFX once.
11. Apply a brief camera shake and white electrical impact effect.
12. Update the selected Wolf's HP bar.
13. After the release animation, Dexios returns smoothly to his original position.
14. Restore `dexios_base`.
15. Restore the normal camera position and zoom.
16. Complete the turn.

### Important animation rules

The physical attack must target the Wolf selected before the challenge began.

Dexios must approach the correct Wolf, whether it is positioned on the left or right.

The other Wolf must remain unaffected.

The damage occurs only once, at the attack's actual impact.

Do not apply additional damage because of sprite changes, camera shakes, or repeated event callbacks.

The physical release lasts 1 second. Preserve the existing Chapter 1 movement and recovery conventions around that pose.

If the strike defeats its target, finish the animation safely before resolving the next turn or victory.

Do not allow a defeated Wolf to perform additional actions.

## 15. NEW BEGINNER TUTORIAL WINDOWS

Combat 4 introduces two concepts:

1. Mana and ability costs.
2. Offensive timing challenges.

Use the existing Chapter 1 tutorial window system.

Preserve:

- Dark background with approximately 90% opacity.
- Gold border.
- Archeologicaps titles.
- Readable secondary font.
- Enter to advance.
- Complete combat pause while tutorial messages are visible.

### Tutorial A — Mana

Show this message once at the beginning of Dexios's first turn, before activating the ability menu.

**Title: `MANA`**

Text:

"Some abilities consume Mana, shown by the blue bar below Dexios's Health. Electric Arc costs 10 Mana, while Triple Lightning is free. Choose your abilities carefully!"

### Tutorial B — Offensive action commands

Show this message once immediately before the player's first Electric Arc timing challenge, after the ability and target have been selected but before the charging sequence begins.

**Title: `ACTION COMMANDS`**

Text:

"Some abilities require precise timing to succeed. For Electric Arc, hold A and D to charge both sides of the attack, then release as the two bars meet. Better timing means greater damage!"

After Enter:

- Close the window.
- Start the charging sprite and SFX.
- Zoom toward Dexios.
- Show the two diagonal bars.
- Begin the timing challenge.

### Tutorial behavior

- Each message appears only once per Combat 4 attempt.
- Restarting Combat 4 resets both tutorial flags.
- Do not repeat the basic combat tutorials from Combat 1.
- Do not repeat target selection from Combat 2.
- Do not repeat lateral-defense tutorials from Combat 3.
- Tutorial Enter must not accidentally start or finish an action command.
- No timers, damage, movement, or challenge progress may advance during tutorial windows.
- Music may continue while tutorials are open.
- R and Escape must remain functional.

All player-facing text must be in English.

Do not add narrative dialogue yet.

## 16. AUDIO

Use the existing Chapter 1 battle music:

`ch1_battle`

It must loop during Combat 4 and follow the current music manager's behavior.

### Existing audio

Reuse:

- `wolf_prepare`
- `wolf_attack`
- `wolf_hurt`
- `dexios.mp3`
- Existing Perfect Parry SFX.

### New Electric Arc audio

- `electric_arc_charging`: plays when charging begins.
- `electric_arc_releasing`: plays once when the successful attack is released.

Sound effects must respect the existing M toggle.

Music must respect the existing N toggle.

Do not create duplicate music playback or uncontrolled sound-effect overlap.

Stop any active charging audio when the scene restarts, exits, or the command ends.

Chapter 29's existing Electric Arc sounds and animations must remain unchanged.

## 17. EXISTING CHAPTER 1 HOTKEYS

Preserve the established shortcuts:

| Key | Function |
|---|---|
| R | Restart Combat 4 |
| N | Toggle music |
| M | Toggle SFX |
| Escape | Return to `scene_ch1_select` |

R and Escape must work even during:

- Electric Arc charging.
- Action-command result feedback.
- Attack animations.
- Defensive windows.
- Tutorial pop-ups.
- Target selection.
- Victory and defeat.

Always clean up timers, tweens, sound effects, event listeners, and camera transitions before restarting or leaving the scene.

Music and SFX preferences persist across scene transitions and retries.

## 18. VICTORY, DEFEAT, AND RESTART

### Victory

Victory occurs only when **both Wolves reach zero HP**.

- Finish the current action safely.
- Stop turn progression.
- Stop or fade out `ch1_battle`.
- Display the existing Chapter 1 victory interface.
- Offer Retry and Return to Combat Select.

### Defeat

Defeat occurs when Dexios reaches zero HP.

- Cancel pending actions.
- Stop combat progression.
- Stop the battle music.
- Display the existing defeat interface.
- Offer Retry and Return to Combat Select.

### Restart

Restore:

- Dexios HP: 65/65.
- Dexios Mana: 40/40.
- Dexios Chaos: 0/100.
- Wolf 1 HP: 35/35.
- Wolf 2 HP: 35/35.
- First turn: Wolf 1.
- Both Wolves alive and at their original positions.
- No target selected.
- Electric Arc charge state cleared.
- All tutorial flags reset.
- All camera positions and zoom restored.
- All temporary sprites and effects cleared.
- All attack timelines reset.

Restart music according to the current mute preference.

Do not retain an old charging sound, held-key state, duplicate listener, or unfinished attack.

## 19. ARCHITECTURE AND ISOLATION

Inspect the current Chapter 1 combat implementation before making changes.

Prefer extending the existing encounter configuration and action-command framework rather than introducing a completely separate combat engine.

The new encounter should reuse:

- Chapter 1 turn scheduling.
- Multiple-enemy targeting.
- Wolf directional attacks.
- Defensive timing.
- Damage resolution.
- Tutorial windows.
- Cinematic attack announcements.
- Music and SFX manager.
- Camera controls.
- Victory/defeat interface.
- Scene-specific hotkeys.

Add configuration for:

- Two Wolves.
- Fixed three-slot turn order.
- Mana HUD visibility.
- Electric Arc unlock.
- Mana cost.
- New charge/release sprites.
- Diagonal timing challenge.
- Timing-result damage.
- Zoom and animation duration.
- New Electric Arc audio.

Do not change the existing Chapter 1 Triple Lightning or Wolf Lunge behavior.

**Chapter 29's original Electric Arc must remain exactly as it is.**

Do not implement later encounters, furious boars, potion crafting, the overworld, or Chaotic Lightning.

## 20. ACCEPTANCE TESTS

Verify all of the following:

1. Combat 4 is enabled in `scene_ch1_select`.
2. Combats 1–3 still work unchanged.
3. Combats 5–7 remain locked.
4. `scene_ch1_combat4` launches correctly.
5. The battle displays Dexios and two Wolves.
6. Both Wolves have independent 35-HP bars.
7. Dexios begins with 65 HP and 40 Mana.
8. The turn order is Wolf 1 → Wolf 2 → Dexios.
9. Wolf Lunge still functions with A/D defense and 10/5/0 damage outcomes.
10. Target selection correctly distinguishes the two Wolves.
11. The Mana bar appears beneath Dexios's HP.
12. Triple Lightning remains available and unchanged.
13. Electric Arc appears as Dexios's second ability.
14. Selecting Electric Arc consumes exactly 10 Mana.
15. The first Mana tutorial appears once.
16. The first Action Commands tutorial appears once.
17. `dexios_arc_charging` displays during charging.
18. `electric_arc_charging` plays when charging begins.
19. The camera zooms toward Dexios without obscuring the minigame.
20. The diagonal bars visibly converge from A and D toward one intersection.
21. Both bars require 2 seconds to reach the intersection.
22. Releasing before 0.5 seconds produces FAIL.
23. Releasing between 0.5 and 1.5 seconds produces NORMAL and 35 damage.
24. Releasing between 1.5 and 2.5 seconds produces PERFECT and 40 damage.
25. Holding past 2.5 seconds produces FAIL.
26. A failed command deals no damage and still consumes 10 Mana and Dexios's turn.
27. A successful command shows `dexios_arc_releasing`.
28. `electric_arc_releasing` plays once during the successful release.
29. Dexios physically approaches the selected Wolf.
30. The release sprite is held for 1 second.
31. Only the selected Wolf takes damage.
32. Dexios returns to his original position after the attack.
33. Camera zoom and position always reset after success, failure, restart, or scene exit.
34. Mana cannot fall below zero.
35. Electric Arc becomes unavailable when Mana is insufficient.
36. The game does not accidentally interpret A+D as defensive inputs during Electric Arc.
37. Victory occurs only when both Wolves are defeated.
38. All existing Chapter 1 hotkeys function.
39. No duplicated damage, listeners, overlapping audio, stuck inputs, or unfinished timers occur.
40. All Chapter 29 scenes, mechanics, and audio remain unaffected.
41. The project builds successfully using its existing build command.

After implementation, report the files changed, the new scene registration, asset loading results, test results, and any unresolved issues.

**FINAL OBJECTIVE:** Create a polished, beginner-friendly fourth Chapter 1 encounter where two Wolves challenge Dexios and introduce Mana management and the first offensive action command through a cinematic, diagonal-bar Electric Arc minigame. Preserve all previous encounters and Chapter 29.

# LA DEXÍADA — CHAPTER 1: COMBATS 5 AND 6

Implement Chapter 1 Combat 5 and Combat 6 in the existing Phaser project.

Combat 5 introduces jumping with Space to dodge Furious Boar attacks. Combat 6 combines all three enemy types already introduced throughout Chapter 1.

**CRITICAL: Preserve the existing working game.**

Chapter 1 Combats 1–4 are already implemented, tested, and manually adjusted. Inspect the actual current source code before making changes. Reuse existing encounter logic, targeting, animations, attack timings, audio management, and UI.

**CHAPTER 29 MUST REMAIN COMPLETELY UNCHANGED**, including its combat, tutorial, narrative mode, practice scenes, character statistics, attacks, controls, music, and animations.

The current working code takes precedence over older notes in DESIGN.md.

## 1. ENABLE COMBATS 5 AND 6

Update the existing Chapter 1 selector:

`scene_ch1_select`

Enable:

- `COMBAT 5 — TWO FURIOUS BOARS`
- `COMBAT 6 — MIXED ENCOUNTER`

Connect them to two new scenes:

- `scene_ch1_combat5`
- `scene_ch1_combat6`

Combats 1–4 must remain available and unchanged.

Combat 7 remains locked.

Preserve the selector's current design, positioning, fonts, controls, and navigation.

Do not implement the overworld or any narrative sequences.

## 2. SHARED DEXIOS CONFIGURATION

Both new encounters use the established Chapter 1 Dexios configuration.

### Statistics

- Maximum HP: 65
- Starting HP: 65
- Maximum Mana: 40
- Starting Mana: 40
- Initial Chaos: 0/100, hidden.

### Available abilities

**TRIPLE LIGHTNING**

- Three separate hits of 5 damage.
- Maximum total: 15.
- No Mana cost.
- No timing challenge.
- Existing sprite sequence: `dexios_triple1`, `dexios_triple2`, `dexios_triple3`.
- Keep the physical movement, sound effects, camera shakes, and timing currently working in previous encounters.

**ELECTRIC ARC**

- Mana cost: 10.
- NORMAL damage: 35.
- PERFECT damage: 40.
- FAIL damage: 0.
- A failed command still consumes 10 Mana and Dexios's turn.
- Reuse the existing diagonal A+D charging minigame from Combat 4.
- Reuse `dexios_arc_charging` and `dexios_arc_releasing`.
- Reuse `electric_arc_charging` and `electric_arc_releasing` SFX.
- Preserve the existing camera zoom, animation, timing windows, and recovery behavior.

Do not rebuild Electric Arc.

Do not introduce Chaotic Lightning yet.

The bottom-right Dexios HUD must display HP and the blue Mana bar, as already established in Combat 4.

### Target selection

Reuse the existing multi-enemy targeting implementation.

- Allow keyboard and mouse selection.
- Use stable enemy IDs.
- Display a clear selection highlight.
- Only living enemies are selectable.
- Attacks damage only their selected target.
- If only one enemy remains, select it automatically.
- Do not redirect the remaining hits of Triple Lightning if its target is defeated during the sequence.

## 3. FURIOUS BOAR — NEW ENEMY TYPE

Introduce the new enemy:

`FURIOUS BOAR`

### Statistics

- Maximum HP: 25.
- Starting HP: 25.
- Attack damage: 15.
- Attack name: `RAGE CHARGE`.
- Required defensive action: Space.
- A successful dodge prevents all damage.
- There is no Perfect Parry counterattack against Rage Charge.

This enemy has exactly one attack.

Its primary purpose is teaching a new defensive mechanic.

### Exact sprite assets

Use the supplied final artwork:

- `rageboar_base`
- `rageboar_prepare`
- `rageboar_attack`
- `rageboar_hurt`

Preserve the actual asset filenames, extensions, transparent backgrounds, and existing scaling conventions.

Do not create placeholders or rename the files.

### Audio

**Furious Boars use the same sound effects as normal Wild Boars.**

Reuse:

- `boar_prepare`
- `boar_attack`
- `boar_hurt`

Do not require new `rageboar` sound files.

Audio triggers:

- Play `boar_prepare` once when anticipation begins.
- Play `boar_attack` once when the charge begins.
- Play `boar_hurt` whenever the Furious Boar receives actual damage, including individual Triple Lightning strikes and a successful Electric Arc.

Use the existing sound manager.

Respect the M SFX toggle.

## 4. RAGE CHARGE — ATTACK SEQUENCE

Rage Charge must reuse the Wild Boar's existing physical attack structure and durations.

The Furious Boar prepares, then charges physically toward Dexios.

### Timeline

The attack-announcement strip finishes before the attack-local timeline begins.

| Elapsed time | Animation | Defensive behavior |
|---|---|---|
| 0.0–1.0 s | `rageboar_prepare` | Anticipation; inputs ignored |
| 1.0–2.0 s | `rageboar_attack` | First second of the charge |
| 2.0–3.0 s | `rageboar_attack` | Space dodge window |
| 3.0 s | Visual impact | Dodge still available |
| 3.0–3.2 s | Impact grace period | Space dodge window |
| After 3.2 s | Resolve attack | Window closed |

### Anticipation

1. Announce `RAGE CHARGE` using the established enemy announcement system.
2. After the announcement, switch to `rageboar_prepare`.
3. Play `boar_prepare` SFX.
4. Hold the anticipation for 1 second.
5. Ignore defensive input during anticipation.

### Charge

1. Switch to `rageboar_attack`.
2. Play `boar_attack` SFX once.
3. Begin the same continuous two-second forward movement used by the normal Wild Boar.
4. Clearly show the Furious Boar approaching Dexios.
5. Maintain the correct collision destination, scaling, and camera framing.

The Furious Boar reaches Dexios after exactly two seconds of charging.

### Jump defense

Unlike Wild Bite, Rage Charge cannot be defended by a normal directional block.

**Dexios must jump with Space to avoid the attack.**

A successful Space input during the final second of the charge, from 2.0 to 3.0 seconds, or within the 0.2-second post-impact grace period, results in a successful dodge.

Use the existing sprite:

`dexios_salto`

Dexios must visibly jump over the incoming charge rather than simply change to a static defensive pose.

Animate a brief vertical elevation and return, keeping his actual battlefield position consistent.

Use a grounded shadow or the existing visual grounding system to make the jump readable.

Ensure Dexios is visibly airborne at the moment the charge passes beneath him. Synchronize the jumping animation with the final visual contact, including when the player presses early within the successful window.

### Jump input behavior

- Space is the only valid avoidance input.
- Inputs during anticipation do not count.
- Space pressed before the successful jump window is too early and must not be saved for later.
- Space pressed during the successful window triggers one jump.
- Repeated Space presses must not generate additional jumps or outcomes.
- W, A, S, and D do not block Rage Charge.
- There is no NORMAL/PERFECT distinction for this attack.
- A successful dodge deals 0 damage to Dexios.
- A failed or missing dodge deals 15 damage.
- Jumping does not counterattack the Furious Boar.

Keep the beginner-friendly timing indicator clearly visible, using a Space/jump instruction instead of a directional W/A/S/D indicator.

Do not resolve the damage until the 3.2-second attack-local window closes, preserving the existing post-impact grace-period behavior.

### Successful dodge

- Display `DODGE`.
- Dexios takes 0 damage.
- No counterattack occurs.
- The Furious Boar finishes its charge.
- Dexios lands and returns to `dexios_base`.
- The Furious Boar returns to its initial position and `rageboar_base`.

### Failed dodge

- Display `FAIL`.
- Apply exactly 15 damage.
- Display `dexios_herido`.
- Restore both combatants to their normal positions and poses after the feedback.

Never process damage more than once.

All timing values and jump animation parameters must be configurable.

These new jump mechanics apply exclusively to Rage Charge in Chapter 1. Do not modify existing Chapter 29 jumping or defense logic.

## 5. COMBAT 5 — TWO FURIOUS BOARS

Create:

`scene_ch1_combat5`

### Battlefield

Reuse:

`ch1_combat1_background`

Combatants:

- Dexios in the foreground.
- Furious Boar 1 on the left.
- Furious Boar 2 on the right.

Both Furious Boars have 25 HP.

Use separate enemy instances with independent health, sprite states, positions, turn slots, and targeting.

Position them side by side at a similar visual depth.

Avoid sprite overlap when either enemy charges.

### Turn order

**Furious Boar 1 → Furious Boar 2 → Dexios → repeat**

Furious Boar 1 attacks first.

Only one attack may occur at a time.

After a Furious Boar is defeated, skip its future turns without transferring its turn to the surviving enemy.

### Abilities

Each Furious Boar uses Rage Charge exclusively.

Both require Space to dodge.

Dexios can use Triple Lightning and Electric Arc against either enemy.

The existing multi-enemy target-selection system must work correctly.

### Victory and defeat

Victory requires both Furious Boars to reach 0 HP.

Defeat occurs when Dexios reaches 0 HP.

Reuse the current Chapter 1 victory, defeat, retry, and return-to-selector interfaces.

## 6. COMBAT 5 — NEW TUTORIAL

Introduce the jump-dodge mechanic with a dedicated tutorial window.

Use the existing Chapter 1 tutorial styling:

- Centered dark panel.
- Approximately 90% opacity.
- Gold border.
- Archeologicaps for titles.
- Readable secondary font.
- Enter to continue.
- Full gameplay pause during messages.

Show the tutorial once, immediately before the first Furious Boar begins its first Rage Charge.

### Message 1

Title:

`JUMPING TO DODGE`

Text:

"Not every attack can be blocked! Furious Boars charge with powerful attacks that Dexios must jump over. Press SPACE as the enemy approaches to avoid taking damage."

### Message 2

Title:

`WATCH YOUR TIMING`

Text:

"Wait until the Furious Boar gets close, then press SPACE to jump over its attack. A successful dodge prevents all damage, but unlike a Perfect Parry, it does not trigger a counterattack."

After pressing Enter on the second message:

1. Close the tutorial.
2. Resume gameplay.
3. Announce Rage Charge.
4. Begin its complete anticipation and charging animation.

The first charge must not progress while the tutorial is open.

Do not repeat tutorials for turns, target selection, lateral defense, Mana, or Electric Arc.

Reset the new tutorial flag when Combat 5 restarts.

## 7. COMBAT 6 — MIXED ENCOUNTER

Create:

`scene_ch1_combat6`

This is the final standard encounter before the Chapter 1 boss.

It combines the previously introduced enemy types and defensive actions.

**Do not introduce any new mechanics or tutorial messages.**

### Enemy formation

Spawn exactly three enemies:

1. Wild Boar.
2. Furious Boar.
3. Wolf.

Arrange them in three distinct positions across the enemy area, with sufficient horizontal separation for targeting and physical movement.

Use a visually balanced formation and the same Chapter 1 background.

Maintain each enemy's established sprite scale and depth.

Each enemy must have an independent HP bar, turn slot, targeting state, attack animation, and defeated state.

### Enemy statistics and mechanics

**Enemy 1 — Wild Boar**

- ID: `boar_1`
- HP: 20/20.
- Attack: `WILD BITE`.
- Base damage: 6.
- Normal Block damage: 3.
- Perfect Parry: 0 damage and 5 counterdamage.
- Required key: W.
- Existing Wild Bite animations and timing.
- Existing `boar_*` sprites and sounds.

**Enemy 2 — Furious Boar**

- ID: `rageboar_1`
- HP: 25/25.
- Attack: `RAGE CHARGE`.
- Base damage: 15.
- Successful Space dodge: 0 damage.
- No counterattack from jumping.
- Required key: Space.
- New `rageboar_*` sprites.
- Reuse normal Wild Boar sound effects.
- Reuse the exact Rage Charge system created for Combat 5.

**Enemy 3 — Wolf**

- ID: `wolf_1`
- HP: 35/35.
- Attack: `WOLF LUNGE`.
- Base damage: 10.
- Normal Block damage: 5.
- Perfect Parry: 0 damage and 5 counterdamage.
- Required keys: A or D, depending on attack origin.
- Existing Combat 3/4 Wolf Lunge timing, sprites, positioning, and sound effects.
- Preserve the current Wolf directional attack-selection logic rather than introducing a new one.

### Fixed turn order

**Wild Boar → Furious Boar → Wolf → Dexios → repeat**

Every surviving enemy attacks once per complete cycle.

Dexios acts after all surviving enemies have performed their scheduled turns.

Each enemy uses its own existing attack.

Only one enemy attack or defensive window may be active at a time.

When an enemy is defeated:

- Remove or skip only its own future turns.
- Keep all other turn slots in the original relative order.
- Do not transfer turns to surviving enemies.
- Keep their HP and targeting systems independent.

### Player abilities

Dexios has:

- Triple Lightning.
- Electric Arc.

Mana is visible and begins at 40/40.

Use the existing targeting interface to select among three enemies:

- 1: Wild Boar.
- 2: Furious Boar.
- 3: Wolf.

Mouse selection must also work.

Do not renumber surviving enemies unpredictably after one is defeated; retain stable IDs and consistent UI labels.

Only living enemies can be targeted.

If one enemy remains, automatically select that enemy.

### Defensive behavior

The fight combines three already-learned defenses:

- **W** against Wild Bite.
- **Space** against Rage Charge.
- **A/D** against Wolf Lunge.

The defensive controls must depend on the currently attacking enemy and must never overlap.

Space must not accidentally activate during Wolf Lunge, and A/D must not trigger their offensive action-command behavior during an enemy attack.

Preserve the existing state-based input handling.

### No new tutorial

Combat 6 is an opportunity to demonstrate mastery of previously introduced systems.

Do not display a new tutorial or repeat earlier instruction panels.

Keep attack indicators and ordinary HUD hints visible as usual.

### Victory

Victory occurs when all three enemies are defeated.

Defeat occurs when Dexios reaches 0 HP.

Reuse the existing result and navigation systems.

## 8. MUSIC AND AUDIO

Both new encounters use:

`ch1_battle`

Loop it during combat using the existing Chapter 1 music manager.

Stop or fade the active battle music when an encounter ends or the player leaves the scene.

Do not create duplicate music instances.

### Sound effects

**Wild Boar**

- `boar_prepare`
- `boar_attack`
- `boar_hurt`

**Furious Boar**

Use the same:

- `boar_prepare`
- `boar_attack`
- `boar_hurt`

**Wolf**

- `wolf_prepare`
- `wolf_attack`
- `wolf_hurt`

**Dexios**

- Existing Triple Lightning sounds.
- Existing Electric Arc charging and releasing sounds.
- Existing Perfect Parry SFX.

Sound effects must trigger only for the relevant enemy/action and must respect the established audio manager.

### Existing hotkeys

Preserve:

- R — Restart the current combat.
- N — Toggle music.
- M — Toggle SFX.
- Escape — Return to `scene_ch1_select`.

These controls must work during attacks, jumps, action commands, tutorials, target selection, and result screens.

Restarting or changing scenes must clean up active audio, timers, tweens, listeners, and temporary visual effects.

Preserve mute preferences between Chapter 1 encounters.

## 9. SCENE RESTART AND STATE MANAGEMENT

Every Combat 5 restart must restore:

- Dexios HP: 65/65.
- Dexios Mana: 40/40.
- Furious Boar 1 HP: 25/25.
- Furious Boar 2 HP: 25/25.
- First turn: Furious Boar 1.
- Jump tutorial not yet shown.
- Original sprite positions and camera state.
- No active defensive input or attack.

Every Combat 6 restart must restore:

- Dexios HP: 65/65.
- Dexios Mana: 40/40.
- Wild Boar HP: 20/20.
- Furious Boar HP: 25/25.
- Wolf HP: 35/35.
- First turn: Wild Boar.
- No target selected.
- Original sprite positions and camera state.
- No pending attack state.

Both scenes must reset all transient effects, action commands, pending timers, and combat listeners.

Music/SFX preferences must persist.

## 10. TECHNICAL IMPLEMENTATION REQUIREMENTS

Inspect the current source files for Combats 1–4 before implementing these new scenes.

Reuse existing code wherever safe.

In particular:

- Reuse Wild Bite movement and attack timing for Rage Charge.
- Reuse the existing Wolf Lunge implementation.
- Reuse multi-enemy selection and fixed turn-order logic.
- Reuse Triple Lightning and Electric Arc without modifying their current working implementations.
- Reuse the existing tutorial pop-up component.
- Reuse the established Chapter 1 HUD, music manager, and victory/defeat interface.

Create or extend reusable enemy definitions for `wild_boar`, `furious_boar`, and `wolf`, each containing its relevant statistics, visual assets, audio mappings, attack type, and defensive requirements.

Keep encounter-specific positioning, enemy lists, and turn orders configurable.

Do not hardcode special cases that will break later encounters.

**Do not modify the original Chapter 29 gameplay.**

Do not implement Combat 7, the boss, overworld exploration, potion crafting, or narrative dialogue.

## 11. ACCEPTANCE TESTS

Verify:

1. Combats 5 and 6 are unlocked in `scene_ch1_select`.
2. Combats 1–4 continue working as before.
3. Combat 7 remains locked.
4. Combat 5 displays two independent Furious Boars with 25 HP each.
5. Combat 5 turn order is Furious Boar 1 → Furious Boar 2 → Dexios.
6. Rage Charge uses the correct four `rageboar_*` sprites.
7. Rage Charge reuses the normal Wild Boar audio.
8. Rage Charge has one second of anticipation and two seconds of forward movement.
9. Dexios can dodge Rage Charge using Space during its designated jump window.
10. A successful jump takes zero damage and produces no counterattack.
11. Failed jumping causes exactly 15 damage.
12. The jump tutorial appears exactly once and pauses the fight.
13. Dexios's `dexios_salto` sprite and jump animation work correctly.
14. Triple Lightning and Electric Arc both work against Furious Boars.
15. Combat 5 ends only when both Furious Boars are defeated.
16. Combat 6 displays one Wild Boar, one Furious Boar, and one Wolf.
17. Their HP values are 20, 25, and 35.
18. Combat 6 follows Wild Boar → Furious Boar → Wolf → Dexios.
19. Wild Bite requires W with its original 6/3/0 damage outcomes.
20. Rage Charge requires Space and deals 15 damage if not dodged.
21. Wolf Lunge requires A/D with its original 10/5/0 damage outcomes.
22. Perfect Parry counterattacks only the enemy responsible for the current attack.
23. Target selection supports all three enemies correctly.
24. Defeating one enemy never prematurely ends the fight or affects the remaining enemies' HP.
25. Electric Arc consumes exactly 10 Mana and retains its existing NORMAL/PERFECT/FAIL behavior.
26. Combat 6 introduces no new tutorial messages.
27. R, N, M, and Escape work correctly in both encounters.
28. Victory, defeat, retry, and scene navigation function correctly.
29. No duplicated timers, event listeners, sound effects, damage, or overlapping attack sequences.
30. Chapter 29 remains unchanged and fully functional.
31. The project builds successfully using the existing build command.

After implementation, report the modified files, new scenes, registered assets, any test results, and unresolved issues.

**FINAL OBJECTIVE:** Implement Chapter 1 Combats 5 and 6 as complete playable encounters. Combat 5 teaches jumping to dodge Furious Boar attacks, while Combat 6 combines Wild Boar, Furious Boar, and Wolf mechanics into a beginner-friendly mastery encounter, without changing previous battles or Chapter 29.

# LA DEXÍADA — CHAPTER 1: COMBAT 7 — THE BEAST

Implement the final boss encounter of Chapter 1 in the existing Phaser project.

This is Combat 7, featuring **THE BEAST**, a large purple monstrous creature with two consecutive 80-HP phases, multiple directional attacks, a fire attack that requires jumping, and a new underground attack introduced in Phase 2.

**CRITICAL REQUIREMENT: Preserve everything that already works.**

Chapter 1 Combats 1–6 are implemented and have received manual adjustments. Inspect the actual working source code before making changes. Reuse existing combat systems rather than reconstructing them.

**CHAPTER 29 MUST REMAIN COMPLETELY UNCHANGED**, including all combat modes, tutorials, narrative events, sound effects, music, statistics, attacks, camera systems, and cinematic sequences.

The current code is the source of truth for existing mechanics.

For now, this boss encounter ends with a normal victory screen after defeating the second phase.

**DO NOT IMPLEMENT CHAOTIC LIGHTNING OR THE FINAL NARRATIVE CINEMATIC YET.**

---

## 1. ENABLE COMBAT 7

Update the existing Chapter 1 encounter selector:

`scene_ch1_select`

Unlock:

`COMBAT 7 — THE BEAST`

Selecting it must launch:

`scene_ch1_combat7`

All seven Chapter 1 encounters should now be selectable.

Preserve the existing selector layout, visual design, controls, transitions, and navigation.

Do not modify the other encounter entries.

## 2. BOSS BATTLE SCENE

Create:

`scene_ch1_combat7`

Encounter:

**DEXIOS VS. THE BEAST**

There are exactly two combatants:

- Dexios in the foreground.
- The Beast in the enemy area.

The Beast must appear substantially larger and more imposing than the Wild Boars and Wolves from previous encounters.

Maintain the established hand-drawn anime art style, correct sprite proportions, grounded positions, and combat HUD conventions.

### Battlefield background

Use the supplied final image:

`ch1_combat7_background`

This is a distinct background from the first six Chapter 1 battles.

Load the real asset from its existing directory, preserving its actual filename and extension.

Display it across the 1920 × 1080 battle viewport with appropriate aspect-ratio handling.

Do not use `ch1_combat1_background` in Combat 7.

### Battle music

Reuse the existing Chapter 1 combat music:

`ch1_battle`

Do not introduce new battle music for this boss yet.

Preserve the current music manager, volume configuration, and N/M mute controls.

The same battle music continues through both boss phases without restarting during the transformation.

---

## 3. CHARACTER STATISTICS

### Dexios

Use the existing Chapter 1 configuration:

- Maximum HP: 65.
- Starting HP: 65.
- Maximum Mana: 40.
- Starting Mana: 40.
- Chaos: 0/100, hidden and unavailable.

Available abilities:

**TRIPLE LIGHTNING**

- 3 hits.
- 5 damage per hit.
- Maximum total damage: 15.
- No Mana cost.
- No action-command minigame.

**ELECTRIC ARC**

- Mana cost: 10.
- NORMAL: 35 damage.
- PERFECT: 40 damage.
- FAIL: 0 damage.
- Retain the existing two-diagonal-bar A+D timing challenge implemented in Combat 4.
- A failed command still consumes Mana and Dexios's turn.

Do not modify the current implementation of either ability.

Keep Dexios's existing HP and Mana HUD in the bottom-right.

### The Beast

Display name:

`THE BEAST`

The boss has **two distinct combat phases**.

**PHASE 1**

- Maximum HP: 80.
- Starting HP: 80.

**PHASE 2**

- Maximum HP: 80.
- Starting HP: 80, fully restored at the transition.

The Beast therefore has two consecutive 80-HP bars, not one 160-HP bar.

When the first HP bar reaches zero, initiate Phase 2 instead of ending the battle.

When the second HP bar reaches zero, resolve victory.

### Fixed turn order

**The Beast → Dexios → repeat**

The Beast acts first.

Each Beast turn consists of exactly one selected ability.

Do not begin Dexios's turn until the Beast's attack, defense resolution, damage, counterattack, and recovery animations have fully completed.

---

## 4. EXACT BOSS ASSETS

Use the final supplied sprites with these exact names.

### General sprites

- `beast_base`
- `beast_hurt`

### Savage Jump — Attack from above

- `beast_preparing_up`
- `beast_attack_up`

### Wild Claw — Attack from Dexios's left

- `beast_preparing_left`
- `beast_attack_left`

### Wild Claw — Attack from Dexios's right

- `beast_preparing_right`
- `beast_attack_right`

### Rampant Excavation — Attack from below

- `beast_preparing_down`
- `beast_attack_down`

### Beast Fire — Jump-dodge attack

- `beast_preparing_fire`
- `beast_attack_fire`

### Fire projectile/effect

- `fire`

### Background

- `ch1_combat7_background`

All assets are provided artwork.

Inspect the actual project directories for their correct extensions and paths.

Do not rename files, create placeholder sprites, or replace existing art.

Preserve the supplied artwork's proportions and visual orientation.

### Sprite behavior

Use `beast_base` during idle.

Use the corresponding `beast_preparing_*` sprite for the full one-second preparation.

Use the corresponding `beast_attack_*` sprite during the subsequent attack animation.

When the boss takes damage, briefly display `beast_hurt`, then return to its appropriate idle or active animation state.

Do not interrupt an unfinished attack with an idle animation.

The boss must have its own stable sprite instance, original position, current phase, active attack state, and HP.

---

## 5. BOSS ABILITIES

The Beast has four named abilities, one of which can originate from two different directions.

| Ability | Required input | Available phase |
|---|---|---|
| SAVAGE JUMP | W | 1 and 2 |
| WILD CLAW — LEFT | A | 1 and 2 |
| WILD CLAW — RIGHT | D | 1 and 2 |
| BEAST FIRE | SPACE | 1 and 2 |
| RAMPANT EXCAVATION | S | 2 only |

Left and Right Wild Claw are two directional variants of the same named ability, not different attack names.

Before each attack, use the existing enemy attack-announcement system.

All attacks share the same preparation and approach durations described below.

## 6. BOSS ATTACK TIMING — EXACT VALUES

The Beast attacks faster than the previous Chapter 1 enemies.

Use these fixed values:

- Preparation: **1.0 second**.
- Attack movement or projectile travel: **1.6 seconds**.
- Normal Block window: first **0.8 seconds** of attack movement.
- Perfect Parry window: last **0.8 seconds** of movement and **0.1 second after impact**.

### Attack-local timeline

The attack timer begins only after the attack-name announcement finishes and the boss is positioned appropriately.

| Time | State | Valid result |
|---|---|---|
| 0.0–1.0 s | Preparation | Inputs ignored |
| 1.0–1.8 s | First half of attack | NORMAL BLOCK |
| 1.8–2.6 s | Second half of attack | PERFECT PARRY |
| 2.6 s | Visual impact | Perfect remains valid |
| 2.6–2.7 s | Grace period | PERFECT PARRY |
| After 2.7 s | Resolve | Defense closed |

The physical attack reaches Dexios exactly 2.6 seconds after the start of the attack-local timeline.

Final damage resolution happens after the 0.1-second grace period.

### Directional defense outcomes

For Savage Jump, Wild Claw, and Rampant Excavation:

| Result | Damage to Dexios | Damage to Beast |
|---|---|---|
| FAILED DEFENSE | 10 | 0 |
| NORMAL BLOCK | 5 | 0 |
| PERFECT PARRY | 0 | 5 |

### Input behavior

- Defensive inputs during preparation are ignored.
- Only the first directional input during the active defense window determines the result.
- Incorrect direction causes Failed Defense.
- Repeated inputs cannot improve a Normal Block into a Perfect Parry.
- Exact window boundaries must be handled consistently.
- Do not apply damage twice.
- Do not resolve damage before the post-impact grace period closes.

Use the established Chapter 1 feedback:

- `BLOCK`
- `PERFECT`
- `FAIL`

A successful Perfect Parry triggers Dexios's existing 5-damage counterattack.

The active attack must fully resolve before the next turn begins.

---

## 7. SAVAGE JUMP — DEFEND WITH W

Attack name:

`SAVAGE JUMP`

Available in both phases.

This is a physical attack coming **from above**, not the jumping dodge mechanic.

Dexios must block upward with **W**.

### Preparation

1. Announce `SAVAGE JUMP`.
2. Display `beast_preparing_up`.
3. Play the existing **Wild Boar preparation SFX**, `boar_prepare`.
4. Hold the preparation pose for 1 second.

### Attack

1. Switch to `beast_attack_up`.
2. Play the existing **Wild Boar attack SFX**, `boar_attack`.
3. The Beast jumps into the air and moves toward Dexios's position.
4. Create a visible vertical arc, making it clear that the attack is descending toward Dexios's head.
5. The attack reaches Dexios after 1.6 seconds.

The boss must visibly jump, not merely slide forward on the ground.

The downward motion toward Dexios's head is important because it communicates why W is required.

### Defense

- Correct input: W.
- Defense sprite: `dexios_arriba`.
- Failed damage: 10.
- Normal Block damage: 5.
- Perfect Parry damage: 0 and 5 counterdamage.

After the attack, return the Beast to its original battlefield position and `beast_base`, unless the action triggered a phase transition or victory.

Use the existing camera and hit-feedback effects.

---

## 8. WILD CLAW — DEFEND WITH A OR D

Attack name:

`WILD CLAW`

Available in both phases.

The Beast performs a powerful lateral claw strike.

It can attack from either side of Dexios.

### Attack from Dexios's left

- Preparation sprite: `beast_preparing_left`.
- Attack sprite: `beast_attack_left`.
- Correct defensive key: A.
- Dexios defense sprite: `dexios_izquierda`.

### Attack from Dexios's right

- Preparation sprite: `beast_preparing_right`.
- Attack sprite: `beast_attack_right`.
- Correct defensive key: D.
- Dexios defense sprite: `dexios_derecha`.

### Physical movement

Before timed anticipation, move the Beast smoothly into an appropriate attack-start position on the selected side.

The flank-positioning movement happens before the attack-local timer begins and must not consume the 1-second preparation or 1.6-second attack duration.

Once positioned:

1. Announce `WILD CLAW`.
2. Display the corresponding preparation sprite.
3. Play `wolf_prepare` SFX.
4. Prepare for 1 second.
5. Switch to the correct attack sprite.
6. Play `wolf_attack` SFX.
7. Move toward Dexios over 1.6 seconds.
8. Execute the horizontal claw strike from the selected side.

### Sound requirements

For both LEFT and RIGHT Wild Claw:

- Preparation sound: `wolf_prepare`.
- Attack sound: `wolf_attack`.

Reuse the same audio files already employed by the Wolves in Combats 3, 4, and 6.

Do not create new Wild Claw audio files.

### Defense

- Correct input: A or D, matching the actual attack origin.
- Failed damage: 10.
- Normal Block damage: 5.
- Perfect Parry: 0 damage and 5 counterdamage.

The direction must be evident from the Beast's actual position and movement, not only from the HUD.

After completing the attack, return the Beast to its original position and idle sprite.

---

## 9. BEAST FIRE — JUMP WITH SPACE

Attack name:

`BEAST FIRE`

Available in both phases.

This attack introduces no new defensive control. It reuses the jumping mechanic from Furious Boars.

However, the Beast launches a **purple magical fire projectile** instead of charging physically into Dexios.

### Preparation

1. Announce `BEAST FIRE`.
2. Display `beast_preparing_fire`.
3. Hold the preparation for 1 second.
4. Show the Beast gathering purple magical energy.

### Fire release

1. Switch to `beast_attack_fire`.
2. Play the existing `flame.mp3` SFX once at release.
3. Spawn the supplied projectile/effect sprite `fire`.
4. Launch the fire from the Beast toward Dexios.
5. The fire projectile travels for 1.6 seconds.
6. It reaches Dexios at the established visual impact time.

Do not invent a generic flame image.

Use the actual supplied `fire` artwork.

The projectile must be visibly distinct from the Beast's body and travel along a readable path.

### Defense

The player must press **Space** to jump over the incoming fire.

Use `dexios_salto`.

For Beast Fire:

- No NORMAL BLOCK.
- No PERFECT PARRY.
- No counterattack.
- Successful dodge: 0 damage.
- Failed dodge: 10 damage.

### Jump window

- 0.0–1.0 seconds: preparation; Space ignored.
- 1.0–1.8 seconds: projectile approaches; Space is too early and does not register a successful dodge.
- 1.8–2.7 seconds: valid Space dodge window.
- After 2.7 seconds: attack resolves as failed if no valid jump occurred.

Use the established Chapter 1 jumping animation, with Dexios visibly airborne when the fire passes his position.

Display:

`DODGE`

for a successful jump.

Display:

`FAIL`

for a failed jump.

### Projectile cleanup

Destroy or hide the active `fire` projectile when:

- The attack resolves.
- The encounter restarts.
- The player exits the scene.
- The battle ends.

Do not leave old fire projectiles visible or active after the attack.

---

## 10. RAMPANT EXCAVATION — DEFEND WITH S

Attack name:

`RAMPANT EXCAVATION`

**AVAILABLE ONLY IN PHASE 2.**

This attack teaches the fourth directional defense: S.

The Beast drives its tail underground, and the attack travels beneath the battlefield before emerging from below Dexios.

### Preparation

1. Announce `RAMPANT EXCAVATION`.
2. Display `beast_preparing_down`.
3. Play `boar_prepare` SFX.
4. Show the Beast driving its tail underground.
5. Hold the preparation for 1 second.

### Attack

1. Switch to `beast_attack_down`.
2. Play `boar_attack` SFX.
3. Animate a visible underground disturbance moving toward Dexios.
4. Use subtle ground cracks, dust, or displaced earth to show the buried tail approaching.
5. The disturbance travels for 1.6 seconds.
6. At impact, the tail bursts upward beneath Dexios.

The movement must clearly originate from below.

The Beast's main body does not need to rush across the battlefield; the traveling underground tail or disturbance represents the approaching attack.

Preserve the supplied `beast_attack_down` artwork.

Do not introduce new required image assets for the terrain effects; use simple Phaser-generated visual effects if necessary.

### Defense

- Correct key: S.
- Dexios sprite: `dexios_abajo`.
- Failed damage: 10.
- Normal Block damage: 5.
- Perfect Parry: 0 damage and 5 counterdamage.

The defensive windows are identical to those of the other directional Beast attacks.

After resolving Rampant Excavation, restore the Beast's idle state and clear all underground effects.

---

## 11. ATTACK SELECTION — PHASE 1

The first phase begins with 80 HP.

Available attacks:

- Savage Jump.
- Wild Claw, randomly originating from left or right.
- Beast Fire.

Use random attack selection among these three abilities.

For Wild Claw, choose left or right with equal probability.

Store probabilities in encounter-specific configuration so they can be adjusted later.

Do not use Rampant Excavation in Phase 1.

### Attack behavior

Every Beast turn:

1. Select an available attack.
2. Present the attack announcement.
3. Perform its correct preparation pose.
4. Play the correct SFX.
5. Execute the full 1.6-second attack or projectile movement.
6. Process the appropriate defensive input.
7. Apply damage or counterattack once.
8. Restore the battlefield.
9. Continue to Dexios's turn.

Do not allow two boss attacks simultaneously.

---

## 12. PHASE TRANSITION — FIRST HP BAR DEPLETED

When the Beast reaches 0 HP during Phase 1:

**DO NOT TRIGGER VICTORY.**

Instead:

1. Finish the current action safely.
2. Lock player and enemy inputs.
3. Stop the current turn progression temporarily.
4. Play a brief transition using the existing Beast artwork.
5. Show the Beast recovering and becoming more aggressive.
6. Fully restore its health to **80/80**.
7. Update the boss HUD to indicate Phase 2.
8. Resume the battle with the Beast's first Phase 2 action.

### Visual presentation

Use the existing sprites.

A brief purple energy flash, small camera shake, and a title such as:

`THE BEAST — PHASE 2`

may be displayed to communicate the transition.

Do not require new phase-specific artwork or sounds.

Keep the existing `ch1_battle` music playing continuously.

Do not grant Dexios a free HP or Mana refill during the phase transition.

Dexios retains his current HP and Mana.

### Damage safeguards

Phase transitions must be processed exactly once.

If Triple Lightning depletes the Phase 1 HP bar in the middle of its three-hit animation:

- Complete the remaining visual animation safely.
- Do not carry excess damage into Phase 2.
- Do not apply extra damage to a zero-HP Phase 1 target.
- Begin the phase transition only after the player action finishes.

Use equivalent safeguards for Electric Arc or Perfect Parry counterattacks.

Do not create an accidental victory screen between phases.

---

## 13. PHASE 2 — NEW DEFENSE

Phase 2 begins with the Beast fully healed to 80 HP.

All Phase 1 abilities remain available.

Unlock:

`RAMPANT EXCAVATION`

### First Phase 2 attack

The first attack of Phase 2 must be **Rampant Excavation**.

This guarantees that the new defense is introduced immediately after the transition.

Before that first attack, display the tutorial described below.

After the tutorial and the first Rampant Excavation attack, allow the Beast to select randomly among:

- Savage Jump.
- Wild Claw.
- Beast Fire.
- Rampant Excavation.

Store the probabilities as configurable values.

Do not otherwise increase the boss's damage or reduce the defensive windows in Phase 2.

The new underground attack is the principal gameplay addition.

---

## 14. NEW TUTORIAL — DEFENDING FROM BELOW

Reuse the Chapter 1 tutorial pop-up system.

Display the tutorial once at the beginning of Phase 2, immediately before the first Rampant Excavation attack announcement.

Use:

- Centered dark panel.
- Approximately 90% opacity.
- Gold border.
- Archeologicaps for the title.
- Readable body text.
- Enter to continue.

### Tutorial message

**Title: `DEFENDING FROM BELOW`**

Text:

"The Beast can now attack from beneath the ground! Watch the underground movement approaching Dexios and press S to defend. A normal block reduces the damage, while a Perfect Parry prevents all damage and lets Dexios counterattack!"

### Tutorial behavior

- Pause the entire combat while the tutorial is visible.
- Do not begin the attack announcement until the tutorial closes.
- Do not advance attack timers during the tutorial.
- Do not consume an input accidentally when the player presses Enter.
- After closing, begin the complete Rampant Excavation sequence.
- Display the tutorial only once per encounter attempt.
- Reset the tutorial flag on restart.

Do not repeat any previously taught mechanics.

Do not introduce narrative dialogue yet.

---

## 15. DAMAGE FEEDBACK AND BOSS REACTIONS

Whenever the Beast receives damage from:

- Triple Lightning.
- Electric Arc.
- Perfect Parry counterattack.

Display:

`beast_hurt`

Each damage event must:

1. Apply its correct damage exactly once.
2. Update the boss HP bar.
3. Briefly show the hurt sprite.
4. Trigger the existing hit feedback.
5. Return to the appropriate state when safe.

Reuse the current Chapter 1 impact sound conventions for player attacks.

No dedicated Beast hurt audio file has been specified, so do not invent a required `beast_hurt.mp3`.

Keep damage feedback readable without interrupting an unfinished multi-hit sequence.

### Dexios attacks

Triple Lightning must preserve all three separate damaging hits, including the correct Dexios frames, sounds, movement, and camera shakes.

Electric Arc must preserve its existing charging minigame, NORMAL/PERFECT/FAIL calculations, Mana consumption, release sprite, release SFX, movement, and camera behavior.

The Beast is the only enemy in this encounter, so no target-selection menu is necessary.

---

## 16. BOSS HUD AND TURN ORDER

### Boss HUD

Display:

`THE BEAST`

Show the current phase's HP bar.

Phase 1:

`80 / 80`

After the transition, refill the bar to:

`80 / 80`

Clearly indicate that the Beast has entered Phase 2.

Use the established Chapter 1 combat HUD style, adapting the visual theme to the Beast's purple energy.

Do not display two simultaneous independent enemies or two simultaneous HP bars.

The Beast is one boss with two consecutive HP phases.

### Dexios HUD

Preserve:

- Dexios portrait.
- HP, maximum 65.
- Mana, maximum 40.

Keep the Mana bar visible throughout both phases.

Chaos remains hidden and unavailable.

### Turn order

Show:

**THE BEAST → DEXIOS → repeat**

Reuse the established top-left turn-order system.

Use `beast_base` for the Beast's turn portrait if no separate boss icon has been supplied.

Do not require a new icon asset.

---

## 17. SOUND EFFECT MAPPING

Use the following sound assignments exactly:

| Attack | Preparation SFX | Attack SFX |
|---|---|---|
| Savage Jump | `boar_prepare` | `boar_attack` |
| Wild Claw Left | `wolf_prepare` | `wolf_attack` |
| Wild Claw Right | `wolf_prepare` | `wolf_attack` |
| Rampant Excavation | `boar_prepare` | `boar_attack` |
| Beast Fire | No new preparation SFX required | `flame.mp3` |

The fire sound plays when the purple fire is launched.

Do not reuse the Wild Boar or Wolf attack sounds for Beast Fire.

Do not invent new boss-specific SFX files.

All sounds must respect the existing Chapter 1 M toggle.

The background music `ch1_battle` must respect the N toggle.

### General audio safeguards

- Play each preparation or attack SFX once per appropriate event.
- Do not continuously retrigger a sound during movement.
- Avoid uncontrolled overlapping instances.
- Stop or clean up sounds when restarting or exiting.
- Continue the same music track during the Phase 1 to Phase 2 transition.
- Preserve all existing Chapter 29 audio behavior.

---

## 18. VICTORY AND DEFEAT

### Phase 1 HP reaches zero

Transition to Phase 2.

Do not end combat.

### Phase 2 HP reaches zero

Trigger normal Chapter 1 victory.

1. Finish the last damaging animation or counterattack safely.
2. Mark the Beast as defeated.
3. Disable further attacks and combat inputs.
4. Stop or fade out `ch1_battle`.
5. Display the existing victory interface.
6. Offer Retry and Return to Combat Select.

**IMPORTANT: For this implementation, defeating the second 80-HP phase is the final victory condition.**

Do not interrupt the victory at 20 HP or any other threshold.

Do not implement the neck-grab cinematic, scripted final attack, Chaos unlock, or interactive narrative sequence.

Those features will be added in a separate implementation stage.

### Defeat

If Dexios reaches 0 HP:

- Stop the combat.
- Cancel pending boss actions.
- Stop or fade out music.
- Display the existing Chapter 1 defeat interface.
- Offer Retry and Return to Combat Select.

### Restart

Restore:

- Dexios HP: 65/65.
- Dexios Mana: 40/40.
- Beast Phase: 1.
- Beast HP: 80/80.
- Rampant Excavation locked.
- Phase 2 tutorial reset.
- Initial turn: The Beast.
- Sprite positions reset.
- Camera position and zoom reset.
- No active attack or projectile.
- All timing states cleared.

Preserve the user's music and SFX preferences.

---

## 19. EXISTING CHAPTER 1 SHORTCUTS

Preserve the current shortcuts:

- R — Restart Combat 7.
- N — Toggle battle music.
- M — Toggle sound effects.
- Escape — Return to `scene_ch1_select`.

These shortcuts must work during:

- Beast preparation.
- Attack movement.
- Defensive windows.
- Beast Fire projectile travel.
- Phase transition.
- Tutorial pop-up.
- Triple Lightning.
- Electric Arc charging and release.
- Victory and defeat.

Do not reimplement or replace an already working shared shortcut system.

Clean up event listeners, timers, tweens, projectiles, sounds, and camera effects whenever the scene restarts or shuts down.

---

## 20. IMPLEMENTATION SAFETY

Before modifying the project, inspect:

- Chapter 1 scene registration.
- The current combat encounter configurations.
- Existing Wild Boar attacks.
- Existing Wolf directional attacks.
- Existing Furious Boar jump defense.
- Existing Triple Lightning.
- Existing Electric Arc.
- Existing tutorial pop-ups.
- Existing Phase/HP state handling where reusable.
- Existing music and sound-effect management.
- Existing victory/defeat flow.
- Existing keyboard shortcuts.

Extend the current working implementation conservatively.

Prefer configurable definitions for:

- Boss HP and phases.
- Attack selection.
- Attack timing.
- Defense results.
- Movement paths.
- Projectile effects.
- Sprite mappings.
- Sound mappings.
- Phase transition.
- Tutorial display flags.

Keep every boss-specific rule isolated to Combat 7.

Do not change the current attack windows in Combats 1–6.

Do not change Chapter 29.

Do not add exploration, potion crafting, additional characters, narrative dialogues, Chaos resources, or cinematic quick-time events.

---

## 21. ACCEPTANCE TESTS

Verify all of the following:

### Scene and general mechanics

1. Combat 7 is enabled in the Chapter 1 encounter selector.
2. `scene_ch1_combat7` launches successfully.
3. The new `ch1_combat7_background` is displayed.
4. Only Dexios and The Beast appear.
5. The Beast's supplied sprites display with correct scaling and grounding.
6. Dexios begins with 65 HP and 40 Mana.
7. The Beast begins Phase 1 with 80 HP.
8. The turn order is The Beast → Dexios.

### Boss attacks

9. Savage Jump uses `beast_preparing_up` and `beast_attack_up`.
10. Savage Jump visibly leaps toward Dexios's head and requires W.
11. Wild Claw uses the correct left/right preparation and attack sprites.
12. Left Wild Claw requires A.
13. Right Wild Claw requires D.
14. Beast Fire uses `beast_preparing_fire`, `beast_attack_fire`, and the `fire` projectile.
15. Beast Fire requires Space and cannot be blocked normally.
16. Rampant Excavation is unavailable in Phase 1.
17. Rampant Excavation uses `beast_preparing_down` and `beast_attack_down`.
18. Rampant Excavation visually travels underground and emerges below Dexios.
19. Rampant Excavation requires S.
20. The correct sound effects play for each attack.

### Timing and damage

21. Every preparation lasts exactly 1 second.
22. Every attack movement or projectile travel lasts 1.6 seconds.
23. Normal Block is available during the first 0.8 seconds of movement.
24. Perfect Parry begins after 0.8 seconds of movement.
25. The Perfect Parry window lasts through 0.1 seconds after impact.
26. Failed directional defense causes 10 damage.
27. Normal Block causes 5 damage.
28. Perfect Parry prevents damage and counters for 5.
29. Successful Beast Fire jumping prevents all damage without counterattacking.
30. Failed Beast Fire jumping causes 10 damage.
31. No attack applies damage twice.
32. Only the first valid directional input determines the defense outcome.

### Phase system

33. Depleting the first 80-HP bar does not trigger victory.
34. The Beast enters Phase 2 exactly once.
35. Its HP restores to 80/80.
36. Dexios retains his current HP and Mana during the transition.
37. The same background music continues playing.
38. The Phase 2 tutorial appears once.
39. The first attack of Phase 2 is Rampant Excavation.
40. After its first attack, the Beast can use all its available abilities.
41. The first phase's leftover damage cannot carry into the second phase.

### Player abilities and endings

42. Triple Lightning remains unchanged.
43. Electric Arc remains unchanged, including Mana cost and timing challenge.
44. The Beast displays `beast_hurt` when damaged.
45. Depleting the second 80-HP bar triggers victory.
46. No cinematic, neck grab, or Chaos event interrupts victory.
47. Dexios reaching 0 HP triggers defeat.
48. R fully resets both phases, stats, and tutorial state.
49. N, M, and Escape work correctly.
50. Combats 1–6 remain functional and unchanged.
51. Chapter 29 remains completely unchanged.
52. The project builds successfully.

After implementation, report the files changed, assets loaded, scenes registered, testing performed, and any remaining issues.

**FINAL OBJECTIVE: Create a complete, polished Chapter 1 final boss encounter featuring The Beast, two 80-HP phases, four named attacks with five defensive directions/actions, the new S underground-defense tutorial, and a standard victory after the second phase. Preserve all previous gameplay and Chapter 29.**

# LA DEXÍADA — CHAPTER 1: THE BEAST FINAL CINEMATIC

Implement the interactive ending cinematic for Chapter 1 Combat 7, immediately after defeating The Beast's second HP phase.

The cinematic uses eight supplied illustrations (`cinematic1` through `cinematic8`), three dialogue moments, camera-shake effects, and a sequence of keyboard quick-time events.

The final result screen must display:

**… Victory?**

instead of the normal victory title.

## CRITICAL REQUIREMENTS

**The existing Chapter 1 Combat 7 is already working. Preserve its gameplay completely.**

Do not modify:

- The Beast's two 80-HP phases.
- Its existing attack selection and defensive timings.
- Savage Jump, Wild Claw, Beast Fire, or Rampant Excavation.
- Triple Lightning or Electric Arc.
- Dexios's HP, Mana, and abilities.
- The established battle HUD and tutorials.
- The current boss phase transition.
- The existing music and SFX controls.
- The normal behavior of Chapter 1 Combats 1–6.

**Chapter 29 must remain completely unchanged.**

Do not rebuild Combat 7. Add the cinematic as a new scene-specific ending sequence that replaces only the standard victory transition after Phase 2.

Do not implement Chaotic Lightning as a selectable gameplay ability.

The red Chaos attacks shown in this sequence are cinematic and interactive, not part of the normal combat system.

---

## 1. CINEMATIC TRIGGER

The cinematic must trigger when The Beast's **second HP bar reaches zero**.

### Existing behavior

Currently, defeating Phase 2 immediately activates the standard victory screen.

### New behavior

When Phase 2 reaches 0 HP:

1. Do not display the victory screen yet.
2. Finish the current player attack or Perfect Parry counterattack safely.
3. Prevent additional damage or turn progression.
4. Lock normal combat input.
5. Mark the boss ending sequence as triggered.
6. Begin a scripted final Beast movement.
7. Once The Beast reaches Dexios, start the eight-part cinematic.

The cinematic must activate **exactly once**, even if the finishing action is Triple Lightning, Electric Arc, or a defensive counterattack.

Do not let an unfinished multi-hit attack trigger multiple cinematic events.

### Important phase distinction

Depleting the first 80-HP bar must still trigger the existing transition into Phase 2.

Only depleting the **second** 80-HP bar triggers this cinematic.

Do not change any phase-transition behavior.

---

## 2. THE BEAST'S FINAL SCRIPTED ATTACK

Before `cinematic1`, The Beast performs a special scripted approach resembling Savage Jump.

This is a narrative transition, not an ordinary combat attack.

### Sequence

After the final damaging action ends:

1. Hide or disable the active ability menu.
2. Temporarily prevent the normal victory screen.
3. Restore Dexios and The Beast to their appropriate battlefield positions.
4. Display `beast_preparing_up`.
5. Play the existing `boar_prepare` SFX.
6. Hold the preparation pose for **1 second**.
7. Switch to `beast_attack_up`.
8. Play the existing `boar_attack` SFX.
9. The Beast leaps toward Dexios using the established Savage Jump movement.
10. The approach lasts **1.6 seconds**.
11. The Beast reaches Dexios.
12. Immediately replace the battle presentation with `cinematic1`.

The Beast must visibly jump toward Dexios's head, as though launching one last desperate attack.

### Scripted-attack exceptions

This final movement:

- Does not open a defensive timing window.
- Does not require W.
- Does not damage Dexios.
- Cannot trigger Perfect Parry.
- Cannot activate another turn.
- Cannot trigger another victory event.
- Does not restore the Beast's HP.

The purpose is to transition seamlessly into the cinematic illustration of The Beast grabbing Dexios.

At the moment of contact, switch immediately to the first cinematic image.

Avoid a visible black frame or unrelated transition screen between the attack and `cinematic1`.

---

## 3. CINEMATIC ASSET REGISTRATION

The following eight final images are supplied:

- `cinematic1`
- `cinematic2`
- `cinematic3`
- `cinematic4`
- `cinematic5`
- `cinematic6`
- `cinematic7`
- `cinematic8`

Load them through the existing asset-management system.

Use their exact physical filenames and extensions.

Do not rename them or generate replacement images.

Each illustration is a separate cinematic frame.

### Presentation

The game uses a 1920 × 1080 viewport.

Each cinematic image must:

- Be centered.
- Preserve its original aspect ratio.
- Fill the available cinematic area appropriately.
- Avoid unnecessary cropping of characters, faces, or important action.
- Remain visible throughout its corresponding sequence.
- Render behind dialogue panels and key prompts.

Use a black background behind the illustration if aspect-ratio fitting leaves unused space.

The cinematic images replace the normal battlefield visually.

While the cinematic is active, hide the combat HUD, health bars, Mana bar, turn-order icons, ability menus, target-selection markers, and defensive indicators.

Do not permanently destroy the underlying Combat 7 systems. Restore or clean them up correctly when restarting or exiting.

---

## 4. CINEMATIC DIALOGUE UI

Create a reusable cinematic dialogue overlay.

### Visual style

- Horizontal black panel along the bottom of the screen.
- Background opacity: **90%**.
- Thin gold border.
- White dialogue text.
- Clear and readable font.
- Comfortable internal padding.
- Text vertically centered within the panel.
- Wide enough for longer sentences.
- Maintain the established La Dexíada aesthetic.

The dialogue panel must remain separate from the images so the illustrations can later be replaced without editing the text.

### Dialogue rules

- Dialogue appears only on cinematic frames with specified text.
- Cinematic frames without specified dialogue should not display an empty dialogue panel.
- Do not invent additional narrative lines.
- Do not automatically advance dialogue-driven input scenes.
- Do not show an Enter prompt.
- The relevant QTE key is the only input that advances interactive frames.

### Exact dialogue assignments

**Cinematic 1:**

"Wh-What??? I can´t lose…"

**Cinematic 2:**

"I … should … not… DAAMNNN ITTT!!!"

**Cinematic 3:**

"Why won`t you dieeee!!!!"

Cinematics 4, 5, 6, 7, and 8 have **no dialogue text** for now.

Preserve the supplied dialogue punctuation and capitalization.

---

## 5. CINEMATIC 1 — THE GRAB

Image:

`cinematic1`

### Sequence

As soon as The Beast's scripted Savage Jump reaches Dexios:

1. Hide the normal combat HUD.
2. Display `cinematic1` across the cinematic viewport.
3. Display the bottom dialogue panel.
4. Show the following text:

"Wh-What??? I can´t lose…"

### Duration

**5 seconds.**

The image and text remain visible for the complete five-second duration.

There is no QTE input during this scene.

After exactly five seconds, automatically transition to `cinematic2`.

Do not show victory yet.

Use Phaser-managed timing rather than untracked browser timers.

---

## 6. CINEMATIC 2 — BREAKING FREE

Image:

`cinematic2`

Dialogue:

"I … should … not… DAAMNNN ITTT!!!"

### Presentation

When Cinematic 2 begins:

1. Display `cinematic2`.
2. Display the dialogue in the bottom black-and-gold panel.
3. Display a large, clearly visible **W** key prompt.
4. Begin tracking valid W presses.

### QTE requirement

The player must press:

**W exactly 10 times.**

Each valid W press:

- Counts as one input.
- Triggers a noticeable camera shake.
- Produces immediate feedback on the W prompt.
- Advances the internal counter by one.

Do not change images between W presses.

Keep the cinematic image and dialogue visible throughout this sequence.

### Camera shake

Every valid W press must make the entire cinematic presentation visibly shake, as if Dexios is struggling violently against The Beast's grip.

Use a short, noticeable camera shake.

The intensity and duration should be configurable.

Avoid excessively long shakes that overlap uncontrollably with subsequent transitions.

### Key handling

- Count actual individual W presses, not continuous holding.
- Holding W must not automatically count as ten presses.
- Ignore operating-system key-repeat events.
- Require a genuine new keydown after release.
- Ignore all unrelated keys except the existing Chapter 1 global hotkeys.

### Completion

After the tenth valid W press:

1. Trigger the final shake for that press.
2. Complete the feedback.
3. Remove the W prompt.
4. Transition to `cinematic3`.

There is **no time limit** and no failure state.

The scene remains active until the player completes all ten W presses.

---

## 7. CINEMATIC 3 — FIRST CHAOTIC ATTACK

Image:

`cinematic3`

Dialogue:

"Why won`t you dieeee!!!!"

### Entry behavior

When Cinematic 3 appears:

1. Replace the previous illustration with `cinematic3`.
2. Immediately trigger a noticeable camera shake.
3. Display the dialogue panel.
4. Display a large **A** key prompt.

### Interaction

Wait for the player to press:

**A**

Upon one valid A press:

1. Mark the input as completed.
2. Remove the key prompt.
3. Transition to `cinematic4`.

Do not transition automatically.

Do not impose a time limit.

Other keys must not advance the scene.

---

## 8. CINEMATIC 4 — SECOND CHAOTIC ATTACK

Image:

`cinematic4`

No dialogue.

### Entry behavior

1. Display `cinematic4`.
2. Shake the camera immediately as the image appears.
3. Display a large **D** key prompt.

### Interaction

Wait for:

**D**

One valid D press advances to `cinematic5`.

No timer or failure condition.

---

## 9. CINEMATIC 5 — THIRD CHAOTIC ATTACK

Image:

`cinematic5`

No dialogue.

### Entry behavior

1. Display `cinematic5`.
2. Immediately shake the camera.
3. Display a large **A** key prompt.

### Interaction

Wait for:

**A**

One valid A press advances to `cinematic6`.

No automatic transition.

---

## 10. CINEMATIC 6 — FOURTH CHAOTIC ATTACK

Image:

`cinematic6`

No dialogue.

### Entry behavior

1. Display `cinematic6`.
2. Immediately shake the camera.
3. Display a large **D** key prompt.

### Interaction

Wait for:

**D**

One valid D press advances to `cinematic7`.

---

## 11. CINEMATIC 7 — FIFTH CHAOTIC ATTACK

Image:

`cinematic7`

No dialogue.

### Entry behavior

1. Display `cinematic7`.
2. Immediately shake the camera.
3. Display a large **A** key prompt.

### Interaction

Wait for:

**A**

One valid A press advances to `cinematic8`.

---

## 12. CINEMATIC 8 — FINAL CHAOTIC BARRAGE

Image:

`cinematic8`

No dialogue.

This is the final interactive cinematic.

### Entry behavior

When Cinematic 8 begins:

1. Display `cinematic8`.
2. Immediately shake the camera.
3. Display a large **A** key prompt.
4. Begin the final alternating-key sequence.

### Input sequence

The player must alternate:

**A → D → A → D**

Continue until **A has been pressed five times and D has been pressed five times**.

The sequence consists of ten successful inputs in total:

`A, D, A, D, A, D, A, D, A, D`

### Individual input behavior

Each time the player presses the correct prompted key:

1. Trigger a noticeable camera shake.
2. Briefly emphasize the completed key prompt.
3. Increment the successful-input counter.
4. Replace the current prompt with the next required key.

Example:

- Display A.
- Player presses A.
- Shake.
- Display D.
- Player presses D.
- Shake.
- Display A again.

Continue until all ten inputs are completed.

### Visual behavior

Keep `cinematic8` visible throughout the entire alternating sequence.

Do not replay or replace the illustration for every press.

The camera shake represents repeated violent Chaos-powered impacts.

The shake must occur on **every correct press**, not only when the image first appears.

### Input validation

- Only the currently prompted key is accepted.
- Incorrect keys do not advance the sequence.
- Holding A or D does not generate repeated valid presses.
- Require distinct key presses.
- Debounce input so a single physical press cannot satisfy multiple prompts.
- Do not accidentally accept a key still held from Cinematic 7.
- Do not count Chapter 1 hotkeys as QTE inputs.

### Completion

After the fifth successful D press:

1. Trigger the final camera shake.
2. Remove the key prompt.
3. Finish the cinematic interaction.
4. Transition to the altered victory screen.

Do not start another combat turn.

There is no QTE failure state and no time limit.

---

## 13. COMPLETE CINEMATIC SEQUENCE

The exact sequence must be:

| Frame | Dialogue | Input / completion |
|---|---|---|
| `cinematic1` | Wh-What??? I can´t lose… | Automatically after 5 seconds |
| `cinematic2` | I … should … not… DAAMNNN ITTT!!! | W × 10, shake on every press |
| `cinematic3` | Why won`t you dieeee!!!! | Shake on entry, then A × 1 |
| `cinematic4` | None | Shake on entry, then D × 1 |
| `cinematic5` | None | Shake on entry, then A × 1 |
| `cinematic6` | None | Shake on entry, then D × 1 |
| `cinematic7` | None | Shake on entry, then A × 1 |
| `cinematic8` | None | Shake on entry, then alternate A/D five times each |

No cinematic frame may be skipped accidentally.

Only the specified input or timed completion advances the current frame.

Do not insert unrequested dialogue, additional animations, unrelated scenes, or additional required key combinations.

---

## 14. KEY PROMPT PRESENTATION

Create a consistent, readable QTE prompt.

### Visual style

- Large uppercase letter.
- White text or an established gold-accented key indicator.
- Dark background or border for readability.
- Prominent enough to identify immediately.
- Positioned near the lower central area, above the dialogue panel if dialogue is present.
- Do not cover Dexios's face or the principal action in the illustration.

The prompts should visually match the existing timing challenges and tutorial UI.

### Feedback

When the correct key is pressed:

- Briefly brighten or scale the prompt.
- Trigger the specified camera shake.
- Then transition or display the next key.

For Cinematic 2, optionally display a subtle progress indicator such as `3/10` to communicate the repeated-input objective.

For Cinematic 8, a similar `4/10` counter may be used.

Do not introduce additional numerical controls or different required keys.

---

## 15. CAMERA SHAKE SYSTEM

Reuse Phaser's camera shake functionality or an existing Chapter 1 shake helper.

Use configurable shake duration and intensity.

### Shake triggers

**Cinematic 1**

No required shake on entry.

**Cinematic 2**

Shake on every valid W press.

**Cinematic 3**

Shake when the image first appears.

**Cinematic 4**

Shake when the image first appears.

**Cinematic 5**

Shake when the image first appears.

**Cinematic 6**

Shake when the image first appears.

**Cinematic 7**

Shake when the image first appears.

**Cinematic 8**

Shake when the image first appears and again on every correct A/D press.

### Important safeguards

- Prevent camera offsets from remaining after shaking.
- Do not leave the camera permanently zoomed or displaced.
- Avoid shake effects accumulating indefinitely.
- Ensure the dialogue and key prompts remain readable.
- Restore the camera to its normal position when exiting the cinematic.
- Clean up camera effects during restart and scene transitions.

The camera shake should feel intense but must not make the cinematic impossible to read.

---

## 16. MUSIC AND SOUND EFFECTS

For now, reuse the current Chapter 1 battle music:

`ch1_battle`

Do not require new music.

### During the cinematic

- Keep the existing battle music playing through the scripted final approach and cinematic sequence.
- Do not restart the song when `cinematic1` begins.
- Do not create overlapping music instances.
- Preserve the existing N music toggle.

### Scripted Beast approach SFX

Reuse:

- `boar_prepare` when the final Savage Jump preparation begins.
- `boar_attack` when the scripted jump begins.

No additional cinematic-specific SFX have been supplied or requested.

Do not introduce missing required audio assets.

Preserve the existing M sound-effects toggle.

### When the final victory screen appears

Stop or fade the existing combat music using the current Chapter 1 victory transition conventions.

Do not automatically switch to Chapter 29's music.

---

## 17. FINAL VICTORY SCREEN — SPECIAL TITLE

Once Cinematic 8 is fully completed, show the existing Chapter 1 victory screen.

However, replace the normal victory title with exactly:

**… Victory?**

Preserve the leading ellipsis, capitalization, space, and final question mark.

### Important

The text must NOT be:

- `VICTORY`
- `VICTORY!`
- `YOU WIN`
- `THE BEAST DEFEATED`

For this encounter, the intended wording is:

`… Victory?`

### Victory screen behavior

Keep the existing Chapter 1 victory screen styling and navigation.

Preserve the currently working options, including:

- Retry.
- Return to Combat Select.

Do not modify the global victory screen title used by Combats 1–6.

Use a scene-specific victory-title override for Combat 7.

The altered wording should communicate that Dexios has technically won, but something disturbing has happened.

Do not add any extra narrative text after the cinematic for now.

---

## 18. CINEMATIC STATE MANAGEMENT

Implement the cinematic as an explicit state-driven sequence rather than a series of loosely connected timers.

Recommended states:

- `BOSS_FINAL_APPROACH`
- `CINEMATIC_1`
- `CINEMATIC_2`
- `CINEMATIC_3`
- `CINEMATIC_4`
- `CINEMATIC_5`
- `CINEMATIC_6`
- `CINEMATIC_7`
- `CINEMATIC_8`
- `SPECIAL_VICTORY`

Track:

- Current cinematic index.
- Whether the final sequence has begun.
- Current expected key.
- Valid input count.
- Whether input is currently locked during transitions.
- Active dialogue text.
- Active camera shake.
- Any pending timed transition.

### Prevention of duplicate events

- The cinematic must trigger once.
- Each QTE press counts once.
- Cinematic transitions happen once.
- The final victory screen appears once.
- No combat actions may resume while the cinematic is active.
- The normal Phase 2 victory handler must not activate independently.

### Handling interrupted attacks

If Phase 2 is defeated during a Triple Lightning multi-hit attack, wait for the current player action to conclude safely before beginning the final approach.

If a Perfect Parry counterattack defeats Phase 2, finish the counterattack feedback first.

Do not apply damage to the already defeated Phase 2 boss while transitioning.

Do not show the normal victory screen even momentarily before the final approach begins.

---

## 19. KEYBOARD SHORTCUTS

Preserve the existing Chapter 1 controls:

- R — Restart Combat 7.
- N — Toggle music.
- M — Toggle SFX.
- Escape — Return to `scene_ch1_select`.

These must remain functional during every cinematic frame, including Cinematic 2 and Cinematic 8.

### Restart

Pressing R during the cinematic restarts the entire boss encounter from Phase 1.

Reset:

- Dexios HP and Mana.
- Beast HP and phase.
- Boss attacks and turn sequence.
- Tutorial state.
- Cinematic state.
- QTE counters.
- Current dialogue.
- Camera position and zoom.
- Image overlays.
- Sound and timer state.

Do not restart directly from Cinematic 1.

### Escape

Pressing Escape during the cinematic exits to `scene_ch1_select`.

Clean up all cinematic images, dialogue overlays, QTE input handlers, music, camera shake, and pending timers.

### Input conflicts

While the cinematic is active:

- W, A, and D must control only the cinematic QTE.
- Do not execute normal defense animations.
- Do not activate player attacks.
- Do not open target selection.
- Do not start Electric Arc.
- Do not advance combat turns.
- Do not let Enter skip cinematic frames.

Global shortcuts R, N, M, and Escape must be processed independently and safely.

Use keydown-edge detection and ignore keyboard auto-repeat.

When changing cinematic frames, clear or synchronize held-key state so an input from the previous frame cannot automatically complete the next frame.

---

## 20. IMPLEMENTATION SAFETY

Before editing, inspect the current Combat 7 implementation to locate:

- Boss Phase 2 defeat detection.
- Existing victory transition.
- The Beast's Savage Jump animation.
- Beast preparation and attack SFX.
- Battle audio management.
- Existing cinematic or dialogue overlays from Chapter 29 that can be reused without changing their behavior.
- Chapter 1 hotkeys and scene cleanup.
- Camera shake and animation helpers.

Prefer implementing a separate, reusable Chapter 1 cinematic controller or scene-specific sequence.

Do not duplicate or rewrite the entire boss battle.

Only intercept Phase 2 victory and replace its final transition.

Do not edit the existing Chapter 29 narrative cinematic code unless absolutely necessary for a shared helper, and preserve its existing behavior exactly.

Do not implement the overworld, healing system, potion crafting, or other Chapter 1 narrative dialogue as part of this change.

Do not add Chaos as a normal selectable ability.

---

## 21. ACCEPTANCE TESTS

Verify the following:

1. Combat 7 still starts normally with The Beast at 80 HP in Phase 1.
2. Defeating Phase 1 still restores the Beast to 80 HP and begins Phase 2.
3. The existing Rampant Excavation tutorial still works.
4. All Beast attacks and defensive timings remain unchanged.
5. Triple Lightning and Electric Arc remain unchanged.
6. Reaching 0 HP in Phase 2 no longer immediately displays normal victory.
7. The Beast performs its final scripted Savage Jump preparation.
8. The Beast approaches Dexios using `beast_attack_up`.
9. The final approach causes no damage and requires no defensive input.
10. At contact, `cinematic1` appears.
11. `cinematic1` displays the exact first dialogue for five seconds.
12. It automatically transitions to `cinematic2`.
13. `cinematic2` displays the exact second dialogue.
14. The W prompt appears and requires exactly ten separate presses.
15. Each valid W press shakes the camera.
16. Holding W does not count as repeated presses.
17. `cinematic3` appears with the exact third dialogue and camera shake.
18. A advances Cinematic 3 to Cinematic 4.
19. Cinematic 4 requires D.
20. Cinematic 5 requires A.
21. Cinematic 6 requires D.
22. Cinematic 7 requires A.
23. Each of Cinematics 3–7 shakes the camera on entry.
24. Cinematic 8 shakes the camera on entry.
25. Cinematic 8 alternates A and D five times each, starting with A.
26. Every correct input in Cinematic 8 triggers a camera shake.
27. Incorrect inputs never advance the cinematic.
28. No QTE has a time limit or failure state.
29. The final cinematic completes only after the tenth valid A/D input.
30. The existing victory interface appears with the title `… Victory?`.
31. Combats 1–6 continue to display their ordinary victory title.
32. R restarts the complete boss encounter from Phase 1.
33. Escape returns safely to the Chapter 1 combat selector.
34. N and M preserve their music/SFX functionality.
35. No duplicated events, stale timers, lingering overlays, stuck input states, or overlapping music remain.
36. Chapter 29 is unaffected.
37. The project builds successfully.

After implementing, report the modified files, cinematic assets registered, changes to the boss victory transition, testing performed, and any remaining issues.

**FINAL OBJECTIVE:** After defeating The Beast's second HP phase, replace the immediate victory with a scripted Savage Jump approach, followed by eight cinematic illustrations, the exact supplied dialogue, interactive W/A/D commands, camera shakes, and a final result reading `… Victory?`, without altering any established gameplay or Chapter 29.