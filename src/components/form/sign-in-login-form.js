let swich = document.getElementById("swich")
let login_section = document.getElementById("login_section")
let signin_section = document.getElementById("signin_section")
let swich_section = document.getElementById("swich-section")
let swich__h2 = document.querySelector(".swich__h2")
let swich__p = document.querySelector(".swich__p")

swich.onclick = function () {
    if (signin_section.style.display == "flex") {
        login_section.style.display = "flex"
        signin_section.style.display = "none"
        swich__h2.textContent = "Bem-vindo de volta!"
        swich__p.textContent = "Você ainda não tem um cadastro? Cadastre-se agora mesmo."
        swich.textContent = "Cadastre-se"
    } else {
        login_section.style.display = "none"
        signin_section.style.display = "flex"
        swich__h2.textContent = "Olá, seja bem-vindo"
        swich__p.textContent = "Você já tem um conta conosco? Faça login agora mesmo."
        swich.textContent = "Entrar"
    }
}