// One-time seed for the "services" collection so the homepage / catalog is
// populated. Run with: node --env-file=.env scripts/seed-services.mjs
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

const now = new Date();

const services = [
  {
    name: "Residential Pest Control",
    slug: "residential-pest-control",
    category: "Residential",
    description:
      "Safe, thorough pest management for homes — kitchens, bedrooms, and living areas treated by certified technicians.",
    basePrice: 1499,
    icon: "home",
    duration: "60–90 minutes",
    active: true,
    features: [
      "Whole-home inspection and treatment",
      "Odorless, pet-safe chemicals",
      "60-day service warranty",
    ],
    benefits: [
      "Eliminates infestations at the source",
      "Prevents future outbreaks",
      "Certified eco-friendly formulations",
    ],
    process: [
      "Free on-site inspection",
      "Custom treatment plan",
      "Application by certified technician",
      "Follow-up visit within 30 days",
    ],
    safetyMeasures: [
      "Non-toxic to humans and pets when dry",
      "WHO-approved chemical class",
      "Ventilation guidance provided",
    ],
    faqs: [
      { question: "Is it safe for kids and pets?", answer: "Yes — once dry (about 2 hours), the treatment is completely safe." },
      { question: "How long does the treatment last?", answer: "Typically 60–90 days depending on infestation level and environment." },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Commercial Pest Control",
    slug: "commercial-pest-control",
    category: "Commercial",
    description:
      "AMC-based integrated pest management for offices, restaurants, hotels and warehouses. HACCP compliant.",
    basePrice: 4999,
    icon: "building",
    duration: "As per AMC schedule",
    active: true,
    features: ["Monthly / quarterly visits", "Full documentation for audits", "HACCP-compliant protocols"],
    benefits: ["Regulatory compliance", "Zero downtime service", "Custom SLA"],
    process: ["Site audit", "Custom IPM plan", "Scheduled service visits", "Monthly reports"],
    safetyMeasures: ["Food-safe chemicals", "Trained technicians in PPE"],
    faqs: [
      { question: "Do you support HACCP audits?", answer: "Yes — full documentation and audit trails provided." },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Cockroach & General Pest Control",
    slug: "cockroach-control",
    category: "General",
    description:
      "Targeted gel-based cockroach elimination plus general household pest coverage. Zero mess, no evacuation needed.",
    basePrice: 999,
    icon: "bug",
    duration: "30–45 minutes",
    active: true,
    features: ["Gel bait application", "Kitchen-safe formulation", "Same-day results"],
    benefits: ["No smell, no spray", "Kills entire colony", "Safe near food surfaces"],
    process: ["Inspection", "Strategic gel placement", "30-day monitoring"],
    safetyMeasures: ["Food-safe placement", "Non-volatile compound"],
    faqs: [
      { question: "Do we need to leave the house?", answer: "No — treatment is drop-based, no evacuation needed." },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Mosquito & Fumigation",
    slug: "mosquito-fumigation",
    category: "Outdoor",
    description:
      "Outdoor fogging and larvicidal treatment for gardens, balconies and open drains. Reduces dengue and malaria risk.",
    basePrice: 1299,
    icon: "droplet",
    duration: "45–60 minutes",
    active: true,
    features: ["Cold + thermal fogging", "Larvicide for stagnant water", "Perimeter spray"],
    benefits: ["Reduces mosquito density up to 90%", "Protects against vector-borne diseases", "Safe for gardens"],
    process: ["Breeding-site inspection", "Larvicide application", "Space fogging around perimeter"],
    safetyMeasures: ["Green-certified insecticide", "Withdrawal period: 30 mins"],
    faqs: [
      { question: "How often should this be done?", answer: "Monthly during monsoon, quarterly otherwise." },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Bed Bug Treatment",
    slug: "bed-bug-treatment",
    category: "Specialist",
    description:
      "Multi-stage bed bug elimination targeting eggs, nymphs and adults. Includes mattress, furniture and skirting treatment.",
    basePrice: 2499,
    icon: "bed",
    duration: "90–120 minutes",
    active: true,
    features: ["Heat + chemical treatment", "Mattress and box-spring coverage", "2 follow-up visits"],
    benefits: ["Breaks the reproduction cycle", "Prevents re-infestation", "Restores restful sleep"],
    process: ["Room inspection", "Vacuum + treatment", "Follow-up at 14 & 28 days"],
    safetyMeasures: ["Low-toxicity formulation", "Room ventilation required post-treatment"],
    faqs: [
      { question: "How many visits are needed?", answer: "Usually 2–3 visits over 4 weeks for complete elimination." },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Rodent Control",
    slug: "rodent-control",
    category: "Rodent",
    description:
      "Complete rat and mouse control using traps, glue boards, and secure bait stations. Ideal for homes, warehouses and offices.",
    basePrice: 1799,
    icon: "mouse",
    duration: "60 minutes + monitoring",
    active: true,
    features: ["Tamper-proof bait stations", "Entry-point sealing", "Follow-up visits"],
    benefits: ["Prevents disease spread", "Protects wiring and food", "Discreet placement"],
    process: ["Site survey", "Bait station deployment", "Weekly monitoring for 4 weeks"],
    safetyMeasures: ["Bait fully enclosed", "Safe near pets and children"],
    faqs: [
      { question: "How long does it take?", answer: "Most infestations are cleared within 2–4 weeks." },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Termite Control",
    slug: "termite-control",
    category: "Structural",
    description:
      "Specialised anti-termite treatment for pre- and post-construction buildings. Protect your home and furniture from silent damage.",
    basePrice: 4999,
    icon: "home",
    duration: "2–4 hours",
    active: true,
    features: [
      "Chemical barrier around perimeter",
      "Wood treatment for existing furniture",
      "5-year warranty on pre-construction",
    ],
    benefits: [
      "Prevents structural damage",
      "Protects wooden furniture and doors",
      "Long-lasting soil barrier",
    ],
    process: [
      "Detailed termite inspection",
      "Drilling and injection along perimeter",
      "Wood treatment application",
      "Documentation and warranty certificate",
    ],
    safetyMeasures: ["Low-odour formulation", "Family may return same day"],
    faqs: [
      { question: "Do you offer a warranty?", answer: "Yes — up to 5 years on pre-construction treatments." },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Agricultural Pest Advisory",
    slug: "agri-advisory",
    category: "Agriculture",
    description:
      "Crop pest inspection, advisory, and field spraying for farms and orchards. Protect yields with expert guidance.",
    basePrice: 2500,
    icon: "leaf",
    duration: "Varies by crop area",
    active: true,
    features: ["Field inspection and pest ID", "Custom spray schedule", "Post-treatment monitoring"],
    benefits: ["Higher crop yields", "Reduced pesticide waste", "Expert agronomist support"],
    process: ["Site visit and crop assessment", "Treatment plan", "Spraying or baiting", "Follow-up inspection"],
    safetyMeasures: ["Approved agricultural chemicals", "Re-entry interval guidance"],
    faqs: [
      { question: "Do you cover all crop types?", answer: "We advise on most field crops, orchards, and vegetable plots in our service area." },
    ],
    createdAt: now,
    updatedAt: now,
  },
];

/** Slugs replaced by the canonical 8-service catalog — hide from public listings. */
const RETIRED_SLUGS = ["general-pest-control", "mosquito-control"];

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db();
  const col = db.collection("services");

  for (const svc of services) {
    await col.updateOne({ slug: svc.slug }, { $set: svc }, { upsert: true });
  }

  if (RETIRED_SLUGS.length) {
    await col.updateMany(
      { slug: { $in: RETIRED_SLUGS } },
      { $set: { active: false, updatedAt: now } },
    );
  }

  const total = await col.countDocuments({ active: true });
  console.log(`[seed] Upserted ${services.length} services. Active total in DB: ${total}`);
} finally {
  await client.close();
}
