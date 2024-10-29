let countLanNhac = 0;
let time_error = 0;
let isTimeErrorCounting = false;
let timeErrorInterval;
let timeoutId; // Biến để lưu ID của timeout

// Biến để lưu giá trị distance và time từ input
let distanceInput = null;
let timeInput = null;



// Khởi tạo WebSocket
// var gateway = `ws://192.168.1.10/ws`;
var gateway = `ws://192.168.4.1/ws`;
var websocket;
window.addEventListener('load', onload);

function onload(event) {
    initWebSocket();
}

// Khởi tạo kết nối websocket
function initWebSocket() {
    console.log('Trying to open a WebSocket connection…');
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
}

function onOpen(event) {
    console.log('Connection opened');
    getValues();
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

function getValues() {
    websocket.send("getValues");
}

// Khởi tạo biểu đồ
const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Distance',
            data: [],
            borderColor: 'blue',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Hàm xử lý khi nhận tin nhắn từ WebSocket
function onMessage(event) {
    const data = JSON.parse(event.data);
    document.getElementById("distance_now").innerText = data.distance_now;
    updateChart(data.distance_now);
    document.getElementById('time_error').innerText = data.elapsed_time;
    const time_set = document.getElementById("set_time").value;
    time_error = data.elapsed_time;

    // Kiểm tra điều kiện để hiển thị modal và đếm số lần nhắc
    if (time_error > time_set && !isTimeErrorCounting) {
        isTimeErrorCounting = true;
        showModal("Bắt đầu đếm time_error");

        // Tự động tắt modal sau 1 giây
        timeoutId = setTimeout(() => {
            hideModal();
        }, 1000);

        // Đặt interval để nhắc lại mỗi 3 giây nếu time_error vẫn lớn hơn time_set
        timeErrorInterval = setInterval(() => {
            if (time_error > time_set) {
                countLanNhac++;
                document.getElementById('so_lan_nhac').textContent = countLanNhac;

                showModal("Bắt đầu đếm time_error");
                timeoutId = setTimeout(() => {
                    hideModal();
                }, 1000);

                // Kiểm tra nếu số lần nhắc lớn hơn 5
                if (countLanNhac > 5) {
                    showModal("Hãy đi rửa mặt");
                }
            } else {
                clearInterval(timeErrorInterval);
                isTimeErrorCounting = false;
            }
        }, 3000);
    }
}

// Hàm cập nhật dữ liệu cho biểu đồ
function updateChart(newDistance) {
    chart.data.datasets[0].data.push(newDistance);
    chart.data.labels.push(chart.data.labels.length.toString());
    chart.update();
}

// Lấy và đặt distance
function setDistance() {
    const distanceSet = document.getElementById("set_distance").value;
    const message = {
        distance_set: parseFloat(distanceSet),
    };

    websocket.send(JSON.stringify(message));
    showModal('DISTANCE SET SUCCESSFULLY TO ' + distanceSet);
    console.log(`Sent distance_set: ${distanceSet}`);
}

// Hàm gửi time_set khi nhấn nút
function setTime() {
    const timeSet = document.getElementById("set_time").value;
    const message = {
        time_set: parseInt(timeSet),
    };

    websocket.send(JSON.stringify(message));
    showModal('TIME SET SUCCESSFULLY TO ' + timeSet);
    console.log(`Sent time_set: ${timeSet}`);
}

// Thêm các sự kiện cho nút
document.getElementById("set_distance_btn").addEventListener("click", setDistance);
document.getElementById("set_time_btn").addEventListener("click", setTime);

// Hàm để hiển thị modal
function showModal(message) {
    const popupModal = document.getElementById('popupModal');
    const popupMessage = document.getElementById('popupMessage');
    popupMessage.textContent = message;
    popupModal.style.display = 'block';

    // Bắt sự kiện nhấn vào modal để đóng
    popupModal.onclick = hideModal;
}

function hideModal() {
    const popupModal = document.getElementById('popupModal');
    popupModal.style.display = 'none';

    // Xóa timeout để tránh đóng modal khi người dùng đã tự đóng
    clearTimeout(timeoutId);
}

// Mở cửa sổ mới khi nhấn nút
document.getElementById('open_window_btn').addEventListener('click', function () {
    window.open('new_window.html', '_blank', 'width=800,height=600');
});