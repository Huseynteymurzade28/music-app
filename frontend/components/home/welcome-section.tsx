"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { usePlaylist } from '@/contexts/playlist-context'
import { useAuth } from '@/lib/auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export function WelcomeSection() {
  const [greeting, setGreeting] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<string | null>(null)
  const { createPlaylist } = usePlaylist()
  const { isAuthenticated, requireAuth } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [playlistName, setPlaylistName] = useState('')

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) {
        setGreeting('Good morning')
      } else if (hour < 18) {
        setGreeting('Good afternoon')
      } else {
        setGreeting('Good evening')
      }
      
      setCurrentTime(new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }))
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const handleCreatePlaylist = async () => {
    if (!requireAuth()) return
    setShowDialog(true)
  }

  const handleSubmit = async () => {
    if (!playlistName.trim()) return
    
    setIsCreating(true)
    try {
      await createPlaylist(playlistName)
      setPlaylistName('')
      setShowDialog(false)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    setPlaylistName('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      handleDialogClose()
    }
  }

  // Don't render until mounted to avoid hydration mismatch
  if (greeting === null || currentTime === null) {
    return (
      <section className="mb-8">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-primary/20 via-accent/20 to-chart-4/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-chart-4/10 animate-pulse" />
          <CardContent className="relative z-10 p-8">
            <p className="text-sm text-muted-foreground mb-1">&nbsp;</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome
            </h1>
            <p className="text-muted-foreground max-w-xl mb-6">
              Ready to discover something new? Explore your personalized recommendations and favorite tracks.
            </p>
            {isAuthenticated && (
              <Button 
                onClick={handleCreatePlaylist}
                disabled={isCreating}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Playlist
              </Button>
            )}
          </CardContent>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-chart-4/20 rounded-full blur-3xl" />
        </Card>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-primary/20 via-accent/20 to-chart-4/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-chart-4/10 animate-pulse" />
        <CardContent className="relative z-10 p-8">
          <p className="text-sm text-muted-foreground mb-1">{currentTime}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {greeting}
          </h1>
          <p className="text-muted-foreground max-w-xl mb-6">
            Ready to discover something new? Explore your personalized recommendations and favorite tracks.
          </p>
          {isAuthenticated && (
            <Button 
              onClick={handleCreatePlaylist}
              disabled={isCreating}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Playlist
            </Button>
          )}
        </CardContent>
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-chart-4/20 rounded-full blur-3xl" />
      </Card>

      {/* Create Playlist Dialog */}
      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Playlist name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDialogClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating || !playlistName.trim()}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
