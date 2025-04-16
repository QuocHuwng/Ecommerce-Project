// Khởi tạo dữ liệu danh mục từ localStorage
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let originalCategories = [...categories]; // Sao lưu thứ tự gốc ban đầu

let currentPage = 1, currentFilter = "", currentSearch = "";
let sortByName = null; // null: không sắp, true: A-Z, false: Z-A
const itemsPerPage = 8;
let nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
let categoryIdToUpdate = null;

// Khi trang được tải, hiển thị danh sách danh mục
document.addEventListener("DOMContentLoaded", () => renderCategories(currentPage));

// Hiển thị danh sách danh mục theo trang và điều kiện lọc, tìm kiếm
function renderCategories(page = 1) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    let base = [...originalCategories]; // luôn bắt đầu từ dữ liệu gốc
    let filtered = base.filter(cat =>
        (!currentFilter || cat.status === currentFilter) &&
        (!currentSearch ||
            cat.category_name.toLowerCase().includes(currentSearch.toLowerCase()))
    );

    // Sắp xếp theo tên danh mục nếu cần
    if (sortByName === true) {
        filtered.sort((a, b) => a.category_name.localeCompare(b.category_name));
    } else if (sortByName === false) {
        filtered.sort((a, b) => b.category_name.localeCompare(a.category_name));
    }

    // Phân trang
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    currentPage = Math.min(page, totalPages || 1);

    filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).forEach(cat => {
        tbody.innerHTML += `
            <tr>
                <td>${cat.category_code}</td>
                <td>${cat.category_name}</td>
                <td class="${cat.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}">
                    ${cat.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </td>
                <td>
                    <img class="delete-btn" data-id="${cat.id}" src="../img/trash-2.png" alt="Xoá">
                    <img class="edit-2" src="../img/edit-2.png" alt="Sửa">
                </td>
            </tr>
        `;
    });

    renderPagination(filtered.length);
    attachDeleteEvents();
    attachUpdateEvents();
}

// Hiển thị phân trang
function renderPagination(totalItems) {
    const pagination = document.querySelector(".pagination");
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let html = `<a href="#" class="prev"><i class="fas fa-chevron-left"></i></a>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<a href="#" class="page-link ${i === currentPage ? 'active' : ''}">${i}</a>`;
    }

    html += `<a href="#" class="next"><i class="fas fa-chevron-right"></i></a>`;
    pagination.innerHTML = html;

    pagination.querySelectorAll(".page-link").forEach(link => {
        link.onclick = e => {
            e.preventDefault();
            currentPage = parseInt(link.textContent);
            renderCategories(currentPage);
        };
    });

    pagination.querySelector(".prev").onclick = e => {
        e.preventDefault();
        if (currentPage > 1) renderCategories(--currentPage);
    };

    pagination.querySelector(".next").onclick = e => {
        e.preventDefault();
        if (currentPage < totalPages) renderCategories(++currentPage);
    };
}

// Gắn sự kiện xoá danh mục
function attachDeleteEvents() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = () => {
            const id = +btn.dataset.id;
            if (confirm("Bạn có chắc chắn muốn xoá danh mục này không?")) {
                categories = categories.filter(c => c.id !== id);
                originalCategories = [...categories];
                localStorage.setItem("categories", JSON.stringify(categories));
                renderCategories(currentPage);
            }
        };
    });
}

// Gắn sự kiện hiển thị form cập nhật danh mục
function attachUpdateEvents() {
    const updateForm = document.querySelector(".update");
    const overlay = document.querySelector(".overlay");
    const closeUpdateForm = () => {
        updateForm.style.display = "none";
        overlay.style.display = "none";
    };

    document.querySelectorAll(".edit-2").forEach(btn => {
        btn.onclick = () => {
            const row = btn.closest("tr");
            const code = row.children[0].textContent;
            const cat = categories.find(c => c.category_code === code);
            if (!cat) return;

            categoryIdToUpdate = cat.id;
            document.getElementById("update-category-code").value = cat.category_code;
            document.getElementById("update-category-name").value = cat.category_name;
            document.getElementById("update-active").checked = cat.status === "ACTIVE";
            document.getElementById("update-inactive").checked = cat.status === "INACTIVE";

            updateForm.style.display = "block";
            overlay.style.display = "block";
        };
    });

    document.querySelector(".fa-times")?.addEventListener("click", closeUpdateForm);
    document.querySelector(".cancel-update")?.addEventListener("click", closeUpdateForm);
    overlay?.addEventListener("click", () => updateForm.style.display === "block" && closeUpdateForm());
}

