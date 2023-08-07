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
let actualUserWork = ""
let actualUserName = ""
let actualUserEmail = ""
let notificationsAlert = document.getElementById("notificationsAlert")
let closeNotifications = document.getElementById("closeNotifications")
let notifications = document.getElementById("notifications")
let backgroundNotification = document.getElementById("backgroundNotification")
let notificationsCards = document.getElementById("notificationsCards")
let notificationsFilter = document.getElementById("notificationsFilter")

notifications.onclick = function () {
    backgroundNotification.style.display = "flex"
    let body = document.querySelector("body")
    body.style.overflow = "hidden"
    setTimeout(() => {
        backgroundNotification.classList.add("active")
    }, 1);
}

closeNotifications.onclick = function () {
    backgroundNotification.classList.remove("active")
    setTimeout(() => {
        backgroundNotification.style.display = "none"
        let body = document.querySelector("body")
        body.style.overflowY = "auto"
    }, 200);
}

function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                actualUserWork = doc.data().work
                actualUserName = doc.data().fullName
                actualUserEmail = user.email
                if (doc.data().work == "Técnico") {
                    loadDayTecnicsNotfications(user.email)
                }
                if (doc.data().work == "Estoquista") {
                    loadDayStockNotfications()
                    notificationsFilter.addEventListener("input", () => {
                        notificationsCards.innerHTML = ""
                        if (notificationsFilter.value == "todayNotifications") {
                            loadDayStockNotfications()
                        } else {
                            loadAllStockNotfications()
                        }
                    })
                }
                if (doc.data().work == "Administrador") {

                }
            });
        }
    });
}

function loadDayTecnicsNotfications(email) {
    let timeElapsed = Date.now();
    let today = new Date(timeElapsed);
    let todayDate = today.toLocaleDateString()
    let totalNotifications = 0
    let q = query(collection(db, "transfers"), where("reciverEmail", "==", `${email}`));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().date == todayDate) {
                if (doc.data().status.toLowerCase() == "pendente") {
                    totalNotifications++
                    console.log(`${doc.data().senderName} deseja fazer uma transferência de ${Object.keys(doc.data().itemsToTransfer).length} itens para você`);
                    console.log(`${totalNotifications} Notificações`);
                    notificationsAlert.innerHTML = `${totalNotifications}`
                }
                if (doc.data().status.toLowerCase() == "insuficiente") {
                    totalNotifications++
                    console.log(`${doc.data().senderName} não tinha itens suficientes para completar a transferência`);
                    console.log(`${totalNotifications} Notificações`);
                    notificationsAlert.innerHTML = `${totalNotifications}`
                }
                if (doc.data().status.toLowerCase() == "expirado") {
                    totalNotifications++
                    console.log(`Solicitação de transferência de ${Object.keys(doc.data().itemsToTransfer).length} items de ${doc.data().senderName} para você expirou`);
                }
            }
        })
    })
}




