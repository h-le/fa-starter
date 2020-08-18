"""Angular+Flask AppEnginer Starter App"""
import os

import json
import flask
import flask_cors
from dotenv import load_dotenv
from rauth import OAuth2Service

import example

CLIENT_ID = os.environ.get('GENIUS_CLIENT_ID')
CLIENT_SECRET = os.environ.get('GENIUS_CLIENT_SECRET')

AUTHORIZE_URL = 'https://api.genius.com/oauth/authorize'
ACCESS_TOKEN_URL = 'https://api.genius.com/oauth/token'
BASE_URL = 'https://api.genius.com/'

# TODO Get/set this another way
REDIRECT_URI = 'http://localhost:5000/in'

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
    genius = OAuth2Service(
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
        'state': state}

    authorize_url = genius.get_authorize_url(**params)

    return flask.redirect(authorize_url)

@app.route('/in')
def auth_redirect():
    """_Authorization successful_; display song lyrics to test acces token"""
    genius = OAuth2Service(
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
            'grant_type': 'authorization_code'},
        decoder=oauth_decode)

    response = session.get(
        'songs/{id}'.format(id=1929408))

    return response.json()['response']['song']['embed_content']
