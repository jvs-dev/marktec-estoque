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
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();
let transfer = document.getElementById("transfer")
let acceptUser = document.getElementById("acceptUser")
let addItem = document.getElementById("addItem")
let closeTecnicItems = document.getElementById("closeTecnicItems")
let tecnicItemsSection = document.getElementById("tecnicItemsSection")
let tecnicFocus = ""


closeTecnicItems.onclick = function () {
    tecnicItemsSection.style.display = "none"
    tecnicFocus = ""
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
                    let tecnicsSection = document.getElementById("tecnicsSection")
                    tecnicsSection.innerHTML = ""
                    loadTecnics()
                } else {
                    if (doc.data().work == "Técnico") {
                        let body = document.querySelector("body")
                        body.innerHTML = "Você não pode acessar esta pagina"
                        window.location.href = "index.html"
                    } else {
                        transfer.style.display = "flex"
                        acceptUser.style.display = "none"
                        addItem.style.display = "none"
                        let tecnicsSection = document.getElementById("tecnicsSection")
                        tecnicsSection.innerHTML = ""
                        loadTecnics()
                    }
                }
            });
        }
    });
}

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
                    tecnicFocus = doc.data().email
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

async function loadTecnicItems(email) {
    let i = 0
    let tecnicItems = document.getElementById("tecnicItems")
    tecnicItems.innerHTML = ""
    let querySnapshot = await getDocs(collection(db, "tecnics", `${email}`, "stock"));
    querySnapshot.forEach((doc) => {
        if (doc.data().tecnicStock > 0) {
            let article = document.createElement("article")
            tecnicItems.insertAdjacentElement("beforeend", article)
            article.classList.add("tecnicItensCard")
            article.style.background = `var(--background-${i})`
            article.innerHTML = `
                <img class="tecnicItensCard__img" src="${doc.data().itemImg}" alt="Imagem do ${doc.data().itemName}">
                <div class="tecnicItensCard__div">
                    <p class="tecnicItensCard__p">${doc.data().itemName}</p>
                    <span class="tecnicItensCard__span">Possui: ${doc.data().tecnicStock} ${doc.data().measure}</span>
                </div>`
            switch (i) {
                case 0:
                    i = 1
                    break;
                default:
                    i = 0
                    break;
            }   
        }
    })
}


let e = query(collection(db, "users"), where("work", "==", "Técnico"));
let unsubscribed = onSnapshot(e, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
            loadData()
        }
    });
});

let q = query(collection(db, "items"), where("active", "==", true));
let unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
            console.log(tecnicFocus);
            if (tecnicFocus != "") {
                let tecnicItems = document.getElementById("tecnicItems")
                tecnicItems.innerHTML = ""
                loadTecnicItems(tecnicFocus)
            }
        }
    });
});

loadData()