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
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, query, where, updateDoc, arrayUnion, arrayRemove, getDoc, getDocs, serverTimestamp, deleteField, increment } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();
let requestSection = document.getElementById("requestSection")
let closeSucessUpdate = document.getElementById("closeSucessUpdate")
let closeErrorUpdate = document.getElementById("closeErrorUpdate")



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
                        <span class="NewTransferCard__description">Descrição: ${doc.data().description}.</span>`
                    let div2 = document.createElement("div")
                    let div3 = document.createElement("div")
                    let span = document.createElement("span")
                    let acceptTransfer = document.createElement("button")
                    let recuseTransfer = document.createElement("button")
                    article.insertAdjacentElement("beforeend", div2)
                    div2.classList.add('NewTransferCard__div--2')
                    div2.insertAdjacentElement("beforeend", span)
                    span.classList.add('NewTransferCard__date')
                    span.innerHTML = `${doc.data().hours}<br>${doc.data().date}`
                    div2.insertAdjacentElement("beforeend", div3)
                    div3.classList.add("NewTransferCard__div--3")
                    div3.insertAdjacentElement("beforeend", recuseTransfer)
                    div3.insertAdjacentElement("beforeend", acceptTransfer)
                    recuseTransfer.classList.add("NewTransferCard__acptRcs")
                    acceptTransfer.classList.add("NewTransferCard__acptRcs")
                    acceptTransfer.id = "acceptTransfer"
                    recuseTransfer.id = "recuseTransfer"
                    recuseTransfer.innerHTML = `<ion-icon name="close-outline" role="img" class="md hydrated"></ion-icon>`
                    acceptTransfer.innerHTML = `<ion-icon name="checkmark-outline" role="img" class="md hydrated"></ion-icon>`
                    article.addEventListener("click", (event) => {
                        window.location = "view-transfer.html?id=" + doc.id;
                    })
                    acceptTransfer.addEventListener("click", (event) => {
                        event.stopPropagation()
                        acceptItems(doc.id, doc.data().reciverEmail, doc.data().senderEmail, doc.data().itemsToTransfer)
                        let updateSection = document.getElementById("updateSection")
                        updateSection.style.display = "flex"
                        setTimeout(() => {
                            updateSection.classList.add("active")
                        }, 1);
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
    let unsub = onSnapshot(doc(db, "users", `${senderEmail}`), (doc) => {
        returnReciverWork(senderEmail, id, reciverEmail, itemsSelecteds, doc.data().work)
    });
    requestSection.innerHTML = ""
}

async function returnReciverWork(senderEmail, id, reciverEmail, itemsSelecteds, senderWork) {
    let unsub = onSnapshot(doc(db, "users", `${reciverEmail}`), (doc) => {
        compare(senderEmail, id, reciverEmail, itemsSelecteds, senderWork, doc.data().work)
    });

}

async function compare(senderEmail, id, reciverEmail, itemsSelecteds, senderWork, reciverWork) {
    if (senderWork == "Técnico") {
        let i = 0
        let querySnapshot = await getDocs(collection(db, "tecnics", `${senderEmail}`, "stock"));
        querySnapshot.forEach((doc) => {
            Object.keys(itemsSelecteds).forEach(item => {
                if (itemsSelecteds[item].name == doc.data().itemName) {
                    if (itemsSelecteds[item].used <= doc.data().tecnicStock) {
                        i++
                    }
                }
            });
        })
        if (Object.keys(itemsSelecteds).length == i) {
            let dataAtual = new Date();
            let hora = dataAtual.getHours();
            let minutos = dataAtual.getMinutes();
            let horaFormatada = hora < 10 ? '0' + hora : hora;
            let minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
            let hours = horaFormatada + ":" + minutosFormatados
            let docRef = doc(db, "transfers", `${id}`);
            await updateDoc(docRef, {
                status: "Aceito",
                acceptHour: hours
            });
            Object.keys(itemsSelecteds).forEach(item => {
                remove(itemsSelecteds[item].name, itemsSelecteds[item].used, senderEmail, senderWork)
                addItems(itemsSelecteds[item].name, itemsSelecteds[item].used, reciverEmail, reciverWork)
            })
        } else {
            notHave(id)
        }
    } else {
        let i = 0
        let querySnapshot = await getDocs(collection(db, "items"));
        querySnapshot.forEach((doc) => {
            Object.keys(itemsSelecteds).forEach(item => {
                if (itemsSelecteds[item].name == doc.data().itemName) {
                    if (itemsSelecteds[item].used <= doc.data().inStock) {
                        i++
                    }
                }
            });
        })
        if (Object.keys(itemsSelecteds).length == i) {
            let dataAtual = new Date();
            let hora = dataAtual.getHours();
            let minutos = dataAtual.getMinutes();
            let horaFormatada = hora < 10 ? '0' + hora : hora;
            let minutosFormatados = minutos < 10 ? '0' + minutos : minutos;
            let hours = horaFormatada + ":" + minutosFormatados
            let docRef = doc(db, "transfers", `${id}`);
            await updateDoc(docRef, {
                status: "Aceito",
                acceptHour: hours
            });
            Object.keys(itemsSelecteds).forEach(item => {
                remove(itemsSelecteds[item].name, itemsSelecteds[item].used, senderEmail, senderWork)
                addItems(itemsSelecteds[item].name, itemsSelecteds[item].used, reciverEmail, reciverWork)
            })
        } else {
            notHave(id)
        }
    }
}

async function remove(name, used, senderEmail, senderWork) {
    if (senderWork == "Técnico") {
        let washingtonRef = doc(db, "tecnics", `${senderEmail}`, "stock", `${name}`);
        await updateDoc(washingtonRef, {
            tecnicStock: increment(-used)
        });
        let itemRef = doc(db, "items", `${name}`);
        await updateDoc(itemRef, {
            withTecnics: increment(-used)
        });
    } else {
        let washingtonRef = doc(db, "items", `${name}`);
        await updateDoc(washingtonRef, {
            inStock: increment(-used)
        });
    }
}

async function addItems(name, used, reciverEmail, reciverWork) {
    if (reciverWork == "Técnico") {
        let washingtonRef = doc(db, "tecnics", `${reciverEmail}`, "stock", `${name}`);
        await updateDoc(washingtonRef, {
            tecnicStock: increment(used)
        });
        let itemRef = doc(db, "items", `${name}`);
        await updateDoc(itemRef, {
            withTecnics: increment(used)
        });
    } else {
        let washingtonRef = doc(db, "items", `${name}`);
        await updateDoc(washingtonRef, {
            inStock: increment(used)
        });
    }
    sucess()
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


function sucess() {
    let sucessUpdate = document.getElementById("sucessUpdate")
    sucessUpdate.style.display = "flex"
    setTimeout(() => {
        sucessUpdate.style.transform = "scale(1.0)"
    }, 100);
}

closeSucessUpdate.onclick = function () {
    let updateSection = document.getElementById("updateSection")
    updateSection.classList.remove("active")
    setTimeout(() => {
        updateSection.style.display = "none"
        let sucessUpdate = document.getElementById("sucessUpdate")
        sucessUpdate.style.display = "none"
        sucessUpdate.style.transform = "scale(0.0)"
    }, 500);
}

closeErrorUpdate.onclick = function () {
    let updateSection = document.getElementById("updateSection")
    updateSection.classList.remove("active")
    setTimeout(() => {
        updateSection.style.display = "none"
        let errorUpdate = document.getElementById("errorUpdate")
        errorUpdate.style.display = "none"
        errorUpdate.style.transform = "scale(0.0)"
    }, 500);
}

async function notHave(id) {
    let docRef = doc(db, "transfers", `${id}`);
    await updateDoc(docRef, {
        status: "Insuficiente"
    });
    let errorUpdate = document.getElementById("errorUpdate")
    errorUpdate.style.display = "flex"
    setTimeout(() => {
        errorUpdate.style.transform = "scale(1.0)"
    }, 1);
}


async function timeExpired(id) {
    let docRef = doc(db, "transfers", `${id}`);
    await updateDoc(docRef, {
        timeExpired: true,
        status: "expirado"
    });
}

loadData()