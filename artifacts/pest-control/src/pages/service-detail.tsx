import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { apiFetch } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import { STATIC_SERVICES } from "@/config/static-services";
import PageHero from "@/components/page-hero";
import ServiceCardImage from "@/components/service-card-image";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Clock,
  Zap,
  Star,
  Home,
  Building2,
  Bug,
  Mouse,
  Cloud,
  Bed,
  Leaf,
  Sparkles,
  Phone,
  HelpCircle,
  Award,
  Check,
} from "lucide-react";

/** Rich enrichment data for services when API features/faqs are limited */
interface EnrichedDetails {
  features: string[];
  benefits: string[];
  process: { title: string; desc: string }[];
  safetyMeasures: string[];
  faqs: { question: string; answer: string }[];
  duration: string;
  warranty: string;
}

const SERVICE_ENRICHMENTS: Record<string, EnrichedDetails> = {
  "cockroach-control": {
    duration: "45 - 60 Mins",
    warranty: "90-Day Protection",
    features: [
      "Odorless gel bait application in kitchen & hidden nesting areas",
      "Perimeter spray along baseboards, drainage lines, and wall crevices",
      "Targeted elimination of German, American, and Oriental cockroach species",
      "Preventative barrier application to eliminate egg clusters",
    ],
    benefits: [
      "No need to vacate or empty kitchen cabinets",
      "Odorless, non-toxic, and completely child & pet safe",
      "Gel cascade technology targets cockroach colonies directly",
      "Instant knockdown with residual multi-month protection",
    ],
    process: [
      { title: "Inspection & Nest Mapping", desc: "Identifying nesting sites, moisture sources, and entry points." },
      { title: "Gel & Spray Application", desc: "Precision placement of matrix gel bait and eco-friendly residual spray." },
      { title: "Drainage Flush", desc: "Specialized pipe flush treatment to kill hidden eggs and nymph clusters." },
      { title: "Prevention Advice", desc: "Customized sanitation and sealing guidance to prevent future infestations." },
    ],
    safetyMeasures: [
      "HACCP & CIB certified eco-friendly gel formulations",
      "Child-safe and pet-safe chemical dosages",
      "No pungent fumes or food container removal required",
      "Certified technicians following strict PPE standards",
    ],
    faqs: [
      { question: "Do I need to leave my kitchen or home during treatment?", answer: "No, our gel baiting technology is completely odorless and non-disruptive. You can remain comfortably inside your home." },
      { question: "How long does it take for cockroaches to disappear completely?", answer: "You will notice a drastic reduction within 24–48 hours, with total colony elimination within 7 to 10 days." },
      { question: "Is this service covered by warranty?", answer: "Yes! All our cockroach treatments come with a standard 90-day service warranty." },
    ],
  },
  "mosquito-fumigation": {
    duration: "60 - 90 Mins",
    warranty: "30-Day Protection",
    features: [
      "Thermal fogging for dense outdoor foliage, lawn, and drain areas",
      "Cold misting fogger for indoor corridors, basements, and balconies",
      "Larvicidal treatment in standing water sumps and drains",
      "Residual barrier spray on outdoor walls and garden boundaries",
    ],
    benefits: [
      "Rapid reduction of adult mosquito swarms within hours",
      "Destroys mosquito breeding grounds and egg clusters",
      "Protects family from Dengue, Chikungunya, and Malaria viruses",
      "WHO-compliant formulations suitable for homes, societies, and events",
    ],
    process: [
      { title: "Breeding Site Audit", desc: "Locating stagnant water, sumps, dense foliage, and dark hiding spots." },
      { title: "Larvicidal Spray", desc: "Applying biological larvicides to eliminate larvae at the source." },
      { title: "Indoor Cold Misting", desc: "Micro-droplet misting inside balconies, lobbies, and damp corners." },
      { title: "Outdoor Thermal Fogging", desc: "Dense thermal fog around gardens, boundaries, and drainage networks." },
    ],
    safetyMeasures: [
      "Eco-friendly WHO-approved larvicides and pyrethroids",
      "Odourless indoor cold mist solutions",
      "Safe distance protocols during thermal fogging",
      "Compliant with municipal environmental health regulations",
    ],
    faqs: [
      { question: "Is mosquito fogging safe for garden plants and pets?", answer: "Yes. Our outdoor fogging chemicals target mosquitoes while remaining harmless to garden foliage once settled." },
      { question: "How often should mosquito fumigation be done?", answer: "During peak mosquito seasons (monsoons), we recommend fortnightly or monthly treatment for continuous protection." },
    ],
  },
  "residential-pest-control": {
    duration: "60 - 90 Mins",
    warranty: "90-Day Protection",
    features: [
      "360-degree home protection against cockroaches, ants, spiders, and silverfish",
      "Dual gel + spray treatment across kitchen, bathrooms, bedrooms, and balcony",
      "Drainage pipe treatment to stop pest entry from municipal lines",
      "Free inspection and customized home hygiene assessment",
    ],
    benefits: [
      "Complete peace of mind with whole-home coverage",
      "Odourless formulations safe for children, seniors, and house pets",
      "Discreet and fast service executed by background-verified experts",
      "Hassle-free 90-day warranty with complimentary re-treatments",
    ],
    process: [
      { title: "Home Mapping", desc: "Checking corners, furniture bases, false ceilings, and plumbing lines." },
      { title: "Targeted Gel Application", desc: "Odourless gel dots inside kitchen cabinets, drawers, and behind appliances." },
      { title: "Perimeter Spraying", desc: "Odourless residual spray along skirting lines and balcony perimeters." },
      { title: "Post-Service Sign-Off", desc: "Detailed service report provided along with key prevention guidelines." },
    ],
    safetyMeasures: [
      "Government-registered odorless pest control chemicals",
      "Zero-stain technology for walls, curtains, and high-end furniture",
      "Full PPE gear worn by technicians during application",
      "Child and pet friendly active ingredients",
    ],
    faqs: [
      { question: "How long does a residential treatment take?", answer: "A standard 2BHK or 3BHK home treatment takes approximately 60 to 90 minutes." },
      { question: "Do I need to clean before or after the service?", answer: "Basic dry dusting prior to service is helpful. Avoid washing floors immediately after spray application for at least 2 hours." },
    ],
  },
  "rodent-control": {
    duration: "45 - 60 Mins",
    warranty: "60-Day Protection",
    features: [
      "Tamper-proof bait stations installed along rodent runways and perimeter lines",
      "Heavy-duty glue boards for ceiling, false ceiling, and pantry areas",
      "Rodent-proofing inspection to identify entry gaps in doors, pipes, and vents",
      "Multi-catch mechanical traps for high-density rodent activity",
    ],
    benefits: [
      "Prevents severe electrical wire gnawing and fire hazards",
      "Eliminates disease transmission risks like Leptospirosis and Hantavirus",
      "Protects stored grains, food items, and wooden assets from damage",
      "Sanitary carcass removal and sanitization guidance",
    ],
    process: [
      { title: "Runway & Nest Survey", desc: "Locating droppings, gnaw marks, grease trails, and burrow holes." },
      { title: "Proofing Advice & Sealing", desc: "Identifying structural gaps needing wire mesh or sealant." },
      { title: "Bait & Trap Placement", desc: "Strategic setup of tamper-proof bait boxes and adhesive traps." },
      { title: "Monitoring & Follow-up", desc: "Follow-up visit to monitor bait consumption and remove captured rodents." },
    ],
    safetyMeasures: [
      "Lockable, tamper-evident bait boxes safe around kids and pets",
      "Single-feed anticoagulant baits preventing immediate secondary poisoning",
      "Hygienic disposal protocols by trained technician team",
    ],
    faqs: [
      { question: "Where do rodents usually die after eating the bait?", answer: "Our anti-coagulant baits cause rodents to feel dehydrated, encouraging them to move outside toward open air before dying." },
      { question: "Are rodent bait boxes safe if my pet touches them?", answer: "Yes, our bait boxes are locked and made from heavy-duty polymer that pets cannot open or chew through." },
    ],
  },
  "bed-bug-treatment": {
    duration: "90 - 120 Mins",
    warranty: "90-Day Guarantee",
    features: [
      "High-temperature steam treatment targeting bed bug eggs and nymphs",
      "Dual chemical spray for mattress seams, headboards, and sofa crevices",
      "Crack and crevice dust injection into wall sockets and wooden joints",
      "Two-session treatment protocol for 100% infestation eradication",
    ],
    benefits: [
      "Immediate relief from painful bed bug bites and sleepless nights",
      "Destroys eggs that are resistant to regular chemical sprays",
      "Protects expensive mattresses, furniture, and wall hangings",
      "90-day re-service warranty included with complete package",
    ],
    process: [
      { title: "Infestation Inspection", desc: "Checking seams, zippers, headboards, electrical outlets, and skirting." },
      { title: "Thermal Steam Treatment", desc: "High-heat steam treatment to instantly kill eggs and adult bugs." },
      { title: "Chemical Spraying", desc: "Comprehensive liquid spray application to all affected room perimeters." },
      { title: "Mandatory Follow-Up", desc: "2nd treatment scheduled after 10-14 days to catch newly hatched eggs." },
    ],
    safetyMeasures: [
      "Safe indoor botanical & synthetic pyrethroid combinations",
      "Non-staining solutions for fine bedding and fabric upholstery",
      "Clear ventilation guidelines provided post-application",
    ],
    faqs: [
      { question: "Why are two sessions required for bed bug treatment?", answer: "Bed bug eggs are resilient. The second session after 10–14 days ensures any newly hatched nymphs are destroyed before reproducing." },
      { question: "Do I need to throw away my mattress?", answer: "In 95%+ of cases, no! Our combination of steam heat and specialized sprays effectively restores your current mattress." },
    ],
  },
  "agri-advisory": {
    duration: "Customized",
    warranty: "Season Support",
    features: [
      "Comprehensive crop health and soil pest vulnerability assessment",
      "Organic & chemical integrated pest management (IPM) solutions",
      "Fungal, bacterial, and insect pest diagnosis by agrarian specialists",
      "Custom spraying schedule and dosage recommendations",
    ],
    benefits: [
      "Maximizes crop yield and minimizes pest damage losses",
      "Reduces chemical overuse, preserving soil health and earthworms",
      "Customized solutions for horticulture, paddy, sugarcane, and greenhouse crops",
      "Direct phone & on-site advisory support from agricultural experts",
    ],
    process: [
      { title: "Farm & Soil Audit", desc: "Analyzing crop condition, damage patterns, and soil moisture levels." },
      { title: "Pest Diagnosis", desc: "Microscopic and visual diagnosis of destructive agricultural pests." },
      { title: "IPM Strategy Plan", desc: "Designing a balanced biological and targeted chemical treatment schedule." },
      { title: "Implementation Support", desc: "Assisting with precision spraying equipment and periodic yield reviews." },
    ],
    safetyMeasures: [
      "Eco-compliant formulations adhering to agricultural safety standards",
      "Focus on bio-pesticides and natural predators where applicable",
      "Strict worker safety protocols during spray operations",
    ],
    faqs: [
      { question: "Is this suitable for small farms and polyhouses?", answer: "Yes! We cater to individual smallholdings, polyhouses, commercial nurseries, and large agricultural estates." },
      { question: "Do you supply bio-pesticides and organic remedies?", answer: "Yes, we prioritize biological control and eco-friendly organic remedies wherever feasible." },
    ],
  },
  "commercial-pest-control": {
    duration: "Scheduled AMC",
    warranty: "Annual Support",
    features: [
      "Custom Annual Maintenance Contracts (AMC) for offices, restaurants, and warehouses",
      "FSSAI & ISO audit-ready compliance documentation and trend analysis",
      "Discreet night or off-hour servicing to avoid business disruption",
      "Multi-pest coverage: Cockroaches, rodents, flies, ants, and mosquitoes",
    ],
    benefits: [
      "Ensures zero audit flags from health and food safety inspectors",
      "Protects brand reputation, client safety, and employee wellbeing",
      "Dedicated account manager and emergency response team",
      "Flexible payment terms and customized digital service logs",
    ],
    process: [
      { title: "Risk Assessment", desc: "Mapping high-risk zones, waste management points, and food handling areas." },
      { title: "IPM Deployment", desc: "Installing commercial bait stations, fly killers, and sealant barriers." },
      { title: "Routine Visits", desc: "Weekly, bi-weekly, or monthly visits depending on facility requirements." },
      { title: "Audit Documentation", desc: "Providing digital logs, chemical MSDS sheets, and compliance certificates." },
    ],
    safetyMeasures: [
      "HACCP-compliant, food-safe chemical formulations",
      "MSDS available for all products used on premises",
      "Trained technicians with uniform, ID badges, and safety certifications",
    ],
    faqs: [
      { question: "Can treatments be conducted during non-working hours?", answer: "Yes! We offer flexible scheduling, including late nights or Sundays, to avoid impacting operations." },
      { question: "Do you provide audit reports for food safety standards?", answer: "Yes, we provide complete audit documentation, service logbooks, chemical MSDS sheets, and certificates." },
    ],
  },
  "termite-control": {
    duration: "2 - 4 Hours",
    warranty: "5-Year Guarantee",
    features: [
      "Drill-Fill-Seal (DFS) chemistry technology for subterranean termites",
      "Non-repellent chemical barrier creating an undetectable kill zone",
      "Protection for wooden doors, window frames, wardrobes, and structural timber",
      "5-Year ironclad warranty with free annual checkups",
    ],
    benefits: [
      "Saves expensive wooden furniture and interior woodwork from total destruction",
      "Eradicates subterranean termite colonies deep inside building foundations",
      "Non-repellent chemicals allow termites to carry active agent back to queen",
      "Longest protection guarantee in the pest management industry",
    ],
    process: [
      { title: "Damage Mapping", desc: "Thermal/acoustic detection of mud tubes and hidden hollow wood structures." },
      { title: "Precision Drilling", desc: "12mm holes drilled at 1-foot intervals along wall-floor junctions." },
      { title: "Chemical Injection", desc: "High-pressure injection of termiticide matrix deep into walls and floor." },
      { title: "Sealing & Restoration", desc: "Holes sealed with matching color cement/silicone to leave zero visible trace." },
    ],
    safetyMeasures: [
      "Eco-friendly non-repellent termiticides with low mammalian toxicity",
      "Odourless indoor formulations",
      "Neat sealing finishes that match your tile/flooring shade",
    ],
    faqs: [
      { question: "Will drilling damage my floor tiles or walls?", answer: "No. Our technicians use specialized 12mm masonry drill bits and seal all holes with color-matched cement." },
      { question: "How long is the termite treatment warranty?", answer: "Our subterranean termite treatment comes with an ironclad 5-year warranty, including free periodic checkups." },
    ],
  },
};

