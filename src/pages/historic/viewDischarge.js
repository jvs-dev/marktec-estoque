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
let actualUser = ""

function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
                actualUser = doc.data().fullName
            })
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
                <button id="generatePDF">Gerar PDF</button>
            </div>
            <a href="#" class="viewDischargeSection__back"><ion-icon
                    name="arrow-back-outline"></ion-icon>Voltar</a>
            <p class="viewDischargeSection__copyright">©Marktec telecom</p>`
            let generatePDF = document.getElementById("generatePDF")
            let timeElapsed = Date.now();
            let today = new Date(timeElapsed);
            let date = today.toLocaleDateString()
            let dataAtual = new Date();
            let hora = dataAtual.getHours();
            let minutos = dataAtual.getMinutes();
            let horaFormatada = hora < 10 ? '0' + hora : hora;
            let minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
            let hours = horaFormatada + ":" + minutosFormatados
            let tecnicName = doc.data().tecnicName
            let clientName = doc.data().clientName
            let dischargeDate = doc.data().date
            let dischargeHour = doc.data().hours
            let service = doc.data().service
            let location = doc.data().location
            let description = doc.data().description
            let itemsUsedList = ""
            let reqId = doc.id
            function returnList() {
                Object.keys(doc.data().itemsUsed).forEach(element => {
                    itemsUsedList = `${itemsUsedList}<li>${doc.data().itemsUsed[element].used} ${doc.data().itemsUsed[element].measure} - ${doc.data().itemsUsed[element].name}.</li>`
                });
            }
            returnList()
            generatePDF.onclick = function () {
                let doc = new jsPDF()
                doc.fromHTML(`<h1 style="font-size: 32px; font-weight: 500; font-family: 'Poppins', sans-serif;">Comprovante de baixa</h1>`, 10, 10)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">ID da baixa: ${reqId}</p>`, 10, 21)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">© Marktec Telecom</p>`, 10, 27)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Comprovante emitido por ${actualUser} dia ${date} ás ${hours}.</p>`, 10, 40)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Items usados por ${tecnicName}.</p>`, 10, 48)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Baixa realizada dia ${dischargeDate} ás ${dischargeHour}.</p>`, 10, 56)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Serviço feito: ${service}.</p>`, 10, 64)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Local da ${service}: ${location}.</p>`, 10, 72)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Nome do cliente: ${clientName}.</p>`, 10, 80)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Descrição da baixa: ${description}.</p>`, 10, 88)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Items usados:</p>`, 10, 96)
                doc.fromHTML(`<ul style="font-size: 18px; font-family: 'Poppins', sans-serif;"><br>${itemsUsedList}</ul>`, 10, 104)
                doc.save(`Baixa${date}.pdf`)
            }
            let i = 1
            let total = 0
            let viewDischargeSection__back = document.querySelector(".viewDischargeSection__back")
            viewDischargeSection__back.onclick = function () {
                window.history.back()
            }
            Object.keys(doc.data().itemsUsed).forEach(element => {
                let viewCardSection = document.getElementById("viewCardSection")
                let article = document.createElement("article")
                let itemTotal = Number(doc.data().itemsUsed[element].value)
                viewCardSection.insertAdjacentElement("beforeend", article)
                article.classList.add("viewDischargeSection__item")
                article.style.background = `var(--background-${i})`
                if (doc.data().itemsUsed[element].value.includes(",")) {
                    if (doc.data().itemsUsed[element].value.includes(".") == false) {
                        itemTotal = Number(doc.data().itemsUsed[element].value.replace(",", "."))
                    }
                }
                if (doc.data().itemsUsed[element].value.includes(".")) {
                    if (doc.data().itemsUsed[element].value.includes(",")) {
                        itemTotal = Number(doc.data().itemsUsed[element].value.replace(".", "").replace(",", "."))
                    }
                }
                article.innerHTML = `
                <span class="viewDischargeSection__itemQuanty">${doc.data().itemsUsed[element].used} ${doc.data().itemsUsed[element].measure}</span>
                <p class="viewDischargeSection__itemName">${doc.data().itemsUsed[element].name}</p>
                <span class="viewDischargeSection__itemPrice">$${doc.data().itemsUsed[element].value}</span>
                <span class="viewDischargeSection__itemTotalPrice">$${(itemTotal * doc.data().itemsUsed[element].used).toFixed(2)}</span>`
                total = total + (itemTotal * doc.data().itemsUsed[element].used)
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

