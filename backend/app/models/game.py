class PokerGame:
    """Lógica del juego con reglas CORRECTAS - VERSION PROTEGIDA"""
    
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
        
        print("🎮 JUEGO INICIADO - Estado de face_down_cards:")
        for pile in piles_order:
            print(f"   {pile}: {len(self.face_down_cards[pile])} cartas")
        
        return self.get_game_state()
    
    def flip_card_from_pile(self, pile):
        """
        Voltear carta de un montón específico
        
        ⚠️ ÚNICA función que puede modificar face_down_cards
        """
        if not self.face_down_cards[pile]:
            print(f"❌ FLIP: No hay cartas en {pile}")
            return None
        
        count_before = len(self.face_down_cards[pile])
        
        self.current_card = self.face_down_cards[pile].pop(0)
        self.current_card_source = pile
        
        count_after = len(self.face_down_cards[pile])
        
        print(f"🔄 FLIP: {self.current_card} desde {pile}")
        print(f"   ANTES: {count_before} cartas → DESPUÉS: {count_after} cartas")
        
        return self.current_card
    
    def _has_face_down_cards(self):
        """Verificar si quedan cartas boca abajo en CUALQUIER montón"""
        return any(len(cards) > 0 for cards in self.face_down_cards.values())
    
    def _is_complete(self):
        """Verificar si todos los montones tienen 4 cartas boca arriba"""
        return all(len(pile) == 4 for pile in self.piles.values())
    
    def _get_next_flip_pile(self):
        """
        ✨ NUEVA FUNCIÓN: Determinar desde qué pila voltear siguiente carta
        
        Regla: Si current_card_source tiene cartas, voltear desde ahí.
               Si no, buscar la primera pila con cartas desde K hasta A.
        """
        # Si ya hay una carta actual, no hay siguiente flip
        if self.current_card:
            return None
        
        # Si hay una fuente previa y tiene cartas, voltear desde ahí
        if self.current_card_source and len(self.face_down_cards[self.current_card_source]) > 0:
            return self.current_card_source
        
        # Buscar la primera pila con cartas desde K hasta A
        piles_order = ['K', 'Q', 'J', '0', '9', '8', '7', '6', '5', '4', '3', '2', 'A']
        for pile in piles_order:
            if len(self.face_down_cards[pile]) > 0:
                return pile
        
        return None
    
    def place_card(self, target_pile):
        """
        Colocar carta en un montón
        
        ⚠️⚠️⚠️ CRÍTICO: NO MODIFICAR face_down_cards AQUÍ ⚠️⚠️⚠️
        """
        if not self.current_card:
            return {'success': False, 'message': 'No hay carta'}
        
        if self.status in ['won', 'lost']:
            return {'success': False, 'message': '🔒 El juego ya terminó'}
        
        card_value = self.current_card[0]
        
        if card_value != target_pile:
            return {'success': False, 'message': f'❌ {self.current_card} debe ir en {card_value}, no en {target_pile}'}
        
        print(f"\n📍 PLACE: Colocando {self.current_card} en {target_pile} (origen: {self.current_card_source})")
        
        # REGLA DE PÉRDIDA
        if len(self.piles[target_pile]) == 3 and self.current_card_source == target_pile:
            would_complete_all = all(
                (len(self.piles[p]) + (1 if p == target_pile else 0)) == 4
                for p in self.piles
            ) and not self._has_face_down_cards()

            self.piles[target_pile].append(self.current_card)
            self.moves.append({'card': self.current_card, 'pile': target_pile})
            
            # IMPORTANTE: Actualizar current_card_source ANTES de limpiar
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
                # IMPORTANTE: Actualizar current_card_source ANTES de limpiar
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
            # IMPORTANTE: Actualizar current_card_source ANTES de limpiar
            self.current_card_source = target_pile
            self.current_card = None
            self.status = 'won'
            return {
                'success': True, 
                'message': '🎉 ¡GANASTE!', 
                'game_over': True, 
                'won': True
            }
        
        # ✨ CRÍTICO: Actualizar current_card_source a donde se colocó
        self.current_card_source = target_pile
        self.current_card = None
        
        print(f"   ✅ Carta colocada. Siguiente flip desde: {self.current_card_source}")
        
        return {
            'success': True,
            'kings_revealed': self.kings_revealed,
            'next_flip_pile': self._get_next_flip_pile()  # ✨ NUEVO
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
            'next_flip_pile': self._get_next_flip_pile()  # ✨ NUEVO
        }
        
        return state