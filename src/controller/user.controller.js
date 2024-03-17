const handleRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, gender } = req.body;
    const newCandidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        gender,
      },
    });
    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: newCandidate,
    });
  } catch (error) {
    console.error("Error creating candidate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { handleRegister };
