import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SupplySide",
    short_name: "SupplySide",
    description:
      "Direct and indirect purchasing, in one place, so you can run your business better.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9fa",
    theme_color: "#603f8a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
