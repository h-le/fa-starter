"""Angular+Flask AppEnginer Starter App"""
import os

import ast
import flask
import flask_cors
from dotenv import load_dotenv
from google.cloud import datastore
import requests

#import example

load_dotenv()

# Set up the static folder to serve our angular client resources (*.js, *.css)
app = flask.Flask(__name__,
                  static_folder='dist/client',
                  static_url_path='/client/')

#app.register_blueprint(example.blueprint)

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

client = datastore.Client()

GENIUS_ACCESS_TOKEN = os.getenv('GENIUS_ACCESS_TOKEN')

@app.route('/home')
def recommend():
    """Recommend a song"""
    headers = {
        'Authorization': 'Bearer {token}'.format(token=GENIUS_ACCESS_TOKEN)}

    # Hard-coding a song recommendation
    url = 'https://api.genius.com/'
    endpoint = 'songs/'

    # Song ID for 'Space Song' by Beach House
    song_id = '1929412'

    response = requests.get(
        url + endpoint + song_id,
        headers=headers)

    song = response.json()['response']['song']

    return flask.render_template('index.html', song=song)

@app.route('/likes')
def get_likes():
    """Get liked songs"""
    kind = 'LikedSong'

    query = client.query(kind=kind)
    songs = list(query.fetch())

    return flask.render_template('likes.html', songs=songs)

@app.route('/like', methods=['POST'])
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
                'song_art_image_thumbnail_url': song['song_art_image_thumbnail_url'],
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
