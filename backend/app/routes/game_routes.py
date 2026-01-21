from flask import Blueprint, request, jsonify
from app.models.deck import DeckShuffle
from app.models.game import PokerGame

bp = Blueprint('game', __name__)

active_games = {}

@bp.route('/new', methods=['POST'])
def create_game():
    """Crear un nuevo juego"""
    try:
        data = request.get_json()
        game_id = data.get('game_id', 'default')
        
        if game_id in active_games:
            print(f"🔄 Eliminando juego anterior: {game_id}")
            del active_games[game_id]
        
        import hashlib
        game_id_hash = int(hashlib.md5(game_id.encode()).hexdigest()[:8], 16)
        deck = DeckShuffle(initial_seed=game_id_hash, start_ordered=True)
        game = PokerGame(deck)
        
        active_games[game_id] = game
        
        deck_order = deck.get_deck()
        expected_start = ['AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '0H']
        is_ordered = deck_order[:10] == expected_start
        
        print(f"✨ Juego creado: {game_id}")
        print(f"   Mazo inicial ordenado: {is_ordered}")
        print(f"   Primeras 10 cartas: {deck_order[:10]}")
        print(f"   Shuffle count: {deck.get_shuffle_count()}")
        print(f"   Initial seed (hash): {game_id_hash}")
        print(f"   Total de cartas: {len(deck_order)}")
        
        return jsonify({
            'success': True,
            'game_id': game_id,
            'message': 'Juego creado exitosamente',
            'game_state': game.get_game_state()
        }), 201
        
    except Exception as e:
        print(f"❌ Error al crear juego: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/shuffle', methods=['POST'])
def shuffle_deck():
    """Barajear el mazo con punto de corte"""
    try:
        data = request.get_json()
        game_id = data.get('game_id', 'default')
        cut_point = data.get('cut_point')
        
        if game_id not in active_games:
            return jsonify({'success': False, 'error': 'Juego no encontrado'}), 404
        
        if not cut_point or cut_point < 1 or cut_point > 51:
            return jsonify({'success': False, 'error': 'cut_point debe ser 1-51'}), 400
        
        game = active_games[game_id]
        
        deck_before = game.deck.get_deck()
        
        game.deck.cut_and_shuffle(cut_point)
        
        deck_after = game.deck.get_deck()
        
        print(f"🔀 BARAJEO #{game.deck.get_shuffle_count()}")
        print(f"   Punto de corte: {cut_point}")
        print(f"   Initial seed: {game.deck.initial_seed}")
        print(f"   Deck antes (primeras 10): {deck_before[:10]}")
        print(f"   Deck después (primeras 10): {deck_after[:10]}")
        print(f"   ¿Son diferentes?: {deck_before != deck_after}")
        print(f"   Últimas 10 cartas después: {deck_after[-10:]}")
        
        return jsonify({
            'success': True, 
            'shuffle_count': game.deck.get_shuffle_count(),
            'message': f'Mazo barajeado en posición {cut_point}',
            'deck_before': deck_before,
            'deck_after': deck_after,
            'cut_point': cut_point
        }), 200
        
    except Exception as e:
        print(f"❌ Error al barajear: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/start', methods=['POST'])
def start_game():
    """Iniciar el juego - Repartir cartas"""
    try:
        data = request.get_json()
        game_id = data.get('game_id', 'default')
        
        if game_id not in active_games:
            return jsonify({'success': False, 'error': 'Juego no encontrado'}), 404
        
        game = active_games[game_id]
        
        if game.deck.get_shuffle_count() == 0:
            return jsonify({
                'success': False, 
                'error': 'Debes barajear las cartas primero'
            }), 400
        
        game_state = game.start_game()
        
        print(f"🚀 Juego iniciado: {game_id}")
        print(f"   Estado: {game.status}")
        print(f"   Cartas repartidas en cada montón: 4")
        
        return jsonify({
            'success': True,
            'game_state': game_state,
            'message': 'Juego iniciado exitosamente'
        }), 200
        
    except Exception as e:
        print(f"❌ Error al iniciar juego: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/flip-card', methods=['POST'])
def flip_card():
    """Voltear carta de un montón específico"""
    try:
        data = request.get_json()
        game_id = data.get('game_id', 'default')
        pile = data.get('pile')
        
        if game_id not in active_games:
            return jsonify({'success': False, 'error': 'Juego no encontrado'}), 404
        
        if not pile:
            return jsonify({'success': False, 'error': 'Debe especificar el montón'}), 400
        
        game = active_games[game_id]
        
        if game.status != 'playing':
            return jsonify({
                'success': False, 
                'error': f'El juego no está en curso (status: {game.status})'
            }), 400
        
        card = game.flip_card_from_pile(pile)
        
        if not card:
            return jsonify({
                'success': False, 
                'error': f'No hay cartas boca abajo en {pile}'
            }), 400
        
        print(f"🎴 Carta volteada: {card} desde montón {pile}")
        
        return jsonify({
            'success': True,
            'card': card,
            'pile': pile,
            'game_state': game.get_game_state()
        }), 200
        
    except Exception as e:
        print(f"❌ Error en flip_card: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/place-card', methods=['POST'])
def place_card():
    """Colocar carta actual en un montón"""
    try:
        data = request.get_json()
        game_id = data.get('game_id', 'default')
        pile = data.get('pile')
        
        if game_id not in active_games:
            return jsonify({'success': False, 'error': 'Juego no encontrado'}), 404
        
        if not pile:
            return jsonify({'success': False, 'error': 'Debe especificar el montón'}), 400
        
        game = active_games[game_id]
        
        if game.status not in ['playing']:
            return jsonify({
                'success': False, 
                'error': f'El juego no está en curso (status: {game.status})'
            }), 400
        
        if not game.current_card:
            return jsonify({
                'success': False, 
                'error': 'No hay carta actual para colocar'
            }), 400
        
        print(f"📍 Intentando colocar {game.current_card} en montón {pile}")
        
        result = game.place_card(pile)
        
        print(f"   Resultado: {result}")
        
        return jsonify({
            **result,
            'game_state': game.get_game_state()
        }), 200
        
    except Exception as e:
        print(f"❌ Error en place_card: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/state', methods=['GET'])
def get_game_state():
    """Obtener el estado actual del juego"""
    try:
        game_id = request.args.get('game_id', 'default')
        
        if game_id not in active_games:
            return jsonify({'success': False, 'error': 'Juego no encontrado'}), 404
        
        game = active_games[game_id]
        game_state = game.get_game_state()
        
        return jsonify({
            'success': True,
            'game_state': game_state
        }), 200
        
    except Exception as e:
        print(f"❌ Error al obtener estado: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/reset', methods=['POST'])
def reset_game():
    """Resetear un juego específico"""
    try:
        data = request.get_json()
        game_id = data.get('game_id', 'default')
        
        if game_id in active_games:
            del active_games[game_id]
        
        deck = DeckShuffle(initial_seed=None, start_ordered=True)
        game = PokerGame(deck)
        active_games[game_id] = game
        
        print(f"🔄 Juego reseteado: {game_id}")
        print(f"   Mazo inicial ordenado (primeras 10 cartas): {deck.get_deck()[:10]}")
        
        return jsonify({
            'success': True,
            'game_id': game_id,
            'message': 'Juego reseteado exitosamente'
        }), 200
        
    except Exception as e:
        print(f"❌ Error al resetear juego: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/debug', methods=['GET'])
def debug_info():
    """Información de debug sobre juegos activos"""
    try:
        game_id = request.args.get('game_id', 'default')
        
        if game_id not in active_games:
            return jsonify({
                'active_games': list(active_games.keys()),
                'message': f'Juego {game_id} no encontrado'
            }), 404
        
        game = active_games[game_id]
        
        debug_data = {
            'game_id': game_id,
            'status': game.status,
            'current_card': game.current_card,
            'kings_revealed': game.kings_revealed,
            'shuffle_count': game.deck.get_shuffle_count(),
            'cards_remaining': len(game.deck.deck),
            'moves_count': len(game.moves),
            'face_down_cards': {k: len(v) for k, v in game.face_down_cards.items()},
            'face_up_cards': {k: len(v) for k, v in game.piles.items()},
            'total_games_active': len(active_games)
        }
        
        return jsonify(debug_data), 200
        
    except Exception as e:
        print(f"❌ Error en debug: {str(e)}")
        return jsonify({'error': str(e)}), 500