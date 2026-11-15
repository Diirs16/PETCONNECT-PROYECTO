# Auditoría de diseño y calidad — Front web de PetConnect

**Fecha:** 15/11/2026 · **Rama:** `rediseno-front` · **Alcance:** `PetConnect.Front/petconnect-app` (React 19 + Vite 8 + Tailwind 4)
**Tipo:** solo lectura. No se cambió código; este archivo es el único entregable de esta etapa.

> **Cómo leer este reporte.** Primero el resumen (§1), después los puntajes (§2) y la tabla de hallazgos (§3).
> La dirección visual elegida está en §4 y el plan por fases, con casillas `[ ]`, en §5.
> Las palabras técnicas nuevas se explican en una línea la primera vez que aparecen.

---

## 0. Cómo se hizo (y qué faltó)

- **Lectura completa del código:** `index.css`, `animations.css`, `App.jsx`, `main.jsx`, las 8 páginas, los 11 componentes,
  `context/`, `hooks/`, `services/`, `utils/`, `vite.config.js`, `index.html`, `.env.example`, `vercel.json`, `nginx.conf`.
  `.env.local` **no se abrió** (regla 4 de CLAUDE.md).
- **Comprobaciones automáticas:** `npm run lint` (0 errores, 2 avisos) y `npm run build` (pasa; un solo archivo JS de
  324 kB, 97 kB comprimido). Contrastes calculados con la fórmula WCAG en un script propio. Límites de datos sacados de
  `petconnect.Backend/sql/schema.sql` (solo lectura).
- **Lo que NO se hizo:** ver la web en el navegador a 375 px y 1280 px. Pediste levantar tú el servidor, así que todo lo
  visual sale del código. Los hallazgos marcados *(inferido)* deben confirmarse a la vista al empezar la Fase 1.

### Skills usadas

| Paso | Skill | Cómo se usó |
|---|---|---|
| 3 | `/impeccable audit` y `critique` | Cargada. Su detector automático (`impeccable detect`) revisó `src/` e `index.html`: **0 hallazgos mecánicos**. Los puntajes de §2 siguen sus rúbricas. |
| 4 | `/ui-ux-pro-max` | Cargada. Búsquedas de sistema de diseño, paletas, fuentes y estilos para "adopción de mascotas + tienda". |
| 9 | `/break-ui` | Cargada. **Solo reporte**: no se instaló el interruptor de datos de demo. |
| 10 | `/find-animation-opportunities` | Cargada. Filtro de "dónde sí y dónde no" animar (§3.4). |
| 2, 5–8, 10–16 | `ecc:design-system`, `frontend-design`, `ecc:frontend-design-direction`, `ecc:accessibility`, `ecc:frontend-a11y`, `/mobile-native`, `ecc:make-interfaces-feel-better`, `/emil-design-eng`, `/improve-animations`, `ecc:motion-foundations`, `ecc:react-patterns`, `ecc:frontend-patterns`, `ecc:react-performance`, `vercel-react-best-practices`, `ecc:vite-patterns`, `ecc:click-path-audit`, `ecc:seo`, `/revision-contenido-mascotas` | **No se cargaron una por una** (cada una ocupa mucho contexto). Se aplicaron sus criterios conocidos; en la tabla de hallazgos la columna "Skill" dice de qué criterio salió cada hallazgo. Si quieres que alguna corra completa, se puede hacer al empezar la fase que la necesite. |

---

## 1. Resumen en 5 líneas

1. **Lo mejor:** los estados de carga, error y vacío (`EstadoCarga`) son honestos y accesibles, y el formulario de solicitud es el mejor componente del proyecto (errores enfocados, campos de 16 px, botones de 44 px).
2. **Lo mejor:** el checkout se presenta como demo sin engañar, la política de datos está bien estructurada y no hay datos inventados de mascotas ni salud.
3. **Lo peor:** la web no tiene identidad propia: todo es negro y gris con la fuente del sistema; los colores del logo (turquesa y naranja) solo viven en el logo y los 9 colores definidos en `index.css` no se usan en ningún archivo.
4. **Lo peor:** los modales (carrito, inicio de sesión, registro) no se comportan como diálogos: no atrapan el foco, no cierran con Escape y el lector de pantalla no sabe que se abrió una ventana.
5. **Lo peor:** el Home promete "envío en 24-48 h" y "garantía de devolución" que no existen, el pie de página trae un teléfono y ciudad inventados, y el carrito se pierde al recargar o al usar los enlaces del pie.

---

## 2. Puntajes

### 2.1 Auditoría técnica (`/impeccable audit`)

| # | Dimensión | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Accesibilidad | 2/4 | Modales sin comportamiento de diálogo; código de verificación sin etiqueta; gris claro con contraste 2,5:1 |
| 2 | Rendimiento | 3/4 | Bundle razonable, imágenes con `loading="lazy"`; el hook de *scroll reveal* crea observadores que nunca libera |
| 3 | Temas y tokens | 1/4 | 9 tokens definidos, 0 usados; colores escritos a mano (`bg-black`, `#2a7d8a`, 11 grises) |
| 4 | Responsive | 3/4 | Rejillas bien pensadas; inputs de 14 px que hacen zoom en iPhone y botones de carrito de ~22 px |
| 5 | Integridad del diseño | 2/4 | Estructura intercambiable con cualquier tienda: título centrado + rejilla + tarjeta gris en todas las páginas |
| **Total** | | **11/20** | **Aceptable: hace falta trabajo de fondo, no solo pulido** |

**Veredicto de integridad:** *no pasa*. El código es ordenado, pero no expresa un sistema propio de PetConnect: si se
cambia el logo, la web podría ser de ferretería. Lo único con carácter (el logotipo bicolor) no llega a la interfaz.

### 2.2 Heurísticas de usabilidad (`/impeccable critique`, Nielsen)

*Heurística = regla práctica de usabilidad. Puntaje 0 (mal) a 4 (excelente).*

