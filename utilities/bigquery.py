"""Utilities to Interact with BigQuery"""
import json
from firebase_admin import auth
from google.cloud import bigquery

db = bigquery.Client()

def get_likes(id_token):
    """Gets liked songs for the logged in user."""
    # TODO Guard against potential failures (?)
    uid = auth.verify_id_token(id_token)['uid']
    query = f'''
        select
            data
        from
            `faf-starter.firestore.likes_raw_latest`
        where
            json_value(data, '$.uid') = '{uid}'
    '''
    results = db.query(query)
    likes = [json.loads(row[0]) for row in results]
    return likes
