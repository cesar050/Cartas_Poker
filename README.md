# Poker Mistico

Juego de cartas interactivo con sistema de predicciones misticas y algoritmo de barajeo Fisher-Yates.

## Descripcion

Poker Mistico es una aplicacion web que combina un juego de cartas unico con un sistema de adivinacion mistica. El jugador hace una pregunta al destino, baraja las cartas, y segun el resultado del juego, recibe una prediccion positiva o negativa.

## Tecnologias

### Backend
- Flask 3.x
- Flask-CORS
- Python 3.10+

### Frontend
- React 18.x
- Framer Motion
- Axios
- CSS3

## Instalacion y Ejecucion

### Requisitos Previos
- Python 3.10 o superior
- Node.js 16 o superior
- npm

### 1. Clonar el repositorio
```bash
git clone https://github.com/cesar050/Cartas_Poker.git
cd Cartas_Poker
```

### 2. Ejecutar Backend
```bash
cd backend
pip install flask flask-cors
python3 run.py
```

El servidor estara disponible en http://localhost:5000

### 3. Ejecutar Frontend

Abrir una nueva terminal:
```bash
cd frontend
npm install
npm start
```

La aplicacion estara disponible en http://localhost:3000

## Estructura del Proyecto
```
Cartas_Poker/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── deck.py
│   │   │   └── game.py
│   │   └── routes/
│   │       └── game_routes.py
│   └── run.py
│
└── frontend/
    ├── public/
    │   ├── cards/
    │   └── sounds/
    └── src/
        ├── components/
        ├── hooks/
        └── services/
```

## Documentacion

Para informacion detallada sobre el algoritmo Riffle Shuffle, arquitectura del sistema, API endpoints y flujo del juego, consultar:

[DOCUMENTACION_PROYECTO.md](DOCUMENTACION_PROYECTO.md)