function loadDayStockNotfications() {
    let timeElapsed = Date.now();
    let today = new Date(timeElapsed);
    let todayDate = today.toLocaleDateString()
    let totalNotifications = 0
    let q = query(collection(db, "transfers"), where("reciverEmail", "!=", ` `));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().date == todayDate) {
                if (doc.data().status.toLowerCase() == "insuficiente") {
                    totalNotifications++
                    let article = document.createElement("article")
                    notificationsCards.insertAdjacentElement("beforeend", article)
                    article.classList.add("notifications__article")
                    article.classList.add("article--notificationsCard")
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.innerHTML = `
                    <p class="notificationsCard__title">Erro ao aceitar transferência.</p>
                    <p class="notificationsCard__description">${doc.data().senderName} não tinha items suficientes para completar a transferência para ${doc.data().reciverName}.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="view-transfer.html?id=${doc.id}" class="notificationsCard__a">Ver baixa<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
                }
            }
        })
        notificationsAlert.innerHTML = `${totalNotifications}`
    })
    let q2 = query(collection(db, "notifications"), where("type", "!=", ` `));
    let unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().date == todayDate) {
                if (doc.data().type.toLowerCase() == "discharge tentative") {
                    totalNotifications++
                    let article = document.createElement("article")
                    notificationsCards.insertAdjacentElement("beforeend", article)
                    article.classList.add("notifications__article")
                    article.classList.add("article--notificationsCard")
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.innerHTML = `
                    <p class="notificationsCard__title">Tentativa de baixa de item impedida.</p>
                    <p class="notificationsCard__description"><strong>${doc.data().userName}</strong> Tentou dar baixa em <strong>${doc.data().tentativeQuanty}</strong> ${doc.data().ItemTentative} sem ter esta quantia registrada em seu estoque.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="tecnics.html" class="notificationsCard__a">Ver estoque do técnico<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
                }
                if (doc.data().type.toLowerCase() == "transfer tentative") {
                    totalNotifications++
                    let article = document.createElement("article")
                    notificationsCards.insertAdjacentElement("beforeend", article)
                    article.classList.add("notifications__article")
                    article.classList.add("article--notificationsCard")
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.innerHTML = `
                    <p class="notificationsCard__title">Tentativa de transferência de item impedida.</p>
                    <p class="notificationsCard__description"><strong>${doc.data().userName}</strong> Tentou transferir <strong>${doc.data().tentativeQuanty}</strong> ${doc.data().ItemTentative} sem ter esta quantia registrada em seu estoque.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="tecnics.html" class="notificationsCard__a">Ver estoque do técnico<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
                }
                if (doc.data().type.toLowerCase() == "output tentative") {
                    totalNotifications++
                    let article = document.createElement("article")
                    notificationsCards.insertAdjacentElement("beforeend", article)
                    article.classList.add("notifications__article")
                    article.classList.add("article--notificationsCard")
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.innerHTML = `
                    <p class="notificationsCard__title">Tentativa de registro de saída de itens impedida.</p>
                    <p class="notificationsCard__description"><strong>${doc.data().userName}</strong> tentou registrar a saída de <strong>${doc.data().tentativeQuanty}</strong> ${doc.data().ItemTentative} sem ter esta quantia no estoque.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="stock.html" class="notificationsCard__a">Ver estoque<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
                }
                if (doc.data().type.toLowerCase() == "update item") {
                    totalNotifications++
                    let article = document.createElement("article")
                    notificationsCards.insertAdjacentElement("beforeend", article)
                    article.classList.add("notifications__article")
                    article.classList.add("article--notificationsCard")
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.innerHTML = `
                    <p class="notificationsCard__title">Dados de ${doc.data().ItemUpdated} atualizados.</p>
                    <p class="notificationsCard__description">${doc.data().userName} editou os dados de <strong>${doc.data().ItemUpdated}</strong>.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="stock.html?id=${doc.data().itemIdLink}" class="notificationsCard__a">Ver item<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
                }
                if (doc.data().type.toLowerCase() == "delete item") {
                    totalNotifications++
                    let article = document.createElement("article")
                    notificationsCards.insertAdjacentElement("beforeend", article)
                    article.classList.add("notifications__article")
                    article.classList.add("article--notificationsCard")
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.innerHTML = `
                    <p class="notificationsCard__title">Item excluido do estoque.</p>
                    <p class="notificationsCard__description">${doc.data().userName} deletou o item <strong>${doc.data().ItemDeleted}</strong> do estoque.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="stock.html" class="notificationsCard__a">Ver estoque<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
                }
                if (doc.data().type.toLowerCase() == "item added") {
                    totalNotifications++
                    let article = document.createElement("article")
                    notificationsCards.insertAdjacentElement("beforeend", article)
                    article.classList.add("notifications__article")
                    article.classList.add("article--notificationsCard")
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.innerHTML = `
                    <p class="notificationsCard__title">Novo item adicionado ao estoque.</p>
                    <p class="notificationsCard__description">${doc.data().userName} adicionou o item <strong>${doc.data().ItemAdded}</strong> ao estoque.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="stock.html?id=${doc.data().ItemAdded}" class="notificationsCard__a">Ver item<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
                }
            }
        })
        notificationsAlert.innerHTML = `${totalNotifications}`
    })
    let q3 = query(collection(db, "outputs"), where("recorderName", "!=", ` `));
    let unsubscribe3 = onSnapshot(q3, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().date == todayDate) {
                totalNotifications++
                let article = document.createElement("article")
                notificationsCards.insertAdjacentElement("beforeend", article)
                article.classList.add("notifications__article")
                article.classList.add("article--notificationsCard")
                article.style.order = `-${doc.data().timestamp.seconds}`
                article.innerHTML = `
                    <p class="notificationsCard__title">Registro de saída de itens.</p>
                    <p class="notificationsCard__description"><strong>${doc.data().recorderName}</strong> fez um registro de saida de itens com a descrição: <strong>${doc.data().description}.</strong></p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="view-outputs.html?id=${doc.id}" class="notificationsCard__a">Ver mais<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
            }
        })
        notificationsAlert.innerHTML = `${totalNotifications}`
    })
    let q4 = query(collection(db, "restock"), where("recorderName", "!=", ` `));
    let unsubscribe4 = onSnapshot(q4, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().date == todayDate) {
                totalNotifications++
                let article = document.createElement("article")
                notificationsCards.insertAdjacentElement("beforeend", article)
                article.classList.add("notifications__article")
                article.classList.add("article--notificationsCard")
                article.style.order = `-${doc.data().timestamp.seconds}`
                article.innerHTML = `
                    <p class="notificationsCard__title">Registro de entrada de itens.</p>
                    <p class="notificationsCard__description"><strong>${doc.data().recorderName}</strong> fez um registro de entrada de itens com a descrição: <strong>${doc.data().description}.</strong></p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="view-restocks.html?id=${doc.id}" class="notificationsCard__a">Ver mais<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
            }
        })
        notificationsAlert.innerHTML = `${totalNotifications}`
    })
    let q5 = query(collection(db, "items"), where("active", "==", true));
    let unsubscribe5 = onSnapshot(q5, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().inStock <= Number(doc.data().quantyMin)) {
                totalNotifications++
                let article = document.createElement("article")
                notificationsCards.insertAdjacentElement("beforeend", article)
                article.classList.add("notifications__article")
                article.classList.add("article--notificationsCard")
                article.style.order = `-1000000000000000000000000000`
                article.style.background = "#FFF1F1"
                article.innerHTML = `
                    <p class="notificationsCard__title">Item em falta no estoque.</p>
                    <p class="notificationsCard__description"><strong>${doc.data().itemName}</strong> atingiu o estoque mínimo de ${doc.data().inStock} ${doc.data().measure}.</strong></p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date"></p>
                        <a href="stock.html?id=${doc.data().itemName}" class="notificationsCard__a" style="color: #f00;">Ver item<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
            }
        })
        notificationsAlert.innerHTML = `${totalNotifications}`
    })
}




