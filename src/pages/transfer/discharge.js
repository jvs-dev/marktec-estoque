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
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, query, where, updateDoc, arrayUnion, arrayRemove, getDoc, getDocs, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();
let closeSectionSelectDischarge = document.getElementById("closeSectionSelectDischarge")
let sectionSelectDischarge = document.getElementById("sectionSelectDischarge")
let addUsedItems = document.getElementById("addUsedItems")
let closeDischargeSection = document.getElementById("closeDischargeSection")
let usedButton = document.getElementById("usedButton")
let dischargeItems = document.getElementById("dischargeItems")
let actualUser = ""
let itemsSelecteds = {}
let tecnicName = ""

function loadData() {
    let SectionItemsCards = document.getElementById("SectionItemsCards")
    SectionItemsCards.innerHTML = ""
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            actualUser = user.email
            let usersdocref = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                tecnicName = doc.data().fullName
                if (doc.data().admin == true) {
                    transfer.style.display = "none"
                    acceptUser.style.display = "flex"
                    addItem.style.display = "flex"
                } else {
                    transfer.style.display = "flex"
                    acceptUser.style.display = "none"
                    addItem.style.display = "none"
                }
                loadStock(user.email)
            });
        }
    });
}


async function loadStock(email) {
    let querySnapshot = await getDocs(collection(db, "tecnics", `${email}`, "stock"));
    querySnapshot.forEach((doc) => {
        let SectionItemsCardsSend = document.getElementById("SectionItemsCards")
        let article = document.createElement("article")
        SectionItemsCardsSend.insertAdjacentElement("beforeend", article)
        article.classList.add("discharge__article")
        if (itemsSelecteds[doc.data().itemName] != undefined && itemsSelecteds[doc.data().itemName].used != 0) {
            article.classList.add("used")
        }
        article.innerHTML = `
            <img src="${doc.data().itemImg}" alt="" class="discharge__img">
            <div class="discharge__div">
                <p class="discharge__name">${doc.data().itemName}</p>
                <p class="discharge__used">Usou: ${itemsSelecteds[doc.data().itemName] == undefined ? "0" : itemsSelecteds[doc.data().itemName].used} ${doc.data().measure}</p>
            </div>`
        article.onclick = function () {
            let editQuanty = document.getElementById("centralize")
            editQuanty.style.display = "flex"
            let closeEditSendQuanty = document.getElementById("closeEditUsedQuanty")
            closeEditSendQuanty.onclick = function () {
                editQuanty.style.display = "none"
                let clearInput = document.getElementById("usedQuantyInput")
                clearInput.value = ""
                editQuanty.style.display = "none"
            }
            let confirmUsedQuantyBtn = document.getElementById("confirmUsedQuantyBtn")
            confirmUsedQuantyBtn.onclick = function () {
                let usedQuantyInput = document.getElementById("usedQuantyInput").value
                if (usedQuantyInput != "" && usedQuantyInput != 0) {
                    if (doc.data().measure == "Unidades" && parseInt(usedQuantyInput) == parseFloat(usedQuantyInput)) {
                        if (usedQuantyInput <= doc.data().tecnicStock) {
                            let name = doc.data().itemName;
                            itemsSelecteds[name] = { used: usedQuantyInput, name: doc.data().itemName, measure: doc.data().measure, img: doc.data().itemImg, value: doc.data().itemValue };
                            let clearInput = document.getElementById("usedQuantyInput")
                            clearInput.value = ""
                            editQuanty.style.display = "none"
                            article.innerHTML = `
                                <img src="${doc.data().itemImg}" alt="" class="discharge__img">
                                <div class="discharge__div">
                                    <p class="discharge__name">${doc.data().itemName}</p>
                                    <p class="discharge__used">Usou: ${itemsSelecteds[doc.data().itemName] == undefined ? "0" : itemsSelecteds[doc.data().itemName].used} ${doc.data().measure}</p>
                                </div>`
                            if (itemsSelecteds[doc.data().itemName].used != 0) {
                                article.classList.add("used")
                                addToForm(email, itemsSelecteds)
                            }
                        } else {
                            let editUsedQuantyAlert = document.getElementById("editUsedQuantyAlert")
                            editUsedQuantyAlert.textContent = "Quantia em estoque insuficiente"
                            setTimeout(() => {
                                editUsedQuantyAlert.textContent = ""
                            }, 5000);
                        }
                    } else {
                        let editUsedQuantyAlert = document.getElementById("editUsedQuantyAlert")
                        editUsedQuantyAlert.textContent = "Digite um valor inteiro para unidades"
                        setTimeout(() => {
                            editUsedQuantyAlert.textContent = ""
                        }, 5000);
                    }
                    if (doc.data().measure != "Unidades") {
                        if (usedQuantyInput <= doc.data().tecnicStock) {
                            let name = doc.data().itemName;
                            itemsSelecteds[name] = { used: usedQuantyInput, name: doc.data().itemName, measure: doc.data().measure, img: doc.data().itemImg, value: doc.data().itemValue };

                            let clearInput = document.getElementById("usedQuantyInput")
                            clearInput.value = ""
                            editQuanty.style.display = "none"

                            article.innerHTML = `
                                <img src="${doc.data().itemImg}" alt="" class="discharge__img">
                                <div class="discharge__div">
                                    <p class="discharge__name">${doc.data().itemName}</p>
                                    <p class="discharge__used">Usou: ${itemsSelecteds[doc.data().itemName] == undefined ? "0" : itemsSelecteds[doc.data().itemName].used} ${doc.data().measure}</p>
                                </div>`
                            if (itemsSelecteds[doc.data().itemName].used != 0) {
                                article.classList.add("used")
                                addToForm(email, itemsSelecteds)
                            }
                        } else {
                            let editUsedQuantyAlert = document.getElementById("editUsedQuantyAlert")
                            editUsedQuantyAlert.textContent = "Quantia em estoque insuficiente"
                            setTimeout(() => {
                                editUsedQuantyAlert.textContent = ""
                            }, 5000);
                        }
                    }
                } else {
                    let editUsedQuantyAlert = document.getElementById("editUsedQuantyAlert")
                    editUsedQuantyAlert.textContent = "Digite um valor diferente de 0"
                    setTimeout(() => {
                        editUsedQuantyAlert.textContent = ""
                    }, 5000);
                }
            }
        }
    });
}

