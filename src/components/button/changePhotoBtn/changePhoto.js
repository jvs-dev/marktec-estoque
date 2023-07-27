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
import { getFirestore, collection, addDoc, doc, updateDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();

let changePhotoBtn = document.getElementById("changePhotoBtn")
let addImgBackground = document.querySelector(".addImgBackground")
let closeAddImg = document.getElementById("closeAddImg")
let closeErrorPopUp = document.getElementById("closeErrorPopUp")

changePhotoBtn.onclick = function () {
    addImgBackground.style.display = "flex"
    setTimeout(() => {
        addImgBackground.classList.add("active")
    }, 1);
}

closeAddImg.onclick = function () {
    let userImgLink = document.getElementById("userImgLink").value
    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateImg(userImgLink, user.email)
        }
    });
}

async function updateImg(imgLink, email) {
    if (imgLink != "") {
        let usersRef = doc(db, "users", `${email}`);
        await updateDoc(usersRef, {
            photo: `${imgLink}`
        });
        let errorPopUp = document.getElementById("errorPopUp")
        errorPopUp.style.display = "flex"
        setTimeout(() => {
            errorPopUp.classList.add("active")
        }, 200);
    }
    addImgBackground.classList.remove("active")
    setTimeout(() => {
        addImgBackground.style.display = "none"
    }, 200);
}

closeErrorPopUp.onclick = function () {
    let errorPopUp = document.getElementById("errorPopUp")
    errorPopUp.classList.remove("active")
    setTimeout(() => {
        errorPopUp.style.display = "none"
    }, 200);
}