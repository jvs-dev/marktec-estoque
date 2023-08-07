import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
const firebaseConfig = {
    apiKey: "AIzaSyDiTWkrXRNH4XlHNHIh8RlMKMoArVULYyE",
    authDomain: "marktec-deposit.firebaseapp.com",
    projectId: "marktec-deposit",
    storageBucket: "marktec-deposit.appspot.com",
    messagingSenderId: "158740682122",
    appId: "1:158740682122:web:c80c33a77fad7e20b22473"
};
const app = initializeApp(firebaseConfig);
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
            if (doc.data().admin != true) {
                let timeLeft = document.getElementById("timeLeft")
                let timeLeftMobile = document.getElementById("timeLeftMobile")
                function contentHour() {
                    let horaAtual = new Date();
                    let horaDesejada = new Date(horaAtual);
                    horaDesejada.setHours(Number(doc.data().finalTime.substr(0, 2)), Number(doc.data().finalTime.substr(3)), 0, 0);
                    let diferencaEmMilissegundos = horaDesejada - horaAtual;
                    let horasRestantes = Math.floor(diferencaEmMilissegundos / 3600000);
                    let minutosRestantes = Math.floor((diferencaEmMilissegundos % 3600000) / 60000);
                    timeLeft.innerHTML = `${`${horasRestantes}`.length == 1 ? `0${horasRestantes}` : horasRestantes}:${`${minutosRestantes}`.length == 1 ? `0${minutosRestantes}` : minutosRestantes}`
                    timeLeftMobile.innerHTML = `${`${horasRestantes}`.length == 1 ? `0${horasRestantes}` : horasRestantes}:${`${minutosRestantes}`.length == 1 ? `0${minutosRestantes}` : minutosRestantes}`
                    if (horasRestantes <= 0) {
                        timeLeft.style.color = "#f00"
                        timeLeftMobile.style.color = "#f00"
                    }
                }
                function closeApp() {
                    let agora = new Date();
                    let horaAtual = agora.getHours();
                    let minutosAtual = agora.getMinutes();
                    let horarioAtualNumerico = horaAtual * 100 + minutosAtual;
                    let horarioInicio = Number(doc.data().initTime.replace(":", ""));
                    let horarioFim = Number(doc.data().finalTime.replace(":", ""));
                    if (horarioAtualNumerico >= horarioInicio && horarioAtualNumerico <= horarioFim) {
                    } else {
                        let body = document.querySelector("body")
                        body.style.display = "flex"
                        body.style.alignItems = "center"
                        body.style.justifyContent = "center"
                        body.style.minHeight = "100vh"
                        body.style.background = "var(--black)"
                        body.classList.add("expiredTime")
                        body.innerHTML = `
                        <button class="timeExpiredBtn"><ion-icon name="arrow-back-outline"></ion-icon>Login</button>
                            <div class="notifications-container">
                                <div class="error-alert">
                                    <div class="flex">
                                        <div class="flex-shrink-0">
                                            <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="error-svg">
                                                <path clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fill-rule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div class="error-prompt-container">
                                            <p class="error-prompt-heading">Tempo de uso expirado</p>
                                            <div class="error-prompt-wrap">
                                                <ul class="error-prompt-list" role="list">
                                                    <li>Você só pode acessar sua conta entre ${doc.data().initTime} e ${doc.data().finalTime}.</li>
                                                    <li>Caso queira acessar sua conta entre em contato com um administrador.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`
                    }
                }
                closeApp()
                contentHour()
                setInterval(() => {
                    let agora = new Date();
                    let horaAtual = agora.getHours();
                    let minutosAtual = agora.getMinutes();
                    let horarioAtualNumerico = horaAtual * 100 + minutosAtual;
                    let horarioInicio = Number(doc.data().initTime.replace(":", ""));
                    let horarioFim = Number(doc.data().finalTime.replace(":", ""));
                    if (horarioAtualNumerico >= horarioInicio && horarioAtualNumerico <= horarioFim) {
                        let body = document.querySelector("body")
                        if (body.classList.contains("expiredTime")) {
                            window.location.href="index.html"
                        }
                    } else {
                        let body = document.querySelector("body")
                        if (body.classList.contains("expiredTime") == false) {
                            body.style.display = "flex"
                            body.style.alignItems = "center"
                            body.style.justifyContent = "center"
                            body.style.minHeight = "100vh"
                            body.style.background = "var(--black)"
                            body.classList.add("expiredTime")
                            body.innerHTML = `
                                <div class="notifications-container">
                                    <div class="error-alert">
                                        <div class="flex">
                                            <div class="flex-shrink-0">
                                                <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="error-svg">
                                                    <path clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fill-rule="evenodd"></path>
                                                </svg>
                                            </div>
                                            <div class="error-prompt-container">
                                                <p class="error-prompt-heading">Tempo de uso expirado</p>
                                                <div class="error-prompt-wrap">
                                                    <ul class="error-prompt-list" role="list">
                                                        <li>Você só pode acessar sua conta entre ${doc.data().initTime} e ${doc.data().finalTime}.</li>
                                                        <li>Caso queira acessar sua conta entre em contato com um administrador.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`
                        }
                    }
                }, 20000);
                setInterval(() => {
                    let horaAtual = new Date();
                    let horaDesejada = new Date(horaAtual);
                    horaDesejada.setHours(Number(doc.data().finalTime.substr(0, 2)), Number(doc.data().finalTime.substr(3)), 0, 0);
                    let diferencaEmMilissegundos = horaDesejada - horaAtual;
                    let horasRestantes = Math.floor(diferencaEmMilissegundos / 3600000);
                    let minutosRestantes = Math.floor((diferencaEmMilissegundos % 3600000) / 60000);
                    timeLeft.innerHTML = `${`${horasRestantes}`.length == 1 ? `0${horasRestantes}` : horasRestantes}:${`${minutosRestantes}`.length == 1 ? `0${minutosRestantes}` : minutosRestantes}`
                    timeLeftMobile.innerHTML = `${`${horasRestantes}`.length == 1 ? `0${horasRestantes}` : horasRestantes}:${`${minutosRestantes}`.length == 1 ? `0${minutosRestantes}` : minutosRestantes}`
                    if (horasRestantes <= 0) {
                        timeLeft.style.color = "#f00"
                        timeLeftMobile.style.color = "#f00"
                    }
                }, 60000);
            } else {
                let timeLeftMobile = document.getElementById("timeLeftMobile")
                timeLeftMobile.style.display = "none"
            }
        })
    }
})