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

let createItem = document.getElementById("createItem")
let helpAdd = document.getElementById("helpAdd")
let addField = document.getElementById("addField")


function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                if (doc.data().admin == true) {
                    transfer.style.display = "none"
                    acceptUser.style.display = "flex"
                    addItem.style.display = "flex"
                } else {
                    let body = document.querySelector("body")
                    body.innerHTML = ""
                    window.location.href = "index.html"
                }
            });
        }
    });
}

loadData()

createItem.onclick = function () {
    createItem.innerHTML = `
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
    createItem.classList.add("loading")
    let quantyMin = document.getElementById("quantyMin").value
    let measure = document.getElementById("measure").value
    let inStock = document.getElementById("inStock").value
    let itemName = document.getElementById("itemName").value
    let itemImg = document.getElementById("itemImg").value
    if (quantyMin != "" && measure != "" && inStock != "" && itemName != "" && itemImg != "") {
        sucessAddItem(itemName, measure, quantyMin, inStock, itemImg)
    } else {
        helpAdd.style.color = "red"
        helpAdd.textContent = "Por favor, preencha todos os campos."
        createItem.innerHTML = "ADICIONAR"
        createItem.classList.remove("loading")
        setTimeout(() => {
            helpAdd.textContent = ""
        }, 3000);
    }
}

async function sucessAddItem(itemName, measure, quantyMin, inStock, itemImg) {
    await setDoc(doc(db, "items", `${itemName}`), {
        itemName: `${itemName}`,
        itemImg: `${itemImg}`,
        inStock: `${inStock}`,
        measure: `${measure}`,
        quantyMin: `${quantyMin}`,
        withTecnics: 0,
        active: true
    });
    helpAdd.style.color = "#0f0"
    helpAdd.textContent = "Item adicionado com sucesso."
    let quantyMinInput = document.getElementById("quantyMin")
    let inStockInput = document.getElementById("inStock")
    let itemNameInput = document.getElementById("itemName")
    let itemImgInput = document.getElementById("itemImg")
    itemNameInput.value = ""
    quantyMinInput.value = ""
    inStockInput.value = ""
    itemImgInput.value = ""
    createItem.innerHTML = "ADICIONAR"
    createItem.classList.remove("loading")
    setTimeout(() => {
        helpAdd.textContent = ""
    }, 3000);
}