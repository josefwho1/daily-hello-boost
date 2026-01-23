export interface Wallpaper {
  id: string;
  name: string;
  imageUrl: string;
  previewUrl: string;
}

export const wallpapers: Wallpaper[] = [
  {
    id: "wallpaper-1",
    name: "Reconnecting the World",
    imageUrl: "/wallpapers/wallpaper-1.png",
    previewUrl: "/wallpapers/wallpaper-1.png",
  },
  {
    id: "wallpaper-2",
    name: "One Hello with Orb",
    imageUrl: "/wallpapers/wallpaper-2.png",
    previewUrl: "/wallpapers/wallpaper-2.png",
  },
  {
    id: "wallpaper-3",
    name: "Super Remi",
    imageUrl: "/wallpapers/wallpaper-3.png",
    previewUrl: "/wallpapers/wallpaper-3.png",
  },
];
