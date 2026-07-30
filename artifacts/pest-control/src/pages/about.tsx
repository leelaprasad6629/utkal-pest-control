import { motion } from "framer-motion";
import { Link } from "wouter";
import PageHero from "@/components/page-hero";
import { SERVICE_AREAS, BUSINESS_NAME, TAGLINE } from "@/config/business";
import {
  ShieldCheck,
  Award,
  Leaf,
  Target,
  Eye,
  Users,
  TrendingUp,
  CheckCircle2,
  Briefcase,
  Calendar,
  MapPin,
  Sparkles,
  Phone,
  ArrowRight,
} from "lucide-react";

// Existing REASONS enhanced with detailed descriptions and icons
const REASONS = [
  {
    title: "Professional Certified Technicians",
    description: "Our government-certified specialists undergo continuous training on advanced pest control protocols and safety standards.",
    icon: Briefcase,
  },
  {
    title: "Eco-Friendly & Safe Treatments",
    description: "Odourless, bio-degradable chemical solutions safe for children, pets, elderly residents, and sensitive indoor environments.",
    icon: Leaf,
  },
  {
    title: "Transparent Pricing & Guarantees",
    description: "Clear upfront quotes with zero hidden fees, backed by our robust service guarantee and free re-treatment pledge.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Response Time Across Service Areas",
    description: "Prompt local dispatch teams reaching your doorstep swiftly for both emergency outbreaks and routine visits.",
    icon: TrendingUp,
  },
];

const TIMELINE = [
  {
    year: "2010",
    title: "Company Founded",
    description: "Started operations with a vision to provide safe, scientific, and eco-conscious pest management services.",
    badge: "Inception",
  },
  {
    year: "2015",
    title: "Expanded Service Network",
    description: "Broadened coverage across commercial hubs, hospitalities, corporate parks, and industrial complexes.",
    badge: "Growth",
  },
  {
    year: "2020",
    title: "10,000+ Customers Milestone",
    description: "Crossed 10,000 satisfied residential and commercial clients with a 98% retention and referral rate.",
    badge: "Milestone",
  },
  {
    year: "2025",
    title: "PAN India Service Network",
    description: "Extended presence across major urban centers nationwide, introducing digital inspection reports and smart pest tracking.",
    badge: "Pan-India",
  },
];

const CERTIFICATIONS = [
  {
    title: "Govt. Approved & Licensed",
    code: "Reg. #PC-OD-2010-89",
    description: "Fully licensed by state authorities to store, handle, and execute professional pest treatments.",
    icon: ShieldCheck,
  },
  {
    title: "ISO 9001:2015 Certified",
    code: "Quality Assurance",
    description: "Internationally certified quality management systems for pest management and sanitation standards.",
    icon: Award,
  },
  {
    title: "Eco-Safe Certified",
    code: "Green Tech Standard",
    description: "100% bio-degradable chemical solutions approved for organic and ecologically sensitive settings.",
    icon: Leaf,
  },
  {
    title: "CIB & RC Approved",
    code: "Govt Chemical Standards",
    description: "All products registered under Central Insecticides Board and Registration Committee norms.",
    icon: CheckCircle2,
  },
];

const STATS = [
  { label: "Years Experience", value: "15+", icon: Calendar, description: "Delivering trusted service since 2010" },
  { label: "Satisfied Customers", value: "10,000+", icon: Users, description: "Homes and commercial spaces protected" },
  { label: "Service Areas", value: "25+", icon: MapPin, description: "Covering cities and rural territories" },
  { label: "Client Satisfaction", value: "98%", icon: Award, description: "Positive rating and recurring contracts" },
];

const TEAM = [
  {
    name: "Rajesh Kumar",
    role: "Founder & Managing Director",
    initials: "RK",
    bgColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    bio: "18+ years experience in urban pest management, spearheading sustainable pest control practices.",
  },
  {
    name: "Dr. Sunita Mohanty",
    role: "Chief Entomologist",
    initials: "SM",
    bgColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    bio: "Ph.D. in Entomology, directing research in non-toxic chemical formulations and safe urban protocols.",
  },
  {
    name: "Amitabh Roy",
    role: "Head of Field Operations",
    initials: "AR",
    bgColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    bio: "Oversees dispatch logistics, safety compliance audits, and emergency response teams across regions.",
  },
  {
    name: "Priya Sharma",
    role: "Client Relations Manager",
    initials: "PS",
    bgColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    bio: "Ensures seamless customer support, service guarantees, and quick resolution for all client inquiries.",
  },
];

