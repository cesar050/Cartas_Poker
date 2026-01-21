from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    from app.routes import game_routes
    app.register_blueprint(game_routes.bp, url_prefix='/api/game')
    
    @app.route('/')
    def index():
        return {'message': 'Poker Místico API', 'status': 'running'}
    
    @app.route('/health')
    def health():
        return {'status': 'healthy'}
    
    return app