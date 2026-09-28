import { db, sqlite } from "@/lib/db";
import {
  users,
  creatorProfiles,
  portfolioItems,
  services,
  subscriptionPlans,
  subscriptions,
  projects,
  proposals,
  projectFiles,
  revisions,
  payments,
  reviews,
  notifications,
  messages,
} from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { computePlatformFee } from "@/lib/services/payments";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY);

async function main() {
  console.log("Seeding database...");

  // ---- wipe existing data (dev-safe, deterministic re-seed) ----
  for (const table of [
    messages,
    notifications,
    reviews,
    payments,
    revisions,
    projectFiles,
    proposals,
    projects,
    subscriptions,
    subscriptionPlans,
    services,
    portfolioItems,
    creatorProfiles,
    users,
  ]) {
    await db.delete(table);
  }

  const PASSWORD = await bcrypt.hash("Password123!", 10);

  // ---------------- Users ----------------
  const [admin] = await db
    .insert(users)
    .values({ name: "Priya Nandan", email: "admin@example.com", passwordHash: PASSWORD, role: "ADMIN", avatar: "gradient-4" })
    .returning();

  const clientSeed = [
    { name: "Jordan Ashcombe", email: "client@example.com", avatar: "gradient-1", company: "Northlane Media" },
    { name: "Elena Marchetti", email: "elena@brightloop.co", avatar: "gradient-5", company: "Brightloop" },
    { name: "Marcus Webb", email: "marcus@fernandpeak.com", avatar: "gradient-6", company: "Fern & Peak" },
    { name: "Tasha Riordan", email: "tasha@haloworks.io", avatar: "gradient-2", company: "Halo Works" },
  ];
  const clients = [];
  for (const c of clientSeed) {
    const [u] = await db
      .insert(users)
      .values({ name: c.name, email: c.email, passwordHash: PASSWORD, role: "CLIENT", avatar: c.avatar })
      .returning();
    clients.push(u);
  }
  const [demoClient] = clients;

  const creatorSeed = [
    {
      name: "Sam Okafor",
      email: "creator@example.com",
      headline: "Motion designer crafting kinetic brand stories",
      specialization: "Motion Designer",
      location: "Austin, TX",
      experience: 6,
      hourlyRate: 85,
      gradient: "gradient-1",
    },
    {
      name: "Noor Al-Fassi",
      email: "noor@example.com",
      headline: "3D artist building product worlds that sell",
      specialization: "3D Artist",
      location: "Berlin, DE",
      experience: 8,
      hourlyRate: 110,
      gradient: "gradient-6",
    },
    {
      name: "Diego Salas",
      email: "diego@example.com",
      headline: "VFX artist for film-grade practical effects",
      specialization: "VFX Artist",
      location: "Mexico City, MX",
      experience: 9,
      hourlyRate: 130,
      gradient: "gradient-2",
    },
    {
      name: "Hana Kobayashi",
      email: "hana@example.com",
      headline: "Video editor turning raw footage into story",
      specialization: "Video Editor",
      location: "Osaka, JP",
      experience: 5,
      hourlyRate: 65,
      gradient: "gradient-3",
    },
    {
      name: "Leo Thibodeaux",
      email: "leo@example.com",
      headline: "Character animator bringing personality to pixels",
      specialization: "Character Animator",
      location: "Montreal, CA",
      experience: 7,
      hourlyRate: 95,
      gradient: "gradient-4",
    },
    {
      name: "Amara Chen",
      email: "amara@example.com",
      headline: "Product animator specializing in tech launches",
      specialization: "Product Animator",
      location: "San Francisco, CA",
      experience: 4,
      hourlyRate: 90,
      gradient: "gradient-8",
    },
    {
      name: "Viktor Petrov",
      email: "viktor@example.com",
      headline: "CGI artist rendering photoreal architectural film",
      specialization: "CGI Artist",
      location: "Warsaw, PL",
      experience: 10,
      hourlyRate: 140,
      gradient: "gradient-7",
    },
    {
      name: "Freya Lindqvist",
      email: "freya@example.com",
      headline: "Compositor blending live action with CG seamlessly",
      specialization: "Compositor",
      location: "Stockholm, SE",
      experience: 6,
      hourlyRate: 100,
      gradient: "gradient-5",
    },
  ];

  const bios = [
    "I help ambitious brands move the way their ideas deserve to move. Every frame is considered, every easing curve is intentional.",
    "Ten years of turning briefs into believable worlds. I care as much about the read as the render.",
    "I've shipped effects for streaming features and indie shorts alike — practical thinking, cutting-edge tools.",
    "I edit for rhythm first. Story structure, pacing, and sound design come before any transition ever does.",
    "Animation is empathy in motion. I build characters people root for in under thirty seconds.",
    "I make hardware and software launches feel inevitable. Clean geometry, confident timing, zero fluff.",
    "Architectural CGI that clients mistake for photography. I obsess over light the way photographers do.",
    "The compositing is the part nobody should notice — that's how I know I did it right.",
  ];

  const creators = [];
  for (let i = 0; i < creatorSeed.length; i++) {
    const c = creatorSeed[i];
    const [u] = await db
      .insert(users)
      .values({ name: c.name, email: c.email, passwordHash: PASSWORD, role: "CREATOR", avatar: c.gradient })
      .returning();
    const [profile] = await db
      .insert(creatorProfiles)
      .values({
        userId: u.id,
        headline: c.headline,
        bio: bios[i],
        specialization: c.specialization,
        location: c.location,
        experience: c.experience,
        hourlyRate: c.hourlyRate,
        availability: i % 5 === 0 ? "BUSY" : "AVAILABLE",
        coverGradient: c.gradient,
        rating: 0,
        totalReviews: 0,
      })
      .returning();
    creators.push({ user: u, profile });
  }
  const demoCreator = creators[0];

  // ---------------- Portfolio items ----------------
  const portfolioTitles: Record<string, string[]> = {
    "Motion Designer": ["Kinetic Type Reel", "App Launch Teaser", "Brand Identity Loop"],
    "3D Artist": ["Sneaker Turntable", "Beverage Can Hero Shot", "Abstract Geometry Study"],
    "VFX Artist": ["Practical Fire Simulation", "Sci-fi Portal Sequence", "Water Destruction Test"],
    "Video Editor": ["Documentary Short Cut", "Wedding Highlight Reel", "Podcast Episode Trailer"],
    "Character Animator": ["Mascot Walk Cycle", "Emotive Face Rig Demo", "Game Cinematic Snippet"],
    "Product Animator": ["Headphones 360 Spin", "SaaS Feature Explainer", "Hardware Unboxing Loop"],
    "CGI Artist": ["Skyline Render Study", "Interior Walkthrough", "Material Lighting Test"],
    "Compositor": ["Green Screen Extraction", "Sky Replacement Reel", "Multi-pass Comp Breakdown"],
  };
  const gradients = ["gradient-1", "gradient-2", "gradient-3", "gradient-4", "gradient-5", "gradient-6", "gradient-7", "gradient-8"];

  let gi = 0;
  for (const { profile, ...rest } of creators.map((c) => ({ profile: c.profile, spec: c.profile.specialization }))) {
    const titles = portfolioTitles[rest.spec] || ["Featured Work", "Client Project", "Personal Study"];
    for (const title of titles) {
      const gradient = gradients[gi % gradients.length];
      gi++;
      await db.insert(portfolioItems).values({
        creatorId: profile.id,
        title,
        description: `${title} — a ${rest.spec.toLowerCase()} project exploring rhythm, contrast, and clean motion.`,
        category: rest.spec,
        mediaType: gi % 3 === 0 ? "VIDEO" : "IMAGE",
        mediaUrl: `/media/${gradient}`,
        thumbnailUrl: `/media/${gradient}`,
        gradient,
      });
    }
  }

  // ---------------- Services ----------------
  const serviceTemplates: Record<string, { title: string; price: number; days: number }[]> = {
    "Motion Designer": [
      { title: "60-second brand motion reel", price: 1400, days: 7 },
      { title: "Animated logo sting", price: 450, days: 3 },
    ],
    "3D Artist": [
      { title: "Product hero render (single asset)", price: 900, days: 5 },
      { title: "3D turntable animation", price: 1600, days: 8 },
    ],
    "VFX Artist": [
      { title: "Practical effects composite shot", price: 2200, days: 10 },
      { title: "Sci-fi VFX sequence (15s)", price: 3200, days: 14 },
    ],
    "Video Editor": [
      { title: "Short-form social edit (up to 60s)", price: 350, days: 3 },
      { title: "Full documentary edit (up to 20min)", price: 2800, days: 12 },
    ],
    "Character Animator": [
      { title: "Character walk + idle cycle", price: 800, days: 6 },
      { title: "30-second character animation", price: 2400, days: 12 },
    ],
    "Product Animator": [
      { title: "Product explainer animation (60s)", price: 1900, days: 9 },
      { title: "App feature micro-animation set", price: 700, days: 4 },
    ],
    "CGI Artist": [
      { title: "Architectural CGI still (per image)", price: 650, days: 5 },
      { title: "CGI walkthrough animation (30s)", price: 3500, days: 16 },
    ],
    "Compositor": [
      { title: "Green screen composite shot", price: 500, days: 4 },
      { title: "Multi-layer VFX composite sequence", price: 2600, days: 12 },
    ],
  };

  for (const { user, profile } of creators) {
    const templates = serviceTemplates[profile.specialization] || [];
    for (const t of templates) {
      await db.insert(services).values({
        creatorId: profile.id,
        title: t.title,
        description: `${t.title} delivered by ${user.name}. Includes source project files, two rounds of revisions, and a kickoff call to align on direction.`,
        category: profile.specialization,
        price: t.price,
        deliveryDays: t.days,
        revisionsIncluded: 2,
      });
    }
  }

  // ---------------- Subscription plans ----------------
  const plans = [
    {
      name: "Starter",
      price: 0,
      duration: 30,
      description: "For clients posting the occasional project.",
      features: ["1 active project", "Standard support", "Browse all creators"],
      highlighted: false,
    },
    {
      name: "Professional",
      price: 49,
      duration: 30,
      description: "For teams hiring creative talent regularly.",
      features: ["10 active projects", "Priority proposal visibility", "Dedicated success contact", "Advanced search filters"],
      highlighted: true,
    },
    {
      name: "Studio",
      price: 149,
      duration: 30,
      description: "For production studios running multiple pipelines.",
      features: ["Unlimited active projects", "Team seats (up to 5)", "Custom contracts", "Early access to top creators"],
      highlighted: false,
    },
    {
      name: "Enterprise",
      price: 499,
      duration: 30,
      description: "For companies with ongoing creative production needs.",
      features: ["Unlimited everything", "Dedicated account manager", "SLA-backed delivery", "Custom integrations", "Invoiced billing"],
      highlighted: false,
    },
  ];
  const planRows = [];
  for (const p of plans) {
    const [row] = await db
      .insert(subscriptionPlans)
      .values({ ...p, features: JSON.stringify(p.features) })
      .returning();
    planRows.push(row);
  }

  await db.insert(subscriptions).values({
    userId: demoClient.id,
    planId: planRows[1].id,
    status: "ACTIVE",
    startDate: daysAgo(10),
    endDate: daysFromNow(20),
  });

  // ---------------- Projects across the full workflow ----------------
  const projectSeed = [
    // 1. DRAFT — belongs to demo client, not yet published
    {
      client: demoClient,
      title: "Internal Culture Video (Draft)",
      category: "Video Editing",
      description:
        "A short internal culture video for our all-hands meeting. Mostly interview clips with some b-roll from the office.",
      requirements: "Deliver in 16:9 and 9:16. Include lower-third name tags. Keep under 3 minutes.",
      budgetMin: 800,
      budgetMax: 1400,
      deadline: daysFromNow(21),
      status: "DRAFT" as const,
    },
    // 2. OPEN — no proposals yet
    {
      client: clients[1],
      title: "Product Launch Teaser — Wireless Earbuds",
      category: "Motion Graphics",
      description:
        "We're launching a new pair of wireless earbuds and need a punchy 30-second teaser for paid social and our landing page.",
      requirements: "Bold typography, high-energy pacing, brand colors are navy and lime. Must include our logo sting at the end.",
      budgetMin: 1200,
      budgetMax: 2200,
      deadline: daysFromNow(18),
      status: "OPEN" as const,
    },
    // 3. PROPOSALS_RECEIVED — several proposals, client deciding
    {
      client: clients[2],
      title: "Explainer Animation for SaaS Onboarding",
      category: "Explainer Video",
      description:
        "Our onboarding flow is confusing new users. We want a friendly 60-90 second explainer animation walking through the core workflow.",
      requirements: "Character-driven, warm and approachable tone. Script will be provided. Needs voiceover sync points marked.",
      budgetMin: 1800,
      budgetMax: 3000,
      deadline: daysFromNow(25),
      status: "PROPOSALS_RECEIVED" as const,
    },
    // 4. FREELANCER_SELECTED — assigned, not started
    {
      client: clients[3],
      title: "Architectural CGI Stills for Real Estate Listing",
      category: "CGI & Rendering",
      description: "Three photoreal CGI stills of an unbuilt residential development for the sales brochure and website.",
      requirements: "Golden-hour lighting, landscaped exteriors, and one interior kitchen render.",
      budgetMin: 1800,
      budgetMax: 2600,
      deadline: daysFromNow(20),
      status: "FREELANCER_SELECTED" as const,
      creator: creators[6], // Viktor - CGI Artist
      price: 2200,
      revisionsIncluded: 2,
    },
    // 5. IN_PROGRESS — assigned to demo creator, currently active
    {
      client: demoClient,
      title: "Q3 Brand Refresh — Motion Identity System",
      category: "Motion Graphics",
      description:
        "Following our rebrand, we need a full animated identity system: logo animation, lower thirds, and a title card template.",
      requirements: "Match the new brand guidelines (attached separately). Deliver as After Effects project + rendered MP4s.",
      budgetMin: 2200,
      budgetMax: 3200,
      deadline: daysFromNow(10),
      status: "IN_PROGRESS" as const,
      creator: demoCreator,
      price: 2800,
      revisionsIncluded: 3,
    },
    // 6. SUBMITTED — creator submitted, client needs to review
    {
      client: clients[1],
      title: "Character Mascot Animation for App Store Trailer",
      category: "Character Animation",
      description: "Bring our app mascot to life for a 20-second App Store trailer loop.",
      requirements: "Loopable, playful energy, must work with no sound. Mascot reference sheet provided.",
      budgetMin: 1600,
      budgetMax: 2400,
      deadline: daysFromNow(6),
      status: "SUBMITTED" as const,
      creator: creators[4], // Leo - Character Animator
      price: 2100,
      revisionsIncluded: 2,
    },
    // 7. REVISION_REQUESTED — demo creator, active revision cycle
    {
      client: clients[2],
      title: "VFX Composite for Short Film Dream Sequence",
      category: "Visual Effects",
      description: "A surreal dream sequence for an independent short film needs a hand-painted sky replacement and particle effects.",
      requirements: "Match grain and color of the ARRI Alexa footage provided. Deliver ProRes 4444.",
      budgetMin: 2400,
      budgetMax: 3600,
      deadline: daysFromNow(4),
      status: "REVISION_REQUESTED" as const,
      creator: creators[2], // Diego - VFX
      price: 3000,
      revisionsIncluded: 2,
    },
    // 8. APPROVED — waiting on payment
    {
      client: clients[3],
      title: "Compositing Pass for Commercial Spot",
      category: "Compositing",
      description: "Clean up and composite green-screen talent into a stylized studio background for a 15-second commercial.",
      requirements: "Match reference deck exactly. Deliver in both 16:9 and 1:1 crops.",
      budgetMin: 1400,
      budgetMax: 1900,
      deadline: daysFromNow(2),
      status: "APPROVED" as const,
      creator: creators[7], // Freya - Compositor
      price: 1650,
      revisionsIncluded: 1,
    },
    // 9. COMPLETED — full pipeline with payment + reviews, demo client + demo creator
    {
      client: demoClient,
      title: "Founder Story — Brand Documentary Edit",
      category: "Video Editing",
      description: "A 4-minute founder story documentary cut down from six hours of interview and b-roll footage.",
      requirements: "Emotional arc, subtle color grade, licensed music bed (provided). Captions burned in.",
      budgetMin: 2000,
      budgetMax: 2800,
      deadline: daysAgo(2),
      status: "COMPLETED" as const,
      creator: demoCreator,
      price: 2500,
      revisionsIncluded: 2,
      completed: true,
    },
    // 10. COMPLETED — another fully completed project for portfolio stats
    {
      client: clients[1],
      title: "3D Product Spin for E-commerce Listing",
      category: "3D Animation",
      description: "A clean 360-degree spin animation of our flagship blender for the product page.",
      requirements: "Studio lighting, transparent background export, 5 second seamless loop.",
      budgetMin: 900,
      budgetMax: 1300,
      deadline: daysAgo(8),
      status: "COMPLETED" as const,
      creator: creators[1], // Noor - 3D Artist
      price: 1100,
      revisionsIncluded: 2,
      completed: true,
    },
    // 11. CANCELLED
    {
      client: clients[2],
      title: "Trade Show Loop Animation",
      category: "Motion Graphics",
      description: "Looping animation for a trade show booth screen, cancelled after budget was reallocated.",
      requirements: "Large-format vertical screen, no sound needed.",
      budgetMin: 700,
      budgetMax: 1200,
      deadline: daysFromNow(15),
      status: "CANCELLED" as const,
    },
    // 12. OPEN — another open opportunity for variety
    {
      client: demoClient,
      title: "Investor Update Explainer Graphics",
      category: "Motion Graphics",
      description: "A set of five animated data visualizations for our quarterly investor update deck.",
      requirements: "Match our pitch deck template. Deliver as looping MP4s and GIFs.",
      budgetMin: 1000,
      budgetMax: 1800,
      deadline: daysFromNow(14),
      status: "OPEN" as const,
    },
  ];

  const createdProjects: (typeof projects.$inferSelect & { seed: (typeof projectSeed)[number] })[] = [];
  for (const p of projectSeed) {
    const [row] = await db
      .insert(projects)
      .values({
        clientId: p.client.id,
        creatorId: p.creator?.profile.id,
        title: p.title,
        category: p.category,
        description: p.description,
        requirements: p.requirements,
        budgetMin: p.budgetMin,
        budgetMax: p.budgetMax,
        deadline: p.deadline,
        status: p.status,
        agreedPrice: p.price,
        agreedRevisions: p.revisionsIncluded,
        createdAt: daysAgo(30),
        updatedAt: p.completed ? daysAgo(1) : new Date(),
      })
      .returning();
    createdProjects.push({ ...row, seed: p });
  }

  const findProject = (title: string) => createdProjects.find((p) => p.title === title)!;

  // ---------------- Proposals ----------------
  // PROPOSALS_RECEIVED project gets multiple proposals
  const explainerProject = findProject("Explainer Animation for SaaS Onboarding");
  const proposalCreators = [creators[4], creators[0], creators[5]];
  for (const [i, c] of proposalCreators.entries()) {
    await db.insert(proposals).values({
      projectId: explainerProject.id,
      creatorId: c.profile.id,
      price: 2100 + i * 300,
      deliveryDays: 10 + i * 2,
      revisionsIncluded: 2,
      message: `Hi! I'd love to bring this onboarding explainer to life. I've done similar character-driven walkthroughs and can match your warm, approachable tone while keeping the pacing tight for retention. Happy to hop on a call to align on the script beats.`,
      status: "PENDING",
    });
  }

  // OPEN project: demo creator has already proposed (for "already proposed" UI state)
  const earbudsProject = findProject("Product Launch Teaser — Wireless Earbuds");
  await db.insert(proposals).values({
    projectId: earbudsProject.id,
    creatorId: demoCreator.profile.id,
    price: 1900,
    deliveryDays: 9,
    revisionsIncluded: 2,
    message: "I specialize in high-energy product teasers with bold kinetic type — this is exactly my lane. I can turn this around in 9 days with two rounds of revisions included.",
    status: "PENDING",
  });

  // proposals for assigned projects (one accepted, rest rejected) to populate history
  const cgiProject = findProject("Architectural CGI Stills for Real Estate Listing");
  const [acceptedCgi] = await db
    .insert(proposals)
    .values({
      projectId: cgiProject.id,
      creatorId: creators[6].profile.id,
      price: 2200,
      deliveryDays: 12,
      revisionsIncluded: 2,
      message: "I focus exclusively on architectural CGI and can deliver golden-hour renders that feel indistinguishable from photography.",
      status: "ACCEPTED",
    })
    .returning();
  await db.insert(proposals).values({
    projectId: cgiProject.id,
    creatorId: creators[1].profile.id,
    price: 2600,
    deliveryDays: 15,
    revisionsIncluded: 1,
    message: "I'd bring a stylized, slightly warmer render approach to this listing while keeping full photoreal fidelity.",
    status: "REJECTED",
  });

  const brandRefreshProject = findProject("Q3 Brand Refresh — Motion Identity System");
  await db.insert(proposals).values({
    projectId: brandRefreshProject.id,
    creatorId: demoCreator.profile.id,
    price: 2800,
    deliveryDays: 14,
    revisionsIncluded: 3,
    message: "This is right in my wheelhouse — I recently built a full motion identity system for a similar B2B brand and can share it on a call.",
    status: "ACCEPTED",
  });

  // ---------------- Files, revisions, payments, reviews per project status ----------------
  // SUBMITTED project: creator uploaded a submission file
  const mascotProject = findProject("Character Mascot Animation for App Store Trailer");
  await db.insert(projectFiles).values([
    {
      projectId: mascotProject.id,
      uploadedBy: mascotProject.clientId,
      fileName: "mascot-reference-sheet.pdf",
      fileUrl: `/mock-storage/${mascotProject.id}/mascot-reference-sheet.pdf`,
      fileType: "pdf",
      fileSize: 2_400_000,
      kind: "REFERENCE",
      note: "Reference sheet with mascot proportions and color palette.",
    },
    {
      projectId: mascotProject.id,
      uploadedBy: creators[4].user.id,
      fileName: "mascot-trailer-v1.mp4",
      fileUrl: `/mock-storage/${mascotProject.id}/mascot-trailer-v1.mp4`,
      fileType: "mp4",
      fileSize: 18_400_000,
      kind: "SUBMISSION",
      note: "First pass — 20 second loop, no sound design yet.",
    },
  ]);

  // REVISION_REQUESTED project: has a submission, then an open revision
  const vfxProject = findProject("VFX Composite for Short Film Dream Sequence");
  await db.insert(projectFiles).values({
    projectId: vfxProject.id,
    uploadedBy: creators[2].user.id,
    fileName: "dream-sequence-comp-v1.mov",
    fileUrl: `/mock-storage/${vfxProject.id}/dream-sequence-comp-v1.mov`,
    fileType: "mov",
    fileSize: 42_000_000,
    kind: "SUBMISSION",
    note: "First composite pass with sky replacement and base particles.",
  });
  await db.insert(revisions).values({
    projectId: vfxProject.id,
    requestedBy: vfxProject.clientId,
    description: "The sky replacement looks great, but the particle effects feel too dense in the foreground — please pull them back about 40% and warm up the color grade slightly to match the rest of the film.",
    status: "OPEN",
  });

  // IN_PROGRESS demo creator project: has reference files
  await db.insert(projectFiles).values({
    projectId: brandRefreshProject.id,
    uploadedBy: brandRefreshProject.clientId,
    fileName: "brand-guidelines-2026.pdf",
    fileUrl: `/mock-storage/${brandRefreshProject.id}/brand-guidelines-2026.pdf`,
    fileType: "pdf",
    fileSize: 5_100_000,
    kind: "REFERENCE",
    note: "Full updated brand guideline deck including new color system and typography.",
  });

  // APPROVED project: ready for payment, has submission file
  const compProject = findProject("Compositing Pass for Commercial Spot");
  await db.insert(projectFiles).values({
    projectId: compProject.id,
    uploadedBy: creators[7].user.id,
    fileName: "commercial-composite-final.mov",
    fileUrl: `/mock-storage/${compProject.id}/commercial-composite-final.mov`,
    fileType: "mov",
    fileSize: 51_000_000,
    kind: "SUBMISSION",
    note: "Final composite, approved for delivery.",
  });

  // COMPLETED projects: files, payments, reviews (both directions where relevant)
  const founderStoryProject = findProject("Founder Story — Brand Documentary Edit");
  await db.insert(projectFiles).values({
    projectId: founderStoryProject.id,
    uploadedBy: demoCreator.user.id,
    fileName: "founder-story-final-cut.mp4",
    fileUrl: `/mock-storage/${founderStoryProject.id}/founder-story-final-cut.mp4`,
    fileType: "mp4",
    fileSize: 64_000_000,
    kind: "SUBMISSION",
    note: "Final approved cut with captions burned in.",
  });
  const [founderPayment] = await db
    .insert(payments)
    .values({
      projectId: founderStoryProject.id,
      clientId: founderStoryProject.clientId,
      creatorId: demoCreator.profile.id,
      amount: 2500,
      platformFee: computePlatformFee(2500),
      status: "SUCCEEDED",
      method: "CARD",
      transactionId: `txn_seed_${founderStoryProject.id.slice(0, 8)}`,
      createdAt: daysAgo(1),
    })
    .returning();
  await db.insert(reviews).values([
    {
      projectId: founderStoryProject.id,
      reviewerId: demoClient.id,
      reviewedUserId: demoCreator.user.id,
      rating: 5,
      comment: "Sam completely understood the emotional arc we were going for. The pacing and color grade elevated the whole story — would hire again in a heartbeat.",
      createdAt: daysAgo(1),
    },
    {
      projectId: founderStoryProject.id,
      reviewerId: demoCreator.user.id,
      reviewedUserId: demoClient.id,
      rating: 5,
      comment: "Jordan gave clear direction from day one and turned around feedback fast. A genuinely great project to work on.",
      createdAt: daysAgo(1),
    },
  ]);

  const spinProject = findProject("3D Product Spin for E-commerce Listing");
  await db.insert(payments).values({
    projectId: spinProject.id,
    clientId: spinProject.clientId,
    creatorId: creators[1].profile.id,
    amount: 1100,
    platformFee: computePlatformFee(1100),
    status: "SUCCEEDED",
    method: "PAYPAL",
    transactionId: `txn_seed_${spinProject.id.slice(0, 8)}`,
    createdAt: daysAgo(8),
  });
  await db.insert(reviews).values({
    projectId: spinProject.id,
    reviewerId: clients[1].id,
    reviewedUserId: creators[1].user.id,
    rating: 4,
    comment: "Beautiful render quality, delivered on time. One round of revision to adjust the lighting but the end result was worth it.",
    createdAt: daysAgo(7),
  });

  // update aggregate creator ratings from seeded reviews
  const allReviews = await db.query.reviews.findMany();
  for (const c of creators) {
    const mine = allReviews.filter((r) => r.reviewedUserId === c.user.id);
    if (mine.length) {
      const avg = mine.reduce((s, r) => s + r.rating, 0) / mine.length;
      await db
        .update(creatorProfiles)
        .set({ rating: Math.round(avg * 10) / 10, totalReviews: mine.length })
        .where(eq(creatorProfiles.id, c.profile.id));
    }
  }

  // give every creator a small baseline of ratings/reviews so explore page doesn't look empty
  for (const c of creators) {
    if (c.profile.totalReviews === 0) {
      const rating = Math.round((3.8 + Math.random() * 1.2) * 10) / 10;
      const reviewCount = 3 + Math.floor(Math.random() * 20);
      await db
        .update(creatorProfiles)
        .set({ rating, totalReviews: reviewCount })
        .where(eq(creatorProfiles.id, c.profile.id));
    }
  }

  // ---------------- Notifications ----------------
  await db.insert(notifications).values([
    {
      userId: demoClient.id,
      type: "NEW_PROPOSAL",
      title: "New proposal received",
      message: `You received a new proposal for "${earbudsProject.title}".`,
      link: `/projects/${earbudsProject.id}/proposals`,
      read: false,
    },
    {
      userId: demoClient.id,
      type: "PAYMENT_COMPLETED",
      title: "Payment completed",
      message: `Your payment for "${founderStoryProject.title}" was processed successfully.`,
      link: `/projects/${founderStoryProject.id}`,
      read: true,
    },
    {
      userId: demoCreator.user.id,
      type: "PROPOSAL_ACCEPTED",
      title: "Your proposal was accepted",
      message: `Your proposal for "${brandRefreshProject.title}" was accepted.`,
      link: `/projects/${brandRefreshProject.id}/workspace`,
      read: false,
    },
    {
      userId: demoCreator.user.id,
      type: "NEW_REVIEW",
      title: "You received a new review",
      message: `You received a 5-star review on "${founderStoryProject.title}".`,
      link: `/reviews`,
      read: false,
    },
    {
      userId: demoCreator.user.id,
      type: "NEW_MESSAGE",
      title: "New message",
      message: `${demoClient.name} sent you a message.`,
      link: `/messages`,
      read: true,
    },
  ]);

  // ---------------- Messages ----------------
  const msgThread = [
    { from: demoClient, to: demoCreator.user, content: "Hi Sam! Excited to kick off the brand refresh project. When can you jump on a quick call this week?", offsetHours: 72 },
    { from: demoCreator.user, to: demoClient, content: "Hey Jordan — great to be working together again. I'm free Thursday afternoon, does 2pm work?", offsetHours: 70 },
    { from: demoClient, to: demoCreator.user, content: "2pm Thursday works. I'll send a calendar invite with the updated brand deck attached.", offsetHours: 69 },
    { from: demoCreator.user, to: demoClient, content: "Perfect, got the brand guidelines — the new color system is gorgeous. Starting on logo animation concepts today.", offsetHours: 20 },
  ];
  for (const m of msgThread) {
    await db.insert(messages).values({
      senderId: m.from.id,
      receiverId: m.to.id,
      projectId: brandRefreshProject.id,
      content: m.content,
      read: true,
      createdAt: new Date(Date.now() - m.offsetHours * 60 * 60 * 1000),
    });
  }

  console.log("Seed complete.");
  console.log("Demo accounts:");
  console.log("  CLIENT   client@example.com / Password123!");
  console.log("  CREATOR  creator@example.com / Password123!");
  console.log("  ADMIN    admin@example.com / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    sqlite.close();
  });
