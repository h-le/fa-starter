"""Angular+Flask AppEngine Starter App"""
import os

import json
import rauth
import flask
import flask_cors
from dotenv import load_dotenv

import example

CLIENT_ID = os.getenv('GENIUS_CLIENT_ID')
CLIENT_SECRET = os.getenv('GENIUS_CLIENT_SECRET')

AUTHORIZE_URL = os.getenv('AUTHORIZE_URL')
ACCESS_TOKEN_URL = os.getenv('ACCESS_TOKEN_URL')
API_HOST = os.getenv('API_HOST')

# TODO To-be-removed
REDIRECT_URI = os.getenv('REDIRECT_URI')

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

# TODO Remove when removing user-level auth code
def oauth_decode(data):
    """Decode UTF-8 and JSON"""
    return json.loads(data.decode('utf-8', 'strict'))

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

@app.route('/login')
def login():
    """'Login' page for auth flow"""
    return '<a href="/auth">Authorize</a>'

@app.route('/auth')
def oauth_flow():
    """Redirect for user authorization"""
    genius = rauth.OAuth2Service(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        name='genius',
        authorize_url=AUTHORIZE_URL,
        access_token_url=ACCESS_TOKEN_URL,
        base_url=BASE_URL)

    redirect_uri = REDIRECT_URI

    # TODO Define a better state
    state = 'state'

    params = {
        'scope': 'me',
        'response_type': 'code',
        'redirect_uri': redirect_uri,
        'state': state,
    }

    authorize_url = genius.get_authorize_url(**params)

    return flask.redirect(authorize_url)

@app.route('/in')
def auth_redirect():
    """_Authorization successful_; display song lyrics to test access token"""
    genius = rauth.OAuth2Service(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        name='genius',
        authorize_url=AUTHORIZE_URL,
        access_token_url=ACCESS_TOKEN_URL,
        base_url=BASE_URL)

    session = genius.get_auth_session(
        data={
            'code': flask.request.args.get('code'),
            'redirect_uri': REDIRECT_URI,
            'grant_type': 'authorization_code',
        },
        decoder=oauth_decode)

    response = session.get(
        'songs/{id}'.format(id=1929408))

    lyrics = response.json()['response']['song']['embed_content']

    audio_snippet = response.json()['response']['song'] \
    ['apple_music_player_url']

    return flask.render_template(
        'song.html',
        lyrics=lyrics,
        audio_snippet=audio_snippet)

    """
    songs = []
    page_num = 0

    while True:
        response = session.get(
            'search',
            params={
                'q': 'beach house',
                'page': page_num})

        page_hits = response.json()['response']['hits']

        if not page_hits:
            break

        for hit in page_hits:
            if hit['type'] == 'song':
                if hit['result']['primary_artist']['name'].strip().lower() == \
                'beach house':
                    full_title = hit['result']['full_title']
                    songs.append(full_title)

        page_num = page_num + 1

    return flask.render_template('songs.html', songs=songs)
    """
