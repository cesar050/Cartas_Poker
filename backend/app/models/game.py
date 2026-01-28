class PokerGame:
    """Lógica del juego con AMBAS variantes de reglas"""
    
    def __init__(self, deck_shuffle, game_rules='original'):
        self.deck = deck_shuffle
        self.piles = {v: [] for v in ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K']}
        self.face_down_cards = {v: [] for v in ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K']}
        self.current_card = None
        self.current_card_source = None
        self.kings_revealed = 0
        self.moves = []
        self.status = 'waiting'
        self.game_rules = game_rules  # 'original' o 'alternative'
        
    def start_game(self):
        """Iniciar juego - Repartir 4 cartas boca abajo a CADA montón"""
        self.status = 'playing'
        
        piles_order = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K']
        
        for pile in piles_order:
            for i in range(4):
                if self.deck.deck:
                    card = self.deck.deck.pop(0)
                    self.face_down_cards[pile].append(card)
        
        print(f"🎮 JUEGO INICIADO - Reglas: {self.game_rules}")
        for pile in piles_order:
            print(f"   {pile}: {len(self.face_down_cards[pile])} cartas")
        
        return self.get_game_state()
    
    def flip_card_from_pile(self, pile):
        """Voltear carta de un montón específico"""
        if not self.face_down_cards[pile]:
            print(f"❌ FLIP: No hay cartas en {pile}")
            return None
        
        count_before = len(self.face_down_cards[pile])
        
        self.current_card = self.face_down_cards[pile].pop(0)
        self.current_card_source = pile
        
        count_after = len(self.face_down_cards[pile])
        
        print(f"🔄 FLIP: {self.current_card} desde {pile}")
        print(f"   ANTES: {count_before} → DESPUÉS: {count_after}")
        
        return self.current_card
    
    def _has_face_down_cards(self):
        """Verificar si quedan cartas boca abajo en CUALQUIER montón"""
        return any(len(cards) > 0 for cards in self.face_down_cards.values())
    
    def _is_complete(self):
        """Verificar si todos los montones tienen 4 cartas boca arriba"""
        return all(len(pile) == 4 for pile in self.piles.values())
    
    def _get_next_flip_pile(self):
        """Determinar desde qué pila voltear siguiente carta"""
        if self.current_card:
            return None
        
        if self.current_card_source and len(self.face_down_cards[self.current_card_source]) > 0:
            return self.current_card_source
        
        piles_order = ['K', 'Q', 'J', '0', '9', '8', '7', '6', '5', '4', '3', '2', 'A']
        for pile in piles_order:
            if len(self.face_down_cards[pile]) > 0:
                return pile
        
        return None
    
    def place_card(self, target_pile):
        """Colocar carta - Delega a la variante de reglas correspondiente"""
        if self.game_rules == 'original':
            return self._place_card_original(target_pile)
        else:
            return self._place_card_alternative(target_pile)
    
    def _place_card_original(self, target_pile):
        """
        REGLAS ORIGINALES (del video del docente) - CORREGIDAS:
        - Pierdes si completas una pila (4/4) desde su mismo montón Y no quedan cartas boca abajo en ESA pila
        - EXCEPCIÓN: Si ese movimiento completa TODO el juego (todas 4/4 + sin cartas boca abajo), GANAS
        """
        if not self.current_card:
            return {'success': False, 'message': 'No hay carta'}
        
        if self.status in ['won', 'lost']:
            return {'success': False, 'message': 'El juego ya terminó'}
        
        card_value = self.current_card[0]
        
        if card_value != target_pile:
            return {'success': False, 'message': f'❌ {self.current_card} debe ir en {card_value}'}
        
        print(f"\n📍 PLACE (ORIGINAL): {self.current_card} en {target_pile} (origen: {self.current_card_source})")
        
        # Colocar carta
        self.piles[target_pile].append(self.current_card)
        self.moves.append({'card': self.current_card, 'pile': target_pile})
        
        # ✨ VERIFICACIÓN: ¿Completó una pila desde su propio montón?
        if len(self.piles[target_pile]) == 4:
            if self.current_card_source == target_pile and len(self.face_down_cards[target_pile]) == 0:
                # Completó desde su propio montón Y no quedan cartas en esa pila
                
                # ✨ VERIFICAR: ¿Es el movimiento final que completa TODO?
                all_complete = all(len(self.piles[p]) == 4 for p in self.piles)
                no_face_down = not self._has_face_down_cards()
                
                self.current_card_source = target_pile
                self.current_card = None
                
                if all_complete and no_face_down:
                    # ✅ ES EL MOVIMIENTO FINAL → VICTORIA
                    self.status = 'won'
                    print(f"   ✅ VICTORIA: Todas las pilas completas y sin cartas boca abajo")
                    return {
                        'success': True,
                        'message': '🎉 ¡GANASTE! Completaste todas las pilas',
                        'game_over': True,
                        'won': True
                    }
                else:
                    # ❌ NO es movimiento final → DERROTA
                    self.status = 'lost'
                    print(f"   ❌ DERROTA: Completaste {target_pile} desde su montón (no es movimiento final)")
                    return {
                        'success': True,
                        'message': f'💀 ¡Perdiste! Completaste {target_pile} desde su propio montón',
                        'game_over': True,
                        'won': False
                    }
        
        # Lógica de reyes
        if card_value == 'K':
            self.kings_revealed += 1
            print(f"   👑 Rey #{self.kings_revealed} revelado")
            
            if self.kings_revealed == 4:
                self.current_card_source = target_pile
                self.current_card = None
                
                if self._has_face_down_cards():
                    self.status = 'lost'
                    return {
                        'success': True,
                        'message': '💀 ¡Perdiste! Salió el 4to Rey antes de completar todo',
                        'game_over': True,
                        'won': False
                    }
                else:
                    self.status = 'won'
                    return {
                        'success': True,
                        'message': '🎉 ¡GANASTE!',
                        'game_over': True,
                        'won': True
                    }
        
        # Verificar victoria (todas completas y sin cartas boca abajo)
        if self._is_complete() and not self._has_face_down_cards():
            self.current_card_source = target_pile
            self.current_card = None
            self.status = 'won'
            return {
                'success': True,
                'message': '🎉 ¡GANASTE!',
                'game_over': True,
                'won': True
            }
        
        self.current_card_source = target_pile
        self.current_card = None
        
        return {
            'success': True,
            'kings_revealed': self.kings_revealed,
            'next_flip_pile': self._get_next_flip_pile()
        }
    
    def _place_card_alternative(self, target_pile):
        """
        REGLAS ALTERNATIVAS (implementación anterior):
        - Pierdes si completas una pila desde su mismo montón 
        - EXCEPCIÓN: Si ese movimiento completa TODO el juego, ganas
        """
        if not self.current_card:
            return {'success': False, 'message': 'No hay carta'}
        
        if self.status in ['won', 'lost']:
            return {'success': False, 'message': 'El juego ya terminó'}
        
        card_value = self.current_card[0]
        
        if card_value != target_pile:
            return {'success': False, 'message': f'❌ {self.current_card} debe ir en {card_value}'}
        
        print(f"\n📍 PLACE (ALTERNATIVE): {self.current_card} en {target_pile} (origen: {self.current_card_source})")
        
        # REGLA DE PÉRDIDA (con excepción de victoria)
        if len(self.piles[target_pile]) == 3 and self.current_card_source == target_pile:
            would_complete_all = all(
                (len(self.piles[p]) + (1 if p == target_pile else 0)) == 4
                for p in self.piles
            ) and not self._has_face_down_cards()

            self.piles[target_pile].append(self.current_card)
            self.moves.append({'card': self.current_card, 'pile': target_pile})
            
            self.current_card_source = target_pile
            self.current_card = None

            if would_complete_all:
                self.status = 'won'
                return {
                    'success': True,
                    'message': f'🎉 ¡GANASTE!',
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
        
        # COLOCAR CARTA
        self.piles[target_pile].append(self.current_card)
        self.moves.append({'card': self.current_card, 'pile': target_pile})
        
        # Lógica de reyes
        if card_value == 'K':
            self.kings_revealed += 1
            print(f"   👑 Rey #{self.kings_revealed} revelado")
            
            if self.kings_revealed == 4:
                self.current_card_source = target_pile
                self.current_card = None
                
                if self._has_face_down_cards():
                    self.status = 'lost'
                    return {
                        'success': True,
                        'message': '💀 ¡Perdiste! Salió el 4to Rey antes de completar todo',
                        'game_over': True,
                        'won': False
                    }
                else:
                    self.status = 'won'
                    return {
                        'success': True,
                        'message': '🎉 ¡GANASTE!',
                        'game_over': True,
                        'won': True
                    }
        
        # Verificar victoria
        if self._is_complete() and not self._has_face_down_cards():
            self.current_card_source = target_pile
            self.current_card = None
            self.status = 'won'
            return {
                'success': True,
                'message': '🎉 ¡GANASTE!',
                'game_over': True,
                'won': True
            }
        
        self.current_card_source = target_pile
        self.current_card = None
        
        return {
            'success': True,
            'kings_revealed': self.kings_revealed,
            'next_flip_pile': self._get_next_flip_pile()
        }
    
    def get_game_state(self):
        """Obtener estado del juego"""
        piles_copy = {}
        for k, v in self.piles.items():
            piles_copy[k] = list(v)
        
        face_down_copy = {}
        for k, v in self.face_down_cards.items():
            face_down_copy[k] = len(v)
        
        state = {
            'status': self.status,
            'current_card': self.current_card,
            'current_card_source': self.current_card_source,
            'piles': piles_copy,
            'face_down_cards': face_down_copy,
            'kings_revealed': self.kings_revealed,
            'cards_remaining': len(self.deck.deck),
            'moves_count': len(self.moves),
            'shuffle_count': self.deck.get_shuffle_count(),
            'next_flip_pile': self._get_next_flip_pile(),
            'game_rules': self.game_rules
        }
        
        return state