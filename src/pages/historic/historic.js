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
let searchInput = document.getElementById("searchInput")
let searchFilter = document.getElementById("searchFilter")
let filterOption = document.querySelectorAll('.filterList__li');
let closeErrorPopUp = document.getElementById("closeErrorPopUp")
let actualUserWork = ""
let actualUserName = ""

closeErrorPopUp.onclick = function () {
    let errorPopUp = document.getElementById("errorPopUp")
    errorPopUp.classList.remove("active")
    setTimeout(() => {
        errorPopUp.style.display = "none"
    }, 200);
}


searchFilter.onclick = function (event) {
    event.stopPropagation()
    let filterList = document.getElementById("filterList")
    if (filterList.style.display == "flex") {
        filterList.classList.remove("active")
        setTimeout(() => {
            filterList.style.display = "none"
        }, 200);
    } else {
        let body = document.querySelector("body")
        body.onclick = function () {
            filterList.classList.remove("active")
            setTimeout(() => {
                filterList.style.display = "none"
            }, 200);
        }
        filterList.style.display = "flex"
        setTimeout(() => {
            filterList.classList.add("active")
        }, 1);
    }
}

filterOption.forEach((btn) =>
    btn.addEventListener('click', (event) => {
        event.stopPropagation()
        filterOption.forEach(element => {
            element.classList.remove("active")
        });
        event.currentTarget.classList.add("active")
        let historicSection = document.getElementById("historicSection")
        if (searchInput.value != "") {
            search(searchInput.value)
        }
        switch (event.currentTarget.textContent.toLocaleLowerCase()) {
            case "baixas":
                historicSection.classList.add("searching")
                historicSection.innerHTML = `
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
                searchDischarges()
                break;
            case "transferências":
                historicSection.classList.add("searching")
                historicSection.innerHTML = `
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
                searchTransfers()
                break;
            case "todos":
                historicSection.classList.add("searching")
                historicSection.innerHTML = `
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
                onAuthStateChanged(auth, (user) => {
                    if (user) {
                        const uid = user.uid;
                        let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                            if (doc.data().admin == true) {
                                loadRequests()
                            } else {
                                if (doc.data().work == "Técnico") {
                                    loadTecnicRequests(user.email, doc.data().fullName)
                                } else {
                                    loadRequests()
                                }
                            }
                        });
                    }
                });
                break;
            default:
                break;
        }
    })
);

function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                actualUserWork = doc.data().work
                actualUserName = doc.data().fullName
                if (doc.data().admin == true) {
                    transfer.style.display = "none"
                    acceptUser.style.display = "flex"
                    addItem.style.display = "flex"
                    loadRequests()
                    searchInput.addEventListener("input", () => {
                        filterList.classList.remove("active")
                        setTimeout(() => {
                            filterList.style.display = "none"
                        }, 200);
                        if (searchInput.value != "") {
                            search(searchInput.value)
                        } else {
                            let historicSection = document.getElementById("historicSection")
                            historicSection.classList.remove("searching")
                            historicSection.innerHTML = ""
                            loadRequests()
                            let errorPopUp = document.getElementById("errorPopUp")
                            errorPopUp.classList.remove("active")
                            setTimeout(() => {
                                errorPopUp.style.display = "none"
                            }, 200);
                        }
                    })
                } else {
                    transfer.style.display = "flex"
                    acceptUser.style.display = "none"
                    addItem.style.display = "none"
                    if (doc.data().work == "Técnico") {
                        loadTecnicRequests(user.email, doc.data().fullName)
                        searchInput.addEventListener("input", () => {
                            filterList.classList.remove("active")
                            setTimeout(() => {
                                filterList.style.display = "none"
                            }, 200);
                            if (searchInput.value != "") {
                                search(searchInput.value)
                            } else {
                                let historicSection = document.getElementById("historicSection")
                                historicSection.classList.remove("searching")
                                historicSection.innerHTML = ""
                                loadTecnicRequests(user.email, doc.data().fullName)
                                let errorPopUp = document.getElementById("errorPopUp")
                                errorPopUp.classList.remove("active")
                                setTimeout(() => {
                                    errorPopUp.style.display = "none"
                                }, 200);
                            }
                        })
                    } else {
                        loadRequests()
                        searchInput.addEventListener("input", () => {
                            filterList.classList.remove("active")
                            setTimeout(() => {
                                filterList.style.display = "none"
                            }, 200);
                            if (searchInput.value != "") {
                                search(searchInput.value)
                            } else {
                                let historicSection = document.getElementById("historicSection")
                                historicSection.classList.remove("searching")
                                historicSection.innerHTML = ""
                                loadRequests()
                                let errorPopUp = document.getElementById("errorPopUp")
                                errorPopUp.classList.remove("active")
                                setTimeout(() => {
                                    errorPopUp.style.display = "none"
                                }, 200);
                            }
                        })
                    }
                }
            });
        }
    });
}




function search(text) {
    let historicSection = document.getElementById("historicSection")
    historicSection.classList.add("searching")
    historicSection.innerHTML = `
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
    filterOption.forEach(btn => {
        if (btn.classList.contains("active")) {
            switch (btn.textContent.toLocaleLowerCase()) {
                case "receptor":
                    searchReciver(text.toLocaleLowerCase())
                    break;
                case "remetente":
                    searchSender(text.toLocaleLowerCase())
                    break;
                case "data":
                    searchDate(text.toLocaleLowerCase())
                    break;
                case "hora":
                    searchHour(text.toLocaleLowerCase())
                    break;
                case "todos":
                    let errorPopUp = document.getElementById("errorPopUp")
                    errorPopUp.style.display = "flex"
                    setTimeout(() => {
                        errorPopUp.classList.add("active")
                    }, 1);
                    let historicSection = document.getElementById("historicSection")
                    historicSection.classList.remove("searching")
                    historicSection.innerHTML = ""
                    break;
                default:
                    break;
            }
        }
    });
}







function searchReciver(text) {
    if (actualUserWork != "Técnico") {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let q = query(collection(db, "transfers"), where("status", "!=", ``));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().reciverName.toLocaleLowerCase().includes(`${text}`)) {
                    let historicSection = document.getElementById("historicSection")
                    let article = document.createElement("article")
                    historicSection.insertAdjacentElement("beforeend", article)
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
                        <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                        <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                    article.onclick = function () {
                        window.location = "view-transfer.html?id=" + doc.id;
                    }
                }
            })
        })
    } else {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let q = query(collection(db, "transfers"), where("status", "!=", ``));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().reciverName.toLocaleLowerCase().includes(`${text}`)) {
                    if (doc.data().senderName == actualUserName || doc.data().reciverName == actualUserName) {
                        let historicSection = document.getElementById("historicSection")
                        let article = document.createElement("article")
                        historicSection.insertAdjacentElement("beforeend", article)
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
                    <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                    <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                        article.onclick = function () {
                            window.location = "view-transfer.html?id=" + doc.id;
                        }
                    }
                }
            })
        })
    }
}


