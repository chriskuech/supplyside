import { MetadataRoute } from 'next'
import theme from '../lib/ux/theme'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SupplySide',
    short_name: 'SupplySide',
    description: 'Software for the supply side of your business',
    start_url: '/',
    display: 'standalone',
    background_color: theme.light.palette.background.default,
    theme_color: theme.light.palette.primary.main,
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
