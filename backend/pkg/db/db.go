package db

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

func InitDB(dbURL string) *sql.DB {
	var err error
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to TimescaleDB: %s", err)
	}

	// Ensure album_tracks table exists (Temporary migration)
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS "album_tracks" (
			"id" SERIAL PRIMARY KEY,
			"album_id" INT NOT NULL,
			"track_id" INT NOT NULL,
			UNIQUE ("album_id", "track_id"),
			FOREIGN KEY ("album_id") REFERENCES "albums" ("id") ON DELETE CASCADE,
			FOREIGN KEY ("track_id") REFERENCES "tracks" ("id") ON DELETE CASCADE
		);
	`)
	if err != nil {
		log.Printf("Warning: Failed to ensure album_tracks table exists: %v", err)
	}

	return db
}
