"""Tests for firebase.py"""
from unittest.mock import patch
from absl.testing import absltest # pylint: disable=no-name-in-module
from firebase_admin import auth
from mockfirestore import MockFirestore
from utilities import firebase

class TestFirebase(absltest.TestCase):
    """Firebase Testing Class"""
    decoded_jwt = {
        'uid': 'f00',
    }

    @classmethod
    def setUp(cls): # pylint: disable=invalid-name
        """Set-up
            * Mock Firestore database
        """
        firebase.db = MockFirestore()

    @patch.object(firebase.auth, 'verify_id_token')
    def test_logged_in(self, mock_verify_id_token):
        """Test checking if a user is logged in"""
        mock_verify_id_token.return_value = self.decoded_jwt
        logged_in = firebase.logged_in('good_idT0ken')
        self.assertTrue(logged_in)

    @patch.object(firebase.auth, 'verify_id_token')
    def test_logged_out(self, mock_verify_id_token):
        """Test checking if a user is _not_ logged in"""
        mock_verify_id_token.side_effect = \
            auth.InvalidIdTokenError('InvalidIdTokenError')
        logged_in = firebase.logged_in('bad_idT0ken')
        self.assertFalse(logged_in)

    @patch.object(firebase.auth, 'verify_id_token')
    def test_get_song_id(self, mock_verify_id_token):
        """Test getting song (ID) recommendation"""
        mock_verify_id_token.return_value = self.decoded_jwt
        song_id = firebase.get_song_id('idT0ken')
        self.assertIsInstance(song_id, int)

if __name__ == '__main__':
    absltest.main()
