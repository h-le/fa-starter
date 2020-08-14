"""An example 'controller' with a basic route."""
import flask

blueprint = flask.Blueprint('example', __name__, url_prefix="/example")


@blueprint.route("/ping")
def hello():
    """A method that returns the string 'pong'."""
    return 'pong'
