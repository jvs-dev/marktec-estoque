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
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, query, where, updateDoc, getDocs, getDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();
let actualUserName = ""
let actualUserEmail = ""
let actualUserWork = ""
let finalizeIndex = 0
let closeErrorPopUp = document.getElementById("closeErrorPopUp")

closeErrorPopUp.onclick = function () {
    let errorPopUp = document.getElementById("errorPopUp")
    errorPopUp.classList.remove("active")
    setTimeout(() => {
        errorPopUp.style.display = "none"
    }, 200);
}


function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, "users", `${user.email}`), (doc) => {
                actualUserName = doc.data().fullName
                actualUserEmail = user.email
                actualUserWork = doc.data().work
                if (doc.data().work != "Técnico") {
                    verifyItemUrl()
                }
            })
        }
    });
}


async function verifyItemUrl() {
    let urlParams = new URLSearchParams(window.location.search);
    let dataId = urlParams.get('id');
    if (dataId != null) {
        let docRef = doc(db, "items", `${dataId}`);
        let docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            verifyUrl()
        } else {
            let errorPopUp = document.getElementById("errorPopUp")
            errorPopUp.style.display = "flex"
            errorPopUp.style.zIndex = "4"
            setTimeout(() => {
                errorPopUp.classList.add("active")
            }, 1);
            setTimeout(() => {
                errorPopUp.classList.remove("active")
                setTimeout(() => {
                    errorPopUp.style.display = "none"
                }, 200);
            }, 7000);
        }
    }
}


function verifyUrl() {
    let viewDischargeSection = document.getElementById("viewDischargeSection")
    let urlParams = new URLSearchParams(window.location.search);
    let dataId = urlParams.get('id');
    if (dataId != null) {
        let unsub = onSnapshot(doc(db, "items", `${dataId}`), (doc) => {
            let viewItemSection = document.getElementById("viewItemSection")
            viewItemSection.style.display = "flex"
            viewItemSection.innerHTML = `
            <div class="squares">
                <div class="square--1"></div>
                <div class="square--2"></div>
                <div class="square--3"></div>
            </div>
            <div class="content">
                <h2 class="itemSection__h2">Sobre o Item</h2>
                <img class="itemSection__img" src="${doc.data().itemImg}" alt="">
                <p class="itemSection__itemName">${doc.data().itemName}</p>
                <h3 class="itemSection__h3">Distribuição do item</h3>
                <p class="itemSection__p" id="inStockPRef">Em estoque: ${doc.data().inStock} ${doc.data().measure}</p>
                <p class="itemSection__p">Total: ${doc.data().inStock + doc.data().withTecnics} ${doc.data().measure}</p>
                <h3 class="itemSection__h3">Dados do Item</h3>
                <p class="itemSection__p">Valor: R$${doc.data().itemValue}</p>
                <p class="itemSection__p">Medida: ${doc.data().measure}</p>
                <p class="itemSection__p">Estoque Mínimo: ${doc.data().quantyMin} ${doc.data().measure}</p>
                <p class="itemSection__p">Marca: ${doc.data().itemBrand}</p>
                <p class="itemSection__p">Grupo: ${doc.data().itemGroup}</p>
                <div class="itemSection__div">
                    <button class="itemSection__button button--edit" style="--clr: #1d1d1d;" id="editItemData"><i class="bi bi-pencil"></i></button>
                    <button class="itemSection__button button--remove" style="--clr: #f00;" id="removeItem"><i class="bi bi-trash3"></i></button>
                </div>
            </div>
            <a href="stock.html" class="viewDischargeSection__back"><ion-icon name="arrow-back-outline"></ion-icon>Voltar</a>`
            returnTecnics(dataId)
            let removeItem = document.getElementById("removeItem")
            let editItemData = document.getElementById("editItemData")
            editItemData.onclick = function () {
                loadItemData(doc.data().itemName, doc.data().itemImg, doc.data().itemValue, doc.data().itemBrand, doc.data().itemGroup, doc.data().measure, doc.data().quantyMin)
                let updateItemSection = document.getElementById("updateItemSection")
                let cancelUpdateItem = document.getElementById("cancelUpdateItem")
                let updateItem = document.getElementById("updateItem")
                cancelUpdateItem.style.display = "flex"
                updateItem.classList.remove("loading")
                updateItem.innerHTML = `ATUALIZAR`
                cancelUpdateItem.style.display = "flex"
                updateItemSection.style.display = "flex"
                setTimeout(() => {
                    updateItemSection.classList.add("active")
                }, 1);
                cancelUpdateItem.onclick = function () {
                    cancelUpdate()
                }
                updateItem.onclick = function () {
                    cancelUpdateItem.style.display = "none"
                    updateItem.classList.add("loading")
                    updateItem.innerHTML = `
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
                    updateItemData()
                }
            }
            removeItem.onclick = function () {
                let removeItemBackground = document.getElementById("removeItemBackground")
                let removeItemQuestion = document.getElementById("removeItemQuestion")
                let removeItemConfirm = document.getElementById("removeItemConfirm")
                let removeItemCancel = document.getElementById("removeItemCancel")
                removeItemQuestion.innerHTML = `Deseja mesmo excluir <strong>${doc.data().itemName}</strong>? Esta ação excluirá este item do banco de dados.`
                removeItemCancel.onclick = function () {
                    removeItemBackground.classList.remove("active")
                    setTimeout(() => {
                        removeItemBackground.style.display = "none"
                    }, 200);
                }
                removeItemConfirm.onclick = function () {
                    removeItemBackground.innerHTML = `
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
                    deleteItem(doc.data().itemName)
                }
                removeItemBackground.style.display = "flex"
                setTimeout(() => {
                    removeItemBackground.classList.add("active")
                }, 1);
            }
        })
    }
}


