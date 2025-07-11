// Получаем нужные элементы
const video = document.getElementById("video");
const resultBox = document.getElementById("result");
const stopBtn = document.getElementById("stop-btn");

// Подключаем сканер от zxing
const codeReader = new ZXing.BrowserMultiFormatReader();
let currentDeviceId = null;

// Функция для запуска сканера
async function initScanner() {
  try {
    // Получаем список доступных камер
    const devices = await codeReader.listVideoInputDevices();
    if (!devices.length) throw new Error("Нет доступных камер");

    // Берем первую камеру
    currentDeviceId = devices[0].deviceId;

    // Запускаем сканирование
    await codeReader.decodeFromVideoDevice(currentDeviceId, video, (result, err) => {
      if (result) {
        const barcode = result.text;
        resultBox.textContent = "Штрихкод: " + barcode;

        // Отправляем данные в Telegram WebApp
        if (window.Telegram && Telegram.WebApp) {
          Telegram.WebApp.sendData(barcode);
        }

        // Останавливаем сканер после успешного сканирования
        codeReader.reset();
      }
    });

    resultBox.textContent = "Наведи камеру на штрихкод...";
  } catch (error) {
    resultBox.textContent = "Ошибка: " + error.message;
  }
}

// Остановка сканера по кнопке
stopBtn.addEventListener("click", () => {
  codeReader.reset();
  resultBox.textContent = "Сканер остановлен";
});

// Telegram WebApp API
window.addEventListener("DOMContentLoaded", () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.expand();
  }
  initScanner();
});
