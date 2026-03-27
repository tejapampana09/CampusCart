export interface User {
  uid: string;
  name: string;
  email: string;
  profilePic?: string;
  bio?: string;
  rating?: number;
  totalRatings?: number;
}

export interface Item {
  itemId: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  pricePerDay: number;
  imageURL: string;
  category: string;
  status: 'available' | 'rented';
  createdAt: any; // Firestore Timestamp
}

export interface Chat {
  chatId: string;
  participants: string[];
  itemId: string;
  itemTitle: string;
  itemImage: string;
  lastMessage?: string;
  lastMessageTimestamp?: any;
  typing?: Record<string, boolean>;
}

export interface Message {
  messageId: string;
  senderId: string;
  text: string;
  timestamp: any;
}

export interface Deal {
  dealId: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  duration: number;
  pickupLocation: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: any;
}

export type Category = 'Electronics' | 'Books' | 'Lab Equipment' | 'Bikes' | 'Clothing' | 'Other';
export const CATEGORIES: Category[] = ['Electronics', 'Books', 'Lab Equipment', 'Bikes', 'Clothing', 'Other'];