function searchSender(text) {
    if (actualUserWork != "Técnico") {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let q = query(collection(db, "transfers"), where("status", "!=", ``));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().senderName.toLocaleLowerCase().includes(`${text}`)) {
                    let historicSection = document.getElementById("historicSection")
                    let article = document.createElement("article")
                    historicSection.insertAdjacentElement("beforeend", article)
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
                    <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                    <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                    article.onclick = function () {
                        window.location = "view-transfer.html?id=" + doc.id;
                    }
                }
            })
        })
    } else {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let q = query(collection(db, "transfers"), where("status", "!=", ``));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().senderName.toLocaleLowerCase().includes(`${text}`)) {
                    if (doc.data().senderName == actualUserName || doc.data().reciverName == actualUserName) {
                        let historicSection = document.getElementById("historicSection")
                        let article = document.createElement("article")
                        historicSection.insertAdjacentElement("beforeend", article)
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
                    <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                    <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                        article.onclick = function () {
                            window.location = "view-transfer.html?id=" + doc.id;
                        }
                    }
                }
            })
        })
    }

}

function searchDate(text) {
    if (actualUserWork != "Técnico") {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let q = query(collection(db, "transfers"), where("status", "!=", ``));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().date.includes(`${text}`)) {
                    let historicSection = document.getElementById("historicSection")
                    let article = document.createElement("article")
                    historicSection.insertAdjacentElement("beforeend", article)
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
                        <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                        <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                    article.onclick = function () {
                        window.location = "view-transfer.html?id=" + doc.id;
                    }
                }
            })
        })
        let e = query(collection(db, "discharges"), where("itemsUsed", "!=", {}));
        let unsubscri = onSnapshot(e, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().date.includes(`${text}`)) {
                    let historicSection = document.getElementById("historicSection")
                    let article = document.createElement("article")
                    historicSection.insertAdjacentElement("beforeend", article)
                    article.classList.add("dischargeCard")
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.innerHTML = `
                    <div class="dischargeCard__div">
                        <h2 class="dischargeCard__h2">Relatório de baixa</h2>
                        <p class="dischargeCard__service">${doc.data().service}</p>
                    </div>
                    <p class="dischargeCard__p"><i class="bi bi-car-front-fill dischargeCard__p__icon"></i>técnico: ${doc.data().tecnicName}</p>
                    <p class="dischargeCard__p"><ion-icon name="person-outline" class="dischargeCard__p__icon"></ion-icon>Cliente: ${doc.data().clientName}</p>
                    <p class="dischargeCard__description">${doc.data().description}.</p>
                    <span class="dischargeCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                    <button class="dischargeCard__more"><ion-icon name="arrow-forward-outline"></ion-icon></button>`
                    article.onclick = function () {
                        window.location = "?id=" + doc.id;
                    }
                }
            })

        })
    } else {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let q = query(collection(db, "transfers"), where("status", "!=", ``));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().date.includes(`${text}`)) {
                    if (doc.data().senderName == actualUserName || doc.data().reciverName == actualUserName) {
                        let historicSection = document.getElementById("historicSection")
                        let article = document.createElement("article")
                        historicSection.insertAdjacentElement("beforeend", article)
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
                    <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                    <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                        article.onclick = function () {
                            window.location = "view-transfer.html?id=" + doc.id;
                        }
                    }
                }
            })
        })
        let e = query(collection(db, "discharges"), where("itemsUsed", "!=", {}));
        let unsubscri = onSnapshot(e, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().date.includes(`${text}`)) {
                    if (doc.data().tecnicName == actualUserName) {
                        let historicSection = document.getElementById("historicSection")
                        let article = document.createElement("article")
                        historicSection.insertAdjacentElement("beforeend", article)
                        article.classList.add("dischargeCard")
                        article.style.order = `-${doc.data().timestamp.seconds}`
                        article.innerHTML = `
                <div class="dischargeCard__div">
                    <h2 class="dischargeCard__h2">Relatório de baixa</h2>
                    <p class="dischargeCard__service">${doc.data().service}</p>
                </div>
                <p class="dischargeCard__p"><i class="bi bi-car-front-fill dischargeCard__p__icon"></i>técnico: ${doc.data().tecnicName}</p>
                <p class="dischargeCard__p"><ion-icon name="person-outline" class="dischargeCard__p__icon"></ion-icon>Cliente: ${doc.data().clientName}</p>
                <p class="dischargeCard__description">${doc.data().description}.</p>
                <span class="dischargeCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                <button class="dischargeCard__more"><ion-icon name="arrow-forward-outline"></ion-icon></button>`
                        article.onclick = function () {
                            window.location = "?id=" + doc.id;
                        }
                    }
                }
            })

        })
    }

}




