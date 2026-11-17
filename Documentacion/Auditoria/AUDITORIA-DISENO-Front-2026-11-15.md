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
| D2 | Textos de beneficios del Home (#2) | Los 3 textos de §4.5, sacados del análisis y limitados a lo que la web ya hace. "Próximamente: carnet digital" solo si confirmas que está en el plan |
| D3 | Contacto del pie (#3) | Correo de atención + "Armenia, Quindío"; sin teléfono |
| D4 | Modales | `<dialog>` nativo (sin librerías nuevas) |

### 4.5 Qué cambia con los documentos de análisis (agregado el 15/11/2026)

Se revisaron cuatro documentos de la fase de análisis (GA1, julio–agosto de 2025): la especificación de requisitos
(RF, RNF, RIU, RS, RR, RM), las entrevistas a 3 dueños de mascotas, la formulación del proyecto y el informe de
metodología (SLO). Aquí no se copian nombres ni datos de las personas entrevistadas.

**Lo que dicen los usuarios (entrevistas):**

| Evidencia | Cuántos | Qué significa para el rediseño |
|---|---|---|
| Usan sobre todo el **celular** | 3 de 3 | Diseñar y probar primero a 375 px; 1280 px después. Confirma la prioridad de #10, #14 y #24 |
| **No usan apps** para su mascota hoy (o casi nunca) | 3 de 3 | RNF02 "fácil para usuarios no técnicos": textos simples, botones grandes, nada escondido detrás de íconos sin texto |
| Esperan seguridad **alta** o "conforme a norma" | 3 de 3 | Mostrar la confianza de forma honesta (verificación por correo, política de datos). Refuerza D1: no mandar la IP de visitantes a Google |
| Usarían la sección de **adopción** | 2 de 3 | La adopción es un pilar, no el único: el Home debe equilibrar **cuidado + adopción**, no ser solo adopción |
| Del directorio y la tienda esperan alimento, accesorios, cuidados, veterinarias | 3 de 3 | Las categorías del catálogo deben verse claras y con nombre de persona, no de base de datos |

**Lo que piden los requisitos y la web todavía no tiene:** carné de vacunación (RF03), directorio de servicios (RF06),
comunidad (RF07), diario de salud (RF08), GPS (RF10) y compra real (RF11). **El rediseño no los muestra ni los promete**
(mismo criterio del hallazgo #2 y del ítem 3.3): un botón a algo que no existe es un callejón sin salida.

**Ajustes al plan:**
- **RIU03** pide un menú con íconos por funcionalidad. → En la Fase 1, el Header lleva ícono **y** texto para lo que sí
  existe (Catálogo, Adopción, Contacto); en el celular, el menú usa la misma pareja ícono + texto.
- **Textos del Home (D2)**, todos ciertos hoy:
  1. **Adopción en línea** — "Conoce a cada mascota y envía tu solicitud desde su ficha. Te respondemos al correo de tu cuenta."
  2. **Lo que necesita, en un catálogo** — "Alimento, accesorios y cuidado para tu mascota, en un solo lugar."
  3. **Tus datos, protegidos** — "Verificamos tu correo al entrar y tratamos tus datos según la Ley 1581 de 2012."
  4. *(Opcional, solo si confirmas que está planeado)* "Próximamente: carné digital de vacunación con recordatorios"
     — fue lo que más gustó en las entrevistas (3 de 3).
- **Título del Home:** "Todo para tu mascota en un solo lugar" promete más de lo que hay. Propuesta:
  **"Cuida y adopta, en un solo lugar"**, con dos botones de igual peso: "Ver mascotas en adopción" y "Explorar catálogo".

**Cosas raras en los documentos (para tu evidencia GA, no para el Front):**
- **RS03** pide cifrar contraseñas con **SHA-256**, pero el proyecto usa **bcrypt** (regla 4 de CLAUDE.md), que es lo
  correcto: SHA-256 es rápido y por eso fácil de adivinar a fuerza bruta. Conviene corregir el requisito.
- **RR02** dice que cada módulo carga en "**5 minutos**"; seguramente quiso decir 5 segundos (RNF04 ya pide 2 s por acción).
- **Formulación de Proyecto de Software** describe una app de **gestión de tareas**, no PetConnect (es la plantilla de ejemplo).
- **SLO** describe un sistema de inventario y facturación electrónica de una empresa comercial, no PetConnect.
  Su elección de **Scrum** sí encaja con este plan: cada fase es un incremento que revisas antes de unirlo.

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
- [x] 1.1 Tokens de §4.3 en `index.css` (+ fuentes según D1) y `min-height: 100dvh` (#13, #35, #36, #44)
- [x] 1.2 Base de movimiento: `prefers-reduced-motion`, hover protegido, quitar *ripple* y animaciones sin uso; arreglar `useScrollReveal` (#12, #20, #24, #45, #41 en `animations.css`)
- [x] 1.3 Header: colores de marca, ícono + texto en cada enlace (RIU03, §4.5), nombre con tildes bien (#7), `aria-expanded`/`aria-current` (#17), contador 99+ (#29), botones de 44 px
- [x] 1.4 Home: título "Cuida y adopta, en un solo lugar" y beneficios de §4.5 (#2, D2), cuidado y adopción con el mismo peso, nueva jerarquía con `font-display`, `h2` correctos; diseñado primero a 375 px
- [x] 1.5 Título y descripción del Home (§3.6)
- *Listo cuando:* Home y Header se ven con la dirección A a 375 y 1280 px, contraste ≥ 4,5:1 en todo texto, y con "reducir movimiento" activado nada se desplaza.
- *Cerrada el 15/11/2026.* Revisada en el navegador a 320, 375, 390 y 1280 px; `/impeccable audit` 15/20. Notas para otras fases:
  - El CSS del *ripple* sigue porque `ProductCard` (Fase 3) y `ProductDetail` (Fase 4) llaman a `addRipple()`; ver nota en `rippleEffect.js`.
  - `page-enter` quedó como fundido de 120 ms en **todas** las páginas; el fondo crema y la fuente Figtree también aplican a todo el sitio.
  - El detector marca el fondo crema como "típico de IA": es la dirección A aprobada y se mantiene.

### Fase 2 — Pie y marco de la app · rama `rediseno-front-fase-2-marco` · 🟡
- [x] 2.1 Footer con `<Link>` (#4), contacto real (#3, D3), `h2` en vez de `h4`, año correcto (#42)
- [x] 2.2 `ZonaDeError` (#8), página 404 (#22), volver arriba al cambiar de página (#21)
- [x] 2.3 Carga diferida de Política, Checkout y RegisterModal (#33)
- *Listo cuando:* un error forzado en una página muestra el mensaje en vez de pantalla blanca, y `/xyz` muestra la 404.
- *Hecha el 15/11/2026, pendiente de tu aprobación.* Revisada en el navegador a 320, 375 y 1280 px. JS principal: 324 → 298 kB
  (Política 20,5 kB, Registro 10,4 kB y Checkout 4 kB salen aparte). Notas para otras fases:
  - Tokens nuevos solo para el fondo noche: `noche-texto` #B9C4C2 (9,34:1), `noche-marca` #7FD3D6 (9,71:1, también el foco)
    y `noche-acento` #E8733A (5,53:1, el naranja del logo). El foco general (`marca`) sobre noche da 2,71:1: no usarlo ahí.
  - `src/utils/contacto.js` tiene `CORREO_ATENCION`. Todavía lo repiten: `AvisoDemo.jsx` (Fase 6), `FormularioSolicitud.jsx`
    (Fase 8), `LoginModal.jsx` (Fase 9), `Contact.jsx` (Fase 10) y `PoliticaDatos.jsx` como `CORREO_DATOS` (Fase 11).
    También la app móvil (fuera de este rediseño).
  - **Fase 3.3:** `EstadoCarga` con `encabezado="h1"` dibuja el título a 16 px; `impeccable detect` marca la 404 como
    "jerarquía plana". Al pasarlo a tokens, darle tamaño de título (`font-display`) cuando sea `h1`.
  - El registro se descarga la primera vez que se abre y se queda montado (así conserva lo escrito si se cierra a medias).
  - Volver arriba también aplica al botón "Atrás" del navegador (vuelve arriba en vez de recordar la posición).
  - La prueba "de abajo del catálogo a un producto queda arriba" necesita la API encendida; sin ella se probó con el pie
    (de abajo del Home a Política: queda arriba).

### Fase 3 — Catálogo y tarjeta de producto · rama `rediseno-front-fase-3-catalogo` · 🟡
- [x] 3.1 `ProductCard`: tokens, agotado desactivado (#6), foto de respaldo (#27), precio único `utils/precio.js` (#28), sin campos muertos (#41), quitar `addRipple` y usar `presionable`
- [x] 3.2 Catalog: buscador de 16 px (#14, #15), filtros con `aria-pressed` y sin escala (#18), búsqueda sin tildes (#40), "Quitar filtros" (#39)
- [x] 3.3 `EstadoCarga` y `BotonVerMas` con los tokens nuevos (sin cambiar su comportamiento)
- *Listo cuando:* el catálogo se usa solo con teclado y un producto con stock 0 no se puede agregar.
- *Hecha el 15/11/2026, pendiente de tu aprobación.* Revisada en el navegador a 320, 375 y 1280 px con la API encendida;
  `impeccable detect` en `/catalogo` (1280 y 375 px): solo el fondo crema, que es la dirección A aprobada. Lint 0 errores,
  build y 109 pruebas pasan (`tests/precio.test.js` y `tests/texto.test.js` son nuevas).
  Peores datos simulados cambiando `window.fetch` en la pestaña (sin tocar BD ni archivos; se quitó al recargar):
  nombre de 120 caracteres, stock 0, `image: null`, foto rota y precio 89900.5. Notas para otras fases:
  - **Piezas nuevas para reusar:** `src/components/FotoConRespaldo.jsx` (`icono` + `tono` "marca" o "acento"; para
    mascotas en las Fases 7 y 8: `icono={PawPrint} tono="acento"`), `src/utils/precio.js` (`formatearPrecio`) y
    `src/utils/texto.js` (`coincideBusqueda`, que también sirve para un buscador de Adopción).
  - **Todavía repiten `formatPrice`:** `ProductDetail.jsx` (Fase 4), `CartModal.jsx` (Fase 5) y `Checkout.jsx` (Fase 6).
    Cambiarlos a `formatearPrecio` en su fase. Ojo: el precio máximo de la BD (99.999.999,99) sale "$ 100.000.000".
  - **Tarjeta horizontal en celular** (< 640 px): foto de 96–112 px a la izquierda. También aplica a los destacados del Home.
  - **`EstadoCarga` con `encabezado="h1"`** ahora usa `font-display` de 24–30 px: se nota en la 404 y en los estados de
    carga y "no encontrado" de las fichas de mascota y producto.
  - **Pendiente nuevo (`BotonVerMas`):** al pulsarlo con teclado, el botón se desactiva mientras carga y el foco cae al
    inicio de la página. Arreglo propuesto: `aria-disabled` en vez de `disabled`, o enfocar el primer producto nuevo.
    No se cambió aquí porque esta fase era "solo tokens"; decidir en la Fase 7 (Adopción también lo usa) o en la 12.
  - **`useScrollReveal`** ya no lo usa el catálogo; solo queda en `Adoption.jsx` (Fase 7 decide si se borra).
  - La prueba pendiente de la Fase 2 pasó: de abajo del catálogo a un producto, la ficha aparece arriba.

### Fase 4 — Ficha de producto · rama `rediseno-front-fase-4-producto` · 🟢
- [x] 4.1 ProductDetail con tokens, ícono de stock correcto (#31), foto de respaldo, título y descripción por producto
- [x] 4.2 Quitar `addRipple`; borrar `rippleEffect.js`, `@keyframes ripple` y `.btn-ripple` de `animations.css` (ya nadie lo llama)
- *Hecha el 15/11/2026, pendiente de tu aprobación.* Revisada en el navegador a 320, 375 y 1280 px con la API encendida;
  `impeccable detect` en `/producto/13` (1280 y 375 px): solo el fondo crema (dirección A aprobada); el archivo fuente, 0.
  Lint 0 errores, build y 114 pruebas pasan (5 nuevas de `resumir` en `tests/texto.test.js`). Solo teclado: volver al
  catálogo, agregar al carrito y "Reintentar" funcionan, con foco visible. Peores datos simulados cambiando `window.fetch`
  en la pestaña sobre `/api/productos/:id` (sin tocar BD ni archivos; se quitó al recargar): nombre de 120 caracteres,
  stock 0, 1 y `"0"`, `image: null`, foto rota, precio 89900.5 ("$ 89.901"), descripción vacía, con saltos y de 2.000
  caracteres, y `category: null`. Ninguno desborda a 320 px. Qué cambió:
  - **Categoría:** ya no es una etiqueta en MAYÚSCULAS sobre el título (*eyebrow*, prohibido); ahora es un dato en una
    lista `<dl>` ("Categoría" · "Disponibilidad") debajo del precio. Si no llega, la fila no se dibuja.
  - **Botón antes de la descripción** en celular (no hay que bajar para comprar) y foto fija (`sticky`) en escritorio
    mientras se lee una descripción larga.
  - **Arreglo extra:** al cambiar de un producto a otro sin salir de la ficha se seguía viendo el producto (o el error)
    anterior mientras cargaba el nuevo. Ahora la respuesta se guarda con el `id` que la pidió y, si no coincide, se ve
    "Cargando producto…". Hoy no se notaba (no hay enlaces de ficha a ficha), pero sí con "Reintentar".

  Notas para otras fases:
  - **Clase vieja `btn-ripple`** (sin efecto, su CSS ya no existe): `CartModal.jsx:113` (Fase 5) y `LoginModal.jsx:312`
    (Fase 9). Quitarla junto con `btn-hover` y usar `presionable`.
  - **Todavía repiten `formatPrice`:** `CartModal.jsx` (Fase 5) y `Checkout.jsx` (Fase 6).
  - **`resumir(texto, 150)`** en `src/utils/texto.js`: sirve para la descripción de la pestaña de la ficha de mascota (Fase 8).
  - **`PetDetail.jsx` (Fase 8)** tiene el mismo problema de estado viejo al cambiar de `id` (`setEstado` igual que tenía
    ProductDetail); aplicar el mismo arreglo de "pedida".
  - **Stock `null`** cuenta como agotado (misma regla que la tarjeta: `Number(null)` es 0). Si la API no manda `stock`,
    no se bloquea y no se muestra la fila de disponibilidad.
  - **Contenido:** la foto del producto 14 (Unsplash) muestra la marca de una tienda real en la bolsa. Licencia libre,
    pero puede confundir: decidir si se cambia en `seed.py` (fuera del Front).

### Fase 5 — Carrito · rama `rediseno-front-fase-5-carrito` · 🔴
- [x] 5.1 `CartModal` como `<dialog>` (#1), botones de 44 px (#10), nombre en 2 líneas (#30), salida animada (§3.4 #1), "Ver catálogo" si está vacío (#39)
- [x] 5.2 `CartContext`: tope de stock (#6), guardado en `localStorage` (#5), valor memorizado y `useCart` en su archivo (#32)
- [x] 5.3 Aviso "agregado" como zona `role="status"` de React (#19) y pulso del ícono (§3.4 #3)
- *Listo cuando:* recargar no vacía el carrito, Escape lo cierra y el foco vuelve al ícono.
- *Hecha el 15/11/2026, pendiente de tu aprobación.* Revisada en el navegador integrado a 320, 375 y 1280 px con la API encendida.
  Lint 0 errores (queda el aviso de `AuthContext`, Fase 9), build y 139 pruebas pasan (`tests/carrito.test.js` es nueva y
  `tests/aviso-carrito.test.js` se reescribió). `impeccable detect`: 0 hallazgos en los archivos del carrito; en `/catalogo`
  (1280 y 375 px) solo el fondo crema (dirección A aprobada). El escaneo por URL abre su propio navegador con el carrito
  cerrado, así que el carrito abierto se revisó a mano: texto ≥ 6,16:1 y borde de los botones de cantidad 3,80:1.
  Decisiones aprobadas:
  - **D5.1 Producto guardado que cambió:** al cargar se pide cada producto a la API. Si ya no existe (404) o quedó en
    stock 0, se quita; si hay menos stock, la cantidad baja al stock. Se avisa en un recuadro "Actualizamos tu carrito" la
    próxima vez que se abre (se borra al cerrar). Si la API no responde, **no se borra nada** y sale "Reintentar".
  - **D5.2 Al cerrar sesión el carrito se conserva** (solo guarda id y cantidad, nada personal).
  - **D5.3 Una llamada por producto** con `getProducto(id)` (ya existía en `api.js`), en paralelo, con un máximo de 50
    productos distintos. Descartada la lista del catálogo (va por páginas y no distingue "borrado" de "en otra página").
  - **Aviso dentro de `addItem`:** el carrito decide si de verdad agregó ("Ya tienes las 6 unidades disponibles" en vez de
    "agregado"). Por eso en `ProductCard` y `ProductDetail` se quitó la línea `showAddToCartToast(...)` además del import.
  Peores datos (sin tocar BD ni archivos): para que la carga inicial fallara se guardó un token con "€" (el navegador no
  deja mandarlo en un encabezado y la llamada falla como "sin conexión"); luego se quitó, se simuló `window.fetch` y se
  pulsó "Reintentar". Nombre de 120 caracteres, cantidad 999 con stock 1 (bajó a 1 y el "+" quedó en el tope con el foco),
  producto que pasó a stock 0 y otro con 404 (se quitaron con aviso), `image: null` y foto rota (respaldo), precio 89900.5
  ("$ 89.901"), 129 unidades ("99+"), JSON roto (carrito vacío, clave borrada) y `localStorage` bloqueado (funciona en
  memoria, sin errores). Con la API real: id 999999 (404) y 999 unidades de un producto con stock 6. Todo se deshizo
  (sin clave del carrito ni token de prueba). Solo teclado: abrir, cambiar cantidades, quitar, "Ir a pagar" y Escape; el
  foco nunca sale del carrito y vuelve al ícono al cerrar.

  Notas para otras fases:
  - **Fase 6 (Checkout):** al recargar estando en `/checkout`, el carrito tarda un momento en traer nombre y precio de la
    API y Checkout dice "vacío" mientras tanto (y para siempre si la API no responde). Usar `estadoCarrito`
    ("cargando" / "listo" / "error") y `reintentarCarrito` de `useCart`. También cambiar `formatPrice` por `formatearPrecio`.
  - **Fase 9 (cuenta):** `html:has(dialog[open])` en `animations.css` ya bloquea el desplazamiento de la página para
    cualquier `<dialog>`; `CartModal.jsx` sirve de modelo (salida con clase "cerrando" + `onCancel` para Escape).
  - **Header, aviso de "cierre de sesión sin confirmar":** usa `toast-enter` (entra deslizándose), un tercer movimiento que
    §3.4 no tiene. No se tocó (en el Header solo se permitía el pulso). Decidir en la Fase 12.
  - **`api.js`:** `apiFetch` lee el token de `localStorage` sin `try/catch`. Si el navegador bloquea `localStorage` de
    verdad, todas las llamadas a la API fallan (el carrito ya lo aguanta). Fuera de esta fase.
  - **Pestañas:** el carrito no se sincroniza entre dos pestañas abiertas a la vez (cada una guarda lo suyo; gana la última).
  - **Por confirmar a la vista:** la captura del navegador integrado no siempre pinta el fondo oscuro del `<dialog>`
    (`::backdrop`), aunque su color calculado es el correcto. "Reducir movimiento" no se puede emular en ese navegador: se
    comprobaron las reglas CSS cargadas, falta verlo con el ajuste del sistema.

### Fase 6 — Checkout · rama `rediseno-front-fase-6-checkout` · 🟢
- [x] 6.1 Tokens, resumen que aguanta nombres largos (#25), enlaces en vez de botones (#37), "Finalizar compra" (#38), `noindex`
- [x] 6.2 `AvisoDemo` con tokens (`aviso` / `aviso-claro`) y `CORREO_ATENCION` de `utils/contacto.js`, sin cambiar textos
- *Listo cuando:* recargar en `/checkout` nunca dice "vacío" si hay productos guardados y un nombre de 120 caracteres no saca
  el precio de la caja.
- *Hecha el 16/11/2026, pendiente de tu aprobación.* Revisada en el navegador integrado a 320, 375 y 1280 px con la API
  encendida. Lint 0 errores (queda el aviso de `AuthContext`, Fase 9), build y 139 pruebas pasan. `formatPrice` ya no existe
  en el código (solo en un comentario de `precio.js`); ningún `gray-*`, `black`, `white` ni `amber-*` en los dos archivos.
  `impeccable detect` en `/checkout` (1280 y 375 px): solo el fondo crema (dirección A aprobada). El escaneo por URL ve el
  carrito vacío, así que con productos se midió a mano: texto ≥ 5,82:1, borde de campos y botón final 3,56:1, foco 5,58:1
  sobre el aviso. Decisiones aprobadas:
  - **D6.1 Estados:** "Cargando tu pedido…" mientras el carrito trae datos de la API; si falla, "No pudimos cargar tu
    carrito" con Reintentar (principal) y "Ver catálogo" (con borde). Con error no se muestra un resumen a medias.
    "Tu carrito está vacío" solo con `estadoCarrito` "listo" y sin productos. Tras "Reintentar" el foco pasa al título.
  - **D6.2 Volver:** `<Link to="/catalogo">` "Volver al catálogo". Descartado "Editar carrito" (repite el ícono del Header).
  - **D6.3 Orden:** resumen primero (arriba en celular, a la izquierda desde 1024 px); mismo orden visual y de lectura.
  - **D6.4 Campos:** los 4 se quedan bloqueados (`fieldset disabled`), con 16 px (#14) y borde `borde-fuerte` (#15).
  Peores datos (sin tocar BD ni archivos): token con "€" para que la carga fallara (error al recargar), luego se quitó, se
  simuló `window.fetch` con 4 s de espera y se pulsó "Reintentar" con Enter (se vio "Cargando tu pedido…"). Nombre de 120
  caracteres (2 líneas + `title`), precio 89900.5 ("$ 89.901"), precio `null` ("Precio no disponible" y "No incluye 1
  producto sin precio."), 128 unidades ("128 unidades de $ 89.901", total "$ 11.553.164"), un solo producto (API real) y
  carrito vacío. Nada desborda a 320 px. Solo teclado: "Volver al catálogo", "Reintentar" y "Ver catálogo" (vacío y error),
  con foco visible. El `noindex` existe en `/checkout` y desaparece al ir a `/catalogo`. Todo se deshizo (sin clave del
  carrito ni token de prueba). Arreglos que salieron al probar:
  - Un precio `null` salía "$ 0" (`Number(null)` es 0); ahora sale "Precio no disponible".
  - Al pulsar "Reintentar" el foco caía al `<body>`; ahora va al título "Finalizar compra".

  Notas para otras fases:
  - **`CartModal.jsx` (Fase 12):** tiene el mismo problema del precio `null`: calcula
    `formatearPrecio(Number(item.price) * item.quantity)` y saldría "$ 0". Arreglo: calcular el subtotal solo si
    `formatearPrecio(item.price)` no es `null`, como en `Checkout.jsx`.
  - **`AvisoDemo` solo lo usa Checkout**, y nadie le pasa `invitacion`: la línea del correo no se ve en ninguna página (está
    pasada a tokens, sin probar a la vista). `LoginModal.jsx` (Fase 9) y `FormularioSolicitud.jsx` (Fase 8) todavía nombran
    `AvisoDemo.jsx` en su comentario de "copias del correo"; quitarlo al cambiarlos a `contacto.js`.
  - Si se deja el carrito cargando para siempre (la API no responde y tampoco falla), Checkout se queda en "Cargando tu
    pedido…": en `api.js` solo el cierre de sesión tiene tiempo límite (`AbortSignal.timeout`), las demás llamadas no.
    Fuera de esta fase.

### Fase 7 — Adopción (lista) · rama `rediseno-front-fase-7-adopcion` · 🟡
- [x] 7.1 Tarjeta de mascota propia (distinta a la de producto), etiquetas de rasgos, foto de respaldo, sin animación de título (§3.4)
- [x] 7.2 `Adoption.jsx` con tokens, título "Mascotas en adopción" (#38), pestaña y descripción (§3.6), sin `useScrollReveal`
- [x] 7.3 Limpieza: borrados `useScrollReveal.js`, `scrollReveal.js` y, en `animations.css`, `scroll-reveal`, `stagger-*`,
  `hero-title`, `hero-subtitle`, `fadeInUp`, `card-hover`, `img-zoom` y `link-animate` (#12, #20). `btn-hover` queda (LoginModal)
- *Listo cuando:* una mascota con nombre de 80 caracteres y sin foto se ve bien a 320 px, la tarjeta de mascota ya no se
  confunde con la de producto y no queda animación de título ni de scroll en Adopción.
- *Hecha el 16/11/2026, pendiente de tu aprobación.* Revisada en el navegador integrado a 320, 375 y 1280 px con la API
  encendida. Lint 0 errores (queda el aviso de `AuthContext`, Fase 9), build y 142 pruebas pasan (3 nuevas de
  `rasgosMascota` en `tests/mascota.test.js`). Ningún `gray-*`, `black`, `white`, `amber-*` ni hex en `Adoption.jsx` y
  `TarjetaMascota.jsx`; las clases borradas solo aparecen en comentarios. `impeccable detect` en `/adopcion` (1280 y 375 px):
  solo el fondo crema (dirección A aprobada). Decisiones aprobadas:
  - **D7.1 Tarjeta:** `src/components/TarjetaMascota.jsx`. Foto vertical 4:5 a todo el ancho (también en celular), nombre
    `h2` en `font-display`, especie en etiqueta terracota (`acento-claro` / `acento-oscuro`, 6,26:1), rasgos en etiquetas
    (`tinta-suave` sobre `papel`, 5,82:1) y "Conocer más" terracota (blanco sobre `acento`, 4,99:1). Enlaces: nombre y botón;
    la foto lleva al mismo lugar pero con `tabIndex -1` y `aria-hidden` (como `ProductCard`). Rejilla de 1, 2, 3 y 4 columnas
    (640, 1024 y 1280 px).
  - **D7.2 Rasgos:** `rasgosMascota(pet)` en `utils/mascota.js` devuelve la lista; `datosMascota` ahora es
    `rasgosMascota(pet).join(" · ")` (mismo resultado, PetDetail no cambia). Sin rasgos conocidos no se dibuja la lista.
  - **D7.3 Sin foto:** ícono según la especie (`Dog` si empieza por "perr", `Cat` si empieza por "gat", sin importar
    tildes ni mayúsculas; `PawPrint` para otra especie o ninguna), tono "acento".
  - **D7.4 Limpieza:** hecha (7.3).
  - **D7.5 Foco de `BotonVerMas`:** se deja para la Fase 12 (cambia también el Catálogo).
  - **D7.6 Filtro por especie:** no por ahora. La lista va de 12 en 12 y filtrar solo lo cargado engañaría; hacerlo bien
    necesita `?especie=` en la API (Backend).
  Peores datos simulados cambiando `window.fetch` en la pestaña solo para `/api/mascotas/adopcion` (sin tocar BD ni
  archivos; se quitó al recargar y `localStorage` quedó vacío): nombre de 80 caracteres (2 líneas + `title`), nombre de 80
  letras sin espacios (se corta sin desbordar), raza de 80 (la etiqueta pasa a varias líneas), `image: null`, foto rota,
  especie "Conejo", `null`, "perra" y "GATA", edad `null`, 0, 1 y 25, sexo "no_definido", ninguna característica conocida
  (sin renglón vacío), una sola mascota (sin "Ver más"), lista vacía, error con "Reintentar" y error en "Ver más" (las 12 se
  quedan y sale el aviso). Nada desborda a 320 px. Solo teclado: por tarjeta, nombre y "Conocer más" (la foto no recibe
  Tab), "Reintentar" y "Ver más mascotas", con foco visible. Arreglo que salió al probar:
  - Al pulsar "Reintentar" el foco caía al `<body>`; ahora va al título "Mascotas en adopción" (igual que Checkout).

  Notas para otras fases:
  - **Fase 8 (PetDetail):** reusar `rasgosMascota` para las etiquetas del "expediente" y el mismo ícono por especie (hoy
    `iconoEspecie` vive dentro de `TarjetaMascota.jsx`; si PetDetail lo necesita, moverlo a un archivo propio en
    `src/components/` y exportarlo). Usar `FotoConRespaldo` con `tono="acento"` y `alt` con el nombre. La especie llega
    como la escribió el refugio ("perra", "GATA"): se muestra tal cual, no se corrige.
  - **Fase 12 (`BotonVerMas`):** confirmado otra vez en Adopción: tras "Ver más" con teclado el foco cae al `<body>`.
  - **Buscador o filtro de Adopción:** necesita `?especie=` en `/api/mascotas/adopcion` (Backend) antes de hacerlo en el Front.

### Fase 8 — Ficha de mascota · rama `rediseno-front-fase-8-ficha-mascota` · 🟡
- [x] 8.1 PetDetail como "expediente": nombre largo con `flex-wrap`, descripción con saltos (#26), foto de respaldo
  (#27), "Solicitar adopción" (#38), pestaña y descripción (§3.6), arreglo de "pedida" y foco tras "Reintentar"
- [x] 8.2 `FormularioSolicitud` con tokens (sin cambiar su lógica ni sus textos), foco al abrir y al cerrar, `CORREO_ATENCION`
- [x] 8.3 Celebración sutil al enviar una solicitud de adopción (§3.4 #5), solo sin "reducir movimiento"
- *Listo cuando:* una mascota con nombre de 80 caracteres, sin foto y con descripción de varios párrafos se ve bien a
  320 px, la solicitud se envía solo con teclado, la celebración respeta "reducir movimiento" y Contacto no se rompe.
- *Hecha el 16/11/2026, pendiente de tu aprobación.* Revisada en el navegador integrado a 320, 375 y 1280 px con la API
  encendida. Lint 0 errores (queda el aviso de `AuthContext`, Fase 9), build y 142 pruebas pasan. Ningún `gray-*`, `black`,
  `white`, `amber-*`, `green-*`, `red-*` ni hex en `PetDetail.jsx` y `FormularioSolicitud.jsx`. `impeccable detect` en
  `/adopcion/3` (1280 y 375 px): solo el fondo crema (dirección A aprobada); en los archivos, 0 y un aviso sobre la curva con
  rebote de la celebración (es la aprobada en D8.6). Decisiones aprobadas:
  - **D8.1 Expediente:** especie en etiqueta terracota junto al nombre; raza, edad y sexo en un `<dl>` dentro de un recuadro,
    una fila por dato. Sin ningún rasgo conocido no hay recuadro; nunca "Desconocido".
  - **D8.2** `iconoEspecie` vive en `src/components/iconoEspecie.js`; `TarjetaMascota.jsx` solo cambió su import.
  - **D8.3 Orden:** foto, nombre + especie, expediente, botón y descripción. Foto cuadrada en el celular, 4:5 y fija
    (`sticky`) desde 768 px.
  - **D8.4 Foco:** al abrir, el foco va al título del formulario (o a "Inicia sesión para enviar" sin sesión); al pulsar
    "Cerrar" vuelve a "Solicitar adopción". Si llega otra ficha, el formulario se cierra solo. Se guarda la *respuesta* para
    la que se abrió (no solo el `id`): así también se cierra al volver a la misma mascota con Atrás/Adelante (A → B → A).
  - **D8.5** Botón principal terracota en adopción y turquesa en contacto; la celebración solo en adopción.
  - **D8.6** Check de `scale(0.8)` a 1 en 400 ms con `cubic-bezier(0.34, 1.56, 0.64, 1)` y texto con fundido de 200 ms,
    solo dentro de `prefers-reduced-motion: no-preference`.
  - **D8.7** `FormularioSolicitud` usa `CORREO_ATENCION` de `utils/contacto.js`.
  - **D8.8 y D8.9** Pestaña "{Nombre}, {especie} en adopción · PetConnect" y descripción `resumir(descripción, 150)` o
    "Datos de {nombre} y solicitud de adopción."; estados con su propio título y `noindex` en "no encontrada".
  Peores datos simulados cambiando `window.fetch` en la pestaña sobre `/api/mascotas/:id` (sin tocar BD ni archivos):
  nombre de 80 caracteres con y sin espacios, raza larga, `image: null`, foto rota, especie "Conejo", `null`, "perra" y
  "GATA" (ícono de perro, gato o huella), edad `null`, 0, 1 y 25, sexo "no_definido", ningún rasgo (sin recuadro),
  descripción vacía, `null`, con saltos y de 2.000 caracteres, 404 (con `noindex`), 503 con "Reintentar" (con Enter: el foco
  espera en el `<main>` y pasa al nombre al cargar) y cambio de una ficha a otra con el formulario abierto. Nada desborda a
  320 px. Formulario: sin sesión, "Inicia sesión para enviar", "Crear cuenta" y "Cerrar". Con sesión **simulada** (no había
  sesión de prueba: usuario inventado en `localStorage` y un token con "€" que el navegador no deja enviar, así nada llegó a
  la API) y `POST /api/solicitudes/adopcion` simulado: 201 (celebración, foco en "Solicitud enviada"), 401 y 403 ("Volver a
  iniciar sesión"), 500 y sin conexión; en todos el texto escrito se conserva y el foco va al aviso. Todo solo con teclado.
  Al final se borraron las dos claves (`localStorage` quedó vacío, como al empezar) y se recargó. "Reducir movimiento" no se
  puede emular en el navegador integrado ni con la herramienta de DevTools disponible: se comprobó que las reglas de la
  celebración solo existen dentro de `no-preference`. Arreglo que salió al probar:
  - A 320 px "Enviar solicitud" se partía en dos renglones al lado de "Cerrar"; ahora va en un renglón (`whitespace-nowrap`)
    y "Cerrar" baja.

  Notas para otras fases:
  - **Fase 10 (Contacto):** la página queda mezclada hasta su fase: el formulario ya está en tokens (botón turquesa) y el
    resto sigue en grises. `Contact.jsx` todavía tiene su propia copia de `CORREO_ATENCION` y su comentario nombra
    `FormularioSolicitud.jsx` como copia (ya no lo es).
  - **Fase 9 (cuenta):** `LoginModal.jsx` sigue con su copia del correo; al pasarlo a `<dialog>`, comprobar que al volver
    del inicio de sesión abierto desde "Inicia sesión para enviar" el foco regrese al formulario.
  - **Lógica (sin cambiar, decidir aparte):** tras enviar, "Cerrar" vuelve a mostrar "Solicitar adopción" y se podría
    mandar otra solicitud para la misma mascota. Cambiarlo es cambiar la lógica (y quizá la API, que es quien sabe si ya hay
    una solicitud).
  - **Contenido:** la descripción de las mascotas del *seed* (por ejemplo, "Vacunada, esterilizada y desparasitada") sale tal
    cual de la BD; ya está marcada con `# REVISAR-VETERINARIO` en `seed.py`.
  - **`datosMascota`** (`utils/mascota.js`) ya no lo usa ninguna página (solo sus pruebas); decidir en la Fase 12 si se borra.

### Fase 9 — Cuenta (inicio de sesión y registro) · rama `rediseno-front-fase-9-cuenta` · 🔴
- [x] 9.1 `LoginModal` y `RegisterModal` como `<dialog>` (#1), campos de 16 px con borde visible (#14, #15), `autoComplete` (#16), etiqueta del código (#9), spinner `motion-safe` (#43)
- [x] 9.2 `CasillaAutorizacion` con tokens **sin tocar el texto legal**
- *Listo cuando:* el registro completo se hace con teclado y lector de pantalla, y el código se autocompleta en el celular.
- *Hecha el 16/11/2026, pendiente de tu aprobación.* Se hizo en cuatro partes, con lint, build y pruebas después de cada
  una. Revisada en el navegador integrado a 320, 375 y 1280 px. Lint con 0 errores y **0 avisos** (ya no sale el de
  `AuthContext`); el build y las 149 pruebas pasan (`tests/cuenta-dialogo.test.js` es nueva, con 7 pruebas, y
  `tests/cerrar-sesion.test.js` se ajustó a `useCallback`/`useMemo` sin dejar de vigilar lo mismo). En los archivos de
  cuenta no hay ningún hex, `gray-*`, `black`, `white`, `red-*`, `green-*` ni `amber-*`. `impeccable detect`: 0 hallazgos en
  los archivos; en `/adopcion/3`, solo el fondo crema (dirección A aprobada). Contraste medido en la página: texto
  ≥ 5,26:1, ayudas y textos de ejemplo 6,21:1, borde de los campos 3,80:1 y foco 6,16:1. Decisiones aprobadas:
  - **D9.1** `src/components/DialogoCuenta.jsx`, compartido por los dos modales: `showModal()`, salida animada, Escape
    (`cancel`), clic en el fondo solo si empezó y terminó fuera, título con `aria-labelledby` y foco al cerrar. Al pasar de
    Iniciar sesión a Crear cuenta (o al revés), el que se va se cierra sin animación antes de que el otro abra; nunca hay
    dos abiertos. Al entrar con éxito también se cierra al instante: el contenido ya cambió por debajo y una salida
    animada mostraría el paso equivocado. La limpieza de cada paso va en el evento `close`, que llega siempre.
  - **D9.2** Entrada `scale(0.96)` + opacidad en 200 ms y salida en 150 ms, fondo de tinta al 45 %; con "reducir
    movimiento", solo un fundido de 150 ms. Se borraron `scaleIn`, `backdrop-fade`, `modal-enter` y `btn-hover`.
  - **D9.3** El foco va al primer campo de cada paso (en Autorización, al título). Al cerrar vuelve a quien abrió; si ese
    botón ya no se ve, al respaldo que indica con `data-foco-respaldo`: "Salir" (Header en escritorio), "Menú" (menú del
    celular) o el título del formulario (ficha de adopción). **Cambio de comportamiento:** al cerrar, Iniciar sesión
    conserva el correo y olvida la contraseña; Crear cuenta conserva nombre y correo y olvida las contraseñas y la
    casilla (antes la X borraba todo el registro).
  - **D9.4–D9.6** Campos de 16 px con borde `borde-fuerte`, `autoComplete`, código con etiqueta "Código de verificación",
    `one-time-code` y teclado numérico; "Iniciar sesión" y "Crear cuenta" con minúscula; "…" en vez de "..."; botón X
    "Cerrar inicio de sesión" / "Cerrar registro"; botón principal turquesa con `presionable`; avisos de error con
    `role="alert"` en todos los pasos.
  - **D9.7** La casilla usa `CORREO_ATENCION` (el texto que se ve es idéntico; se comprobó B.1, B.2 y B.3 letra por
    letra en la página). `contacto.js` avisa que ese correo es parte del texto legal B.2.
  - **D9.8** `useAuth` vive en `src/context/useAuth.js` y el valor del contexto está memorizado; cambió el import en
    App, Header, FormularioSolicitud, LoginModal y RegisterModal.

  Cómo se probó, sin crear cuentas ni iniciar sesión de verdad: se cambió `window.fetch` en la pestaña **solo** para
  `/api/auth/*`, `/api/utils/validar-correo` y `/api/solicitudes/*`, con datos inventados (`@ejemplo.test`). La
  contraseña la generó la página al azar y nunca se mostró; la espera del reenvío se adelantó cambiando `Date.now` en la
  pestaña. Casos: inicio correcto, código incorrecto y correcto; 403 de autorización con la casilla sin marcar (no llama
  a la API y el foco va a la casilla) y marcada; 401, 429, 500 y sin conexión; registro con nombre de 80 caracteres y
  correo de 80 sin espacios; dominio válido, inválido y "no se pudo verificar"; contraseña que falla cada regla por
  separado; código, reenvío bloqueado, reenvío correcto con su espera, 429 al reenviar y "Cambiar correo"; y, en la ficha
  de adopción, "Inicia sesión para enviar" y "Volver a iniciar sesión" tras un 401 de la solicitud. Todo solo con
  teclado: Tab nunca sale del diálogo y Escape cierra con el foco en su sitio. A 320 px nada desborda y el registro y la
  autorización se desplazan dentro del diálogo, con el título fijo. Al final se devolvió `fetch` y el reloj, se recargó
  y `localStorage` quedó vacío, como al empezar. "Reducir movimiento" no se puede emular en el navegador integrado: se
  comprobó que las reglas cargadas solo dejan el fundido.

  Notas para otras fases:
  - **Pendientes que no se hicieron (cambian la lógica o los textos):** "Registrarse" queda desactivado hasta que todo es
    válido y con teclado no explica por qué; el texto de ejemplo "Ej: MiPerro@2025" sugiere una contraseña concreta; en
    la lista de reglas, el lector de pantalla oye el texto de cada regla pero no si se cumple (solo lo dicen el ícono y el
    color); no existen "Mostrar contraseña" ni "Olvidé mi contraseña".
  - **Fase 12:** `CartModal` puede pasar al mismo `DialogoCuenta` (o a un diálogo común) si se quiere un solo patrón; su
    salida es distinta (panel lateral), así que no se tocó.
  - **Captura del navegador integrado:** con el panel oculto, las capturas salen recortadas o con el diálogo
    desvanecido aunque la opacidad calculada sea 1. Las medidas se hicieron con `getBoundingClientRect`.

### Fase 10 — Contacto · rama `rediseno-front-fase-10-contacto` · 🟢
- [x] 10.1 Contact con tokens; revisar contigo si el horario de atención es real
- *Hecha el 17/11/2026, pendiente de tu aprobación.* Revisada en el navegador integrado a 320, 375 y 1280 px. Lint 0 errores
  y 0 avisos, build y 149 pruebas pasan. Ningún hex, `gray-*`, `black`, `white`, `red-*`, `green-*` ni `amber-*` en
  `Contact.jsx` ni en `contacto.js`. `impeccable detect`: 0 en el archivo; en `/contacto` (1280 y 375 px), solo el fondo
  crema (dirección A aprobada). `FormularioSolicitud.jsx` no se tocó. Decisiones aprobadas:
  - **D10.1 Horario:** se quitó, sin reemplazo. Nadie confirmó un horario real (mismo criterio que el teléfono del pie, D3).
    Si algún día existe, va como constante en `utils/contacto.js`.
  - **D10.2 Ubicación:** `CIUDAD` tal cual ("Armenia, Quindío"), igual que el pie; sin "Colombia".
  - **D10.3 Estructura:** alineada a la izquierda, `h1` en `font-display` (30 → 36 px). Primero la información de contacto
    (el correo sirve sin cuenta) y luego el formulario; dos columnas (5/12 y 7/12) desde 1024 px, mismo orden visual y de
    lectura. Títulos: h1 → h2 "Información de contacto" → h2 "Formulario de contacto" (`sr-only`, solo lector de pantalla)
    → h3 del formulario. Sin tarjeta gris: lista `<dl>` con el ícono en un círculo `marca-claro`. El correo es un enlace
    `marca` de 44 px de alto que se parte antes de la @ (`<wbr>` + `wrap-anywhere`, como el pie).
  - **D10.4** Pestaña "Contacto · PetConnect" y la descripción de §3.6.
  - **D10.5 Textos:** la introducción nombra primero el correo ("…Escríbenos a nuestro correo de atención o con el
    formulario."); se quitó el horario; nuevo h2 oculto "Formulario de contacto". Lo demás quedó igual.
  - **D10.6** `Contact.jsx` ya no tiene copia del correo ni de la ciudad (salen de `utils/contacto.js`) y `contacto.js`
    actualizó su comentario de quién los usa.
  Cómo se probó, sin enviar mensajes ni iniciar sesión de verdad: se cambió `window.fetch` en la pestaña **solo** para
  `/api/auth/*` y `/api/solicitudes/contacto`, con una cuenta inventada (`@ejemplo.test`), una contraseña generada al azar
  por la página (nunca se mostró) y un token con "€" (el navegador no deja mandarlo). Casos: sin sesión ("Inicia sesión
  para enviar" y "Crear cuenta"); Escape en el inicio de sesión (el foco vuelve al botón); al entrar, el foco va al título
  "Escríbenos" (`contacto-titulo`); envío 201 ("Mensaje enviado" con número, foco en ese título), 500, sin conexión, 403 y
  401 (aviso enfocado, el mensaje se conserva, "Volver a iniciar sesión" en 401 y 403; tras el 401, volver a entrar deja
  el foco en el título con el mensaje intacto). Todo solo con teclado y con foco visible, también en el enlace del correo.
  Nada desborda a 320 px (sin sesión, escribiendo y enviado). Al final se borraron las dos claves (`localStorage` vacío,
  como al empezar) y se recargó con el `fetch` original.

  Notas para otras fases:
  - **Fase 11 (Política):** `PoliticaDatos.jsx` es la única copia que queda del correo (`CORREO_DATOS`); pasarlo a
    `CORREO_ATENCION`. El domicilio ("Armenia, Quindío, Colombia" y "Cra. 6 # 17 Norte 01") es texto legal: se queda
    escrito allá, no se cambia por `CIUDAD`. Conviene confirmar que esa dirección es real. La app móvil tiene su propia
    copia del correo (fuera del rediseño).
  - **Pendientes que no se hicieron (funciones nuevas):** botón para copiar el correo, mapa y redes sociales. No hacen
    falta hoy.

### Fase 11 — Política de datos · rama `rediseno-front-fase-11-politica` · 🟢
- [ ] 11.1 Solo tokens y tipografía; **el texto legal no se cambia**

### Fase 12 — Pulido final · rama `rediseno-front-fase-12-pulido` · 🟡
- [ ] 12.1 Textos en mayúscula de oración en todo el sitio (#38)
- [ ] 12.2 `/impeccable audit` completo (meta: ≥ 17/20) y revisión a 375 y 1280 px de todas las páginas
- [ ] 12.3 Pendientes de la auditoría de la Fase 1: el menú móvil cierra con Escape; un solo nombre para cerrar sesión ("Salir" en escritorio y "Cerrar sesión" en celular)

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
