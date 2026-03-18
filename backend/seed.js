// Database seeding script
// node seed.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const users = [
  // Python ↔ Guitar
  {
    name: "Aarav Mehta",
    email: "aarav@example.com",
    bio: "Backend developer who wants to learn guitar in his free time.",
    skillsOffered: ["Python", "Docker"],
    skillsWanted: ["Guitar", "Music Production"],
    skillCategories: [
      { skill: "Python", category: "Tech" },
      { skill: "Docker", category: "Tech" }
    ],
    rating: 4.7,
    totalReviews: 15,
  },
  {
    name: "Chloe Martin",
    email: "chloe@example.com",
    bio: "Music teacher and guitarist looking to break into programming.",
    skillsOffered: ["Guitar", "Music Production"],
    skillsWanted: ["Python", "JavaScript"],
    skillCategories: [
      { skill: "Guitar", category: "Music" },
      { skill: "Music Production", category: "Music" }
    ],
    rating: 4.3,
    totalReviews: 9,
  },

  // React ↔ Photoshop
  {
    name: "Daniel Kim",
    email: "daniel@example.com",
    bio: "Frontend engineer who could use some design chops.",
    skillsOffered: ["React", "JavaScript"],
    skillsWanted: ["Photoshop", "UI Design"],
    skillCategories: [
      { skill: "React", category: "Tech" },
      { skill: "JavaScript", category: "Tech" }
    ],
    rating: 4.5,
    totalReviews: 12,
  },
  {
    name: "Sofia Rossi",
    email: "sofia@example.com",
    bio: "Graphic designer eager to build her own portfolio site.",
    skillsOffered: ["Photoshop", "Drawing"],
    skillsWanted: ["React", "Excel"],
    skillCategories: [
      { skill: "Photoshop", category: "Design" },
      { skill: "Drawing", category: "Arts" }
    ],
    rating: 4.8,
    totalReviews: 18,
  },

  // Spanish ↔ Cooking
  {
    name: "Luis Hernandez",
    email: "luis@example.com",
    bio: "Native Spanish speaker who wants to master world cuisines.",
    skillsOffered: ["Spanish", "Public Speaking"],
    skillsWanted: ["Cooking", "Photography"],
    skillCategories: [
      { skill: "Spanish", category: "Language" },
      { skill: "Public Speaking", category: "Business" }
    ],
    rating: 4.1,
    totalReviews: 7,
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    bio: "Home chef and food blogger wanting to learn Spanish.",
    skillsOffered: ["Cooking", "Photography"],
    skillsWanted: ["Spanish", "English"],
    skillCategories: [
      { skill: "Cooking", category: "Cooking" },
      { skill: "Photography", category: "Arts" }
    ],
    rating: 4.6,
    totalReviews: 14,
  },

  // Machine Learning ↔ Video Editing
  {
    name: "James O'Brien",
    email: "james@example.com",
    bio: "ML researcher who needs to make better demo videos.",
    skillsOffered: ["Machine Learning", "Python"],
    skillsWanted: ["Video Editing", "Photoshop"],
    skillCategories: [
      { skill: "Machine Learning", category: "Science" },
      { skill: "Python", category: "Tech" }
    ],
    rating: 4.9,
    totalReviews: 20,
  },
  {
    name: "Yuki Tanaka",
    email: "yuki@example.com",
    bio: "Video editor curious about AI and machine learning.",
    skillsOffered: ["Video Editing", "Photography"],
    skillsWanted: ["Machine Learning", "Docker"],
    skillCategories: [
      { skill: "Video Editing", category: "Design" },
      { skill: "Photography", category: "Arts" }
    ],
    rating: 3.8,
    totalReviews: 5,
  },

  // UI Design ↔ Excel
  {
    name: "Emma Wilson",
    email: "emma@example.com",
    bio: "UI designer drowning in spreadsheets at work.",
    skillsOffered: ["UI Design", "Photoshop"],
    skillsWanted: ["Excel", "Finance"],
    skillCategories: [
      { skill: "UI Design", category: "Design" },
      { skill: "Photoshop", category: "Design" }
    ],
    rating: 4.4,
    totalReviews: 11,
  },
  {
    name: "Raj Patel",
    email: "raj@example.com",
    bio: "Financial analyst who wants to design better dashboards.",
    skillsOffered: ["Excel", "Finance"],
    skillsWanted: ["UI Design", "React"],
    skillCategories: [
      { skill: "Excel", category: "Business" },
      { skill: "Finance", category: "Finance" }
    ],
    rating: 3.9,
    totalReviews: 6,
  },

  // Public Speaking ↔ Yoga
  {
    name: "Olivia Chen",
    email: "olivia@example.com",
    bio: "Toastmasters champion looking for mindfulness practices.",
    skillsOffered: ["Public Speaking", "English"],
    skillsWanted: ["Yoga", "Cooking"],
    skillCategories: [
      { skill: "Public Speaking", category: "Business" },
      { skill: "English", category: "Language" }
    ],
    rating: 4.2,
    totalReviews: 8,
  },
  {
    name: "Ananya Iyer",
    email: "ananya@example.com",
    bio: "Yoga instructor who wants to get better at presenting.",
    skillsOffered: ["Yoga", "Tamil"],
    skillsWanted: ["Public Speaking", "English"],
    skillCategories: [
      { skill: "Yoga", category: "Fitness" },
      { skill: "Tamil", category: "Language" }
    ],
    rating: 4.7,
    totalReviews: 16,
  },

  // Photography ↔ JavaScript
  {
    name: "Marcus Lee",
    email: "marcus@example.com",
    bio: "Photographer who wants to build an interactive gallery site.",
    skillsOffered: ["Photography", "Video Editing"],
    skillsWanted: ["JavaScript", "React"],
    skillCategories: [
      { skill: "Photography", category: "Arts" },
      { skill: "Video Editing", category: "Design" }
    ],
    rating: 3.5,
    totalReviews: 3,
  },

  // Finance ↔ Drawing
  {
    name: "Nina Johansson",
    email: "nina@example.com",
    bio: "Illustrator who needs help managing freelance finances.",
    skillsOffered: ["Drawing", "UI Design"],
    skillsWanted: ["Finance", "Excel"],
    skillCategories: [
      { skill: "Drawing", category: "Arts" },
      { skill: "UI Design", category: "Design" }
    ],
    rating: 4.0,
    totalReviews: 4,
  },

  // English ↔ Tamil
  {
    name: "Tom Bradley",
    email: "tom@example.com",
    bio: "English tutor relocating to Chennai and learning Tamil.",
    skillsOffered: ["English", "Public Speaking"],
    skillsWanted: ["Tamil", "Yoga"],
    skillCategories: [
      { skill: "English", category: "Language" },
      { skill: "Public Speaking", category: "Business" }
    ],
    rating: 4.5,
    totalReviews: 13,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    console.log("Cleared existing users");

    const passwordHash = await bcrypt.hash("Password123", 10);

    const docs = users.map((u) => ({ ...u, passwordHash }));
    const created = await User.insertMany(docs);

    console.log(`Seeded ${created.length} users successfully`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
