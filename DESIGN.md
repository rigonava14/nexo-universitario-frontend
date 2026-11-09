# CampusOne — Estándar de diseño

> Cuaderno de papel cálido: lienzo hueso, hojas blancas con línea fina, tinta negra y un solo azul para actuar.

Este documento es la **norma visual obligatoria** de CampusOne. Todo módulo, pantalla o componente nuevo debe seguirlo. Si un cambio necesita salirse de estas reglas, primero se actualiza este archivo (en el mismo PR) y se justifica.

- Implementación de referencia: [`src/paper-theme.css`](src/paper-theme.css), que se carga **al final** en `src/main.tsx` y define el acabado definitivo.
- Colores de marca configurables: `src/content/institution.json` → `colors`, aplicados en tiempo de ejecución por `applyInstitutionSettings()` (`src/institution.ts`).

---

## 1. Principios

1. **Papel, no pantalla.** El fondo es hueso cálido (`#F6F5F4`); las superficies de contenido son blancas. Nunca al revés.
2. **Plano.** Sin degradados, sin sombras en tarjetas y sin efectos de vidrio decorativos. La profundidad sale del contraste hueso/blanco y de una línea de 1px.
3. **Esquinas casi rectas.** Radio de **4px** en tarjetas, paneles, botones y campos. Solo los círculos (avatares, pasos) y las píldoras de estado son redondos.
4. **Un solo azul.** El azul relleno se reserva para la acción principal de cada vista. Los textos, etiquetas y títulos son tinta, no azul.
5. **Jerarquía con tinta.** La jerarquía del texto se construye con opacidades del negro, no con nuevos colores.
6. **Movimiento sobrio.** Transiciones de 200ms `ease` en color, fondo y borde. Sin elevar tarjetas al pasar el cursor.

---

## 2. Color

### 2.1 Paleta base (valores por defecto de `institution.json`)

| Clave en `institution.json` | Variable CSS | Valor | Uso |
|---|---|---|---|
| `primary` | `--brand-violet`, `--blue`, `--paper-blue` | `#0075DE` | Botón principal, enlaces, foco, gráficas |
| `secondary` | `--brand-coral` | `#F64932` | Alertas, notificaciones, acentos cálidos |
| `accent` | `--brand-amber` | `#FFB110` | Indicadores de atención, paneles de acento |
| `background` | `--campus-canvas`, `--brand-lavender` | `#F6F5F4` | Lienzo de página |
| `surface` | `--campus-paper` | `#FFFFFF` | Tarjetas, paneles, formularios |
| `text` | `--campus-ink`, `--brand-plum` | `#000000` | Texto principal |
| `muted` | `--campus-muted` | `#615D59` | Texto secundario (gris cálido) |
| `border` | `--campus-line` | `#E9E8E6` | Divisores sólidos |
| `sidebar` | `--sidebar-bg` | `#EFEDEA` | Barra lateral (clara) |
| `sidebarText` | `--sidebar-text` | `#000000` | Texto de la barra lateral |

> Los nombres de variable `--brand-violet`, `--brand-plum`, etc. son históricos; se conservan por compatibilidad. **Su significado es el rol de la tabla, no el color de su nombre.**

### 2.2 Tokens del tema

| Variable | Valor | Uso |
|---|---|---|
| `--paper-hairline` | `rgba(0,0,0,.08)` | Borde de tarjetas y separadores |
| `--paper-hairline-strong` | `rgba(0,0,0,.16)` | Borde de campos, hover de tarjetas, botón contorno |
| `--paper-ink-95` | `rgba(0,0,0,.95)` | Etiquetas, títulos de lista |
| `--paper-ink-60` | `rgba(0,0,0,.60)` | Kickers / eyebrows, navegación inactiva |
| `--paper-ink-40` | `rgba(0,0,0,.40)` | Texto deshabilitado, ayudas mínimas |
| `--paper-sky-tint` | 10% de `primary` sobre blanco | Fondo de botón secundario y de íconos informativos |
| `--paper-midnight` | `#02093A` | Paneles oscuros (ver 5.6) |

### 2.3 Colores semánticos de estado

Se mantienen independientes de la marca para que su significado no cambie:

| Estado | Texto | Fondo |
|---|---|---|
| Éxito / pagado | `#18734D` | `#E8F7EF` |
| Pendiente / aviso | `#94600F` | `#FFF4D9` |
| Error / vencido | `#AC3542` | `#FEECEF` |

