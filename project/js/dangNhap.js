document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Clear previous errors
    document.getElementById("error-email").textContent = "";
    document.getElementById("error-password").textContent = "";
    document.getElementById("error-login").textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    let isValid = true;

    if (!email) {
        document.getElementById("error-email").textContent = "Email không được để trống";
        isValid = false;
    }

    if (!password) {
        document.getElementById("error-password").textContent = "Mật khẩu không được để trống";
        isValid = false;
    }

    if (!isValid) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(user => user.email === email && user.password === password);

    if (!foundUser) {
        document.getElementById("error-login").textContent = "Email hoặc mật khẩu không đúng";
        return;
    }

    // Lưu trạng thái đăng nhập nếu cần (tùy theo yêu cầu)
    alert("Đăng nhập thành công!");
    window.location.href = "../index.html";
});

function updateMobile() {
    const description = document.querySelector(".description");
    if (window.innerWidth < 768) {
        description.textContent = "Đăng nhập tài khoản để sử dụng dịch vụ";
    } else {
        description.textContent = "Đăng nhập tài khoản để sử dụng hệ thống quản lý.";
    }
}

window.addEventListener("resize", updateMobile);
window.addEventListener("load", updateMobile);


function updateMobile() {
    const description = document.querySelector(".description");
    if (window.innerWidth < 768) {
        description.textContent = "Đăng nhập tài khoản để sử dụng dịch vụ";
    } else {
        description.textContent = "Đăng nhập tài khoản để sử dụng hệ thống quản lý.";
    }
}

window.addEventListener("resize", updateMobile);
window.addEventListener("load", updateMobile);