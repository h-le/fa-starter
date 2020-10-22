"""Tests for app.py"""
import json
from unittest.mock import patch
from flask_webtest import TestApp
from absl.testing import absltest  # pylint: disable=no-name-in-module
from app import app, firebase, bigquery


class TestFlaskApp(absltest.TestCase):
    """Flask App Testing Class"""

    def setUp(self):  # pylint: disable=invalid-name
        """Set-up
            * Test app
            * Headers
            * Mock song ID and song
        """
        self.api = TestApp(app)
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {}'.format('idT0ken'),
        }
        self.params = {
            'time_of_day': 'afternoon',
        }
        self.song = {
            'album': None,
            'apple_music_player_url':
                'https://genius.com/songs/2979924/apple_music_player',
            'artist': 'Men I Trust',
            'embed_content':
                "<div id='rg_embed_link_2979924' "
                "class='rg_embed_link' data-song-id='2979924'>"
                "Read <a href='https://genius.com/Men-i-trust-lauren-lyrics'>"
                "“Lauren” by Men\xa0I Trust</a> on Genius</div> <script "
                "crossorigin src='//genius.com/songs/2979924/embed.js'>"
                "</script>",
            'id': 2979924,
            'song_art_image_thumbnail_url':
                "https://images.genius.com/"
                "9a956e5a7c0d78e8441b31bdf14dc87b.300x300x1.jpg",
            'time_of_day': 'afternoon',
            'title': 'Lauren',
            'url': 'https://genius.com/Men-i-trust-lauren-lyrics',
        }
        self.like = {
            'album': 'Non-Album Single',
            'apple_music_player_url':
                'https://genius.com/songs/2979924/apple_music_player',
            'artist': 'Men I Trust',
            'email': 'moot@gmail.com',
            'embed_content':
                "<div id='rg_embed_link_2979924' "
                "class='rg_embed_link' data-song-id='2979924'>"
                "Read <a href='https://genius.com/Men-i-trust-lauren-lyrics'>"
                "“Lauren” by Men\xa0I Trust</a> on Genius</div> <script "
                "crossorigin src='//genius.com/songs/2979924/embed.js'>"
                "</script>",
            'id': 2979924,
            'song_art_image_thumbnail_url':
                "https://images.genius.com/"
                "9a956e5a7c0d78e8441b31bdf14dc87b.300x300x1.jpg",
            'time_of_day': 'afternoon',
            'title': 'Lauren',
            'uid': 'u1d',
            'url': 'https://genius.com/Men-i-trust-lauren-lyrics',
        }
        self.likes = [
            {
                "album": "Depression Cherry",
                "apple_music_player_url":
                    "https://genius.com/songs/1929412/apple_music_player",
                "artist": "Beach House",
                "email": "moot@gmail.com",
                "embed_content":
                    "<div id='rg_embed_link_1929412' class='rg_embed_link' "
                    "data-song-id='1929412'>Read <a "
                    "href='https://genius.com/Beach-house-space-song-lyrics'>"
                    "“Space Song” "
                    "by Beach House</a> on Genius</div> <script crossorigin "
                    "src='//genius.com/songs/1929412/embed.js'></script>",
                "id": 1929412,
                "song_art_image_url":
                    "https://images.genius.com/"
                    "98ce1842b01c032eef50b8726fbbfba6.900x900x1.jpg",
                "time_of_day": "night",
                "title": "Space Song",
                "uid": "u1d",
                "url": "https://genius.com/Beach-house-space-song-lyrics"
            },
            {
                "album": "Non-Album Single",
                "apple_music_player_url":
                    "https://genius.com/songs/2979924/apple_music_player",
                "artist": "Men I Trust",
                "email": "moot@gmail.com",
                "embed_content":
                    "<div id='rg_embed_link_2979924' class='rg_embed_link' "
                    "data-song-id='2979924'>Read <a "
                    "href='https://genius.com/Men-i-trust-lauren-lyrics'>"
                    "“Lauren” "
                    "by Men I Trust</a> on Genius</div> <script crossorigin "
                    "src='//genius.com/songs/2979924/embed.js'></script>",
                "id": 2979924,
                "song_art_image_url":
                    "https://images.genius.com/"
                    "9a956e5a7c0d78e8441b31bdf14dc87b.1000x1000x1.jpg",
                "time_of_day": "afternoon",
                "title": "Lauren",
                "uid": "u1d",
                "url": "https://genius.com/Men-i-trust-lauren-lyrics"
            }
        ]

    @patch.object(bigquery, 'get_song')
    @patch.object(bigquery, 'get_likes')
    @patch.object(firebase, 'logged_in')
    def test_get_recommendation(self,
                                mock_logged_in,
                                mock_get_likes,
                                mock_get_song):
        """Test hitting the '_recommend' endpoint to get a recommendation"""
        mock_logged_in.return_value = True
        mock_get_likes.return_value = self.likes
        mock_get_song.return_value = self.song
        response = self.api.get(
            '/_recommend', headers=self.headers, params=self.params)
        song = json.loads(response.text)
        self.assertEqual(response.headers['Content-Type'], 'application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(song, self.song)

    @patch.object(firebase, 'logged_in')
    def test_cannot_get_recommendation(self, mock_logged_in):
        """Test hitting the '_recommend' endpoint but user isn't logged in"""
        mock_logged_in.return_value = False
        response = self.api.get(
            '/_recommend', headers=self.headers, expect_errors=True)
        self.assertEqual(
            response.headers['Content-Type'], 'text/html; charset=utf-8')
        self.assertEqual(response.status_code, 401)
        self.assertTrue('User not logged in!' in response.text)

    @patch.object(bigquery, 'get_likes')
    @patch.object(firebase, 'logged_in')
    def test_get_likes(self, mock_logged_in, mock_get_likes):
        """Test hitting the '_likes' endpoint to get user's liked songs"""
        mock_logged_in.return_value = True
        mock_get_likes.return_value = self.likes
        response = self.api.get('/_like', headers=self.headers)
        likes = json.loads(response.text)
        self.assertEqual(response.headers['Content-Type'], 'application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(likes, self.likes)

    @patch.object(firebase, 'like_song')
    @patch.object(firebase, 'logged_in')
    def test_post_like(self, mock_logged_in, mock_like_song):
        """Test hitting the '_like' endpoint to add the song recommendation"""
        mock_logged_in.return_value = True
        mock_like_song.return_value = self.like
        response = self.api.post(
            '/_like', json.dumps(self.song), headers=self.headers)
        like = json.loads(response.text)
        self.assertEqual(response.headers['Content-Type'], 'application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(like, self.like)

    @patch.object(firebase, 'unlike_song')
    @patch.object(firebase, 'logged_in')
    def test_delete_like(self, mock_logged_in, mock_unlike_song):
        """Test hitting the '_unlike' endpoint to unlike the given song"""
        mock_logged_in.return_value = True
        mock_unlike_song.return_value = self.like
        response = self.api.delete(
            f'/_like?data={json.dumps(self.like)}',
            headers=self.headers)
        unlike = json.loads(response.text)
        self.assertEqual(response.headers['Content-Type'], 'application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(unlike, self.like)


if __name__ == '__main__':
    absltest.main()