// Xử lý cập nhật danh mục
document.querySelector(".update form").addEventListener("submit", e => {
    e.preventDefault();

    const code = document.getElementById("update-category-code").value.trim();
    const name = document.getElementById("update-category-name").value.trim();
    const status = document.getElementById("update-active").checked ? "ACTIVE" : "INACTIVE";

    if (!code || !name) return showError("Vui lòng điền đầy đủ thông tin.");

    const current = categories.find(c => c.id === categoryIdToUpdate);
    if (!current) return;

    if (categories.some(c => c.id !== current.id && c.category_code === code))
        return showError("Mã danh mục đã tồn tại.");

    if (categories.some(c => c.id !== current.id && c.category_name.toLowerCase() === name.toLowerCase()))
        return showError("Tên danh mục đã tồn tại.");

    Object.assign(current, { category_code: code, category_name: name, status });
    originalCategories = [...categories];
    localStorage.setItem("categories", JSON.stringify(categories));
    showError("Cập nhật danh mục thành công!");
    renderCategories(currentPage);
    document.querySelector(".update").style.display = "none";
    document.querySelector(".overlay").style.display = "none";
});

// Xử lý thêm mới danh mục
document.querySelector(".submit-btn").addEventListener("click", e => {
    e.preventDefault();
    const code = document.getElementById("category-code").value.trim();
    const name = document.getElementById("category-name").value.trim();
    const status = document.getElementById("active").checked ? "ACTIVE" : "INACTIVE";

    if (!code || !name) return showError("Vui lòng điền đầy đủ thông tin.");
    if (categories.some(c => c.category_code === code)) return showError("Mã danh mục đã tồn tại.");
    if (categories.some(c => c.category_name.toLowerCase() === name.toLowerCase())) return showError("Tên danh mục đã tồn tại.");

    const newCat = {
        id: nextId++,
        category_code: code,
        category_name: name,
        status,
        image: "",
        created_at: new Date().toISOString()
    };

    categories.push(newCat);
    originalCategories = [...categories];
    localStorage.setItem("categories", JSON.stringify(categories));

    const filtered = originalCategories.filter(cat =>
        (!currentFilter || cat.status === currentFilter) &&
        (!currentSearch || cat.category_name.toLowerCase().includes(currentSearch.toLowerCase()))
    );

    currentPage = Math.ceil(filtered.length / itemsPerPage);
    renderCategories(currentPage);
    showError("Thêm danh mục mới thành công!");
    closeAddForm();
});

// Hiển thị lỗi/thông báo
function showError(msg) {
    const err = document.getElementById("error-message");
    err.textContent = msg;
    err.style.display = "block";
    setTimeout(() => err.style.display = "none", 3000);
}

// Đóng form thêm mới
function closeAddForm() {
    document.querySelector(".add").style.display = "none";
    document.querySelector(".overlay").style.display = "none";
}

// Mở form thêm mới
document.querySelector(".btn-primary")?.addEventListener("click", () => {
    document.querySelector(".add").style.display = "block";
    document.querySelector(".overlay").style.display = "block";
});

// Đóng form khi bấm overlay hoặc nút x
document.querySelector(".fa-times")?.addEventListener("click", closeAddForm);
document.querySelector(".cancel-btn")?.addEventListener("click", closeAddForm);
document.querySelector(".overlay")?.addEventListener("click", () => {
    const addForm = document.querySelector(".add");
    const updateForm = document.querySelector(".update");
    if (addForm.style.display === "block" || updateForm.style.display === "block") {
        addForm.style.display = updateForm.style.display = "none";
        document.querySelector(".overlay").style.display = "none";
    }
});

// Lọc theo trạng thái
document.querySelector(".contact")?.addEventListener("change", function () {
    currentFilter = this.value === "1" ? "ACTIVE" : this.value === "2" ? "INACTIVE" : "";
    currentPage = 1;
    renderCategories(currentPage);
});

// Tìm kiếm theo tên hoặc mã danh mục
document.querySelector(".search-category")?.addEventListener("input", function () {
    currentSearch = this.value.trim();
    currentPage = 1;
    renderCategories(currentPage);
});

// Sắp xếp theo tên danh mục khi click tiêu đề
document.getElementById("sort-name")?.addEventListener("click", () => {
    if (sortByName === null) sortByName = true;
    else if (sortByName === true) sortByName = false;
    else sortByName = null;
    renderCategories(currentPage);
});

// Hiển thị popup tài khoản
document.getElementById("accountBtn")?.addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("accountPopup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
});

// Đóng popup tài khoản hoặc form khi bấm overlay
document.getElementById("overlay")?.addEventListener("click", () => {
    document.getElementById("accountPopup").style.display = "none";
    document.querySelector(".add").style.display = "none";
    document.querySelector(".update").style.display = "none";
    document.getElementById("overlay").style.display = "none";
});

// Xử lý đăng xuất
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        localStorage.removeItem("username");
        window.location.href = "../html/dangNhap.html";
    }
});
