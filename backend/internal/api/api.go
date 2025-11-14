package api

import (
	"database/sql"
	"net/http"

	"github.com/gorilla/mux"
)

type Router struct {
	Db *sql.DB
}

func NewRouter(db *sql.DB) *Router {
	return &Router{
		Db: db,
	}
}

func (r *Router) NewRouter() *mux.Router {
	router := mux.NewRouter()
	router.HandleFunc("/api/health", r.HealthCheckHandler).Methods(http.MethodGet)

	return router
}

func (r *Router) HealthCheckHandler(w http.ResponseWriter, req *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
