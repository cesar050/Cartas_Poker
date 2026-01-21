class PokerGame:
    """Lógica del juego con reglas CORRECTAS"""
    
    def __init__(self, deck_shuffle):
        self.deck = deck_shuffle
        self.piles = {v: [] for v in ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K']}
        self.face_down_cards = {v: [] for v in ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K']}
        self.current_card = None
        self.current_card_source = None
        self.kings_revealed = 0
        self.moves = []
        self.status = 'waiting'
        
    def start_game(self):
        """Iniciar juego - Repartir 4 cartas boca abajo a CADA montón"""
        self.status = 'playing'
        
        piles_order = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K']
        
        for pile in piles_order:
            for i in range(4):
                if self.deck.deck:
                    card = self.deck.deck.pop(0)
                    self.face_down_cards[pile].append(card)
        
        return self.get_game_state()
    
    def flip_card_from_pile(self, pile):
        """Voltear carta de un montón específico"""
        if self.face_down_cards[pile]:
            self.current_card = self.face_down_cards[pile].pop(0)
            self.current_card_source = pile
            return self.current_card
        return None
    
    def _has_face_down_cards(self):
        """Verificar si quedan cartas boca abajo en CUALQUIER montón"""
        return any(len(cards) > 0 for cards in self.face_down_cards.values())
    
    def _is_complete(self):
        """Verificar si todos los montones tienen 4 cartas boca arriba"""
        return all(len(pile) == 4 for pile in self.piles.values())
    
    def place_card(self, target_pile):
        """Colocar carta en un montón"""
        if not self.current_card:
            return {'success': False, 'message': 'No hay carta'}
        
        if self.status in ['won', 'lost']:
            return {'success': False, 'message': '🔒 El juego ya terminó'}
        
        card_value = self.current_card[0]
        
        if card_value != target_pile:
            return {'success': False, 'message': f'❌ {self.current_card} debe ir en {card_value}, no en {target_pile}'}
        
        if len(self.piles[target_pile]) == 3 and self.current_card_source == target_pile:
            would_complete_all = all(
                (len(self.piles[p]) + (1 if p == target_pile else 0)) == 4
                for p in self.piles
            ) and not self._has_face_down_cards()

            self.piles[target_pile].append(self.current_card)
            self.moves.append({'card': self.current_card, 'pile': target_pile})
            self.current_card = None
            self.current_card_source = None

            if would_complete_all:
                self.status = 'won'
                return {
                    'success': True,
                    'message': f'🎉 ¡GANASTE! Completaste todos los montones al colocar {target_pile}',
                    'game_over': True,
                    'won': True
                }

            self.status = 'lost'
            return {
                'success': True,
                'message': f'💀 ¡Perdiste! Completaste {target_pile} desde su propio montón',
                'game_over': True,
                'won': False
            }
        
        self.piles[target_pile].append(self.current_card)
        self.moves.append({'card': self.current_card, 'pile': target_pile})
        
        if card_value == 'K':
            self.kings_revealed += 1
        
        if self._is_complete() and not self._has_face_down_cards():
            self.current_card = None
            self.current_card_source = None
            self.status = 'won'
            return {
                'success': True, 
                'message': '🎉 ¡GANASTE! Completaste todos los montones perfectamente', 
                'game_over': True, 
                'won': True
            }
        
        self.current_card = None
        self.current_card_source = None
        
        return {
            'success': True,
            'kings_revealed': self.kings_revealed
        }
    
    def get_game_state(self):
        return {
            'status': self.status,
            'current_card': self.current_card,
            'current_card_source': self.current_card_source,
            'piles': self.piles,
            'face_down_cards': {k: len(v) for k, v in self.face_down_cards.items()},
            'kings_revealed': self.kings_revealed,
            'cards_remaining': len(self.deck.deck),
            'moves_count': len(self.moves),
            'shuffle_count': self.deck.get_shuffle_count()
        }