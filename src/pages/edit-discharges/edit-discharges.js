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
let dischargeItems = document.getElementById("dischargeItems")
let actualUser = ""
let itemsSelecteds = {}
let tecnicName = ""
let actualUserName = ""
let actualUserEmail = ""
let actualUserWork = ""
let dischargeId = ""

function loadData() {
    let SectionItemsCards = document.getElementById("SectionItemsCards")
    SectionItemsCards.innerHTML = ""
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            actualUser = user.email
            let usersdocref = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                let dischargeSection = document.getElementById("dischargeSection")
                dischargeSection.style.display = "flex"
                tecnicName = doc.data().fullName
                actualUserName = doc.data().fullName
                actualUserEmail = doc.data().email
                actualUserWork = doc.data().work
                verifyParams(actualUserWork, actualUserName, actualUserEmail)
            });
        }
    });
}

async function verifyParams(work, userName, actualUserEmail) {
    let timeElapsed = Date.now();
    let today = new Date(timeElapsed);
    let actualDate = today.toLocaleDateString()
    let urlParams = new URLSearchParams(window.location.search);
    let dataId = urlParams.get('id');
    if (dataId != null) {
        let docRef = doc(db, "discharges", `${dataId}`);
        let docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            if (work == "Técnico" && userName == docSnap.data().tecnicName && actualDate == docSnap.data().date && docSnap.data().edited != true) {
                dischargeId = dataId
                let description = document.getElementById("description")
                let service = document.getElementById("service")
                let location = document.getElementById("location")
                let clientName = document.getElementById("clientName")
                description.value = docSnap.data().description
                service.value = docSnap.data().service
                location.value = docSnap.data().location
                clientName.value = docSnap.data().clientName
                disable()
                loadStock(actualUserEmail)
                let dischargeSearchInput = document.getElementById("dischargeSearchInput")
                dischargeSearchInput.addEventListener("input", (evt) => {
                    if (evt.target.value != "") {
                        let SectionItemsCardsSend = document.getElementById("SectionItemsCards")
                        SectionItemsCardsSend.innerHTML = ""
                        searchItem(actualUserEmail, work, evt.target.value)
                    } else {
                        let SectionItemsCardsSend = document.getElementById("SectionItemsCards")
                        SectionItemsCardsSend.innerHTML = ""
                        loadStock(actualUserEmail, work)
                    }
                })
            } else {
                let body = document.querySelector("body")
                body.innerHTML = ""
                window.location.href = "index.html"
            }
        } else {
            let body = document.querySelector("body")
            body.innerHTML = ""
            window.location.href = "index.html"
        }
    }
}


async function verifyItemStock(usedQuantyInput, tecnicStock, itemName) {
    let docRef = doc(db, "discharges", `${dischargeId}`);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        if (docSnap.data().itemsUsed[itemName] != undefined) {
            let total = Number(docSnap.data().itemsUsed[itemName].used) + Number(tecnicStock)
            if (Number(usedQuantyInput) <= Number(total)) {
                return true
            } else {
                return false
            }
        } else {
            if (Number(usedQuantyInput) <= Number(tecnicStock)) {
                return true
            } else {
                return false
            }
        }
    }
}

