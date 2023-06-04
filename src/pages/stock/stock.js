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
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();
let transfer = document.getElementById("transfer")
let acceptUser = document.getElementById("acceptUser")
let addItem = document.getElementById("addItem")

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
                    transfer.style.display = "flex"
                    acceptUser.style.display = "none"
                    addItem.style.display = "none"
                }
            });
        }
    });
}

loadData()

async function loadItems() {
    let q = query(collection(db, "items"), where("active", "==", true));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let stockSection = document.getElementById("stockSection")
            let article = document.createElement("article")
            stockSection.insertAdjacentElement("beforeend", article)
            article.classList.add("card__stock")
            if (Number(doc.data().inStock) + doc.data().withTecnics < doc.data().quantyMin) {
                article.classList.add("lowStock")
            }
            article.innerHTML = `
            <img src="${doc.data().itemImg}" alt="" class="card__img">
            <div class="card__div--1">
                <h2 class="card__h2">${doc.data().itemName}</h2>
                <div class="card__div--2">
                    <span class="card__span">Em estoque: ${Number(doc.data().inStock)}</span>
                    <span class="card__span">Com técnicos: ${doc.data().withTecnics}</span>
                    <span class="card__span">Total: ${Number(doc.data().inStock) + doc.data().withTecnics}</span>
                </div>
            </div>`
        });
    });

}

loadItems()


