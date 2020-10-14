"""Utilities to Interact with BigQuery"""
from google.cloud import bigquery

db = bigquery.Client()
job_config = bigquery.QueryJobConfig(use_query_cache=False)

def get_listen_brainz(limit=150):
    """Get ListenBrainz music metadata, with additionally determined `time_of_day` field
    """
    query = f'''
        select
            artist,
            title,
            case
                when (hh between 4 and 11) then 'morning'
                when (hh between 12 and 16) then 'afternoon'
                when (hh between 17 and 21) then 'evening'
                when (hh > 21 or hh < 4) then 'night'
            end as time_of_day
        from (
            select
                listened_at,
                extract(hour from listened_at) as hh,
                artist_name as artist,
                track_name as title
            from
                `listenbrainz.listenbrainz.listen`
            limit
                {limit})
    '''
    results = db.query(query, job_config=job_config)
    return [list(row.values()) for row in results]

def add_recommendations():
    """Add recommendations that don't already exist
    """
    query = '''
        insert into
            `faf-starter.noon.recommendations`
        select
            t.*
        from (
            select
                album,
                apple_music_player_url,
                artist,
                embed_content,
                id,
                song_art_image_url,
                time_of_day,
                title,
                url
            from (
                select
                    *,
                    row_number() over(
                        partition by
                            id,
                            time_of_day
                        order by
                            1, 2
                    ) as rn
                from
                    `faf-starter.noon.t_recommendations`)
            where
                rn = 1) as t
        left outer join
            `faf-starter.noon.recommendations` as f
        on
            t.id = f.id
            and t.time_of_day = f.time_of_day
        where
            f.id is null
    '''
    db.query(query)
