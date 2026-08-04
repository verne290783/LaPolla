# PROMPT MAESTRO: LA POLLA MULTI-EVENT (EDICIÓN PREMIUM)

**Rol:** Eres un Desarrollador Full-Stack y Diseñador UI/UX de nivel Senior, experto en la creación de aplicaciones multiplataforma con un enfoque "Mobile-First" y "Fluid Responsive Design". Tienes un gusto estético impecable, especializado en interfaces premium modernas, "dark mode", glassmorphism y diseño centrado en el usuario.

**Objetivo:** Diseñar y desarrollar la estructura completa (UI/UX) y los componentes frontend para "La Polla Multi-Event", una plataforma premium de pronósticos deportivos. El sistema debe transmitir la sensación de un club exclusivo y de altas apuestas, altamente escalable para soportar múltiples eventos (ej. Fórmula 1, Champions League).

---

## 1. ESTÉTICA, OMNICANALIDAD Y RESPONSIVIDAD (CRÍTICO)
- **Plataforma Universal (Web & App Móvil):** El diseño debe funcionar perfectamente tanto como una Aplicación Móvil (App nativa/PWA) como un Portal Web de Escritorio.
- **Auto-Ajuste (Fluid Layout):** Todos los componentes deben autoajustarse dinámicamente a CUALQUIER tamaño de pantalla y orientación (smartphones, tablets, laptops, monitores ultra-anchos). Utiliza contenedores fluidos, CSS Grid y Flexbox avanzado para que la interfaz se reacomode sin perder elegancia estructural.
- **Estilo Visual:** Premium, elegante, moderno y tecnológico.
- **Paleta de Colores:** Preferencia estricta por el **Modo Oscuro (Dark Mode)**. Utiliza fondos profundos (negros/grises oscuros espaciales) con colores de acento de alto contraste (tonos neón) para elementos interactivos y llamadas a la acción (CTAs).
- **Efectos UI:** Emplea *glassmorphism* (fondos translúcidos con desenfoque de fondo/backdrop-filter) y gradientes suaves para tarjetas y modales.
- **Tipografía:** Usa una fuente sans-serif moderna, geométrica y sumamente legible (ej. Inter, Outfit o Roboto). Establece jerarquías visuales claras jugando únicamente con el tamaño y el grosor (font-weight).

---

## 2. NAVEGACIÓN Y TERMINOLOGÍA
- **i18n (Internacionalización):** Todo el sistema y los componentes deben estar diseñados para soportar dinámicamente 4 idiomas (Español, Italiano, Inglés, Portugués).
- **Terminología Estricta:** 
  - **PROHIBIDO** usar los términos legacy "Parte 1" o "Parte 2".
  - **NUEVA TERMINOLOGÍA:** Utilizar obligatoriamente **"Global"** (para pronósticos a largo plazo o de todo el torneo) y **"Live"** (para pronósticos inmediatos, carrera a carrera o partido a partido).
- **Arquitectura del Menú (Adaptativo según dispositivo):**
  - *Móvil:* Barra de navegación inferior flotante (Bottom Tab Bar).
  - *Escritorio:* Menú lateral expandible o barra superior (Sidebar/Top Navbar).
  1. Inicio (Selector de Evento / Hub)
  2. Pronósticos (Sub-navegación: Global / Live)
  3. Leaderboard (Sub-navegación: Grupos / General)
  4. Perfil (Estadísticas y Avatar)
  5. Reglas (Lógica de puntuación)

---

## 3. ESPECIFICACIÓN DE PANTALLAS CLAVE
Genera el código y el diseño estructurado para las siguientes pantallas, garantizando que cada vista se reestructure perfectamente desde 320px (móvil pequeño) hasta resoluciones 4K:

### Pantalla 1: Autenticación Premium e Inicio de Sesión
- **Diseño:** Pantalla de login extremadamente elegante con un fondo deportivo dinámico (desenfoque sutil o arte abstracto minimalista de alto contraste). El layout debe centrarse en escritorio y ocupar el ancho total con márgenes seguros en móvil.
- **Elementos Requeridos:**
  - **Selector de Idioma:** Limpio y visible desde la primera carga.
  - **Social Auth:** Botón destacado de "Continuar con Google".
  - **Email Auth:** Campos input de texto limpios (estilo floating label), sofisticados y minimalistas.
  - **Enlaces:** "Recuperar contraseña" discreto pero accesible.
- **Variante de Estado:** Pantalla de "Correo de confirmación enviado" que refuerce la sensación de seguridad y exclusividad.

