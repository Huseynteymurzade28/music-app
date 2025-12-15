"use client"

import React from 'react'
import { usePlayer } from '@/contexts/player-context'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Loader2,
  Music2,
  Heart,
} from 'lucide-react'
import Image from 'next/image'
import { likeTrack, unlikeTrack } from '@/lib/api'
import { toast } from 'sonner'
import { useState } from 'react'

interface LikeButtonProps {
  trackId: number
  initialIsLiked: boolean
}

function LikeButton({ trackId, initialIsLiked }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikeTrack(trackId)
        setIsLiked(false)
        toast.success('Removed from favorites')
      } else {
        await likeTrack(trackId)
        setIsLiked(true)
        toast.success('Added to favorites')
      }
    } catch {
      toast.error('Failed to update favorites')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${isLiked ? 'text-green-500 hover:text-green-600' : 'text-muted-foreground hover:text-foreground'}`}
      onClick={handleLikeToggle}
    >
      <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
    </Button>
  )
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function MusicPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    previousTrack,
  } = usePlayer()

  // Don't render if no track is selected
  if (!currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration
    seek(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100)
  }

  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 0.5 
      ? Volume1 
      : Volume2

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/10 shadow-2xl transition-all duration-300">
      {/* Progress bar at top - thin line with glow */}
      <div className="absolute -top-[2px] left-0 right-0 h-[2px] bg-transparent cursor-pointer group z-10">
        <div 
          className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute top-[-4px] left-0 right-0 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
          <Slider
            value={[progress]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="w-full h-full cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center justify-between h-24 px-6">
        {/* Left: Track Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0 group">
          {/* Album Art with hover effect */}
          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0 shadow-lg group-hover:shadow-primary/20 transition-all duration-300 group-hover:scale-105">
            {currentTrack.cover_image_url ? (
              <Image
                src={currentTrack.cover_image_url}
                alt={currentTrack.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Music2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Track Details */}
          <div className="min-w-0 flex flex-col gap-1">
            <h4 className="text-foreground font-semibold text-sm truncate hover:underline cursor-pointer">
              {currentTrack.title}
            </h4>
            <p className="text-muted-foreground text-xs truncate hover:text-foreground transition-colors cursor-pointer">
              {currentTrack.artist_name || `Artist #${currentTrack.artist_id}`}
            </p>
          </div>

          {/* Like Button */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <LikeButton 
              key={currentTrack.id} 
              trackId={currentTrack.id} 
              initialIsLiked={!!currentTrack.is_favorited} 
            />
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-6">
            {/* Skip Back */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-transparent hover:scale-110 transition-all"
              onClick={previousTrack}
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </Button>

            {/* Play/Pause */}
            <Button
              variant="default"
              size="icon"
              className="h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              onClick={togglePlay}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="h-7 w-7 ml-1 fill-current" />
              )}
            </Button>

            {/* Skip Forward */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-transparent hover:scale-110 transition-all"
              onClick={nextTrack}
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </Button>
          </div>

          {/* Time & Progress (Desktop) */}
          <div className="hidden md:flex items-center gap-3 w-full max-w-lg">
            <span className="text-xs text-muted-foreground w-10 text-right tabular-nums font-medium">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="flex-1 h-1.5 hover:h-2 transition-all"
            />
            <span className="text-xs text-muted-foreground w-10 tabular-nums font-medium">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume */}
        <div className="flex items-center justify-end gap-2 flex-1">
          <div className="hidden sm:flex items-center gap-3 group/volume bg-secondary/30 p-2 rounded-full hover:bg-secondary/50 transition-colors">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={toggleMute}
            >
              <VolumeIcon className="h-4 w-4" />
            </Button>
            <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-out">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-24 pr-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
