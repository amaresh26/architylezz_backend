import bcrypt from "bcrypt";
import fs from "fs";

const password = "Password123"; // your desired password
const email = "admin@site.com"; // your admin email

const hashedPassword = await bcrypt.hash(password, 10);

fs.writeFileSync("./ownerPassword.json", JSON.stringify({
  email: email,
  password: hashedPassword
}, null, 2));

console.log("Admin credentials set!");
console.log(`Email: ${email}`);
