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
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, query, where, updateDoc, arrayUnion, arrayRemove, getDoc, serverTimestamp, deleteField } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();
let requestSection = document.getElementById("requestSection")
let removeIndex = 0




function loadData() {
    let SectionItemsCardsSend = document.getElementById("SectionItemsCardsSend")
    SectionItemsCardsSend.innerHTML = ""
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            loadRequests(user.email)
        }
    })
}

function loadRequests(actualUserEmail) {
    let q = query(collection(db, "transfers"), where(`reciverEmail`, "==", `${actualUserEmail}`));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let timeElapsed = Date.now();
            let today = new Date(timeElapsed);
            let date = today.toLocaleDateString()
            if (doc.data().date == date && doc.data().timeExpired != true) {
                if (doc.data().status == "Pendente") {
                    let article = document.createElement("article")
                    requestSection.insertAdjacentElement("beforeend", article)
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.classList.add("NewTransferCard")
                    article.innerHTML = `
                        <div class="NewTransferCard__div">
                            <h2 class="NewTransferCard__h2">Transferência</h2>
                            <p class="NewTransferCard__status" style="color: ${returnColor(doc.data().status)};">${doc.data().status}</p>
                        </div>
                        <p class="NewTransferCard__p"><ion-icon name="person-remove-outline"
                                class="NewTransferCard__p__icon md hydrated" role="img"></ion-icon>Remetente: ${doc.data().senderName}</p>
                        <p class="NewTransferCard__p"><ion-icon name="person-add-outline"
                                class="NewTransferCard__p__icon md hydrated" role="img"></ion-icon>receptor: ${doc.data().reciverName}</p>
                            <p class="NewTransferCard__motive">Motivo: ${doc.data().motive}.</p>
                            <span class="NewTransferCard__description">Descrição: ${doc.data().description}.</span>
                        <div class="NewTransferCard__div--2">
                            <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                            <div class="NewTransferCard__div--3">
                                <button class="NewTransferCard__acptRcs" id="recuseTransfer"><ion-icon name="close-outline" role="img" class="md hydrated"></ion-icon></button>
                                <button class="NewTransferCard__acptRcs" id="acceptTransfer"><ion-icon name="checkmark-outline" role="img" class="md hydrated"></ion-icon></button>
                            </div>
                        </div>`
                    let acceptTransfer = document.getElementById("acceptTransfer")
                    let recuseTransfer = document.getElementById("recuseTransfer")
                    article.addEventListener("click", (event) => {
                        window.location = "view-transfer.html?id=" + doc.id;
                    })
                    acceptTransfer.addEventListener("click", (event) => {
                        event.stopPropagation()
                        acceptItems(doc.id, doc.data().reciverEmail, doc.data().senderEmail, doc.data().itemsToTransfer)
                    })
                    recuseTransfer.addEventListener("click", (event) => {
                        event.stopPropagation()
                        recuseItems(doc.id)
                    })
                }
            } else {
                timeExpired(doc.id)
            }
        });
    });

}

function preventDef(event) {
    event.preventDefault();
}

