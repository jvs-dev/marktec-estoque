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
let awaitSection = document.getElementById("awaitSection")


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


async function acptPermission(email) {
    awaitSection.innerHTML = ""
    let usersRef = doc(db, "users", `${email}`);
    await updateDoc(usersRef, {
        permission: true
    });
}

const q = query(collection(db, "users"), where("permission", "==", false));
const unsubscribe = onSnapshot(q, (querySnapshot) => {
    awaitSection.innerHTML = ""
    querySnapshot.forEach((doc) => {
        let newArticle = document.createElement("article");
        awaitSection.insertAdjacentElement("beforeend", newArticle)
        newArticle.classList.add("awaitSection__article")
        newArticle.innerHTML = `
            <div class="awaitSection__div">
                <p class="awaitSection__fullName">${doc.data().fullName}</p>
                <p class="awaitSection__email">${doc.data().email}</p>
                <p class="awaitSection__work">${doc.data().work}</p>
            </div>
            `
        let div = document.createElement("div")
        let rejectPermission = document.createElement("button")
        let acceptPermission = document.createElement("button")
        newArticle.insertAdjacentElement("beforeend", div)
        div.style.display = "flex"
        div.classList.add("acceptRejectDiv")
        div.insertAdjacentElement("beforeend", rejectPermission)
        div.insertAdjacentElement("beforeend", acceptPermission)
        rejectPermission.classList.add("awaitSection__reject")
        acceptPermission.classList.add("awaitSection__accept")
        rejectPermission.innerHTML = `<ion-icon name="close-outline"></ion-icon>`
        acceptPermission.innerHTML = `<ion-icon name="checkmark-outline"></ion-icon>`
        acceptPermission.onclick = function () {
            acptPermission(doc.data().email)
            if (doc.data().work == "Técnico") {
                addTecnicItem(doc.data().email)
            }
        }
    });
});

function loadItems() {
}
loadItems()

function addTecnicItem(email) {
    let items = {}
    let a = query(collection(db, "items"), where("active", "==", true));
    let unsubscribeItems = onSnapshot(a, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            items[doc.data().itemName] = { itemName: doc.data().itemName, itemImg: doc.data().itemImg, tecnicStock: 0, measure: doc.data().measure, itemValue: doc.data().itemValue }
        });
        Object.keys(items).forEach(element => {
            setDoc(doc(db, "tecnics", `${email}`), {
                permission: true
            });
            setDoc(doc(db, "tecnics", `${email}`, "stock", `${items[element].itemName}`), {
                itemName: items[element].itemName,
                itemImg: items[element].itemImg,
                itemValue: items[element].itemValue,
                measure: items[element].measure,
                tecnicStock: 0
            });
            verifyData(email)
        })
    });
}

function verifyData(email) {
    let unsub = onSnapshot(doc(db, "tecnics", `${email}`), (doc) => {
        console.log("Current data: ", doc.data());
    });
}