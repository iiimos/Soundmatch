import { create } from 'zustand';
import { Track, UserProfile } from '../types';

interface TasteProfile {
  seedGenres: string[];
  seedPlaylistUrl: string;
  seedTrackIds: string[];
  seedArtistIds: string[];
}

interface AppState {
  // Auth
  accessToken: string | null;
  refreshToken: string | null;
  userProfile: UserProfile | null;
  setTokens: (access: string, refresh: string) => void;
  setUserProfile: (profile: UserProfile) => void;
  clearAuth: () => void;

  // Library
  likedTracks: Track[];
  dislikedTrackIds: string[];
  addLikedTrack: (track: Track) => void;
  addDislikedTrackId: (id: string) => void;
  removeLikedTrack: (id: string) => void;

  // Taste Profile
  tasteProfile: TasteProfile;
  tasteVersion: number;
  setTasteGenres: (genres: string[]) => void;
  setTastePlaylistUrl: (url: string) => void;
  setTasteSeeds: (trackIds: string[], artistIds: string[]) => void;
  clearTasteSeeds: () => void;

  // Discovery
  discoveryGenres: string[];
  playlistUrl: string;
  setDiscoveryGenres: (genres: string[]) => void;
  setPlaylistUrl: (url: string) => void;

  // Recommendations
  recommendations: Track[];
  setRecommendations: (tracks: Track[]) => void;
  clearRecommendations: () => void;
}

export const useStore = create<AppState>((set) => ({
  accessToken: null,
  refreshToken: null,
  userProfile: null,
  setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  clearAuth: () => set({ accessToken: null, refreshToken: null, userProfile: null }),

  likedTracks: [],
  dislikedTrackIds: [],
  addLikedTrack: (track) =>
    set((state) => ({
      likedTracks: state.likedTracks.some((t) => t.id === track.id)
        ? state.likedTracks
        : [track, ...state.likedTracks],
    })),
  addDislikedTrackId: (id) =>
    set((state) => ({
      dislikedTrackIds: state.dislikedTrackIds.includes(id)
        ? state.dislikedTrackIds
        : [...state.dislikedTrackIds, id],
    })),
  removeLikedTrack: (id) =>
    set((state) => ({
      likedTracks: state.likedTracks.filter((t) => t.id !== id),
    })),

  tasteProfile: {
    seedGenres: ['pop', 'rock', 'hip-hop', 'electronic', 'r-n-b'],
    seedPlaylistUrl: '',
    seedTrackIds: [],
    seedArtistIds: [],
  },
  tasteVersion: 0,
  setTasteGenres: (genres) =>
    set((state) => ({
      tasteProfile: { ...state.tasteProfile, seedGenres: genres, seedTrackIds: [], seedArtistIds: [] },
      tasteVersion: state.tasteVersion + 1,
      recommendations: [],
    })),
  setTastePlaylistUrl: (url) =>
    set((state) => ({
      tasteProfile: { ...state.tasteProfile, seedPlaylistUrl: url },
    })),
  setTasteSeeds: (trackIds, artistIds) =>
    set((state) => ({
      tasteProfile: { ...state.tasteProfile, seedTrackIds: trackIds, seedArtistIds: artistIds, seedGenres: [] },
      tasteVersion: state.tasteVersion + 1,
      recommendations: [],
    })),
  clearTasteSeeds: () =>
    set((state) => ({
      tasteProfile: { ...state.tasteProfile, seedTrackIds: [], seedArtistIds: [], seedPlaylistUrl: '' },
    })),

  discoveryGenres: ['pop', 'rock', 'hip-hop', 'electronic', 'r-n-b'],
  playlistUrl: '',
  setDiscoveryGenres: (genres) => set({ discoveryGenres: genres }),
  setPlaylistUrl: (url) => set({ playlistUrl: url }),

  recommendations: [],
  setRecommendations: (tracks) => set({ recommendations: tracks }),
  clearRecommendations: () => set({ recommendations: [] }),
}));