| # | Heurística | Puntaje | Problema principal |
|---|---|---|---|
| 1 | Visibilidad del estado | 3 | Buenos estados de carga; el aviso "agregado al carrito" no lo anuncia el lector de pantalla |
| 2 | Lenguaje del usuario | 3 | "Checkout", "Iniciar Checkout"; Mayúsculas Al Estilo Inglés |
| 3 | Control y libertad | 2 | Sin Escape en modales; el carrito se borra al recargar |
| 4 | Consistencia | 2 | Tres formas de botón principal, radios distintos, enlaces `<a>` y `<Link>` mezclados |
| 5 | Prevención de errores | 2 | Se puede agregar al carrito un producto agotado o más unidades de las que hay |
| 6 | Reconocer en vez de recordar | 3 | Navegación clara; los filtros no dicen cuál está activo al lector de pantalla |
| 7 | Flexibilidad | 2 | Sin atajos razonables (Escape, Enter en filtros) ni carrito persistente |
| 8 | Estética y minimalismo | 2 | Limpio pero genérico; promesas de envío y pago que distraen y no son ciertas |
| 9 | Recuperarse de errores | 3 | "Reintentar" en todas las cargas; sin página 404 ni zona que atrape errores |
| 10 | Ayuda | 3 | Avisos de demo y de datos claros |
| **Total** | | **25/40** | |

---

## 3. Hallazgos

**Gravedad:** **Alta** = impide una tarea, incumple WCAG AA o engaña al usuario · **Media** = molesta o se rompe con datos
reales · **Baja** = pulido u orden.

*WCAG 2.2 AA = la norma internacional de accesibilidad web; "AA" es el nivel que se exige normalmente.*

### 3.1 Tabla de hallazgos

