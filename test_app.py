"""Tests for app.py"""
import json
from unittest.mock import patch
from flask_webtest import TestApp
from absl.testing import absltest # pylint: disable=no-name-in-module
from app import app

class TestFlaskApp(absltest.TestCase):
    """Flask App Testing Class"""
    def setUp(self): # pylint: disable=invalid-name
        """Set-up
            * Test app
            * Headers
            * Mock song ID and song
        """
        self.api = TestApp(app)
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {}'.format('idT0ken')
        }
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
            'song_art_image_thumbnail_url': \
                'https://images.genius.com/9a956e5a7c0d78e8441b31bdf14dc87b.300x300x1.jpg',
            'title': 'Lauren',
            'url': 'https://genius.com/Men-i-trust-lauren-lyrics',
        }

    @patch('app.genius.get_song')
    @patch('app.firebase.get_song_id')
    @patch('app.firebase.logged_in')
    def test_get_recommendation(self, mock_logged_in, mock_get_song_id, mock_get_song):
        """Test hitting the _recommend endpoint to get a song recommendation"""
        mock_logged_in.return_value = True
        mock_get_song_id.return_value = self.song_id
        mock_get_song.return_value = self.song
        response = self.api.get('/_recommend', headers=self.headers)
        song = json.loads(response.text)
        self.assertEqual(response.headers['Content-Type'], 'application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(song, self.song)

        mock_logged_in.return_value = False
        response = self.api.get('/_recommend', headers=self.headers, expect_errors=True)
        self.assertEqual(response.headers['Content-Type'], 'text/html; charset=utf-8')
        self.assertEqual(response.status_code, 401)
        self.assertTrue('User not logged in!' in response.text)

if __name__ == '__main__':
    absltest.main()
