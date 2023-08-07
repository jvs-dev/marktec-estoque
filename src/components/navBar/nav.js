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
let acceptUser = document.getElementById("acceptUser")
let transfer = document.getElementById("transfer")
let tecnics = document.getElementById("tecnics")
const q = query(collection(db, "users"), where("permission", "==", false));

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
                    if (doc.data().work == "Estoquista") {
                        if (doc.data().createAccountPermission == true) {
                            addItem.style.display = "flex"
                            acceptUser.style.display = "flex"
                            loadRequests(user.email)
                        } else {
                            acceptUser.style.display = "none"
                            addItem.style.display = "flex"
                            loadRequests(user.email)
                        }
                    } else {
                        transfer.style.display = "flex"
                        acceptUser.style.display = "none"
                        addItem.style.display = "none"
                        tecnics.style.display = "none"
                        tecnics.innerHTML = ""
                        tecnics.href = "#"
                        loadRequests(user.email)
                    }
                }
            });
        }
    });
}

function loadRequests(actualUser) {
    if (window.location.pathname != "/transfer.html") {
        let q = query(collection(db, "transfers"), where("reciverEmail", "==", `${actualUser}`));
        let unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().status == "Pendente") {
                    transfer.classList.add("awaiting")
                }
            })
        })
    }
}

loadData()