closeSectionSelectDischarge.onclick = function () {
    sectionSelectDischarge.style.display = "none"
}
addUsedItems.onclick = function () {
    sectionSelectDischarge.style.display = "flex"
    SectionItemsCards.innerHTML = ""
    loadData()
}
closeDischargeSection.onclick = function () {
    let dischargeSection = document.getElementById("dischargeSection")
    dischargeSection.style.display = "none"
}
usedButton.onclick = function () {
    let dischargeSection = document.getElementById("dischargeSection")
    dischargeSection.style.display = "flex"
}

async function addToForm(email, object) {
    let dischargeSelectedSection = document.getElementById("dischargeSelectedSection")
    dischargeSelectedSection.innerHTML = ""
    let querySnapshot = await getDocs(collection(db, "tecnics", `${email}`, "stock"));
    querySnapshot.forEach((doc) => {
        if (object[doc.data().itemName] != undefined && object[doc.data().itemName].used != 0) {
            let article = document.createElement("article")
            dischargeSelectedSection.insertAdjacentElement("beforeend", article)
            article.classList.add("discharge__article")
            article.innerHTML = `
                    <img src="${object[doc.data().itemName].img}" alt="" class="discharge__img">
                    <div class="discharge__div">
                        <p class="discharge__name">${object[doc.data().itemName].name}</p>
                        <p class="discharge__used">Usou: ${object[doc.data().itemName].used} ${doc.data().measure}</p>
                    </div>`
            let removeItem = document.createElement("button")
            article.insertAdjacentElement("afterbegin", removeItem)
            removeItem.innerHTML = `<ion-icon name="close-circle-outline"></ion-icon>`
            removeItem.classList.add("unselectItem")
            removeItem.onclick = function () {
                delete itemsSelecteds[object[doc.data().itemName].name]
                addToForm(email, itemsSelecteds)
                let SectionItemsCards = document.getElementById("SectionItemsCards")
                SectionItemsCards.innerHTML = ""
                loadData()
            }
        }
    })
}


