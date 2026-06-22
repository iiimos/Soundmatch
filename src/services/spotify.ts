import {
  makeRedirectUri,
  AuthRequest,
  exchangeCodeAsync,
  refreshAsync,
  ResponseType,
  TokenResponse,
} from 'expo-auth-session';
import * as SecureStoreNative from 'expo-secure-store';
import { Platform } from 'react-native';

const SecureStore = Platform.OS === 'web'
  ? {
      getItemAsync: async (key: string) => localStorage.getItem(key),
      setItemAsync: async (key: string, value: string) => localStorage.setItem(key, value),
      deleteItemAsync: async (key: string) => localStorage.removeItem(key),
    }
  : SecureStoreNative;
import { useStore } from '../store/useStore';
import { Track, UserProfile } from '../types';

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;

const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const REDIRECT_URI = Platform.OS === 'web'
  ? 'https://three-keys-kick.loca.lt'
  : makeRedirectUri({ scheme: 'soundmatch', path: 'spotify-auth-callback' });

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-top-read',
];

const API_BASE = 'https://api.spotify.com/v1';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  TOKEN_EXPIRY: 'spotify_token_expiry',
};

export function createAuthRequest(): AuthRequest {
  return new AuthRequest({
    clientId: CLIENT_ID,
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
    usePKCE: true,
  });
}

export async function handleWebAuthResponse(params: { access_token?: string; expires_in?: string }): Promise<void> {
  const { access_token, expires_in } = params;
  if (!access_token) throw new Error('No access token received');
  const expiryTime = Date.now() + (parseInt(expires_in ?? '3600', 10)) * 1000;

  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token);
  await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  useStore.getState().setTokens(access_token, '');
}

export async function exchangeCode(code: string, request: AuthRequest): Promise<void> {
  const tokenResult = await exchangeCodeAsync(
    {
      clientId: CLIENT_ID,
      code,
      redirectUri: REDIRECT_URI,
      extraParams: { code_verifier: request.codeVerifier! },
    },
    DISCOVERY,
  );

  await storeTokens(tokenResult);
}

async function storeTokens(tokenResult: TokenResponse): Promise<void> {
  const { accessToken, refreshToken, expiresIn } = tokenResult;
  const expiryTime = Date.now() + (expiresIn ?? 3600) * 1000;

  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
  await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

  useStore.getState().setTokens(accessToken, refreshToken ?? '');
}

export async function restoreSession(): Promise<boolean> {
  const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  const expiryStr = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);

  if (!accessToken) return false;

  const expiry = expiryStr ? parseInt(expiryStr, 10) : 0;
  if (Date.now() >= expiry) {
    return refreshAccessToken();
  }

  useStore.getState().setTokens(accessToken, refreshToken);
  return true;
}

export async function refreshAccessToken(): Promise<boolean> {
  const storedRefreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  if (!storedRefreshToken) return false;

  try {
    const tokenResult = await refreshAsync(
      { clientId: CLIENT_ID, refreshToken: storedRefreshToken },
      DISCOVERY,
    );
    await storeTokens(tokenResult);
    return true;
  } catch {
    await clearSession();
    return false;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
  useStore.getState().clearAuth();
}

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let token = useStore.getState().accessToken;

  const expiryStr = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
  const expiry = expiryStr ? parseInt(expiryStr, 10) : 0;
  if (Date.now() >= expiry) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new Error('Session expired');
    token = useStore.getState().accessToken;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new Error('Session expired');
    token = useStore.getState().accessToken;
    return fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  return response;
}

function mapTracks(items: SpotifyTrack[]): Track[] {
  return items
    .filter((track) => track && track.id)
    .map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a: { name: string }) => a.name).join(', '),
      albumCover: track.album?.images?.[0]?.url ?? '',
      previewUrl: track.preview_url ?? null,
      albumName: track.album?.name ?? '',
      genres: [],
      uri: track.uri,
    }));
}

async function searchTracks(query: string, limit: number, offset: number): Promise<SpotifyTrack[]> {
  const url = `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`;
  console.log('[Soundmatch] Search:', query, 'offset', offset);
  const response = await apiFetch(url);
  if (!response.ok) {
    const text = await response.text();
    console.log('[Soundmatch] Search failed', response.status, text);
    return [];
  }
  const data = await response.json();
  const items = data.tracks?.items ?? [];
  console.log('[Soundmatch] Search returned', items.length, 'tracks');
  return items;
}

export async function fetchRecommendations(options: {
  seedGenres?: string[];
  seedTrackIds?: string[];
  seedArtistIds?: string[];
  limit?: number;
}): Promise<Track[]> {
  const { seedGenres = [], seedArtistIds = [], limit = 20 } = options;

  // If we have artist seeds (from a playlist), use one of them as a search keyword.
  if (seedArtistIds.length > 0) {
    try {
      const artistId = seedArtistIds[Math.floor(Math.random() * seedArtistIds.length)];
      const response = await apiFetch(`/artists/${artistId}/top-tracks?market=US`);
      if (response.ok) {
        const data = await response.json();
        const tracks = mapTracks(data.tracks ?? []);
        if (tracks.length > 0) return tracks.sort(() => Math.random() - 0.5);
      }
    } catch (e) {
      console.log('[Soundmatch] Artist seed fetch failed', e);
    }
  }

  const genres = seedGenres.length > 0 ? seedGenres : ['pop', 'rock', 'hip-hop', 'electronic'];
  const genre = genres[Math.floor(Math.random() * genres.length)];
  const genreQuery = genre.replace(/-/g, ' ');
  const offset = Math.floor(Math.random() * 100);

  // Strategy 1: genre + year filter (precise but can be empty)
  const year = 2010 + Math.floor(Math.random() * 16);
  let items = await searchTracks(`genre:"${genreQuery}" year:${year}`, limit, offset % 100);

  // Strategy 2: genre filter only
  if (items.length === 0) {
    items = await searchTracks(`genre:"${genreQuery}"`, limit, offset % 100);
  }

  // Strategy 3: plain keyword (always returns something)
  if (items.length === 0) {
    items = await searchTracks(genreQuery, limit, offset % 50);
  }

  return mapTracks(items).sort(() => Math.random() - 0.5);
}

interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  preview_url: string | null;
  artists: { name: string; id: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
}

export async function fetchArtistDetails(
  artistId: string,
): Promise<{ bio: string; genres: string[]; followers: number; imageUrl: string | null }> {
  const response = await apiFetch(`/artists/${artistId}`);
  const data = await response.json();
  return {
    bio: '',
    genres: data.genres ?? [],
    followers: data.followers?.total ?? 0,
    imageUrl: data.images?.[0]?.url ?? null,
  };
}

export async function fetchTrackArtistId(trackId: string): Promise<string> {
  const response = await apiFetch(`/tracks/${trackId}`);
  const data = await response.json();
  return data.artists?.[0]?.id ?? '';
}

export async function fetchAvailableGenreSeeds(): Promise<string[]> {
  return [
    'acoustic', 'afrobeat', 'alt-rock', 'alternative', 'ambient',
    'blues', 'classical', 'club', 'country', 'dance',
    'deep-house', 'disco', 'drum-and-bass', 'dubstep', 'edm',
    'electro', 'electronic', 'emo', 'folk', 'funk',
    'garage', 'gospel', 'goth', 'grunge', 'hard-rock',
    'hardcore', 'hardstyle', 'heavy-metal', 'hip-hop', 'house',
    'indie', 'indie-pop', 'industrial', 'jazz', 'k-pop',
    'latin', 'metal', 'minimal-techno', 'opera', 'party',
    'piano', 'pop', 'punk', 'r-n-b', 'reggae',
    'reggaeton', 'rock', 'romance', 'sad', 'singer-songwriter',
    'ska', 'sleep', 'soul', 'synth-pop', 'techno',
    'trance', 'trap', 'trip-hop', 'world-music',
  ];
}

export async function batchFetchArtists(
  artistIds: string[],
): Promise<{ id: string; genres: string[]; name: string }[]> {
  const unique = [...new Set(artistIds)];
  const results: { id: string; genres: string[]; name: string }[] = [];

  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    const response = await apiFetch(`/artists?ids=${batch.join(',')}`);
    const data = await response.json();
    if (data.artists) {
      for (const artist of data.artists) {
        if (artist) {
          results.push({ id: artist.id, genres: artist.genres ?? [], name: artist.name });
        }
      }
    }
  }
  return results;
}

export async function fetchPlaylistTracks(
  playlistId: string,
): Promise<{ trackIds: string[]; artistIds: string[] }> {
  const response = await apiFetch(`/playlists/${playlistId}?fields=tracks.items(track(id,artists(id)))`);
  const data = await response.json();

  const trackIds: string[] = [];
  const artistIds: string[] = [];

  const items = data.tracks?.items ?? [];
  for (const item of items) {
    if (item.track?.id) {
      trackIds.push(item.track.id);
      if (item.track.artists?.[0]?.id) {
        artistIds.push(item.track.artists[0].id);
      }
    }
  }

  return {
    trackIds: trackIds.slice(0, 5),
    artistIds: [...new Set(artistIds)].slice(0, 5),
  };
}

export function parsePlaylistId(url: string): string | null {
  const patterns = [
    /spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
    /spotify:playlist:([a-zA-Z0-9]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function createPlaylist(
  userId: string,
  name: string,
  description: string = '',
  isPublic: boolean = false,
): Promise<string> {
  const response = await apiFetch(`/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      public: isPublic,
    }),
  });
  const data = await response.json();
  if (!data.id) throw new Error('Failed to create playlist');
  return data.id;
}

export async function addTracksToPlaylist(
  playlistId: string,
  uris: string[],
): Promise<void> {
  const batchSize = 100;
  for (let i = 0; i < uris.length; i += batchSize) {
    const batch = uris.slice(i, i + batchSize);
    const response = await apiFetch(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ uris: batch }),
    });
    if (!response.ok) {
      throw new Error('Failed to add tracks to playlist');
    }
  }
}

export async function exportToSpotify(tracks: Track[]): Promise<string> {
  const profile = useStore.getState().userProfile;
  if (!profile) throw new Error('Not authenticated');
  if (tracks.length === 0) throw new Error('No tracks to export');

  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const playlistName = `Soundmatch Discoveries - ${date}`;
  const description = `${tracks.length} tracks discovered with Soundmatch`;

  const playlistId = await createPlaylist(profile.id, playlistName, description);
  const uris = tracks.map((t) => t.uri);
  await addTracksToPlaylist(playlistId, uris);

  return playlistId;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await apiFetch('/me');
  const data = await response.json();
  const profile: UserProfile = {
    id: data.id,
    displayName: data.display_name ?? 'Spotify User',
    email: data.email ?? '',
    imageUrl: data.images?.[0]?.url ?? null,
  };
  useStore.getState().setUserProfile(profile);
  return profile;
}

export { REDIRECT_URI, DISCOVERY, API_BASE, apiFetch };
