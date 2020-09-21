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

    def test_logged_in(self):
        """Test checking if a user is logged in"""
        with patch('utilities.firebase.auth.verify_id_token') as mocked_verify_id_token:
            mocked_verify_id_token.return_value = self.decoded_jwt
            logged_in = firebase.logged_in('good_idT0ken')
            self.assertTrue(logged_in)
            mocked_verify_id_token.side_effect = \
                 auth.InvalidIdTokenError('InvalidIdTokenError')
            logged_in = firebase.logged_in('bad_idT0ken')
            self.assertFalse(logged_in)

    def test_get_song_id(self):
        """Test getting song (ID) recommendation"""
        with patch('utilities.firebase.auth.verify_id_token') as mocked_verify_id_token:
            mocked_verify_id_token.return_value = self.decoded_jwt
            song_id = firebase.get_song_id('idT0ken')
            self.assertIsInstance(song_id, int)

if __name__ == '__main__':
    absltest.main()
