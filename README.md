# La Dexíada

Prototipo de combate por turnos en el Templo de Iobrontes, desarrollado con Phaser y TypeScript según [DESIGN.md](./DESIGN.md). Incluye a Dexios, Furai y Sahira contra Iobrontes, con el escenario y los fotogramas de personaje suministrados.

## Ejecución

Se necesita Node.js:

```sh
npm install
npm start
```

Para abrir la versión de escritorio con Electron, ejecuta `npm run electron`.

## Turnos y habilidades

El orden es fijo: **Furai → Iobrontes → Dexios → Iobrontes → Sahira → Iobrontes**, y se repite. Los personajes incapacitados se saltan; Iobrontes escoge al azar un aliado consciente para su cadena de tres ataques.

- **Dexios:** Triple Lightning — 3 × 5 de daño, gratis; Electric Arc — 30 de daño, 20 de maná; Chaotic Lightning — 70 de daño, 50 de Caos y 10 de daño propio.
- **Furai:** Tiger Spear — 15 de daño, gratis; Tiger Fang — 2 × 15 de daño, 20 de maná; Armor Break — el siguiente ataque elegido duplica su primer impacto, 20 de maná.
- **Sahira:** Jackal Strike — 15 de daño, gratis; Hippopotamus Healing — restaura toda la salud de un aliado consciente, 40 de maná.

Armor Break potencia solo el primer impacto de la siguiente habilidad ofensiva seleccionada. Los contraataques automáticos no consumen la marca.

## Controles

- `1`, `2`, `3` o los botones del menú: elegir una habilidad.
- Al curar: selecciona a Dexios, Furai o Sahira con `1`, `2`, `3` o pulsa su panel. No se puede reanimar a un personaje incapacitado.
- `W`, `A`, `S`, `D`: defenderse arriba, izquierda, abajo y derecha durante los ataques de Iobrontes. Solo se acepta el primer input dentro de la ventana.
- `M`: silenciar o activar el audio.
- `Esc`: cancelar la selección de objetivo de curación.
- `R`: volver a empezar después de la victoria o derrota.

Iobrontes avisa durante 1 segundo y lanza cada rayo durante 1 segundo. Antes de T−0,5 s no se acepta defensa; de T−0,5 s a T−0,1 s, la dirección correcta bloquea; de T−0,1 s a T+0,1 s, la dirección correcta ejecuta una parada perfecta. La resolución del daño espera hasta T+0,1 s.

Cada rayo sin bloquear causa 10 de daño. El bloqueo imperfecto causa 5 a Dexios y Furai, y 0 a Sahira; una dirección incorrecta o no responder causa 10. Dexios obtiene 20 de Caos por cada golpe enemigo que le haga daño y contraataca por 5 con cada parada perfecta. Furai contraataca por 20 solo si para perfectamente los tres rayos de una misma cadena. Sahira no contraataca.

## Recursos y comprobaciones

El escenario y las imágenes se cargan desde `escenario.png` y `assets/characters/`. Los fondos negros de los fotogramas se eliminan al cargar para conservar los detalles oscuros del vestuario. Las referencias, posiciones, estadísticas, habilidades, escalas y tiempos están centralizados en `src/game-config.ts`.

```sh
npm run typecheck
npm run build
npm run build:electron
```

La compilación web se genera en `docs/` para GitHub Pages. La música original se sintetiza en el navegador con percusión, melodía de metales y acompañamiento de piano; empieza tras la primera interacción por las restricciones de reproducción automática del navegador.