async function returnTecnics(itemName) {
    let q = query(collection(db, "users"), where("permission", "==", true));
    let querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if (doc.data().work == "Técnico") {
            TecnicItemQuanty(doc.data().email, doc.data().fullName, itemName)
        }
    });
}

async function TecnicItemQuanty(email, fullName, itemName) {
    const querySnapshot = await getDocs(collection(db, "tecnics", `${email}`, "stock"));
    querySnapshot.forEach((doc) => {
        if (doc.id == itemName) {
            let p = document.createElement("p")
            p.classList.add("itemSection__p")
            p.innerHTML = `Com ${fullName}: ${doc.data().tecnicStock} ${doc.data().measure}`
            let inStock = document.getElementById("inStockPRef")
            inStock.insertAdjacentElement("afterend", p)
        }
    });
}



async function deleteItem(itemName) {
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
        type: "Delete item",
        ItemDeleted: `${itemName}`,
        hours: hours,
        date: date,
        userName: actualUserName,
        userEmail: actualUserEmail,
        userWork: actualUserWork,
        timestamp: serverTimestamp()
    });
    returnTecnicsToDelete(itemName)
}


async function returnTecnicsToDelete(itemName) {
    await deleteDoc(doc(db, "items", `${itemName}`));
    let q = query(collection(db, "users"), where("permission", "==", true));
    let querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if (doc.data().work == "Técnico") {
            TecnicItemDelete(doc.data().email, doc.data().fullName, itemName)
        }
    });
}

async function TecnicItemDelete(email, fullName, itemName) {
    await deleteDoc(doc(db, "tecnics", `${email}`, `stock`, `${itemName}`));
    window.location.href = "stock.html"
}


function loadItemData(itemNameData, itemImgData, itemValueData, itemBrandData, itemGroupData, measureData, quantyMinData) {
    let itemName = document.getElementById("itemName")
    let itemImg = document.getElementById("itemImg")
    let itemValue = document.getElementById("itemValue")
    let measure = document.getElementById("measure")
    let inStock = document.getElementById("inStock")
    let quantyMin = document.getElementById("quantyMin")
    let itemGroup = document.getElementById("itemGroup")
    let itemBrand = document.getElementById("itemBrand")
    itemImg.value = itemImgData
    itemName.value = itemNameData
    itemValue.value = itemValueData
    itemBrand.value = itemBrandData
    itemGroup.value = itemGroupData
    measure.value = measureData
    quantyMin.value = quantyMinData
    inStock.placeholder = "Inalteravel"
}

