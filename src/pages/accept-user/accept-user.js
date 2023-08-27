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

let transfer = document.getElementById("transfer")
let acceptUser = document.getElementById("acceptUser")
let addItem = document.getElementById("addItem")
let createAccount = document.getElementById("createAccount")
let helpSignin = document.getElementById("helpSignin")
let showSignIn = document.getElementById("showSignIn")
let actualUserEmail = ""
let actualUserName = ""
let actualUserWork = ""
let actualUserPermission = false
let cancelEditUserTime = document.getElementById("cancelEditUserTime")
let deleteUserCancel = document.getElementById("deleteUserCancel")

cancelEditUserTime.onclick = function () {
    let editUserTimeSecion = document.getElementById("editUserTimeSecion")
    editUserTimeSecion.style.opacity = "0"
    setTimeout(() => {
        editUserTimeSecion.style.display = "none"
    }, 200);
}

deleteUserCancel.onclick = function () {
    let deleteUserSecion = document.getElementById("deleteUserSecion")
    deleteUserSecion.style.opacity = "0"
    setTimeout(() => {
        deleteUserSecion.style.display = "none"
    }, 200);
}




function loadData() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            actualUserEmail = user.email
            let unsub = onSnapshot(doc(db, `users`, `${user.email}`), (doc) => {
                actualUserWork = doc.data().work
                actualUserName = doc.data().fullName
                if (doc.data().admin == true) {
                    transfer.style.display = "none"
                    acceptUser.style.display = "flex"
                    addItem.style.display = "flex"
                    loadUsersCards()
                } else {
                    if (doc.data().createAccountPermission != true) {
                        let body = document.querySelector("body")
                        body.innerHTML = ""
                        window.location.href = "index.html"
                    } else {
                        actualUserPermission = true
                        loadUsersCards()
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
    if (actualUserPermission == true || actualUserWork == "Administrador") {
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
        type: "created account",
        hours: hours,
        date: date,
        createdEmail: email,
        createdName: fullName,
        userName: actualUserName,
        userEmail: actualUserEmail,
        userWork: actualUserWork,
        timestamp: serverTimestamp()
    });
    if (work == "Estoquista") {
        await setDoc(doc(db, "users", `${email.toLowerCase()}`), {
            email: `${email.toLowerCase()}`,
            fullName: `${fullName}`,
            work: `${work}`,
            photo: `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`,
            permission: true,
            createAccountPermission: createAccountPermission,
            temporaryPassword: password,
            initTime: `${initTime}`,
            finalTime: `${finalTime}`
        });
        verifyaccount(email.toLowerCase())
    }
    if (work == "Técnico") {
        addTecnicItem(email.toLowerCase())
        await setDoc(doc(db, "users", `${email.toLowerCase()}`), {
            email: `${email.toLowerCase()}`,
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
        await setDoc(doc(db, "users", `${email.toLowerCase()}`), {
            email: `${email.toLowerCase()}`,
            fullName: `${fullName}`,
            work: `${work}`,
            photo: `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`,
            permission: true,
            admin: true,
            temporaryPassword: password
        });
        verifyaccount(email.toLowerCase())
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



async function loadUsersCards() {
    let i = 0
    let querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
        if (doc.data().deletedAccount != true) {
            let viewAddedUsers = document.getElementById("viewAddedUsers")
            let article = document.createElement("article")
            viewAddedUsers.insertAdjacentElement("beforeend", article)
            article.classList.add("viewAddedUsers__card")
            article.innerHTML = `
                <img class="viewAddedUsers__img" src="${doc.data().photo}" alt="">
                <div class="viewAddedUsers__div">
                    <p class="viewAddedUsers__email">${doc.data().email}</p>
                    <p class="viewAddedUsers__name">${doc.data().fullName}</p>
                    <p class="viewAddedUsers__work">${doc.data().work}</p>
                    <div class="viewAddedUsers__divBtn" id="divBtn${i}">
                    </div>
                </div>`
            if (doc.data().work == "Administrador") {
                if (actualUserWork == "Administrador") {
                    let divBtn = document.getElementById(`divBtn${i}`)
                    let deleteUserData = document.createElement("button")
                    divBtn.insertAdjacentElement("beforeend", deleteUserData)
                    deleteUserData.innerHTML = `<i class="bi bi-trash3"></i>`
                    deleteUserData.classList.add("viewAddedUsers__btn")
                    deleteUserData.id = "deleteUserData"
                    deleteUserData.onclick = function () {
                        let deleteUserSecion = document.getElementById("deleteUserSecion")
                        let deleteUserText = document.getElementById("deleteUserText")
                        let deleteUserConfirm = document.getElementById("deleteUserConfirm")
                        deleteUserText.innerHTML = `Você tem certeza que deseja apagar a conta de <strong>${doc.data().fullName}</strong> Permanentemente?<br>Esta ação não pode ser revertida futuramente.`
                        deleteUserSecion.style.display = "flex"
                        setTimeout(() => {
                            deleteUserSecion.style.opacity = "1"
                        }, 1);
                        deleteUserConfirm.onclick = function () {
                            if (doc.data().email != actualUserEmail) {
                                deleteUserFct(doc.data().email, doc.data().work, doc.data().fullName)
                            } else {
                                let deleteUserAlert = document.getElementById("deleteUserAlert")
                                deleteUserAlert.textContent = "Você não pode deletar sua própria conta."
                                deleteUserAlert.style.color = "#f00"
                                deleteUserAlert.style.opacity = "1"
                                setTimeout(() => {
                                    deleteUserAlert.style.opacity = "0"
                                    deleteUserAlert.textContent = ""
                                }, 5000);
                            }
                        }
                    }
                }
            } else {
                let divBtn = document.getElementById(`divBtn${i}`)
                let editUserDataTime = document.createElement("button")
                let deleteUserData = document.createElement("button")
                divBtn.insertAdjacentElement("beforeend", editUserDataTime)
                divBtn.insertAdjacentElement("beforeend", deleteUserData)
                editUserDataTime.innerHTML = `<i class="bi bi-hourglass-split"></i></i>`
                deleteUserData.innerHTML = `<i class="bi bi-trash3"></i>`
                editUserDataTime.classList.add("viewAddedUsers__btn")
                deleteUserData.classList.add("viewAddedUsers__btn")
                editUserDataTime.id = "editUserDataTime"
                deleteUserData.id = "deleteUserData"
                deleteUserData.onclick = function () {
                    let deleteUserSecion = document.getElementById("deleteUserSecion")
                    let deleteUserText = document.getElementById("deleteUserText")
                    let deleteUserConfirm = document.getElementById("deleteUserConfirm")
                    deleteUserText.innerHTML = `Você tem certeza que deseja apagar a conta de <strong>${doc.data().fullName}</strong> Permanentemente?<br>Esta ação não pode ser revertida futuramente.`
                    deleteUserSecion.style.display = "flex"
                    setTimeout(() => {
                        deleteUserSecion.style.opacity = "1"
                    }, 1);
                    deleteUserConfirm.onclick = function () {
                        if (doc.data().email != actualUserEmail) {
                            deleteUserFct(doc.data().email, doc.data().work, doc.data().fullName)
                        } else {
                            let deleteUserAlert = document.getElementById("deleteUserAlert")
                            deleteUserAlert.textContent = "Você não pode deletar sua própria conta."
                            deleteUserAlert.style.color = "#f00"
                            deleteUserAlert.style.opacity = "1"
                            setTimeout(() => {
                                deleteUserAlert.style.opacity = "0"
                                deleteUserAlert.textContent = ""
                            }, 5000);
                        }
                    }
                }
                editUserDataTime.onclick = function () {
                    let editUserTimeSecion = document.getElementById("editUserTimeSecion")
                    editUserTimeSecion.style.display = "flex"
                    setTimeout(() => {
                        editUserTimeSecion.style.opacity = "1"
                    }, 1);
                    let confirmEditUserTime = document.getElementById("confirmEditUserTime")
                    confirmEditUserTime.onclick = function () {
                        let editInitTime = document.getElementById("editInitTime").value
                        let editFinalTime = document.getElementById("editFinalTime").value
                        if (editInitTime != "" && editFinalTime != "") {
                            if (doc.data().email != actualUserEmail) {
                                editUserHour(doc.data().email, doc.data().fullName, doc.data().photo, doc.data().work, doc.data().permission, editInitTime, editFinalTime)
                            } else {
                                let editUserTimeAlert = document.getElementById("editUserTimeAlert")
                                editUserTimeAlert.innerHTML = "Você não pode editar sua própria conta."
                                editUserTimeAlert.style.color = "#f00"
                                editUserTimeAlert.style.display = "flex"
                                setTimeout(() => {
                                    editUserTimeAlert.style.display = "none"
                                }, 10000);
                            }
                        } else {
                            let editUserTimeAlert = document.getElementById("editUserTimeAlert")
                            editUserTimeAlert.innerHTML = "Preencha todos os campos para continuar."
                            editUserTimeAlert.style.color = "#f00"
                            editUserTimeAlert.style.display = "flex"
                            setTimeout(() => {
                                editUserTimeAlert.style.display = "none"
                            }, 10000);
                        }
                    }
                }
            }
            i++
        }
    });
}



async function editUserHour(email, fullName, photo, work, permission, initTime, finalTime) {
    await setDoc(doc(db, "users", `${email}`), {
        email: `${email}`,
        finalTime: `${finalTime}`,
        fullName: `${fullName}`,
        initTime: `${initTime}`,
        permission: permission,
        photo: `${photo}`,
        work: `${work}`,
    });
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
        type: "update accountHour",
        initTime: `${initTime}`,
        finalTime: `${finalTime}`,
        hours: hours,
        date: date,
        updatedEmail: email,
        updatedName: fullName,
        userName: actualUserName,
        userEmail: actualUserEmail,
        userWork: actualUserWork,
        timestamp: serverTimestamp()
    });
    clearInput()
}


function clearInput() {
    let editInitTime = document.getElementById("editInitTime")
    let editFinalTime = document.getElementById("editFinalTime")
    editFinalTime.value = ""
    editInitTime.value = ""
    let editUserTimeAlert = document.getElementById("editUserTimeAlert")
    editUserTimeAlert.style.display = "flex"
    editUserTimeAlert.innerHTML = "Hórario atualizado com sucesso."
    editUserTimeAlert.style.color = "#0f0"
    setTimeout(() => {
        editUserTimeAlert.style.display = "none"
    }, 8000);
}



async function deleteUserFct(email, work, fullName) {
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
        type: "deleted account",
        hours: hours,
        date: date,
        deletedEmail: email,
        deletedName: fullName,
        userName: actualUserName,
        userEmail: actualUserEmail,
        userWork: actualUserWork,
        timestamp: serverTimestamp()
    });
    if (work != "Técnico") {
        await setDoc(doc(db, "users", `${email}`), {
            deletedAccount: true,
        });
        let deleteUserAlert = document.getElementById("deleteUserAlert")
        let deleteUserSecion = document.getElementById("deleteUserSecion")
        deleteUserAlert.textContent = "Conta deletada com sucesso."
        deleteUserAlert.style.color = "#0f0"
        deleteUserAlert.style.opacity = "1"
        deleteUserSecion.style.opacity = "0"
        setTimeout(() => {
            deleteUserSecion.style.display = "none"
            deleteUserAlert.style.opacity = "0"
        }, 200);
    } else {
        await setDoc(doc(db, "users", `${email}`), {
            deletedAccount: true,
        });
        let querySnapshot = await getDocs(collection(db, "tecnics", `${email}`, "stock"));
        querySnapshot.forEach((doc) => {
            deleteTecnicItens(email, doc.id)
        });
        await deleteDoc(doc(db, "tecnics", `${email}`));
        let deleteUserAlert = document.getElementById("deleteUserAlert")
        let deleteUserSecion = document.getElementById("deleteUserSecion")
        deleteUserAlert.textContent = "Conta deletada com sucesso."
        deleteUserAlert.style.color = "#0f0"
        deleteUserAlert.style.opacity = "1"
        deleteUserSecion.style.opacity = "0"
        setTimeout(() => {
            deleteUserSecion.style.display = "none"
            deleteUserAlert.style.opacity = "0"
        }, 200);
    }
}

async function deleteTecnicItens(email, itemName) {
    await deleteDoc(doc(db, "tecnics", `${email}`, "stock", `${itemName}`));
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

let q = query(collection(db, "users"), where("permission", "!=", ""));
let unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            if (actualUserPermission == true || actualUserWork == "Administrador") {
                let viewAddedUsers = document.getElementById("viewAddedUsers")
                viewAddedUsers.innerHTML = ""
                loadUsersCards()
            }
        }
        if (change.type === "modified") {
            if (actualUserPermission == true || actualUserWork == "Administrador") {
                let viewAddedUsers = document.getElementById("viewAddedUsers")
                viewAddedUsers.innerHTML = ""
                loadUsersCards()
            }
        }
        if (change.type === "removed") {
            if (actualUserPermission == true || actualUserWork == "Administrador") {
                let viewAddedUsers = document.getElementById("viewAddedUsers")
                viewAddedUsers.innerHTML = ""
                loadUsersCards()
            }
        }
    });
});

loadData()