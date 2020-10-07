"""Tests for firebase.py"""
from unittest.mock import patch
from absl.testing import absltest # pylint: disable=no-name-in-module
from firebase_admin import auth
from utilities import firebase

class TestFirebase(absltest.TestCase):
    """Firebase Testing Class"""
    def setUp(self): # pylint: disable=invalid-name
        """Set-up
            Mock ID token, jwt, song, and like
        """
        self.id_token = 'idT0ken'
        self.jwt = {
            'email': 'moot@gmail.com',
            'uid': 'f00',
        }
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
        self.like = {
            'album': 'Non-Album Single',
            'apple_music_player_url': 'https://genius.com/songs/2979924/apple_music_player',
            'artist': 'Men I Trust',
            'email': 'moot@gmail.com',
            'embed_content': "<div id='rg_embed_link_2979924' " \
                "class='rg_embed_link' data-song-id='2979924'>" \
                "Read <a href='https://genius.com/Men-i-trust-lauren-lyrics'>" \
                "“Lauren” by Men\xa0I Trust</a> on Genius</div> <script " \
                "crossorigin src='//genius.com/songs/2979924/embed.js'></script>",
            'id': 2979924,
            'song_art_image_thumbnail_url': \
                'https://images.genius.com/9a956e5a7c0d78e8441b31bdf14dc87b.300x300x1.jpg',
            'title': 'Lauren',
            'uid': 'u1d',
            'url': 'https://genius.com/Men-i-trust-lauren-lyrics',
        }
        self.transaction = firebase.db.transaction()

    @patch.object(firebase.auth, 'verify_id_token')
    def test_logged_in(self, mock_verify_id_token):
        """Test checking if a user is logged in"""
        mock_verify_id_token.return_value = self.jwt
        logged_in = firebase.logged_in(self.id_token)
        self.assertTrue(logged_in)

    @patch.object(firebase.auth, 'verify_id_token')
    def test_not_logged_in(self, mock_verify_id_token):
        """Test checking if a user is _not_ logged in"""
        mock_verify_id_token.side_effect = \
            auth.InvalidIdTokenError('InvalidIdTokenError')
        logged_in = firebase.logged_in(self.id_token)
        self.assertFalse(logged_in)

    @patch.object(firebase.auth, 'verify_id_token')
    def test_get_song_id(self, mock_verify_id_token):
        """Test getting song (ID) recommendation"""
        mock_verify_id_token.return_value = self.jwt
        song_id = firebase.get_song_id(self.id_token)
        self.assertIsInstance(song_id, int)

    @patch.object(firebase, 'set_like')
    @patch.object(firebase.auth, 'verify_id_token')
    def test_like_song(self, mock_verify_id_token, mock_set_like):
        """Test liking song recommendation"""
        mock_verify_id_token.return_value = self.jwt
        mock_set_like.return_value = self.like
        like = firebase.like_song(self.id_token, self.song)
        self.assertEqual(like, self.like)

    def test_set_like(self):
        """Test transaction of adding a song"""
        like = firebase.set_like(self.transaction, self.like)
        self.assertEqual(like, self.like)

if __name__ == '__main__':
    absltest.main()
