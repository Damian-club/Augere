from math import floor

def get_percentage(total: float | int, count: float | int) -> float:
    ratio: float = count / total if total != 0 else 0.0
    return floor_two_decimal_places(ratio)

def floor_two_decimal_places(n: float) -> float:
    return floor(n * 100) / 100