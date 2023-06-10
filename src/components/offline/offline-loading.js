let offline_window = document.getElementById("main__offline")


 function enable() {
    offline_window.style.display = "flex"
    setTimeout(() => {
        offline_window.style.transition = "0.5s"
        offline_window.style.opacity = "1"
    }, 500);
    window.addEventListener("online", disable())
}

function disable() {
    setTimeout(() => {
        offline_window.style.transition = "0.5s"
        offline_window.style.opacity = "0"
        setTimeout(() => {
            offline_window.style.display = "none"
        }, 500);
    }, 1000);
}


window.addEventListener("offline", enable())
window.addEventListener("load", disable())

