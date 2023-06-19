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
let closeTecnicItems = document.getElementById("closeTecnicItems")
let tecnicItemsSection = document.getElementById("tecnicItemsSection")


closeTecnicItems.onclick = function () {
    tecnicItemsSection.style.display = "none"
}


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
                    if (doc.data().work == "Técnico") {
                        let body = document.querySelector("body")
                        body.innerHTML = "Você não pode acessar esta pagina"
                        window.location.href = "index.html"
                    } else {
                        transfer.style.display = "flex"
                        acceptUser.style.display = "none"
                        addItem.style.display = "none"
                    }
                }
            });
        }
    });
}

loadData()

function loadTecnics() {
    let q = query(collection(db, "users"), where("work", "==", "Técnico"));
    let unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().permission == true) {
                let tecnicsSection = document.getElementById("tecnicsSection")
                let article = document.createElement("article")
                tecnicsSection.insertAdjacentElement("beforeend", article)
                article.classList.add("article__tecnic--card")
                article.innerHTML = `
                    <img src="${doc.data().photo}" alt="" class="tecnic__img">
                    <p class="tecnic__p">${doc.data().fullName}</p>`
                article.onclick = function () {
                    let TecnicImg = document.getElementById("TecnicImg")
                    let TecnicName = document.getElementById("TecnicName")
                    TecnicName.textContent = doc.data().fullName
                    tecnicItemsSection.style.display = "flex"
                    TecnicImg.src = doc.data().photo
                    loadTecnicItems(doc.data().email)
                }
            }
        });
    });

}

loadTecnics()

function loadTecnicItems(email) {
    let tecnicItems = document.getElementById("tecnicItems")
    tecnicItems.innerHTML = ""
    let unsub = onSnapshot(doc(db, "tecnics", `${email}`), (doc) => {
        doc.data().items.forEach(Element => {
            let article = document.createElement("article")
            tecnicItems.insertAdjacentElement("beforeend", article)
            article.classList.add("tecnicItensCard")
            article.innerHTML = `
            <img class="tecnicItensCard__img" src="${Element.itemImg}" alt="Imagem do ${Element.itemName}">
            <div class="tecnicItensCard__div">
                <p class="tecnicItensCard__p">${Element.itemName}</p>
                <span class="tecnicItensCard__span">Possui: ${Element.tecnicStock} ${Element.measure}</span>
            </div>`
            if (Element.tecnicStock > 0) {
                article.style.order = "-1"
            }
        })
    });


}