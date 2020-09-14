"""Angular+Flask AppEngine Starter App"""
import os
import flask
import flask_cors
import firebase_admin
from firebase_admin import auth
from dotenv import load_dotenv

import example

app = firebase_admin.initialize_app()
load_dotenv()

# Set up the static folder to serve our angular client resources (*.js, *.css)
app = flask.Flask(__name__,
                  static_folder='dist/client',
                  static_url_path='/client/')

app.register_blueprint(example.blueprint)

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
    # TODO Method docstring
    """ tbd """
    id_token = flask.request.headers['Authorization'].split(' ').pop()

    try:
        user = auth.verify_id_token(id_token)
    except auth.InvalidIdTokenError:
        return flask.abort(401, 'Unauthorized: Invalid ID token')

    # TODO User authentication will be necessary for better song recommendation

    recommendation_placeholder = {
        "album": "Djesse, Vol. 3",
        "apple_music_player_url": "https://genius.com/songs/5751704/apple_music_player",
        "artist": "Jacob Collier",
        "embed_content": "<div id='rg_embed_link_5751704' class='rg_embed_link' data-song-id='5751704'>Read <a href='https://genius.com/Jacob-collier-sleeping-on-my-dreams-lyrics'>“Sleeping on My Dreams” by Jacob Collier</a> on Genius</div> <script crossorigin src='//genius.com/songs/5751704/embed.js'></script>",
        "id": 5751704,
        "song_art_image_url": "https://images.genius.com/b5f4dda4b90c2171639783c1f6eeeddb.1000x1000x1.jpg",
        "title": "Sleeping on My Dreams",
        "url": "https://genius.com/Jacob-collier-sleeping-on-my-dreams-lyrics"
    }

    return flask.jsonify(recommendation_placeholder)
