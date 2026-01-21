from app.models.deck import DeckShuffle
from app.models.game import PokerGame


def make_dummy_card(value, idx=0):
    return f"{value}C"


def test_final_move_from_same_pile_counts_as_win():
    deck = DeckShuffle()
    game = PokerGame(deck)
    game.status = 'playing'

    for p in game.piles:
        game.piles[p] = []
        game.face_down_cards[p] = []

    for p in game.piles:
        if p == '2':
            game.piles[p] = [make_dummy_card(p) for _ in range(3)]
            game.face_down_cards[p] = [make_dummy_card(p, 99)]
        else:
            game.piles[p] = [make_dummy_card(p) for _ in range(4)]
            game.face_down_cards[p] = []

    card = game.flip_card_from_pile('2')
    assert card is not None, 'flip_card_from_pile returned None'
    assert game.current_card_source == '2', 'current_card_source not set to 2'

    result = game.place_card('2')
    assert result.get('game_over') is True, f'Expected game_over True, got {result}'
    assert result.get('won') is True, f'Expected won True, got {result}'


if __name__ == '__main__':
    try:
        test_final_move_from_same_pile_counts_as_win()
        print('TEST PASSED: final move from same pile counts as win')
    except AssertionError as e:
        print('TEST FAILED:', e)
        raise
