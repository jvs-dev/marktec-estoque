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
                const timeLeft = document.getElementById("timeLeft")
                const timeLeftMobile = document.getElementById("timeLeftMobile")
                function setTime() {
                    let currentTime = new Date();
                    let maxTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1, 0, 0, 0);
                    let diffMs = maxTime.getTime() - currentTime.getTime();
                    let diffMin = diffMs / 60000;
                    let diffMinRounded = Math.round(diffMin);
                    if (diffMinRounded < 60) {
                        timeLeft.style.color = "red"
                        timeLeftMobile.style.color = "red"
                    }
                    timeLeft.textContent = minutosParaHoras(diffMinRounded)
                    timeLeftMobile.textContent = minutosParaHoras(diffMinRounded)
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
                        timeLeftMobile.style.color = "red"
                    }
                    timeLeft.textContent = minutosParaHoras(diffMinRounded)
                    timeLeftMobile.textContent = minutosParaHoras(diffMinRounded)
                }, 10000);

                setTime()
            } else {
                const timeLeftMobile = document.getElementById("timeLeftMobile")
                timeLeftMobile.style.display = "none"
            }
        })
    }
})