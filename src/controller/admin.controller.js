const prisma = require("../../prisma");

const getAllCandidates = async (req, res) => {
  try {
    // Retrieve all candidates from the database
    const candidates = await prisma.candidate.findMany();

    res.status(200).json({
      success: true,
      message: "Candidates retrieved successfully",
      data: candidates,
    });
  } catch (error) {
    console.error("Error retrieving candidates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getAllCandidates };
