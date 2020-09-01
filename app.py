"""Angular+Flask AppEnginer Starter App"""
import os

import ast
import json
import random # TODO (2) Remove along with (1)
import flask
import flask_cors
from dotenv import load_dotenv
from google.cloud import datastore
import requests

load_dotenv()

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

# Datastore client
client = datastore.Client()

# Client access token for Genius API
GENIUS_ACCESS_TOKEN = os.getenv('GENIUS_ACCESS_TOKEN')

@app.route('/home')
def home():
    """Home(???)"""
    url = '{app_url}/'.format(app_url=app.config['API_URL'])

    response = requests.get(url='{}/_recommend'.format(url))

    song = json.loads(response.text)

    return flask.render_template('index.html', song=song)

@app.route('/_recommend')
def get_recommendation():
    """
    Recommends a song via Genius API (https://genius.com/developers)

    Song recommendation (dict):
      - album (string): Album name
      - apple_music_player_url (string): Apple music player URL
      - artist (string): Artist name
      - embed_content (string): Embedded song lyrics via Genius
      - song_art_image_thumbnail_url (string): Song art thumbnail URL
      - title (string): Song title
    """
    headers = {
        'Authorization': 'Bearer {token}'.format(token=GENIUS_ACCESS_TOKEN)}

    url = 'https://api.genius.com/'
    endpoint = 'songs/'

    # TODO (1) Generate 'song_id'
    song_id = random.choice(
        [
            '1929408', # Levitation by Beach House
            '1929412', # Space Song by Beach House
            '5059926', # Time Alone with You by Jacob Collier
            '5565895', # All I Need by Jacob Collier, Mahalia & Ty Dolla $ign
            '901533',  # I'm the Man, That Will Find You by Connan Mockasin
            '2911300', # I Wanna Roll With You by Connan Mockasin
            '188792',  # Easy Easy by King Krule
            '3234164'  # Logos by King Krule
        ]) # For the time being, hard-coding list of 'song_id's

    response = requests.get(
        url='{url}{endpoint}{song_id}'.format(
            url=url,
            endpoint=endpoint,
            song_id=song_id),
        headers=headers)

    song = json.loads(response.text)['response']['song']

    recommendation = {
        'album': song['album']['name'],
        'apple_music_player_url': song['apple_music_player_url'],
        'artist': song['primary_artist']['name'],
        'embed_content': song['embed_content'],
        'song_art_image_thumbnail_url': song['song_art_image_thumbnail_url'],
        'title': song['title']}

    return flask.jsonify(recommendation)

@app.route('/_likes')
def get_likes():
    """Get liked songs (array) from datastore"""
    kind = 'LikedSong'

    query = client.query(kind=kind)
    songs = list(query.fetch())

    return flask.jsonify(songs)

@app.route('/_like', methods=['POST'])
def add_like():
    """Like a song"""
    if flask.request.method == 'POST':
        song = ast.literal_eval(flask.request.form['song'])

        with client.transaction():
            kind = 'LikedSong'

            likedsong = datastore.Entity(client.key(kind))
            likedsong.update({
                'album': song['album']['name'],
                'apple_music_player_url': song['apple_music_player_url'],
                'artist': song['primary_artist']['name'],
                'embed_content': song['embed_content'],
                'song_art_image_thumbnail_url': \
                    song['song_art_image_thumbnail_url'],
                'title': song['title']})

            client.put(likedsong)

    return flask.redirect(flask.url_for('get_likes'))


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
