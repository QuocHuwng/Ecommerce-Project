// Biến toàn cục
let categories = JSON.parse(localStorage.getItem("categories")) || [];
const itemsPerPage = 8;
let currentPage = 1;
let currentFilter = ""; // "", "active", "inactive"
let currentSearch = ""; // Từ khóa tìm kiếm
let nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;

// Hàm hiển thị danh mục theo trang
function renderCategories(page = 1) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    let filteredCategories = currentFilter
        ? categories.filter(cat => cat.status === currentFilter)
        : [...categories];

    if (currentSearch) {
        filteredCategories = filteredCategories.filter(cat =>
            cat.category_name.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const visibleCategories = filteredCategories.slice(start, end);

    visibleCategories.forEach((cat) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${cat.category_code}</td>
        <td>${cat.category_name}</td>
        <td class="${cat.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}">
            ${cat.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </td>
        <td>
            <img class="delete-btn" data-id="${cat.id}" src="../img/trash-2.png" alt="Xoá"> 
            <img class="edit-2" src="../img/edit-2.png" alt="Sửa">
        </td>
    `;
        tbody.appendChild(tr);
    });

    renderPagination(filteredCategories.length);
    attachUpdateEvents();
    attachDeleteEvents();
}

function attachUpdateEvents() {
    const openUpdateBtns = document.querySelectorAll(".edit-2");
    const updateForm = document.querySelector(".update");
    const overlay = document.querySelectorAll(".overlay")[0];
    const closeUpdateBtn = updateForm.querySelector(".fa-times");
    const cancelUpdateBtn = updateForm.querySelector(".cancel-update");

    openUpdateBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            updateForm.style.display = "block";
            overlay.style.display = "block";
        });
    });

    function closeUpdateForm() {
        updateForm.style.display = "none";
        overlay.style.display = "none";
    }

    if (closeUpdateBtn) closeUpdateBtn.addEventListener("click", closeUpdateForm);
    if (cancelUpdateBtn) cancelUpdateBtn.addEventListener("click", closeUpdateForm);
    if (overlay) overlay.addEventListener("click", function () {
        if (updateForm.style.display === "block") closeUpdateForm();
    });
}

function attachDeleteEvents() {
    const deleteButtons = document.querySelectorAll(".delete-btn");

    deleteButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            const id = parseInt(btn.getAttribute("data-id"));
            const confirmDelete = confirm("Bạn có chắc chắn muốn xoá danh mục này không?");
            if (confirmDelete) {
                categories = categories.filter(cat => cat.id !== id);
                localStorage.setItem("categories", JSON.stringify(categories));

                let filteredCategories = currentFilter
                    ? categories.filter(cat => cat.status === currentFilter)
                    : categories;

                if (currentSearch) {
                    filteredCategories = filteredCategories.filter(cat =>
                        cat.category_name.toLowerCase().includes(currentSearch.toLowerCase())
                    );
                }

                const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
                if (currentPage > totalPages) currentPage = totalPages;

                renderCategories(currentPage);
            }
        });
    });
}

function renderPagination(totalItems) {
    const pagination = document.querySelector(".pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const prev = `<a href="#" class="prev"><i class="fas fa-chevron-left"></i></a>`;
    const next = `<a href="#" class="next"><i class="fas fa-chevron-right"></i></a>`;
    pagination.innerHTML += prev;

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `<a href="#" class="page-link ${i === currentPage ? 'active' : ''}">${i}</a>`;
    }

    pagination.innerHTML += next;

    document.querySelectorAll(".page-link").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            currentPage = parseInt(this.textContent);
            renderCategories(currentPage);
        });
    });

    document.querySelector(".prev").addEventListener("click", function (e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderCategories(currentPage);
        }
    });

    document.querySelector(".next").addEventListener("click", function (e) {
        e.preventDefault();
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCategories(currentPage);
        }
    });
}

const openAddFormBtn = document.querySelector(".btn-primary");
const addForm = document.querySelector(".add");
const overlayForm = document.querySelectorAll(".overlay")[0];
const closeAddFormBtn = addForm.querySelector(".fa-times");
const cancelAddBtn = addForm.querySelector(".cancel-btn");

function closeAddForm() {
    addForm.style.display = "none";
    overlayForm.style.display = "none";
}

if (openAddFormBtn) openAddFormBtn.addEventListener("click", () => {
    addForm.style.display = "block";
    overlayForm.style.display = "block";
});

if (closeAddFormBtn) closeAddFormBtn.addEventListener("click", closeAddForm);
if (cancelAddBtn) cancelAddBtn.addEventListener("click", closeAddForm);
if (overlayForm) overlayForm.addEventListener("click", function () {
    if (addForm.style.display === "block") closeAddForm();
});

// Thêm mới danh mục
document.querySelector(".submit-btn").addEventListener("click", function (e) {
    e.preventDefault();

    const code = document.getElementById("category-code").value.trim();
    const name = document.getElementById("category-name").value.trim();
    const status = document.getElementById("active").checked ? "ACTIVE" : "INACTIVE";

    if (!code || !name) {
        showError("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    if (categories.some(c => c.category_code === code)) {
        showError("Mã danh mục đã tồn tại.");
        return;
    }
    if (categories.some(c => c.category_name.toLowerCase() === name.toLowerCase())) {
        showError("Tên danh mục đã tồn tại.");
        return;
    }
    const newCategory = {
        id: nextId++,
        category_code: code,
        category_name: name,
        status,
        image: "",
        created_at: new Date().toISOString()
    };

    categories.push(newCategory);
    localStorage.setItem("categories", JSON.stringify(categories));

    let filteredCategories = currentFilter
        ? categories.filter(cat => cat.status === currentFilter)
        : categories;

    if (currentSearch) {
        filteredCategories = filteredCategories.filter(cat =>
            cat.category_name.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }

    currentPage = Math.ceil(filteredCategories.length / itemsPerPage);
    renderCategories(currentPage);
    showError("Thêm danh mục mới thành công!");
    closeAddForm();
});
//Lọc danh mục theo trạng thái
const statusFilter = document.querySelector(".contact");
if (statusFilter) {
    statusFilter.addEventListener("change", function () {
        const selected = this.value;
        currentFilter = selected === "1" ? "ACTIVE" : selected === "2" ? "INACTIVE" : "";
        currentPage = 1;
        renderCategories(currentPage);
    });
}
//Tìm kiếm theo tên 
const searchInput = document.querySelector(".search-category");
if (searchInput) {
    searchInput.addEventListener("input", function () {
        currentSearch = this.value.trim();
        currentPage = 1;
        renderCategories(currentPage);
    });
}

const accountBtn = document.getElementById('accountBtn');
const accountPopup = document.getElementById('accountPopup');
const logoutBtn = document.getElementById('logoutBtn');
const overlayAccount = document.getElementById('overlay');

accountBtn.addEventListener('click', function (e) {
    e.preventDefault();
    accountPopup.style.display = 'block';
    overlayAccount.style.display = 'block';
});

overlayAccount.addEventListener('click', function () {
    accountPopup.style.display = 'none';
    overlayAccount.style.display = 'none';

    document.querySelector(".add").style.display = "none";
    document.querySelector(".update").style.display = "none";
});

logoutBtn.addEventListener("click", function () {
    const confirmed = confirm("Bạn có chắc chắn muốn đăng xuất không?");
    if (confirmed) {
        localStorage.removeItem("username");
        window.location.href = "../html/dangNhap.html";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    categories = JSON.parse(localStorage.getItem("categories")) || [];
    renderCategories(currentPage);
});
// Cập nhật danh mục
let categoryIdToUpdate = null;

function attachUpdateEvents() {
    const openUpdateBtns = document.querySelectorAll(".edit-2");
    const updateForm = document.querySelector(".update");
    const overlay = document.querySelectorAll(".overlay")[0];
    const closeUpdateBtn = updateForm.querySelector(".fa-times");
    const cancelUpdateBtn = updateForm.querySelector(".cancel-update");

    openUpdateBtns.forEach((btn, index) => {
        btn.addEventListener("click", function () {
            // Lấy ID danh mục dựa vào phần tử chứa data-id
            const row = btn.closest("tr");
            const categoryCode = row.children[0].textContent;
            const category = categories.find(c => c.category_code === categoryCode);
            if (!category) return;

            categoryIdToUpdate = category.id;

            // Gán giá trị lên form
            document.getElementById("update-category-code").value = category.category_code;
            document.getElementById("update-category-name").value = category.category_name;
            document.getElementById("update-active").checked = category.status === "ACTIVE";
            document.getElementById("update-inactive").checked = category.status === "INACTIVE";

            // Mở form cập nhật
            updateForm.style.display = "block";
            overlay.style.display = "block";
        });
    });

    function closeUpdateForm() {
        updateForm.style.display = "none";
        overlay.style.display = "none";
    }

    if (closeUpdateBtn) closeUpdateBtn.addEventListener("click", closeUpdateForm);
    if (cancelUpdateBtn) cancelUpdateBtn.addEventListener("click", closeUpdateForm);
    if (overlay) overlay.addEventListener("click", function () {
        if (updateForm.style.display === "block") closeUpdateForm();
    });
}

// Xử lý lưu cập nhật danh mục
document.querySelector(".update form").addEventListener("submit", function (e) {
    e.preventDefault();

    const updatedCode = document.getElementById("update-category-code").value.trim();
    const updatedName = document.getElementById("update-category-name").value.trim();
    const updatedStatus = document.getElementById("update-active").checked ? "ACTIVE" : "INACTIVE";

    if (!updatedCode || !updatedName) {
        showError("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    const currentItem = categories.find(cat => cat.id === categoryIdToUpdate);
    if (!currentItem) return;

    // Kiểm tra trùng mã hoặc tên nhưng bỏ qua chính nó
    if (categories.some(cat => cat.id !== currentItem.id && cat.category_code === updatedCode)) {
        showError("Mã danh mục đã tồn tại.");
        return;
    }

    if (categories.some(cat => cat.id !== currentItem.id && cat.category_name.toLowerCase() === updatedName.toLowerCase())) {
        showError("Tên danh mục đã tồn tại.");
        return;
    }

    // Cập nhật
    currentItem.category_code = updatedCode;
    currentItem.category_name = updatedName;
    currentItem.status = updatedStatus;

    localStorage.setItem("categories", JSON.stringify(categories));
    showError("Cập nhật danh mục thành công!");

    // Render lại trang hiện tại
    renderCategories(currentPage);

    // Đóng form
    document.querySelector(".update").style.display = "none";
    document.querySelectorAll(".overlay")[0].style.display = "none";
});
// Hiển thị thông báo lỗi trên giao diện
function showError(message) {
    const errorMessageDiv = document.getElementById("error-message");
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = "block";

    // Ẩn thông báo sau 3 giây
    setTimeout(function () {
        errorMessageDiv.style.display = "none";
    }, 3000);
}