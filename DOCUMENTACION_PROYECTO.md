# 🎴 Póker Místico - Documentación Técnica Completa

## 📋 Índice
1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Arquitectura General](#arquitectura-general)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Backend - API REST](#backend-api-rest)
6. [Algoritmo de Barajeo](#algoritmo-de-barajeo)
7. [Frontend - Interfaz de Usuario](#frontend-interfaz-de-usuario)
8. [Flujo de Juego Completo](#flujo-de-juego-completo)
9. [Componentes Principales](#componentes-principales)
10. [Sistema de Sonidos](#sistema-de-sonidos)
11. [Animaciones](#animaciones)
12. [API Endpoints](#api-endpoints)
13. [Modelo de Datos](#modelo-de-datos)
14. [Reglas del Juego](#reglas-del-juego)
15. [Instalación y Configuración](#instalación-y-configuración)
16. [Guía de Uso](#guía-de-uso)

---

## Resumen del Proyecto

**Nombre**: Póker Místico  
**Tipo**: Juego de cartas web con predicciones místicas  
**Propósito**: Aplicación interactiva que combina un juego de cartas solitario con un sistema de adivinación donde los jugadores pueden hacer preguntas al destino y recibir respuestas basadas en el resultado del juego.

### Características Principales
- Juego de cartas solitario con 13 pilas (A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K)
- Sistema de barajeo determinista (Riffle Shuffle)
- Modo de juego manual y automático
- Animaciones fluidas con Framer Motion
- Sistema de sonidos para acciones del juego
- Modal de predicción mística con respuesta al finalizar
- Interfaz visual moderna y atractiva

---

## Arquitectura General

### Patrón Arquitectónico
- **Frontend**: React SPA (Single Page Application)
- **Backend**: API REST con Flask
- **Comunicación**: HTTP/JSON mediante Axios
- **Algoritmo**: Riffle Shuffle Determinista (simulación de barajeo humano)

### Diagrama de Arquitectura
```
┌─────────────────────────────────────────────────┐
│           NAVEGADOR (Cliente)                    │
│  ┌──────────────────────────────────────────┐   │
│  │  React App (Frontend)                     │   │
│  │  - Componentes UI (React)                 │   │
│  │  - Animaciones (Framer Motion)            │   │
│  │  - Gestión de Estado (Hooks)              │   │
│  │  - Sistema de Sonidos                     │   │
│  │  - Servicios API (Axios)                  │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
              │
              │ HTTP/JSON (Axios)
              ▼
┌─────────────────────────────────────────────────┐
│           SERVIDOR (Backend)                     │
│  ┌──────────────────────────────────────────┐   │
│  │  Flask API                                │   │
│  │  - Endpoints REST                         │   │
│  │  - Lógica del Juego (PokerGame)          │   │
│  │  - Algoritmo Riffle Shuffle               │   │
│  │  - Gestión de Estado del Juego            │   │
│  │  - Almacenamiento en Memoria              │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Tecnologías Utilizadas

### Frontend
- **React 19.2.3**: Biblioteca de UI
- **Framer Motion 12.26.2**: Animaciones fluidas
- **Axios 1.13.2**: Cliente HTTP para comunicación con API
- **React Icons 4.10.1**: Iconografía
- **CSS3**: Estilos personalizados

### Backend
- **Python 3.12**: Lenguaje de programación
- **Flask**: Framework web ligero
- **Flask-CORS**: Manejo de CORS para desarrollo
- **python-dotenv**: Gestión de variables de entorno

---

## Estructura del Proyecto

```
ExamenAnalisis/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Inicialización de Flask app
│   │   ├── models/
│   │   │   ├── deck.py          # Clase DeckShuffle (barajeo)
│   │   │   └── game.py          # Clase PokerGame (lógica del juego)
│   │   ├── routes/
│   │   │   └── game_routes.py   # Endpoints de la API
│   │   ├── services/            # (Vacío - disponible para servicios)
│   │   └── utils/               # (Vacío - disponible para utilidades)
│   ├── config/
│   │   └── config.py            # Configuración de la aplicación
│   ├── tests/
│   │   ├── test_game_rules.py   # Tests de reglas del juego
│   │   └── test_final_move.py   # Tests de movimiento final
│   └── run.py                   # Punto de entrada del servidor
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Componente principal
│   │   ├── components/
│   │   │   ├── Cards/
│   │   │   │   └── Card.jsx     # Componente de carta individual
│   │   │   ├── Game/
│   │   │   │   ├── GameBoard.jsx # Tablero de juego
│   │   │   │   └── Pile.jsx      # Componente de pila/montón
│   │   │   └── UI/
│   │   │       ├── Sidebar.jsx           # Barra lateral de controles
│   │   │       ├── Alert.jsx             # Alertas temporales
│   │   │       ├── ShuffleAnimation.jsx  # Animación de barajeo
│   │   │       ├── FlipCardAnimation.jsx # Animación de volteo
│   │   │       ├── DealAnimation.jsx     # Animación de reparto
│   │   │       ├── QuestionModal.jsx     # Modal para pregunta mística
│   │   │       └── PredictionResultModal.jsx # Modal de resultado
│   │   ├── hooks/
│   │   │   └── useCardSounds.js # Hook para sonidos
│   │   ├── services/
│   │   │   └── api.js           # Cliente API (Axios)
│   │   └── styles/
│   │       └── colors.css       # Variables CSS de colores
│   └── public/
│       ├── cards/               # Imágenes de cartas
│       └── sounds/              # Archivos de audio
│
└── DOCUMENTACION_PROYECTO.md    # Este archivo
```

---

## Backend - API REST

### Inicialización
La aplicación Flask se inicializa en `app/__init__.py` con:
- Configuración de CORS para permitir peticiones desde el frontend
- Registro de blueprints para rutas de juego
- Endpoints de salud (`/` y `/health`)

### Almacenamiento de Estado
- Los juegos se almacenan en memoria en un diccionario `active_games`
- Cada juego tiene un `game_id` único
- El estado se mantiene durante la sesión del servidor

---

## Algoritmo de Barajeo

### Riffle Shuffle Determinista

El proyecto utiliza un **Riffle Shuffle Determinista** que simula cómo un humano baraja cartas manualmente, pero de forma completamente determinista y reproducible.

#### Características
- **100% Determinista**: No usa números aleatorios, solo funciones matemáticas
- **Reproducible**: Mismos inputs producen mismos resultados
- **Variación entre juegos**: Usa `initial_seed` basado en hash MD5 del `game_id`

#### Proceso de Barajeo

1. **Corte del Mazo**
   - El mazo se divide en dos mitades en el `cut_point` (1-51)
   - Mitad superior: `deck[:cut_point]`
   - Mitad inferior: `deck[cut_point:]`

2. **Entrelazado (Riffle)**
   - Se toman cartas alternadamente de ambas mitades
   - La decisión de qué montón tomar se calcula determinísticamente usando:
     - Posición actual en el mazo resultante
     - Tamaño de cada mitad
     - Progreso de uso de cada mitad
     - `cut_point`
     - `shuffle_count`
     - `initial_seed` (hash del game_id)

3. **Función Determinista**
   ```python
   seed_base = (position * 7) + (cut_point * 13) + (shuffle_count * 31)
   seed_base += (initial_seed * 97)
   determinism = (seed_base % 1000) / 1000.0
   ```

#### Ventajas
- **Consistencia**: Cada juego con mismo ID produce mismo resultado
- **Variación**: Diferentes game_ids producen diferentes barajeados
- **Realismo**: Simula el comportamiento humano de barajear
- **Reproducibilidad**: Permite debug y testing determinístico

---

## Frontend - Interfaz de Usuario

### Gestión de Estado
El componente principal `App.jsx` maneja todo el estado del juego:

**Estados Principales:**
- `gameState`: Estado completo del juego (pilas, cartas, estado)
- `gameId`: Identificador único del juego
- `shuffleCount`: Número de barajeados realizados
- `isLoading`: Indicador de carga
- `currentCard`: Carta actualmente visible
- `unlockedPile`: Pila desbloqueada para voltear
- `isAutoPlaying`: Modo automático activo
- `userMessage`: Pregunta mística del usuario
- `prediction`: Resultado de la predicción

### Modos de Juego

#### Modo Manual
- Usuario controla cada acción
- Debe barajear manualmente
- Debe voltear y colocar cartas manualmente
- Control total sobre el ritmo del juego

#### Modo Automático
- El sistema barajea automáticamente (1-10 veces)
- El juego se juega automáticamente después del inicio
- Lógica inteligente para seleccionar movimientos
- Visualización de cada movimiento con delays

---

## Flujo de Juego Completo

### 1. Inicialización
1. Usuario carga la aplicación
2. Se crea un nuevo juego con `game_id` único
3. Se genera un mazo ordenado (AH, 2H, 3H... KS)
4. Estado inicial: `waiting`

### 2. Barajeo
1. Usuario hace clic en "Barajear"
2. Se muestra animación interactiva de barajeo
3. Usuario puede elegir punto de corte (1-51)
4. Se ejecuta algoritmo Riffle Shuffle
5. `shuffle_count` se incrementa
6. Estado: `waiting` (después de barajear)

### 3. Inicio del Juego
1. Usuario hace clic en "Iniciar"
2. Se muestra modal para pregunta mística (opcional)
3. Usuario puede escribir pregunta o saltar
4. Se reparten 4 cartas boca abajo a cada una de las 13 pilas
5. Estado: `playing`
6. Pila K se desbloquea inicialmente

### 4. Juego Activo
1. **Voltear Carta**:
   - Usuario hace clic en una pila desbloqueada
   - Se voltea la carta superior boca abajo
   - Se muestra animación de volteo
   - La carta se convierte en `current_card`

2. **Colocar Carta**:
   - Usuario hace clic en la pila correspondiente al valor de la carta
   - Se coloca la carta boca arriba en la pila
   - Se desbloquea únicamente la pila donde se colocó
   - Se verifica condición de victoria/derrota

3. **Regla Especial**:
   - Si se completa una pila (4 cartas) con una carta de su propio montón Y no es el movimiento final → **PIERDES**
   - Si se completa una pila con carta de su propio montón PERO es el último movimiento que completa todo → **GANAS**

### 5. Fin del Juego
- **Victoria**: Todas las pilas tienen 4 cartas boca arriba y no quedan cartas boca abajo
- **Derrota**: Se completa una pila desde su propio montón (sin ser el movimiento final)

### 6. Predicción Mística
- Si el usuario hizo una pregunta al inicio
- Se muestra modal fullscreen con resultado
- Mensaje positivo si ganó, negativo si perdió
- Animaciones místicas acordes al resultado

---

## Componentes Principales

### App.jsx
Componente raíz que orquesta todo el juego:
- Gestión de estado global
- Comunicación con API
- Control de animaciones
- Modo automático

### GameBoard.jsx
Tablero de juego principal:
- Renderiza las 13 pilas en layout específico
- Maneja clicks en cartas
- Gestiona bloqueo/desbloqueo de pilas
- Muestra carta actual flotante

### Pile.jsx
Componente de pila individual:
- Muestra cartas boca arriba apiladas
- Muestra contador de cartas boca abajo
- Maneja clicks para voltear

### Sidebar.jsx
Panel lateral de controles:
- Botones de acción (Nuevo Juego, Barajear, Iniciar)
- Selector de modo (Manual/Auto)
- Estadísticas (Reyes, Restantes, Movimientos, Barajeos)
- Estado del juego

### ShuffleAnimation.jsx
Animación completa de barajeo:
- **Fase 1 - Fan Spread**: Muestra abanico inicial
- **Fase 2 - Closing**: Cierra el mazo
- **Fase 3 - Cutting**: Muestra corte en dos mitades
- **Fase 4 - Shuffling**: Animación de entrelazado
- **Fase 5 - Final Fan**: Muestra resultado final

### QuestionModal.jsx
Modal para pregunta mística:
- Interfaz visual con bola de cristal animada
- Validación (mínimo 10 caracteres)
- Opción de saltar pregunta

### PredictionResultModal.jsx
Modal de resultado final:
- Animaciones según resultado (victoria/derrota)
- Muestra pregunta original
- Mensaje del destino
- Efectos visuales místicos

---

## Sistema de Sonidos

### Hook: useCardSounds
Hook personalizado que maneja tres tipos de sonidos:

1. **Shuffle Sound** (`shuffle.mp3`)
   - Se reproduce durante la animación de barajeo
   - Volumen: 0.6

2. **Flip Sound** (`flip.mp3`)
   - Se reproduce al voltear una carta
   - Volumen: 0.5

3. **Place Sound** (`place.mp3`)
   - Se reproduce al colocar una carta
   - Volumen: 0.5

### Implementación
- Los sonidos se precargan al montar el componente
- Se reproducen con `currentTime = 0` para reinicio
- Manejo de errores silencioso para compatibilidad

---

## Animaciones

### Framer Motion
Todas las animaciones utilizan Framer Motion para transiciones suaves:

**Tipos de Animaciones:**
1. **Transiciones de Estado**: Aparecer/desaparecer componentes
2. **Animaciones de Cartas**: Volteo, movimiento, apilamiento
3. **Animaciones de Barajeo**: Fases complejas con múltiples transiciones
4. **Efectos de Hover**: Interactividad visual
5. **Partículas y Efectos**: Modal de predicción, efectos místicos

**Características:**
- Transiciones suaves con `ease` functions
- Delays escalonados para efectos cascada
- Animaciones infinitas para efectos continuos
- Preservación de layout durante animaciones

---

## API Endpoints

### POST `/api/game/new`
Crea un nuevo juego.

**Request:**
```json
{
  "game_id": "game-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "game_id": "game-1234567890",
  "message": "Juego creado exitosamente",
  "game_state": { ... }
}
```

### POST `/api/game/shuffle`
Barajea el mazo.

**Request:**
```json
{
  "game_id": "game-1234567890",
  "cut_point": 26
}
```

**Response:**
```json
{
  "success": true,
  "shuffle_count": 1,
  "message": "Mazo barajeado en posición 26",
  "deck_before": [...],
  "deck_after": [...],
  "cut_point": 26
}
```

### POST `/api/game/start`
Inicia el juego y reparte cartas.

**Request:**
```json
{
  "game_id": "game-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "game_state": { ... },
  "message": "Juego iniciado exitosamente"
}
```

### POST `/api/game/flip-card`
Voltea una carta de una pila.

**Request:**
```json
{
  "game_id": "game-1234567890",
  "pile": "K"
}
```

**Response:**
```json
{
  "success": true,
  "card": "KS",
  "pile": "K",
  "game_state": { ... }
}
```

### POST `/api/game/place-card`
Coloca la carta actual en una pila.

**Request:**
```json
{
  "game_id": "game-1234567890",
  "pile": "K"
}
```

**Response:**
```json
{
  "success": true,
  "game_over": false,
  "won": null,
  "kings_revealed": 1,
  "game_state": { ... }
}
```

O si termina el juego:
```json
{
  "success": true,
  "game_over": true,
  "won": true,
  "message": "🎉 ¡GANASTE!",
  "game_state": { ... }
}
```

### GET `/api/game/state?game_id=...`
Obtiene el estado actual del juego.

**Response:**
```json
{
  "success": true,
  "game_state": {
    "status": "playing",
    "current_card": "KS",
    "piles": { ... },
    "face_down_cards": { ... },
    "kings_revealed": 2,
    "cards_remaining": 0,
    "moves_count": 45,
    "shuffle_count": 3
  }
}
```

---

## Modelo de Datos

### GameState
Estado completo del juego:

```typescript
{
  status: 'waiting' | 'playing' | 'won' | 'lost',
  current_card: string | null,  // Ej: "KS", "AH"
  current_card_source: string | null,  // Pila de origen
  piles: {
    'A': string[],     // Cartas boca arriba
    '2': string[],
    ...
    'K': string[]
  },
  face_down_cards: {
    'A': number,       // Cantidad de cartas boca abajo
    '2': number,
    ...
    'K': number
  },
  kings_revealed: number,      // Contador de reyes
  cards_remaining: number,     // Cartas en el mazo
  moves_count: number,         // Total de movimientos
  shuffle_count: number        // Número de barajeados
}
```

### Card Format
Las cartas se representan como strings de 2 caracteres:
- **Formato**: `{valor}{palo}`
- **Valores**: A, 2, 3, 4, 5, 6, 7, 8, 9, 0 (10), J, Q, K
- **Palos**: H (Hearts), D (Diamonds), C (Clubs), S (Spades)
- **Ejemplos**: "AH", "KS", "0D", "JC"

---

## Reglas del Juego

### Objetivo
Completar todas las 13 pilas con 4 cartas boca arriba cada una, sin cartas boca abajo restantes.

### Setup
- Se reparten 4 cartas boca abajo en cada una de las 13 pilas (A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K)
- Total: 52 cartas (4 × 13 = 52)

### Reglas de Juego

1. **Voltear Carta**
   - Solo se puede voltear de una pila desbloqueada
   - Inicialmente, solo la pila K está desbloqueada
   - Después de colocar una carta, solo esa pila se desbloquea

2. **Colocar Carta**
   - La carta actual debe colocarse en la pila correspondiente a su valor
   - Ej: Un Rey (K) debe ir en la pila K, un As (A) en la pila A
   - Las cartas se apilan boca arriba en orden

3. **Victoria**
   - Todas las pilas tienen exactamente 4 cartas boca arriba
   - No quedan cartas boca abajo en ninguna pila
   - La última carta colocada puede ser de cualquier origen

4. **Derrota**
   - Se completa una pila (4 cartas) usando una carta que proviene de esa misma pila
   - **EXCEPCIÓN**: Si esa carta completa TODO el juego (todas las pilas terminan perfectas), es victoria

5. **Reyes Especiales**
   - Los reyes se cuentan cuando se colocan
   - Revelar el 4º rey no causa derrota automática si proviene de otra pila
   - Solo importa si se completa la pila K con una carta de su propio montón

### Estrategia
- Planificar movimientos para evitar completar pilas desde su propio montón
- Priorizar cartas de pilas con más cartas boca abajo
- Usar el conteo de reyes para tomar decisiones

---

## Instalación y Configuración

### Requisitos Previos
- Python 3.12+
- Node.js 16+
- npm o yarn

### Backend

1. **Navegar al directorio backend:**
   ```bash
   cd backend
   ```

2. **Crear entorno virtual:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Linux/Mac
   # o
   venv\Scripts\activate  # Windows
   ```

3. **Instalar dependencias:**
   ```bash
   pip install flask flask-cors python-dotenv
   ```

4. **Ejecutar servidor:**
   ```bash
   python run.py
   ```
   El servidor se ejecutará en `http://localhost:5000`

### Frontend

1. **Navegar al directorio frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm start
   ```
   La aplicación se abrirá en `http://localhost:3000`

### Configuración

**Backend (`config/config.py`):**
```python
SECRET_KEY = 'dev-secret-key-poker'
DEBUG = True
HOST = '0.0.0.0'
PORT = 5000
```

**Frontend (`src/services/api.js`):**
```javascript
const API_URL = 'http://localhost:5000/api/game';
```

---

## Guía de Uso

### Iniciar una Partida

1. **Abrir la aplicación** en el navegador
2. **Barajear las cartas**:
   - Click en "Ir a barajeo" (modo manual)
   - O configurar barajeados automáticos (modo auto)
3. **Hacer pregunta mística** (opcional):
   - Escribir pregunta al destino
   - Mínimo 10 caracteres
   - Puedes saltar esta opción
4. **Iniciar el juego**:
   - Click en "Iniciar"
   - Las cartas se reparten automáticamente

### Jugar

**Modo Manual:**
1. Click en una pila desbloqueada para voltear carta
2. Click en la pila correspondiente al valor de la carta para colocarla
3. Continuar hasta completar todas las pilas o perder

**Modo Automático:**
1. Seleccionar modo "Auto" en el sidebar
2. Configurar número de barajeados (1-10)
3. El juego se jugará automáticamente después del inicio
4. Observar los movimientos en tiempo real

### Ganar/Perder

- **Victoria**: Modal de éxito con mensaje positivo del destino
- **Derrota**: Modal con mensaje del destino (si hiciste pregunta)

### Nuevo Juego

- Click en "Nuevo Juego" para reiniciar
- Se crea un nuevo `game_id`
- Estado se reinicia completamente

---

## Consideraciones Técnicas

### Almacenamiento en Memoria
- Los juegos se almacenan solo en memoria del servidor
- No hay persistencia entre reinicios
- Cada sesión del servidor mantiene sus propios juegos

### Determinismo
- El algoritmo de barajeo es completamente determinista
- Mismo `game_id` y misma secuencia de `cut_point` produce mismo resultado
- Útil para debugging y testing

### CORS
- Configurado para permitir peticiones desde cualquier origen
- En producción, debería restringirse a dominios específicos

### Rendimiento
- Las animaciones están optimizadas con Framer Motion
- Lazy loading de componentes pesados
- Sonidos precargados para respuesta inmediata

---

## Posibles Mejoras Futuras

- Persistencia de juegos en base de datos
- Sistema de rankings y estadísticas
- Más variaciones de reglas
- Modo multijugador
- Sistema de logros
- Temas visuales personalizables
- Más efectos de sonido y música
- Modo de práctica/tutorial

---

**Versión**: 1.0  
**Última actualización**: 2024
