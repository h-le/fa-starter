"""Cloud Function -- Adding Song Recommendations from ListenBrainz (BigQuery) + Genius API"""
import pandas as pd
import pandas_gbq as pd_gbq
from utilities import bigquery, common, genius

def get_song_metadata(artist, title, time_of_day):
    """Get (combined) top-hit song info via Genius API using ListenBrainz info
    """
    top_hit = genius.get_top_hit(artist, title)
    if not top_hit:
        return {}
    hit_artist, hit_title = common.replace_apostrophes(
        [top_hit['primary_artist']['name'], top_hit['title']]
    )
    if (artist.lower() != hit_artist.lower() or title.lower() != hit_title.lower()):
        return {}
    hit_song_id = top_hit['id']
    song = genius.get_song(hit_song_id)
    return {
        'album': song['album']['name'] if song['album'] else song['album'],
        'apple_music_player_url': song['apple_music_player_url'],
        'artist': song['primary_artist']['name'],
        'embed_content': song['embed_content'],
        'id': song['id'],
        'song_art_image_url': song['song_art_image_url'],
        'time_of_day': time_of_day,
        'title': song['title'],
        'url': song['url'],
    }

def entry_point(request): # pylint: disable=unused-argument
    """Cloud Function Entry Point
    """
    song_metadata_df = pd.DataFrame(
        [g for g in [get_song_metadata(*lbz) \
            for lbz in bigquery.get_listen_brainz()] \
        if g]
    )
    pd_gbq.to_gbq(
        song_metadata_df,
        'noon.t_recommendations',
        project_id='faf-starter',
        if_exists='replace'
    )
    bigquery.add_recommendations()
    return 'add-recommendations completed!'
