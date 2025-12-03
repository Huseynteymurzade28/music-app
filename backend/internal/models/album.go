package models

import "time"

type Album struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	ArtistID    int        `json:"artist_id"`
	CoverURL    *string    `json:"cover_url,omitempty"`
	ReleaseDate *time.Time `json:"release_date,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

type AlbumWithTracks struct {
	Album
	ArtistName string            `json:"artist_name"`
	Tracks     []TrackWithArtist `json:"tracks"`
}
