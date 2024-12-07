const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const lowercase = 'abcdefghijklmnopqrstuvwxyz'
const digits = '0123456789'
const minLength = 8, maxLength = 16
const allChars = uppercase + lowercase + digits
const regex = /(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])/
function generatePassword() {
    let length = Math.floor(Math.random() * maxLength) + minLength, password
    while(true) {
        password = ''
        for (let index = 0; index < length; index++)
            password += allChars[Math.floor(Math.random() * allChars.length)]
        if(checkRegisterPassword(password)) break
    }
    return password
}
function checkRegisterPassword(inputPassword) {
    if(regex.test(inputPassword)) return true
    else return false
}
module.exports = {
    generatePassword,
    checkRegisterPassword
}