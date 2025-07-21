/*Using this const to be able to calculate the current path and href*/
const DEFAULTPATHNAME = "/%7Bthis.html%7D";

/*Alert types*/
const ALERT = {
    success: "success",
    info: "info",
    danger: "danger"
}
const DATEFORMAT = "DD.MM.YYYY";

/*Default backend entries*/
const MENUTYPE = {
    food: "food",
    beverage: "beverage"
}
const GENDER = {
    male: "male",
    female: "female"
}

var backend = {
    user: {
        username: null
    },
    sales: [],
    employees: [
        { name: "Idris Elba", title: "Hoved kokk", gender: GENDER.male, birthday: "16.07.1964", employedDate: "27.04.1994", address: "Alkeveien 121", phoneNumber: 489247339, email: "idriselba@gmail.com" },
        { name: "Blake Lively", title: "Kokk", gender: GENDER.female, birthday: "30.09.1984", employedDate: "07.04.2000", address: "Stenbekkveien 135", phoneNumber: 49378874, email: "blakelively@gmail.com" },
        { name: "Nathalie Emmanuel", title: "Leveringsperson", gender: GENDER.female, birthday: "06.11.1995", employedDate: "14.01.2015", address: "Andreas Kiønigs veg 138", phoneNumber: 96149588, email: "nathalieemmanuel@gmail.com" },
        { name: "Matt Leblanc", title: "Kokk", gender: GENDER.male, birthday: "30.05.1995", employedDate: "02.04.2014", address: "Kløvervegen 105", phoneNumber: 45014383, email: "mattleblanc@gmail.com" },
        { name: "Liam Hemsworth", title: "Leveringsperson", gender: GENDER.male, birthday: "30.01.2001", employedDate: "26.08.2020", address: "Seilmakergata 99", phoneNumber: 47468998, email: "liamhemsworth@gmail.com" },
        { name: "Miley Cyrus", title: "Kokk", gender: GENDER.female, birthday: "08.09.1993", employedDate: "19.07.2019", address: "Kongsveien 247", phoneNumber: 96695655, email: "mileycyrus@gmail.com" },
        { name: "Ben Dover Mike Hawk", title: "Leveringsperson", gender: GENDER.male, birthday: "06.06.2006", employedDate: "20.20.2021", address: "Akerbrygge kola 22", phoneNumber: 13371337, email: "mikehawk1337@protonmail.com" }
    ],
    restaurants: [
        { name: "Gyldne Pizza Alnabru", address: "Claude Monets alle 24, 1338 Sandvika", openingHours: "11:00 - 22:00 (Man-Fre), 15:00-20:00 (Lør)" },
        { name: "Gyldne Pizza Stovner", address: "Rådmann Halmrasts vei 7, 1337 Sandvika", openingHours: "15:00 - 22:00 (Man-Fre), 15:00-20:00 (Lør)" },
        { name: "Gyldne Pizza Strømmen", address: "Slependveien 58, 1341 Sandvika", openingHours: "12:00 - 20:00 (Man-Fre), 15:00-20:00 (Lør)" },
        { name: "Gyldne Pizza Stavanger", address: "Kirkeveien 85, 1334 Haslum", openingHours: "11:00 - 22:00 (Man-Fre), 15:00-20:00 (Lør)" }
    ],
    menu: [
        { type: MENUTYPE.food, name: "Gyldne Pizza spesial", price: 205, description:"Rød paprika, grønn paprika, ruccula, sort oliven, rødløk med trippel ost." },
        { type: MENUTYPE.food, name: "Pepperoni Pizza", price: 195, description:"Pepperoni cheddar og mozarella ost. Servers med rømmedressing." },
        { type: MENUTYPE.food, name: "Ham Pizza spesial", price: 199, description:"Rød paprika, grønn paprika, ruccula, sort oliven, rødløk med trippel ost." },
        { type: MENUTYPE.food, name: "Vegatar Pizza", price: 189, description:"Ham, basilikum, tomat , sjampinon, sorte oliven og mozarella ost." },
        { type: MENUTYPE.food, name: "Garanter fornøyd Pizza", price: 199, description:"Pepperoni, basilikum, tomat , sjampinon, sorte oliven og mozarella ost." },
        { type: MENUTYPE.food, name: "Gyldne giga pizza", price: 195, description:"Kylling, cheddar og mozarella ost. Servers med rømmedressing." },
        { type: MENUTYPE.beverage, name: "Coca Cola", price: 45, description:"Cola med isbiter og sugerør." },
        { type: MENUTYPE.beverage, name: "Pepsi max", price: 45, description:"Pepsi max med isbiter og sugerør." },
        { type: MENUTYPE.beverage, name: "Sanpellegrino vann", price: 45, description:"Sanpellegrino vann med isbiter og sugerør." },
        { type: MENUTYPE.beverage, name: "Schweppes vann", price: 45, description:"Schweppes vann med isbiter og sugerør." },
        { type: MENUTYPE.beverage, name: "Daniel Dampt Chablis 2015", price: 159, description:"Hvitvin av grønt eple, sjøvann, krydder." },
        { type: MENUTYPE.beverage, name: "Falling Feather Ruby Cabernet 2019", price: 199, description:"Rødvin av røde skogsbær, krydder og lakris." }
    ],
}

