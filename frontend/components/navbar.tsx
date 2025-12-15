"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Music, Menu, Bell, ChevronLeft, ChevronRight, LogIn, LogOut, User, Upload, Loader2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { logout, getProfile, uploadAvatar, ProfileResponse } from '@/lib/api'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { SearchBar } from '@/components/search-bar'

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<ProfileResponse | null>(null)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile()
    }
  }, [isAuthenticated])

  const loadProfile = async () => {
    try {
      const profile = await getProfile()
      setUser(profile)
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    try {
      await uploadAvatar(file)
      toast.success('Profile picture updated')
      await loadProfile()
      setShowProfileDialog(false)
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
          {/* Left side - Mobile menu & Navigation */}
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Mobile logo */}
            <div 
              className="flex items-center gap-2 lg:hidden cursor-pointer"
              onClick={() => router.push('/')}
            >
              <Music className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Musicly</span>
            </div>

            {/* Navigation arrows - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-muted"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-muted"
                onClick={() => router.forward()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Center - Search */}
          <SearchBar />

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              /* Loading skeleton */
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 ring-2 ring-border hover:ring-ring transition-all cursor-pointer">
                      <AvatarImage src={user?.avatar_url || "/diverse-user-avatars.png"} alt={user?.username || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user?.username && <p className="font-medium">{user.username}</p>}
                        {user?.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/login')}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar_url || "/diverse-user-avatars.png"} />
                <AvatarFallback className="text-2xl">{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Change Photo
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={user?.username || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}