export const categories = [
  "Video Editor",
  "Script Writer",
  "Story Writer",
  "Thumbnail Designer",
  "Voice Over",
];

export const creators = [
  {
    id: 1,
    name: "Maya Chen",
    skill: "Cinematic Video Editor",
    rating: 4.98,
    location: "Los Angeles, CA",
    price: "$180",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    cover: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80",
    bio: "I edit short-form and launch videos with crisp pacing, color polish, and story-first structure for creator brands.",
    badges: ["Top Rated", "Fast Delivery", "Available Now"],
    portfolio: ["Travel launch reel", "Podcast shorts pack", "Creator intro sequence"],
  },
  {
    id: 2,
    name: "Arjun Rao",
    skill: "Script Writer",
    rating: 4.92,
    location: "Bengaluru, IN",
    price: "$95",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    cover: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
    bio: "I write retention-led scripts for YouTube, explainers, product videos, and founder-led content.",
    badges: ["Fast Delivery", "Available Now"],
    portfolio: ["SaaS explainer", "Finance YouTube script", "Creator storytelling arc"],
  },
  {
    id: 3,
    name: "Sofia Laurent",
    skill: "Thumbnail Designer",
    rating: 4.96,
    location: "Paris, FR",
    price: "$70",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    cover: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80",
    bio: "I design scroll-stopping thumbnails with clean composition, expressive type, and sharp creator positioning.",
    badges: ["Top Rated"],
    portfolio: ["Tech reveal thumbnails", "Lifestyle series pack", "Gaming challenge set"],
  },
  {
    id: 4,
    name: "Noah Brooks",
    skill: "Voice Over Artist",
    rating: 4.89,
    location: "Austin, TX",
    price: "$120",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    cover: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
    bio: "Warm, confident voice-over for product demos, creator intros, documentary narration, and ads.",
    badges: ["Available Now", "Fast Delivery"],
    portfolio: ["Brand ad read", "Documentary intro", "App onboarding narration"],
  },
];

export const portfolioFeed = [
  {
    title: "Founder Story Reel",
    creator: "Maya Chen",
    category: "Video Editor",
    image: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Viral Hook Script Pack",
    creator: "Arjun Rao",
    category: "Script Writer",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Creator Thumbnail System",
    creator: "Sofia Laurent",
    category: "Thumbnail Designer",
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=900&q=80",
  },
];

export const packages = [
  { name: "Basic", price: "$120", detail: "1 polished deliverable, 2 revisions, 3 day delivery" },
  { name: "Standard", price: "$260", detail: "3 deliverables, 4 revisions, priority creative direction" },
  { name: "Premium", price: "$520", detail: "Full campaign pack, 7 revisions, launch support" },
];

export const dashboardStats = [
  { label: "Earnings", value: "$8,420", tone: "from-purple-400 to-blue-400" },
  { label: "Active Projects", value: "12", tone: "from-sky-300 to-blue-400" },
  { label: "Completed", value: "68", tone: "from-lavender-300 to-purple-400" },
  { label: "Pending Requests", value: "7", tone: "from-pink-300 to-purple-300" },
];

export const requests = [
  { client: "Luma Labs", project: "Launch teaser edit", budget: "$450", status: "New" },
  { client: "Studio North", project: "YouTube script refresh", budget: "$180", status: "Review" },
  { client: "Creative Studio", project: "Thumbnail pack", budget: "$220", status: "New" },
];

export const messages = [
  {
    name: "Maya Chen",
    preview: "I can send a first cut tomorrow afternoon.",
    online: true,
    time: "2m",
  },
  {
    name: "Arjun Rao",
    preview: "The intro hook is ready for your review.",
    online: true,
    time: "18m",
  },
  {
    name: "Sofia Laurent",
    preview: "I added three new thumbnail directions.",
    online: false,
    time: "1h",
  },
];
