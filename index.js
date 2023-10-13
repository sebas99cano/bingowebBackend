require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const logger = require("./middleware/loggerMiddleware");
const notFound = require("./middleware/notFound");
const handleErrors = require("./middleware/handleErrors");
const { generateRandomBall } = require("./logic/gameLogic");
const possibleBingoCards = require("./logic/gameCards");

const app = express();
app.use(express.json());
app.use(cors());
app.use(logger);
// eslint-disable-next-line no-undef
app.use(express.static(process.cwd() + "/client/index.html"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const totalPossibleBalls = 75;
let availableCards = [...possibleBingoCards];
let generatedBalls = [];
let gameInProgress = true;
let isGeneratingBall = false; // Variable de control para evitar la generación simultánea de bolas
let sendBallInterval;
let numberPlayers = 0;

const generateAndSendBall = () => {
  if (
    !gameInProgress ||
    isGeneratingBall ||
    numberPlayers <= 1 ||
    generatedBalls.length >= totalPossibleBalls
  ) {
    return;
  }
  isGeneratingBall = true;
  const ball = generateRandomBall(generatedBalls);
  generatedBalls.push(ball);
  io.emit("newBall", ball);
  isGeneratingBall = false;
};

const resetGame = () => {
  sendBallInterval = null;
  generatedBalls = [];
  gameInProgress = false;
  numberPlayers = 0;
};

io.on("connection", (socket) => {
  numberPlayers++;
  console.log(`Un jugador se ha conectado: ${socket.id}`);

  const randomIndex = Math.floor(Math.random() * availableCards.length);
  const userCard = availableCards.splice(randomIndex, 1)[0];

  if (availableCards.length === 0) {
    availableCards = [...possibleBingoCards];
  }

  socket.emit("initialValues", {
    card: userCard,
    balls: generatedBalls,
    gameInProgress,
  });

  if (!sendBallInterval && numberPlayers >= 2) {
    gameInProgress = true;
    sendBallInterval = setInterval(generateAndSendBall, 5000);
  } else if (numberPlayers <= 1) {
    io.emit("waitingForPlayers");
  }

  socket.on("playerWins", () => {
    clearInterval(sendBallInterval);
    io.emit("gameOver", "Un jugador ha ganado el juego.");
    resetGame();
  });

  socket.on("disconnect", () => {
    console.log("se ha desconectado un jugador");
    numberPlayers--;
    if (numberPlayers === 1) {
      io.emit("waitingForPlayers");
    } else if (numberPlayers === 0) {
      console.log("se ha desconectado todos los jugadores");
      clearInterval(sendBallInterval);
      resetGame();
    }
  });
});

app.get("/", (request, response) => {
  response.send(
    "<h1>Bienvenido al backend de Juan Sebastian Cano Grajales</h1><br/><p>Bingo web</p>"
  );
});

app.use(notFound);

app.use(handleErrors);

// eslint-disable-next-line no-undef
const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
