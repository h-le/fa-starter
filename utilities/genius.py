"""Utilties to Interact with Genius API"""
import os
import json
import requests

def get_song(song_id):
    """Get song information via Genius for the given song ID."""
    token = os.getenv('GENIUS_ACCESS_TOKEN')
    headers = {'Authorization': 'Bearer {token}'.format(token=token)}
    url = 'https://api.genius.com/songs/{song_id}'.format(song_id=song_id)
    response = requests.get(url=url, headers=headers)
    song = json.loads(response.text)['response']['song']
    return {
        'album': song['album']['name'] if song['album'] else song['album'],
        'apple_music_player_url': song['apple_music_player_url'],
        'artist': song['primary_artist']['name'],
        'embed_content': song['embed_content'],
        'id': song['id'],
        'song_art_image_url': song['song_art_image_url'],
        'title': song['title'],
        'url': song['url'],
    }
