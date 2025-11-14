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

	return db
}
