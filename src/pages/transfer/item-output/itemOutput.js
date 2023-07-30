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
let closeSectionSelectOutput = document.getElementById("closeSectionSelectOutput")
let sectionSelectOutput = document.getElementById("sectionSelectOutput")
let addOutputItems = document.getElementById("addOutputItems")
let closeOutputSection = document.getElementById("closeOutputSection")
let itemOutputButton = document.getElementById("itemOutputButton")
let OutputItems = document.getElementById("OutputItems")
let OutputSearchInput = document.getElementById("OutputSearchInput")
let actualUserEmail = ""
let itemsSelecteds = {}
let userWork = ""
let actualUserName = ""









function loadData() {
    let SectionItemsCardsSend = document.getElementById("SectionItemsCardsOutput")
    SectionItemsCardsSend.innerHTML = ""
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            actualUserEmail = user.email
            let usersdocref = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                if (doc.data().work != "Técnico") {
                    actualUserName = doc.data().fullName
                    userWork = doc.data().work
                    loadStock(user.email, doc.data().work)
                }
            });
        }
    })
}

OutputSearchInput.addEventListener("input", (evt) => {
    if (evt.target.value != "") {
        let SectionItemsCardsSend = document.getElementById("SectionItemsCardsOutput")
        SectionItemsCardsSend.innerHTML = ""
        searchItem(actualUserEmail, userWork, evt.target.value)
    } else {
        let SectionItemsCardsSend = document.getElementById("SectionItemsCardsOutput")
        SectionItemsCardsSend.innerHTML = ""
        loadStock(actualUserEmail, userWork)
    }
})

