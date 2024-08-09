// prettier-ignore
const characters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9","~","`","!","@","#","$","%","^","&","*","(",")","_","-","+","=","{","[","}","]",",","|",":",";","<",">",".","?",
"/"];

const generatePasswordBtn = document.getElementById("generate-password-btn")
const password1 = document.getElementById("password1")
const password2 = document.getElementById("password2")

const passwordLength = 15

function generateRandomIndex() {
    return Math.floor(Math.random() * characters.length)
}

function generatePassword(length) {
    let password = ""
    for (let i = 0; i < length; i++) {
        password += characters[generateRandomIndex()]
    }
    return password
}

function updatePassword() {
    password1.textContent = generatePassword(passwordLength)
    password2.textContent = generatePassword(passwordLength)
}

generatePasswordBtn.addEventListener("click", updatePassword)
