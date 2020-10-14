"""Utilties to Interact with Genius API""" 
import os
import json
import requests

token = os.getenv('GENIUS_ACCESS_TOKEN')
headers = {'Authorization': 'Bearer {token}'.format(token=token)}
url = 'https://api.genius.com'

def get_top_hit(artist, title):
    """Get Genius top search hit
    """
    response = requests.get(url=f'{url}/search?q={artist} {title}', headers=headers)
    hits = json.loads(response.text)['response']['hits']
    return hits[0]['result'] if hits else {}

def get_song(song_id):
    """Get Genius song data
    """
    response = requests.get(url=f'{url}/songs/{song_id}', headers=headers)
    return json.loads(response.text)['response']['song']