export default function About() {
  const scrollReveal = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* 1. HERO SECTION */}
      <PageHero
        backgroundImage="/images/heroes/about-hero.jpg"
        overlayOpacity={50}
        badge="About Us"
        title={`About ${BUSINESS_NAME}`}
        subtitle={`Trusted eco-friendly pest control serving households and businesses with certified, safe, and effective methods.`}
      />

      {/* 2. COMPANY STORY SECTION */}
      <section className="py-16 md:py-24 section-gradient-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...scrollReveal}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Story Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Our Heritage & Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Protecting Spaces & Health with Integrity Since 2010
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Founded with a strong belief that effective pest management shouldn't compromise health or the environment, <strong className="text-foreground">{BUSINESS_NAME}</strong> has evolved into a premier pest control partner across Eastern India and nationwide.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                From residential apartments to large-scale food processing facilities, hospitals, and corporate offices, our expert entomologists and certified technicians use precision target-treatments. We eliminate pest threats at their source while keeping human and pet safety as our absolute highest priority.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
                  <div className="text-2xl font-bold text-primary">100% Eco-Safe</div>
                  <div className="text-xs text-muted-foreground mt-1">Non-toxic & odorless solutions</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
                  <div className="text-2xl font-bold text-primary">Certified Staff</div>
                  <div className="text-xs text-muted-foreground mt-1">Government authorized specialists</div>
                </div>
              </div>
            </div>

            {/* Story Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border group">
                <img
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80"
                  alt="Pest control professional inspecting home"
                  className="w-full h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-background/90 backdrop-blur-md border border-border shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Targeted & Guaranteed Results</p>
                      <p className="text-xs text-muted-foreground">Every treatment customized to pest biology & environment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. TIMELINE SECTION */}
      <section className="py-16 md:py-24 section-gradient-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...scrollReveal} className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-3">
              <Calendar className="w-3.5 h-3.5" />
              Company Milestones
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Our Growth Journey
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg">
              A timeline of dedication, service expansion, and technical excellence over 15+ years.
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Center line for vertical timeline on md+ */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border" />

            <div className="space-y-8 md:space-y-12">
              {TIMELINE.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`relative flex flex-col md:flex-row items-center ${
                      isEven ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Content Box */}
                    <div className="w-full md:w-1/2 px-0 md:px-8">
                      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-2xl font-extrabold text-primary">{item.year}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/20 text-accent-foreground">
                            {item.badge}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Timeline Node Badge in center */}
                    <div className="my-4 md:my-0 flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-md border-4 border-background z-10">
                      {idx + 1}
                    </div>

                    {/* Empty placeholder for grid balance on md+ */}
                    <div className="hidden md:block w-1/2" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. MISSION & VISION */}
      <section className="py-16 md:py-24 section-gradient-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...scrollReveal} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Mission & Vision
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg">
              Guided by principles of safety, sustainability, and absolute client commitment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-2xl bg-card border border-border shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  To deliver reliable, eco-conscious, and scientific pest control solutions that protect health, hygiene, and property investments while maintaining the highest standard of client safety and transparent communication.
                </p>
              </div>
              <ul className="mt-6 space-y-2 pt-6 border-t border-border">
                {["100% Safe Formulations", "Tailored Site Solutions", "Guaranteed Re-treatment"].map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-2xl bg-card border border-border shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-xl bg-accent/20 text-accent-foreground flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  To be the most trusted and recognized pest management authority across India, setting benchmarks in eco-friendly chemical technologies, smart inspection tools, and customer-first service guarantees.
                </p>
              </div>
              <ul className="mt-6 space-y-2 pt-6 border-t border-border">
                {["Pan-India Network", "Digital Quality Audits", "Zero Environmental Harm"].map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. CERTIFICATIONS */}
      <section className="py-16 md:py-24 section-gradient-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...scrollReveal} className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-3">
              <Award className="w-3.5 h-3.5" />
              Verified & Certified
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Certifications & Standards
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg">
              Fully authorized, compliant, and adhering to strict international quality standards.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CERTIFICATIONS.map((cert, idx) => {
              const IconComp = cert.icon;
              return (
                <motion.div
                  key={cert.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 mx-auto">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground mb-2">
                      {cert.code}
                    </span>
                    <h3 className="text-lg font-bold text-foreground mb-2">{cert.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cert.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. STATISTICS */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...scrollReveal} className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center"
                >
                  <IconComp className="w-7 h-7 text-accent mb-3" />
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-white/90 mb-1">{stat.label}</div>
                  <div className="text-xs text-white/70">{stat.description}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 7. TEAM SECTION */}
      <section className="py-16 md:py-24 section-gradient-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...scrollReveal} className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-3">
              <Users className="w-3.5 h-3.5" />
              Leadership & Expertise
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg">
              Experienced entomologists, field specialists, and support professionals driving quality.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center"
              >
                {/* Initials Avatar */}
                <div
                  className={`w-20 h-20 rounded-full ${member.bgColor} flex items-center justify-center font-bold text-2xl shadow-inner mb-4`}
                >
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                <span className="text-xs font-semibold text-primary mb-3 block">{member.role}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SERVICE AREAS SECTION */}
      <section className="py-16 md:py-24 section-gradient-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...scrollReveal} className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-3">
              <MapPin className="w-3.5 h-3.5" />
              Coverage
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Service Areas
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg">
              Prompt response and local technician dispatch across all primary zones.
            </p>
          </motion.div>

          <motion.div
            {...scrollReveal}
            className="p-8 rounded-2xl bg-card border border-border shadow-md max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {SERVICE_AREAS.map((area) => (
                <div
                  key={area}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 border border-border/50 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{area}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="text-sm font-semibold text-foreground">Unsure if we service your location?</p>
                <p className="text-xs text-muted-foreground">We dispatch mobile units for nearby regions and special commercial contracts.</p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shrink-0"
              >
                Inquire Location
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. WHY CHOOSE US */}
      <section className="py-16 md:py-24 section-gradient-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...scrollReveal} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Why Choose {BUSINESS_NAME}?
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg">
              The advantages that set us apart as your long-term pest protection partner.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {REASONS.map((reason, idx) => {
              const IconComp = reason.icon;
              return (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1.5">{reason.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BOTTOM BANNER */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary via-[hsl(155,43%,18%)] to-[hsl(155,43%,12%)] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to live & work pest-free?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base">
            Contact our expert team today for a free inspection or instant quote tailored to your property.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/quote"
              className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent/90 transition-colors shadow-lg w-full sm:w-auto"
            >
              Get Free Quote
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
