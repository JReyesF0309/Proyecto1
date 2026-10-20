# La Dexíada

Prototipo de combate por turnos entre Dexios e Iobrontes en el Templo del Trueno. El escenario y los personajes se inspiran en `DESIGN.md` y en las referencias artísticas incluidas en el proyecto.

## Requisitos y ejecución

Se necesita Node.js. Instala dependencias una vez y arranca el juego en el navegador:

```sh
npm install
npm start
```

Para abrir la versión de escritorio con Electron, ejecuta `npm run electron`. La aplicación y el juego están escritos en TypeScript.

## Controles

**Ataques durante el turno de Dexios**

- `1` o botón: Triple Lightning — 3 golpes de 5, sin coste.
- `2` o botón: Electric Arc — 30 de daño, cuesta 10 de maná.
- `3` o botón: Chaotic Lightning — 70 de daño, cuesta 50 de Caos e inflige 20 a Dexios.

**Defensas durante el ataque de Iobrontes**

- `W`: defensa alta.
- `A`: defensa izquierda.
- `D`: defensa derecha.
- `S`: salto defensivo.

La dirección correcta pulsada dentro de los primeros 0,6 segundos hace una parada perfecta: evita el daño y contraataca por 5. Entre 0,6 y 1 segundo hace un bloqueo imperfecto: recibe 5 de daño. Una respuesta errónea o tardía recibe 20. El ataque mantiene su aviso y proyectil visibles durante toda la secuencia.

Pulsa `R` después de una victoria o derrota para empezar de nuevo.

## Comprobaciones y publicación

```sh
npm run typecheck
npm run build
npm run build:electron
```

La compilación web se genera en `docs/` para GitHub Pages.
