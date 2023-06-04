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
let transfer = document.getElementById("transfer")
let acceptUser = document.getElementById("acceptUser")
let addItem = document.getElementById("addItem")
let transferSelected = ""
let actualUser = ""
let actualUserName = ""
let measure = ""
let sendRequest = document.getElementById("sendRequest")
let closeSendSection = document.getElementById("closeSendSection")
let sendButton = document.getElementById("sendButton")
let closeFinalizeSend = document.getElementById("closeFinalizeSend")
let person = document.getElementById("person")

closeFinalizeSend.onclick = function () {
    let finalizeSend = document.getElementById("finalizeSend")
    finalizeSend.style.display = "none"
}

sendButton.onclick = function () {
    let sendSection = document.getElementById("sendSection")
    sendSection.style.display = "flex"
}

closeSendSection.onclick = function () {
    let sendSection = document.getElementById("sendSection")
    sendSection.style.display = "none"
}

function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                if (doc.data().admin == true) {
                    transfer.style.display = "none"
                    acceptUser.style.display = "flex"
                    addItem.style.display = "flex"
                } else {
                    transfer.style.display = "flex"
                    acceptUser.style.display = "none"
                    addItem.style.display = "none"
                    actualUser = user.email
                    loadUsers()
                    loadRequests()
                    actualUserName = doc.data().fullName
                }
            });
        }
    });
}

loadData()

async function loadItems() {
    let q = query(collection(db, "items"), where("active", "==", true));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let itemSelectSection = document.getElementById("itemSelectSection")
            let article = document.createElement("article")
            itemSelectSection.insertAdjacentElement("beforeend", article)
            article.classList.add("itemSelectSection__card")
            article.innerHTML = `
            <img class="itemSelectSection__img" src="${doc.data().itemImg}" alt="">
            <p class="itemSelectSection__p">${doc.data().itemName}</p>`
            article.onclick = function () {
                transferSelected = `${doc.data().itemName}`
                let finalizeSend = document.getElementById("finalizeSend")
                finalizeSend.style.display = "flex"
                let itemSelectedName = document.getElementById("itemSelectedName")
                itemSelectedName.innerText = doc.data().itemName
                let itemSelectedIMG = document.getElementById("itemSelectedIMG")
                itemSelectedIMG.src = doc.data().itemImg
                measure = doc.data().measure
            }
        });
    });

}

loadItems()

function loadUsers() {
    let q = query(collection(db, "users"), where("permission", "==", true));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().email != actualUser) {
                if (doc.data().admin != true) {
                    let option = document.createElement("option")
                    person.insertAdjacentElement("beforeend", option)
                    option.textContent = doc.data().fullName
                    option.value = doc.data().email
                }
            }
        });
    });
}

function checkTecnicQuanty(email, item) {


}

sendRequest.onclick = function () {
    let reciverEmail = document.getElementById("person").value
    let actualDate = new Date();
    let date = `${actualDate.getDate().length == 1 ? actualDate.getDate() : "0" + actualDate.getDate()}/${actualDate.getMonth().length == 1 ? actualDate.getMonth() + 1 : `0${actualDate.getMonth() + 1}`}/${actualDate.getFullYear()}`
    let motive = document.getElementById("motive").value
    let quanty = document.getElementById("quanty").value
    let itemName = transferSelected
    let itemSelectedIMG = document.getElementById("itemSelectedIMG")
    let itemImg = itemSelectedIMG.src
    if (quanty != 0) {
        let unsub = onSnapshot(doc(db, "tecnics", `${actualUser}`), (doc) => {
            doc.data().items.forEach(element => {
                if (element.itemName == itemName) {
                    if (element.tecnicStock < quanty) {
                        let sendRequestAlert = document.getElementById("sendRequestAlert")
                        sendRequestAlert.style.visibility = "visible"
                        sendRequestAlert.textContent = "Você não tem esta quantia em estoque"
                    } else {
                        addRequest(actualUser, reciverEmail, date, motive, quanty, itemName, itemImg)
                    }
                }
            });
        });
    } else {
        let sendRequestAlert = document.getElementById("sendRequestAlert")
        sendRequestAlert.style.visibility = "visible"
        sendRequestAlert.textContent = "Por favor insira uma quantidade"
        setTimeout(() => {
            sendRequestAlert.style.visibility = "hidden"
        }, 10000);
    }
}

