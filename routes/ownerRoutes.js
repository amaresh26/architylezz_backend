import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";

const router = express.Router();
const PASS_FILE = "./ownerPassword.json";

// Read saved owner data
function readOwnerData() {
  try {
    if (!fs.existsSync(PASS_FILE)) {
      return { email: "", password: "" };
    }
    const raw = fs.readFileSync(PASS_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Read error:", err);
    return { email: "", password: "" };
  }
}

// Write owner data
function writeOwnerData(data) {
  fs.writeFileSync(PASS_FILE, JSON.stringify(data, null, 2));
}


// -----------------------------------------------
// 🔐 LOGIN
// -----------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const data = readOwnerData();

  // First time login → no email or password set
  if (!data.email || !data.password) {
    return res.json({ firstTime: true });
  }

  if (email !== data.email) {
    return res.status(401).json({ success: false, message: "Invalid email" });
  }

  const passMatch = await bcrypt.compare(password, data.password);
  if (!passMatch) {
    return res.status(401).json({ success: false, message: "Wrong password" });
  }

  return res.json({ success: true });
});


// -----------------------------------------------
// 🔐 CHANGE PASSWORD
// -----------------------------------------------
router.post("/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const data = readOwnerData();

  // First time setup (no email/password yet)
  if (!data.email || !data.password) {
    const hashed = await bcrypt.hash(newPassword, 10);
    writeOwnerData({ email, password: hashed });
    return res.json({ success: true, firstTimeSet: true });
  }

  if (email !== data.email) {
    return res.status(401).json({ success: false, message: "Incorrect email" });
  }

  const match = await bcrypt.compare(currentPassword, data.password);
  if (!match) {
    return res.status(401).json({ success: false, message: "Wrong current password" });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  writeOwnerData({ email: data.email, password: newHash });

  res.json({ success: true });
});


// -----------------------------------------------
// 🔐 CHANGE EMAIL
// -----------------------------------------------
router.post("/change-email", async (req, res) => {
  const { currentEmail, newEmail } = req.body;
  const data = readOwnerData();

  if (!data.email || !data.password) {
    return res.status(400).json({ success: false, message: "Owner not set" });
  }

  if (currentEmail !== data.email) {
    return res.status(401).json({ success: false, message: "Incorrect current email" });
  }

  writeOwnerData({ email: newEmail, password: data.password });

  res.json({ success: true });
});

router.get("/get", (req, res) => {
  const data = readOwnerData();
  res.json({ email: data.email || "" });
});

export default router;
