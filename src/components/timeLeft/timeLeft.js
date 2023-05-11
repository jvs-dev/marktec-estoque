const timeLeft = document.getElementById("timeLeft")

function setTime() {
    let currentTime = new Date();
    let maxTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1, 0, 0, 0);
    let diffMs = maxTime.getTime() - currentTime.getTime();
    let diffMin = diffMs / 60000;
    let diffMinRounded = Math.round(diffMin);
    if (diffMinRounded < 60) {
        timeLeft.style.color = "red"
    }
    timeLeft.textContent = minutosParaHoras(diffMinRounded)
}

function minutosParaHoras(minutos) {
    let horas = Math.floor(minutos / 60);
    let minutosRestantes = minutos % 60;
    if (`${horas}`.length == 1 && `${minutosRestantes}`.length == 1) {
        return `0${horas}:0${minutosRestantes}`;
    }
    if (`${horas}`.length == 2 && `${minutosRestantes}`.length == 2) {
        return `${horas}:${minutosRestantes}`;
    }
    if (`${horas}`.length == 2 && `${minutosRestantes}`.length == 1) {
        return `${horas}:0${minutosRestantes}`;
    }
    if (`${horas}`.length == 1 && `${minutosRestantes}`.length == 2) {
        return `0${horas}:${minutosRestantes}`;
    }
}

setInterval(() => {
    let currentTime = new Date();
    let maxTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1, 0, 0, 0);
    let diffMs = maxTime.getTime() - currentTime.getTime();
    let diffMin = diffMs / 60000;
    let diffMinRounded = Math.round(diffMin);
    if (diffMinRounded < 60) {
        timeLeft.style.color = "red"
    }
    timeLeft.textContent = minutosParaHoras(diffMinRounded)
}, 10000);

setTime()