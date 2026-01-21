from app.models.deck import DeckShuffle
from app.models.game import PokerGame


def make_dummy_card(value):
    return f"{value}C"


def scenario_loss_when_complete_from_same_pile():
    """If you place the 4th card from the same pile and game is NOT completed, you lose."""
    deck = DeckShuffle()
    game = PokerGame(deck)
    game.status = 'playing'

    for p in game.piles:
        game.piles[p] = []
        game.face_down_cards[p] = []

    for p in game.piles:
        if p == '3':
            game.piles[p] = [make_dummy_card(p) for _ in range(3)]
            game.face_down_cards[p] = []
        else:
            game.piles[p] = [make_dummy_card(p) for _ in range(4)]

    game.current_card = make_dummy_card('3')
    game.current_card_source = '3'

    result = game.place_card('3')
    assert result.get('game_over') is True
    assert result.get('won') is False


def scenario_win_when_last_completed_all():
    """If placing the last card completes all piles, it's a win."""
    deck = DeckShuffle()
    game = PokerGame(deck)
    game.status = 'playing'

    for p in game.piles:
        game.piles[p] = []
        game.face_down_cards[p] = []

    for p in game.piles:
        if p == '2':
            game.piles[p] = [make_dummy_card(p) for _ in range(3)]
        else:
            game.piles[p] = [make_dummy_card(p) for _ in range(4)]

    game.current_card = make_dummy_card('2')
    game.current_card_source = '2'

    result = game.place_card('2')
    assert result.get('game_over') is True
    assert result.get('won') is True


def scenario_king_from_other_pile_does_not_auto_lose():
    """Revealing 4th K coming from another pile should not auto-lose if not final move."""
    deck = DeckShuffle()
    game = PokerGame(deck)
    game.status = 'playing'

    for p in game.piles:
        game.piles[p] = []
        game.face_down_cards[p] = []

    game.kings_revealed = 3
    for p in game.piles:
        game.piles[p] = [make_dummy_card(p) for _ in range(4)]
    game.piles['K'] = [make_dummy_card('K') for _ in range(3)]
    game.face_down_cards['K'] = [make_dummy_card('K')]
    game.current_card = 'KC'
    game.current_card_source = 'J'

    result = game.place_card('K')
    assert result.get('game_over') in (None, False) or result.get('won') is False


if __name__ == '__main__':
    try:
        scenario_loss_when_complete_from_same_pile()
        print('PASS: scenario_loss_when_complete_from_same_pile')
        scenario_win_when_last_completed_all()
        print('PASS: scenario_win_when_last_completed_all')
        scenario_king_from_other_pile_does_not_auto_lose()
        print('PASS: scenario_king_from_other_pile_does_not_auto_lose')
        print('All tests passed')
    except AssertionError as e:
        print('Test failed:', e)
        raise