function searchHour(text) {
    if (actualUserWork != "Técnico") {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let q = query(collection(db, "transfers"), where("status", "!=", ``));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().hours.includes(`${text}`)) {
                    let historicSection = document.getElementById("historicSection")
                    let article = document.createElement("article")
                    historicSection.insertAdjacentElement("beforeend", article)
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
                    <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                    <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                    article.onclick = function () {
                        window.location = "view-transfer.html?id=" + doc.id;
                    }
                }
            })
        })
        let e = query(collection(db, "discharges"), where("itemsUsed", "!=", {}));
        let unsubscri = onSnapshot(e, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().hours.includes(`${text}`)) {
                    let historicSection = document.getElementById("historicSection")
                    let article = document.createElement("article")
                    historicSection.insertAdjacentElement("beforeend", article)
                    article.classList.add("dischargeCard")
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.innerHTML = `
                <div class="dischargeCard__div">
                    <h2 class="dischargeCard__h2">Relatório de baixa</h2>
                    <p class="dischargeCard__service">${doc.data().service}</p>
                </div>
                <p class="dischargeCard__p"><i class="bi bi-car-front-fill dischargeCard__p__icon"></i>técnico: ${doc.data().tecnicName}</p>
                <p class="dischargeCard__p"><ion-icon name="person-outline" class="dischargeCard__p__icon"></ion-icon>Cliente: ${doc.data().clientName}</p>
                <p class="dischargeCard__description">${doc.data().description}.</p>
                <span class="dischargeCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                <button class="dischargeCard__more"><ion-icon name="arrow-forward-outline"></ion-icon></button>`
                    article.onclick = function () {
                        window.location = "?id=" + doc.id;
                    }
                }
            })

        })
    } else {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let q = query(collection(db, "transfers"), where("status", "!=", ``));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().hours.includes(`${text}`)) {
                    if (doc.data().senderName == actualUserName || doc.data().reciverName == actualUserName) {
                        let historicSection = document.getElementById("historicSection")
                        let article = document.createElement("article")
                        historicSection.insertAdjacentElement("beforeend", article)
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
                        <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                        <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                        article.onclick = function () {
                            window.location = "view-transfer.html?id=" + doc.id;
                        }
                    }
                }
            })
        })
        let e = query(collection(db, "discharges"), where("itemsUsed", "!=", {}));
        let unsubscri = onSnapshot(e, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().hours.includes(`${text}`)) {
                    if (doc.data().tecnicName == actualUserName) {
                        let historicSection = document.getElementById("historicSection")
                        let article = document.createElement("article")
                        historicSection.insertAdjacentElement("beforeend", article)
                        article.classList.add("dischargeCard")
                        article.style.order = `-${doc.data().timestamp.seconds}`
                        article.innerHTML = `
                <div class="dischargeCard__div">
                    <h2 class="dischargeCard__h2">Relatório de baixa</h2>
                    <p class="dischargeCard__service">${doc.data().service}</p>
                </div>
                <p class="dischargeCard__p"><i class="bi bi-car-front-fill dischargeCard__p__icon"></i>técnico: ${doc.data().tecnicName}</p>
                <p class="dischargeCard__p"><ion-icon name="person-outline" class="dischargeCard__p__icon"></ion-icon>Cliente: ${doc.data().clientName}</p>
                <p class="dischargeCard__description">${doc.data().description}.</p>
                <span class="dischargeCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                <button class="dischargeCard__more"><ion-icon name="arrow-forward-outline"></ion-icon></button>`
                        article.onclick = function () {
                            window.location = "?id=" + doc.id;
                        }
                    }
                }
            })

        })
    }
}



