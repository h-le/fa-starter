"""Tests for main.py"""
import os
import json
from unittest.mock import patch
from absl.testing import absltest # pylint: disable=no-name-in-module
import main

# TODO Move testing to functions/ folder (one level up)
class TestAddRecommendations(absltest.TestCase):
    """Add Recommendations (Cloud Function) Testing Class"""
    def setUp(self): # pylint: disable=invalid-name
        """Set-up
        """
        self.listen_brainz = [
            [
                'Some_Artist',
                'Some_Title',
                'Some_Album',
                'morning',
            ],
            [
                'Another_Artist',
                'Another_Title',
                'Another_Album',
                'evening',
            ],
        ]
        self.strings_with_single_quotes = [
            'A word\'s apostrophe.',
            'Another one\'s apostrophe.',
        ]
        self.token = os.getenv('GENIUS_ACCESS_TOKEN')
        self.headers = {'Authorization': 'Bearer {token}'.format(token=self.token)}
        self.url = 'https://api.genius.com'
        self.info = [
            'Artist\'s name',
            'Song\'s title',
            'Album\'s title',
            'morning',
        ]
        self.top_hit = {
            'id': 0,
            'primary_artist': {
                'name': 'Artist’s name'
            },
            'title': 'Song’s title',
        }
        self.hit_song_id = 0
        self.song_data = {
            'album': {
                'name': 'Album’s title',
            },
            'apple_music_player_url': 'Apple music player URL',
            'primary_artist': {
                'name': 'Artist’s name',
            },
            'embed_content': 'Embedded content',
            'id': 0,
            'song_art_image_url': 'Song art image URL',
            'title': 'Song’s title',
            'url': 'Genius URL',
        }
        self.song_meta = {
            'album': 'Album’s title',
            'apple_music_player_url': 'Apple music player URL',
            'artist': 'Artist’s name',
            'embed_content': 'Embedded content',
            'id': 0,
            'song_art_image_url': 'Song art image URL',
            'time_of_day': 'morning',
            'title': 'Song’s title',
            'url': 'Genius URL',
        }

    @patch.object(main.db, 'query')
    def test_get_listen_brainz(self, mock_query):
        """Test getting ListenBrainz data, with `time_of_day` field"""
        mock_query.return_value = [
            {
                'artist': 'Some_Artist',
                'title': 'Some_Title',
                'album': 'Some_Album',
                'time_of_day': 'morning',
            },
            {
                'artist': 'Another_Artist',
                'title': 'Another_Title',
                'album': 'Another_Album',
                'time_of_day': 'evening',
            },
        ]
        listen_brainz = main.get_listen_brainz()
        self.assertEqual(listen_brainz, self.listen_brainz)

    def test_d_apostrophe(self):
        """Test replacing `’` (apostrophe) with single quote"""
        strings_with_apostrophes = [
            'A word’s apostrophe.',
            'Another one’s apostrophe.',
        ]
        strings = main.d_apostrophe(strings_with_apostrophes)
        self.assertEqual(strings, self.strings_with_single_quotes)

    @patch.object(main.requests, 'get')
    def test_get_genius_top_hit(self, mock_get):
        """Test getting top hit from Genius /search endpoint"""
        expected_response = {
            'response': {
                'hits': [
                    {
                        'result': {
                            'id': 0,
                            'primary_artist': {
                                'name': 'Artist’s name'
                            },
                            'title': 'Song’s title',
                        },
                    },
                ],
            },
        }
        mock_get.return_value.text = json.dumps(expected_response)
        top_hit = main.get_genius_top_hit(self.info[0], self.info[1], self.url, self.headers)
        self.assertEqual(top_hit, self.top_hit)

    @patch.object(main.requests, 'get')
    def test_get_genius_song_data(self, mock_get):
        """Test getting song data from Genius /songs endpoint"""
        expected_response = {
            'response': {
                'song': {
                    'album': {
                        'name': 'Album’s title',
                    },
                    'apple_music_player_url': 'Apple music player URL',
                    'primary_artist': {
                        'name': 'Artist’s name',
                    },
                    'embed_content': 'Embedded content',
                    'id': 0,
                    'song_art_image_url': 'Song art image URL',
                    'title': 'Song’s title',
                    'url': 'Genius URL',
                },
            },
        }
        mock_get.return_value.text = json.dumps(expected_response)
        song = main.get_genius_song_data(self.hit_song_id, self.url, self.headers)
        self.assertEqual(song, self.song_data)

    @patch.object(main, 'get_genius_song_data')
    @patch.object(main, 'get_genius_top_hit')
    def test_get_genius_meta(self, mock_genius_top_hit, mock_genius_song_data):
        """Test getting Genius' song information for given song information"""
        mock_genius_top_hit.return_value = self.top_hit
        mock_genius_song_data.return_value = self.song_data
        song_meta = main.get_genius_meta(self.info)
        # print('song_meta: ', song_meta)
        # print('expected: ', {**self.song_data, **{'time_of_day': self.info[3]}})
        self.assertEqual(song_meta, self.song_meta)

    @patch.object(main.db, 'query')
    def test_add_recommendations(self, mock_query):
        """Testing that `insert into` query called"""
        main.add_recommendations()
        self.assertTrue(mock_query.called)

if __name__ == '__main__':
    absltest.main()
