// DOM Elements
const homeScoreDisplay = document.getElementById("home-score")
const guestScoreDisplay = document.getElementById("guest-score")
const gameClockDisplay = document.getElementById("game-clock")
const startNewGameBtn = document.getElementById("start-new-game")
const resetGameBtn = document.getElementById("reset-game")
const addPointsBtn = document.querySelectorAll(".points-btn")
const winMessage = document.getElementById("win-message")
const winText = document.getElementById("win-text")

const INITIAL_GAME_TIME = 720 // 12 minutes

// State Variables
let gameState = {
    homeScore: 0,
    guestScore: 0,
    timeLeft: INITIAL_GAME_TIME,
    pausedTimeLeft: INITIAL_GAME_TIME,
    startTime: null,
    intervalID: null,
    isStarted: false,
    isRunning: false,
}

// Initial Button State
disableBtn()

// Initial Game State
resetClock()

// Event Listeners
document.querySelector(".scoreboard-wrapper").addEventListener("click", handleScoreButtonClick)
resetGameBtn.addEventListener("click", resetGame)
startNewGameBtn.addEventListener("click", handleStartPause)
winMessage.addEventListener("click", handleWinMessageClick)

// Functions

// Start the game timer
function startTimer() {
    const startTime = performance.now() - (INITIAL_GAME_TIME - gameState.timeLeft) * 1000
    gameState.startTime = startTime

    updateTimer()
}

// Update the game timer
function updateTimer() {
    const currentTime = performance.now()
    const elapsedTime = (currentTime - gameState.startTime) / 1000
    gameState.timeLeft = Math.max(0, INITIAL_GAME_TIME - elapsedTime) // Prevent negative time

    const minutes = Math.floor(gameState.timeLeft / 60)
    const seconds = Math.floor(gameState.timeLeft % 60)
    const milliseconds = Math.floor((gameState.timeLeft % 1) * 100)

    gameClockDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`

    if (gameState.timeLeft > 0) {
        gameState.animationFrameID = requestAnimationFrame(updateTimer)
    } else {
        cancelAnimationFrame(gameState.animationFrameID)
        declareWinner()
    }
    // gameState.animationFrameID = requestAnimationFrame(updateTimer)
}

// Handle starting or pausing the game
function handleStartPause() {
    if (!gameState.isStarted || !gameState.isRunning) {
        startGame()
    } else {
        pauseGame()
    }
}

// Start a game
function startGame() {
    startTimer()
    enableBtn()
    gameState.isStarted = true
    gameState.isRunning = true
    startNewGameBtn.textContent = "Pause"
}

// Handle button clicks for scoring
function handleScoreButtonClick(event) {
    if (event.target.classList.contains("points-btn")) {
        const team = event.target.dataset.team
        const points = Number(event.target.dataset.points)
        if (team === "home") {
            updateHomeScore(points)
        } else if (team === "guest") {
            updateGuestScore(points)
        }
    }
}

// Pause the game
function pauseGame() {
    cancelAnimationFrame(gameState.animationFrameID)
    gameState.pausedTimeLeft = gameState.timeLeft
    disableBtn()
    gameState.isRunning = false
    startNewGameBtn.textContent = "Resume"
}

// Update the winning team with a glow effect
function updateWinningTeam() {
    const homeScore = gameState.homeScore
    const guestScore = gameState.guestScore

    homeScoreDisplay.classList.toggle("winning-glow", homeScore > guestScore)
    guestScoreDisplay.classList.toggle("winning-glow", guestScore > homeScore)

    // Remove glow if scores are tied
    if (homeScore === guestScore) {
        homeScoreDisplay.classList.remove("winning-glow")
        guestScoreDisplay.classList.remove("winning-glow")
    }
}

// Update the home team's score
function updateHomeScore(points) {
    gameState.homeScore += points
    homeScoreDisplay.textContent = gameState.homeScore
    updateWinningTeam()
}

// Update the guest team's score
function updateGuestScore(points) {
    gameState.guestScore += points
    guestScoreDisplay.textContent = gameState.guestScore
    updateWinningTeam()
}

// Reset the game
function resetGame() {
    clearInterval(gameState.intervalID)
    resetScores()
    resetClock()
    disableBtn()
    resetGameState()
    winMessage.classList.add("hidden")
}

// Reset the game state
function resetScores() {
    gameState.homeScore = 0
    gameState.guestScore = 0
    homeScoreDisplay.textContent = 0
    guestScoreDisplay.textContent = 0
    updateWinningTeam()
}

// Reset the game clock
function resetClock() {
    gameState.pausedTimeLeft = INITIAL_GAME_TIME
    gameState.timeLeft = INITIAL_GAME_TIME
    const minutes = Math.floor(INITIAL_GAME_TIME / 60)
    const seconds = Math.floor(INITIAL_GAME_TIME % 60)
    gameClockDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.00`
}

// Reset the game state
function resetGameState() {
    startNewGameBtn.textContent = "Start"
    gameState.isStarted = false
    gameState.isRunning = false
}

// End the game and determine the winner
function declareWinner() {
    let result =
        gameState.homeScore > gameState.guestScore
            ? "Home"
            : gameState.guestScore > gameState.homeScore
            ? "Guest"
            : "It's a Draw"
    showWinMessage(result)
}

// Show the win message
function showWinMessage(result) {
    if (result === "Home" || result === "Guest") {
        winText.textContent = `${result} Wins!`
        showConfetti()
    } else {
        winText.textContent = `${result}`
    }
    winMessage.classList.remove("hidden")
    winMessage.focus() // Set focus to the dialog
    disableBtn()

    winMessage.addEventListener("keydown", handleWinMessageKeydown)
}

function handleWinMessageKeydown(event) {
    // Dismiss the win message when any key is pressed
    handleWinMessageClick()
}

// Handle dismissing the win message (works for both click and keypress)
function handleWinMessageClick() {
    resetGame()
    winMessage.removeEventListener("keydown", handleWinMessageKeydown)
    startNewGameBtn.focus()
}

// Enable the buttons
function enableBtn() {
    addPointsBtn.forEach(function (button) {
        button.disabled = false
        button.tabIndex = 0
    })
}

// Disable the buttons
function disableBtn() {
    addPointsBtn.forEach(function (button) {
        button.disabled = true
    })
}

// Show confetti animation
function showConfetti() {
    confetti({
        particleCount: 100,
        spread: 40,
        origin: { y: 0.7 },
    })
}
