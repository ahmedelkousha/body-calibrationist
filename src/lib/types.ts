export type Service = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  duration: number;
  price: number;
  image: string;
  benefits: string[];
  featured: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  details: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image: string;
  featured: boolean;
  status: "active" | "draft" | "archived";
  createdAt: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readMinutes: number;
  image: string;
  featured: boolean;
  status: "published" | "draft";
  publishedAt: string;
  createdAt: string;
};

export type Event = {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  time: string;
  location: string;
  price: number;
  capacity: number;
  booked: number;
  image: string;
  status: "upcoming" | "sold-out" | "past";
  createdAt: string;
};

export type Story = {
  id: string;
  name: string;
  headline: string;
  quote: string;
  service: string;
  rating: number;
  image: string;
  featured: boolean;
  createdAt: string;
};

export type InquiryStatus = "new" | "read" | "replied" | "archived";

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  notes: string;
  createdAt: string;
};

export type Database = {
  services: Service[];
  products: Product[];
  blogs: BlogPost[];
  events: Event[];
  stories: Story[];
  inquiries: Inquiry[];
};

export type ResourceKey = keyof Database;
