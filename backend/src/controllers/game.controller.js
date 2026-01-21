import GameSession from "../models/GameSession.js";

export const gameStart = async (req, res) => {
  try {
    const userId = req.user.id;

    // create new game session
    const session = await GameSession.create({
      userId,
    });

    // send session id to frontend
    res.status(201).json({
      success: true,
      sessionId: session._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to start game",
    });
  }
};


export const gameEnd = async (req, res) => {
  try {
    const { score, gamePlayedTime,sessionId, } = req.body;
   
    const userId = req.user.id;

    const session = await GameSession.findOne({
      _id: sessionId,
      userId,
      endedAt: null,
    });

    if(!session){
         return res.status(404).json({
        success: false,
        message: "No active game session found"
      });
    }

    session.score = score;
    session.totalTime = gamePlayedTime;
    session.endedAt = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      message: "Game session ended successfully",
    });
  } catch (error) {
    console.error("Game end error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to end game",
    });
  }
};
