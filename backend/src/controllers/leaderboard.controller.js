import GameSession from "../models/GameSession.js";

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await GameSession.aggregate([
      {
        $match: { endedAt: { $ne: null } },
      },
      {
        $group: {
          _id: "$userId",
          totalScore: { $sum: "$score" },
          totalTime: { $sum: "$totalTime" },
          totalSessions: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: "$user.username",
          totalScore: 1,
          totalTime: 1,
          totalSessions: 1,
        },
      },
      { $sort: { totalScore: -1, totalTime: 1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
