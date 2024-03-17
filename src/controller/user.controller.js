const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, gender, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCandidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword, // Save the hashed password
        gender,
      },
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newCandidate,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const candidate = await prisma.candidate.findUnique({
      where: { email },
    });

    // Check if candidate exists
    if (!candidate) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, candidate.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: candidate.id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token expires in 7 days
    });

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { handleRegister, handleLogin };
