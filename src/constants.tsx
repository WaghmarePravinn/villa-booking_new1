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
    id: 'villa-aarti-anjuna',
    name: "Villa Aarti 2BHK Anjuna",
    location: "Anjuna, Goa",
    pricePerNight: 28500,
    bedrooms: 2,
    bathrooms: 2,
    capacity: 6,
    description: "Elegant 2BHK sanctuary featuring white-brick walls, a private lap pool, and bespoke canopy beds.",
    longDescription: "Villa Aarti is a masterclass in modern coastal minimalism. The property boasts stunning white brick interiors in the bedrooms, vertical subway-tiled bathrooms, and a designer modular kitchen with a dedicated dining area. The living space is designed for comfort with plush seating and a large flat-screen TV. Outdoors, a private azure lap pool is framed by lush tropical greenery and features a signature 'Villa Aarti' welcome sign, offering a perfect sanctuary for discerning travelers.",
    imageUrls: [
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=1200", 
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1556911223-e15204113f5a?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200"
    ],
    videoUrls: [],
    amenities: ["Private Lap Pool", "White Brick Interiors", "Vertical Subway Tiles", "Modular Kitchen", "Dining Area", "Canopy Beds", "Wi-Fi", "AC", "Daily Housekeeping", "On-call Caretaker", "Parking", "Power Backup"],
    includedServices: ["Daily Housekeeping", "On-call Caretaker", "Airport Transfer (Paid)"],
    isFeatured: true,
    rating: 4.9,
    ratingCount: 18,
    numRooms: 2,
    mealsAvailable: true,
    petFriendly: true,
    refundPolicy: "Full refund if cancelled 7 days before check-in."
  },
  {
    id: 'villa-majestica-siolim',
    name: "Villa Majestica",
    location: "Siolim",
    pricePerNight: 5000,
    bedrooms: 4,
    bathrooms: 4,
    capacity: 10,
    description: "A new 4bhk luxury villa in Siolim with pool and wifi.",
    longDescription: "Villa Majestica is a brand new luxury sanctuary in the heart of Siolim. This 4BHK masterpiece offers unparalleled privacy and comfort, featuring a private pool, high-speed WiFi, and dedicated housekeeping. Perfect for large families or groups seeking an extraordinary escape.",
    imageUrls: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"
    ],
    videoUrls: [],
    amenities: ["Private Pool", "High-speed WiFi", "Housekeeping", "AC", "Power Backup", "Parking"],
    includedServices: ["Housekeeping", "Concierge Support"],
    isFeatured: true,
    rating: 4.8,
    ratingCount: 0,
    numRooms: 4,
    mealsAvailable: true,
    petFriendly: false,
    refundPolicy: "Flexible cancellation policy."
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
