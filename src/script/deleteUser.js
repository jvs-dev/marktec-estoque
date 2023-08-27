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
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, sendPasswordResetEmail, signOut, signInWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, deleteDoc, setDoc, onSnapshot, query, where, updateDoc, getDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();


function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                if (doc.data().deletedAccount == true) {
                    deleteActualUser(user.email)
                }
            });
        }
    });
}


async function deleteActualUser(email) {
    let user = auth.currentUser;
    deleteUser(user).then(() => {
    }).catch((error) => {
    });
    await deleteDoc(doc(db, "users", `${email}`));
    setTimeout(() => {
        window.location.href = "index.html"
    }, 1000);
}

loadData()