function returnColor(status) {
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

async function acceptItems(id, reciverEmail, senderEmail, itemsSelecteds) {
    let dataAtual = new Date();
    let hora = dataAtual.getHours();
    let minutos = dataAtual.getMinutes();
    let horaFormatada = hora < 10 ? '0' + hora : hora;
    let minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
    let hours = horaFormatada + ":" + minutosFormatados
    requestSection.innerHTML = ""
    let docRef = doc(db, "transfers", `${id}`);
    await updateDoc(docRef, {
        status: "Aceito",
        acceptHour: hours
    });
    let used
    let vrlItemName
    let unsub = onSnapshot(doc(db, "transfers", `${id}`), (doc) => {
        Object.keys(doc.data().itemsToTransfer).forEach(element => {
            vrlItemName = doc.data().itemsToTransfer[element].name
            used = doc.data().itemsToTransfer[element].used
        });
        compare(vrlItemName, used, senderEmail, id, reciverEmail, itemsSelecteds)
    });
}


async function compare(vrlItemName, used, senderEmail, id, reciverEmail, itemsSelecteds) {
    let i = 0
    let o = 0
    let unsub = onSnapshot(doc(db, "tecnics", `${senderEmail}`), (doc) => {
        doc.data().items.forEach(element => {
            if (element.itemName == vrlItemName) {
                if (element.tecnicStock >= used) {
                    i++
                } else {
                    console.log("no have items");
                    notHave(id)
                }
            }
        });
        if (i == 1) {
            brokeForEach(vrlItemName, used, senderEmail, id, reciverEmail, itemsSelecteds)
        }
    });
}

async function notHave(id) {
    let docRef = doc(db, "transfers", `${id}`);
    await updateDoc(docRef, {
        status: "Insuficiente",
        acceptHour: deleteField()
    });
}

function brokeForEach(vrlItemName, used, senderEmail, id, reciverEmail, itemsSelecteds) {
    setUsedItems(id, reciverEmail, senderEmail, itemsSelecteds)
    removeUsedItems(id, senderEmail)
}


async function removeUsedItems(id, senderEmail) {
    let unsub = onSnapshot(doc(db, "transfers", `${id}`), (doc) => {
        let itemsSelecteds = doc.data().itemsToTransfer
        finalizeRemove(senderEmail, itemsSelecteds)
    });
}

async function finalizeRemove(senderEmail, itemsSelecteds) {
    console.log(`começo: ${removeIndex}`);
    Object.keys(itemsSelecteds).forEach(element => {
        let unsub = onSnapshot(doc(db, "tecnics", `${senderEmail}`), (doc) => {
            doc.data().items.forEach(dataArray => {
                if (element == dataArray.itemName && removeIndex == 0) {
                    RmvTecnicItems(dataArray, itemsSelecteds[element].used, senderEmail, itemsSelecteds);
                    console.log(removeIndex);
                }
            });
        });
    });
}

function RmvTecnicItems(object, used, senderEmail, itemsSelecteds) {
    removeIndex = removeIndex + 1
    let newTecnicStock = object.tecnicStock - Number(used)
    console.log(newTecnicStock);
    let newObject = {
        itemName: object.itemName,
        itemImg: object.itemImg,
        tecnicStock: object.tecnicStock - Number(used),
        measure: object.measure,
        itemValue: object.itemValue
    }
    if (newObject.tecnicStock >= 0) {
        let tecnicRef = doc(db, "tecnics", `${senderEmail}`);
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
    removeIndex = 0
}






async function setUsedItems(id, reciverEmail, senderEmail, itemsSelecteds) {
    Object.keys(itemsSelecteds).forEach(element => {
        let unsub = onSnapshot(doc(db, "tecnics", `${reciverEmail}`), (doc) => {
            doc.data().items.forEach(dataArray => {
                if (element == dataArray.itemName) {
                    addTecnicItems(dataArray, itemsSelecteds[element].used, reciverEmail, itemsSelecteds)
                }
            });
        });
    });
}

function addTecnicItems(object, used, reciverEmail, itemsSelecteds) {
    let newObject = {
        itemName: object.itemName,
        itemImg: object.itemImg,
        tecnicStock: object.tecnicStock + Number(used),
        measure: object.measure,
        itemValue: object.itemValue
    }
    if (newObject.tecnicStock >= 0) {
        let tecnicRef = doc(db, "tecnics", `${reciverEmail}`);
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
}









async function recuseItems(id) {
    requestSection.innerHTML = ""
    let dataAtual = new Date();
    let hora = dataAtual.getHours();
    let minutos = dataAtual.getMinutes();
    let horaFormatada = hora < 10 ? '0' + hora : hora;
    let minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
    let hours = horaFormatada + ":" + minutosFormatados
    let docRef = doc(db, "transfers", `${id}`);
    await updateDoc(docRef, {
        status: "Recusado",
        recuseHour: hours
    });
}

async function timeExpired(id) {
    let docRef = doc(db, "transfers", `${id}`);
    await updateDoc(docRef, {
        timeExpired: true,
        status: "expirado"
    });
}

loadData()