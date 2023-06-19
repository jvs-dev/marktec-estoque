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
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, query, where, updateDoc, arrayUnion, arrayRemove, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();
let sendButton = document.getElementById("sendButton")
let closeSendSection = document.getElementById("closeSendSection")
let addSendItems = document.getElementById("addSendItems")
let closeSectionSelectSend = document.getElementById("closeSectionSelectSend")
let SendItems = document.getElementById("SendItems")
let actualUserEmail = ""
let itemsSelecteds = {}
let actualUserName = ""

function loadData() {
    let SectionItemsCardsSend = document.getElementById("SectionItemsCardsSend")
    SectionItemsCardsSend.innerHTML = ""
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            actualUserEmail = user.email
            let usersdocref = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                actualUserName = doc.data().fullName
                loadUsers()
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
            let unsub = onSnapshot(doc(db, "tecnics", `${user.email}`), (doc) => {
                let SectionItemsCardsSend = document.getElementById("SectionItemsCardsSend")
                SectionItemsCardsSend.innerHTML = ""
                doc.data().items.forEach(element => {
                    if (element.tecnicStock > 0) {
                        let article = document.createElement("article")
                        SectionItemsCardsSend.insertAdjacentElement("beforeend", article)
                        article.classList.add("discharge__article")
                        if (itemsSelecteds[element.itemName] != undefined && itemsSelecteds[element.itemName].used != 0) {
                            article.classList.add("used")
                        }
                        article.innerHTML = `
                            <img src="${element.itemImg}" alt="" class="discharge__img">
                            <div class="discharge__div">
                                <p class="discharge__name">${element.itemName}</p>
                                <p class="discharge__used">Usou: ${itemsSelecteds[element.itemName] == undefined ? "0" : itemsSelecteds[element.itemName].used} ${element.measure}</p>
                            </div>`
                        article.onclick = function () {
                            let editQuanty = document.getElementById("centralizeSend")
                            editQuanty.style.display = "flex"
                            let closeEditUsedQuanty = document.getElementById("closeEditSendQuanty")
                            closeEditSendQuanty.onclick = function () {
                                editQuanty.style.display = "none"
                            }
                            let confirmUsedQuantyBtn = document.getElementById("confirmSendQuantyBtn")
                            confirmUsedQuantyBtn.onclick = function () {
                                let usedQuantyInput = document.getElementById("sendQuantyInput").value
                                if (usedQuantyInput != "" && usedQuantyInput != 0) {
                                    if (element.measure == "Unidades" && parseInt(usedQuantyInput) == parseFloat(usedQuantyInput)) {
                                        if (usedQuantyInput <= element.tecnicStock) {
                                            let name = element.itemName;
                                            itemsSelecteds[name] = { used: usedQuantyInput, name: element.itemName, measure: element.measure, img: element.itemImg, value: element.itemValue };

                                            let clearInput = document.getElementById("sendQuantyInput")
                                            clearInput.value = ""
                                            editQuanty.style.display = "none"

                                            article.innerHTML = `
                                                <img src="${element.itemImg}" alt="" class="discharge__img">
                                                <div class="discharge__div">
                                                    <p class="discharge__name">${element.itemName}</p>
                                                    <p class="discharge__used">Usou: ${itemsSelecteds[element.itemName] == undefined ? "0" : itemsSelecteds[element.itemName].used} ${element.measure}</p>
                                                </div>`
                                            if (itemsSelecteds[element.itemName].used != 0) {
                                                article.classList.add("used")
                                                addToForm(user.email, itemsSelecteds)
                                            }
                                        } else {
                                            let editUsedQuantyAlert = document.getElementById("editSendQuantyAlert")
                                            editUsedQuantyAlert.textContent = "Quantia em estoque insuficiente"
                                            setTimeout(() => {
                                                editUsedQuantyAlert.textContent = ""
                                            }, 5000);
                                        }
                                    } else {
                                        if (element.measure != "Unidades") {
                                            if (usedQuantyInput <= element.tecnicStock) {
                                                let name = element.itemName;
                                                itemsSelecteds[name] = { used: usedQuantyInput, name: element.itemName, measure: element.measure, img: element.itemImg, value: element.itemValue };

                                                let clearInput = document.getElementById("sendQuantyInput")
                                                clearInput.value = ""
                                                editQuanty.style.display = "none"

                                                article.innerHTML = `
                                                    <img src="${element.itemImg}" alt="" class="discharge__img">
                                                    <div class="discharge__div">
                                                        <p class="discharge__name">${element.itemName}</p>
                                                        <p class="discharge__used">Usou: ${itemsSelecteds[element.itemName] == undefined ? "0" : itemsSelecteds[element.itemName].used} ${element.measure}</p>
                                                    </div>`
                                                if (itemsSelecteds[element.itemName].used != 0) {
                                                    article.classList.add("used")
                                                    addToForm(user.email, itemsSelecteds)
                                                }
                                            } else {
                                                let editUsedQuantyAlert = document.getElementById("editSendQuantyAlert")
                                                editUsedQuantyAlert.textContent = "Quantia em estoque insuficiente"
                                                setTimeout(() => {
                                                    editUsedQuantyAlert.textContent = ""
                                                }, 5000);
                                            }
                                        } else {
                                            let editUsedQuantyAlert = document.getElementById("editSendQuantyAlert")
                                            editUsedQuantyAlert.textContent = "Digite um valor inteiro para unidades"
                                            setTimeout(() => {
                                                editUsedQuantyAlert.textContent = ""
                                            }, 5000);
                                        }
                                    }
                                } else {
                                    let editUsedQuantyAlert = document.getElementById("editSendQuantyAlert")
                                    editUsedQuantyAlert.textContent = "Digite um valor diferente de 0"
                                    setTimeout(() => {
                                        editUsedQuantyAlert.textContent = ""
                                    }, 5000);
                                }
                            }
                        }
                    }
                });

            });
        }
    })
}


