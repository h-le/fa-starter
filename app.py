"""Angular+Flask AppEngine Starter App"""
import os
import json
import random
import requests
import firebase_admin
from firebase_admin import auth
from firebase_admin import firestore

import flask
import flask_cors
from dotenv import load_dotenv

load_dotenv()

app = firebase_admin.initialize_app()
db = firestore.client()

# Client access token for Genius API
GENIUS_ACCESS_TOKEN = os.getenv('GENIUS_ACCESS_TOKEN')

# Set up the static folder to serve our angular client resources (*.js, *.css)
app = flask.Flask(__name__,
                  static_folder='dist/client',
                  static_url_path='/client/')

# If we're running in debug, defer to the typescript development server
# This gets us things like live reload and better sourcemaps.
if app.config['DEBUG']:
    app.config['API_URL'] = os.getenv(
        'DEBUG_API_URL') or 'http://localhost:5000'
    app.config['ORIGIN'] = os.getenv('DEBUG_ORIGIN') or 'http://localhost:4200'

    flask_cors.CORS(app,
                    allow_headers='*',
                    origins=[app.config['ORIGIN']],
                    supports_credentials=True)
else:
    app.config['API_URL'] = os.getenv('PROD_API_URL')

# Set the secret key to enable access to session data.
app.secret_key = os.urandom(24)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_angular(path):
    """
    A catch-all route to serve the angular app.
    If no other routes match (such as /example) this will be called, and the
    angular app will take over routing.
    """
    if flask.current_app.config['DEBUG']:
        target = '/'.join([
            flask.current_app.config['ORIGIN'].rstrip('/'),
            app.static_url_path.strip('/'),
            path.lstrip('/')
        ])
        return flask.redirect(target)
    return flask.send_file('dist/client/index.html')

@app.route('/_recommend')
def get_recommendation():
    """
    Recommends a song via Genius API to the verified user
    Song recommendation:
      - album (string): Album name
      - apple_music_player_url (string): Apple music player URL
      - artist (string): Artist name
      - embed_content (string): Embedded song lyrics via Genius
      - id (integer): Genius song ID
      - song_art_image_thumbnail_url (string): Song art thumbnail URL
      - title (string): Song title
      - url (string): Genius song lyrics page URL
    """
    id_token = flask.request.headers['Authorization'].split(' ').pop()

    try:
        user = auth.verify_id_token(id_token)
    except auth.InvalidIdTokenError:
        return flask.abort(401, 'Unauthorized: Invalid ID token')

    uid = user['uid']

    headers = {
        'Authorization': 'Bearer {token}'.format(token=GENIUS_ACCESS_TOKEN)}

    url = 'https://api.genius.com/'

    endpoint = 'songs/'

    # TODO Song selections will be based on multiple factors, e.g. time of day
    songs = [
        1929408, # Levitation by Beach House
        1929412, # Space Song by Beach House
        5059926, # Time Alone with You by Jacob Collier
        5565895, # All I Need by Jacob Collier, Mahalia & Ty Dolla $ign
        901533,  # I'm the Man, That Will Find You by Connan Mockasin
        2911300, # I Wanna Roll With You by Connan Mockasin
        188792,  # Easy Easy by King Krule
        3234164  # Logos by King Krule
    ]

    likes = db \
            .collection(u'likes') \
            .where(u'uid', u'==', u'{}'.format(uid)) \
            .get()

    like_ids = [like.to_dict()['id'] for like in likes]

    song_id = random.choice([id for id in songs if id not in like_ids])

    response = requests.get(
        url='{url}{endpoint}{song_id}'.format(
            url=url,
            endpoint=endpoint,
            song_id=str(song_id)),
        headers=headers)

    song = json.loads(response.text)['response']['song']

    recommendation = {
        'album': song['album']['name'],
        'apple_music_player_url': song['apple_music_player_url'],
        'artist': song['primary_artist']['name'],
        'embed_content': song['embed_content'],
        'id': song['id'],
        'song_art_image_thumbnail_url': song['song_art_image_thumbnail_url'],
        'title': song['title'],
        'url': song['url'],
    }

    return flask.jsonify(recommendation)
