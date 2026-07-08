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
    name: "General Pest Control",
    slug: "general-pest-control",
    category: "Residential",
    description:
      "Comprehensive protection against common household pests — cockroaches, ants, spiders, silverfish and more. Safe, family-friendly treatment.",
    basePrice: 1499,
    icon: "bug",
    duration: "60–90 minutes",
    active: true,
    features: [
      "Kitchen and bathroom deep treatment",
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
    name: "Cockroach Control",
    slug: "cockroach-control",
    category: "Residential",
    description:
      "Targeted gel-based cockroach elimination. Zero mess, no evacuation needed. Ideal for kitchens and restaurants.",
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
    name: "Rodent Control",
    slug: "rodent-control",
    category: "Residential",
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
    name: "Bed Bug Treatment",
    slug: "bed-bug-treatment",
    category: "Residential",
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
    name: "Mosquito Control",
    slug: "mosquito-control",
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
];

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db();
  const col = db.collection("services");

  for (const svc of services) {
    await col.updateOne(
      { slug: svc.slug },
      { $set: svc },
      { upsert: true },
    );
  }

  const total = await col.countDocuments({ active: true });
  console.log(`[seed] Upserted ${services.length} services. Active total in DB: ${total}`);
} finally {
  await client.close();
}
