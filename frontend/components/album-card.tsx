'use client'

import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Album } from '@/lib/types'

interface AlbumCardProps {
  album: Album
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/album/${album.id}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="cursor-pointer"
      >
        <Card className="overflow-hidden border-border bg-card/50 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="relative aspect-square w-full overflow-hidden group">
              <Image
                src={album.cover_url || "/placeholder.svg"}
                alt={`${album.title} by ${album.artist_name}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold truncate text-foreground">{album.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{album.artist_name}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
