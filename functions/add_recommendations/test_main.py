"""Tests for main.py"""
from unittest import mock
from absl.testing import absltest # pylint: disable=no-name-in-module
import main

class TestMain(absltest.TestCase):
    """Main Testing Class"""
    info = [
        'Men I Trust',
        'Seven',
        'Oncle Jazz',
        'evening',
    ]
    top_hit = {
        'id': 3942840,
        'title': 'Seven',
        'primary_artist': {
            'name': 'Men I Trust',
        },
    }
    song = {
        'album': {
            'name': 'Oncle Jazz',
        },
        'apple_music_player_url': 'https://genius.com/songs/3942840/apple_music_player',
        'embed_content': "<div id='rg_embed_link_3942840' " \
            "class='rg_embed_link' data-song-id='3942840'>" \
            "Read <a href='https://genius.com/Men-i-trust-seven-lyrics'>" \
            "“Seven” by Men I Trust</a> on Genius</div> <script crossorigin " \
            "src='//genius.com/songs/3942840/embed.js'></script>",
        'id': 3942840,
        'primary_artist': {
            'name': 'Men I Trust',
        },
        'song_art_image_url': \
            'https://images.genius.com/4cfc1127efc91f0ac0feae0d30540370.1000x1000x1.jpg',
        'title': 'Seven',
        'url': 'https://genius.com/Men-i-trust-seven-lyrics',
    }
    song_metadata = {
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
    request = mock.MagicMock()
    df = mock.MagicMock()

    @classmethod
    def setUp(cls): # pylint: disable=invalid-name
        """Set-up
            * Mock pandas_gbq
        """
        main.pd_gbq = mock.MagicMock()

    @mock.patch.object(main.genius, 'get_song')
    @mock.patch.object(main.genius, 'get_top_hit')
    def test_get_song_metadata(self, mock_get_top_hit, mock_get_song):
        """Test combined song info via Genius API + ListenBrainz info"""
        mock_get_top_hit.return_value = self.top_hit
        mock_get_song.return_value = self.song
        song_metadata = main.get_song_metadata(self.info)
        self.assertEqual(song_metadata, self.song_metadata)

    @mock.patch.object(main.bigquery, 'add_recommendations')
    @mock.patch.object(main.pd, 'DataFrame')
    @mock.patch.object(main.bigquery, 'get_listen_brainz')
    @mock.patch.object(main, 'get_song_metadata')
    def test_entry_point(self,
                         mock_get_song_metadata,
                         mock_get_listen_brainz,
                         mock_dataframe,
                         mock_add_recommendations):
        """Test
            * Getting songs' metadata via ListenBrainz + Genius API
            * Transforming songs' metadata to Pandas DataFrame
            * Replace _temporary_ table with songs' metadata
            * Run an `insert into` to insert _new_ song recommendations
        """
        mock_get_song_metadata.return_value = dict()
        mock_get_listen_brainz.return_value = list()
        expected_response = 'add-recommendations completed!'
        response = main.entry_point(self.request)
        self.assertTrue(mock_dataframe.called)
        main.pd_gbq.to_gbq.assert_called_with(
            mock_dataframe(),
            'noon.t_recommendations',
            project_id='faf-starter',
            if_exists='replace'
        )
        self.assertTrue(mock_add_recommendations.called)
        self.assertEqual(response, expected_response)

if __name__ == '__main__':
    absltest.main()
