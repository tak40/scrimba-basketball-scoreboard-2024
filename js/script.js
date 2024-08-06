// DOM Elements
const homeScoreDisplay = document.getElementById("home-score")
const guestScoreDisplay = document.getElementById("guest-score")
const gameClockDisplay = document.getElementById("game-clock")
const startNewGameBtn = document.getElementById("start-new-game")
const resetGameBtn = document.getElementById("reset-game")
const addPointsBtn = document.querySelectorAll(".points-btn")

// State Variables
let homeScore = 0
let guestScore = 0
let timeLeft = 60
let intervalID
let isStarted = false
let isRunning = false

// Initial Button State
disableBtn()

// Event Listeners
document
    .querySelector(".scoreboard-wrapper")
    .addEventListener("click", handleScoreButtonClick)
resetGameBtn.addEventListener("click", resetGame)
startNewGameBtn.addEventListener("click", handleStartPause)

// Functions

// Start the game timer
function startTimer() {
    intervalID = setInterval(function () {
        if (timeLeft > 0) {
            timeLeft--
            gameClockDisplay.textContent = timeLeft
        } else {
            clearInterval(intervalID)
            endGame()
        }
    }, 1000)
}

// Handle starting or pausing the game
function handleStartPause() {
    if (!isStarted) {
        startGame()
    }
    if (isRunning) {
        pauseGame()
    } else {
        restartGame()
    }
}

// Start a game
function startGame() {
    startTimer()
    enableBtn()
    isStarted = true
    isRunning = true
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
    clearInterval(intervalID)
    disableBtn()
    isRunning = false
    startNewGameBtn.textContent = "Start"
}

// Restart the game
function restartGame() {
    startTimer()
    enableBtn()
    isRunning = true
    startNewGameBtn.textContent = "Pause"
}

// Update the home team's score
function updateHomeScore(points) {
    homeScore += points
    homeScoreDisplay.textContent = homeScore
}

// Update the guest team's score
function updateGuestScore(points) {
    guestScore += points
    guestScoreDisplay.textContent = guestScore
}

// Reset the game
function resetGame() {
    clearInterval(intervalID)
    resetScores()
    resetClock()
    disableBtn()
    resetGameState()
}

// Reset the game state
function resetScores() {
    homeScore = 0
    guestScore = 0
    homeScoreDisplay.textContent = 0
    guestScoreDisplay.textContent = 0
}

// Reset the game clock
function resetClock() {
    gameClockDisplay.textContent = 60
    timeLeft = 60
}

// Reset the game state
function resetGameState() {
    startNewGameBtn.textContent = "Start"
    isStarted = false
    isRunning = false
}

// End the game and determine the winner
function declareWinner() {
    let result
    if (homeScore > guestScore) {
        result = "Home Wins"
    } else if (guestScore > homeScore) {
        result = "Guest Wins"
    } else {
        result = "It's a Draw"
    }
    console.log(result) // For now, just log the result
}

// Enable the buttons
function enableBtn() {
    addPointsBtn.forEach(function (button) {
        button.removeAttribute("disabled")
    })
}

// Disable the buttons
function disableBtn() {
    addPointsBtn.forEach(function (button) {
        button.setAttribute("disabled", true)
    })
}