function cancelUpdate() {
    let itemName = document.getElementById("itemName")
    let itemImg = document.getElementById("itemImg")
    let itemValue = document.getElementById("itemValue")
    let measure = document.getElementById("measure")
    let inStock = document.getElementById("inStock")
    let quantyMin = document.getElementById("quantyMin")
    let itemGroup = document.getElementById("itemGroup")
    let itemBrand = document.getElementById("itemBrand")
    itemImg.value = ""
    itemName.value = ""
    itemValue.value = ""
    itemBrand.value = ""
    itemGroup.value = ""
    measure.value = ""
    quantyMin.value = ""
    inStock.placeholder = ""
    let updateItemSection = document.getElementById("updateItemSection")
    updateItemSection.classList.remove("active")
    setTimeout(() => {
        updateItemSection.style.display = "none"
    }, 200);
}




async function updateItemData() {
    let itemName = document.getElementById("itemName").value
    let itemImg = document.getElementById("itemImg").value
    let itemValue = document.getElementById("itemValue").value
    let measure = document.getElementById("measure").value
    let inStock = document.getElementById("inStock").value
    let quantyMin = document.getElementById("quantyMin").value
    let itemGroup = document.getElementById("itemGroup").value
    let itemBrand = document.getElementById("itemBrand").value
    let urlParams = new URLSearchParams(window.location.search);
    let dataId = urlParams.get('id');
    if (quantyMin != "" && measure != "" && itemName != "" && itemImg != "" && itemValue != "" && itemGroup != "" && itemBrand != "") {
        if (itemName == dataId) {
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
                type: "update item",
                ItemUpdated: `${dataId}`,
                itemIdLink: `${dataId}`,
                hours: hours,
                date: date,
                userName: actualUserName,
                userEmail: actualUserEmail,
                userWork: actualUserWork,
                timestamp: serverTimestamp()
            });
            let itemRef = doc(db, "items", `${dataId}`);
            await updateDoc(itemRef, {
                itemImg: `${itemImg}`,
                measure: `${measure}`,
                quantyMin: quantyMin,
                itemValue: `${itemValue}`,
                itemGroup: `${itemGroup}`,
                itemBrand: `${itemBrand}`,
            });
            returnTecnicsToUpdate(measure, quantyMin, itemImg, itemValue, itemGroup, itemBrand)
        } else {
            addAndRemoveStep1(measure, quantyMin, itemImg, itemValue, itemGroup, itemBrand, itemName)
        }
    }
}



async function returnTecnicsToUpdate(measure, quantyMin, itemImg, itemValue, itemGroup, itemBrand) {
    let q = query(collection(db, "users"), where("permission", "==", true));
    let querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if (doc.data().work == "Técnico") {
            updateItemToTecnics(measure, quantyMin, itemImg, itemValue, itemGroup, itemBrand, doc.data().email)
        }
    });
}


async function updateItemToTecnics(measure, quantyMin, itemImg, itemValue, itemGroup, itemBrand, tecnicEmail) {
    let urlParams = new URLSearchParams(window.location.search);
    let dataId = urlParams.get('id');
    let itemRef = doc(db, "tecnics", `${tecnicEmail}`, `stock`, `${dataId}`);
    await updateDoc(itemRef, {
        itemImg: `${itemImg}`,
        measure: `${measure}`,
        itemValue: `${itemValue}`,
        itemGroup: `${itemGroup}`,
        itemBrand: `${itemBrand}`,
    });
    let helpAdd = document.getElementById("helpAdd")
    helpAdd.style.color = "#0f0"
    helpAdd.innerHTML = "Item atualizado com sucesso"
    setTimeout(() => {
        helpAdd.innerHTML = ""
        cancelUpdate()
    }, 2000);
}


