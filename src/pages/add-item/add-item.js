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
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, onSnapshot, query, where, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();
let transfer = document.getElementById("transfer")
let acceptUser = document.getElementById("acceptUser")
let addItem = document.getElementById("addItem")
let createItem = document.getElementById("createItem")
let helpAdd = document.getElementById("helpAdd")
let addField = document.getElementById("addField")
let actualUserName = ""
let actualUserEmail = ""
let userWork = ""

setInterval(() => {
    let itemImg = document.getElementById("itemImg").value
    let previewImg = document.getElementById("previewImg")
    previewImg.src = itemImg
}, 1000);

function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                actualUserName = doc.data().fullName
                actualUserEmail = doc.data().email
                userWork = doc.data().work
                if (doc.data().admin == true) {
                    transfer.style.display = "none"
                    acceptUser.style.display = "flex"
                    addItem.style.display = "flex"
                } else {
                    if (doc.data().work == "Estoquista") {
                        transfer.style.display = "flex"
                        addItem.style.display = "flex"
                    } else {
                        let body = document.querySelector("body")
                        body.innerHTML = ""
                        window.location.href = "index.html"
                    }
                }
            });
            disable()
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
    let itemValue = document.getElementById("itemValue").value
    let itemGroup = document.getElementById("itemGroup").value
    let itemBrand = document.getElementById("itemBrand").value
    if (quantyMin != "" && measure != "" && inStock != "" && itemName != "" && itemImg != "" && itemValue != "" && itemGroup != "" && itemBrand != "") {
        verifyItemName(itemName, measure, quantyMin, Number(inStock), itemImg, itemValue, itemGroup, itemBrand)
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

async function sucessAddItem(itemName, measure, quantyMin, inStock, itemImg, itemValue, itemGroup, itemBrand) {
    await setDoc(doc(db, "items", `${itemName}`), {
        itemName: `${itemName}`,
        itemImg: `${itemImg}`,
        inStock: inStock,
        measure: `${measure}`,
        quantyMin: quantyMin,
        itemValue: `${itemValue}`,
        itemGroup: `${itemGroup}`,
        itemBrand: `${itemBrand}`,
        withTecnics: 0,
        active: true
    });
    returnTecnicEmail(itemName, measure, quantyMin, inStock, itemImg, itemValue, itemGroup, itemBrand)
    addItemNotify(itemName, inStock, measure)
    helpAdd.style.color = "#0f0"
    helpAdd.textContent = "Item adicionado com sucesso."
    let quantyMinInput = document.getElementById("quantyMin")
    let inStockInput = document.getElementById("inStock")
    let itemNameInput = document.getElementById("itemName")
    let itemImgInput = document.getElementById("itemImg")
    let itemValueInput = document.getElementById("itemValue")
    let itemGroupInput = document.getElementById("itemGroup")
    let itemBrandInput = document.getElementById("itemBrand")
    itemNameInput.value = ""
    quantyMinInput.value = ""
    inStockInput.value = ""
    itemImgInput.value = ""
    itemValueInput.value = ""
    itemGroupInput.value = ""
    itemBrandInput.value = ""
    createItem.innerHTML = "ADICIONAR"
    createItem.classList.remove("loading")
    setTimeout(() => {
        helpAdd.textContent = ""
    }, 3000);
}

async function returnTecnicEmail(itemName, measure, quantyMin, inStock, itemImg, itemValue, itemGroup, itemBrand) {
    let q = query(collection(db, "tecnics"), where("permission", "==", true));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        let tecnicsName = [];
        querySnapshot.forEach((doc) => {
            tecnicsName.push(doc.id);
        });
        addTecnicItem(itemName, measure, quantyMin, inStock, itemImg, itemValue, tecnicsName, itemGroup, itemBrand)
    });
}

async function addTecnicItem(itemName, measure, quantyMin, inStock, itemImg, itemValue, tecnicsName, itemGroup, itemBrand) {
    tecnicsName.forEach(name => {
        setDoc(doc(db, "tecnics", `${name}`, "stock", `${itemName}`), {
            itemName: itemName,
            itemImg: itemImg,
            itemValue: itemValue,
            itemGroup: itemGroup,
            itemBrand: itemBrand,
            measure: measure,
            tecnicStock: 0
        });
    });
}


async function verifyItemName(itemName, measure, quantyMin, inStock, itemImg, itemValue, itemGroup, itemBrand) {
    let docRef = doc(db, "items", `${itemName}`);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        helpAdd.style.color = "red"
        helpAdd.textContent = "Este item já foi adicionado."
        createItem.innerHTML = "ADICIONAR"
        createItem.classList.remove("loading")
        setTimeout(() => {
            helpAdd.textContent = ""
        }, 3000);
    } else {
        sucessAddItem(itemName, measure, quantyMin, inStock, itemImg, itemValue, itemGroup, itemBrand)
    }
}




async function addItemNotify(itemName, inStock, measure) {
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
        type: "item added",
        ItemAdded: `${itemName}`,
        initialQuanty: inStock,
        measure: `${measure}`,
        hours: hours,
        date: date,
        userName: actualUserName,
        userEmail: actualUserEmail,
        userWork: userWork,
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