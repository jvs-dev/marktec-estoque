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
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();

let userPhoto = document.getElementById("userPhoto")
let userFullName = document.getElementById("userFullName")
let userEmail = document.getElementById("userEmail")
let userWork = document.getElementById("userWork")
let changePassword = document.getElementById("changePassword")
let passwordHelp = document.getElementById("passwordHelp")
let emailHelp = document.getElementById("emailHelp")
let signOutBtn = document.getElementById("signOut")
let transfer = document.getElementById("transfer")
let acceptUser = document.getElementById("acceptUser")
let addItem = document.getElementById("addItem")

signOutBtn.onclick = function () {
    signOut(auth).then(() => {
        window.location.href = "login-signin.html"
    }).catch((error) => {
        window.location.href = "login-signin.html"
    });
}


function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                userPhoto.src = `${doc.data().photo}`
                userFullName.textContent = `${doc.data().fullName}`
                userEmail.innerHTML = `<ion-icon name="mail-outline"></ion-icon>${doc.data().email}`
                userWork.textContent = `${doc.data().work}`
                if (doc.data().admin == true) {
                    transfer.style.display = "none"
                    acceptUser.style.display = "flex"
                    addItem.style.display = "flex"
                } else {
                    transfer.style.display = "flex"
                    acceptUser.style.display = "none"
                    addItem.style.display = "none"
                }
            });

            changePassword.onclick = function () {

                sendPasswordResetEmail(auth, user.email)
                    .then(() => {
                        passwordHelp.style.color = "#0f0"
                        passwordHelp.textContent = "Um email para redefinição de senha foi enviado."
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        // ..
                    });

            }
        }
    });
}

loadData()