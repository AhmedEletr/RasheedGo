// src/utils/dataLoader.js
import RASHEED_DATA from '../constants/rasheeddata.json';

/**
 * Transform rasheeddata.json item to app-compatible format
 * Extracts only English and Arabic fields
 */

function transformHotel(item) {
  return {
    id: item.id,
    category: 'hotel',
    type: 'hotel',
    nameAr: item.name?.ar || '',
    nameEn: item.name?.en || '',
    titleAr: item.name?.ar || '',
    titleEn: item.name?.en || '',
    descAr: item.short_description?.ar || '',
    descEn: item.short_description?.en || '',
    storyAr: item.story?.ar || '',
    storyEn: item.story?.en || '',
    addressAr: item.address?.ar || '',
    addressEn: item.address?.en || '',
    locationAr: item.address?.ar || '',
    locationEn: item.address?.en || '',
    stars: item.stars || 0,
    rating: item.rating?.value?.toString() || '0',
    ratingValue: item.rating?.value || 0,
    reviews: item.rating?.reviews_count || 0,
    images: item.images?.map(img => img.url) || [],
    image: item.images?.[0]?.url || 'https://picsum.photos/id/1050/900/600',
    highlightsAr: item.highlighted_features?.ar || [],
    highlightsEn: item.highlighted_features?.en || [],
    openTimeAr: item.opening_hours?.ar || '',
    openTimeEn: item.opening_hours?.en || '',
    price: null,
    pricePerNight: null,
    searchTags: item.search_tags?.en || [],
    searchTagsAr: item.search_tags?.ar || [],
    isFav: false,
  };
}

function transformRestaurant(item) {
  return {
    id: item.id,
    category: item.category || 'restaurant',
    type: item.category || 'restaurant',
    nameAr: item.name?.ar || '',
    nameEn: item.name?.en || '',
    titleAr: item.name?.ar || '',
    titleEn: item.name?.en || '',
    descAr: item.short_description?.ar || '',
    descEn: item.short_description?.en || '',
    storyAr: item.story?.ar || '',
    storyEn: item.story?.en || '',
    addressAr: item.address?.ar || '',
    addressEn: item.address?.en || '',
    locationAr: item.address?.ar || '',
    locationEn: item.address?.en || '',
    stars: item.stars || 4,
    rating: item.rating?.value?.toString() || '0',
    ratingValue: item.rating?.value || 0,
    reviews: item.rating?.reviews_count || 0,
    images: item.images?.map(img => img.url) || [],
    image: item.images?.[0]?.url || 'https://picsum.photos/id/1060/900/600',
    highlightsAr: item.highlighted_features?.ar || [],
    highlightsEn: item.highlighted_features?.en || [],
    openTimeAr: item.opening_hours?.ar || '',
    openTimeEn: item.opening_hours?.en || '',
    cuisineAr: item.type?.ar || '',
    cuisineEn: item.type?.en || '',
    ticketPriceAr: '',
    ticketPriceEn: '',
    searchTags: item.search_tags?.en || [],
    searchTagsAr: item.search_tags?.ar || [],
    isFav: false,
  };
}

function transformPlace(item) {
  return {
    id: item.id,
    category: item.category || 'place',
    type: item.category || 'place',
    nameAr: item.name?.ar || '',
    nameEn: item.name?.en || '',
    titleAr: item.name?.ar || '',
    titleEn: item.name?.en || '',
    descAr: item.short_description?.ar || '',
    descEn: item.short_description?.en || '',
    storyAr: item.story?.ar || '',
    storyEn: item.story?.en || '',
    addressAr: item.address?.ar || '',
    addressEn: item.address?.en || '',
    locationAr: item.address?.ar || '',
    locationEn: item.address?.en || '',
    tagAr: item.type?.ar || 'معلم',
    tagEn: item.type?.en || 'Landmark',
    rating: item.rating?.value?.toString() || '0',
    ratingValue: item.rating?.value || 0,
    reviews: item.rating?.reviews_count || 0,
    images: item.images?.map(img => img.url) || [],
    image: item.images?.[0]?.url || 'https://picsum.photos/id/1040/900/600',
    highlightsAr: item.highlighted_features?.ar || [],
    highlightsEn: item.highlighted_features?.en || [],
    openTimeAr: item.opening_hours?.ar || '',
    openTimeEn: item.opening_hours?.en || '',
    ticketPriceAr: '',
    ticketPriceEn: '',
    searchTags: item.search_tags?.en || [],
    searchTagsAr: item.search_tags?.ar || [],
    isFav: false,
  };
}

function transformEvent(item) {
  return {
    id: item.id,
    category: 'event',
    type: 'event',
    nameAr: item.name?.ar || '',
    nameEn: item.name?.en || '',
    titleAr: item.name?.ar || '',
    titleEn: item.name?.en || '',
    descAr: item.short_description?.ar || '',
    descEn: item.short_description?.en || '',
    storyAr: item.story?.ar || '',
    storyEn: item.story?.en || '',
    addressAr: item.address?.ar || '',
    addressEn: item.address?.en || '',
    locationAr: item.address?.ar || '',
    locationEn: item.address?.en || '',
    dateAr: item.date?.ar || '',
    dateEn: item.date?.en || '',
    ticketPriceAr: item.ticket_price?.ar || '',
    ticketPriceEn: item.ticket_price?.en || '',
    images: item.images?.map(img => img.url) || [],
    image: item.images?.[0]?.url || 'https://picsum.photos/id/1018/900/600',
    highlightsAr: item.highlighted_features?.ar || [],
    highlightsEn: item.highlighted_features?.en || [],
    searchTags: item.search_tags?.en || [],
    searchTagsAr: item.search_tags?.ar || [],
    isFav: false,
  };
}