function loadUsers() {
    let ReciverInput = document.getElementById("ReciverInput")
    ReciverInput.innerHTML = ""
    let q = query(collection(db, "users"), where("permission", "==", true));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().email != actualUserEmail) {
                if (doc.data().admin != true) {
                    let option = document.createElement("option")
                    ReciverInput.insertAdjacentElement("beforeend", option)
                    option.textContent = `${doc.data().fullName} (${doc.data().work})`
                    option.value = doc.data().email
                }
            }
        });
    });
}

sendButton.onclick = function () {
    let sendSection = document.getElementById("sendSection")
    sendSection.style.display = "flex"
}
closeSendSection.onclick = function () {
    let sendSection = document.getElementById("sendSection")
    sendSection.style.display = "none"
}

addSendItems.onclick = function () {
    let sectionSelectSend = document.getElementById("sectionSelectSend")
    sectionSelectSend.style.display = "flex"
}
closeSectionSelectSend.onclick = function () {
    let sectionSelectSend = document.getElementById("sectionSelectSend")
    sectionSelectSend.style.display = "none"
}


function addToForm(email, object) {
    let dischargeSelectedSection = document.getElementById("sendSelectedSection")
    dischargeSelectedSection.innerHTML = ""
    let unsub = onSnapshot(doc(db, "tecnics", `${email}`), (doc) => {
        doc.data().items.forEach(element => {
            if (object[element.itemName] != undefined && object[element.itemName].used != 0) {
                let article = document.createElement("article")
                dischargeSelectedSection.insertAdjacentElement("beforeend", article)
                article.classList.add("discharge__article")
                article.innerHTML = `
                    <img src="${object[element.itemName].img}" alt="" class="discharge__img">
                    <div class="discharge__div">
                        <p class="discharge__name">${object[element.itemName].name}</p>
                        <p class="discharge__used">Usou: ${object[element.itemName].used} ${element.measure}</p>
                    </div>`
                let removeItem = document.createElement("button")
                article.insertAdjacentElement("afterbegin", removeItem)
                removeItem.innerHTML = `<ion-icon name="close-circle-outline"></ion-icon>`
                removeItem.classList.add("unselectItem")
                removeItem.onclick = function () {

                    delete itemsSelecteds[object[element.itemName].name]
                    addToForm(email, itemsSelecteds)
                    let SectionItemsCards = document.getElementById("SectionItemsCardsSend")
                    SectionItemsCards.innerHTML = ""
                    loadData()
                }
            }
        })
    })
}











