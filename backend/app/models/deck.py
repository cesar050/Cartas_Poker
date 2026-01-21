class DeckShuffle:
    """Mazo de cartas con barajeo Riffle Shuffle Determinista"""
    
    def __init__(self, initial_seed=None, start_ordered=True):
        self.suits = ['H', 'D', 'C', 'S']
        self.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K']
        self.deck = self._create_deck()
        self.shuffle_count = 0
        self.initial_seed = initial_seed
        
        if initial_seed is not None and not start_ordered:
            self._initial_shuffle(initial_seed)
    
    def _hash_seed(self, seed_string):
        """Generar un hash determinista de una cadena para usarlo como semilla"""
        import hashlib
        hash_obj = hashlib.md5(seed_string.encode())
        hash_hex = hash_obj.hexdigest()
        return int(hash_hex[:8], 16)
    
    def _initial_shuffle(self, seed):
        """
        Hacer un barajado inicial usando la semilla para variar el orden.
        Esto asegura que cada nuevo juego tenga un mazo diferente.
        """
        cut_point = ((seed % 50) + 1)
        top_half = self.deck[:cut_point].copy()
        bottom_half = self.deck[cut_point:].copy()
        
        shuffled = []
        left_index = 0
        right_index = 0
        
        while left_index < len(top_half) or right_index < len(bottom_half):
            current_position = len(shuffled)
            
            left_progress = left_index / len(top_half) if len(top_half) > 0 else 1.0
            right_progress = right_index / len(bottom_half) if len(bottom_half) > 0 else 1.0
            
            seed_value = (current_position * 7) + (cut_point * 13) + (seed * 31)
            determinism = (seed_value % 100) / 100.0
            
            if abs(left_progress - right_progress) < 0.1:
                take_from_left = determinism < 0.5
            else:
                take_from_left = left_progress < right_progress
            
            if take_from_left and left_index < len(top_half):
                shuffled.append(top_half[left_index])
                left_index += 1
            elif right_index < len(bottom_half):
                shuffled.append(bottom_half[right_index])
                right_index += 1
            elif left_index < len(top_half):
                shuffled.append(top_half[left_index])
                left_index += 1
        
        self.deck = shuffled
        
    def _create_deck(self):
        """Crear mazo ordenado de 52 cartas"""
        return [f"{value}{suit}" for suit in self.suits for value in self.values]
    
    def cut_and_shuffle(self, cut_point):
        """
        Cortar y barajear usando Riffle Shuffle Determinista.
        Simula cómo un humano baraja cartas dividiendo el mazo en dos y entrelazándolas.
        Sin usar random - 100% determinista basado en cut_point y shuffle_count.
        """
        if cut_point < 1 or cut_point > 51:
            cut_point = 26
        
        top_half = self.deck[:cut_point].copy()
        bottom_half = self.deck[cut_point:].copy()
        
        shuffled = []
        left_index = 0
        right_index = 0
        
        def should_take_from_left(position, left_size, right_size, left_used, right_used, cut_pt, shuffle_cnt):
            """Decide determinísticamente de qué montón tomar la siguiente carta"""
            if left_used >= left_size:
                return False
            if right_used >= right_size:
                return True
            
            left_progress = left_used / left_size if left_size > 0 else 1.0
            right_progress = right_used / right_size if right_size > 0 else 1.0
            
            seed_base = (position * 7) + (cut_pt * 13) + (shuffle_cnt * 31)
            if self.initial_seed is not None:
                seed_base += (self.initial_seed * 97)
                seed_base += ((self.initial_seed % 1000) * position)
            seed = seed_base
            determinism = (seed % 1000) / 1000.0
            
            progress_diff = abs(left_progress - right_progress)
            
            
            if progress_diff < 0.2:
                return determinism < 0.5
            else:
                base_preference = left_progress < right_progress
                
                change_threshold = 0.15 + (determinism * 0.2)
                
                if progress_diff < change_threshold:
                    if determinism < 0.5:
                        return not base_preference
                    else:
                        return base_preference
                else:
                    determinism_modifier = (determinism - 0.5) * 0.3
                    return (left_progress + determinism_modifier) < (right_progress - determinism_modifier)
        
        while left_index < len(top_half) or right_index < len(bottom_half):
            current_position = len(shuffled)
            
            take_from_left = should_take_from_left(
                current_position,
                len(top_half),
                len(bottom_half),
                left_index,
                right_index,
                cut_point,
                self.shuffle_count
            )
            
            if take_from_left and left_index < len(top_half):
                shuffled.append(top_half[left_index])
                left_index += 1
            elif right_index < len(bottom_half):
                shuffled.append(bottom_half[right_index])
                right_index += 1
            elif left_index < len(top_half):
                shuffled.append(top_half[left_index])
                left_index += 1
        
        self.deck = shuffled
        self.shuffle_count += 1
        
        return self.deck
    
    def get_shuffle_count(self):
        return self.shuffle_count
    
    def get_deck(self):
        return self.deck.copy()
