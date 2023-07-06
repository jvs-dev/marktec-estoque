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

function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            verifyUrl()
        }
    });
}


function verifyUrl() {
    let viewDischargeSection = document.getElementById("viewDischargeSection")
    let urlParams = new URLSearchParams(window.location.search);
    let dataId = urlParams.get('id');
    if (dataId != null) {
        let unsub = onSnapshot(doc(db, "discharges", `${dataId}`), (doc) => {
            viewDischargeSection.style.display = "flex"
            viewDischargeSection.innerHTML = `
            <div class="squares">
                <div class="square--1"></div>
                <div class="square--2"></div>
                <div class="square--3"></div>
            </div>
            <div class="content">
                <h2 class="viewDischargeSection__h2">Nota fiscal</h2>
                <p class="viewDischargeSection__tecnic">técnico: ${doc.data().tecnicName}.</p>
                <div class="viewDischargeSection__div--1">
                    <span class="viewDischargeSection__date">Data: ${doc.data().date} ás ${doc.data().hours}</span>
                    <span class="viewDischargeSection__client">${doc.data().service} de ${doc.data().clientName}.</span>
                </div>
                <header class="viewDischargeSection__header">
                    <span class="viewDischargeSection__header__span span--1">utilizado</span>
                    <span class="viewDischargeSection__header__span span--2">Nome</span>
                    <span class="viewDischargeSection__header__span span--3">Preço</span>
                    <span class="viewDischargeSection__header__span span--4">Total</span>
                </header>
                <section class="viewDischargeSection__section" id="viewCardSection">
                </section>
                <div class="viewDischargeSection__div--2">
                    <div class="viewDischargeSection__div--3">
                        <p class="viewDischargeSection__local">Local: ${doc.data().location}.</p>
                        <p class="viewDischargeSection__descriprion">${doc.data().description}.</p>
                    </div>
                    <span class="viewDischargeSection__allTotal" id="allTotalSpan"></span>
                </div>
                <img src="assets/logo.png" alt="" class="viewDischargeSection__logo">
            </div>
            <a href="#" class="viewDischargeSection__back"><ion-icon
                    name="arrow-back-outline"></ion-icon>Voltar</a>
            <p class="viewDischargeSection__copyright">©Marktec telecom</p>`
            let i = 1
            let total = 0
            let viewDischargeSection__back = document.querySelector(".viewDischargeSection__back")
            viewDischargeSection__back.onclick = function () {
                window.history.back()
            }
            Object.keys(doc.data().itemsUsed).forEach(element => {
                let viewCardSection = document.getElementById("viewCardSection")
                let article = document.createElement("article")
                viewCardSection.insertAdjacentElement("beforeend", article)
                article.classList.add("viewDischargeSection__item")
                article.style.background = `var(--background-${i})`
                article.innerHTML = `
                <span class="viewDischargeSection__itemQuanty">${doc.data().itemsUsed[element].used} ${doc.data().itemsUsed[element].measure}</span>
                <p class="viewDischargeSection__itemName">${doc.data().itemsUsed[element].name}</p>
                <span class="viewDischargeSection__itemPrice">$${doc.data().itemsUsed[element].value}</span>
                <span class="viewDischargeSection__itemTotalPrice">$${doc.data().itemsUsed[element].value.replace(',', '.') * doc.data().itemsUsed[element].used.replace(',', '.')}</span>`
                total = total + (doc.data().itemsUsed[element].value.replace(',', '.') * doc.data().itemsUsed[element].used.replace(',', '.'))
                let allTotalSpan = document.getElementById("allTotalSpan")
                allTotalSpan.textContent = `$${total.toFixed(2)}`
                switch (i) {
                    case 1:
                        i = 2
                        break;

                    default:
                        i = 1
                        break;
                }
            });
        });
    }
}


loadData()

