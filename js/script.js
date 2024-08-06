const homeScoreDisplay = document.getElementById("home-score")
const guestScoreDisplay = document.getElementById("guest-score")

const home1PointButton = document.getElementById("home-1point")
const home2PointsButton = document.getElementById("home-2points")
const home3PointsButton = document.getElementById("home-3points")

const guest1PointButton = document.getElementById("guest-1point")
const guest2PointsButton = document.getElementById("guest-2points")
const guest3PointsButton = document.getElementById("guest-3points")

const gameClock = document.getElementById("game-clock")
const resetGame = document.getElementById("reset-game")

const startNewGame = document.getElementById("start-new-game")

const addPointsBtn = document.querySelectorAll(".add-points-btn")

// Initialize the scores
let homeScore = 0
let guestScore = 0

// Attach event listeners to the buttons
home1PointButton.addEventListener("click", () => {
    homeScore++
    homeScoreDisplay.textContent = homeScore
})

home2PointsButton.addEventListener("click", () => {
    homeScore += 2
    homeScoreDisplay.textContent = homeScore
})

home3PointsButton.addEventListener("click", () => {
    homeScore += 3
    homeScoreDisplay.textContent = homeScore
})

guest1PointButton.addEventListener("click", () => {
    guestScore++
    guestScoreDisplay.textContent = guestScore
})

guest2PointsButton.addEventListener("click", () => {
    guestScore += 2
    guestScoreDisplay.textContent = guestScore
})

guest3PointsButton.addEventListener("click", () => {
    guestScore += 3
    guestScoreDisplay.textContent = guestScore
})

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
