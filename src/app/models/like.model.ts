export interface Like {
  album?: string;
  apple_music_player_url?: string;
  artist?: string;
  email?: string;
  embed_content?: string;
  /** ID of song in Genius */
  id?: number;
  song_art_image_url?: string;
  title?: string;
  /** Firebase ID of user that liked this song */
  uid?: string;
  url?: string;
}
