import { Villa, Testimonial, Service } from './types';

export const BRAND_NAME = "Peak Stay Destination";
export const CONTACT_EMAIL = "peakstaydestination@gmail.com";
export const WHATSAPP_NUMBER = "+919157928471";

export const HOTSPOT_LOCATIONS = [
  { name: "Anjuna", count: 15, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=400" },
  { name: "Lonavala", count: 12, image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=400" },
  { name: "Karjat", count: 8, image: "https://images.unsplash.com/photo-1593073830229-3a2ce9bad277?auto=format&fit=crop&q=80&w=400" },
  { name: "Khopoli", count: 5, image: "https://images.unsplash.com/photo-1618140052121-39fc6db33972?auto=format&fit=crop&q=80&w=400" },
  { name: "Konkan", count: 10, image: "https://images.unsplash.com/photo-1621334185523-281512e09477?auto=format&fit=crop&q=80&w=400" },
  { name: "Diveagar", count: 4, image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=400" }
];

export const INITIAL_VILLAS: Villa[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: "Villa Aarti 2BHK Anjuna",
    location: "Anjuna, Goa",
    pricePerNight: 28500,
    bedrooms: 2,
    bathrooms: 2,
    capacity: 6,
    description: "Elegant 2BHK sanctuary featuring white-brick walls, a private lap pool, and bespoke canopy beds.",
    longDescription: "Villa Aarti is a masterclass in modern coastal minimalism. The property boasts stunning white brick interiors, vertical subway-tiled bathrooms, and a designer modular kitchen. Outdoors, a private azure lap pool is framed by lush tropical greenery, offering a perfect sanctuary for discerning travelers.",
    imageUrls: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=1200", 
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1520699049698-acd2fccb8cc8?auto=format&fit=crop&q=80&w=1200"
    ],
    videoUrls: [],
    amenities: ["Private Lap Pool", "Canopy Beds", "Modular Kitchen", "White Brick Interiors", "Designer Tiling", "Wi-Fi", "AC"],
    includedServices: ["Daily Housekeeping", "On-call Caretaker"],
    isFeatured: true,
    rating: 4.9,
    ratingCount: 18,
    numRooms: 2,
    mealsAvailable: true,
    petFriendly: true,
    refundPolicy: "Full refund if cancelled 7 days before check-in."
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: "Villa Blackberry 3BHK Vagator",
    location: "Vagator, Goa",
    pricePerNight: 45000,
    bedrooms: 3,
    bathrooms: 3,
    capacity: 8,
    description: "The ultimate party sanctuary in Vagator. High-energy vibes with a private pool and sound system.",
    longDescription: "Villa Blackberry is designed for those who want to experience the vibrant energy of Vagator. Featuring a massive private pool, state-of-the-art sound system, and expansive deck areas, it's the perfect spot for a high-end celebration or a vibrant group getaway.",
    imageUrls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200"
    ],
    videoUrls: [],
    amenities: ["Private Pool", "Party Deck", "Sound System", "Wi-Fi", "AC", "Barbecue"],
    includedServices: ["Daily Housekeeping", "Party Planning Support"],
    isFeatured: true,
    rating: 4.7,
    ratingCount: 25,
    numRooms: 3,
    mealsAvailable: true,
    petFriendly: true,
    refundPolicy: "72 hours before check-in."
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: "Villa Eldeco 4BHK Siolim",
    location: "Siolim, Goa",
    pricePerNight: 65000,
    bedrooms: 4,
    bathrooms: 4,
    capacity: 10,
    description: "A serene riverside retreat in Siolim. Defining peace and luxury with a private infinity pool.",
    longDescription: "Villa Eldeco offers a quiet retreat away from the bustle. Nestled along the riverside in Siolim, this 4BHK masterpiece features an infinity pool overlooking the water, lush tropical gardens, and a legacy architecture that blends seamlessly with nature.",
    imageUrls: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1200"
    ],
    videoUrls: [],
    amenities: ["Infinity Pool", "Riverside View", "Tropical Garden", "Wi-Fi", "AC", "Chef on Call"],
    includedServices: ["Daily Housekeeping", "Private Chef"],
    isFeatured: true,
    rating: 5.0,
    ratingCount: 12,
    numRooms: 4,
    mealsAvailable: true,
    petFriendly: false,
    refundPolicy: "Full refund if cancelled 14 days before check-in."
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: "Sarah Jenkins",
    content: "The most seamless booking experience I've ever had. Villa Aarti was even more beautiful in person.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=sarah",
    category: 'Booking',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    name: "Ankit Sharma",
    content: "The Butter Chicken served in the villa was out of this world. Highly recommend the private chef service!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=ankit",
    category: 'Food',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    name: "Elena Rodriguez",
    content: "Our Lonavala trip was magical. The sunset views from the deck were the highlight of our vacation.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=elena",
    category: 'Trip',
    timestamp: new Date(Date.now() - 172800000).toISOString()
  }
];

export const SERVICES: Service[] = [
  {
    id: 's1',
    title: "Private Chef",
    description: "World-class culinary experiences tailored to your dietary preferences right in your villa kitchen.",
    icon: "fa-utensils"
  },
  {
    id: 's2',
    title: "Chauffeur Service",
    description: "Luxury transport available 24/7 to take you wherever your heart desires.",
    icon: "fa-car"
  },
  {
    id: 's3',
    title: "Spa & Wellness",
    description: "In-villa massage and spa treatments to rejuvenate your mind, body, and soul.",
    icon: "fa-spa"
  }
];
