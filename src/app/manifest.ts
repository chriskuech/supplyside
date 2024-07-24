import { MetadataRoute } from 'next'
import { colors } from '../lib/ux/theme'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SupplySide',
    short_name: 'SupplySide',
    description: 'Software for the supply side of your business',
    start_url: '/',
    display: 'standalone',
    background_color: colors.lightBackground,
    theme_color: colors.brandBlue,
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