async function addRequest(senderEmail, reciverEmail, date, motive, quanty, itemName, itemImg) {
    let senderName = actualUserName
    let unsub = onSnapshot(doc(db, "users", `${reciverEmail}`), (doc) => {
        finalize(doc.data().fullName)
    });
    async function finalize(reciverName) {
        let docRef = await addDoc(collection(db, "transfers"), {
            status: "pendente",
            senderEmail: senderEmail,
            senderName: senderName,
            reciverEmail: reciverEmail,
            date: date,
            motive: motive,
            quanty: quanty,
            itemName: itemName,
            itemImg: itemImg,
            measure: measure,
            reciverName: reciverName
        });
    }
    cleanQuanty()
    let sendRequestAlert = document.getElementById("sendRequestAlert")
    sendRequestAlert.style.visibility = "visible"
    sendRequestAlert.textContent = "Solicitação enviada com sucesso!"
    sendRequestAlert.style.color = "#0f0"
    setTimeout(() => {
        sendRequestAlert.style.visibility = "hidden"
        sendRequestAlert.style.color = "#f00"
    }, 10000);
}

function cleanQuanty() {
    let quanty = document.getElementById("quanty")
    quanty.value = ""
}

//
//

function loadRequests() {
    let q = query(collection(db, "transfers"), where("reciverEmail", "==", `${actualUser}`));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().status == "pendente") {
                let requestSection = document.getElementById("requestSection")
                let article = document.createElement("article")
                let div = document.createElement("div")
                let acceptReq = document.createElement("button")
                let recuseReq = document.createElement("button")
                article.classList.add("requestCard")
                requestSection.insertAdjacentElement("beforeend", article)
                article.innerHTML = `
                <div class="requestCard__div--content">
                    <h2 class="requestCard__tecnic">Técnico: Geiseane Pereira Santana Da silva</h2>
                    <div class="requestCard__div--1">
                        <div class="requestCard__div--2">
                            <p class="requestCard__item">Deseja enviar: ${doc.data().itemName}</p>
                            <p class="requestCard__quanty">quantia: ${doc.data().quanty} ${doc.data().measure}</p>
                        </div>
                    </div>
                    <div class="requestCard__div--3">
                        <p class="requestCard__motive">Motivo: ${doc.data().motive}</p>
                        <p class="requestCard__date">${doc.data().date}</p>
                    </div>
                </div>`
                article.insertAdjacentElement("beforeend", div)
                div.insertAdjacentElement("beforeend", acceptReq)
                div.insertAdjacentElement("beforeend", recuseReq)
                div.classList.add("requestCard__div--buttons")
                acceptReq.classList.add("requestCard__accept")
                recuseReq.classList.add("requestCard__recuse")
                acceptReq.innerHTML = `<ion-icon name="checkmark-circle-outline"></ion-icon>`
                recuseReq.innerHTML = `<ion-icon name="close-circle-outline"></ion-icon>`
                acceptReq.onclick = function () {
                    acceptReqFct(doc.id)
                }
                recuseReq.onclick = function () {
                    recuseReqFct(doc.id)
                }
            }
        });
    });
}

async function recuseReqFct(reqId) {
    let requestSection = document.getElementById("requestSection")
    let transfersRef = doc(db, "transfers", `${reqId}`);
    await updateDoc(transfersRef, {
        status: "recusado"
    });
    requestSection.innerHTML = ""
    loadRequests()
}

async function acceptReqFct(reqId) {
    let requestSection = document.getElementById("requestSection")
    let transfersRef = doc(db, "transfers", `${reqId}`);
    await updateDoc(transfersRef, {
        status: "aceito"
    });
    requestSection.innerHTML = ""
    loadRequests()
}