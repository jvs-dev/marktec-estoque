let addImgBackground = document.querySelector(".addImgBackground")
let closeAddImg = document.getElementById("closeAddImg")
let addImgBtn = document.getElementById("addImgBtn")

addImgBtn.onclick = function () {
    addImgBackground.style.display = "flex"
    setTimeout(() => {
        addImgBackground.classList.add("active")
    }, 1);
}

closeAddImg.onclick = function () {
    addImgBackground.classList.remove("active")
    setTimeout(() => {
        addImgBackground.style.display = "none"
    }, 200);
}