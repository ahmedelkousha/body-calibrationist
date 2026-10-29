import type { ResourceKey } from "./types";

export type FieldType = "text" | "textarea" | "number" | "select" | "checkbox" | "date" | "tags" | "image";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  full?: boolean;
  help?: string;
  min?: number;
  max?: number;
  step?: number;
};

export type MetaConfig = {
  key: string;
  label: string;
  format?: "price" | "date" | "number";
};

export type ResourceConfig = {
  key: ResourceKey;
  prefix: string;
  singular: string;
  plural: string;
  description: string;
  titleKey: string;
  subtitleKey?: string;
  imageKey?: string;
  statusKey?: string;
  meta: MetaConfig[];
  searchKeys: string[];
  filterKey?: string;
  filterOptions?: string[];
  fields: FieldConfig[];
  defaults: Record<string, unknown>;
  publicBase?: string;
  /** Set to false when the resource has no individual detail page (e.g. events). */
  detailPage?: boolean;
};

const images = [
  { value: "/images/service-massage.webp", label: "Studio · massage" },
  { value: "/images/service-facial.webp", label: "Studio · facial" },
  { value: "/images/service-skin.webp", label: "Studio · skin" },
  { value: "/images/service-ritual.webp", label: "Studio · ritual" },
  { value: "/images/product-oil.webp", label: "Product · oil" },
  { value: "/images/product-serum.webp", label: "Product · serum" },
  { value: "/images/product-balm.webp", label: "Product · balm" },
  { value: "/images/product-kit.webp", label: "Product · kit" },
  { value: "/images/blog-1.webp", label: "Journal · skin" },
  { value: "/images/blog-2.webp", label: "Journal · rest" },
  { value: "/images/blog-3.webp", label: "Journal · consultation" },
  { value: "/images/workshop.webp", label: "Workshop" },
  { value: "/images/story-1.webp", label: "Story · one" },
  { value: "/images/story-2.webp", label: "Story · two" },
  { value: "/images/story-3.webp", label: "Story · three" },
  { value: "/images/approach.webp", label: "Approach" },
  { value: "/images/hero.webp", label: "Hero" },
];

const imageField: FieldConfig = {
  name: "image",
  label: "Cover image",
  type: "image",
  options: images.map((image) => image.value),
  full: true,
  help: "Choose from the studio library. Drop in a new file at public/images to add more.",
};