/** Default fallback for unknown slugs */
const DEFAULT_ENRICHMENT: EnrichedDetails = {
  duration: "60 - 90 Mins",
  warranty: "30-Day Guarantee",
  features: [
    "Comprehensive property inspection & infestation mapping",
    "Application of government-certified, eco-friendly pest solutions",
    "Preventative sealing advice and residual barrier application",
    "Digital service report and post-treatment maintenance guidance",
  ],
  benefits: [
    "Immediate reduction of active pest activity",
    "Child-safe, pet-safe, and non-toxic chemical formulations",
    "Professional, background-verified technician deployment",
    "Comprehensive warranty with free re-treatment options",
  ],
  process: [
    { title: "Initial Inspection", desc: "Detailed audit of property perimeters, entry points, and nesting areas." },
    { title: "Targeted Treatment", desc: "Application of specialized, odorless chemicals or baiting systems." },
    { title: "Pest Exclusion", desc: "Guidance and minor sealing to prevent future entry." },
    { title: "Warranty & Follow-up", desc: "Service sign-off and continuous warranty support." },
  ],
  safetyMeasures: [
    "CIB-registered and WHO-approved pest control chemicals",
    "Technicians equipped with complete PPE kit and safety masks",
    "Non-staining, low-odor formulation safe for indoor spaces",
  ],
  faqs: [
    { question: "How quickly does the treatment take effect?", answer: "Most treatments yield visible results within 24 to 48 hours." },
    { question: "Is this service covered by warranty?", answer: "Yes, all treatments include our service guarantee and free follow-up support." },
  ],
};

