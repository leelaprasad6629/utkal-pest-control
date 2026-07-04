import { dbConnect } from "../lib/mongo";
import { Service, User, Technician, Booking, Review } from "../models";
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
  ]);

  const services = await Service.create([
    {
      name: "Residential Pest Control",
      slug: "residential-pest-control",
      category: "Residential",
      description: "Safe home pest management",
      basePrice: 1200,
      icon: "home",
    },
    {
      name: "Commercial Pest Control",
      slug: "commercial-pest-control",
      category: "Commercial",
      description: "Pest solutions for businesses",
      basePrice: 3500,
      icon: "building",
    },
    {
      name: "Termite Control",
      slug: "termite-control",
      category: "Specialist",
      description: "Termite inspection and treatment",
      basePrice: 5000,
      icon: "bug",
    },
    {
      name: "Rodent Control",
      slug: "rodent-control",
      category: "Rodent",
      description: "Rodent trapping and proofing",
      basePrice: 1800,
      icon: "mouse",
    },
    {
      name: "Mosquito & Fumigation",
      slug: "mosquito-fumigation",
      category: "Mosquito",
      description: "Mosquito fogging and fumigation",
      basePrice: 1500,
      icon: "cloud",
    },
    {
      name: "Bed Bug Treatment",
      slug: "bed-bug-treatment",
      category: "Specialist",
      description: "Bed bug heat and chemical treatment",
      basePrice: 4000,
      icon: "bed",
    },
    {
      name: "Cockroach & General Pest Control",
      slug: "cockroach-control",
      category: "General",
      description: "Cockroach and general pests",
      basePrice: 900,
      icon: "cockroach",
    },
    {
      name: "Agricultural Pest Advisory",
      slug: "agri-advisory",
      category: "Agriculture",
      description: "Crop pest advisory and treatment",
      basePrice: 2500,
      icon: "leaf",
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
    })),
  );

  const bookingsData = [];
  for (let i = 0; i < 15; i++) {
    const cust = customers[i % customers.length];
    const svc = services[i % services.length];
    const tech = techUsers[i % techUsers.length];
    bookingsData.push({
      customerId: cust._id,
      serviceId: svc._id,
      technicianId: tech._id,
      address: {
        line1: `House ${i + 1}`,
        city: SERVICE_AREAS[0] ?? "Your City",
        state: "",
        pincode: "000000",
      },
      scheduledDate: new Date(Date.now() + (i - 7) * 86400000),
      timeSlot: "10:00-12:00",
      status: i % 6 === 0 ? "completed" : "pending",
      price: svc.basePrice,
      paymentStatus: i % 3 === 0 ? "paid" : "pending",
    });
  }

  const bookings = await Booking.create(bookingsData);

  await Review.create([
    { bookingId: bookings[0]._id, customerId: bookings[0].customerId, rating: 5, comment: "Excellent service, very professional." },
    { bookingId: bookings[2]._id, customerId: bookings[2].customerId, rating: 4, comment: "Good job, arrived on time." },
    { bookingId: bookings[4]._id, customerId: bookings[4].customerId, rating: 5, comment: "Great results!" },
    { bookingId: bookings[6]._id, customerId: bookings[6].customerId, rating: 4, comment: "Friendly technician." },
    { bookingId: bookings[8]._id, customerId: bookings[8].customerId, rating: 5, comment: "Quick and effective." },
  ]);

  logger.info("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
