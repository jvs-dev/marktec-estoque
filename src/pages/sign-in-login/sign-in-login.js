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


import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);


const auth = getAuth();
let createAccount = document.getElementById("createAccount")
let login = document.getElementById("login")
let helpSignin = document.getElementById("helpSignin")
let helpLogin = document.getElementById("helpLogin")
let resetEmailBtn = document.getElementById("resetEmail")
let closeResetEmailSection = document.getElementById("closeResetEmailSection")
let resetEmailSection = document.getElementById("resetEmailSection")



createAccount.onclick = function () {
    createAccount.innerHTML = `
    <div class="dot-spinner">
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
    </div>`
    createAccount.classList.add("loading")
    let email = document.getElementById("email").value
    let password = document.getElementById("password").value
    let work = document.getElementById("work").value
    let fullName = document.getElementById("fullName").value
    if (email != "" && password != "" && work != "" && fullName != "") {
        if (password.length > 7) {
            createUser(email, password, fullName, work)
        } else {
            helpSignin.style.color = "red"
            helpSignin.textContent = "A senha deve ter no mínimo 8 caractéres."
            createAccount.innerHTML = `CRIAR CONTA`
            createAccount.classList.remove("loading")
        }
    } else {
        helpSignin.style.color = "red"
        helpSignin.textContent = "Por favor, preencha os campos para continuar."
        createAccount.innerHTML = `CRIAR CONTA`
        createAccount.classList.remove("loading")
    }
}

function createUser(email, password, fullName, work) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            setDocsAccount(email, fullName, work)
            sendEmailVerification(auth.currentUser)
                .then(() => {

                });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            helpSignin.style.color = "red"
            helpSignin.textContent = "Endereço de email incorreto ou conta já existente."
            createAccount.innerHTML = `CRIAR CONTA`
            createAccount.classList.remove("loading")
        });
}

async function setDocsAccount(email, fullName, work) {
    await setDoc(doc(db, "users", `${email}`), {
        email: `${email}`,
        fullName: `${fullName}`,
        work: `${work}`,
        photo: `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`,
        permission: false
    });
    if (work == "Técnico") {
        await setDoc(doc(db, "tecnics", `${fullName}`), {

        });
    }
    if (work == "Estoquista") {
        await setDoc(doc(db, "Estoquista", `${fullName}`), {

        });
    }
    verifyaccount(email)
}

function verifyaccount(email) {
    let unsub = onSnapshot(doc(db, "users", `${email}`), (doc) => {
        helpSignin.style.color = "#0f0"
        helpSignin.textContent = "Conta criada com sucesso."
        window.location.href = "index.html"
    });
}


login.onclick = function () {
    login.innerHTML = `
    <div class="dot-spinner">
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
    </div>`
    login.classList.add("loading")
    let email = document.getElementById("loginEmail").value
    let password = document.getElementById("loginPassword").value
    if (email != "" && password != "") {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                helpLogin.style.color = "#0f0"
                helpLogin.textContent = "Login feito com sucesso."
                window.location.href = "index.html"
            })
            .catch((error) => {
                helpLogin.style.color = "red"
                helpLogin.textContent = "Erro ao fazer login, verifique seus dados e tente novamente."
                login.innerHTML = `ENTRAR`
                login.classList.remove("loading")
            });
    } else {
        helpLogin.style.color = "red"
        helpLogin.textContent = "Por favor, preencha os campos para continuar."
        login.innerHTML = `ENTRAR`
        login.classList.remove("loading")
    }
}

closeResetEmailSection.onclick = function () {
    resetEmailSection.style.display = "none"
}

resetEmailBtn.onclick = function () {
    resetEmailSection.style.display = "flex"
}

let sendResetEmail = document.getElementById("sendResetEmail")

sendResetEmail.onclick = function () {
    let email = document.getElementById("ResetEmailInput").value
    let resetEmailHelp = document.getElementById("resetEmailHelp")
    if (email != "") {
        sendResetEmail.innerHTML = `
        <div class="dot-spinner">
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
        </div>`
        sendResetEmail.classList.add("loading")
        sendPasswordResetEmail(auth, email)
            .then(() => {
                resetEmailHelp.style.color = "#0f0"
                resetEmailHelp.textContent = "Um email para redefinição de senha foi enviado."
                sendResetEmail.innerHTML = `<ion-icon name="checkmark-circle" class="resetSucess"></ion-icon>`
                sendResetEmail.onclick = function () {
                    resetEmailSection.style.display = "none"
                }
            })
            .catch((error) => {
                resetEmailHelp.style.color = "red"
                resetEmailHelp.textContent = "Erro ao enviar email."
                sendResetEmail.innerHTML = `Enviar`
                sendResetEmail.classList.remove("loading")
                // ..
            });
    } else {
        resetEmailHelp.style.color = "red"
        resetEmailHelp.textContent = "Digite seu email para continuar."
    }
}