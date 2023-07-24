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
        let unsub = onSnapshot(doc(db, "transfers", `${dataId}`), (doc) => {
            viewDischargeSection.style.display = "flex"
            viewDischargeSection.innerHTML = `
            <div class="squares">
                <div class="square--1"></div>
                <div class="square--2"></div>
                <div class="square--3"></div>
            </div>
            <div class="content">
                <h2 class="viewDischargeSection__h2">transferência</h2>
                <p class="viewTransferSection__tecnic">de ${doc.data().senderName} para ${doc.data().reciverName}.</p>
                <div class="viewDischargeSection__div--1">
                    <span class="viewDischargeSection__date">solicitado: ${doc.data().date} ás ${doc.data().hours}${doc.data().acceptHours != undefined ? `<br>aceito ás: ${doc.data().acceptHours} do mesmo dia` : ""}</span>
                    <span class="viewDischargeSection__client" style="color: ${returnCLR(doc.data().status)};">${doc.data().status}</span>
                </div>
                <header class="viewDischargeSection__header">
                    <span class="viewDischargeSection__header__span span--1">Quantia</span>
                    <span class="viewDischargeSection__header__span span--2">Nome</span>
                    <span class="viewDischargeSection__header__span span--3">Preço</span>
                    <span class="viewDischargeSection__header__span span--4">Total</span>
                </header>
                <section class="viewDischargeSection__section" id="viewCardSection">
                </section>
                <div class="viewDischargeSection__div--2">
                    <div class="viewDischargeSection__div--3">
                        <p class="viewDischargeSection__local">Motivo: ${doc.data().motive}.</p>
                        <p class="viewDischargeSection__descriprion">Descrição: ${doc.data().description}.</p>
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
            Object.keys(doc.data().itemsToTransfer).forEach(element => {
                let viewCardSection = document.getElementById("viewCardSection")
                let article = document.createElement("article")
                viewCardSection.insertAdjacentElement("beforeend", article)
                article.classList.add("viewDischargeSection__item")
                article.style.background = `var(--background-${i})`
                article.innerHTML = `
                <span class="viewDischargeSection__itemQuanty">${doc.data().itemsToTransfer[element].used} ${doc.data().itemsToTransfer[element].measure}</span>
                <p class="viewDischargeSection__itemName">${doc.data().itemsToTransfer[element].name}</p>
                <span class="viewDischargeSection__itemPrice">$${doc.data().itemsToTransfer[element].value}</span>
                <span class="viewDischargeSection__itemTotalPrice">$${(doc.data().itemsToTransfer[element].value.replace(',', '.') * doc.data().itemsToTransfer[element].used.replace(',', '.')).toFixed(2)}</span>`
                total = total + (doc.data().itemsToTransfer[element].value.replace(',', '.') * doc.data().itemsToTransfer[element].used.replace(',', '.'))
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

function returnCLR(status) {
    switch (status) {
        case "Pendente":
            return "var(--orange)"
            break;
        case "Aceito":
            return "var(--green)"
            break;
        case "Recusado":
            return "#f00"
            break;
        case "expirado":
            return "#f00"
            break;
    }
}


loadData()

