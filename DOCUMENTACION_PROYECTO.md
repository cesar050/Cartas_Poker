# Poker Mistico - Documentacion Tecnica Completa

## Indice
1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Arquitectura General](#arquitectura-general)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
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
15. [Instalacion y Configuracion](#instalacion-y-configuracion)
16. [Guia de Uso](#guia-de-uso)
17. [Cambios Recientes y Mejoras](#cambios-recientes-y-mejoras)

---

## Resumen del Proyecto

**Nombre**: Poker Mistico  
**Tipo**: Juego de cartas web con predicciones misticas  
**Proposito**: Aplicacion interactiva que combina un juego de cartas solitario con un sistema de adivinacion donde los jugadores pueden hacer preguntas al destino y recibir respuestas basadas en el resultado del juego.

### Caracteristicas Principales
- Juego de cartas solitario con 13 pilas (A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K)
- Sistema de barajeo determinista (Riffle Shuffle)
- Modo de juego manual y automatico
- Animaciones fluidas con Framer Motion
- Sistema de sonidos para acciones del juego
- Modal de prediccion mistica con respuesta al finalizar
- Interfaz visual moderna y atractiva
- Control de flujo inteligente backend-driven

---

## Arquitectura General

### Patron Arquitectonico
- **Frontend**: React SPA (Single Page Application)
- **Backend**: API REST con Flask
- **Comunicacion**: HTTP/JSON mediante Axios
- **Algoritmo**: Riffle Shuffle Determinista (simulacion de barajeo humano)
- **Control de Flujo**: Backend determina el siguiente movimiento valido

### Diagrama de Arquitectura
```
┌─────────────────────────────────────────────────┐
│           NAVEGADOR (Cliente)                    │
│  ┌──────────────────────────────────────────┐   │
│  │  React App (Frontend)                     │   │
│  │  - Componentes UI (React)                 │   │
│  │  - Animaciones (Framer Motion)            │   │
│  │  - Gestion de Estado (Hooks)              │   │
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
│  │  - Logica del Juego (PokerGame)          │   │
│  │  - Algoritmo Riffle Shuffle               │   │
│  │  - Control de Flujo Inteligente          │   │
│  │  - Gestion de Estado del Juego            │   │
│  │  - Almacenamiento en Memoria              │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Tecnologias Utilizadas

### Frontend
- **React 19.2.3**: Biblioteca de UI
- **Framer Motion 12.26.2**: Animaciones fluidas
- **Axios 1.13.2**: Cliente HTTP para comunicacion con API
- **React Icons 4.10.1**: Iconografia
- **CSS3**: Estilos personalizados

### Backend
- **Python 3.12**: Lenguaje de programacion
- **Flask**: Framework web ligero
- **Flask-CORS**: Manejo de CORS para desarrollo
- **python-dotenv**: Gestion de variables de entorno

---

## Estructura del Proyecto

```
ExamenAnalisis/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Inicializacion de Flask app
│   │   ├── models/
│   │   │   ├── deck.py          # Clase DeckShuffle (barajeo)
│   │   │   └── game.py          # Clase PokerGame (logica del juego)
│   │   ├── routes/
│   │   │   └── game_routes.py   # Endpoints de la API
│   │   ├── services/            # (Vacio - disponible para servicios)
│   │   └── utils/               # (Vacio - disponible para utilidades)
│   ├── config/
│   │   └── config.py            # Configuracion de la aplicacion
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
│   │   │   │   └── Pile.jsx      # Componente de pila/monton
│   │   │   └── UI/
│   │   │       ├── Sidebar.jsx           # Barra lateral de controles
│   │   │       ├── Alert.jsx             # Alertas temporales
│   │   │       ├── ShuffleAnimation.jsx  # Animacion de barajeo
│   │   │       ├── FlipCardAnimation.jsx # Animacion de volteo
│   │   │       ├── DealAnimation.jsx     # Animacion de reparto
│   │   │       ├── QuestionModal.jsx     # Modal para pregunta mistica
│   │   │       └── PredictionResultModal.jsx # Modal de resultado
│   │   ├── hooks/
│   │   │   └── useCardSounds.js # Hook para sonidos
│   │   ├── services/
│   │   │   └── api.js           # Cliente API (Axios)
│   │   └── styles/
│   │       └── colors.css       # Variables CSS de colores
│   └── public/
│       ├── cards/               # Imagenes de cartas
│       └── sounds/              # Archivos de audio
│
├── DOCUMENTACION_PROYECTO.md    # Este archivo
└── RIFFLE_SHUFFLE_DOCUMENTATION.md  # Documentacion del algoritmo
```

---

## Backend - API REST

### Inicializacion
La aplicacion Flask se inicializa en `app/__init__.py` con:
- Configuracion de CORS para permitir peticiones desde el frontend
- Registro de blueprints para rutas de juego
- Endpoints de salud (`/` y `/health`)

### Almacenamiento de Estado
- Los juegos se almacenan en memoria en un diccionario `active_games`
- Cada juego tiene un `game_id` unico
- El estado se mantiene durante la sesion del servidor

### Nueva Logica de Control de Flujo (Mejora Critica)

El backend ahora incluye una funcion `_get_next_flip_pile()` que determina inteligentemente desde que pila se debe voltear la siguiente carta:

```python
def _get_next_flip_pile(self):
    """
    Determinar desde que pila voltear siguiente carta
    
    Regla: Si current_card_source tiene cartas, voltear desde ahi.
           Si no, buscar la primera pila con cartas desde K hasta A.
    """
    # Si ya hay una carta actual, no hay siguiente flip
    if self.current_card:
        return None
    
    # Si hay una fuente previa y tiene cartas, voltear desde ahi
    if self.current_card_source and len(self.face_down_cards[self.current_card_source]) > 0:
        return self.current_card_source
    
    # Buscar la primera pila con cartas desde K hasta A
    piles_order = ['K', 'Q', 'J', '0', '9', '8', '7', '6', '5', '4', '3', '2', 'A']
    for pile in piles_order:
        if len(self.face_down_cards[pile]) > 0:
            return pile
    
    return None
```

**Ventajas de esta Arquitectura:**
1. **Eliminacion de Race Conditions**: El frontend no necesita rastrear estado complejo
2. **Single Source of Truth**: El backend es la unica fuente de verdad
3. **Simplificacion Frontend**: Modo automatico 70% mas simple
4. **Consistencia Garantizada**: No hay posibilidad de desincronizacion
5. **Mantenibilidad**: Cambios en reglas solo requieren modificar backend

### Actualizacion de current_card_source

Cambio critico en `place_card()`:

```python
# ANTES (Incorrecto):
self.current_card = None
self.current_card_source = None

# DESPUES (Correcto):
self.current_card_source = target_pile  # Actualizar ANTES de limpiar
self.current_card = None
```

Esto asegura que `_get_next_flip_pile()` siempre tenga la informacion correcta de donde se coloco la ultima carta.

---

## Algoritmo de Barajeo

### Riffle Shuffle Determinista

El proyecto utiliza un **Riffle Shuffle Determinista** que simula como un humano baraja cartas manualmente, pero de forma completamente determinista y reproducible.

Para documentacion detallada del algoritmo, consultar: `RIFFLE_SHUFFLE_DOCUMENTATION.md`

#### Caracteristicas
- **100% Determinista**: No usa numeros aleatorios, solo funciones matematicas
- **Reproducible**: Mismos inputs producen mismos resultados
- **Variacion entre juegos**: Usa `initial_seed` basado en hash MD5 del `game_id`

#### Proceso de Barajeo

1. **Corte del Mazo**
   - El mazo se divide en dos mitades en el `cut_point` (1-51)
   - Mitad superior: `deck[:cut_point]`
   - Mitad inferior: `deck[cut_point:]`

2. **Entrelazado (Riffle)**
   - Se toman cartas alternadamente de ambas mitades
   - La decision de que monton tomar se calcula deterministicamente usando:
     - Posicion actual en el mazo resultante
     - Tamano de cada mitad
     - Progreso de uso de cada mitad
     - `cut_point`
     - `shuffle_count`
     - `initial_seed` (hash del game_id)

3. **Funcion Determinista**
   ```python
   seed_base = (position * 7) + (cut_point * 13) + (shuffle_count * 31)
   seed_base += (initial_seed * 97)
   determinism = (seed_base % 1000) / 1000.0
   ```

#### Ventajas
- **Consistencia**: Cada juego con mismo ID produce mismo resultado
- **Variacion**: Diferentes game_ids producen diferentes barajeados
- **Realismo**: Simula el comportamiento humano de barajear
- **Reproducibilidad**: Permite debug y testing deterministico

---

## Frontend - Interfaz de Usuario

### Gestion de Estado
El componente principal `App.jsx` maneja todo el estado del juego:

**Estados Principales:**
- `gameState`: Estado completo del juego (pilas, cartas, estado)
- `gameId`: Identificador unico del juego
- `shuffleCount`: Numero de barajeados realizados
- `isLoading`: Indicador de carga
- `currentCard`: Carta actualmente visible
- `unlockedPile`: Pila desbloqueada para voltear (ahora controlado por backend)
- `isAutoPlaying`: Modo automatico activo
- `userMessage`: Pregunta mistica del usuario
- `prediction`: Resultado de la prediccion

### Modo Automatico - Nueva Implementacion

La logica del modo automatico fue completamente reescrita para ser mas simple y robusta:

**Antes (Complejo):**
- Frontend rastreaba `unlockedPile` manualmente
- Calculaba cual pila voltear siguiente
- Multiple fetchs de estado
- Race conditions frecuentes
- Codigo de 200+ lineas

**Despues (Simple):**
```javascript
const executeAutoMove = useCallback(async () => {
  try {
    const currentState = await fetchGameState(true);
    
    if (!currentState || currentState.status !== 'playing') {
      autoPlayActiveRef.current = false;
      setIsAutoPlaying(false);
      return false;
    }

    if (currentState.current_card) {
      // Colocar carta
      const cardValue = currentState.current_card[0];
      await new Promise(resolve => setTimeout(resolve, 800));
      await handlePlaceCard(cardValue);
      await new Promise(resolve => setTimeout(resolve, 600));
      return true;
    } 
    
    // Voltear carta
    const nextPile = currentState.next_flip_pile;
    
    if (!nextPile) {
      autoPlayActiveRef.current = false;
      setIsAutoPlaying(false);
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    await handleFlipCard(nextPile);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return true;

  } catch (error) {
    console.error('Error:', error);
    autoPlayActiveRef.current = false;
    setIsAutoPlaying(false);
    return false;
  }
}, [fetchGameState, handleFlipCard, handlePlaceCard]);
```

**Ventajas:**
- Codigo reducido en 70%
- Sin race conditions
- Backend decide todo el flujo
- Facil de mantener y debuggear
- Sin necesidad de validaciones complejas

### Modos de Juego

#### Modo Manual
- Usuario controla cada accion
- Debe barajear manualmente
- Debe voltear y colocar cartas manualmente
- Control total sobre el ritmo del juego

#### Modo Automatico
- El sistema barajea automaticamente (1-10 veces)
- El juego se juega automaticamente despues del inicio
- Backend determina cada movimiento
- Visualizacion de cada movimiento con delays

---

## Flujo de Juego Completo

### 1. Inicializacion
1. Usuario carga la aplicacion
2. Se crea un nuevo juego con `game_id` unico
3. Se genera un mazo ordenado (AH, 2H, 3H... KS)
4. Estado inicial: `waiting`

### 2. Barajeo
1. Usuario hace clic en "Barajear"
2. Se muestra animacion interactiva de barajeo
3. Usuario puede elegir punto de corte (1-51)
4. Se ejecuta algoritmo Riffle Shuffle
5. `shuffle_count` se incrementa
6. Estado: `waiting` (despues de barajear)

### 3. Inicio del Juego
1. Usuario hace clic en "Iniciar"
2. Se muestra modal para pregunta mistica (opcional)
3. Usuario puede escribir pregunta o saltar
4. Se reparten 4 cartas boca abajo a cada una de las 13 pilas
5. Estado: `playing`
6. Backend calcula `next_flip_pile` (inicialmente K)

### 4. Juego Activo

**Flujo Mejorado:**

1. **Backend determina siguiente accion**:
   - Si `current_card` existe → colocar
   - Si no → voltear desde `next_flip_pile`

2. **Voltear Carta**:
   - Frontend consulta `next_flip_pile` del backend
   - Usuario hace clic en pila desbloqueada (o automatico)
   - Se voltea la carta superior boca abajo
   - Se muestra animacion de volteo
   - La carta se convierte en `current_card`

3. **Colocar Carta**:
   - Usuario hace clic en pila correspondiente (o automatico)
   - Backend valida y coloca la carta
   - Backend actualiza `current_card_source = target_pile`
   - Backend calcula nuevo `next_flip_pile`
   - Se verifica condicion de victoria/derrota

4. **Regla Especial**:
   - Si se completa una pila (4 cartas) con una carta de su propio monton Y no es el movimiento final → **PIERDES**
   - Si se completa una pila con carta de su propio monton PERO es el ultimo movimiento que completa todo → **GANAS**

### 5. Fin del Juego
- **Victoria**: Todas las pilas tienen 4 cartas boca arriba y no quedan cartas boca abajo
- **Derrota**: Se completa una pila desde su propio monton (sin ser el movimiento final)

### 6. Prediccion Mistica
- Si el usuario hizo una pregunta al inicio
- Se muestra modal fullscreen con resultado
- Mensaje positivo si gano, negativo si perdio
- Animaciones misticas acordes al resultado

---

## Componentes Principales

### App.jsx
Componente raiz que orquesta todo el juego:
- Gestion de estado global
- Comunicacion con API
- Control de animaciones
- Modo automatico simplificado

### GameBoard.jsx
Tablero de juego principal:
- Renderiza las 13 pilas en layout especifico
- Maneja clicks en cartas
- Gestiona bloqueo/desbloqueo de pilas basado en `next_flip_pile`
- Muestra carta actual flotante

### Pile.jsx
Componente de pila individual:
- Muestra cartas boca arriba apiladas
- Muestra contador de cartas boca abajo
- Maneja clicks para voltear

### Sidebar.jsx
Panel lateral de controles:
- Botones de accion (Nuevo Juego, Barajear, Iniciar)
- Selector de modo (Manual/Auto)
- Estadisticas (Reyes, Restantes, Movimientos, Barajeos)
- Estado del juego

### ShuffleAnimation.jsx
Animacion completa de barajeo:
- **Fase 1 - Fan Spread**: Muestra abanico inicial
- **Fase 2 - Closing**: Cierra el mazo
- **Fase 3 - Cutting**: Muestra corte en dos mitades
- **Fase 4 - Shuffling**: Animacion de entrelazado
- **Fase 5 - Final Fan**: Muestra resultado final

### QuestionModal.jsx
Modal para pregunta mistica:
- Interfaz visual con bola de cristal animada
- Validacion (minimo 10 caracteres)
- Opcion de saltar pregunta

### PredictionResultModal.jsx
Modal de resultado final:
- Animaciones segun resultado (victoria/derrota)
- Muestra pregunta original
- Mensaje del destino
- Efectos visuales misticos

---

## Sistema de Sonidos

### Hook: useCardSounds
Hook personalizado que maneja tres tipos de sonidos:

1. **Shuffle Sound** (`shuffle.mp3`)
   - Se reproduce durante la animacion de barajeo
   - Volumen: 0.6

2. **Flip Sound** (`flip.mp3`)
   - Se reproduce al voltear una carta
   - Volumen: 0.5

3. **Place Sound** (`place.mp3`)
   - Se reproduce al colocar una carta
   - Volumen: 0.5

### Implementacion
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
3. **Animaciones de Barajeo**: Fases complejas con multiples transiciones
4. **Efectos de Hover**: Interactividad visual
5. **Particulas y Efectos**: Modal de prediccion, efectos misticos

**Caracteristicas:**
- Transiciones suaves con `ease` functions
- Delays escalonados para efectos cascada
- Animaciones infinitas para efectos continuos
- Preservacion de layout durante animaciones

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
  "game_state": {
    "status": "waiting",
    "next_flip_pile": null,
    ...
  }
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
  "message": "Mazo barajeado en posicion 26",
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
  "game_state": {
    "status": "playing",
    "next_flip_pile": "K",
    ...
  },
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
  "game_state": {
    "current_card": "KS",
    "next_flip_pile": null,
    ...
  }
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
  "next_flip_pile": "K",
  "game_state": {
    "current_card": null,
    "next_flip_pile": "K",
    ...
  }
}
```

O si termina el juego:
```json
{
  "success": true,
  "game_over": true,
  "won": true,
  "message": "GANASTE!",
  "game_state": {...}
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
    "current_card_source": "K",
    "next_flip_pile": null,
    "piles": {...},
    "face_down_cards": {...},
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
  next_flip_pile: string | null,  // NUEVO: Pila desde donde voltear siguiente
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
  shuffle_count: number        // Numero de barajeados
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
   - Solo se puede voltear de la pila indicada por `next_flip_pile`
   - Inicialmente, `next_flip_pile` es K
   - Despues de colocar una carta, `next_flip_pile` apunta a esa pila

2. **Colocar Carta**
   - La carta actual debe colocarse en la pila correspondiente a su valor
   - Ej: Un Rey (K) debe ir en la pila K, un As (A) en la pila A
   - Las cartas se apilan boca arriba en orden

3. **Victoria**
   - Todas las pilas tienen exactamente 4 cartas boca arriba
   - No quedan cartas boca abajo en ninguna pila
   - La ultima carta colocada puede ser de cualquier origen

4. **Derrota**
   - Se completa una pila (4 cartas) usando una carta que proviene de esa misma pila
   - **EXCEPCION**: Si esa carta completa TODO el juego (todas las pilas terminan perfectas), es victoria

5. **Reyes Especiales**
   - Los reyes se cuentan cuando se colocan
   - Revelar el 4º rey no causa derrota automatica si proviene de otra pila
   - Solo importa si se completa la pila K con una carta de su propio monton

### Estrategia
- Planificar movimientos para evitar completar pilas desde su propio monton
- Priorizar cartas de pilas con mas cartas boca abajo
- Usar el conteo de reyes para tomar decisiones

---

## Instalacion y Configuracion

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
   El servidor se ejecutara en `http://localhost:5000`

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
   La aplicacion se abrira en `http://localhost:3000`

### Configuracion

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

## Guia de Uso

### Iniciar una Partida

1. **Abrir la aplicacion** en el navegador
2. **Barajear las cartas**:
   - Click en "Ir a barajeo" (modo manual)
   - O configurar barajeados automaticos (modo auto)
3. **Hacer pregunta mistica** (opcional):
   - Escribir pregunta al destino
   - Minimo 10 caracteres
   - Puedes saltar esta opcion
4. **Iniciar el juego**:
   - Click en "Iniciar"
   - Las cartas se reparten automaticamente

### Jugar

**Modo Manual:**
1. Click en pila indicada por candado verde para voltear carta
2. Click en la pila correspondiente al valor de la carta para colocarla
3. Continuar hasta completar todas las pilas o perder

**Modo Automatico:**
1. Seleccionar modo "Auto" en el sidebar
2. Configurar numero de barajeados (1-10)
3. El juego se jugara automaticamente despues del inicio
4. Observar los movimientos en tiempo real

### Ganar/Perder

- **Victoria**: Modal de exito con mensaje positivo del destino
- **Derrota**: Modal con mensaje del destino (si hiciste pregunta)

### Nuevo Juego

- Click en "Nuevo Juego" para reiniciar
- Se crea un nuevo `game_id`
- Estado se reinicia completamente

---

## Cambios Recientes y Mejoras

### Version 2.0 - Control de Flujo Backend-Driven

#### Problemas Resueltos
1. **Race Conditions en Modo Automatico**
   - Frontend intentaba calcular siguiente pila
   - Multiples llamadas concurrentes
   - Estado desincronizado entre frontend/backend

2. **Bug de face_down_cards**
   - K decrementaba incorrectamente al colocar cartas en otras pilas
   - Causaba que el juego accediera a pilas vacias
   - Comportamiento impredecible

3. **Complejidad del Modo Automatico**
   - Logica duplicada entre frontend/backend
   - Dificil de mantener y debuggear
   - Codigo de mas de 200 lineas

#### Soluciones Implementadas

**1. Nueva Funcion `_get_next_flip_pile()` en Backend**
```python
def _get_next_flip_pile(self):
    if self.current_card:
        return None
    
    if self.current_card_source and len(self.face_down_cards[self.current_card_source]) > 0:
        return self.current_card_source
    
    piles_order = ['K', 'Q', 'J', '0', '9', '8', '7', '6', '5', '4', '3', '2', 'A']
    for pile in piles_order:
        if len(self.face_down_cards[pile]) > 0:
            return pile
    
    return None
```

**2. Actualizacion de current_card_source ANTES de Limpiar**
```python
# En place_card(), ANTES:
self.current_card = None
self.current_card_source = None

# DESPUES:
self.current_card_source = target_pile  # Actualizar primero
self.current_card = None
```

**3. Simplificacion del Modo Automatico**
```javascript
// Antes: 200+ lineas con logica compleja
// Despues: 50 lineas, 100% confianza en backend

const executeAutoMove = async () => {
  const state = await fetchGameState(true);
  
  if (state.current_card) {
    await handlePlaceCard(state.current_card[0]);
  } else {
    await handleFlipCard(state.next_flip_pile);
  }
};
```

#### Resultados
- Eliminacion completa de race conditions
- Codigo frontend 70% mas simple
- Backend como unica fuente de verdad
- Facil de mantener y extender
- Sin bugs de sincronizacion

### Mejoras de Arquitectura

**Single Source of Truth:**
- Backend controla toda la logica del juego
- Frontend solo visualiza y envia comandos
- No hay duplicacion de logica

**Separacion de Responsabilidades:**
- Backend: Logica de negocio
- Frontend: Interfaz y experiencia de usuario
- API: Contrato claro entre ambos

**Mantenibilidad:**
- Cambios en reglas solo requieren modificar backend
- Frontend es mas simple y predecible
- Tests mas faciles de escribir

---

## Consideraciones Tecnicas

### Almacenamiento en Memoria
- Los juegos se almacenan solo en memoria del servidor
- No hay persistencia entre reinicios
- Cada sesion del servidor mantiene sus propios juegos

### Determinismo
- El algoritmo de barajeo es completamente deterministico
- Mismo `game_id` y misma secuencia de `cut_point` produce mismo resultado
- Util para debugging y testing

### CORS
- Configurado para permitir peticiones desde cualquier origen
- En produccion, deberia restringirse a dominios especificos

### Rendimiento
- Las animaciones estan optimizadas con Framer Motion
- Lazy loading de componentes pesados
- Sonidos precargados para respuesta inmediata
- Backend procesa validaciones en O(1)

---

## Posibles Mejoras Futuras

### Funcionalidad
- Persistencia de juegos en base de datos
- Sistema de rankings y estadisticas
- Mas variaciones de reglas
- Modo multijugador
- Sistema de logros
- Modo de practica/tutorial

### Tecnicas
- WebSockets para tiempo real
- Progressive Web App (PWA)
- Soporte offline
- Tests automatizados completos
- CI/CD pipeline

### UI/UX
- Temas visuales personalizables
- Mas efectos de sonido y musica
- Animaciones adicionales
- Accesibilidad mejorada
- Responsive design completo

---

**Version**: 2.0  
**Ultima actualizacion**: 25 de Enero de 2026  
**Autores**: Cesar y equipo de desarrollo