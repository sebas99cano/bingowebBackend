function generateRandomBall(generatedBalls) {
  const letters = ["B", "I", "N", "G", "O"];
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];

  let minNumber, maxNumber;
  switch (randomLetter) {
    case "B":
      minNumber = 1;
      maxNumber = 15;
      break;
    case "I":
      minNumber = 16;
      maxNumber = 30;
      break;
    case "N":
      minNumber = 31;
      maxNumber = 45;
      break;
    case "G":
      minNumber = 46;
      maxNumber = 60;
      break;
    case "O":
      minNumber = 61;
      maxNumber = 75;
      break;
    default:
      minNumber = 1;
      maxNumber = 75;
  }

  // Genera un número aleatorio que no esté en las bolas generadas
  let randomNumber;
  do {
    randomNumber =
      Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
  } while (
    generatedBalls.some(
      (ball) => ball.letter === randomLetter && ball.number === randomNumber
    )
  );

  return { letter: randomLetter, number: randomNumber };
}

module.exports = { generateRandomBall };
