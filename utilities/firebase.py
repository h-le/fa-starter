"""Utilities to Interact with Firebase/Firestore"""
import firebase_admin
from firebase_admin import auth
from google.cloud import firestore

firebase_admin.initialize_app()
db = firestore.Client()


def logged_in(id_token):
    """Check if user for the given ID token is logged in."""
    try:
        auth.verify_id_token(id_token)
    except auth.InvalidIdTokenError:
        return False
    return True


@firestore.transactional
def set_like(transaction, like):
    """(Transactionally) set song-like if not already liked."""
    exists = db \
        .collection(u'likes') \
        .where(u'uid', u'==', u'{}'.format(like['uid'])) \
        .where(u'id', u'==', like['id']) \
        .get(transaction=transaction)
    if not exists:
        transaction.set(db.collection(u'likes').document(), like)
    return exists[0].to_dict() if exists else like


def like_song(id_token, song):
    """_Likes_ the song recommendation for the logged in user."""
    jwt = auth.verify_id_token(id_token)
    like = {**song, **{f: jwt[f] for f in ['email', 'uid']}}
    transaction = db.transaction()
    return set_like(transaction, like)


@firestore.transactional
def delete_like(transaction, like):
    """(Transactionally) delete song-like if previously liked."""
    exists = db \
        .collection(u'likes') \
        .where(u'uid', u'==', u'{}'.format(like['uid'])) \
        .where(u'id', u'==', like['id']) \
        .get(transaction=transaction)
    if exists:
        transaction.delete(exists[0].reference)
    return exists[0].to_dict() if exists else {}


def unlike_song(like):
    """_Unlikes_ the song-like for the logged in user."""
    transaction = db.transaction()
    return delete_like(transaction, like)
