"""Tests for bigquery.py"""
import json
from unittest.mock import patch
from absl.testing import absltest # pylint: disable=no-name-in-module
from utilities import bigquery, firebase

class TestBigQuery(absltest.TestCase):
    """BigQuery Testing Class"""
    def setUp(self): # pylint: disable=invalid-name
        """Set-up
        """
        self.decoded_jwt = {
            'uid': 'u1d'
        }
        self.id_token = 'idT0ken'
        self.time_of_day = 'afternoon'
        self.likes = [
            {
                "album": "Depression Cherry",
                "apple_music_player_url": "https://genius.com/songs/1929412/apple_music_player",
                "artist": "Beach House",
                "email": "moot@gmail.com",
                "embed_content": "<div id='rg_embed_link_1929412' class='rg_embed_link' " \
                    "data-song-id='1929412'>Read <a " \
                    "href='https://genius.com/Beach-house-space-song-lyrics'>“Space Song” " \
                    "by Beach House</a> on Genius</div> <script crossorigin " \
                    "src='//genius.com/songs/1929412/embed.js'></script>",
                "id": 1929412,
                "song_art_image_url":
                    "https://images.genius.com/98ce1842b01c032eef50b8726fbbfba6.900x900x1.jpg",
                "time_of_day": "night",
                "title": "Space Song",
                "uid": "u1d",
                "url": "https://genius.com/Beach-house-space-song-lyrics"
            },
            {
                "album": "Non-Album Single",
                "apple_music_player_url": "https://genius.com/songs/2979924/apple_music_player",
                "artist": "Men I Trust",
                "email": "moot@gmail.com",
                "embed_content": "<div id='rg_embed_link_2979924' class='rg_embed_link' " \
                    "data-song-id='2979924'>Read <a " \
                    "href='https://genius.com/Men-i-trust-lauren-lyrics'>“Lauren” " \
                    "by Men I Trust</a> on Genius</div> <script crossorigin " \
                    "src='//genius.com/songs/2979924/embed.js'></script>",
                "id": 2979924,
                "song_art_image_url":
                    "https://images.genius.com/9a956e5a7c0d78e8441b31bdf14dc87b.1000x1000x1.jpg",
                "time_of_day": "afternoon",
                "title": "Lauren",
                "uid": "u1d",
                "url": "https://genius.com/Men-i-trust-lauren-lyrics"
            }
        ]
        self.song = {
            'album': 'Oncle Jazz',
            'apple_music_player_url': 'https://genius.com/songs/3942840/apple_music_player',
            'embed_content': "<div id='rg_embed_link_3942840' " \
                "class='rg_embed_link' data-song-id='3942840'>" \
                "Read <a href='https://genius.com/Men-i-trust-seven-lyrics'>" \
                "“Seven” by Men I Trust</a> on Genius</div> <script crossorigin " \
                "src='//genius.com/songs/3942840/embed.js'></script>",
            'id': 3942840,
            'artist': 'Men I Trust',
            'song_art_image_url': \
                'https://images.genius.com/4cfc1127efc91f0ac0feae0d30540370.1000x1000x1.jpg',
            'time_of_day': 'evening',
            'title': 'Seven',
            'url': 'https://genius.com/Men-i-trust-seven-lyrics',
        }


    @patch.object(bigquery.db, 'query')
    @patch.object(firebase.auth, 'verify_id_token')
    def test_get_likes(self, mock_verify_id_token, mock_query):
        """Test getting liked songs for logged in user"""
        mock_verify_id_token.return_value = self.decoded_jwt
        expected_query_results = [
            {
                'album': 'Depression Cherry',
                'apple_music_player_url': 'https://genius.com/songs/1929412/apple_music_player',
                'artist': 'Beach House',
                'email': 'moot@gmail.com',
                'embed_content': "<div id='rg_embed_link_1929412' class='rg_embed_link' " \
                    "data-song-id='1929412'>Read <a " \
                    "href='https://genius.com/Beach-house-space-song-lyrics'>“Space Song” " \
                    "by Beach House</a> on Genius</div> <script crossorigin " \
                    "src='//genius.com/songs/1929412/embed.js'></script>",
                'id': 1929412,
                'song_art_image_url':
                    'https://images.genius.com/98ce1842b01c032eef50b8726fbbfba6.900x900x1.jpg',
                'time_of_day': 'night',
                'title': 'Space Song',
                'uid': 'u1d',
                'url': 'https://genius.com/Beach-house-space-song-lyrics',
            },
            {
                'album': 'Non-Album Single',
                'apple_music_player_url': 'https://genius.com/songs/2979924/apple_music_player',
                'artist': 'Men I Trust',
                'email': 'moot@gmail.com',
                'embed_content': "<div id='rg_embed_link_2979924' class='rg_embed_link' " \
                    "data-song-id='2979924'>Read <a " \
                    "href='https://genius.com/Men-i-trust-lauren-lyrics'>“Lauren” " \
                    "by Men I Trust</a> on Genius</div> <script " \
                    "crossorigin src='//genius.com/songs/2979924/embed.js'></script>",
                'id': 2979924,
                'song_art_image_url':
                    'https://images.genius.com/9a956e5a7c0d78e8441b31bdf14dc87b.1000x1000x1.jpg',
                'time_of_day': 'afternoon',
                'title': 'Lauren',
                'uid': 'u1d',
                'url': 'https://genius.com/Men-i-trust-lauren-lyrics',
            }
        ]
        mock_query.return_value = [[json.dumps(row)] for row in expected_query_results]
        likes = bigquery.get_likes(self.id_token)
        self.assertEqual(likes, self.likes)

    @patch.object(bigquery.db, 'query')
    @patch.object(firebase.auth, 'verify_id_token')
    def test_get_song(self, mock_verify_id_token, mock_query):
        """Test getting a song recommendation for logged in user"""
        mock_verify_id_token.return_value = self.decoded_jwt
        expected_query_results = [
            {
                'album': 'Oncle Jazz',
                'apple_music_player_url': 'https://genius.com/songs/3942840/apple_music_player',
                'embed_content': "<div id='rg_embed_link_3942840' " \
                    "class='rg_embed_link' data-song-id='3942840'>" \
                    "Read <a href='https://genius.com/Men-i-trust-seven-lyrics'>" \
                    "“Seven” by Men I Trust</a> on Genius</div> <script crossorigin " \
                    "src='//genius.com/songs/3942840/embed.js'></script>",
                'id': 3942840,
                'artist': 'Men I Trust',
                'song_art_image_url': \
                    'https://images.genius.com/4cfc1127efc91f0ac0feae0d30540370.1000x1000x1.jpg',
                'time_of_day': 'evening',
                'title': 'Seven',
                'url': 'https://genius.com/Men-i-trust-seven-lyrics',
            }
        ]
        mock_query.return_value = expected_query_results
        song = bigquery.get_song(self.id_token, self.time_of_day, self.likes)
        self.assertEqual(song, self.song)

if __name__ == '__main__':
    absltest.main()