// Cache transformed data
let cachedData = null;

function loadAndTransformData() {
  if (cachedData) return cachedData;

  const hotels = (RASHEED_DATA.hotels || []).map(transformHotel);
  const restaurants = (RASHEED_DATA.restaurants || []).map(transformRestaurant);
  const cafes = (RASHEED_DATA.cafes || []).map(transformRestaurant);
  const places = (RASHEED_DATA.places || []).map(transformPlace);
  const events = (RASHEED_DATA.events || []).map(transformEvent);

  // Merge restaurants and cafes
  const allRestaurants = [...restaurants, ...cafes];

  cachedData = {
    hotels,
    restaurants: allRestaurants,
    places,
    events,
    all: [...hotels, ...allRestaurants, ...places, ...events],
  };

  return cachedData;
}

/**
 * Get all hotels (3 items)
 */
export function getHotels() {
  const data = loadAndTransformData();
  return data.hotels;
}

/**
 * Get all restaurants + cafes (18 items)
 */
export function getRestaurants() {
  const data = loadAndTransformData();
  return data.restaurants;
}

/**
 * Get all places (33 items)
 */
export function getPlaces() {
  const data = loadAndTransformData();
  return data.places;
}

/**
 * Get all events (12 items)
 */
export function getEvents() {
  const data = loadAndTransformData();
  return data.events;
}

/**
 * Get all items across all categories (66 items)
 */
export function getAllItems() {
  const data = loadAndTransformData();
  return data.all;
}

/**
 * Get items by category
 */
export function getItemsByCategory(category) {
  const data = loadAndTransformData();
  switch (category) {
    case 'hotel':
      return data.hotels;
    case 'restaurant':
    case 'cafe':
      return data.restaurants;
    case 'place':
      return data.places;
    case 'event':
      return data.events;
    default:
      return data.all;
  }
}

/**
 * Get item by ID
 */
export function getItemById(id) {
  const data = loadAndTransformData();
  return data.all.find(item => item.id === id);
}

/**
 * Get top rated items for home page
 */
export function getTopRatedPlaces(limit = 3) {
  const places = getPlaces();
  return places
    .filter(p => p.ratingValue > 0)
    .sort((a, b) => b.ratingValue - a.ratingValue)
    .slice(0, limit);
}

export function getTopRatedHotels(limit = 3) {
  const hotels = getHotels();
  return hotels
    .filter(h => h.ratingValue > 0)
    .sort((a, b) => b.ratingValue - a.ratingValue)
    .slice(0, limit);
}

export function getTopRatedRestaurants(limit = 3) {
  const restaurants = getRestaurants();
  return restaurants
    .filter(r => r.ratingValue > 0)
    .sort((a, b) => b.ratingValue - a.ratingValue)
    .slice(0, limit);
}

/**
 * Get featured slides for home carousel (top 3 highest rated places)
 */
export function getFeaturedSlides() {
  const places = getPlaces();
  const topPlaces = places
    .filter(p => p.ratingValue >= 4.5)
    .sort((a, b) => b.ratingValue - a.ratingValue)
    .slice(0, 3);

  return topPlaces.map(place => ({
    id: place.id,
    tagAr: place.tagAr,
    tagEn: place.tagEn,
    titleAr: place.titleAr,
    titleEn: place.titleEn,
    subtitleAr: place.descAr,
    subtitleEn: place.descEn,
    image: place.image,
  }));
}

/**
 * Get all search tags (English and Arabic only)
 */
export function getAllSearchTags() {
  const data = loadAndTransformData();
  const allTags = {
    en: [],
    ar: [],
  };

  data.all.forEach(item => {
    if (item.searchTags) {
      allTags.en.push(...item.searchTags);
    }
    if (item.searchTagsAr) {
      allTags.ar.push(...item.searchTagsAr);
    }
  });

  // Remove duplicates
  allTags.en = [...new Set(allTags.en)];
  allTags.ar = [...new Set(allTags.ar)];

  return allTags;
}

/**
 * Search items by query (searches in name, address, tags)
 */
export function searchItems(query, lang = 'en', categoryFilter = null) {
  if (!query || query.trim() === '') return [];

  const data = loadAndTransformData();
  const items = categoryFilter ? getItemsByCategory(categoryFilter) : data.all;
  const searchQuery = query.toLowerCase().trim();
  const isAr = lang === 'ar';

  return items.filter(item => {
    const name = isAr ? item.nameAr : item.nameEn;
    const address = isAr ? item.addressAr : item.addressEn;
    const desc = isAr ? item.descAr : item.descEn;
    const tags = isAr ? item.searchTagsAr : item.searchTags;

    const searchableText = [
      name,
      address,
      desc,
      ...(tags || []),
    ].join(' ').toLowerCase();

    return searchableText.includes(searchQuery);
  });
}

export default {
  getHotels,
  getRestaurants,
  getPlaces,
  getEvents,
  getAllItems,
  getItemsByCategory,
  getItemById,
  getTopRatedPlaces,
  getTopRatedHotels,
  getTopRatedRestaurants,
  getFeaturedSlides,
  getAllSearchTags,
  searchItems,
};