function searchDischarges() {
    if (actualUserWork != "Técnico") {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let e = query(collection(db, "discharges"), where("itemsUsed", "!=", {}));
        let unsubscri = onSnapshot(e, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let historicSection = document.getElementById("historicSection")
                let article = document.createElement("article")
                historicSection.insertAdjacentElement("beforeend", article)
                article.classList.add("dischargeCard")
                article.style.order = `-${doc.data().timestamp.seconds}`
                article.innerHTML = `
                    <div class="dischargeCard__div">
                        <h2 class="dischargeCard__h2">Relatório de baixa</h2>
                        <p class="dischargeCard__service">${doc.data().service}</p>
                    </div>
                    <p class="dischargeCard__p"><i class="bi bi-car-front-fill dischargeCard__p__icon"></i>técnico: ${doc.data().tecnicName}</p>
                    <p class="dischargeCard__p"><ion-icon name="person-outline" class="dischargeCard__p__icon"></ion-icon>Cliente: ${doc.data().clientName}</p>
                    <p class="dischargeCard__description">${doc.data().description}.</p>
                    <span class="dischargeCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                    <button class="dischargeCard__more"><ion-icon name="arrow-forward-outline"></ion-icon></button>`
                article.onclick = function () {
                    window.location = "?id=" + doc.id;
                }
            })
        })
    } else {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let e = query(collection(db, "discharges"), where("itemsUsed", "!=", {}));
        let unsubscri = onSnapshot(e, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().tecnicName == actualUserName) {
                    let historicSection = document.getElementById("historicSection")
                    let article = document.createElement("article")
                    historicSection.insertAdjacentElement("beforeend", article)
                    article.classList.add("dischargeCard")
                    article.style.order = `-${doc.data().timestamp.seconds}`
                    article.innerHTML = `
                        <div class="dischargeCard__div">
                            <h2 class="dischargeCard__h2">Relatório de baixa</h2>
                            <p class="dischargeCard__service">${doc.data().service}</p>
                        </div>
                        <p class="dischargeCard__p"><i class="bi bi-car-front-fill dischargeCard__p__icon"></i>técnico: ${doc.data().tecnicName}</p>
                        <p class="dischargeCard__p"><ion-icon name="person-outline" class="dischargeCard__p__icon"></ion-icon>Cliente: ${doc.data().clientName}</p>
                        <p class="dischargeCard__description">${doc.data().description}.</p>
                        <span class="dischargeCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                        <button class="dischargeCard__more"><ion-icon name="arrow-forward-outline"></ion-icon></button>`
                    article.onclick = function () {
                        window.location = "?id=" + doc.id;
                    }
                }
            })
        })
    }
}


