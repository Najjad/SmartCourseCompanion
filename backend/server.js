require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const usersRoute = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

if (!MONGO_URI) {
  console.error("Missing MONGO_URI. Create backend/.env or copy backend/.env.example first.");
  process.exit(1);
}

const client = new MongoClient(MONGO_URI);

async function connectDB() {
  try {
    await client.connect();

    const db = client.db("smartcoursecompanion");

    const usersCollection = db.collection("users");
    const demoUsers = [
      { email: "student@test.com", password: "1234", role: "student" },
      { email: "admin@test.com", password: "1234", role: "admin" },
    ];

    for (const demoUser of demoUsers) {
      const existingUser = await usersCollection.findOne({ email: demoUser.email });
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);

      if (!existingUser) {
        await usersCollection.insertOne({
          email: demoUser.email,
          password: hashedPassword,
          role: demoUser.role,
          courses: [],
          createdAt: new Date(),
        });
        continue;
      }


      const needsPasswordRepair =
        !existingUser.password || typeof existingUser.password !== "string" || !existingUser.password.startsWith("$2");

      if (needsPasswordRepair || existingUser.role !== demoUser.role) {
        await usersCollection.updateOne(
          { _id: existingUser._id },
          {
            $set: {
              password: hashedPassword,
              role: demoUser.role,
            },
            $setOnInsert: {
              courses: [],
              createdAt: new Date(),
            },
          }
        );
      }
    }

    // make db accessible in routes
    app.locals.db = db;

    console.log("MongoDB connected");

    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Server running on http://127.0.0.1:${PORT}`);
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Register routes
app.use("/api/users", usersRoute);
connectDB();
