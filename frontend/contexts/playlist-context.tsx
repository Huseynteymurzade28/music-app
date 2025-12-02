'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Playlist, PlaylistWithTracks } from '@/lib/types'
import * as api from '@/lib/api'
import { isAuthenticated } from '@/lib/api'

interface PlaylistContextType {
  playlists: Playlist[]
  selectedPlaylist: PlaylistWithTracks | null
  isLoading: boolean
  error: string | null
  fetchUserPlaylists: () => Promise<void>
  createPlaylist: (title: string, privacy?: string) => Promise<Playlist>
  selectPlaylist: (playlistId: number) => Promise<void>
  updatePlaylist: (playlistId: number, title?: string, privacy?: string) => Promise<void>
  deletePlaylist: (playlistId: number) => Promise<void>
  addTrackToPlaylist: (playlistId: number, trackId: number) => Promise<void>
  addTracksToPlaylist: (playlistId: number, trackIds: number[]) => Promise<void>
  removeTrackFromPlaylist: (playlistId: number, trackId: number) => Promise<void>
  clearError: () => void
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined)

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistWithTracks | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchUserPlaylists = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getUserPlaylists()
      setPlaylists(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch playlists'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load when authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      fetchUserPlaylists()
    }
  }, [fetchUserPlaylists])

  const createPlaylistHandler = useCallback(
    async (title: string, privacy = 'public') => {
      setError(null)
      try {
        const newPlaylist = await api.createPlaylist(title, privacy)
        setPlaylists((prev) => [newPlaylist, ...prev])
        return newPlaylist
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create playlist'
        setError(message)
        throw err
      }
    },
    []
  )

  const selectPlaylist = useCallback(async (playlistId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getPlaylist(playlistId)
      setSelectedPlaylist(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch playlist'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePlaylistHandler = useCallback(
    async (playlistId: number, title?: string, privacy?: string) => {
      setError(null)
      try {
        const updated = await api.updatePlaylist(playlistId, title, privacy)
        setPlaylists((prev) =>
          prev.map((p) => (p.id === playlistId ? { ...p, ...updated } : p))
        )
        if (selectedPlaylist?.id === playlistId) {
          setSelectedPlaylist({
            ...selectedPlaylist,
            ...updated,
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update playlist'
        setError(message)
        throw err
      }
    },
    [selectedPlaylist]
  )

  const deletePlaylistHandler = useCallback(async (playlistId: number) => {
    setError(null)
    try {
      await api.deletePlaylist(playlistId)
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId))
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete playlist'
      setError(message)
      throw err
    }
  }, [selectedPlaylist])

  const addTrackHandler = useCallback(
    async (playlistId: number, trackId: number) => {
      setError(null)
      try {
        await api.addTrackToPlaylist(playlistId, trackId)
        // Only refresh if we have selected playlist
        if (selectedPlaylist?.id === playlistId) {
          try {
            const updated = await api.getPlaylist(playlistId)
            setSelectedPlaylist(updated)
          } catch (refreshErr) {
            // Refresh failed, but track was added successfully
            console.warn('Failed to refresh playlist:', refreshErr)
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add track'
        setError(message)
        throw err
      }
    },
    [selectedPlaylist]
  )

  const addTracksHandler = useCallback(
    async (playlistId: number, trackIds: number[]) => {
      setError(null)
      try {
        // Add all tracks sequentially
        for (const trackId of trackIds) {
          try {
            await api.addTrackToPlaylist(playlistId, trackId)
          } catch (err) {
            // Continue adding other tracks even if one fails
            console.error(`Failed to add track ${trackId}:`, err)
          }
        }
        
        if (selectedPlaylist?.id === playlistId) {
          // Refresh the selected playlist to get updated tracks
          try {
            const updated = await api.getPlaylist(playlistId)
            setSelectedPlaylist(updated)
          } catch (refreshErr) {
            // Refresh failed, but tracks were added successfully
            console.warn('Failed to refresh playlist:', refreshErr)
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add tracks'
        setError(message)
        throw err
      }
    },
    [selectedPlaylist]
  )

  const removeTrackHandler = useCallback(
    async (playlistId: number, trackId: number) => {
      setError(null)
      try {
        await api.removeTrackFromPlaylist(playlistId, trackId)
        if (selectedPlaylist?.id === playlistId) {
          setSelectedPlaylist((prev) =>
            prev
              ? {
                  ...prev,
                  tracks: prev.tracks.filter((t) => t.id !== trackId),
                }
              : null
          )
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove track'
        setError(message)
        throw err
      }
    },
    [selectedPlaylist]
  )

  const value: PlaylistContextType = {
    playlists,
    selectedPlaylist,
    isLoading,
    error,
    fetchUserPlaylists,
    createPlaylist: createPlaylistHandler,
    selectPlaylist,
    updatePlaylist: updatePlaylistHandler,
    deletePlaylist: deletePlaylistHandler,
    addTrackToPlaylist: addTrackHandler,
    addTracksToPlaylist: addTracksHandler,
    removeTrackFromPlaylist: removeTrackHandler,
    clearError,
  }

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>
}

export function usePlaylist() {
  const context = useContext(PlaylistContext)
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider')
  }
  return context
}
