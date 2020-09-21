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
        # ...
    }

    songs = {
        1929408, # Levitation by Beach House
        1929412, # Space Song by Beach House
        5059926, # Time Alone with You by Jacob Collier
        5565895, # All I Need by Jacob Collier, Mahalia & Ty Dolla $ign
        901533,  # I'm the Man, That Will Find You by Connan Mockasin
        2911300, # I Wanna Roll With You by Connan Mockasin
        188792,  # Easy Easy by King Krule
        3234164, # Logos by King Krule
        2979924, # Lauren by Men I Trust
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
