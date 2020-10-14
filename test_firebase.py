"""Tests for firebase.py"""
from unittest import mock
from absl.testing import absltest # pylint: disable=no-name-in-module
from firebase_admin import auth
from utilities import firebase

class TestFirebase(absltest.TestCase):
    """Firebase Testing Class"""
    id_token = 'idT0ken'
    jwt = {
        'email': 'moot@gmail.com',
        'uid': 'f00',
    }
    song = {
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
    like = {
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
    transaction = mock.MagicMock()

    @classmethod
    def setUp(cls): # pylint: disable=invalid-name
        """Set-up
            * Mock Firestore database
            * Mock return value for query agaist Firestore db
        """
        firebase.db = mock.MagicMock()
        firebase.db.collection().where().where().get.return_value = []

    @mock.patch.object(firebase.auth, 'verify_id_token')
    def test_logged_in(self, mock_verify_id_token):
        """Test checking if a user is logged in"""
        mock_verify_id_token.return_value = self.jwt
        logged_in = firebase.logged_in(self.id_token)
        self.assertTrue(logged_in)

    @mock.patch.object(firebase.auth, 'verify_id_token')
    def test_not_logged_in(self, mock_verify_id_token):
        """Test checking if a user is _not_ logged in"""
        mock_verify_id_token.side_effect = \
            auth.InvalidIdTokenError('InvalidIdTokenError')
        logged_in = firebase.logged_in(self.id_token)
        self.assertFalse(logged_in)

    @mock.patch.object(firebase, 'set_like')
    @mock.patch.object(firebase.auth, 'verify_id_token')
    def test_like_song(self, mock_verify_id_token, mock_set_like):
        """Test liking song recommendation"""
        mock_verify_id_token.return_value = self.jwt
        mock_set_like.return_value = self.like
        like = firebase.like_song(self.id_token, self.song)
        self.assertEqual(like, self.like)

    def test_set_like(self):
        """Test transaction of adding a song"""
        like = firebase.set_like(self.transaction, self.like)
        firebase.db.collection.assert_called_with(u'likes')
        firebase.db.collection() \
            .where.assert_called_with(u'uid', u'==', u'{}'.format(self.like['uid']))
        firebase.db.collection() \
            .where().where.assert_called_with(u'id', u'==', self.like['id'])
        firebase.db.collection() \
            .where().where().get.assert_called_with(transaction=self.transaction)
        self.transaction.set.assert_called_with( \
            firebase.db.collection(u'likes').document(), self.like)
        self.assertEqual(like, self.like)

if __name__ == '__main__':
    absltest.main()
