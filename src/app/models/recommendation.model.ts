export interface Recommendation {
  album?: string;
  apple_music_player_url?: string;
  artist?: string;
  embed_content?: string;
  /** ID of song in Genius */
  id?: number;
  song_art_image_url?: string;
  time_of_day?: string;
  title?: string;
  /** URL to this song's page on genius.com */
  url?: string;
}
