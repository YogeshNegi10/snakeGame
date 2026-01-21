import mongoose from "mongoose";


    const gameSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    score: {
      type: Number,
      default: 0
    },

    totalTime: {
      type: Number, 
      default: 0
    },

    startedAt: {
      type: Date,
      default: Date.now
    },

    endedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);


const GameSession = mongoose.model("GameSession", gameSessionSchema);

export default GameSession