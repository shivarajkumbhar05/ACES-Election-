import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import bcrypt from "bcrypt";
import app from "../app";
import Admin from "../models/Admin";
import Election from "../models/Election";

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri(), { dbName: "aces_admin_test" });
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Admin auth & election lifecycle", () => {
  it("rejects invalid admin login", async () => {
    await Admin.create({ username: "admin", passwordHash: await bcrypt.hash("correct-pass", 10), role: "SUPER_ADMIN" });
    const res = await request(app).post("/api/admin/login").send({ username: "admin", password: "wrong-pass" });
    expect(res.status).toBe(401);
  });

  it("logs in with valid credentials and returns a JWT", async () => {
    await Admin.create({ username: "admin", passwordHash: await bcrypt.hash("correct-pass", 10), role: "SUPER_ADMIN" });
    const res = await request(app).post("/api/admin/login").send({ username: "admin", password: "correct-pass" });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it("rejects protected routes without a token", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("rejects ending an election with the wrong administrator password", async () => {
    const admin = await Admin.create({ username: "admin", passwordHash: await bcrypt.hash("correct-pass", 10), role: "SUPER_ADMIN" });
    const login = await request(app).post("/api/admin/login").send({ username: "admin", password: "correct-pass" });
    const token = login.body.data.token;

    const election = await Election.create({
      name: "E1",
      department: "Computer Engineering",
      status: "LIVE",
      startAt: new Date(),
      endAt: new Date(Date.now() + 3600_000),
      createdBy: admin._id,
    });

    const res = await request(app)
      .post("/api/admin/election/end")
      .set("Authorization", `Bearer ${token}`)
      .send({ electionId: String(election._id), password: "wrong" });

    expect(res.status).toBe(401);
  });

  it("ends an election with the correct password", async () => {
    const admin = await Admin.create({ username: "admin", passwordHash: await bcrypt.hash("correct-pass", 10), role: "SUPER_ADMIN" });
    const login = await request(app).post("/api/admin/login").send({ username: "admin", password: "correct-pass" });
    const token = login.body.data.token;

    const election = await Election.create({
      name: "E1",
      department: "Computer Engineering",
      status: "LIVE",
      startAt: new Date(),
      endAt: new Date(Date.now() + 3600_000),
      createdBy: admin._id,
    });

    const res = await request(app)
      .post("/api/admin/election/end")
      .set("Authorization", `Bearer ${token}`)
      .send({ electionId: String(election._id), password: "correct-pass" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ENDED");
  });
});
