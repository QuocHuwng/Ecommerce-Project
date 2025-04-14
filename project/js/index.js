/* slide */
const images = ["./img/anhIphone1.png", "./img/anhIphone2.png", "./img/Iphone Image.png", "./img/anhIphone3.png"];
let index = 0;
const imgElement = document.getElementById("slideshow");

function changeImage() {
    index = (index + 1) % images.length;
    imgElement.style.opacity = 0;
    setTimeout(() => {
        imgElement.src = images[index];
        imgElement.style.opacity = 1;
    }, 500);
}
setInterval(changeImage, 3000);