async function loadStock(email) {
    let backI = 1
    let querySnapshot = await getDocs(collection(db, "tecnics", `${email}`, "stock"));
    let SectionItemsCardsSend = document.getElementById("SectionItemsCards")
    SectionItemsCardsSend.innerHTML = ""
    querySnapshot.forEach((doc) => {
        let SectionItemsCardsSend = document.getElementById("SectionItemsCards")
        let article = document.createElement("article")
        SectionItemsCardsSend.insertAdjacentElement("beforeend", article)
        article.classList.add("discharge__article")
        if (itemsSelecteds[doc.data().itemName] != undefined && itemsSelecteds[doc.data().itemName].used != 0) {
            article.classList.add("used")
        }
        article.classList.add(`background--${backI}`)
        if (backI == 2) {
            backI = 1
        } else {
            backI = 2
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
                        verifyItemStock(usedQuantyInput, doc.data().tecnicStock, doc.data().itemName).then(
                            function (result) {
                                if (result == true) {
                                    let name = doc.data().itemName;
                                    itemsSelecteds[name] = { used: Number(usedQuantyInput), name: doc.data().itemName, measure: doc.data().measure, img: doc.data().itemImg, value: doc.data().itemValue };
                                    let clearInput = document.getElementById("usedQuantyInput")
                                    clearInput.value = ""
                                    editQuanty.style.display = "none"
                                    article.classList.add(`background--${backI}`)
                                    if (backI == 2) {
                                        backI = 1
                                    } else {
                                        backI = 2
                                    }
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
                                    dischargeTentateive(doc.data().itemName, Number(usedQuantyInput))
                                    setTimeout(() => {
                                        editUsedQuantyAlert.textContent = ""
                                    }, 5000);
                                }
                            });
                    } else {
                        let editUsedQuantyAlert = document.getElementById("editUsedQuantyAlert")
                        editUsedQuantyAlert.textContent = "Digite um valor inteiro para unidades"
                        setTimeout(() => {
                            editUsedQuantyAlert.textContent = ""
                        }, 5000);
                    }
                    if (doc.data().measure != "Unidades") {
                        verifyItemStock(usedQuantyInput, doc.data().tecnicStock, doc.data().itemName).then(
                            function (result) {
                                if (result == true) {
                                    let name = doc.data().itemName;
                                    itemsSelecteds[name] = { used: Number(usedQuantyInput), name: doc.data().itemName, measure: doc.data().measure, img: doc.data().itemImg, value: doc.data().itemValue };
                                    let clearInput = document.getElementById("usedQuantyInput")
                                    clearInput.value = ""
                                    editQuanty.style.display = "none"
                                    article.classList.add(`background--${backI}`)
                                    if (backI == 2) {
                                        backI = 1
                                    } else {
                                        backI = 2
                                    }
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
                                    dischargeTentateive(doc.data().itemName, Number(usedQuantyInput))
                                    setTimeout(() => {
                                        editUsedQuantyAlert.textContent = ""
                                    }, 5000);
                                }
                            });
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

async function searchItem(email, work, text) {
    let backI = 1
    let querySnapshot = await getDocs(collection(db, "tecnics", `${email}`, "stock"));
    let SectionItemsCardsSend = document.getElementById("SectionItemsCards")
    SectionItemsCardsSend.innerHTML = ""
    querySnapshot.forEach((doc) => {
        if (doc.data().itemName.toLowerCase().includes(text.toLowerCase())) {
            let SectionItemsCardsSend = document.getElementById("SectionItemsCards")
            let article = document.createElement("article")
            SectionItemsCardsSend.insertAdjacentElement("beforeend", article)
            article.classList.add("discharge__article")
            if (itemsSelecteds[doc.data().itemName] != undefined && itemsSelecteds[doc.data().itemName].used != 0) {
                article.classList.add("used")
            }
            article.classList.add(`background--${backI}`)
            if (backI == 2) {
                backI = 1
            } else {
                backI = 2
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
                            if (Number(usedQuantyInput) <= Number(doc.data().tecnicStock)) {
                                let name = doc.data().itemName;
                                itemsSelecteds[name] = { used: Number(usedQuantyInput), name: doc.data().itemName, measure: doc.data().measure, img: doc.data().itemImg, value: doc.data().itemValue };
                                let clearInput = document.getElementById("usedQuantyInput")
                                clearInput.value = ""
                                editQuanty.style.display = "none"
                                article.classList.add(`background--${backI}`)
                                if (backI == 2) {
                                    backI = 1
                                } else {
                                    backI = 2
                                }
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
                                dischargeTentateive(doc.data().itemName, Number(usedQuantyInput))
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
                            if (Number(usedQuantyInput) <= Number(doc.data().tecnicStock)) {
                                let name = doc.data().itemName;
                                itemsSelecteds[name] = { used: Number(usedQuantyInput), name: doc.data().itemName, measure: doc.data().measure, img: doc.data().itemImg, value: doc.data().itemValue };

                                let clearInput = document.getElementById("usedQuantyInput")
                                clearInput.value = ""
                                editQuanty.style.display = "none"
                                article.classList.add(`background--${backI}`)
                                if (backI == 2) {
                                    backI = 1
                                } else {
                                    backI = 2
                                }
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
                                dischargeTentateive(doc.data().itemName, Number(usedQuantyInput))
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
}

closeSectionSelectDischarge.onclick = function () {
    sectionSelectDischarge.style.display = "none"
}
addUsedItems.onclick = function () {
    sectionSelectDischarge.style.display = "flex"
    SectionItemsCards.innerHTML = ""
    loadData()
}

async function addToForm(email, object) {
    let dischargeSelectedSection = document.getElementById("dischargeSelectedSection")
    dischargeSelectedSection.innerHTML = ""
    let backI = 1
    let querySnapshot = await getDocs(collection(db, "tecnics", `${email}`, "stock"));
    querySnapshot.forEach((doc) => {
        if (object[doc.data().itemName] != undefined && object[doc.data().itemName].used != 0) {
            let article = document.createElement("article")
            dischargeSelectedSection.insertAdjacentElement("beforeend", article)
            article.classList.add("discharge__article")
            article.classList.add(`background--${backI}`)
            if (backI == 2) {
                backI = 1
            } else {
                backI = 2
            }
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


async function verifyUrl() {
    let timeElapsed = Date.now();
    let today = new Date(timeElapsed);
    let date = today.toLocaleDateString()
    let urlParams = new URLSearchParams(window.location.search);
    let dataId = urlParams.get('id');
    if (dataId != null) {
        let docRef = doc(db, "discharges", `${dataId}`);
        let docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            loadData()
        } else {
            let body = document.querySelector("body")
            body.innerHTML = ""
            window.location.href = "index.html"
        }
    }
}

async function lastVerify() {
    let timeElapsed = Date.now();
    let today = new Date(timeElapsed);
    let actualDate = today.toLocaleDateString()
    let urlParams = new URLSearchParams(window.location.search);
    let dataId = urlParams.get('id');
    if (dataId != null) {
        let docRef = doc(db, "discharges", `${dataId}`);
        let docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            if (actualUserWork == "Técnico" && actualUserName == docSnap.data().tecnicName && actualDate == docSnap.data().date && docSnap.data().edited != true) {
                return true
            } else {
                return false
            }
        }
    }
}

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
    lastVerify().then(
        function (result) {
            if (result == true) {
                let description = document.getElementById("description").value
                let service = document.getElementById("service").value
                let location = document.getElementById("location").value
                let clientName = document.getElementById("clientName").value
                if (description != "" && service != "" && location != "" && clientName != "" && Object.keys(itemsSelecteds).length != 0) {
                    restockItems().then(function(valor) {
                        setUsedItems()
                       })
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
            } else {
                let body = document.querySelector("body")
                body.innerHTML = ""
                window.location.href = "index.html"
            }
        })
}


async function restockItems() {
    let docRef = doc(db, "discharges", `${dischargeId}`);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        Object.keys(docSnap.data().itemsUsed).forEach(item => {
            additem(docSnap.data().itemsUsed[item].name, docSnap.data().itemsUsed[item].used)
        });
    }
    async function additem(itemName, used) {
        let washingtonRef = doc(db, "tecnics", `${actualUser}`, "stock", `${itemName}`);
        await updateDoc(washingtonRef, {
            tecnicStock: increment(used)
        });
        let itemRef = doc(db, "items", `${itemName}`);
        await updateDoc(itemRef, {
            withTecnics: increment(used)
        });
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
    let washingtonRef = doc(db, "discharges", `${dischargeId}`);
    await updateDoc(washingtonRef, {
        service: service,
        clientName: clientName,
        location: location,
        description: description,
        itemsUsed: itemsSelecteds,
        edited: true,
        editHours: hours
    });
    let docRef = await addDoc(collection(db, "notifications"), {
        type: "discharge edited",
        hours: hours,
        date: date,
        userName: actualUserName,
        userEmail: actualUserEmail,
        userWork: actualUserWork,
        timestamp: serverTimestamp()
    });
    Object.keys(itemsSelecteds).forEach(element => {
        removeTecnicItems(itemsSelecteds[element].name, itemsSelecteds[element].used)
        SectionItemsCards.innerHTML = ""
    });
    itemsSelecteds = {}
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
    dischargeItemsAlert.textContent = "Relatório editado com sucesso"
    dischargeItemsAlert.style.color = "#0f0"
    setTimeout(() => {
        dischargeItemsAlert.textContent = ""
        window.location.href="index.html"
    }, 2000);
}


async function dischargeTentateive(itemName, itemQuanty) {
    let timeElapsed = Date.now();
    let today = new Date(timeElapsed);
    let date = today.toLocaleDateString()
    let dataAtual = new Date();
    let hora = dataAtual.getHours();
    let minutos = dataAtual.getMinutes();
    let horaFormatada = hora < 10 ? '0' + hora : hora;
    let minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
    let hours = horaFormatada + ":" + minutosFormatados
    let docRef = await addDoc(collection(db, "notifications"), {
        type: "discharge tentative",
        ItemTentative: `${itemName}`,
        tentativeQuanty: `${itemQuanty}`,
        hours: hours,
        date: date,
        userName: actualUserName,
        userEmail: actualUserEmail,
        userWork: actualUserWork,
        timestamp: serverTimestamp()
    });
}


function disable() {
    setTimeout(() => {
        let offline_window = document.getElementById("main__offline")
        offline_window.style.transition = "0.5s"
        offline_window.style.opacity = "0"
        setTimeout(() => {
            offline_window.style.display = "none"
        }, 500);
    }, 1000);
}

verifyUrl()