### Pantalla 2: Hub de Eventos (Selector de Inicio)
- **Diseño:** Cuadrícula (Grid auto-ajustable en escritorio) o carrusel horizontal con *snap-scrolling* (en móvil) de tarjetas inmersivas.
- **Elementos Requeridos:**
  - **Evento Activo (Fórmula 1):** Tarjeta con ícono/logo genérico estilizado de un monoplaza. Estado destacado: badge brillante de "En juego".
  - **Evento Próximo (Champions League):** Tarjeta con ícono genérico de un balón estrellado o estadio. Estado: "Próximamente" (escala de grises, overlay difuminado o candado minimalista).

### Pantalla 3: Cuadrícula de Pronósticos (Enfoque F1)
- **Diseño:** Control segmentado (Segmented Control) en la parte superior: "Global" y "Live". El layout debe mostrar columnas múltiples en pantallas grandes y colapsar a una sola columna en pantallas pequeñas.
- **Elementos Requeridos:**
  - Espacios interactivos (slots/tarjetas vacías) para seleccionar los pronósticos de los pilotos.
  - Interfaz específica, visualmente jerarquizada, para el pronóstico de la "Pole Position".
  - **Feedback Temporal:** Indicador claro de bloqueo (temporizador elegante alertando cuándo se bloquearán las ediciones).

### Pantalla 4: Leaderboard Avanzado (Tabla de Posiciones)
- **Diseño:** Estructura de doble solapa (Tabs): *Grupos* y *General*. La tabla de datos debe usar un layout que no se rompa horizontalmente en móviles (ocultando columnas secundarias o usando un formato de tarjetas en listas).
- **Elementos Requeridos:**
  - Filas listando: Rank (Posición), Avatar, Nombre, Puntos Totales.
  - **Interacción:** Al hacer clic/tap sobre un usuario, se abre un panel lateral (Slide-over en escritorio, Bottom-sheet en móvil) detallando sus estadísticas globales y pronósticos públicos.

### Pantalla 5: Perfil del Jugador y Reglas
- **Diseño del Perfil:**
  - Área visual (Hero section) para el Avatar con interfaz moderna para subir foto.
  - Grid auto-ajustable de estadísticas del jugador (Puntos, Insignias, Win-rate).
- **Diseño de Reglas:**
  - Interfaz tipo acordeón (Accordion) o tarjetas para explicar la puntuación.
  - **Nota Explícita Requerida:** Aclarar textualmente: "El acierto de la Pole Position otorga los mismos puntos que gana el primer lugar en una Carrera Sprint".

---

## 4. REGLAS ESTRICTAS DE UI/UX PARA LA GENERACIÓN
1. **Flujo Universal y Breakpoints:** Nunca fijes anchos absolutos en píxeles (usa %, vw/vh, o rem). Emplea breakpoints modernos para que la transición entre móvil, tablet y escritorio se sienta nativa en todos los dispositivos.
2. **Zonas Táctiles (Ergonomía Móvil):** Asegúrate de que TODOS los botones, pestañas, modales y campos de pronósticos sean lo suficientemente grandes para interactuar cómodamente con el pulgar. El área interactiva mínima absoluta debe ser de **44x44px**.
3. **Estados Vacíos y Bloqueados (Empty/Locked States):** El estado de "Próximamente" y los pronósticos "Bloqueados" en el Leaderboard deben verse intencionales y diseñados elegantemente. NUNCA deben parecer componentes rotos o deshabilitados por error.
4. **Placeholders Legales (Anti-Copyright):** Genera íconos, siluetas y logos genéricos para F1 y Fútbol. Estos deben lucir sumamente profesionales y premium, pero evitando estrictamente infracciones directas de derechos de autor.

---

## 5. REQUERIMIENTOS ESPECIALES DEL ICONO Y MARCA
Usa el icono que adjunto, para que sea el icono y leyenda de la aplicacion. Cuando se entre a la seccion de la F1, debes añadir una segunda frase al slogan algo como Racing 1, o algo asi que no infrinja derechos de autor. Y cuando los usuarios entren a la predicción de la champions league que diga algo como the champions, ademas el iciono debe cambiar sutilemente, por ejemplo si se entra a las predicciones de la F1, debe la polla tener un casco, y a la de la champion un balon, y en el futuro si es tenis una raqueta, y asi con todos los deportes, adicionalemnte debe tomar los colores caracteristicos de cada evento, si es la formula 1 debe cmabiar todo a esos colores, si es la champions igual.
Quiero que crees una pagina de login, una vez logeado se escoja a que evneto se entrara, en donde aparezca el titulo del evento y el icono de la polla, vestida para ese evento.
Luego cuando se ingrse al evento los colores del background, letras, etc, cambviaran a los del evento. 

Esta aplicacion debe ser web, pero que se acople a cualquier tamaño de pantalla de forma dinamica, quiero que se piense para usar en celular laptop o tablet o PC. Tambien despues migrare a una VPS que yo creare y tambien la desplegare en app store y en google play. piensa en el futuro. recuerda que sea elgante y facil de navegar, super fancy.
Ya puedes desplegarla en supabase, vercel y github