setInterval(() => {
    let itemImg = document.getElementById("itemImg")
    previewImg.src = itemImg.value
}, 1000);








async function addAndRemoveStep1(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName) {
    let docRef = doc(db, "items", `${newItemName}`);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        let helpAdd = document.getElementById("helpAdd")
        helpAdd.style.color = "#f00"
        helpAdd.innerHTML = "Já existe um item com este nome"
        let cancelUpdateItem = document.getElementById("cancelUpdateItem")
        let updateItem = document.getElementById("updateItem")
        cancelUpdateItem.style.display = "flex"
        updateItem.classList.remove("loading")
        updateItem.innerHTML = `ATUALIZAR`
        setTimeout(() => {
            helpAdd.innerHTML = ""
        }, 2000);
    } else {
        addAndRemoveTecnicStep1(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName)
        addAndRemoveStep2(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName)
    }

}


async function addAndRemoveStep2(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName) {
    let urlParams = new URLSearchParams(window.location.search);
    let dataId = urlParams.get('id');
    let q = query(collection(db, "items"), where("itemName", "==", dataId));
    let querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        addAndRemoveStep3(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName, doc.data().inStock, doc.data().withTecnics, dataId)
    });
}


async function addAndRemoveStep3(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName, inStock, withTecnics, oldName) {
    await setDoc(doc(db, "items", `${newItemName}`), {
        itemName: `${newItemName}`,
        itemImg: `${newItemImg}`,
        inStock: inStock,
        measure: `${newMeasure}`,
        quantyMin: newQuantyMin,
        itemValue: `${newItemValue}`,
        itemGroup: `${newItemGroup}`,
        itemBrand: `${newItemBrand}`,
        withTecnics: withTecnics,
        active: true
    });
    await deleteDoc(doc(db, "items", `${oldName}`));
}


async function addAndRemoveTecnicStep1(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName) {
    let urlParams = new URLSearchParams(window.location.search);
    let dataId = urlParams.get('id');
    let q = query(collection(db, "users"), where("work", "==", "Técnico"));
    let querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        addAndRemoveTecnicStep2(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName, dataId, doc.id)
    });
}


async function addAndRemoveTecnicStep2(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName, oldName, tecnic) {
    let docRef = doc(db, "tecnics", `${tecnic}`, `stock`, `${oldName}`);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        addAndRemoveTecnicStep3(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName, oldName, tecnic, docSnap.data().tecnicStock)
    }
}



async function addAndRemoveTecnicStep3(newMeasure, newQuantyMin, newItemImg, newItemValue, newItemGroup, newItemBrand, newItemName, oldName, tecnic, tecnicStock) {
    await setDoc(doc(db, "tecnics", `${tecnic}`, `stock`, `${newItemName}`), {
        itemName: newItemName,
        itemImg: newItemImg,
        itemValue: newItemValue,
        itemGroup: newItemGroup,
        itemBrand: newItemBrand,
        measure: newMeasure,
        tecnicStock: tecnicStock
    });
    await deleteDoc(doc(db, "tecnics", `${tecnic}`, `stock`, `${oldName}`));
    finzlizeAddAndRemove(newItemName, oldName)
}



async function finzlizeAddAndRemove(newItemName, oldItemName) {
    if (finalizeIndex == 0) {
        finalizeIndex++
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
            type: "update item",
            ItemUpdated: `${oldItemName}`,
            itemIdLink: `${newItemName}`,
            hours: hours,
            date: date,
            userName: actualUserName,
            userEmail: actualUserEmail,
            userWork: actualUserWork,
            timestamp: serverTimestamp()
        });
        let helpAdd = document.getElementById("helpAdd")
        helpAdd.style.color = "#0f0"
        helpAdd.innerHTML = "Item atualizado com sucesso"
        setTimeout(() => {
            helpAdd.innerHTML = ""
            window.location = "?id=" + newItemName;
        }, 2000);
    }
}



loadData()