loadData()

dischargeItems.onclick = function () {
    dischargeItems.innerHTML = `
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
    dischargeItems.classList.add("loading")
    let description = document.getElementById("description").value
    let service = document.getElementById("service").value
    let location = document.getElementById("location").value
    let clientName = document.getElementById("clientName").value
    if (description != "" && service != "" && location != "" && clientName != "" && Object.keys(itemsSelecteds).length != 0) {
        setUsedItems()
    } else {
        let dischargeItemsAlert = document.getElementById("dischargeItemsAlert")
        dischargeItems.innerHTML = `Fazer relatório`
        dischargeItems.classList.remove("loading")
        dischargeItemsAlert.textContent = "Preencha todos os campos e selecione um item para fazer o relatório"
        dischargeItemsAlert.style.color = "#f00"
        setTimeout(() => {
            dischargeItemsAlert.textContent = ""
        }, 5000);
    }
}

async function setUsedItems() {
    let SectionItemsCards = document.getElementById("SectionItemsCards")
    SectionItemsCards.innerHTML = ""
    let description = document.getElementById("description").value
    let service = document.getElementById("service").value
    let location = document.getElementById("location").value
    let clientName = document.getElementById("clientName").value
    let timeElapsed = Date.now();
    let today = new Date(timeElapsed);
    let date = today.toLocaleDateString()
    let dataAtual = new Date();
    let hora = dataAtual.getHours();
    let minutos = dataAtual.getMinutes();
    let horaFormatada = hora < 10 ? '0' + hora : hora;
    let minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
    let hours = horaFormatada + ":" + minutosFormatados
    let docRef = await addDoc(collection(db, "discharges"), {
        service: service,
        clientName: clientName,
        tecnicName: tecnicName,
        location: location,
        description: description,
        itemsUsed: itemsSelecteds,
        date: date,
        hours: hours,
        timestamp: serverTimestamp()
    });
    Object.keys(itemsSelecteds).forEach(element => {
        removeTecnicItems(itemsSelecteds[element].name, itemsSelecteds[element].used)
        SectionItemsCards.innerHTML = ""
    });
}

async function removeTecnicItems(name, used) {
    let washingtonRef = doc(db, "tecnics", `${actualUser}`, "stock", `${name}`);
    await updateDoc(washingtonRef, {
        tecnicStock: increment(-used)
    });
    let itemRef = doc(db, "items", `${name}`);
    await updateDoc(itemRef, {
        withTecnics: increment(-used)
    });
    clearInputs()
}

function clearInputs() {
    let description = document.getElementById("description")
    let location = document.getElementById("location")
    let clientName = document.getElementById("clientName")
    let SectionItemsCards = document.getElementById("SectionItemsCards")
    let dischargeSelectedSection = document.getElementById("dischargeSelectedSection")
    let dischargeItemsAlert = document.getElementById("dischargeItemsAlert")
    description.value = ""
    location.value = ""
    clientName.value = ""
    dischargeSelectedSection.innerHTML = ""
    SectionItemsCards.innerHTML = ""
    loadData()
    dischargeItems.innerHTML = `Fazer relatório`
    dischargeItems.classList.remove("loading")
    dischargeItemsAlert.textContent = "Relatório feito com sucesso"
    dischargeItemsAlert.style.color = "#0f0"
    setTimeout(() => {
        dischargeItemsAlert.textContent = ""
    }, 5000);
}