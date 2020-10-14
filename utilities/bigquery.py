"""Utilities to Interact with BigQuery"""
import json
import random
from firebase_admin import auth
from google.cloud import bigquery

db = bigquery.Client()
job_config = bigquery.QueryJobConfig(use_query_cache=False)

def get_likes(id_token):
    """Gets liked songs for the logged in user."""
    uid = auth.verify_id_token(id_token)['uid']
    query = f'''
        select
            data
        from
            `faf-starter.firestore.likes_raw_latest`
        where
            json_value(data, '$.uid') = '{uid}'
    '''
    results = db.query(query, job_config=job_config)
    likes = [json.loads(row[0]) for row in results]
    return likes

def get_song(id_token, time_of_day, likes):
    """Get song recommendation for the logged in user."""
    uid = auth.verify_id_token(id_token)['uid'] # pylint: disable=unused-variable
    like_ids = ','.join(
        [str(like['id']) for like in likes if like['time_of_day'] == time_of_day]
    )
    likes_string = f'\nand id not in ({like_ids})' if like_ids else ''
    query = f'''
        select
            *
        from
            `faf-starter.noon.recommendations`
        where
            time_of_day = '{time_of_day}'{likes_string}
        limit
            25
    '''
    results = db.query(query, job_config=job_config)
    song = {f[0]: f[1] for f in random.choice(list(results)).items()}
    return song
