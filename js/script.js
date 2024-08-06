// DOM Elements
const homeScoreDisplay = document.getElementById("home-score")
const guestScoreDisplay = document.getElementById("guest-score")

const gameClock = document.getElementById("game-clock")
const resetGame = document.getElementById("reset-game")

const startNewGame = document.getElementById("start-new-game")

const addPointsBtn = document.querySelectorAll(".points-btn")

// Initialize the scores
let homeScore = 0
let guestScore = 0

document
    .querySelector(".scoreboard-wrapper")
    .addEventListener("click", handleButtonClick)

function handleButtonClick(event) {
    if (event.target.classList.contains("points-btn")) {
        const team = event.target.dataset.team
        const points = Number(event.target.dataset.points)
        console.log(typeof points)
        if (team === "home") {
            updateHomeScore(points)
        } else if (team === "guest") {
            updateGuestScore(points)
        }
    }
}

function updateHomeScore(points) {
    homeScore += points
    homeScoreDisplay.textContent = homeScore
}

function updateGuestScore(points) {
    guestScore += points
    guestScoreDisplay.textContent = guestScore
}

function addPoints(button, points, updateScore) {
    button.addEventListener("click", function () {
        updateScore(points)
    })
}

resetGame.addEventListener("click", function () {
    clearInterval(intervalID)
    homeScore = 0
    guestScore = 0
    homeScoreDisplay.textContent = 0
    guestScoreDisplay.textContent = 0
    gameClock.textContent = 60
    timeLeft = 60
    disableBtn()
    startNewGame.textContent = "Start"
    isStarted = false
    isRunning = false
})

let timeLeft = 60
let intervalID
function startTimer() {
    intervalID = setInterval(function () {
        if (timeLeft > 0) {
            timeLeft--
            gameClock.textContent = timeLeft
        } else {
            clearInterval(intervalID)
            endGame()
        }
    }, 1000)
}

function endGame() {
    if (homeScore > guestScore) {
        result = "Home Wins"
    } else if (guestScore > homeScore) {
        result = "Guest Wins"
    } else {
        result = "It's a Draw"
    }
}

let isStarted = false
let isRunning = false
startNewGame.addEventListener("click", function () {
    if (!isStarted) {
        startTimer()
        enableBtn()
        isStarted = true
        isRunning = true
        return (startNewGame.textContent = "Pause")
    }
    if (isRunning) {
        pauseGame()
    } else {
        restartGame()
    }
})

function pauseGame() {
    clearInterval(intervalID)
    disableBtn()
    isRunning = false
    startNewGame.textContent = "Start"
}

function restartGame() {
    startTimer()
    enableBtn()
    isRunning = true
    startNewGame.textContent = "Pause"
}

function enableBtn() {
    addPointsBtn.forEach(function (button) {
        button.removeAttribute("disabled")
    })
}

function disableBtn() {
    addPointsBtn.forEach(function (button) {
        button.setAttribute("disabled", true)
    })
}

disableBtn()