### 2.4 Reglas

- ✅ Usar siempre variables (`var(--campus-paper)`, `var(--paper-blue)`…), nunca hex sueltos, salvo los estados de 2.3.
- ✅ Sobre fondos de color, el texto es `#000` o `#fff` según el contraste (mínimo WCAG AA).
- ❌ No usar `linear-gradient` ni `radial-gradient` en superficies. (Excepción: el relleno del área de la gráfica de matrícula, que va de `primary` a transparente.)
- ❌ No poner texto de párrafo o etiquetas en azul. El azul en texto solo es para enlaces y acciones.
- ❌ No introducir colores nuevos de acento sin agregarlos a este documento.

---

## 3. Tipografía

| Rol | Familia | Peso | Tamaño | Interlineado | Tracking |
|---|---|---|---|---|---|
| Display (hero) | Inter | 700 | `clamp(48px, 6vw, 78px)` | 1.04 | `-0.035em` |
| Título de página (`h1`) | Inter | 700 | `clamp(30px, 2.4vw, 38px)` | 1.04 | `-0.035em` |
| Título de sección (`h2` público) | Inter | 700 | 38–50px | 1.04 | `-0.035em` |
| Título de panel | Inter | 600 | 17px | 1.27 | `-0.011em` |
| Cifra de indicador | Inter | 600 | 28px | 1.1 | `-0.03em` |
| Cuerpo | Inter | 400 | 14–16px | 1.5 | normal |
| Etiqueta / navegación | Inter | 500 | 13–14px | 1.43 | normal |
| Kicker / eyebrow | Inter | 500 | 11–12px, MAYÚSCULAS | 1.33 | `+0.06em` |
| Subtítulo editorial | Source Serif 4 | 400 | 18px | 1.56 | normal |

- Fuente cargada desde Google Fonts en `src/styles.css`: Inter 400/500/600/700 y Source Serif 4 400.
- Pila de respaldo: `'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`.
- Activar cifras alineadas: `font-feature-settings: 'lnum'`.
- **Peso máximo 700.** No usar 800/900.
- **Source Serif 4** solo para el párrafo introductorio del hero, del login y de páginas públicas (`var(--paper-serif)`). Nunca en botones, etiquetas, tablas ni navegación.
- Tamaño mínimo de texto legible en áreas de aplicación: 12px (cabeceras de tabla) y 14px para contenido.

---

## 4. Espaciado, forma y elevación

### 4.1 Espaciado (base 4px)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 42 · 64 · 80`

| Contexto | Valor |
|---|---|
| Separación entre elementos en línea | 8px |
| Separación en rejillas de tarjetas | 20–22px |
| Padding de tarjeta | 22–26px |
| Padding de contenido de página | `42px 46px 72px` (escritorio), `30px 22px 55px` (≤900px) |
| Separación entre secciones públicas | 72–105px |
| Ancho máximo de contenido | 1580px (privado), 1200–1240px (público) |

### 4.2 Radio

| Elemento | Radio |
|---|---|
| Tarjetas, paneles, modales, drawers | `var(--paper-radius)` = **4px** |
| Botones, campos, selects, pestañas | **4px** |
| Avatares, pasos numerados, notificación | `50%` / `9999px` |
| Píldoras de estado | `9999px` |

- ✅ Todo radio nuevo se escribe como `var(--paper-radius)`; no se escriben valores en px.
- ❌ Nada de 8, 12, 16 o 24px en contenedores rectangulares.

### 4.3 Bordes y sombras

| Elemento | Tratamiento |
|---|---|
| Tarjeta | `1px solid var(--paper-hairline)`, **sin sombra** |
| Tarjeta en hover | Solo cambia el borde a `--paper-hairline-strong`; sin `transform` |
| Barra superior (fija) | `--paper-nav-shadow` |
| Maqueta de producto / tarjeta flotante del hero | `--paper-mockup-shadow` (único uso permitido de sombra visible) |
| Menú lateral abierto en móvil | `0 4px 24px rgba(0,0,0,.08)` |

---

## 5. Componentes

### 5.1 Botones