function searchTransfers() {
    if (actualUserWork != "Técnico") {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let q = query(collection(db, "transfers"), where("status", "!=", ``));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let historicSection = document.getElementById("historicSection")
                let article = document.createElement("article")
                historicSection.insertAdjacentElement("beforeend", article)
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
                            <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                            <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                article.onclick = function () {
                    window.location = "view-transfer.html?id=" + doc.id;
                }
            })
        })
    } else {
        let historicSection = document.getElementById("historicSection")
        historicSection.classList.remove("searching")
        historicSection.innerHTML = ""
        let q = query(collection(db, "transfers"), where("status", "!=", ``));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().senderName == actualUserName || doc.data().reciverName == actualUserName) {
                    let historicSection = document.getElementById("historicSection")
                    let article = document.createElement("article")
                    historicSection.insertAdjacentElement("beforeend", article)
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
                                <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                                <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                    article.onclick = function () {
                        window.location = "view-transfer.html?id=" + doc.id;
                    }
                }
            })
        })
    }
}





























function loadTecnicRequests(email, name) {
    let historicSection = document.getElementById("historicSection")
    historicSection.innerHTML = ""
    historicSection.classList.remove("searching")
    let q = query(collection(db, "transfers"), where("status", "!=", ``));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().senderEmail == email || doc.data().reciverEmail == email) {
                let historicSection = document.getElementById("historicSection")
                let article = document.createElement("article")
                historicSection.insertAdjacentElement("beforeend", article)
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
                    <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                    <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
                article.onclick = function () {
                    window.location = "view-transfer.html?id=" + doc.id;
                }
            }
        })
    })
    let e = query(collection(db, "discharges"), where("itemsUsed", "!=", {}));
    let unsubscri = onSnapshot(e, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().tecnicName == name) {
                let historicSection = document.getElementById("historicSection")
                let article = document.createElement("article")
                historicSection.insertAdjacentElement("beforeend", article)
                article.classList.add("dischargeCard")
                article.style.order = `-${doc.data().timestamp.seconds}`
                article.innerHTML = `
                    <div class="dischargeCard__div">
                        <h2 class="dischargeCard__h2">Relatório de baixa</h2>
                        <p class="dischargeCard__service">${doc.data().service}</p>
                    </div>
                    <p class="dischargeCard__p"><i class="bi bi-car-front-fill dischargeCard__p__icon"></i>técnico: ${doc.data().tecnicName}</p>
                    <p class="dischargeCard__p"><ion-icon name="person-outline" class="dischargeCard__p__icon"></ion-icon>Cliente: ${doc.data().clientName}</p>
                    <p class="dischargeCard__description">${doc.data().description}.</p>
                    <span class="dischargeCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                    <button class="dischargeCard__more"><ion-icon name="arrow-forward-outline"></ion-icon></button>`
                article.onclick = function () {
                    window.location = "?id=" + doc.id;
                }
            }
        })
    })
}


