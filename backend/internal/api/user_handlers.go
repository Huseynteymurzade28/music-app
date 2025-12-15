package api

import (
	"log/slog"
	"music-app/backend/internal/middleware"
	"music-app/backend/internal/models"
	"music-app/backend/internal/repository"
	"music-app/backend/internal/utils"
	"music-app/backend/pkg/api_errors"
	"net/http"
	"strings"
)

// MeHandler godoc
// @Summary Get Current User
// @Description Retrieves the profile of the currently authenticated user
// @Tags Protected
// @Accept  json
// @Produce  json
// @Security ApiKeyAuth
// @Success 200 {object} models.UserProfileResponse
// @Failure 401 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /api/me [get]
func (r *Router) MeHandler(w http.ResponseWriter, req *http.Request) {
	userID, ok := middleware.GetUserID(req.Context())
	if !ok {
		utils.JSONError(w, api_errors.ErrUnauthorized, "no user in context", http.StatusUnauthorized)
		return
	}
	repo := repository.NewRepository(r.Db)
	u, err := repo.GetUserByID(userID)
	if err != nil {
		utils.JSONError(w, api_errors.ErrUserNotFound, "user not found", http.StatusNotFound)
		return
	}
	utils.JSONSuccess(w, models.UserProfileResponse{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		Role:      u.Role,
		AvatarURL: u.AvatarURL,
	}, http.StatusOK)
}

// GetUsersHandler godoc
// @Summary Get all users
// @Description Retrieves all users (for admin/artist selection)
// @Tags Protected
// @Accept  json
// @Produce  json
// @Security ApiKeyAuth
// @Success 200 {array} models.User
// @Failure 500 {object} utils.ErrorResponse
// @Router /api/users [get]
func (r *Router) GetUsersHandler(w http.ResponseWriter, req *http.Request) {
	repo := repository.NewRepository(r.Db)
	users, err := repo.GetAllUsers()
	if err != nil {
		utils.JSONError(w, api_errors.ErrInternalServer, "failed to get users", http.StatusInternalServerError)
		return
	}
	utils.JSONSuccess(w, users, http.StatusOK)
}

// SearchUsersHandler godoc
// @Summary Search users
// @Description Search for users (artists) by username
// @Tags Public
// @Accept  json
// @Produce  json
// @Param q query string true "Search query"
// @Success 200 {array} models.User
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /api/search/users [get]
func (r *Router) SearchUsersHandler(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query().Get("q")
	if query == "" {
		utils.JSONError(w, api_errors.ErrBadRequest, "search query is required", http.StatusBadRequest)
		return
	}

	repo := repository.NewRepository(r.Db)
	users, err := repo.SearchUsers(query)
	if err != nil {
		utils.JSONError(w, api_errors.ErrInternalServer, "failed to search users", http.StatusInternalServerError)
		return
	}

	if users == nil {
		users = []models.User{}
	}

	utils.JSONSuccess(w, users, http.StatusOK)
}

// UploadAvatarHandler godoc
// @Summary Upload User Avatar
// @Description Upload a profile picture for the user
// @Tags Protected
// @Accept multipart/form-data
// @Produce json
// @Security ApiKeyAuth
// @Param avatar formData file true "Avatar Image (Max 10MB)"
// @Success 200 {object} models.UserProfileResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /api/profile/avatar [post]
func (r *Router) UploadAvatarHandler(w http.ResponseWriter, req *http.Request) {
	// Parse multipart form with size limit
	if err := req.ParseMultipartForm(MaxUploadSize); err != nil {
		utils.JSONError(w, api_errors.ErrBadRequest, "failed to parse form", http.StatusBadRequest)
		return
	}

	userID, ok := middleware.GetUserID(req.Context())
	if !ok {
		utils.JSONError(w, api_errors.ErrUnauthorized, "no user in context", http.StatusUnauthorized)
		return
	}

	// Get avatar file
	file, header, err := req.FormFile("avatar")
	if err != nil {
		utils.JSONError(w, api_errors.ErrBadRequest, "avatar is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate content type
	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		utils.JSONError(w, api_errors.ErrBadRequest, "only image files are allowed", http.StatusBadRequest)
		return
	}

	// Sanitize filename
	sanitizedFilename := sanitizeFilename(header.Filename)

	// Upload to MinIO
	avatarURL, err := r.Storage.UploadImage(req.Context(), file, header.Size, contentType, sanitizedFilename)
	if err != nil {
		slog.Error("Failed to upload avatar",
			"error", err,
			"user_id", userID,
			"filename", sanitizedFilename)
		utils.JSONError(w, api_errors.ErrInternalServer, "failed to upload avatar image", http.StatusInternalServerError)
		return
	}

	// Update user avatar URL
	repo := repository.NewRepository(r.Db)
	err = repo.UpdateUserAvatar(userID, avatarURL)
	if err != nil {
		slog.Error("Failed to update user avatar", "error", err)
		utils.JSONError(w, api_errors.ErrInternalServer, "failed to update user profile", http.StatusInternalServerError)
		return
	}

	// Return updated profile
	user, err := repo.GetUserByID(userID)
	if err != nil {
		utils.JSONError(w, api_errors.ErrInternalServer, "failed to get updated profile", http.StatusInternalServerError)
		return
	}

	utils.JSONSuccess(w, models.UserProfileResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Role:      user.Role,
		AvatarURL: user.AvatarURL,
	}, http.StatusOK)
}
