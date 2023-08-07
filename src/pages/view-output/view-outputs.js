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
let actualUserWork = ""

function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
                actualUser = doc.data().fullName
                actualUserWork = doc.data().work
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
        let unsub = onSnapshot(doc(db, "outputs", `${dataId}`), (doc) => {
            viewDischargeSection.style.display = "flex"
            viewDischargeSection.innerHTML = `
            <div class="squares">
                <div class="square--1"></div>
                <div class="square--2"></div>
                <div class="square--3"></div>
            </div>
            <div class="content">
                <h2 class="viewDischargeSection__h2">Saída de itens</h2>
                <p class="viewTransferSection__tecnic">Registrado por ${doc.data().recorderName}.</p>
                <div class="viewDischargeSection__div--1">
                    <span class="viewDischargeSection__date">Registrado dia ${doc.data().date} ás ${doc.data().hours}</span>
                </div>
                <header class="viewDischargeSection__header">
                    <span class="viewDischargeSection__header__span span--1">Quantia</span>
                    <span class="viewDischargeSection__header__span span--2">Nome</span>
                    <span class="viewDischargeSection__header__span span--3">${actualUserWork != "Técnico" ? "Preço" : ""}</span>
                    <span class="viewDischargeSection__header__span span--4">${actualUserWork != "Técnico" ? "Total" : ""}</span>
                </header>
                <section class="viewDischargeSection__section" id="viewCardSection">
                </section>
                <div class="viewDischargeSection__div--2">
                    <div class="viewDischargeSection__div--3">
                        <p class="viewDischargeSection__descriprion">Descrição: ${doc.data().description}.</p>
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
            let recorderName = doc.data().recorderName
            let requestDate = doc.data().date
            let requesthour = doc.data().hours
            let requestDescription = doc.data().description
            let itemsToTransferList = ""
            let totalValue = ""
            let reqId = doc.id
            function returnList() {
                Object.keys(doc.data().itemsOutputs).forEach(element => {
                    itemsToTransferList = `${itemsToTransferList}<li>${doc.data().itemsOutputs[element].used} ${doc.data().itemsOutputs[element].measure} - ${doc.data().itemsOutputs[element].name}.</li>`
                });
            }
            returnList()
            function returnTotalValue() {
                if (actualUserWork != "Técnico") {
                    Object.keys(doc.data().itemsOutputs).forEach(element => {
                        let itemPrice = Number(doc.data().itemsOutputs[element].value)
                        if (doc.data().itemsOutputs[element].value.includes(",")) {
                            if (doc.data().itemsOutputs[element].value.includes(".") == false) {
                                itemPrice = Number(doc.data().itemsOutputs[element].value.replace(",", "."))
                            }
                        }
                        if (doc.data().itemsOutputs[element].value.includes(".")) {
                            if (doc.data().itemsOutputs[element].value.includes(",")) {
                                itemPrice = Number(doc.data().itemsOutputs[element].value.replace(".", "").replace(",", "."))
                            }
                        }
                        totalValue = Number(totalValue) + itemPrice * doc.data().itemsOutputs[element].used
                    })
                    return `${totalValue}`.replace(".", ",")
                }
            }
            generatePDF.onclick = function () {
                let doc = new jsPDF()
                doc.fromHTML(`<h1 style="font-size: 32px; font-weight: 500; font-family: 'Poppins', sans-serif;">Comprovante de remoção de itens</h1>`, 10, 10)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">ID da transferência: ${reqId}</p>`, 10, 21)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">© Marktec Telecom</p>`, 10, 27)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Comprovante emitido por ${actualUser} dia ${date} ás ${hours}.</p>`, 10, 40)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Remoção feita por ${recorderName}.</p>`, 10, 48)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Remoção feita dia ${requestDate} ás ${requesthour}.</p>`, 10, 56)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Descrição da remoção: ${requestDescription}.</p>`, 10, 64)
                doc.fromHTML(`<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Itens removidos:</p>`, 10, 72)
                doc.fromHTML(`<ul style="font-size: 18px; font-family: 'Poppins', sans-serif;"><br>${itemsToTransferList}${actualUserWork != "Técnico" ? `<p style="font-size: 18px; font-family: 'Poppins', sans-serif;">Total removido: <span style="font-weight: 500;">$${returnTotalValue()}</span>.</p>` : ""}</ul>`, 10, 80)
                doc.save(`Rlt_Saída_${date}.pdf`)
            }
            let i = 1
            let total = 0
            let viewDischargeSection__back = document.querySelector(".viewDischargeSection__back")
            viewDischargeSection__back.onclick = function () {
                window.history.back()
            }
            Object.keys(doc.data().itemsOutputs).forEach(element => {
                let viewCardSection = document.getElementById("viewCardSection")
                let article = document.createElement("article")
                let itemTotal = Number(doc.data().itemsOutputs[element].value)
                viewCardSection.insertAdjacentElement("beforeend", article)
                article.classList.add("viewDischargeSection__item")
                article.style.background = `var(--background-${i})`
                if (doc.data().itemsOutputs[element].value.includes(",")) {
                    if (doc.data().itemsOutputs[element].value.includes(".") == false) {
                        itemTotal = Number(doc.data().itemsOutputs[element].value.replace(",", "."))
                    }
                }
                if (doc.data().itemsOutputs[element].value.includes(".")) {
                    if (doc.data().itemsOutputs[element].value.includes(",")) {
                        itemTotal = Number(doc.data().itemsOutputs[element].value.replace(".", "").replace(",", "."))
                    }
                }
                if (actualUserWork != "Técnico") {
                    article.innerHTML = `
                        <span class="viewDischargeSection__itemQuanty">${doc.data().itemsOutputs[element].used} ${doc.data().itemsOutputs[element].measure}</span>
                        <p class="viewDischargeSection__itemName">${doc.data().itemsOutputs[element].name}</p>
                        <span class="viewDischargeSection__itemPrice">$${doc.data().itemsOutputs[element].value}</span>
                        <span class="viewDischargeSection__itemTotalPrice">$${(itemTotal * doc.data().itemsOutputs[element].used).toFixed(2)}</span>`
                } else {
                    article.innerHTML = `
                        <span class="viewDischargeSection__itemQuanty">${doc.data().itemsOutputs[element].used} ${doc.data().itemsOutputs[element].measure}</span>
                        <p class="viewDischargeSection__itemName">${doc.data().itemsOutputs[element].name}</p>`
                }
                if (actualUserWork != "Técnico") {
                    total = total + (itemTotal * doc.data().itemsOutputs[element].used)
                    let allTotalSpan = document.getElementById("allTotalSpan")
                    allTotalSpan.textContent = `$${total.toFixed(2)}`
                }
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