function getIconForSlug(slug: string) {
  switch (slug) {
    case "residential-pest-control":
      return Home;
    case "commercial-pest-control":
      return Building2;
    case "rodent-control":
      return Mouse;
    case "mosquito-fumigation":
      return Cloud;
    case "bed-bug-treatment":
      return Bed;
    case "agri-advisory":
      return Leaf;
    case "termite-control":
      return Shield;
    case "cockroach-control":
    default:
      return Bug;
  }
}

export default function ServiceDetail({ params }: { params: { slug: string } }) {
  // Look up the service from static data first so the page renders instantly.
  const staticMatch = STATIC_SERVICES.find((s) => s.slug === params.slug) ?? null;
  const [service, setService] = useState<ServiceItem | null>(staticMatch);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Try the API for richer data (features, FAQs, etc.); fall back to static.
    apiFetch<ServiceItem>(`/services/${params.slug}`)
      .then((data) => setService(data))
      .catch(() => {
        // If static data had a match, keep it; otherwise show not-found.
        if (!staticMatch) setNotFound(true);
      });
  }, [params.slug]);

  if (notFound) {
    return (
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-4">
          <Bug className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Service Not Found</h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          The service you're looking for doesn't exist or has been updated.
        </p>
        <div className="mt-6">
          <Link href="/services">
            <Button size="lg" className="bg-primary text-primary-foreground">
              <ArrowLeft className="mr-2 w-4 h-4" /> Browse All Services
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-20 text-center">
        <div className="animate-pulse space-y-4 max-w-xl mx-auto">
          <div className="h-8 bg-muted rounded-lg w-3/4 mx-auto" />
          <div className="h-4 bg-muted rounded-lg w-1/2 mx-auto" />
          <div className="h-48 bg-muted rounded-2xl w-full mt-6" />
        </div>
      </main>
    );
  }

  const heroImage = `/images/services/${service.slug}.jpg`;
  const enrichment = SERVICE_ENRICHMENTS[service.slug] || DEFAULT_ENRICHMENT;
  const IconComponent = getIconForSlug(service.slug);

  const features =
    service.features && service.features.length > 0
      ? service.features
      : enrichment.features;

  const benefits =
    service.benefits && service.benefits.length > 0
      ? service.benefits
      : enrichment.benefits;

  const processSteps = enrichment.process;

  const safetyMeasures =
    service.safetyMeasures && service.safetyMeasures.length > 0
      ? service.safetyMeasures
      : enrichment.safetyMeasures;

  const faqs =
    service.faqs && service.faqs.length > 0
      ? service.faqs
      : enrichment.faqs;

  const relatedServices = STATIC_SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHero
        backgroundImage={heroImage}
        overlayOpacity={60}
        badge={
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent" />
            {service.category || "Pest Treatment"}
          </span>
        }
        title={service.name}
        subtitle={service.description}
        actions={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={`/quote?service=${service.slug}`}>
              <Button size="lg" className="btn-shine bg-accent text-accent-foreground hover:bg-accent/90 shadow-md font-semibold" data-testid="button-book-now">
                Book Treatment Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                <ArrowLeft className="mr-2 w-4 h-4" /> All Services
              </Button>
            </Link>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 lg:py-16 animate-fade-in">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </Link>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Service Content (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview & Quick Info Card */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="card-lift p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{service.name}</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Category: {service.category || "General Protection"}
                    </p>
                  </div>
                </div>

                {typeof service.basePrice === "number" && (
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block font-medium">Starting Price</span>
                    <span className="inline-block text-lg font-bold text-accent-foreground bg-accent/20 border border-accent/30 px-3.5 py-1 rounded-full">
                      ₹{service.basePrice}+
                    </span>
                  </div>
                )}
              </div>

              {/* Service Meta Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 text-sm">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/30">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Duration</span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm">{enrichment.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/30">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Warranty</span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm">{enrichment.warranty}</span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-3 rounded-xl bg-secondary/30">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Safety Level</span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm">100% Odorless & Safe</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Key Features */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-bold text-foreground">Treatment Highlights & Features</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feat, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-border/80 bg-card flex items-start gap-3 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed">{feat}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 4-Step Treatment Process */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div>
                <Badge variant="outline" className="mb-2 px-3 py-0.5 border-primary/30 text-primary bg-primary/5">
                  How It Works
                </Badge>
                <h3 className="text-2xl font-bold text-foreground">Our 4-Step Elimination Process</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {processSteps.map((step, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2 relative overflow-hidden">
                    <span className="absolute top-3 right-4 text-3xl font-black text-primary/10 select-none">
                      0{idx + 1}
                    </span>
                    <h4 className="font-bold text-foreground text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {step.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Service Benefits */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-6 sm:p-8 rounded-3xl border border-primary/20 bg-primary/5 space-y-6"
            >
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Key Service Benefits</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Safety & Eco Standards */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-6 rounded-3xl border border-border bg-card space-y-4"
            >
              <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                <Shield className="w-5 h-5 text-success" />
                <span>Safety & Eco-Friendliness Standards</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                {safetyMeasures.map((measure, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* FAQs Accordion */}
            {faqs.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">Frequently Asked Questions</h3>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-3">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border border-border rounded-2xl px-5 bg-card overflow-hidden">
                      <AccordionTrigger className="py-4 text-left font-semibold text-foreground hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.section>
            )}
          </div>

          {/* Sticky Sidebar (1 Col on lg) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Action Booking Box */}
              <div className="p-6 rounded-3xl border border-border bg-card shadow-md space-y-6">
                <div>
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider block mb-1">
                    Book Service
                  </span>
                  <h3 className="text-2xl font-bold text-foreground">{service.name}</h3>
                  {typeof service.basePrice === "number" && (
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-primary">₹{service.basePrice}</span>
                      <span className="text-xs text-muted-foreground font-medium">+ taxes (Starting price)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span>Free Inspection Included</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span>30-Day Hassle-Free Warranty</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span>Background-Verified Technicians</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Link href={`/quote?service=${service.slug}`}>
                    <Button size="lg" className="w-full btn-shine bg-accent text-accent-foreground hover:bg-accent/90 shadow-md font-semibold" data-testid="button-book-now">
                      Book Now
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>

                  <a href="tel:+919876543210" className="block">
                    <Button variant="outline" size="lg" className="w-full border-border hover:bg-secondary">
                      <Phone className="mr-2 w-4 h-4 text-primary" /> Call Us Directly
                    </Button>
                  </a>
                </div>
              </div>

              {/* Trust Box */}
              <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-foreground text-sm">Utkal Guarantee</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If pests return within the warranty period, our team will re-treat your premises at zero additional charge.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Services Section */}
        {relatedServices.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Explore Other Pest Services</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete pest management options for every corner of your property.
                </p>
              </div>
              <Link href="/services" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedServices.map((rel, idx) => (
                <motion.div
                  key={rel._id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <Link
                    href={`/services/${rel.slug}`}
                    className="group card-interactive block rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <ServiceCardImage slug={rel.slug} alt={rel.name} height="h-40" />
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base line-clamp-1">
                        {rel.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{rel.description}</p>
                      {typeof rel.basePrice === "number" && (
                        <div className="pt-2 text-xs font-semibold text-primary flex items-center justify-between">
                          <span>Starting at ₹{rel.basePrice}</span>
                          <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            View <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
