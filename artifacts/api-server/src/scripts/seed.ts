import { dbConnect } from "../lib/mongo";
import { Service, User, Technician, Booking, Review, Invoice, Notification } from "../models";
import { generateBookingNumber, generateInvoiceNumber } from "../lib/ids";
import { logger } from "../lib/logger";

const SERVICE_AREAS = (process.env.BUSINESS_SERVICE_AREAS ?? "Your City")
  .split(",")
  .map((s) => s.trim());

async function seed() {
  await dbConnect();
  logger.info("Connected to MongoDB");

  await Promise.all([
    Service.deleteMany({}),
    User.deleteMany({}),
    Technician.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Invoice.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const services = await Service.create([
    {
      name: "Residential Pest Control",
      slug: "residential-pest-control",
      category: "Residential",
      description: "Safe home pest management",
      basePrice: 1200,
      icon: "home",
      duration: "1-2 hours",
      features: ["General pest treatment", "Child & pet safe chemicals", "90-day warranty"],
      benefits: ["Family-safe formulations", "Odourless treatment options", "Long-lasting protection"],
      process: ["Inspection", "Treatment plan", "Application", "Follow-up visit"],
      safetyMeasures: ["Government-approved chemicals", "Certified technicians", "Ventilation guidance provided"],
      faqs: [
        { question: "Is it safe for kids and pets?", answer: "Yes, we use low-toxicity, approved formulations." },
        { question: "How long does protection last?", answer: "Typically 90 days, depending on infestation level." },
      ],
    },
    {
      name: "Commercial Pest Control",
      slug: "commercial-pest-control",
      category: "Commercial",
      description: "Pest solutions for businesses",
      basePrice: 3500,
      icon: "building",
      duration: "2-4 hours",
      features: ["Scheduled AMC visits", "Compliance documentation", "Discreet treatment"],
      benefits: ["Protect brand reputation", "Meet health & safety audits", "Minimal business disruption"],
      process: ["Site survey", "Custom AMC plan", "Scheduled treatments", "Reporting"],
      safetyMeasures: ["Off-hours scheduling available", "Trained commercial-grade technicians"],
      faqs: [{ question: "Do you offer AMC contracts?", answer: "Yes, monthly and quarterly AMC plans are available." }],
    },
    {
      name: "Termite Control",
      slug: "termite-control",
      category: "Specialist",
      description: "Termite inspection and treatment",
      basePrice: 5000,
      icon: "bug",
      duration: "3-5 hours",
      features: ["Pre/post construction treatment", "Soil & wood treatment", "5-year warranty available"],
      benefits: ["Protects structural investment", "Long warranty options"],
      process: ["Inspection", "Drilling & treatment", "Sealing", "Warranty documentation"],
      safetyMeasures: ["Licensed termiticides", "Post-treatment ventilation guidance"],
      faqs: [{ question: "How long is the warranty?", answer: "Up to 5 years depending on the plan chosen." }],
    },
    {
      name: "Rodent Control",
      slug: "rodent-control",
      category: "Rodent",
      description: "Rodent trapping and proofing",
      basePrice: 1800,
      icon: "mouse",
      duration: "1-2 hours",
      features: ["Trapping & baiting", "Entry point sealing", "Follow-up inspection"],
      benefits: ["Reduces property damage", "Improves hygiene"],
      process: ["Inspection", "Trap/bait placement", "Sealing entry points", "Follow-up"],
      safetyMeasures: ["Tamper-resistant bait stations", "Pet-safe placements"],
      faqs: [],
    },
    {
      name: "Mosquito & Fumigation",
      slug: "mosquito-fumigation",
      category: "Mosquito",
      description: "Mosquito fogging and fumigation",
      basePrice: 1500,
      icon: "cloud",
      duration: "1 hour",
      features: ["Cold fogging", "Larvicide treatment", "Outdoor & indoor coverage"],
      benefits: ["Reduces mosquito-borne disease risk", "Fast-acting"],
      process: ["Site assessment", "Fogging", "Larvicide application"],
      safetyMeasures: ["Vacate premises during fogging", "Ventilate for 30 minutes after"],
      faqs: [],
    },
    {
      name: "Bed Bug Treatment",
      slug: "bed-bug-treatment",
      category: "Specialist",
      description: "Bed bug heat and chemical treatment",
      basePrice: 4000,
      icon: "bed",
      duration: "2-3 hours",
      features: ["Heat treatment option", "Mattress & furniture treatment", "Follow-up visit included"],
      benefits: ["Eliminates infestation at all life stages", "Discreet service"],
      process: ["Inspection", "Heat/chemical treatment", "Follow-up check"],
      safetyMeasures: ["EPA-approved products", "Room vacating during heat treatment"],
      faqs: [],
    },
    {
      name: "Cockroach & General Pest Control",
      slug: "cockroach-control",
      category: "General",
      description: "Cockroach and general pests",
      basePrice: 900,
      icon: "cockroach",
      duration: "1 hour",
      features: ["Gel baiting", "Crack & crevice treatment"],
      benefits: ["Low odour", "Fast results"],
      process: ["Inspection", "Gel application", "Monitoring"],
      safetyMeasures: ["Child & pet-safe gel formulations"],
      faqs: [],
    },
    {
      name: "Agricultural Pest Advisory",
      slug: "agri-advisory",
      category: "Agriculture",
      description: "Crop pest advisory and treatment",
      basePrice: 2500,
      icon: "leaf",
      duration: "Varies",
      features: ["Crop-specific advisory", "Field visits", "Organic options"],
      benefits: ["Improves crop yield", "Reduces pesticide overuse"],
      process: ["Field assessment", "Advisory report", "Treatment (optional)"],
      safetyMeasures: ["Compliant with agricultural safety norms"],
      faqs: [],
    },
  ]);

  const customers = await User.create([
    { name: "Sita Mohanty", email: "sita@example.com", phone: "7000000001", role: "customer" },
    { name: "Ravi Das", email: "ravi@example.com", phone: "7000000002", role: "customer" },
    { name: "Anita Sen", email: "anita@example.com", phone: "7000000003", role: "customer" },
    { name: "Prakash Kumar", email: "prakash@example.com", phone: "7000000004", role: "customer" },
    { name: "Lila Rao", email: "lila@example.com", phone: "7000000005", role: "customer" },
    { name: "Admin User", email: "admin@example.com", phone: "7000000010", role: "admin" },
  ]);

  const techUsers = await User.create([
    { name: "Ramesh Tech", email: "ramesh.tech@example.com", phone: "7000000021", role: "technician" },
    { name: "Suman Tech", email: "suman.tech@example.com", phone: "7000000022", role: "technician" },
    { name: "Bipin Tech", email: "bipin.tech@example.com", phone: "7000000023", role: "technician" },
    { name: "Kunal Tech", email: "kunal.tech@example.com", phone: "7000000024", role: "technician" },
    { name: "Neha Tech", email: "neha.tech@example.com", phone: "7000000025", role: "technician" },
  ]);

  await Technician.create(
    techUsers.map((u) => ({
      userId: u._id,
      availability: [{ day: "Mon-Fri", from: "09:00", to: "18:00" }],
      rating: 4.6,
      specialties: ["General Pest Control"],
    })),
  );

  const bookingsData = [];
  for (let i = 0; i < 15; i++) {
    const cust = customers[i % customers.length];
    const svc = services[i % services.length];
    const tech = techUsers[i % techUsers.length];
    const status = i % 6 === 0 ? "completed" : i % 5 === 0 ? "cancelled" : "pending";
    bookingsData.push({
      bookingNumber: generateBookingNumber(),
      customerId: cust._id,
      serviceId: svc._id,
      technicianId: tech._id,
      address: {
        line1: `House ${i + 1}`,
        city: SERVICE_AREAS[0] ?? "Your City",
        state: "",
        pincode: "000000",
      },
      propertyType: i % 2 === 0 ? "residential" : "commercial",
      scheduledDate: new Date(Date.now() + (i - 7) * 86400000),
      timeSlot: "10:00-12:00",
      status,
      statusHistory: [{ status, changedAt: new Date() }],
      price: svc.basePrice,
      paymentStatus: i % 3 === 0 ? "paid" : "pending",
    });
  }

  const bookings = await Booking.create(bookingsData);

  const completedBookings = bookings.filter((b) => b.status === "completed");
  for (const booking of completedBookings) {
    const tax = Math.round((booking.price ?? 0) * 0.18);
    await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      bookingId: booking._id,
      customerId: booking.customerId,
      amount: booking.price ?? 0,
      tax,
      total: (booking.price ?? 0) + tax,
      status: booking.paymentStatus === "paid" ? "paid" : "unpaid",
    });
  }

  await Review.create([
    { bookingId: bookings[0]._id, serviceId: bookings[0].serviceId, customerId: bookings[0].customerId, rating: 5, comment: "Excellent service, very professional." },
    { bookingId: bookings[2]._id, serviceId: bookings[2].serviceId, customerId: bookings[2].customerId, rating: 4, comment: "Good job, arrived on time." },
    { bookingId: bookings[4]._id, serviceId: bookings[4].serviceId, customerId: bookings[4].customerId, rating: 5, comment: "Great results!" },
    { bookingId: bookings[6]._id, serviceId: bookings[6].serviceId, customerId: bookings[6].customerId, rating: 4, comment: "Friendly technician." },
    { bookingId: bookings[8]._id, serviceId: bookings[8].serviceId, customerId: bookings[8].customerId, rating: 5, comment: "Quick and effective." },
  ]);

  await Notification.create(
    bookings.slice(0, 5).map((b) => ({
      userId: b.customerId,
      type: "booking_confirmed" as const,
      title: "Booking received",
      message: `Your booking ${b.bookingNumber} has been received.`,
      relatedBookingId: b._id,
    })),
  );

  logger.info("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
