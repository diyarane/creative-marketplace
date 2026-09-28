export const SPECIALIZATIONS = [
  "Motion Designer",
  "3D Artist",
  "VFX Artist",
  "Video Editor",
  "Character Animator",
  "Product Animator",
  "CGI Artist",
  "Compositor",
] as const;

export const PROJECT_CATEGORIES = [
  "Motion Graphics",
  "3D Animation",
  "Visual Effects",
  "Video Editing",
  "Character Animation",
  "Product Visualization",
  "CGI & Rendering",
  "Compositing",
  "Explainer Video",
  "Brand Film",
] as const;

/** Named gradients used across the app instead of external stock imagery. */
export const GRADIENTS = [
  "gradient-1",
  "gradient-2",
  "gradient-3",
  "gradient-4",
  "gradient-5",
  "gradient-6",
  "gradient-7",
  "gradient-8",
] as const;

export const NAV_LINKS_CLIENT = [
  { href: "/dashboard/client", label: "Dashboard" },
  { href: "/explore", label: "Explore" },
  { href: "/projects", label: "My Projects" },
  { href: "/messages", label: "Messages" },
];

export const NAV_LINKS_CREATOR = [
  { href: "/dashboard/creator", label: "Dashboard" },
  { href: "/projects/opportunities", label: "Opportunities" },
  { href: "/creator/portfolio", label: "Portfolio" },
  { href: "/creator/services", label: "Services" },
  { href: "/earnings", label: "Earnings" },
  { href: "/messages", label: "Messages" },
];

export const NAV_LINKS_ADMIN = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/creators", label: "Creators" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reports", label: "Reports" },
];
