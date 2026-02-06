/**
 * Curated Unsplash Photo IDs by Category
 *
 * These photos are hand-picked for quality and versatility.
 * Using direct CDN URLs means no API key needed.
 * Format: https://images.unsplash.com/photo-{id}?w={width}&fit=crop&q=80
 */

export const UNSPLASH_PHOTOS = {
  // Business & Corporate
  business: [
    "1497366216548-37526070297c", // Modern office space
    "1497215842964-222b430dc094", // Business meeting
    "1560472354-b33ff0c44a43", // Team collaboration
    "1521737711867-e3b97375f902", // Office workspace
    "1556761175-b413da4baf72", // Professional handshake
    "1542744173-8e7e53415bb0", // Conference room
    "1552581234-26160f608093", // Laptop work
    "1600880292203-757bb62b4baf", // Video call meeting
  ],

  // Technology & Digital
  tech: [
    "1518770660439-4636190af475", // Circuit board
    "1526374965328-7f61d4dc18c5", // Phone mockup
    "1517077304055-6e89abbf09b0", // Code on screen
    "1550751827-4bd374c3f58b", // Laptop minimal
    "1558618666-fcd25c85cd64", // Tech startup
    "1504639725590-34d0984388bd", // Coding
    "1487058792275-0ad4aaf24ca7", // Developer workspace
    "1518432031352-d6fc5c10da5a", // Abstract tech
  ],

  // Nature & Outdoors
  nature: [
    "1506905925346-21bda4d32df4", // Mountains
    "1441974231531-c6227db76b6e", // Forest
    "1469474968028-56623f02e42e", // Sunset beach
    "1518173946687-a4c8892bbd9f", // Green leaves
    "1470071459604-3b5ec3a7fe05", // Waterfall
    "1507525428034-b723cf961d3e", // Ocean waves
    "1431794062232-2a99a5431c6c", // Lake reflection
    "1475924156734-c33439f3e589", // Misty forest
  ],

  // Food & Beverage
  food: [
    "1504674900247-0877df9cc836", // Healthy meal
    "1476224203421-9ac39bcb3327", // Coffee art
    "1493770348161-369560ae357d", // Restaurant dish
    "1565299507177-b0ac66763828", // Burger
    "1551024601-bec78aea704b", // Dessert
    "1546069901-ba9599a7e63c", // Breakfast spread
    "1515003197210-e0cd71810b5f", // Fresh ingredients
    "1529042410759-befb1204b468", // Bakery
  ],

  // People & Lifestyle
  people: [
    "1522202176988-66273c2fd55f", // Team meeting
    "1517841905240-472988babdf9", // Yoga
    "1507003211169-0a1dd7228f2d", // Portrait professional
    "1529156069898-49953e39b3ac", // Friends group
    "1580894742597-87bc8789db3d", // Remote work
    "1498050108023-c5249f4df085", // Creative work
    "1519389950473-47ba0277781c", // Study/learning
    "1552581234-26160f608093", // Collaboration
  ],

  // Abstract & Minimal
  abstract: [
    "1519681393784-d120267933ba", // Geometric
    "1557672172-298e090bd0f1", // Gradient
    "1518531933037-91b2f5f229cc", // Minimal lines
    "1507003211169-0a1dd7228f2d", // Clean shapes
    "1618005182384-a83a8bd57fbe", // Colorful abstract
    "1558618666-fcd25c85cd64", // Modern design
    "1506792006437-256b665541e2", // Patterns
    "1516383607781-913a19294fd1", // Minimalist
  ],

  // Health & Wellness
  wellness: [
    "1544367567-0f2fcb009e0b", // Meditation
    "1571019613454-1cb2f99b2d8b", // Running
    "1552196563-55cd4e45efb3", // Gym
    "1518611012118-696072aa579a", // Yoga pose
    "1506126613408-eca07ce68773", // Spa/relaxation
    "1545205597-3d9d02c29597", // Healthy lifestyle
    "1571019613454-1cb2f99b2d8b", // Fitness
    "1559839734-2b71ea197ec2", // Wellness space
  ],

  // Architecture & Interior
  architecture: [
    "1486325212027-8a89e2e23f1f", // Modern building
    "1497366216548-37526070297c", // Office interior
    "1600607687939-ce8a6c25118c", // Minimal interior
    "1600585154340-be6161a56a0c", // Living room
    "1503174971373-b1f69298e927", // Staircase
    "1545324418-cc1a3fa10c00", // Bedroom
    "1600566752355-35792bedcfea", // Kitchen
    "1560448204-e02f11c3d0e2", // Modern home
  ],

  // E-commerce & Products
  ecommerce: [
    "1523275335684-37898b6baf30", // Product setup
    "1491553895911-0055uj8e8d95", // Shopping
    "1472851294608-062f824d29cc", // Fashion
    "1441986300917-64674bd600d8", // Retail store
    "1556742049-0cfed4f6a45d", // Packaging
    "1515955656352-a1fa3ffcd111", // Minimalist product
    "1600607687644-c7171b42498f", // Lifestyle product
    "1542291026-7eec264c27ff", // Sneakers/fashion
  ],
} as const;

export type PhotoCategory = keyof typeof UNSPLASH_PHOTOS;

/**
 * Build an Unsplash CDN URL for a photo
 */
export function buildUnsplashUrl(
  photoId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: "crop" | "clamp" | "fill" | "scale";
  } = {}
): string {
  const { width = 800, quality = 80, fit = "crop" } = options;
  const params = new URLSearchParams({
    w: String(width),
    q: String(quality),
    fit,
  });
  if (options.height) {
    params.set("h", String(options.height));
  }
  return `https://images.unsplash.com/photo-${photoId}?${params.toString()}`;
}

/**
 * Get a random photo from a category
 */
export function getRandomPhoto(category: PhotoCategory): string {
  const photos = UNSPLASH_PHOTOS[category];
  const randomIndex = Math.floor(Math.random() * photos.length);
  return photos[randomIndex];
}

/**
 * Get a random photo URL from a category
 */
export function getRandomPhotoUrl(
  category: PhotoCategory,
  options?: Parameters<typeof buildUnsplashUrl>[1]
): string {
  return buildUnsplashUrl(getRandomPhoto(category), options);
}

/**
 * Get all photos for a category as URLs
 */
export function getCategoryPhotoUrls(
  category: PhotoCategory,
  options?: Parameters<typeof buildUnsplashUrl>[1]
): string[] {
  return UNSPLASH_PHOTOS[category].map((id) => buildUnsplashUrl(id, options));
}

/**
 * Format the curated photos for inclusion in AI prompts
 * Returns a structured reference that AI can use to embed images
 */
export function getPhotoReferenceForPrompt(): string {
  const categories = Object.keys(UNSPLASH_PHOTOS) as PhotoCategory[];

  let reference = `## Stock Photo Library (Unsplash)\n`;
  reference += `When you need images, use these curated Unsplash photo URLs:\n\n`;

  for (const category of categories) {
    const photos = UNSPLASH_PHOTOS[category].slice(0, 4); // First 4 per category
    reference += `**${category.charAt(0).toUpperCase() + category.slice(1)}:**\n`;
    for (const photoId of photos) {
      reference += `- https://images.unsplash.com/photo-${photoId}?w=800&fit=crop&q=80\n`;
    }
    reference += `\n`;
  }

  reference += `\nTo use: Simply embed these URLs in <img> tags with appropriate alt text.\n`;
  reference += `Example: <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&fit=crop&q=80" alt="Modern office space" />\n`;

  return reference;
}