| # | Gravedad | Página o componente | Problema | Skill que lo detectó | Arreglo propuesto | Archivo(s) |
|---|---|---|---|---|---|---|
| 1 | Alta | CartModal, LoginModal, RegisterModal | No son diálogos: sin `role="dialog"`/`aria-modal`/título asociado, el foco se escapa al fondo con Tab, Escape no cierra, el foco no vuelve al botón que los abrió y la página de atrás sigue desplazándose | ecc:frontend-a11y | Usar el elemento nativo `<dialog>` con `showModal()`: atrapa el foco, cierra con Escape y pone el fondo oscuro solo. Es más simple que instalar una librería (descartada) | `CartModal.jsx:25-31`, `LoginModal.jsx:122-126,183-191,255-261`, `RegisterModal.jsx:204-213` |
| 2 | Alta | Home | Promete "Envío rápido: 24-48 horas" y "Pagos protegidos y garantía de devolución", pero no hay pedidos ni pagos (checkout demo, ítem 3.2) | impeccable critique · revision-contenido-mascotas | Cambiar por beneficios reales (adopción con solicitud en línea, catálogo, política de datos clara). **Texto a decidir contigo** | `Home.jsx:78-104` |
| 3 | Alta | Footer | Contacto inventado y contradictorio: `info@petconnect.com`, `+57 300 123 4567`, "Bogotá" vs. Contacto y Política (Armenia, correo de atención). Ese número puede ser de una persona real (Ley 1581) | revision-contenido-mascotas | Usar el correo de atención y "Armenia, Quindío"; quitar el teléfono si no hay uno del proyecto | `Footer.jsx:36-40` |
| 4 | Alta | Footer | Enlaces con `<a href>`: recargan toda la página, **vacían el carrito** y vuelven a validar la sesión | ecc:click-path-audit | `<Link to>` de React Router | `Footer.jsx:25-28` |
| 5 | Alta | CartContext | El carrito vive solo en memoria: recargar, abrir un enlace nuevo o el punto 4 lo borran | ecc:click-path-audit | Guardar `id` y `cantidad` en `localStorage` (con `try/catch`; nada personal) y volver a leer precio de la API | `CartContext.jsx:6` |
| 6 | Alta | ProductCard, CartModal | Se agrega al carrito un producto **agotado** desde la tarjeta (en el detalle sí está bloqueado) y el botón "+" no tiene tope de stock | break-ui · click-path | Desactivar el botón si `stock === 0`, tope `cantidad ≤ stock` en `addItem`/`updateQuantity`, mensaje "Agotado" | `ProductCard.jsx:66-72`, `CartModal.jsx:81-89`, `CartContext.jsx:9-33` |
| 7 | Alta | Header | El nombre se "capitaliza" con `/\b\w/g`; `\w` no reconoce letras con tilde, así que **"maría josé" sale "MaríA JosÉ"**. Si la cuenta llegara sin nombre, `user.name.replace` rompe toda la página | break-ui | Separar por espacios y poner mayúscula a la primera letra de cada palabra (o la clase `capitalize` de CSS); proteger `user.name ?? ""` | `Header.jsx:82` |
| 8 | Alta | App | No hay *error boundary* (zona que atrapa errores): un fallo al dibujar cualquier componente deja la pantalla **en blanco** | ecc:react-patterns | Un componente `ZonaDeError` alrededor de `<Routes>` con mensaje y botón "Volver al inicio" | `App.jsx:20-31` |
| 9 | Alta | LoginModal, RegisterModal | El campo del código de 6 dígitos no tiene etiqueta (solo `placeholder="------"`) ni `autoComplete="one-time-code"` | ecc:accessibility (WCAG 1.3.1, 3.3.2) | `<label>` visible "Código de verificación" + `autoComplete="one-time-code"` (el celular ofrece el código del correo/SMS) | `LoginModal.jsx:147-157`, `RegisterModal.jsx:379-389` |
| 10 | Alta | CartModal | Botones − y + de ~22 × 22 px (`p-1` + ícono de 12 px): menos del mínimo AA de 24 px y lejos de los 44 px cómodos para el dedo | ecc:accessibility (WCAG 2.5.8) · mobile-native | Botones de 44 × 44 px (`min-h-11 min-w-11`), cantidad en medio con `tabular-nums` | `CartModal.jsx:69-95` |
| 11 | Alta | Varios | Texto `gray-400` (#9CA3AF) sobre blanco = **2,54:1** (pide 4,5:1): precio anterior, categoría del producto, carrito vacío, reglas de contraseña, "Verificando dominio…" (21 usos de `gray-400`) | impeccable audit (WCAG 1.4.3) | Token `tinta-suave` #55636A (6,21:1) para todo texto secundario | `ProductDetail.jsx:113,121`, `CartModal.jsx:45`, `RegisterModal.jsx:273,309`, `ProductCard.jsx:60` |
| 12 | Alta | animations.css, useScrollReveal | No existe `prefers-reduced-motion` (ajuste del sistema para quien se marea con el movimiento): el contenido aparece desplazándose y con opacidad 0 aunque la persona pidió menos movimiento; si el JS tarda, las tarjetas quedan invisibles | ecc:motion-foundations · improve-animations | Bloque `@media (prefers-reduced-motion: reduce)` que deja todo visible y cambia desplazamientos por un fundido corto | `animations.css:122-170`, `useScrollReveal.js` |
| 13 | Alta | index.css (todo el sitio) | Sin identidad: los 9 tokens de `@theme` (`primary`, `secondary`…) **no se usan en ningún archivo**; la UI es `bg-black` + 11 grises; turquesa y naranja solo existen en el logotipo | ecc:design-system · frontend-design | Tokens nuevos (§4) y usarlos en todo; prohibir colores escritos a mano en los componentes | `index.css:4-14`, `Header.jsx:45-46`, `Footer.jsx:10-11` |
| 14 | Media | LoginModal, RegisterModal, Catalog | Campos con `text-sm` (14 px): en iPhone la página **hace zoom** al tocar el campo | mobile-native | `text-base` (16 px) en todo `input`, como ya hace `FormularioSolicitud` | `LoginModal.jsx:289,304`, `RegisterModal.jsx:244-331`, `Catalog.jsx:72` |
| 15 | Media | Formularios de cuenta y buscador | Borde de los campos `gray-300` = 1,47:1 (WCAG 1.4.11 pide 3:1 para ver el contorno); el foco quita el contorno (`focus:outline-none`) y solo oscurece el borde de 1 px | ecc:frontend-a11y | Borde `borde-fuerte` #8C8178 (3,8:1) y anillo de foco de 2 px color marca en todos los controles | mismos archivos de #14 |
| 16 | Media | LoginModal, RegisterModal | Sin `autoComplete` (`email`, `current-password`, `new-password`, `name`): el gestor de contraseñas no ayuda | ecc:accessibility (WCAG 1.3.5) | Agregar los cuatro atributos | `LoginModal.jsx:283-306`, `RegisterModal.jsx:237-333` |
| 17 | Media | Header | Botón de menú móvil sin `aria-expanded`/`aria-controls` y con nombre fijo "Menú"; el enlace activo no tiene `aria-current="page"` | ecc:frontend-a11y | Agregar los tres atributos | `Header.jsx:51-62,102-112` |
| 18 | Media | Catalog | Filtros de categoría sin `aria-pressed` (el lector no sabe cuál está activo); `scale-105` en el activo y al pasar el mouse hace saltar la fila y emborrona el texto | ecc:frontend-a11y · emil-design-eng | `aria-pressed`, quitar las escalas, estado activo por color y borde | `Catalog.jsx:79-89` |
| 19 | Media | addToCartToast.js | El aviso "agregado al carrito" se crea con DOM a mano **junto** con su `role="status"`: la mayoría de lectores no anuncian una zona que nace con el texto ya puesto | ecc:frontend-a11y · react-patterns | Una zona `role="status"` fija en `App` y el texto se cambia por estado de React | `addToCartToast.js:25-62` |
| 20 | Media | useScrollReveal | `useEffect` **sin lista de dependencias** (corre en cada render) y la limpieza se devuelve dentro del `setTimeout`, donde se ignora: cada render crea un `IntersectionObserver` nuevo que nunca se desconecta | ecc:react-performance | Dependencias explícitas y limpieza correcta, o reemplazar por CSS (`animation-timeline: view()` con respaldo) | `useScrollReveal.js:4-12` |
| 21 | Media | App | Al cambiar de página no se vuelve arriba: de abajo del catálogo a un producto, la ficha aparece a mitad | ecc:click-path-audit | Componente que hace `window.scrollTo(0, 0)` al cambiar `pathname` | `App.jsx` |
| 22 | Media | App | Sin página 404: `/cualquier-cosa` muestra encabezado y pie con el centro vacío | ecc:seo · click-path | Ruta `path="*"` con `EstadoCarga tipo="vacio"` y enlaces a Inicio/Adopción | `App.jsx:21-30` |
| 23 | Media | Todas las páginas | Mismo `<title>` para todo (solo Política lo cambia), sin `meta description` ni Open Graph (vista previa al compartir) | ecc:seo | React 19 permite poner `<title>` y `<meta>` dentro de cada página (tabla §3.6) | `index.html:7`, páginas |
| 24 | Media | animations.css | `.card-hover:hover`, `.btn-hover:hover` e `.img-zoom:hover` no están dentro de `@media (hover: hover)`: en celular la tarjeta queda "levantada" después de tocarla (*hover pegado*). Las clases `hover:` de Tailwind 4 sí están protegidas | mobile-native | Envolver esas reglas en `@media (hover: hover) and (pointer: fine)` | `animations.css:214-265` |
| 25 | Media | Checkout | Resumen: nombre largo y precio en `flex justify-between` sin `min-w-0`; un nombre de 120 caracteres empuja el precio fuera de la caja; "x3" queda pegado al nombre | break-ui | `min-w-0` + `break-words` en el nombre, precio con `shrink-0`; cantidad en línea aparte | `Checkout.jsx:99-105` |
| 26 | Media | PetDetail | Nombre (hasta 80 caracteres) y etiqueta de especie en `flex` sin `flex-wrap`: la etiqueta se aplasta; la descripción pierde los saltos de línea; si viene vacía deja un párrafo vacío | break-ui | `flex-wrap`, `whitespace-pre-line`, no pintar la descripción si está vacía | `PetDetail.jsx:97-109` |
| 27 | Media | Tarjetas y fichas | `imagen_url` puede ser `NULL` en la BD: `<img src={null}>` muestra el ícono de imagen rota | break-ui | Respaldo con ilustración propia (silueta + ícono `PawPrint` de lucide) y `onError` | `ProductCard.jsx:28`, `ProductDetail.jsx:95`, `Adoption.jsx:68`, `PetDetail.jsx:90`, `CartModal.jsx:56` |
| 28 | Media | Precios | `formatPrice` copiado en 4 archivos; usa `minimumFractionDigits: 0` pero no `maximumFractionDigits`, así que un precio con centavos sale "$ 89.900,5" | break-ui · react-patterns | Un solo `utils/precio.js` con `maximumFractionDigits: 0` y prueba | `ProductCard.jsx:7`, `ProductDetail.jsx:10`, `CartModal.jsx:5`, `Checkout.jsx:10` |
| 29 | Media | Header | Contador del carrito en un círculo de 20 × 20 px: "100" o más se sale | break-ui | `min-w-5 px-1` y mostrar "99+" | `Header.jsx:74` |
| 30 | Media | CartModal | Nombre con `truncate` (una línea) sin forma de leerlo completo | break-ui | `line-clamp-2` + `title` con el nombre | `CartModal.jsx:62` |
| 31 | Media | ProductDetail | Muestra la palomita verde ✓ también cuando dice "Agotado" | impeccable critique | Ícono y color según el stock (✓ disponible / ✕ agotado) | `ProductDetail.jsx:129-135` |
| 32 | Media | CartContext, AuthContext | El `value` del contexto es un objeto nuevo en cada render: **cada tarjeta** del catálogo (todas usan `useCart`) se vuelve a dibujar al agregar un producto. El lint además avisa `only-export-components` | ecc:react-performance · vercel-react-best-practices | `useMemo`/`useCallback` en el valor y mover `useCart`/`useAuth` a su propio archivo | `CartContext.jsx:40-59`, `AuthContext.jsx:135-164` |
| 33 | Media | App | Todo va en un solo archivo JS (324 kB): la Política (449 líneas), el Checkout y los modales se descargan aunque no se visiten | vercel-react-best-practices | `React.lazy` + `<Suspense>` para Política, Checkout y RegisterModal | `App.jsx:1-14` |
| 34 | Media | Todo el sitio | El texto normal va en `text-sm` (14 px, 100 usos); para leer cómodo en celular se recomienda 16 px | impeccable (typeset) | Cuerpo en 16 px; 14 px solo para datos secundarios | global |
| 35 | Media | index.css | Fuente `'Segoe UI', system-ui`: en Mac, Android e iPhone cada uno ve una letra distinta; no hay fuente de marca | frontend-design | Par tipográfico de §4.3, alojado en el proyecto | `index.css:5` |
| 36 | Media | Inconsistencias | 11 tonos de gris + `#111` + `black`; radios de 4, 6, 8, 12 px y círculo mezclados (etiquetas `rounded`, botones `rounded-lg`, modales `rounded-xl`, foto del carrito `rounded-md`); 3 recetas distintas de botón principal | ecc:design-system | Escala de §4 (3 radios, 2 sombras, 1 receta de botón) | global |
| 37 | Media | Checkout | Carrito vacío usa `<button>` para navegar (debe ser enlace); "Volver" con `navigate(-1)` saca del sitio si se llegó directo | ecc:click-path-audit | `<Link to="/catalogo">` en ambos | `Checkout.jsx:26-31,38-44` |
| 38 | Baja | Textos | Mayúsculas al estilo inglés ("Carrito de Compras", "Iniciar Sesión", "Mascotas en Adopción", "Solicitar Adopción") y anglicismos ("Checkout", "Iniciar Checkout") | impeccable (clarify) | Mayúscula solo al inicio; "Finalizar compra", "Ir a pagar" | `CartModal.jsx:33,115`, `Checkout.jsx:46`, `LoginModal.jsx:270`, `Adoption.jsx:32`, `PetDetail.jsx:118` |
| 39 | Baja | CartModal, Catalog | Carrito vacío y "No se encontraron productos" sin botón para salir del vacío | impeccable (onboard) | "Ver catálogo" y "Quitar filtros" | `CartModal.jsx:44-48`, `Catalog.jsx:94-98` |
| 40 | Baja | Catalog | La búsqueda no ignora tildes ("algodon" no encuentra "Algodón") | break-ui | Comparar con `normalize("NFD")` sin diacríticos | `Catalog.jsx:35` |
| 41 | Baja | Código muerto | `isNew`, `discount`, `oldPrice` (la API no los manda); `hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`; `.float-animation` y varios *keyframes* sin uso | ecc:react-patterns | Borrar en la fase que toque cada archivo | `ProductCard.jsx:34-43`, `ProductDetail.jsx:100-124`, `src/assets/img/`, `animations.css:208` |
| 42 | Baja | Footer | Títulos `h4` sin `h2`/`h3` antes (saltan niveles); "© 2025" | ecc:accessibility | `h2` con estilo pequeño; año correcto | `Footer.jsx:21,33,45` |
| 43 | Baja | RegisterModal | Spinner del correo con `animate-spin` sin `motion-safe:` | ecc:motion-foundations | `motion-safe:animate-spin` | `RegisterModal.jsx:280,408` |
| 44 | Baja | index.css | `#root { min-height: 100vh }`: en celular `100vh` mide más que lo visible (*bug de 100vh*) | mobile-native | `min-height: 100dvh` (alto visible real) | `index.css:25` |
| 45 | Baja | Botones | Onda tipo Material (*ripple*) + botón que sube al pasar el mouse: mezcla dos lenguajes y en "Agregar al carrito" (se usa muchas veces) estorba | emil-design-eng | Quitar el *ripple*; dar respuesta al presionar con `scale(0.97)` | `rippleEffect.js`, `animations.css:223-252` |

### 3.2 Patrones que se repiten (el fondo del problema)

- **Colores escritos a mano en 20 archivos** en vez de tokens: por eso cambiar el estilo hoy obliga a tocar todo.
- **Los componentes nuevos (ítems 3.x–4.x) son accesibles y los viejos no**: `FormularioSolicitud`, `EstadoCarga`, `BotonVerMas` y `CasillaAutorizacion` ya usan `min-h-11`, `focus-visible` y `aria-*`; `Login`, `Register`, `CartModal`, `ProductCard` y `Catalog` no. El rediseño debe llevar lo nuevo a lo viejo.
- **Datos de demo heredados**: `isNew`, `discount`, contacto del pie y beneficios del Home salen de la plantilla inicial, no de la BD.
- **Movimiento en todo y en ninguna parte con propósito**: 14 *keyframes*, aparición en cada página, y lo que sí ayudaría (salida del carrito, respuesta al presionar) no existe.

### 3.3 Peores datos posibles (`/break-ui`, solo reporte)

Límites reales tomados de `schema.sql`: nombre de producto 120 caracteres, nombre de mascota 80, raza 80, precio
`decimal(10,2)` (hasta 99.999.999,99), `imagen_url` puede ser `NULL`, `descripcion` es `TEXT` (sin límite práctico).

| # | Gravedad | Campo | Peor valor realista | Qué pasa | Arreglo (hallazgo) |
|---|---|---|---|---|---|
| 1 | Roto | `user.name` | "maría josé ñúñez" | Sale "MaríA JosÉ ÑúÑez" en el encabezado | #7 |
| 2 | Roto | `stock` | 0 | Se agrega desde la tarjeta y se paga "en demo" algo que no existe | #6 |
| 3 | Roto | `image` | `NULL` | Ícono de imagen rota en tarjeta, ficha y carrito | #27 |
| 4 | Feo | `name` (producto) | "Concentrado Premium para Perros Adultos de Razas Medianas y Grandes con Pollo, Arroz y Vegetales — Bolsa 15 kg" (112 car.) | Tarjeta: se corta a 2 líneas, bien. Checkout: empuja el precio fuera de la caja. Carrito: una sola línea sin forma de leerlo | #25, #30 |
| 5 | Feo | `name` (mascota) + `species` | "Princesa Esmeralda de los Andes del Quindío" + "Perro" | La etiqueta de especie se aplasta al lado del título | #26 |
| 6 | Feo | `totalItems` | 128 | El número se sale del círculo del carrito | #29 |
| 7 | Feo | `price` | 89900.5 | "$ 89.900,5" | #28 |
| 8 | Frágil | `description` (mascota) | Texto con saltos de línea escrito por el refugio | Se vuelve un solo bloque | #26 |
| 9 | Frágil | `quantity` | 999 con el botón + | Sin tope de stock; la caja `w-6` aguanta hasta 2 cifras *(inferido)* | #6 |

**Lo que aguantó:** `line-clamp-2` en el nombre de la tarjeta; plurales del catálogo ("1 producto encontrado") ya
correctos; correos largos con `break-all` en Contacto y en la casilla de autorización; lista vacía y error con
`EstadoCarga`; nombre del producto en el aviso del carrito con `textContent` (no ejecuta código).

**Decisiones para ti:**
- Nombres largos en tarjetas: **recomiendo recortar a 2 líneas con el nombre completo en la ficha** (mantiene las tarjetas parejas).
- Mascota sin foto: **recomiendo una ilustración propia con la silueta de la especie**, no una foto genérica (no sería esa mascota).

### 3.4 Movimiento (`/find-animation-opportunities`, `/improve-animations` en lectura)

Hoy hay 14 animaciones definidas y ninguna respeta `prefers-reduced-motion`. La web necesita **menos** movimiento, no más.
Tokens de curva propuestos: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` y `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`.

**Dónde sí (máximo 5):**

| # | Lugar | Hoy | Propósito | Frecuencia | Movimiento sugerido |
|---|---|---|---|---|---|
| 1 | `CartModal.jsx:17` | Entra deslizándose y **desaparece de golpe** al cerrar | Continuidad espacial | Ocasional | Salida por el mismo borde: `translateX(100%)` en 240 ms `--ease-drawer`; fondo `opacity` 200 ms. Con movimiento reducido: solo fundido 150 ms |
| 2 | Botones principales | Onda + subida al pasar el mouse | Respuesta al presionar | Decenas al día | `:active { transform: scale(0.97) }`, `transition: transform 160ms var(--ease-out)`; quitar *ripple* y `translateY` |
| 3 | Ícono del carrito (`Header.jsx:72`) | El número solo "salta" cuando pasa de 0 a 1 | Respuesta (une el clic con el carrito) | Decenas al día | Al cambiar `totalItems`: `scale(1) → 1.12 → 1` en 200 ms `--ease-out`; nada con movimiento reducido |
| 4 | `LoginModal`/`RegisterModal` | Entran desde `scale(0.9)`, salen de golpe | Evitar cambio brusco | Ocasional | Entrada `scale(0.96)` + opacidad 200 ms; salida 150 ms (más rápida que la entrada) |
| 5 | Solicitud de adopción enviada (`FormularioSolicitud.jsx:136`) | Aparece sin transición | Celebración (momento raro y emotivo) | Rara | Ícono de check: `scale(0.8) → 1` con resorte suave 400 ms; texto con fundido 200 ms. Único lugar con "alegría" |

**Dónde no (rechazadas):**
- `page-enter` en **cada cambio de página** (`Home.jsx:45` y todas): navegación frecuente. **Rechazada por frecuencia** → quitar o dejar solo opacidad 120 ms.
- `hover:scale-105` en filtros (`Catalog.jsx:85`): **rechazada por función** (hace saltar la fila y emborrona).
- Aparición escalonada al hacer *scroll* en el catálogo: el catálogo se usa para comparar productos. **Rechazada por función** → dejarla solo en el Home.
- Títulos animados (`hero-title`) en Adopción: página de trabajo, no de presentación. **Rechazada por propósito.**
- `.float-animation` (flotando sin fin): sin uso y sin propósito. **Rechazada.**

**Veredicto:** la oportunidad de más valor es la #2 (respuesta al presionar en botones principales), porque se ve en cada compra.

### 3.5 Código React, Vite y recorridos de clic

**Recorridos seguidos de punta a punta (`ecc:click-path-audit`):**

| Botón | Recorrido | Estado que queda mal |
|---|---|---|
| Agregar al carrito (tarjeta) | `ProductCard` → `addItem` → aviso | Permite agotados (#6); el aviso no se anuncia (#19); re-dibuja todo el catálogo (#32) |
| Pagar | Carrito → "Iniciar Checkout" → `/checkout` | Llega bien; el formulario está bloqueado a propósito (demo honesta). Si recargas, el carrito está vacío (#5) |
| Enviar solicitud de adopción | Ficha → "Solicitar Adopción" → formulario → API | **Funciona bien**: valida antes, maneja 401/403, conserva el texto y enfoca el error |
| Iniciar sesión | Ícono → modal → código → sesión | Funciona; falta etiqueta del código (#9), autocompletar (#16) y Escape (#1) |
| Enlaces del pie | `<a href>` | Recarga completa y carrito vacío (#4) |

**Vite (`ecc:vite-patterns`):** la configuración está bien. El proxy `/api → localhost:5000` es correcto para desarrollo;
`VITE_API_URL` solo lleva una dirección pública y `configApi.js` la valida (exige `https://`). No hay ninguna variable
`VITE_*` secreta en el código. Recordatorio: `.env.local` existe y no se leyó; nada secreto debe ir con prefijo `VITE_`.

### 3.6 SEO por página (`ecc:seo`)

*SEO = cómo aparece la página en buscadores y al compartirla.* Es una web de una sola página (SPA): los buscadores leen
mejor el título y la descripción si React 19 los pone en cada página.

| Página | Título propuesto | Descripción (≤ 155 caracteres) | Estructura |
|---|---|---|---|
| Home | PetConnect · Adopción responsable y productos para mascotas | Conoce mascotas que buscan hogar en el Quindío y productos para su cuidado. | 1 `h1`, `h3` sin `h2` en beneficios → pasar a `h2` |
| Adopción | Mascotas en adopción · PetConnect | Perros y gatos que buscan familia. Mira su ficha y envía tu solicitud en línea. | Bien |
| Ficha mascota | {Nombre}, {especie} en adopción · PetConnect | Datos de {nombre} y solicitud de adopción. | Bien |
| Catálogo | Catálogo de productos · PetConnect | Alimento, accesorios y cuidado para tu mascota. | Bien |
| Producto | {Nombre} · PetConnect | Primeras 150 letras de la descripción | Bien |
| Checkout | Finalizar compra (demo) · PetConnect | — con `noindex` | Bien |
| Contacto | Contacto · PetConnect | Escríbenos tus preguntas sobre adopción o productos. | Bien |
| Política | Política de datos personales · PetConnect | (ya cambia el título) | Muy bien |

### 3.7 Contenido de mascotas e imágenes (`/revision-contenido-mascotas`)

- **Textos de salud en el Front:** no se encontró ninguno escrito en el código. Las descripciones vienen de la BD; las del
  *seed* ya tienen `# REVISAR-VETERINARIO` (`petconnect.Backend/seed.py:30-103`). Hay pruebas que lo vigilan
  (`tests/sin-salud-inventada.test.js`). ✅
- **Imágenes de productos y mascotas:** URLs de Unsplash (licencia Unsplash, uso libre), anotadas en `seed.py:29,82`. ✅
- **`src/assets/img/hero.png`:** origen no documentado; **no se usa**. Si el rediseño usa fotos nuevas, anotar la fuente.
- **Logo** (`public/logo.svg`): propio. ✅
- **Datos personales:** el teléfono y correo del pie (#3) son inventados y podrían ser de alguien real. ⚠️

### 3.8 Lo que funciona y hay que conservar

- `EstadoCarga`: tres estados honestos, `role="status"`/`"alert"`, botón "Reintentar" de 44 px, spinner con `motion-safe`.
- `FormularioSolicitud`: `aria-invalid`, foco al error, campos de 16 px, contador de caracteres, aviso de datos.
- `AvisoDemo` + `fieldset disabled` en Checkout: honestidad con el usuario.
- `PoliticaDatos`: índice lateral fijo en escritorio, `<details>` en celular, ancho de lectura `68ch`, `text-balance`.
- Aviso del carrito sin `innerHTML` (protección contra XSS, ítem 6.4).
- `useListaPaginada` + `BotonVerMas`: "Ver más" con `aria-busy`, sin repetir elementos.
- Imágenes de listas con `loading="lazy"` y alto fijo (no saltan al cargar).
- Íconos `lucide-react` con `aria-hidden` en los componentes nuevos; ningún emoji como ícono.

---

## 4. Dirección visual

### 4.1 Tres direcciones comparadas (`/ui-ux-pro-max` + `frontend-design`)

| | A · **Refugio cálido** (elegida) | B · Clínica amable | C · "Pet tech" naranja (sugerencia literal de la base de ui-ux-pro-max) |
|---|---|---|---|
| Idea | Papel crema, turquesa del logo como color principal y terracota para acentos; títulos con serifa suave; las fotos de las mascotas mandan | Blanco, turquesa y verde salvia, todo sans-serif, radios de 8 px | Naranja #F97316 + azul de confianza, estilo *claymorphism* (3D blando, bordes gruesos), Varela Round + Nunito Sans |
| Fuentes | Young Serif (títulos) + Figtree (texto) | Public Sans + Public Sans | Varela Round + Nunito Sans |
| Sensación | Cálida, confiable, de "casa de acogida" | Ordenada y seria; se parece a cualquier SaaS | Juguete; **infantil** |
| Por qué sí / no | Usa los colores que ya son de PetConnect (logo); se distingue sin ser chillona | Correcta pero cae en lo "de plantilla" que pediste evitar | **Descartada:** es lo que pediste evitar (infantil) y el naranja con texto blanco da ≈2,8:1 (no pasa AA) |

### 4.2 Qué se ve "de plantilla" hoy (`ecc:frontend-design-direction`)

1. Botón negro + botón con borde negro centrados bajo un título centrado (Home y CTA repiten la misma fórmula).
2. Tres tarjetas de beneficios con ícono a la izquierda (Truck/Shield/Heart) — el patrón más repetido de la web.
3. Fondo `gray-50` + borde `gray-200` en todas las secciones destacadas.
4. Tarjeta de producto y de mascota casi idénticas: la mascota (lo emotivo) se presenta igual que una bolsa de croquetas.
5. Pie de página negro con tres columnas genéricas.

**Lo que hará distinta a PetConnect en la dirección A:** la ficha de cada mascota como "expediente" con sus rasgos en
etiquetas (raza · edad · sexo), el turquesa y terracota del logo como sistema, y una tipografía de títulos con calidez
propia. La tienda queda más sobria; la adopción, más emotiva.

### 4.3 Tokens de la dirección A (para `index.css`, Tailwind 4)

*Token = un nombre para un valor de diseño (color, radio, sombra) que se usa en todas partes; si cambia, cambia en todo el sitio.*

**Contraste comprobado** con la fórmula WCAG (texto normal pide 4,5:1; bordes y foco 3:1):

| Token | Color | Uso | Contraste |
|---|---|---|---|
| `--color-papel` | `#FBF7F1` | Fondo de página | — |
| `--color-superficie` | `#FFFFFF` | Tarjetas, modales | — |
| `--color-tinta` | `#1E2A2F` | Texto principal | 13,78:1 sobre papel ✅ |
| `--color-tinta-suave` | `#55636A` | Texto secundario (reemplaza gray-400/500) | 5,82:1 sobre papel · 6,21:1 sobre blanco ✅ |
| `--color-marca` | `#1D6B74` | Botón principal, enlaces, foco | Blanco encima 6,16:1 · sobre papel 5,77:1 ✅ |
| `--color-marca-hover` | `#165860` | Botón principal al pasar el mouse | Blanco encima 8,08:1 ✅ |
| `--color-marca-claro` | `#E3F1F1` | Fondos suaves, etiqueta activa | Marca encima 5,32:1 ✅ |
| `--color-acento` | `#B4532A` | Terracota: precios destacados, botón "Adoptar" | Blanco encima 4,99:1 · sobre papel 4,67:1 ✅ |
| `--color-acento-claro` | `#FBEBDD` | Fondo de etiquetas de adopción | Acento oscuro `#8E3F1E` encima 6,26:1 ✅ |
| `--color-borde` | `#E6DED3` | Divisores decorativos | (decorativo) |
| `--color-borde-fuerte` | `#8C8178` | Contorno de campos y casillas | 3,80:1 sobre blanco · 3,56:1 sobre papel ✅ |
| `--color-exito` | `#2F7A45` | Mensajes de éxito | 5,26:1 ✅ |
| `--color-error` | `#B42318` | Errores | 6,57:1 ✅ |
| `--color-aviso` / `-claro` | `#7A4A00` / `#FDF3DC` | Avisos (demo) | 6,78:1 ✅ |
| `--color-noche` | `#14201F` | Pie de página | Papel encima 15,66:1; `#B9C4C2` 9,34:1; turquesa `#7FD3D6` 9,71:1 ✅ |

Comparación con lo actual: `gray-400` sobre blanco 2,54:1 ❌ · borde de campos `gray-300` 1,47:1 ❌ · `green-600` 3,30:1 ❌ ·
`amber-600` 3,19:1 ❌ · `red-500` (papelera) 3,76:1 ❌ (aceptable solo como ícono, 3:1).
El naranja del logotipo (`#E8733A`, 3,02:1) solo vale en texto grande (≥ 18,7 px en negrita): se queda en el logo.

```css
@theme {
  /* Fuentes (alojadas en el proyecto, ver decisión D1) */
  --font-display: "Young Serif", Georgia, serif;
  --font-sans: "Figtree Variable", "Segoe UI", system-ui, sans-serif;

  /* Colores (contraste comprobado arriba) */
  --color-papel: #fbf7f1;
  --color-superficie: #ffffff;
  --color-tinta: #1e2a2f;
  --color-tinta-suave: #55636a;
  --color-marca: #1d6b74;
  --color-marca-hover: #165860;
  --color-marca-claro: #e3f1f1;
  --color-acento: #b4532a;
  --color-acento-oscuro: #8e3f1e;
  --color-acento-claro: #fbebdd;
  --color-borde: #e6ded3;
  --color-borde-fuerte: #8c8178;
  --color-exito: #2f7a45;
  --color-error: #b42318;
  --color-aviso: #7a4a00;
  --color-aviso-claro: #fdf3dc;
  --color-noche: #14201f;

  /* Radios: solo tres */
  --radius-control: 0.625rem;  /* 10 px: botones, campos, etiquetas cuadradas */
  --radius-tarjeta: 1rem;      /* 16 px: tarjetas, carrito, modales */
  /* + rounded-full para chips y botones de ícono */

  /* Sombras: solo dos, cálidas (tinta, no negro) */
  --shadow-tarjeta: 0 1px 2px rgb(30 42 47 / 0.06), 0 4px 12px rgb(30 42 47 / 0.06);
  --shadow-elevada: 0 12px 32px rgb(30 42 47 / 0.14);

  /* Movimiento */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}
```

**Escala de texto:** cuerpo 16 px (`text-base`), secundario 14 px (`text-sm`), etiquetas 12–13 px; títulos
`h1` 32 → 48 px (`text-3xl md:text-5xl`, `font-display`), `h2` 24 → 30 px, `h3` 18–20 px (Figtree semibold).
**Espaciado:** la escala de 4 px de Tailwind, limitada a `1, 2, 3, 4, 6, 8, 12, 16, 24`; secciones con `py-12 md:py-20`;
contenedor `max-w-7xl px-4 md:px-6`. **Controles:** alto mínimo 44 px (`min-h-11`), foco `outline-2 outline-offset-2 outline-marca`.

### 4.4 Decisiones que te tocan antes de la Fase 1

| # | Decisión | Mi recomendación |
|---|---|---|
| D1 | Cómo cargar las fuentes | **Alojarlas en el proyecto** con los paquetes `@fontsource/young-serif` y `@fontsource-variable/figtree` (2 dependencias nuevas). Descartado: Google Fonts por enlace, porque manda la IP de cada visitante a Google (dato personal, Ley 1581) |
| D2 | Textos de beneficios del Home (#2) | Me dices qué ofrece de verdad PetConnect hoy; si no, propongo 3 basados en lo que ya funciona (adopción en línea, catálogo, datos protegidos) y los apruebas |
| D3 | Contacto del pie (#3) | Correo de atención + "Armenia, Quindío"; sin teléfono |
| D4 | Modales | `<dialog>` nativo (sin librerías nuevas) |

---

## 5. Plan de rediseño por fases

**Reglas para todas las fases** (tus instrucciones + CLAUDE.md):
- Cada fase nace de `rediseno-front`: `git switch -c rediseno-front-fase-N-nombre rediseno-front`. Al empezar te digo en qué rama estamos.
- Una página o sección por fase. Nada de Backend ni Móvil.
- Al terminar: `npm run lint` + `npm run build`, te doy el comando y la URL, y espero tu aprobación. Solo entonces
  `/guardar-partida` y `git switch rediseno-front` + `git merge --no-ff rediseno-front-fase-N-nombre`.
- Si no te gusta: vuelvo a `rediseno-front` y pido confirmación antes de borrar la rama.
- Revisión en **375 px y 1280 px**, y `/impeccable audit` al final de cada fase de pantalla.
- `rediseno-front` se une a `main` solo al final y con tu aprobación. Sin `git push` sin preguntar; nunca `--force`.

**Esfuerzo:** 🟢 < 30 min · 🟡 1–3 h · 🔴 medio día o más.

### Fase 1 — Tokens, Header y Home · rama `rediseno-front-fase-1-home` · 🔴
- [ ] 1.1 Tokens de §4.3 en `index.css` (+ fuentes según D1) y `min-height: 100dvh` (#13, #35, #36, #44)
- [ ] 1.2 Base de movimiento: `prefers-reduced-motion`, hover protegido, quitar *ripple* y animaciones sin uso; arreglar `useScrollReveal` (#12, #20, #24, #45, #41 en `animations.css`)
- [ ] 1.3 Header: colores de marca, nombre con tildes bien (#7), `aria-expanded`/`aria-current` (#17), contador 99+ (#29), botones de 44 px
- [ ] 1.4 Home: textos reales de beneficios (#2, decisión D2), nueva jerarquía con `font-display`, CTA de adopción con terracota, `h2` correctos
- [ ] 1.5 Título y descripción del Home (§3.6)
- *Listo cuando:* Home y Header se ven con la dirección A a 375 y 1280 px, contraste ≥ 4,5:1 en todo texto, y con "reducir movimiento" activado nada se desplaza.

### Fase 2 — Pie y marco de la app · rama `rediseno-front-fase-2-marco` · 🟡
- [ ] 2.1 Footer con `<Link>` (#4), contacto real (#3, D3), `h2` en vez de `h4`, año correcto (#42)
- [ ] 2.2 `ZonaDeError` (#8), página 404 (#22), volver arriba al cambiar de página (#21)
- [ ] 2.3 Carga diferida de Política, Checkout y RegisterModal (#33)
- *Listo cuando:* un error forzado en una página muestra el mensaje en vez de pantalla blanca, y `/xyz` muestra la 404.

### Fase 3 — Catálogo y tarjeta de producto · rama `rediseno-front-fase-3-catalogo` · 🟡
- [ ] 3.1 `ProductCard`: tokens, agotado desactivado (#6), foto de respaldo (#27), precio único `utils/precio.js` (#28), sin campos muertos (#41)
- [ ] 3.2 Catalog: buscador de 16 px (#14, #15), filtros con `aria-pressed` y sin escala (#18), búsqueda sin tildes (#40), "Quitar filtros" (#39)
- [ ] 3.3 `EstadoCarga` y `BotonVerMas` con los tokens nuevos (sin cambiar su comportamiento)
- *Listo cuando:* el catálogo se usa solo con teclado y un producto con stock 0 no se puede agregar.

### Fase 4 — Ficha de producto · rama `rediseno-front-fase-4-producto` · 🟢
- [ ] 4.1 ProductDetail con tokens, ícono de stock correcto (#31), foto de respaldo, título y descripción por producto

### Fase 5 — Carrito · rama `rediseno-front-fase-5-carrito` · 🔴
- [ ] 5.1 `CartModal` como `<dialog>` (#1), botones de 44 px (#10), nombre en 2 líneas (#30), salida animada (§3.4 #1), "Ver catálogo" si está vacío (#39)
- [ ] 5.2 `CartContext`: tope de stock (#6), guardado en `localStorage` (#5), valor memorizado y `useCart` en su archivo (#32)
- [ ] 5.3 Aviso "agregado" como zona `role="status"` de React (#19) y pulso del ícono (§3.4 #3)
- *Listo cuando:* recargar no vacía el carrito, Escape lo cierra y el foco vuelve al ícono.

### Fase 6 — Checkout · rama `rediseno-front-fase-6-checkout` · 🟢
- [ ] 6.1 Tokens, resumen que aguanta nombres largos (#25), enlaces en vez de botones (#37), "Finalizar compra" (#38), `noindex`

### Fase 7 — Adopción (lista) · rama `rediseno-front-fase-7-adopcion` · 🟡
- [ ] 7.1 Tarjeta de mascota propia (distinta a la de producto), etiquetas de rasgos, foto de respaldo, sin animación de título (§3.4)

### Fase 8 — Ficha de mascota · rama `rediseno-front-fase-8-ficha-mascota` · 🟡
- [ ] 8.1 PetDetail como "expediente": nombre largo con `flex-wrap`, descripción con saltos (#26), foto de respaldo
- [ ] 8.2 `FormularioSolicitud` con tokens (sin cambiar su lógica) y celebración sutil al enviar (§3.4 #5)

### Fase 9 — Cuenta (inicio de sesión y registro) · rama `rediseno-front-fase-9-cuenta` · 🔴
- [ ] 9.1 `LoginModal` y `RegisterModal` como `<dialog>` (#1), campos de 16 px con borde visible (#14, #15), `autoComplete` (#16), etiqueta del código (#9), spinner `motion-safe` (#43)
- [ ] 9.2 `CasillaAutorizacion` con tokens **sin tocar el texto legal**
- *Listo cuando:* el registro completo se hace con teclado y lector de pantalla, y el código se autocompleta en el celular.

### Fase 10 — Contacto · rama `rediseno-front-fase-10-contacto` · 🟢
- [ ] 10.1 Contact con tokens; revisar contigo si el horario de atención es real

### Fase 11 — Política de datos · rama `rediseno-front-fase-11-politica` · 🟢
- [ ] 11.1 Solo tokens y tipografía; **el texto legal no se cambia**

### Fase 12 — Pulido final · rama `rediseno-front-fase-12-pulido` · 🟡
- [ ] 12.1 Textos en mayúscula de oración en todo el sitio (#38)
- [ ] 12.2 `/impeccable audit` completo (meta: ≥ 17/20) y revisión a 375 y 1280 px de todas las páginas

### Fase 13 (opcional) — Pruebas de componentes · rama `rediseno-front-fase-13-pruebas` · 🔴
- [ ] 13.1 Con `ecc:react-testing`: pruebas de `CartModal` (Escape, foco, tope de stock), `Header` (nombre con tildes) y `ProductCard` (agotado). Necesita instalar Vitest + Testing Library: se decide al llegar

### Cierre
- [ ] Unir `rediseno-front` a `main` **con tu aprobación**; preguntar antes de `git push`

---

## 6. Para ver la web antes de la Fase 1

Si quieres confirmar los hallazgos *(inferidos)* a la vista, levanta el Front (y la API si quieres datos):

```powershell
cd PetConnect.Front\petconnect-app
npm run dev
```

Luego abre `http://localhost:5173` y prueba a 375 px (herramientas del navegador → modo dispositivo) y a 1280 px.
