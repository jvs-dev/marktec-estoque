let offline_window = document.getElementById("main__offline")

function enable() {

    offline_window.style.display = "flex"
}

function disable() {
    offline_window.style.display = "none"
}


window.addEventListener("offline", enable())
window.addEventListener("online", disable())