SendItems.onclick = function () {
    SendItems.innerHTML = `
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
    SendItems.classList.add("loading")
    let Reciver = document.getElementById("ReciverInput").value
    let motive = document.getElementById("motive").value
    let Senddescription = document.getElementById("Senddescription").value
    if (Senddescription != "" && motive != "" && Reciver != "" && Object.keys(itemsSelecteds).length != 0) {
        setUsedItems()
    } else {
        let dischargeItemsAlert = document.getElementById("sendItemsAlert")
        SendItems.innerHTML = `TRANSFERIR`
        SendItems.classList.remove("loading")
        dischargeItemsAlert.textContent = "Preencha todos os campos e selecione um item para fazer o relatório"
        dischargeItemsAlert.style.color = "#f00"
        setTimeout(() => {
            dischargeItemsAlert.textContent = ""
        }, 5000);
    }
}

async function setUsedItems() {
    let reciverEmail = document.getElementById("ReciverInput").value
    function loadReciverName() {
        let unsub = onSnapshot(doc(db, "users", `${reciverEmail}`), (doc) => {
            finalize(doc.data().fullName)
        });
    }
    async function finalize(reciverName) {
        let SectionItemsCards = document.getElementById("SectionItemsCardsSend")
        SectionItemsCards.innerHTML = ""
        let motive = document.getElementById("motive").value
        let Senddescription = document.getElementById("Senddescription").value
        let timeElapsed = Date.now();
        let today = new Date(timeElapsed);
        let date = today.toLocaleDateString()
        let dataAtual = new Date();
        let hora = dataAtual.getHours();
        let minutos = dataAtual.getMinutes();
        let horaFormatada = hora < 10 ? '0' + hora : hora;
        let minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
        let hours = horaFormatada + ":" + minutosFormatados
        let docRef = await addDoc(collection(db, "transfers"), {
            motive: motive,
            description: Senddescription,
            reciverEmail: reciverEmail,
            reciverName: reciverName,
            senderName: actualUserName,
            senderEmail: actualUserEmail,
            itemsToTransfer: itemsSelecteds,
            status: "Pendente",
            date: date,
            hours: hours,
            timestamp: serverTimestamp()
        });
        Object.keys(itemsSelecteds).forEach(element => {
            SectionItemsCards.innerHTML = ""
            let unsub = onSnapshot(doc(db, "tecnics", `${actualUserEmail}`), (doc) => {
                doc.data().items.forEach(dataArray => {
                    SectionItemsCards.innerHTML = ""
                    if (element == dataArray.itemName) {
                        clearInputs()
                        SectionItemsCards.innerHTML = ""
                    }
                });
            });
        });   
    }
    loadReciverName()
}


function clearInputs() {
    let motive = document.getElementById("motive")
    let SectionItemsCards = document.getElementById("SectionItemsCardsSend")
    let dischargeSelectedSection = document.getElementById("sendSelectedSection")
    let dischargeItemsAlert = document.getElementById("sendItemsAlert")
    motive.value = ""
    dischargeSelectedSection.innerHTML = ""
    SectionItemsCards.innerHTML = ""
    loadData()
    SendItems.innerHTML = `TRANSFERIR`
    SendItems.classList.remove("loading")
    dischargeItemsAlert.textContent = "Relatório feito com sucesso"
    dischargeItemsAlert.style.color = "#0f0"
    setTimeout(() => {
        dischargeItemsAlert.textContent = ""
    }, 5000);
}








loadData()

