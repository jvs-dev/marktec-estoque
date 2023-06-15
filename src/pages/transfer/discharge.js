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
            });
            let unsub = onSnapshot(doc(db, "tecnics", `${user.email}`), (doc) => {
                doc.data().items.forEach(element => {
                    if (element.tecnicStock > 0) {
                        let article = document.createElement("article")
                        let SectionItemsCards = document.getElementById("SectionItemsCards")
                        SectionItemsCards.insertAdjacentElement("beforeend", article)
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
                            let editQuanty = document.getElementById("centralize")
                            editQuanty.style.display = "flex"
                            let closeEditUsedQuanty = document.getElementById("closeEditUsedQuanty")
                            closeEditUsedQuanty.onclick = function () {
                                editQuanty.style.display = "none"
                            }
                            let confirmUsedQuantyBtn = document.getElementById("confirmUsedQuantyBtn")
                            confirmUsedQuantyBtn.onclick = function () {
                                let usedQuantyInput = document.getElementById("usedQuantyInput").value
                                if (usedQuantyInput != "" && usedQuantyInput != 0) {
                                    if (element.measure == "Unidades" && parseInt(usedQuantyInput) == parseFloat(usedQuantyInput)) {
                                        if (usedQuantyInput <= element.tecnicStock) {
                                            let name = element.itemName;
                                            itemsSelecteds[name] = { used: usedQuantyInput, name: element.itemName, measure: element.measure, img: element.itemImg, value: element.itemValue };

                                            let clearInput = document.getElementById("usedQuantyInput")
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
                                            let editUsedQuantyAlert = document.getElementById("editUsedQuantyAlert")
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

                                                let clearInput = document.getElementById("usedQuantyInput")
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
                    }
                });

            });
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

function addToForm(email, object) {
    let dischargeSelectedSection = document.getElementById("dischargeSelectedSection")
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
                    let SectionItemsCards = document.getElementById("SectionItemsCards")
                    SectionItemsCards.innerHTML = ""
                    loadData()
                }
            }
        })
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
        SectionItemsCards.innerHTML = ""
        let unsub = onSnapshot(doc(db, "tecnics", `${actualUser}`), (doc) => {
            doc.data().items.forEach(dataArray => {
                SectionItemsCards.innerHTML = ""
                if (element == dataArray.itemName) {
                    removeTecnicItems(dataArray, itemsSelecteds[element].used)
                    SectionItemsCards.innerHTML = ""
                }
            });
        });
    });
}

function removeTecnicItems(object, used) {
    let newObject = {
        itemName: object.itemName,
        itemImg: object.itemImg,
        tecnicStock: object.tecnicStock - used,
        measure: object.measure,
        itemValue: object.itemValue
    }
    if (newObject.tecnicStock >= 0) {
        let tecnicRef = doc(db, "tecnics", `${actualUser}`);
        updateDoc(tecnicRef, {
            items: arrayRemove(object)
        });
        updateDoc(tecnicRef, {
            items: arrayUnion(newObject)
        });
        let SectionItemsCards = document.getElementById("SectionItemsCards")
        SectionItemsCards.innerHTML = ""
    }
    delete itemsSelecteds[object.itemName]
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