"""Tests for genius.py"""
import json
from unittest.mock import patch
from absl.testing import absltest # pylint: disable=no-name-in-module
from utilities import genius

class TestGenius(absltest.TestCase):
    """Genius Testing Class"""
    def setUp(self): # pylint: disable=invalid-name
        """Set-up
        """
        self.info = [
            'Men I Trust',
            'Seven',
            'Oncle Jazz',
            'evening',
        ]
        self.top_hit = {
            'id': 3942840,
            'title': 'Seven',
            'primary_artist': {
                'name': 'Men I Trust',
            },
        }
        self.song_id = 3942840
        self.song = {
            'album': {
                'name': 'Oncle Jazz',
            },
            'apple_music_player_url': 'https://genius.com/songs/3942840/apple_music_player',
            'embed_content': "<div id='rg_embed_link_3942840' " \
                "class='rg_embed_link' data-song-id='3942840'>" \
                "Read <a href='https://genius.com/Men-i-trust-seven-lyrics'>" \
                "“Seven” by Men I Trust</a> on Genius</div> <script crossorigin " \
                "src='//genius.com/songs/3942840/embed.js'></script>",
            'id': 3942840,
            'primary_artist': {
                'name': 'Men I Trust',
            },
            'song_art_image_url': \
                'https://images.genius.com/4cfc1127efc91f0ac0feae0d30540370.1000x1000x1.jpg',
            'title': 'Seven',
            'url': 'https://genius.com/Men-i-trust-seven-lyrics',
        }

    @patch.object(genius.requests, 'get')
    def test_get_top_hit(self, mock_get):
        """Test getting top hit from Genius `/search` endpoint"""
        expected_response = {
            'response': {
                'hits': [
                    {
                        'result': {
                            'id': 3942840,
                            'title': 'Seven',
                            'primary_artist': {
                                'name': 'Men I Trust',
                            },
                        },
                    },
                ],
            },
        }
        mock_get.return_value.text = json.dumps(expected_response)
        top_hit = genius.get_top_hit(self.info[0], self.info[1])
        self.assertEqual(top_hit, self.top_hit)

    @patch.object(genius.requests, 'get')
    def test_get_song(self, mock_get):
        """Test getting song data from Genius `/songs` endpoint"""
        expected_response = {
            'response': {
                'song': {
                    'album': {
                        'name': 'Oncle Jazz',
                    },
                    'apple_music_player_url': 'https://genius.com/songs/3942840/apple_music_player',
                    'embed_content': "<div id='rg_embed_link_3942840' " \
                        "class='rg_embed_link' data-song-id='3942840'>" \
                        "Read <a href='https://genius.com/Men-i-trust-seven-lyrics'>" \
                        "“Seven” by Men I Trust</a> on Genius</div> <script crossorigin " \
                        "src='//genius.com/songs/3942840/embed.js'></script>",
                    'id': 3942840,
                    'primary_artist': {
                        'name': 'Men I Trust',
                    },
                    'song_art_image_url': \
                        "https://images.genius.com/" \
                        "4cfc1127efc91f0ac0feae0d30540370.1000x1000x1.jpg",
                    'title': 'Seven',
                    'url': 'https://genius.com/Men-i-trust-seven-lyrics',
                },
            },
        }
        mock_get.return_value.text = json.dumps(expected_response)
        song = genius.get_song(self.song_id)
        self.assertEqual(song, self.song)

if __name__ == '__main__':
    absltest.main()
