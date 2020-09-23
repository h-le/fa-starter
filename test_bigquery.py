"""Tests for bigquery.py"""
from unittest.mock import patch
from absl.testing import absltest # pylint: disable=no-name-in-module
from utilities import bigquery, firebase

class TestBigQuery(absltest.TestCase):
    """BigQuery Testing Class"""
    def setUp(self): # pylint: disable=invalid-name
        """Set-up
        """
        self.decoded_jwt = {
            'uid': 'f00'
        }
        # TODO Will update with _real_ 'likes' data when like-functionality implemented
        self.likes = [
            {
                'id': 0,
                'uid': 'f00',
            },
            {
                'id': 1,
                'uid': 'f00',
            },
        ]

    @patch.object(bigquery.db, 'query')
    @patch.object(firebase.auth, 'verify_id_token')
    def test_get_likes(self, mock_verify_id_token, mock_query):
        """Test getting liked songs for logged in user"""
        mock_verify_id_token.return_value = self.decoded_jwt
        mock_query.return_value = [
            ['{"id":0,"uid":"f00"}'],
            ['{"id":1,"uid":"f00"}'],
        ]
        likes = bigquery.get_likes('idT0ken')
        self.assertEqual(likes, self.likes)

if __name__ == '__main__':
    absltest.main()
