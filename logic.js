let hiddenCanvas, displayCanvas;
let hiddenCtx, displayCtx;

let uploadedImage;

//Bool
let uploadComplete;

let pImgWidth, pImgHeight;

//Размер для А4
//MM_TO_PX = 2480px / 210mm (считая по ширине)
const MM_TO_PX = 2480 / 210;


document.addEventListener('DOMContentLoaded', function() {
    displayCanvas = document.getElementById("displayCanvas");
    displayCtx = displayCanvas.getContext("2d");

    hiddenCanvas = document.getElementById("hiddenCanvas");
    hiddenCtx = hiddenCanvas.getContext("2d");

    pImgWidth = document.getElementById("pImgWidth");
    pImgHeight = document.getElementById("pImgHeight");

    hiddenCanvas.width = 2480; // A4 width (300 DPI)
    hiddenCanvas.height = 3508; // A4 height (300 DPI)

    resizeDisplayCanvas();
    window.addEventListener("resize", resizeDisplayCanvas);
}, false);

function resizeDisplayCanvas() {
    const screenHeight = window.innerHeight;
    const aspectRatio = 2480 / 3508; 
    displayCanvas.height = screenHeight; 
    displayCanvas.width = screenHeight * aspectRatio;
}

window.addEventListener('load', function() {
    document.querySelector('input[type="file"]').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            uploadedImage = new Image();
            uploadComplete = false;
            
            uploadedImage.onload = function() {
                uploadComplete = true;
                document.querySelector("#uploadResult").src = uploadedImage.src;
                pImgWidth.innerHTML = uploadedImage.width;
                pImgHeight.innerHTML = uploadedImage.height;
            }

            uploadedImage.onerror = function() {
                console.error("Ошибка загрузки изображения.");
            }
            
            uploadedImage.src = URL.createObjectURL(this.files[0]); 
        }
    });
});

function fillCanvasWithImage() {
    if(uploadedImage == null)
    {
        alert("Необходимо загрузить изображение для размещения.");
        return;
    }

    if(uploadComplete == false)
    {
        alert("Импортирование изображения не завершено.");
        return;
    }

    // Получаем размеры в мм и переводим в пиксели
    const imgWidthMM = parseFloat(document.querySelector("#objectWidth").value);
    const imgHeightMM = parseFloat(document.querySelector("#objectHeight").value);

    if (isNaN(imgWidthMM) || isNaN(imgHeightMM) || imgWidthMM <= 0 || imgHeightMM <= 0) {
        alert("Некорректные размеры объекта.");
        return;
    }

    const imgWidthPX = Math.round(imgWidthMM * MM_TO_PX);
    const imgHeightPX = Math.round(imgHeightMM * MM_TO_PX);

    displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

    for (let y = 0; y + imgHeightPX < hiddenCanvas.height; y += imgHeightPX) {
        for (let x = 0; x + imgWidthPX < hiddenCanvas.width; x += imgWidthPX) {
            hiddenCtx.drawImage(uploadedImage, x, y, imgWidthPX, imgHeightPX);
        }
    }

    displayCtx.drawImage(hiddenCanvas, 0, 0, hiddenCanvas.width, hiddenCanvas.height, 
        0, 0, displayCanvas.width, displayCanvas.height);
}

function download(){
    var link = document.createElement('a');
    link.download = 'placeForPrintResult.png';
    link.href = hiddenCanvas.toDataURL()
    link.click();
}

//TODO: Сделать отступы
//TODO: Сделать оптимальное размещение прямоугольных объектов
//TODO: Сделать размещение прямоугольных объектов с возможностью повернуть один раз на 90 градусов
//TODO: Сделать разные форматы листа на котором будут располагаться объекты