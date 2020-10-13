"""Tests for bigquery.py"""
from unittest.mock import patch
from absl.testing import absltest # pylint: disable=no-name-in-module
from utilities import bigquery

class TestBigQuery(absltest.TestCase):
    """BigQuery Testing Class"""
    def setUp(self): # pylint: disable=invalid-name
        """Set-up
        """
        self.listen_brainz = [
            [
                'Men I Trust',
                'Lauren',
                None,
                'afternoon',
            ],
            [
                'Men I Trust',
                'Seven',
                'Oncle Jazz',
                'evening',
            ],
        ]

    @patch.object(bigquery.db, 'query')
    def test_get_listen_brainz(self, mock_query):
        """Test getting ListenBrainz data, with `time_of_day` field"""
        mock_query.return_value = [
            {
                'artist': 'Men I Trust',
                'title': 'Lauren',
                'album': None,
                'time_of_day': 'afternoon',
            },
            {
                'artist': 'Men I Trust',
                'title': 'Seven',
                'album': 'Oncle Jazz',
                'time_of_day': 'evening',
            },
        ]
        listen_brainz = bigquery.get_listen_brainz()
        self.assertEqual(listen_brainz, self.listen_brainz)

    @patch.object(bigquery.db, 'query')
    def test_add_recommendations(self, mock_query):
        """Testing that `insert into` query called"""
        bigquery.add_recommendations()
        self.assertTrue(mock_query.called)

if __name__ == '__main__':
    absltest.main()
