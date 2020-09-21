"""Tests for genius.py"""
from unittest.mock import patch
from dotenv import load_dotenv
from absl.testing import absltest # pylint: disable=no-name-in-module
from utilities import genius

class TestGenius(absltest.TestCase):
    """Genius Testing Class"""
    @classmethod
    def setUp(cls): # pylint: disable=invalid-name
        """Set-up
            * Load environment variables from .env
        """
        load_dotenv()

    def test_get_song(self):
        """Test retrieving a song via the Genius API"""
        song_id = 2979924
        exp_song = {
            'album': None,
            'apple_music_player_url': 'https://genius.com/songs/2979924/apple_music_player',
            'artist': 'Men I Trust',
            'embed_content': "<div id='rg_embed_link_2979924' " \
                "class='rg_embed_link' data-song-id='2979924'>" \
                "Read <a href='https://genius.com/Men-i-trust-lauren-lyrics'>" \
                "“Lauren” by Men\xa0I Trust</a> on Genius</div> <script " \
                "crossorigin src='//genius.com/songs/2979924/embed.js'></script>",
            'id': 2979924,
            'song_art_image_thumbnail_url': \
                'https://images.genius.com/9a956e5a7c0d78e8441b31bdf14dc87b.300x300x1.jpg',
            'title': 'Lauren',
            'url': 'https://genius.com/Men-i-trust-lauren-lyrics'}
        with patch('utilities.genius.requests.get') as mocked_get:
            mocked_get.return_value.status_code = 200
            mocked_get.return_value.text = (
                r'''{"response":{"song":{"apple_music_player_url":'''
                r'''"https://genius.com/songs/2979924/apple_music_player",'''
                r'''"embed_content":"<div id='rg_embed_link_2979924' '''
                r'''class='rg_embed_link' data-song-id='2979924'>Read '''
                r'''<a href='https://genius.com/Men-i-trust-lauren-lyrics'>'''
                r'''“Lauren” by Men I Trust</a> on Genius</div> <script '''
                r'''crossorigin src='//genius.com/songs/2979924/embed.js'>'''
                r'''</script>","id":2979924,"song_art_image_thumbnail_url":'''
                r'''"https://images.genius.com/9a956e5a7c0d78e8441b31bdf14dc87b'''
                r'''.300x300x1.jpg","title":"Lauren","url":"https://genius.com'''
                r'''/Men-i-trust-lauren-lyrics","album":null,"primary_artist":'''
                r'''{"name":"Men I Trust"}}}}'''
            )
            song = genius.get_song(song_id)
            mocked_get.asset_called_with(
                'https://api.genius.com/songs/{song_id}'.format(song_id=song_id))
            self.assertEqual(song, exp_song)

if __name__ == '__main__':
    absltest.main()