/*Running these functions instantly*/
loadBackend(); //loads backend from storage
checkAuth(); //redirects to login page if is not logged in :)

/*Event functions*/
window.addEventListener("load", bindEvents);

function bindEvents() {
    let navToggleElement = document.getElementsByClassName("nav-toggle")[0];

    if (navToggleElement !== undefined) {
        navToggleElement.addEventListener("click", navToggle);
    }

    let signoutElement = document.getElementById("signout");

    if (signoutElement !== null) {
        signoutElement.onclick = signout;
    }
}

/*Fake backend functions (storage functions)*/
function loadBackend() {
    let savedItem = localStorage.getItem("backend");

    if (savedItem !== null) {
        window["backend"] = JSON.parse(savedItem);
    }
}

function saveBackend() {
    localStorage.setItem("backend", JSON.stringify(backend));
}

/*Helper functions*/
function getPathname() {
    let baseHref = document.getElementById("urlReference").href.split(DEFAULTPATHNAME)[0];
    let pathName = location.href.replace(baseHref, "");

    return pathName;
}

function redirectTo(resource) {
    location.href = document.getElementById("urlReference").href.split(DEFAULTPATHNAME)[0] + resource;
}

/*Auth functions*/
function checkAuth() {
    if (backend.user.username === null && getPathname() !== "/index.html") {
        redirectTo("/index.html");
    } else {
        document.getElementById("username").innerText = backend.user.username;
    }
}

function signout() {
    backend.user.username = null;
    saveBackend();
    checkAuth(); //Redirect to login page
}

/*Alert functions*/
function alert(type, text, displayDuration) {
    var alertTemplate = document.getElementById("template-alert");
    var clone = alertTemplate.content.cloneNode(true).children[0];
    var css = "alert-" + type;
    clone.classList.add(css)
    clone.children[0].innerText = text;
    clone.children[1].onclick = alertClose;

    document.getElementsByClassName("alert-container")[0].appendChild(clone);

    if (displayDuration === undefined) {
        displayDuration = 3000;
    }

    setTimeout(function () {
        clone.classList.add("fade-out");

        setTimeout(function() {
            clone.remove();
        }, 500);
    }, displayDuration);
}

function alertClose() {
    var parent = this.parentElement;
    parent.classList.add("fade-out");

    setTimeout(function () {
        parent.remove();
    }, 500)
}


/*Navigation functions*/
function navToggle() {
    var nav = document.getElementsByTagName("nav")[0];

    if (nav.classList.contains("hide")) {
        showNav();
    } else {
        hideNav();
    }
}

function showNav() {
    document.getElementsByTagName("nav")[0].classList.remove("hide");;
    document.getElementsByClassName("nav-toggle")[0].children[0].setAttribute("class", "fas fa-caret-left");
}

function hideNav() {
    document.getElementsByTagName("nav")[0].classList.add("hide");;
    document.getElementsByClassName("nav-toggle")[0].children[0].setAttribute("class", "fas fa-caret-right");
}


/*Modal functions*/
function updateModal(settings) {
    let modalWrapper = document.getElementsByClassName('modal-wrapper')[0];
    let modal = modalWrapper.children[0];
    let titleElement = modal.children[0].children[0];
    let bodyElement = modal.children[1];
    let yesElement = modal.children[2].children[0];
    let noElement = modal.children[2].children[1];

    titleElement.innerText = settings.title;
    bodyElement.innerHTML = settings.body;
    
    yesElement.onclick = settings.yes;
    noElement.onclick = resetModal;

    modalWrapper.classList.add("show");
}

function resetModal() {
    let modalWrapper = document.getElementsByClassName('modal-wrapper')[0];
    let modal = modalWrapper.children[0];
    let titleElement = modal.children[0].children[0];
    let bodyElement = modal.children[1];
    let yesElement = modal.children[2].children[0];
    let noElement = modal.children[2].children[1];

    titleElement.innerText = "";
    bodyElement.innerHTML = "";
    yesElement.onclick = null;
    yesElement.disabled = false;

    modalWrapper.classList.remove("show");
}