async function loadStock(email, work) {
    let SectionItemsCardsSend = document.getElementById("SectionItemsCardsOutput")
    SectionItemsCardsSend.innerHTML = ""
    let backI = 1
    let q = query(collection(db, "items"), where("active", "==", true));
    SectionItemsCardsSend.innerHTML = ""
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let SectionItemsCardsSend = document.getElementById("SectionItemsCardsOutput")
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
                        <p class="discharge__used">Transferir: ${itemsSelecteds[doc.data().itemName] == undefined ? "0" : itemsSelecteds[doc.data().itemName].used} ${doc.data().measure}</p>
                    </div>`
            article.onclick = function () {
                let editQuanty = document.getElementById("centralizeOutput")
                editQuanty.style.display = "flex"
                let closeEditSendQuanty = document.getElementById("closeEditOutputQuanty")
                closeEditSendQuanty.onclick = function () {
                    editQuanty.style.display = "none"
                    let clearInput = document.getElementById("OutputQuantyInput")
                    clearInput.value = ""
                    editQuanty.style.display = "none"
                }
                let confirmUsedQuantyBtn = document.getElementById("confirmOutputQuantyBtn")
                confirmUsedQuantyBtn.onclick = function () {
                    let usedQuantyInput = document.getElementById("OutputQuantyInput").value
                    if (usedQuantyInput != "" && usedQuantyInput != 0) {
                        if (doc.data().measure == "Unidades") {
                            if (parseInt(usedQuantyInput) == parseFloat(usedQuantyInput)) {
                                if (Number(usedQuantyInput) <= Number(doc.data().inStock)) {
                                    let name = doc.data().itemName;
                                    itemsSelecteds[name] = { used: Number(usedQuantyInput), name: doc.data().itemName, measure: doc.data().measure, img: doc.data().itemImg, value: doc.data().itemValue };
                                    let clearInput = document.getElementById("OutputQuantyInput")
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
                                                <p class="discharge__used">Transferir: ${itemsSelecteds[doc.data().itemName] == undefined ? "0" : itemsSelecteds[doc.data().itemName].used} ${doc.data().measure}</p>
                                            </div>`
                                    if (itemsSelecteds[doc.data().itemName].used != 0) {
                                        article.classList.add("used")
                                        addToForm(email, itemsSelecteds, doc.data().itemName, work)
                                    }
                                } else {
                                    let editUsedQuantyAlert = document.getElementById("editOutputQuantyAlert")
                                    editUsedQuantyAlert.textContent = "Quantia em estoque insuficiente"
                                    setTimeout(() => {
                                        editUsedQuantyAlert.textContent = ""
                                    }, 5000);
                                }
                            } else {
                                let editUsedQuantyAlert = document.getElementById("editOutputQuantyAlert")
                                editUsedQuantyAlert.textContent = "Digite um valor inteiro para unidades"
                                setTimeout(() => {
                                    editUsedQuantyAlert.textContent = ""
                                }, 5000);
                            }
                        }
                        if (doc.data().measure != "Unidades") {
                            if (Number(usedQuantyInput) <= Number(doc.data().inStock)) {
                                let name = doc.data().itemName;
                                itemsSelecteds[name] = { used: Number(usedQuantyInput), name: doc.data().itemName, measure: doc.data().measure, img: doc.data().itemImg, value: doc.data().itemValue };

                                let clearInput = document.getElementById("OutputQuantyInput")
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
                                            <p class="discharge__used">Transferir: ${itemsSelecteds[doc.data().itemName] == undefined ? "0" : itemsSelecteds[doc.data().itemName].used} ${doc.data().measure}</p>
                                        </div>`
                                if (itemsSelecteds[doc.data().itemName].used != 0) {
                                    article.classList.add("used")
                                    addToForm(email, itemsSelecteds, doc.data().itemName, work)
                                }
                            } else {
                                let editUsedQuantyAlert = document.getElementById("editOutputQuantyAlert")
                                editUsedQuantyAlert.textContent = "Quantia em estoque insuficiente"
                                setTimeout(() => {
                                    editUsedQuantyAlert.textContent = ""
                                }, 5000);
                            }
                        }
                    } else {
                        let editUsedQuantyAlert = document.getElementById("editOutputQuantyAlert")
                        editUsedQuantyAlert.textContent = "Digite um valor diferente de 0"
                        setTimeout(() => {
                            editUsedQuantyAlert.textContent = ""
                        }, 5000);
                    }
                }
            }
        });
    });

}


async function searchItem(email, work, text) {
    let backI = 1
    let querySnapshot = await getDocs(collection(db, "items"));
    let SectionItemsCardsSend = document.getElementById("SectionItemsCardsOutput")
    SectionItemsCardsSend.innerHTML = ""
    querySnapshot.forEach((doc) => {
        if (doc.data().itemName.toLowerCase().includes(text.toLowerCase())) {
            let SectionItemsCardsSend = document.getElementById("SectionItemsCardsOutput")
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
                let editQuanty = document.getElementById("centralizeOutput")
                editQuanty.style.display = "flex"
                let closeEditSendQuanty = document.getElementById("closeEditOutputQuanty")
                closeEditSendQuanty.onclick = function () {
                    editQuanty.style.display = "none"
                    let clearInput = document.getElementById("OutputQuantyInput")
                    clearInput.value = ""
                    editQuanty.style.display = "none"
                }
                let confirmUsedQuantyBtn = document.getElementById("confirmOutputQuantyBtn")
                confirmUsedQuantyBtn.onclick = function () {
                    let usedQuantyInput = document.getElementById("OutputQuantyInput").value
                    if (usedQuantyInput != "" && usedQuantyInput != 0) {
                        if (doc.data().measure == "Unidades" && parseInt(usedQuantyInput) == parseFloat(usedQuantyInput)) {
                            if (Number(usedQuantyInput) <= Number(doc.data().tecnicStock)) {
                                let name = doc.data().itemName;
                                itemsSelecteds[name] = { used: Number(usedQuantyInput), name: doc.data().itemName, measure: doc.data().measure, img: doc.data().itemImg, value: doc.data().itemValue };
                                let clearInput = document.getElementById("OutputQuantyInput")
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
                                let editUsedQuantyAlert = document.getElementById("editOutputQuantyAlert")
                                editUsedQuantyAlert.textContent = "Quantia em estoque insuficiente"
                                setTimeout(() => {
                                    editUsedQuantyAlert.textContent = ""
                                }, 5000);
                            }
                        } else {
                            let editUsedQuantyAlert = document.getElementById("editOutputQuantyAlert")
                            editUsedQuantyAlert.textContent = "Digite um valor inteiro para unidades"
                            setTimeout(() => {
                                editUsedQuantyAlert.textContent = ""
                            }, 5000);
                        }
                        if (doc.data().measure != "Unidades") {
                            if (Number(usedQuantyInput) <= Number(doc.data().tecnicStock)) {
                                let name = doc.data().itemName;
                                itemsSelecteds[name] = { used: Number(usedQuantyInput), name: doc.data().itemName, measure: doc.data().measure, img: doc.data().itemImg, value: doc.data().itemValue };

                                let clearInput = document.getElementById("OutputQuantyInput")
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
                                let editUsedQuantyAlert = document.getElementById("editOutputQuantyAlert")
                                editUsedQuantyAlert.textContent = "Quantia em estoque insuficiente"
                                setTimeout(() => {
                                    editUsedQuantyAlert.textContent = ""
                                }, 5000);
                            }
                        }
                    } else {
                        let editUsedQuantyAlert = document.getElementById("editOutputQuantyAlert")
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





async function addToForm(email, object, nameItem, work) {

    let dischargeSelectedSection = document.getElementById("OutputSelectedSection")
    dischargeSelectedSection.innerHTML = ""
    let backI = 1
    let q = query(collection(db, "items"), where("active", "==", true));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
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
                                <p class="discharge__used">Transferir: ${object[doc.data().itemName].used} ${doc.data().measure}</p>
                            </div>`
                let removeItem = document.createElement("button")
                article.insertAdjacentElement("afterbegin", removeItem)
                removeItem.innerHTML = `<ion-icon name="close-circle-outline"></ion-icon>`
                removeItem.classList.add("unselectItem")
                removeItem.onclick = function () {
                    delete itemsSelecteds[object[doc.data().itemName].name]
                    addToForm(email, itemsSelecteds)
                    let SectionItemsCards = document.getElementById("SectionItemsCardsOutput")
                    SectionItemsCards.innerHTML = ""
                    loadData()
                }
            }
        });
    });

}











