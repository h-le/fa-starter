"""Utilities to Interact with Firebase/Firestore"""
import random
import firebase_admin
from firebase_admin import auth, firestore

firebase_admin.initialize_app()
db = firestore.client()

def logged_in(id_token):
    """Check if user for the given ID token is logged in."""
    try:
        auth.verify_id_token(id_token)
    except auth.InvalidIdTokenError:
        return False
    return True

def get_song_id(id_token):
    """Gets a song ID (recommendation) for the logged in user."""
    # TODO This seems like a dangerous assumption
    uid = auth.verify_id_token(id_token)['uid']
    # TODO Song selections will be based on multiple factors, e.g. time of day
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
    likes = db \
            .collection(u'likes') \
            .where(u'uid', u'==', u'{}'.format(uid)) \
            .get()
    like_ids = {like.to_dict()['id'] for like in likes}
    song_id = random.choice(tuple(songs - like_ids))
    return song_id
