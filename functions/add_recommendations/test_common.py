"""Tests for common.py"""
from absl.testing import absltest # pylint: disable=no-name-in-module
from utilities import common

class TestCommon(absltest.TestCase):
    """Common Utils Testing Class"""
    def setUp(self): # pylint: disable=invalid-name
        """Set-up
        """
        self.strings_with_single_quotes = [
            'A word\'s apostrophe.',
            'Another one\'s apostrophe.',
        ]

    def test_replace_apostrophes(self):
        """Test replacing `’` (apostrophe) with single quote"""
        strings_with_apostrophes = [
            'A word’s apostrophe.',
            'Another one’s apostrophe.',
        ]
        strings = common.replace_apostrophes(strings_with_apostrophes)
        self.assertEqual(strings, self.strings_with_single_quotes)

if __name__ == '__main__':
    absltest.main()