OutputItems.onclick = function () {
    OutputItems.innerHTML = `
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
    OutputItems.classList.add("loading")
    let Senddescription = document.getElementById("descriptionOutput").value
    if (Senddescription != "" && Object.keys(itemsSelecteds).length != 0) {
        setUsedItems()
    } else {
        let dischargeItemsAlert = document.getElementById("OutputItemsAlert")
        OutputItems.innerHTML = `TRANSFERIR`
        OutputItems.classList.remove("loading")
        dischargeItemsAlert.textContent = "Preencha todos os campos e selecione um item para fazer o relatório"
        dischargeItemsAlert.style.color = "#f00"
        setTimeout(() => {
            dischargeItemsAlert.textContent = ""
        }, 5000);
    }
}

async function setUsedItems() {
    let SectionItemsCards = document.getElementById("SectionItemsCardsOutput")
    let OutputSelectedSection = document.getElementById("OutputSelectedSection")
    OutputSelectedSection.innerHTML = ""
    OutputSelectedSection.style.display = "none"
    SectionItemsCards.innerHTML = ""
    let description = document.getElementById("descriptionOutput").value
    let timeElapsed = Date.now();
    let today = new Date(timeElapsed);
    let date = today.toLocaleDateString()
    let dataAtual = new Date();
    let hora = dataAtual.getHours();
    let minutos = dataAtual.getMinutes();
    let horaFormatada = hora < 10 ? '0' + hora : hora;
    let minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
    let hours = horaFormatada + ":" + minutosFormatados
    let docRef = await addDoc(collection(db, "outputs"), {
        recorderName: actualUserName,
        recorderEmail: actualUserEmail,
        description: description,
        itemsOutputs: itemsSelecteds,
        date: date,
        hours: hours,
        timestamp: serverTimestamp()
    });
    OutputSelectedSection.innerHTML = ""
    Object.keys(itemsSelecteds).forEach(element => {
        removeTecnicItems(itemsSelecteds[element].name, itemsSelecteds[element].used)
        SectionItemsCards.innerHTML = ""
    });
    OutputSelectedSection.innerHTML = ""
}

async function removeTecnicItems(name, used) {
    let itemRef = doc(db, "items", `${name}`);
    await updateDoc(itemRef, {
        inStock: increment(-used)
    });
    clearInputs()
}


function clearInputs() {
    let OutputSelectedSection = document.getElementById("OutputSelectedSection")
    OutputSelectedSection.innerHTML = ""
    itemsSelecteds = {}
    OutputSelectedSection.innerHTML = ""
    let Senddescription = document.getElementById("descriptionOutput")
    Senddescription.value = ""
    let SectionItemsCards = document.getElementById("SectionItemsCardsOutput")
    let dischargeSelectedSection = document.getElementById("OutputSelectedSection")
    let dischargeItemsAlert = document.getElementById("OutputItemsAlert")
    dischargeSelectedSection.innerHTML = ""
    SectionItemsCards.innerHTML = ""
    OutputSelectedSection.innerHTML = ""
    loadData()
    OutputSelectedSection.innerHTML = ""
    OutputItems.innerHTML = `TRANSFERIR`
    OutputItems.classList.remove("loading")
    dischargeItemsAlert.textContent = "Relatório feito com sucesso"
    dischargeItemsAlert.style.color = "#0f0"
    OutputSelectedSection.style.display = "flex"
    setTimeout(() => {
        dischargeItemsAlert.textContent = ""
    }, 5000);
}








loadData()









closeSectionSelectOutput.onclick = function () {
    sectionSelectOutput.style.display = "none"
}
addOutputItems.onclick = function () {
    sectionSelectOutput.style.display = "flex"
    SectionItemsCardsOutput.innerHTML = ""
    loadData()
}
closeOutputSection.onclick = function () {
    let outputSection = document.getElementById("outputSection")
    outputSection.style.display = "none"
}
itemOutputButton.onclick = function () {
    let outputSection = document.getElementById("outputSection")
    outputSection.style.display = "flex"
}