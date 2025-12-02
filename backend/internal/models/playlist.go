package models

import "time"

type Playlist struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	CreatorID int       `json:"creator_id"`
	CoverURL  *string   `json:"cover_url,omitempty"`
	Privacy   string    `json:"privacy"` // "public" or "private"
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at,omitempty"`
}

type PlaylistWithTracks struct {
	ID        int               `json:"id"`
	Title     string            `json:"title"`
	CreatorID int               `json:"creator_id"`
	CoverURL  *string           `json:"cover_url,omitempty"`
	Privacy   string            `json:"privacy"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at,omitempty"`
	Tracks    []TrackWithArtist `json:"tracks"`
}

type PlaylistTrack struct {
	ID         int       `json:"id"`
	PlaylistID int       `json:"playlist_id"`
	TrackID    int       `json:"track_id"`
	AddedAt    time.Time `json:"added_at"`
}

type CreatePlaylistRequest struct {
	Title   string `json:"title" binding:"required"`
	Privacy string `json:"privacy"`
}

type UpdatePlaylistRequest struct {
	Title   string `json:"title"`
	Privacy string `json:"privacy"`
}

type AddTrackToPlaylistRequest struct {
	TrackID int `json:"track_id" binding:"required"`
}

type PlaylistResponse struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	CreatorID int       `json:"creator_id"`
	CoverURL  *string   `json:"cover_url,omitempty"`
	Privacy   string    `json:"privacy"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at,omitempty"`
}
