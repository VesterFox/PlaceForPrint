let hiddenCanvas, displayCanvas;
let hiddenCtx, displayCtx;

let uploadedImage;

//Bool
let uploadComplete;

let pImgWidth, pImgHeight;
let imgWidthPX, imgHeightPX;
let imgWidthMM, imgHeightMM;

//Bool
let keepAspectRatio = true;

//Размер для А4
//MM_TO_PX = 2480px / 210mm (считая по ширине)
const MM_TO_PX = 2480 / 210;

function updAspectRatio(){
    keepAspectRatio = document.getElementById("aspectRatioCheck").value;
}

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

                imgWidthMM = parseInt(document.querySelector("#objectWidth").value);
                imgHeightMM = parseInt(document.querySelector("#objectHeight").value);

                updResolutionOutput()
            }

            uploadedImage.onerror = function() {
                console.error("Ошибка загрузки изображения.");
            }
            
            uploadedImage.src = URL.createObjectURL(this.files[0]); 
        }
    });
});

function changeOffset() {
    if(uploadedImage == null)
    {
        return;
    }

    fillCanvasWithImage();
}

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

    if (isNaN(imgWidthMM) || isNaN(imgHeightMM) || imgWidthMM <= 0 || imgHeightMM <= 0) {
        alert("Некорректные размеры объекта.");
        return;
    }

    displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    
    updResolutionOutput();

    let verOffset = parseInt(document.querySelector("#verOffset").value);
    let horOffset = parseInt(document.querySelector("#horOffset").value);

    //Настройка рамки
    hiddenCtx.lineWidth = 3;
    hiddenCtx.strokeStyle = "black";

    for (let y = 0; y + imgHeightPX + verOffset < hiddenCanvas.height; 
        y += (imgHeightPX+verOffset)) 
    {
        for (let x = 0; x + imgWidthPX + horOffset < hiddenCanvas.width; 
            x += (imgWidthPX+horOffset)) 
        {
            hiddenCtx.drawImage(uploadedImage, x+horOffset/2, y+verOffset/2, imgWidthPX, imgHeightPX);
            hiddenCtx.strokeRect(x, y, imgWidthPX+horOffset, imgHeightPX+verOffset);
        }
    }

    displayCtx.drawImage(hiddenCanvas, 0, 0, hiddenCanvas.width, hiddenCanvas.height, 
        0, 0, displayCanvas.width, displayCanvas.height);

    document.querySelector("#getResultBlock").style.display = "flex";
}

function getAspectRatio(){
    return uploadedImage.width / uploadedImage.height;
}

function updWidth(){
    imgWidthMM = parseInt(document.querySelector("#objectWidth").value);

    if(keepAspectRatio && !isNaN(imgWidthMM) && imgWidthMM > 0){
        imgHeightMM = Math.round(imgWidthMM / getAspectRatio());
        document.querySelector("#objectHeight").value = imgHeightMM;
    }

    updResolutionOutput();
}

function updHeight(){
    imgHeightMM = parseInt(document.querySelector("#objectHeight").value);

    if(keepAspectRatio && !isNaN(imgHeightMM) && imgHeightMM > 0){
        imgWidthMM = Math.round(imgHeightMM * getAspectRatio());
        document.querySelector("#objectWidth").value = imgWidthMM;
    }

    updResolutionOutput();
}

function updResolutionOutput(){
    imgWidthPX = Math.round(imgWidthMM * MM_TO_PX);
    imgHeightPX = Math.round(imgHeightMM * MM_TO_PX);

    pImgWidth.innerHTML = imgWidthPX;
    pImgHeight.innerHTML = imgHeightPX;
}

function download(){
    var link = document.createElement('a');
    link.download = 'placeForPrintResult.png';
    link.href = hiddenCanvas.toDataURL()
    link.click();
}

function printCanvas() {
    let imgData = hiddenCanvas.toDataURL("image/png"); 
    let printWindow = window.open('', '_blank'); 
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Print</title>
            <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                img { width: 100%; height: auto; }
            </style>
        </head>
        <body>
            <img src="${imgData}" onload="window.print(); window.close();">
        </body>
        </html>
    `);

    printWindow.document.close(); 
}


//TODO: Сделать оптимальное размещение прямоугольных объектов
//TODO: Сделать размещение прямоугольных объектов с возможностью повернуть один раз на 90 градусов
//TODO: Сделать разные форматы листа на котором будут располагаться объекты A5, A3 - A0

//TODO: Отдельное меню с настройкой линейки для резки (включить/выключить, толщина, цвет)

//TODO: Объединить загрузку изображения и предпросмотр в один элемент

//TODO: Футер с контактами и информацией о версии
//TODO: Хедером станет заголовок "Оптимальное размещение...", добавить ему скругленную рамку
//TODO: Посмотреть макеты для сайтов на bootstrap без общей прокрутки 

//TODO: Печать работает только в Firefox (проверить также на Android)