function loadAllStockNotfications() {
    let timeElapsed = Date.now();
    let today = new Date(timeElapsed);
    let todayDate = today.toLocaleDateString()
    let q = query(collection(db, "transfers"), where("reciverEmail", "!=", ` `));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().status.toLowerCase() == "insuficiente") {
                let article = document.createElement("article")
                notificationsCards.insertAdjacentElement("beforeend", article)
                article.classList.add("notifications__article")
                article.classList.add("article--notificationsCard")
                article.style.order = `-${doc.data().timestamp.seconds}`
                article.innerHTML = `
                <p class="notificationsCard__title">Erro ao aceitar transferência.</p>
                <p class="notificationsCard__description">${doc.data().senderName} não tinha items suficientes para completar a transferência para ${doc.data().reciverName}.</p>
                <div class="notificationsCard__div">
                    <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                    <a href="view-transfer.html?id=${doc.id}" class="notificationsCard__a">Ver transferência<ion-icon name="arrow-forward-outline"></ion-icon></a>
                </div>`
            }
        })
    })
    let q2 = query(collection(db, "notifications"), where("type", "!=", ` `));
    let unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().type.toLowerCase() == "discharge tentative") {
                let article = document.createElement("article")
                notificationsCards.insertAdjacentElement("beforeend", article)
                article.classList.add("notifications__article")
                article.classList.add("article--notificationsCard")
                article.style.order = `-${doc.data().timestamp.seconds}`
                article.innerHTML = `
                    <p class="notificationsCard__title">Tentativa de baixa de item impedida.</p>
                    <p class="notificationsCard__description"><strong>${doc.data().userName}</strong> Tentou dar baixa em ${doc.data().tentativeQuanty} ${doc.data().ItemTentative} sem ter esta quantia registrada em seu estoque.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="tecnics.html" class="notificationsCard__a">Ver estoque do técnico<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
            }
            if (doc.data().type.toLowerCase() == "transfer tentative") {
                let article = document.createElement("article")
                notificationsCards.insertAdjacentElement("beforeend", article)
                article.classList.add("notifications__article")
                article.classList.add("article--notificationsCard")
                article.style.order = `-${doc.data().timestamp.seconds}`
                article.innerHTML = `
                    <p class="notificationsCard__title">Tentativa de transferência de item impedida.</p>
                    <p class="notificationsCard__description"><strong>${doc.data().userName}</strong> Tentou transferir ${doc.data().tentativeQuanty} ${doc.data().ItemTentative} sem ter esta quantia registrada em seu estoque.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="tecnics.html" class="notificationsCard__a">Ver estoque do técnico<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
            }
            if (doc.data().type.toLowerCase() == "update item") {
                let article = document.createElement("article")
                notificationsCards.insertAdjacentElement("beforeend", article)
                article.classList.add("notifications__article")
                article.classList.add("article--notificationsCard")
                article.style.order = `-${doc.data().timestamp.seconds}`
                article.innerHTML = `
                    <p class="notificationsCard__title">Dados de ${doc.data().ItemUpdated} atualizados.</p>
                    <p class="notificationsCard__description">${doc.data().userName} editou os dados de <strong>${doc.data().ItemUpdated}</strong>.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="stock.html?id=${doc.data().itemIdLink}" class="notificationsCard__a">Ver item<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
            }
            if (doc.data().type.toLowerCase() == "delete item") {
                let article = document.createElement("article")
                notificationsCards.insertAdjacentElement("beforeend", article)
                article.classList.add("notifications__article")
                article.classList.add("article--notificationsCard")
                article.style.order = `-${doc.data().timestamp.seconds}`
                article.innerHTML = `
                    <p class="notificationsCard__title">Item excluido do banco de dados.</p>
                    <p class="notificationsCard__description">${doc.data().userName} deletou o item <strong>${doc.data().ItemDeleted}</strong> do banco de dados permanentemente.</p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="stock.html" class="notificationsCard__a">Ver estoque<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
            }
            if (doc.data().type.toLowerCase() == "item added") {
                let article = document.createElement("article")
                notificationsCards.insertAdjacentElement("beforeend", article)
                article.classList.add("notifications__article")
                article.classList.add("article--notificationsCard")
                article.style.order = `-${doc.data().timestamp.seconds}`
                article.innerHTML = `
                <p class="notificationsCard__title">Novo item adicionado ao estoque.</p>
                <p class="notificationsCard__description">${doc.data().userName} adicionou o item <strong>${doc.data().ItemAdded}</strong> ao estoque.</p>
                <div class="notificationsCard__div">
                    <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                    <a href="stock.html?id=${doc.data().ItemAdded}" class="notificationsCard__a">Ver item<ion-icon name="arrow-forward-outline"></ion-icon></a>
                </div>`
            }
        })
    })
    let q3 = query(collection(db, "outputs"), where("recorderName", "!=", ` `));
    let unsubscribe3 = onSnapshot(q3, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let article = document.createElement("article")
            notificationsCards.insertAdjacentElement("beforeend", article)
            article.classList.add("notifications__article")
            article.classList.add("article--notificationsCard")
            article.style.order = `-${doc.data().timestamp.seconds}`
            article.innerHTML = `
                    <p class="notificationsCard__title">Registro de saída de itens.</p>
                    <p class="notificationsCard__description"><strong>${doc.data().recorderName}</strong> fez um registro de saida de itens com a descrição: <strong>${doc.data().description}.</strong></p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="view-restocks.html?id=${doc.id}" class="notificationsCard__a">Ver mais<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
        })
    })
    let q4 = query(collection(db, "restock"), where("recorderName", "!=", ` `));
    let unsubscribe4 = onSnapshot(q4, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let article = document.createElement("article")
            notificationsCards.insertAdjacentElement("beforeend", article)
            article.classList.add("notifications__article")
            article.classList.add("article--notificationsCard")
            article.style.order = `-${doc.data().timestamp.seconds}`
            article.innerHTML = `
                    <p class="notificationsCard__title">Registro de entrada de itens.</p>
                    <p class="notificationsCard__description"><strong>${doc.data().recorderName}</strong> fez um registro de entrada de itens com a descrição: <strong>${doc.data().description}.</strong></p>
                    <div class="notificationsCard__div">
                        <p class="notificationsCard__date">${doc.data().date} ás ${doc.data().hours}.</p>
                        <a href="view-restocks.html?id=${doc.id}" class="notificationsCard__a">Ver mais<ion-icon name="arrow-forward-outline"></ion-icon></a>
                    </div>`
        })
    })
}



loadData()