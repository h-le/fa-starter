"""`Server-side` NDB Models"""
from google.cloud import ndb

class LikedSong(ndb.Model):
    """User-liked song"""
    album = ndb.StringProperty()
    apple_music_player_url = ndb.StringProperty()
    artist = ndb.StringProperty()
    embed_content = ndb.StringProperty()
    song_art_image_thumbnail_url = ndb.StringProperty()
    title = ndb.StringProperty()
