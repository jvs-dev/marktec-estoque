let introduction = document.getElementById("main__introduction")
let introduction_bg = document.querySelector(".introduction__bg")

function disable() {

    setTimeout(() => {
        introduction.style.opacity = "0"
        setTimeout(() => {
            introduction.style.display = "none"
        }, 500);
    }, 3000);
}

window.addEventListener("load", disable())