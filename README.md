# Generador de Kinegramas

**🌐 https://kinegram.3m4.net**

Herramienta web para crear **kinegramas** (animación de barrera o *scanimation*): una ilusión óptica donde los fotogramas de una animación se entrelazan en franjas verticales dentro de una sola imagen impresa. Al deslizar encima una rejilla transparente con líneas negras, las ranuras revelan un fotograma a la vez y la imagen cobra movimiento.

La app genera ambas partes listas para imprimir: los **kinegramas** (en papel) y su **rejilla** (en acetato/transparencia).

## Cómo funciona

1. **Selección de GIFs** — carga uno o varios GIFs animados (clic o arrastrar).
2. **Selección de fotogramas** — elige qué fotogramas usar de cada GIF haciendo clic. Todos los GIFs deben usar la misma cantidad para poder compartir una sola rejilla.
3. **Papel + vista previa** — elige tamaño de papel (carta, oficio, A4 o personalizado) y ancho de franja; mira la vista previa animada del efecto real (con visor a pantalla completa) y descarga los dos PDFs.

### Detalles técnicos del efecto

- La columna `x` de la imagen entrelazada proviene del fotograma `(x / franja) mod N`, copiada desde esa misma posición.
- La rejilla es opaca con una ranura transparente cada `N` franjas; el ciclo mide `N × franja` px.
- La escala mm/px es **global**: la mayor que permita que todos los GIFs quepan en la hoja (derechos o rotados 90° dentro de la hoja). Nunca se escala individualmente — por eso **la misma rejilla sirve para todos los kinegramas** del documento.
- Imprime todo al **100 % (sin escalar)**: kinegramas en papel y rejilla en acetato.

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:5173/
npm run build     # build de producción en dist/
npm run preview   # sirve el build localmente
```

### Stack

| Área | Tecnología |
|---|---|
| UI | [Svelte 5](https://svelte.dev) (runas) + [Tailwind CSS 4](https://tailwindcss.com) + [daisyUI 5](https://daisyui.com) |
| Build | [Vite](https://vite.dev) |
| i18n | [i18next](https://www.i18next.com) — español (default) e inglés |
| Decodificación GIF | API `ImageDecoder` con respaldo [gifuct-js](https://github.com/matt-way/gifuct-js) |
| PDFs | [jsPDF](https://github.com/parallax/jsPDF) (carga bajo demanda) |

### Estructura

```
src/
  lib/            lógica pura: gif.js, interlace.js, layout.js, pdf.js, preview.js
  components/     wizard de 3 pasos + visor fullscreen
  i18n/           catálogos es/en
legacy/index.html versión original de un solo archivo (referencia)
```

## Deploy

Cada push a `main` construye y publica automáticamente a GitHub Pages vía GitHub Actions (`.github/workflows/deploy.yml`), servido en el dominio propio `kinegram.3m4.net`.

---

### English summary

Web tool to create **kinegrams** (barrier-grid animations / scanimations): load animated GIFs, pick frames, and download two print-ready PDFs — the interlaced kinegrams (paper) and their shared barrier grid (transparency). Print both at 100% scale, slide the grid over the image, and watch it move. Built with Svelte 5, Tailwind 4 + daisyUI, i18next (es/en), and jsPDF. Live at **https://kinegram.3m4.net**.
