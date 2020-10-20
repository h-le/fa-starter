"""Angular, Flask, & GAE Starter App"""
import os
import json
import flask
import flask_cors
from dotenv import load_dotenv
from utilities import firebase, bigquery

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
    """Recommends a song via Genius API to the verified user"""
    id_token = flask.request.headers['Authorization'].split(' ').pop()
    if not firebase.logged_in(id_token):
        return flask.abort(401, 'User not logged in!')
    time_of_day = flask.request.args.get('time_of_day')
    likes = bigquery.get_likes(id_token)
    song = bigquery.get_song(time_of_day, likes)
    return flask.jsonify(song)


@app.route('/_like', methods=['GET'])
def get_likes():
    """Gets verified user's liked songs"""
    id_token = flask.request.headers['Authorization'].split(' ').pop()
    if not firebase.logged_in(id_token):
        return flask.abort(401, 'User not logged in!')
    likes = bigquery.get_likes(id_token)
    return flask.jsonify(likes)


@app.route('/_like', methods=['POST'])
def post_like():
    """Adds song to verified user's list of liked songs."""
    id_token = flask.request.headers['Authorization'].split(' ').pop()
    if not firebase.logged_in(id_token):
        return flask.abort(401, 'User not logged in!')
    song = flask.request.get_json()
    like = firebase.like_song(id_token, song)
    return flask.jsonify(like)


@app.route('/_like', methods=['DELETE'])
def delete_like():
    """Deletes song from verified user's list of liked songs."""
    id_token = flask.request.headers['Authorization'].split(' ').pop()
    if not firebase.logged_in(id_token):
        return flask.abort(401, 'User not logged in!')
    like = json.loads(flask.request.args.get('data'))
    unlike = firebase.unlike_song(like)
    return flask.jsonify(unlike)
