"""Common Utilities"""

def replace_apostrophes(strings):
    """Replace `’` (apostrophe) with single quote
    """
    return [s.replace('’', '\'') for s in strings]
