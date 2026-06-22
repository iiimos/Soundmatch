export interface Track {
  id: string;
  name: string;
  artist: string;
  albumCover: string;
  previewUrl: string | null;
  albumName: string;
  genres: string[];
  uri: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  imageUrl: string | null;
}