function loadRequests() {
    let historicSection = document.getElementById("historicSection")
    historicSection.innerHTML = ""
    historicSection.classList.remove("searching")
    let q = query(collection(db, "transfers"), where("status", "!=", ``));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let historicSection = document.getElementById("historicSection")
            let article = document.createElement("article")
            historicSection.insertAdjacentElement("beforeend", article)
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
                <span class="NewTransferCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                <button class="NewTransferCard__more"><ion-icon name="arrow-forward-outline" role="img" class="md hydrated"></ion-icon></button>`
            article.onclick = function () {
                window.location = "view-transfer.html?id=" + doc.id;
            }
        })
    })
    let e = query(collection(db, "discharges"), where("itemsUsed", "!=", {}));
    let unsubscri = onSnapshot(e, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let historicSection = document.getElementById("historicSection")
            let article = document.createElement("article")
            historicSection.insertAdjacentElement("beforeend", article)
            article.classList.add("dischargeCard")
            article.style.order = `-${doc.data().timestamp.seconds}`
            article.innerHTML = `
                <div class="dischargeCard__div">
                    <h2 class="dischargeCard__h2">Relatório de baixa</h2>
                    <p class="dischargeCard__service">${doc.data().service}</p>
                </div>
                <p class="dischargeCard__p"><i class="bi bi-car-front-fill dischargeCard__p__icon"></i>técnico: ${doc.data().tecnicName}</p>
                <p class="dischargeCard__p"><ion-icon name="person-outline" class="dischargeCard__p__icon"></ion-icon>Cliente: ${doc.data().clientName}</p>
                <p class="dischargeCard__description">${doc.data().description}.</p>
                <span class="dischargeCard__date">${doc.data().hours}<br>${doc.data().date}</span>
                <button class="dischargeCard__more"><ion-icon name="arrow-forward-outline"></ion-icon></button>`
            article.onclick = function () {
                window.location = "?id=" + doc.id;
            }
        })
    })
}

function returnColor(status) {
    switch (status) {
        case "Pendente":
            return "var(--orange)"
            break;
        case "Aceito":
            return "var(--green)"
            break;
        default:
            return "#f00"
            break;
    }
}



let q = query(collection(db, "transfers"), where("status", "!=", ""));
let unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
            loadData()
        }
    });
});

let e = query(collection(db, "discharges"), where("itemsUsed", "!=", {}));
let unsubscribed = onSnapshot(e, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
            loadData()
        }
    });
});


loadData()