export const resourceConfigs: Record<string, ResourceConfig> = {
  blogs: {
    key: "blogs",
    prefix: "blg",
    singular: "article",
    plural: "Journal",
    description: "Write, edit and publish articles. Drafts stay hidden from the public site.",
    titleKey: "title",
    subtitleKey: "category",
    imageKey: "image",
    statusKey: "status",
    meta: [
      { key: "publishedAt", label: "Published", format: "date" },
      { key: "readMinutes", label: "Read", format: "number" },
    ],
    searchKeys: ["title", "category", "author"],
    filterKey: "status",
    filterOptions: ["published", "draft"],
    publicBase: "/blog",
    defaults: {
      title: "",
      excerpt: "",
      content: "",
      category: "Skin",
      author: "Shelley",
      readMinutes: 4,
      image: "/images/blog-1.webp",
      featured: false,
      status: "draft",
      publishedAt: new Date().toISOString().slice(0, 10),
    },
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Why your skin barrier matters" },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true, full: true, help: "One or two sentences shown on cards and in search results." },
      { name: "content", label: "Article", type: "textarea", full: true, help: "Use ## for headings, > for quotes, - for lists and **bold** for emphasis." },
      { name: "category", label: "Category", type: "select", options: ["Skin", "Wellbeing", "Rituals", "Ingredients"], required: true },
      { name: "author", label: "Author", type: "text", required: true },
      { name: "readMinutes", label: "Read time (minutes)", type: "number", min: 1, max: 60 },
      { name: "publishedAt", label: "Publish date", type: "date" },
      imageField,
      { name: "featured", label: "Feature on the homepage", type: "checkbox" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true },
    ],
  },
  products: {
    key: "products",
    prefix: "prd",
    singular: "product",
    plural: "Products",
    description: "Manage the store catalogue, pricing and stock levels.",
    titleKey: "name",
    subtitleKey: "category",
    imageKey: "image",
    statusKey: "status",
    meta: [
      { key: "price", label: "Price", format: "price" },
      { key: "stock", label: "Stock", format: "number" },
    ],
    searchKeys: ["name", "category", "description"],
    filterKey: "category",
    filterOptions: ["Body", "Face", "Sets"],
    publicBase: "/store",
    defaults: {
      name: "",
      category: "Body",
      description: "",
      details: "",
      price: 0,
      compareAtPrice: undefined,
      stock: 0,
      image: "/images/product-oil.webp",
      featured: false,
      status: "active",
    },
    fields: [
      { name: "name", label: "Product name", type: "text", required: true, full: true, placeholder: "Botanical Body Oil" },
      { name: "category", label: "Category", type: "select", options: ["Body", "Face", "Sets"], required: true },
      { name: "price", label: "Price (AUD)", type: "number", required: true, min: 0, step: 0.5 },
      { name: "compareAtPrice", label: "Compare-at price", type: "number", min: 0, step: 0.5, help: "Optional. Shown struck through beside the price." },
      { name: "stock", label: "Stock on hand", type: "number", required: true, min: 0 },
      { name: "description", label: "Short description", type: "textarea", required: true, full: true },
      { name: "details", label: "Details & ingredients", type: "textarea", full: true },
      imageField,
      { name: "featured", label: "Feature in the store and homepage", type: "checkbox" },
      { name: "status", label: "Status", type: "select", options: ["active", "draft", "archived"], required: true },
    ],
  },
  services: {
    key: "services",
    prefix: "svc",
    singular: "treatment",
    plural: "Treatments & Services",
    description: "The treatments listed on the website, their prices and durations.",
    titleKey: "name",
    subtitleKey: "tagline",
    imageKey: "image",
    meta: [
      { key: "duration", label: "Duration", format: "number" },
      { key: "price", label: "Price", format: "price" },
    ],
    searchKeys: ["name", "tagline", "description"],
    publicBase: "/treatments",
    defaults: {
      name: "",
      tagline: "",
      description: "",
      longDescription: "",
      duration: 60,
      price: 0,
      image: "/images/service-massage.webp",
      benefits: [],
      featured: false,
    },
    fields: [
      { name: "name", label: "Treatment name", type: "text", required: true, full: true },
      { name: "tagline", label: "Tagline", type: "text", required: true, full: true, placeholder: "Slow, intentional bodywork." },
      { name: "description", label: "Card description", type: "textarea", required: true, full: true },
      { name: "longDescription", label: "Full description", type: "textarea", full: true, help: "Markdown supported." },
      { name: "duration", label: "Duration (minutes)", type: "number", required: true, min: 15, max: 300 },
      { name: "price", label: "Price (AUD)", type: "number", required: true, min: 0, step: 5 },
      { name: "benefits", label: "Benefits", type: "tags", full: true, help: "Separate each benefit with a comma." },
      imageField,
      { name: "featured", label: "Feature on the homepage", type: "checkbox" },
    ],
  },
  events: {
    key: "events",
    prefix: "evt",
    singular: "event",
    plural: "Workshops & Events",
    description: "Upcoming workshops, capacity and booking numbers.",
    titleKey: "title",
    subtitleKey: "location",
    imageKey: "image",
    statusKey: "status",
    meta: [
      { key: "date", label: "Date", format: "date" },
      { key: "price", label: "Price", format: "price" },
    ],
    searchKeys: ["title", "location"],
    filterKey: "status",
    filterOptions: ["upcoming", "sold-out", "past"],
    publicBase: "/workshops",
    detailPage: false,
    defaults: {
      title: "",
      description: "",
      longDescription: "",
      date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      time: "6:30pm – 8:30pm",
      location: "The Studio, 14 Marine Parade",
      price: 65,
      capacity: 12,
      booked: 0,
      image: "/images/workshop.webp",
      status: "upcoming",
    },
    fields: [
      { name: "title", label: "Event title", type: "text", required: true, full: true },
      { name: "description", label: "Short description", type: "textarea", required: true, full: true },
      { name: "longDescription", label: "Full description", type: "textarea", full: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "time", label: "Time", type: "text", required: true, placeholder: "6:30pm – 8:30pm" },
      { name: "location", label: "Location", type: "text", required: true, full: true },
      { name: "price", label: "Price (AUD)", type: "number", required: true, min: 0, step: 5 },
      { name: "capacity", label: "Capacity", type: "number", required: true, min: 1 },
      { name: "booked", label: "Seats booked", type: "number", min: 0 },
      imageField,
      { name: "status", label: "Status", type: "select", options: ["upcoming", "sold-out", "past"], required: true },
    ],
  },
  stories: {
    key: "stories",
    prefix: "str",
    singular: "story",
    plural: "Transformation Stories",
    description: "Client stories and testimonials shown across the site.",
    titleKey: "name",
    subtitleKey: "service",
    imageKey: "image",
    meta: [{ key: "rating", label: "Rating", format: "number" }],
    searchKeys: ["name", "headline", "service"],
    defaults: {
      name: "",
      headline: "",
      quote: "",
      service: "Signature Holistic Massage",
      rating: 5,
      image: "/images/story-1.webp",
      featured: true,
    },
    fields: [
      { name: "name", label: "Client name", type: "text", required: true, placeholder: "Amelia R." },
      { name: "headline", label: "Headline", type: "text", required: true, full: true, placeholder: "The first routine that held" },
      { name: "quote", label: "Quote", type: "textarea", required: true, full: true },
      { name: "service", label: "Treatment", type: "text", required: true },
      { name: "rating", label: "Rating", type: "number", min: 1, max: 5 },
      imageField,
      { name: "featured", label: "Show in the homepage carousel", type: "checkbox" },
    ],
  },
};
