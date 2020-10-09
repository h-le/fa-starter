"""Tests for genius.py"""
import os
import json
from unittest.mock import patch
from dotenv import load_dotenv
from absl.testing import absltest # pylint: disable=no-name-in-module
from utilities import genius

class TestGenius(absltest.TestCase):
    """Genius Testing Class"""
    def setUp(self): # pylint: disable=invalid-name
        """Set-up
            * Load environment variables from .env
            * Mock song ID, song,(Genius) access token, headers, and url
        """
        load_dotenv()
        self.song_id = 2979924
        self.song = {
            'album': None,
            'apple_music_player_url': 'https://genius.com/songs/2979924/apple_music_player',
            'artist': 'Men I Trust',
            'embed_content': "<div id='rg_embed_link_2979924' " \
                "class='rg_embed_link' data-song-id='2979924'>" \
                "Read <a href='https://genius.com/Men-i-trust-lauren-lyrics'>" \
                "“Lauren” by Men\xa0I Trust</a> on Genius</div> <script " \
                "crossorigin src='//genius.com/songs/2979924/embed.js'></script>",
            'id': 2979924,
            'song_art_image_url': \
                'https://images.genius.com/9a956e5a7c0d78e8441b31bdf14dc87b.300x300x1.jpg',
            'title': 'Lauren',
            'url': 'https://genius.com/Men-i-trust-lauren-lyrics',
        }
        self.token = os.getenv('GENIUS_ACCESS_TOKEN')
        self.headers = {'Authorization': 'Bearer {token}'.format(token=self.token)}
        self.url = 'https://api.genius.com/songs/{song_id}'.format(song_id=self.song_id)

    @patch.object(genius.requests, 'get')
    def test_get_song(self, mock_get):
        """Test retrieving a song via the Genius API"""
        mock_get.return_value.status_code = 200
        expected_response = {
            'response': {
                'song': {
                    'album': None,
                    'apple_music_player_url': 'https://genius.com/songs/2979924/apple_music_player',
                    'primary_artist': {
                        'name': 'Men I Trust'
                    },
                    'embed_content': "<div id='rg_embed_link_2979924' " \
                        "class='rg_embed_link' data-song-id='2979924'>" \
                        "Read <a href='https://genius.com/Men-i-trust-lauren-lyrics'>" \
                        "“Lauren” by Men\xa0I Trust</a> on Genius</div> <script " \
                        "crossorigin src='//genius.com/songs/2979924/embed.js'></script>",
                    'id': 2979924,
                    'song_art_image_url': \
                        'https://images.genius.com/9a956e5a7c0d78e8441b31bdf14dc87b.300x300x1.jpg',
                    'title': 'Lauren',
                    'url': 'https://genius.com/Men-i-trust-lauren-lyrics',
                }
            }
        }
        mock_get.return_value.text = json.dumps(expected_response)
        song = genius.get_song(self.song_id)
        mock_get.assert_called_with(url=self.url, headers=self.headers)
        self.assertEqual(song, self.song)

if __name__ == '__main__':
    absltest.main()
