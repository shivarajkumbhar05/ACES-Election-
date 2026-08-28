import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import app from "../app";
import Position from "../models/Position";
import Candidate from "../models/Candidate";
import Election from "../models/Election";
import VoterToken from "../models/VoterToken";
import { generateVoterToken, hashToken, tokenPreview } from "../utils/token";

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  // Transactions require a replica set even in-memory.
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri(), { dbName: "aces_test" });
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

async function seedMinimalElection() {
  const president = await Position.create({ name: "President", category: "TYCO", order: 1 });
  const candidateA = await Candidate.create({
    name: "Candidate A",
    enrollmentNo: "E1",
    className: "CE-3A",
    positionId: president._id,
    status: "ACTIVE",
  });
  const election = await Election.create({
    name: "Test Election",
    department: "Computer Engineering",
    status: "LIVE",
    startAt: new Date(),
    endAt: new Date(Date.now() + 3600_000),
  });
  const rawToken = generateVoterToken();
  await VoterToken.create({
    electionId: election._id,
    tokenHash: hashToken(rawToken),
    tokenPreview: tokenPreview(rawToken),
    status: "ACTIVE",
  });
  return { president, candidateA, election, rawToken };
}

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Voting flow", () => {
  it("rejects an invalid token", async () => {
    await seedMinimalElection();
    const res = await request(app).post("/api/voting/validate-token").send({ token: "ACES-0000-0000" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("accepts a valid token and issues a voting session", async () => {
    const { rawToken } = await seedMinimalElection();
    const res = await request(app).post("/api/voting/validate-token").send({ token: rawToken });
    expect(res.status).toBe(200);
    expect(res.body.data.votingSessionToken).toBeDefined();
  });

  it("submits a complete ballot successfully", async () => {
    const { president, candidateA, rawToken } = await seedMinimalElection();
    const validate = await request(app).post("/api/voting/validate-token").send({ token: rawToken });
    const sessionToken = validate.body.data.votingSessionToken;

    const submit = await request(app)
      .post("/api/voting/submit")
      .set("Authorization", `Bearer ${sessionToken}`)
      .send({ selections: [{ positionId: String(president._id), candidateId: String(candidateA._id) }] });

    expect(submit.status).toBe(200);
    expect(submit.body.success).toBe(true);
  });

  it("rejects a second submission with the same already-used token", async () => {
    const { president, candidateA, rawToken } = await seedMinimalElection();
    const validate = await request(app).post("/api/voting/validate-token").send({ token: rawToken });
    const sessionToken = validate.body.data.votingSessionToken;
    const selections = [{ positionId: String(president._id), candidateId: String(candidateA._id) }];

    const first = await request(app)
      .post("/api/voting/submit")
      .set("Authorization", `Bearer ${sessionToken}`)
      .send({ selections });
    expect(first.status).toBe(200);

    // Simulate a double-click / retry using the SAME already-used session/token.
    const second = await request(app)
      .post("/api/voting/submit")
      .set("Authorization", `Bearer ${sessionToken}`)
      .send({ selections });
    expect(second.status).toBe(403);
    expect(second.body.message).toMatch(/already/i);
  });

  it("rejects submitting an incomplete ballot", async () => {
    const { rawToken } = await seedMinimalElection();
    const validate = await request(app).post("/api/voting/validate-token").send({ token: rawToken });
    const sessionToken = validate.body.data.votingSessionToken;

    const res = await request(app)
      .post("/api/voting/submit")
      .set("Authorization", `Bearer ${sessionToken}`)
      .send({ selections: [] });
    expect(res.status).toBe(422);
  });

  it("rejects voting once the token has already been revoked-equivalent (already used) at re-validation", async () => {
    const { president, candidateA, rawToken } = await seedMinimalElection();
    const validate = await request(app).post("/api/voting/validate-token").send({ token: rawToken });
    await request(app)
      .post("/api/voting/submit")
      .set("Authorization", `Bearer ${validate.body.data.votingSessionToken}`)
      .send({ selections: [{ positionId: String(president._id), candidateId: String(candidateA._id) }] });

    const revalidate = await request(app).post("/api/voting/validate-token").send({ token: rawToken });
    expect(revalidate.status).toBe(403);
  });
});
