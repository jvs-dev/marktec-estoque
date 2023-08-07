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
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, sendPasswordResetEmail, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, query, where, updateDoc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
const db = getFirestore(app);
const auth = getAuth();

let transfer = document.getElementById("transfer")
let acceptUser = document.getElementById("acceptUser")
let addItem = document.getElementById("addItem")
let createAccount = document.getElementById("createAccount")
let helpSignin = document.getElementById("helpSignin")
let showSignIn = document.getElementById("showSignIn")
let actualUserEmail = ""
let actualUserName = ""
let actualUserPermission = false


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
                    if (doc.data().createAccountPermission != true) {
                        let body = document.querySelector("body")
                        body.innerHTML = ""
                        window.location.href = "index.html"
                    } else {
                        actualUserPermission = true
                    }
                }
            });
            disable()
        }
    });
}


showSignIn.onclick = function () {
    let password = document.getElementById("password")
    if (password.type != "text") {
        password.type = "text"
        showSignIn.name = "eye-off-outline"
    } else {
        password.type = "password"
        showSignIn.name = "eye-outline"
    }
}


createAccount.onclick = function () {
    if (actualUserPermission == true) {
        createAccount.innerHTML = `
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
        createAccount.classList.add("loading")
        let email = document.getElementById("email").value
        let password = document.getElementById("password").value
        let work = document.getElementById("work").value
        let fullName = document.getElementById("fullName").value
        let cbxPermission = document.getElementById("cbxPermission").checked;
        let initTime = document.getElementById("initTime").value
        let finalTime = document.getElementById("finalTime").value
        if (email != "" && password != "" && work != "" && fullName != "") {
            if (password.length > 7) {
                if (work != "Administrador") {
                    if (initTime != "" && finalTime != "") {
                        createUser(email, password, fullName, work, cbxPermission, initTime, finalTime)
                    } else {
                        helpSignin.style.color = "red"
                        helpSignin.textContent = "Por favor, preencha os campos para continuar."
                        createAccount.innerHTML = `CRIAR CONTA`
                        createAccount.classList.remove("loading")
                        setTimeout(() => {
                            helpSignin.textContent = ""
                        }, 10000);
                    }
                } else {
                    createUser(email, password, fullName, work, cbxPermission, initTime, finalTime)
                }
            } else {
                helpSignin.style.color = "red"
                helpSignin.textContent = "A senha deve ter no mínimo 8 caractéres."
                createAccount.innerHTML = `CRIAR CONTA`
                createAccount.classList.remove("loading")
                setTimeout(() => {
                    helpSignin.textContent = ""
                }, 10000);
            }
        } else {
            helpSignin.style.color = "red"
            helpSignin.textContent = "Por favor, preencha os campos para continuar."
            createAccount.innerHTML = `CRIAR CONTA`
            createAccount.classList.remove("loading")
            setTimeout(() => {
                helpSignin.textContent = ""
            }, 10000);
        }
    }
}

async function createUser(email, password, fullName, work, createAccountPermission, initTime, finalTime) {
    let docRef = doc(db, "users", `${email}`);
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        helpSignin.style.color = "red"
        helpSignin.textContent = "Conta já existente."
        createAccount.innerHTML = `CRIAR CONTA`
        createAccount.classList.remove("loading")
        setTimeout(() => {
            helpSignin.textContent = ""
        }, 10000);
    } else {
        setDocsAccount(email, fullName, work, createAccountPermission, password, initTime, finalTime) //colocar input de hora e criar conta ao fazer login
    }
}

async function setDocsAccount(email, fullName, work, createAccountPermission, password, initTime, finalTime) {
    if (work == "Estoquista") {
        await setDoc(doc(db, "users", `${email}`), {
            email: `${email}`,
            fullName: `${fullName}`,
            work: `${work}`,
            photo: `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`,
            permission: true,
            createAccountPermission: createAccountPermission,
            temporaryPassword: password,
            initTime: `${initTime}`,
            finalTime: `${finalTime}`
        });
        verifyaccount(email)
    }
    if (work == "Técnico") {
        addTecnicItem(email)
        await setDoc(doc(db, "users", `${email}`), {
            email: `${email}`,
            fullName: `${fullName}`,
            work: `${work}`,
            photo: `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`,
            permission: true,
            temporaryPassword: password,
            initTime: `${initTime}`,
            finalTime: `${finalTime}`
        });
    }
    if (work == "Administrador") {
        await setDoc(doc(db, "users", `${email}`), {
            email: `${email}`,
            fullName: `${fullName}`,
            work: `${work}`,
            photo: `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`,
            permission: true,
            admin: true,
            temporaryPassword: password
        });
        verifyaccount(email)
    }
}

function verifyaccount(email) {
    let unsub = onSnapshot(doc(db, "users", `${email}`), (doc) => {
        helpSignin.style.color = "#0f0"
        helpSignin.textContent = "Conta criada com sucesso."
        let email = document.getElementById("email").value = ""
        let password = document.getElementById("password").value = ""
        let fullName = document.getElementById("fullName").value = ""
        let initTime = document.getElementById("initTime").value = ""
        let finalTime = document.getElementById("finalTime").value = ""
        createAccount.innerHTML = `CRIAR CONTA`
        createAccount.classList.remove("loading")
    });
}



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
        verifyaccount(email)
    });
}




setInterval(() => {
    let createAccountPermissionDiv = document.getElementById("createAccountPermissionDiv")
    let work = document.getElementById("work").value
    if (work == "Estoquista") {
        createAccountPermissionDiv.style.display = "flex"
    } else {
        createAccountPermissionDiv.style.display = "none"
    }
}, 500);

setInterval(() => {
    let divDefineTime = document.getElementById("divDefineTime")
    let work = document.getElementById("work").value
    if (work != "Administrador") {
        divDefineTime.style.display = "flex"
    } else {
        divDefineTime.style.display = "none"
    }
}, 500);



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



loadData()