| Variante | Clases | Estilo |
|---|---|---|
| Principal | `.primary-button`, `.public-primary`, `.student-primary-button`, `.teacher-primary` | Fondo `--paper-blue`, texto `#fff`, peso 500, radio 4px. Hover: 86% del azul + negro. **Uno por vista.** |
| Secundario | `.public-secondary` | Fondo `--paper-sky-tint`, texto `--paper-blue`, sin borde |
| Contorno | `.outline-link` | Transparente, borde `--paper-hairline-strong`, texto tinta 95% |
| Texto | enlaces "Ver todo" | Sin fondo, texto `--paper-blue`, peso 500 |

Foco visible en todos: `outline: 2px solid var(--paper-blue); outline-offset: 2px`.

### 5.2 Tarjeta blanca (componente por defecto)

Fondo `--campus-paper`, borde `--paper-hairline`, radio 4px, padding 24px, sin sombra. Título 600 a 17px, cuerpo `--campus-muted`.

### 5.3 Indicador (stat card)

Tarjeta blanca + ícono en cuadro de 46px (radio 4px) con fondo tintado del color del indicador al ~10%. Etiqueta 12px muted, cifra 28px/600, nota 11px.

### 5.4 Píldora de estado

Radio `9999px`, padding `4px 10px`, 11–12px, peso 500, colores de la tabla 2.3.

### 5.5 Navegación lateral

- Fondo `--sidebar-bg` claro, borde derecho `--paper-hairline`, sin sombra ni barra de degradado.
- Elemento: alto 36px, padding `8px 12px`, radio 4px, texto tinta 60%, peso 500.
- Hover: fondo tinta 5%. Activo: fondo tinta 7%, texto tinta 100%. Sin borde lateral de color.
- Títulos de sección: 10px, mayúsculas, tinta 40%, `+0.08em`.

### 5.6 Panel oscuro (isla midnight)

Para paneles destacados (`.login-brand-panel`, `.payroll-strip`, `.balance-card`, `.scholarship-banner`, `.scholarship-insight`, `.admin-owner-note`, `.portal-copy-preview`):

- Fondo plano `--paper-midnight`, texto `#fff`, radio 4px.
- Dentro del panel se redefinen localmente `--sidebar-text: #fff`, `--campus-muted: rgba(255,255,255,.64)` y `--campus-line: rgba(255,255,255,.78)` para que los hijos mantengan contraste.
- Botón interno: fondo blanco, texto midnight.
- Usar con moderación: **máximo uno por vista**.

### 5.7 Formularios

- Campo: alto mínimo 48px (público) o 40px (interno), borde `--paper-hairline-strong`, radio 4px, fondo blanco.
- Etiqueta: tinta 95%, peso 500, encima del campo.
- Foco: borde/outline `--paper-blue`.

### 5.8 Gráficas

- Serie principal en `--paper-blue`, línea de 2px.
- Área: degradado vertical del azul al 25% → 0% (única excepción a "sin degradados").
- Series adicionales: `--brand-amber`, `--brand-coral`, `--campus-muted`.
- Ejes y etiquetas en `--campus-muted`, 11–12px.

---

## 6. Diseño adaptable

| Punto de corte | Comportamiento |
|---|---|
| ≤1180px | Rejillas de indicadores y programas a 2 columnas |
| ≤900px | Barra lateral oculta (se abre encima); hero a una columna |
| ≤640px | Rejillas a 1 columna; acciones del hero apiladas; título 30px |

- Margen lateral mínimo en móvil: 16–22px.
- **Sin desplazamiento horizontal** a 390px de ancho.
- Respetar `prefers-reduced-motion`: desactivar transiciones y animaciones.

---

## 7. Lista de verificación para PRs de interfaz

- [ ] Fondo de página `--campus-canvas`; contenido sobre `--campus-paper`.
- [ ] Sin `box-shadow` en tarjetas y sin `gradient` en superficies.
- [ ] Radios con `var(--paper-radius)`; solo círculos y píldoras redondeados.
- [ ] Un solo botón principal azul por vista.
- [ ] Texto en tinta (opacidades del negro), no en azul.
- [ ] Inter ≤700; Source Serif solo en subtítulos editoriales.
- [ ] Colores vía variables; los cambios de marca funcionan desde *Personalización institucional*.
- [ ] Contraste AA y foco visible.
- [ ] Sin scroll horizontal a 390px.
- [ ] Estilos nuevos que sobrescriben tema van en `src/paper-theme.css` o respetan sus tokens.
