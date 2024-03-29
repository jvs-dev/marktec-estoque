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
let openCloseNav = document.getElementById("openCloseNav")
let navMobile = document.getElementById("navMobile")
let addItemsBtn = document.createElement("a")
let acceptUserBtn = document.createElement("a")
let transferMobile = document.getElementById("transferMobile")
let tecnicsMobile = document.getElementById("tecnicsMobile")


function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                if (doc.data().admin == true) {
                    navMobile.insertAdjacentElement("afterbegin", addItemsBtn)
                    navMobile.insertAdjacentElement("afterbegin", acceptUserBtn)
                    acceptUserBtn.innerHTML = `<i class="bi bi-person-vcard navMobile__icon">`
                    acceptUserBtn.classList.add("navMobile__a")
                    addItemsBtn.innerHTML = `<i class="bi bi-plus-circle navMobile__icon">`
                    addItemsBtn.classList.add("navMobile__a")
                    acceptUserBtn.href = "accept-user.html"
                    addItemsBtn.href = "add-item.html"
                    navMobile.classList.add("userAdmin")
                    transferMobile.style.display = "none"
                    transferMobile.innerHTML = ""
                    transferMobile.href = ""
                    if (window.location.href.indexOf("accept-user") !== -1) {
                        acceptUserBtn.classList.add("active")
                    }
                    if (window.location.href.indexOf("add-item") !== -1) {
                        addItemsBtn.classList.add("active")
                    }
                } else {
                    if (doc.data().createAccountPermission == true) {
                        navMobile.insertAdjacentElement("afterbegin", addItemsBtn)
                        navMobile.insertAdjacentElement("afterbegin", acceptUserBtn)
                        acceptUserBtn.innerHTML = `<i class="bi bi-person-vcard navMobile__icon">`
                        acceptUserBtn.classList.add("navMobile__a")
                        addItemsBtn.innerHTML = `<i class="bi bi-plus-circle navMobile__icon">`
                        addItemsBtn.classList.add("navMobile__a")
                        if (window.location.href.indexOf("add-item") !== -1) {
                            addItemsBtn.classList.add("active")
                        }
                        if (window.location.href.indexOf("accept-user") !== -1) {
                            acceptUserBtn.classList.add("active")
                        }
                        acceptUserBtn.href = "accept-user.html"
                        addItemsBtn.href = "add-item.html"
                        navMobile.classList.add("userStockPermission")
                        transferMobile.style.display = "flex"
                        loadRequests(user.email)
                    } else {
                        if (doc.data().work == "Estoquista") {
                            navMobile.insertAdjacentElement("afterbegin", addItemsBtn)
                            addItemsBtn.innerHTML = `<i class="bi bi-plus-circle navMobile__icon">`
                            addItemsBtn.classList.add("navMobile__a")
                            if (window.location.href.indexOf("add-item") !== -1) {
                                addItemsBtn.classList.add("active")
                            }
                            addItemsBtn.href = "add-item.html"
                            navMobile.classList.add("userStock")
                            transferMobile.style.display = "flex"
                            loadRequests(user.email)
                        } else {
                            transferMobile.style.display = "flex"
                            tecnicsMobile.style.display = "none"
                            tecnicsMobile.innerHTML = ""
                            tecnicsMobile.href = ""
                            loadRequests(user.email)
                        }
                    }
                }
            });
        }
    });
}

function loadRequests(actualUser) {
    let q = query(collection(db, "transfers"), where("reciverEmail", "==", `${actualUser}`));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().status == "Pendente") {
                transferMobile.classList.add("awaiting")
            }
        })
    })
}

loadData()














openCloseNav.onclick = function () {
    navMobile.classList.toggle("active")
}

