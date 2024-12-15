function checkRegisterPassword(inputPassword) {
    // Проверяем наличие заглавной, строчной буквы и цифры
    const regex = /(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])/;
    return regex.test(inputPassword) && inputPassword.length >= 8 && inputPassword.length <= 16;
}
console.log(checkRegisterPassword('8r4To5VuiNSxwh')); // Должно вернуть true
console.log(checkRegisterPassword('d5JAJJ')); // Должно вернуть false, недостаточная длина
console.log(checkRegisterPassword('D5JAJJ7XWF')); // Должно вернуть false, нет строчной буквы
console.log(checkRegisterPassword('djjj7xwfl')); // Должно вернуть false, нет заглавной буквы и цифры