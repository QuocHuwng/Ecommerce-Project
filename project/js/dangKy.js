document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Xóa các lỗi cũ
    document.querySelectorAll(".error-message").forEach(el => el.textContent = "");

    const lastname = document.getElementById("lastname").value.trim();
    const firstname = document.getElementById("firstname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const termsChecked = document.getElementById("terms").checked;

    let isValid = true;

    if (!lastname) {
        document.getElementById("error-lastname").textContent = "Vui lòng nhập họ và tên đệm";
        isValid = false;
    }

    if (!firstname) {
        document.getElementById("error-firstname").textContent = "Vui lòng nhập tên";
        isValid = false;
    }

    if (!email) {
        document.getElementById("error-email").textContent = "Vui lòng nhập email";
        isValid = false;
    } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            document.getElementById("error-email").textContent = "Chỉ chấp nhận email @gmail.com";
            isValid = false;
        }
    }

    if (!password) {
        document.getElementById("error-password").textContent = "Vui lòng nhập mật khẩu";
        isValid = false;
    } else if (password.length < 8) {
        document.getElementById("error-password").textContent = "Mật khẩu phải có ít nhất 8 ký tự";
        isValid = false;
    }

    if (!confirmPassword) {
        document.getElementById("error-confirm").textContent = "Vui lòng xác nhận mật khẩu";
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById("error-confirm").textContent = "Mật khẩu xác nhận không khớp";
        isValid = false;
    }

    if (!termsChecked) {
        document.getElementById("error-terms").textContent = "Bạn cần đồng ý với điều khoản";
        isValid = false;
    }

    if (!isValid) return;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
        document.getElementById("error-email").textContent = "Email đã tồn tại, vui lòng sử dụng email khác";
        return;
    }

    let maxId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) : 0;

    const newUser = {
        id: maxId + 1,
        lastname: lastname,
        firstname: firstname,
        email: email,
        password: password
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.");
    window.location.href = "./dangNhap.html";
});
