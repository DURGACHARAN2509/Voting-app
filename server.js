import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static("public"));

// Memory storage (replace with DB later)
let candidates = [
  { id: 1, name: "Alice", gender: "Female", votes: 10 },
  { id: 2, name: "Bob", gender: "Male", votes: 8 },
  { id: 3, name: "Charlie", gender: "Male", votes: 5 }
];

let voters = [
  { id: "user1", password: "vote123", hasVoted: false, gender: "Male" },
  { id: "user2", password: "vote123", hasVoted: false, gender: "Female" }
];

// --- ROUTES ---

// Voter login
app.post("/login", (req, res) => {
  const { id, password } = req.body;
  const user = voters.find(v => v.id === id && v.password === password);
  if (user) res.json({ success: true, user });
  else res.json({ success: false });
});

// Admin login
app.post("/admin/login", (req, res) => {
  const { id, password } = req.body;
  if (id === process.env.ADMIN_ID && password === process.env.ADMIN_PASS) {
    res.json({ success: true });
  } else res.json({ success: false });
});

// Get candidates
app.get("/candidates", (req, res) => res.json(candidates));

// Vote route
app.post("/vote", (req, res) => {
  const { voterId, candidateId } = req.body;
  const voter = voters.find(v => v.id === voterId);
  if (!voter || voter.hasVoted) return res.json({ success: false });

  const candidate = candidates.find(c => c.id === candidateId);
  if (candidate) {
    candidate.votes++;
    voter.hasVoted = true;
    io.emit("updateResults", candidates); // Live update
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Admin adds candidate
app.post("/admin/addCandidate", (req, res) => {
  const { name, gender } = req.body;
  candidates.push({ id: candidates.length + 1, name, gender, votes: 0 });
  io.emit("updateResults", candidates);
  res.json({ success: true });
});

io.on("connection", socket => {
  console.log("User connected");
  socket.emit("updateResults", candidates);
});

server.listen(process.env.PORT, () =>
  console.log(`Server running on http://localhost:${process.env.PORT}`)
);
