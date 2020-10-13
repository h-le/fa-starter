"""Common Utilities"""

def d_apostrophe(strings):
    """Replace `’` (apostrophe) with single quote
    """
    return [s.replace('’', '\'') for s in strings]
