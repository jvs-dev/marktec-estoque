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


//
//

function loadRequests() {
    let q = query(collection(db, "transfers"), where("status", "!=", ``));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let historicSection = document.getElementById("historicSection")
            let article = document.createElement("article")
            historicSection.insertAdjacentElement("afterbegin", article)
            article.classList.add("historicCard")
            article.innerHTML = `
                <div class="historicCard__div--1">
                    <p class="historicCard__name">${doc.data().senderName}</p>
                    <ion-icon class="historicCard__icon" name="send-outline"></ion-icon>
                    <p class="historicCard__name">${doc.data().reciverName}</p>
                </div>
                <div class="historicCard__div--2">
                    <img class="historicCard__itemImg" src="${doc.data().itemImg}" alt="">
                    <div class="historicCard__div--3">
                        <p class="historicCard__itemName">${doc.data().itemName}</p>
                        <p class="historicCard__measure">Transferido: ${doc.data().quanty} ${doc.data().measure}</p>
                    </div>
                </div>
                <div class="historicCard__div--1">
                    <p class="historicCard__status" style="color: ${returnColor(doc.data().status)};">${doc.data().status}</p>
                    <p class="historicCard__motive">${doc.data().motive}</p>
                    <p class="historicCard__date">${doc.data().date}</p>
                </div>`
        })
    })
}

function returnColor(status) {
    switch (status) {
        case "pendente":
            return "var(--orange)"
            break;
        case "aceito":
            return "var(--green)"
            break;
        case "recusado":
            return "#f00"
            break;
    }
}

loadRequests()