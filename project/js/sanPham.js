// Lấy các phần tử cần thiết từ DOM
const overlay = document.querySelector('.body1');
const editButtons = document.querySelectorAll('.btn');
const cancelButton = document.querySelector('.cancel');
const form = document.getElementById('add-product-form');
const tbody = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');
const productsPerPage = 8; // Số sản phẩm mỗi trang
let currentPage = 1; // Trang hiện tại

// Khi nhấn nút "Chỉnh sửa", hiển thị overlay thêm sản phẩm
editButtons.forEach(button => {
    button.addEventListener('click', () => overlay.classList.add('active'));
});

// Khi nhấn nút "Hủy", ẩn overlay thêm sản phẩm
cancelButton.addEventListener('click', () => overlay.classList.remove('active'));

// Ẩn overlay khi click ra ngoài
overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('active');
});

// Hàm lấy danh sách sản phẩm từ localStorage
function getProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

// Hàm lưu danh sách sản phẩm vào localStorage
function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

// Hàm lọc sản phẩm theo từ khóa tìm kiếm, danh mục và trạng thái
function applyFilters(products, keyword) {
    const category = filterCategory.value; // Lọc theo danh mục
    const status = filterStatus.value; // Lọc theo trạng thái
    return products.filter(p => {
        const matchKeyword = p.name.toLowerCase().includes(keyword); // Lọc theo tên sản phẩm
        const matchCategory = category ? p.category === category : true; // Lọc theo danh mục
        const matchStatus = status ? p.status === status : true; // Lọc theo trạng thái
        return matchKeyword && matchCategory && matchStatus;
    });
}

// Hàm hiển thị sản phẩm lên giao diện, có phân trang
function renderProducts(page = 1) {
    const keyword = searchInput.value.trim().toLowerCase(); // Từ khóa tìm kiếm
    const allProducts = getProducts();
    const filtered = applyFilters(allProducts, keyword); // Lọc sản phẩm
    const start = (page - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginated = filtered.slice(start, end); // Cắt ra những sản phẩm cần hiển thị cho trang hiện tại

    tbody.innerHTML = '';
    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">Không tìm thấy sản phẩm nào.</td></tr>`;
    } else {
        paginated.forEach(p => {
            const statusText = p.status === '1' ? 'Đang hoạt động' : 'Ngừng hoạt động';
            tbody.innerHTML += `<tr>
                        <td>${p.code}</td>
                        <td>${p.name}</td>
                        <td>${p.price}</td>
                        <td>${p.quantity}</td>
                        <td>${p.discount}%</td>
                        <td>${statusText}</td>
                        <td><button class="btn-secondary"><img src="../img/trash-2.png" alt=""> <img class="edit-2" src="../img/edit-2.png" alt=""></button></td>
                    </tr>`;
        });
    }
    renderPagination(filtered.length); // Hiển thị phân trang
}

// Hàm tạo phân trang
function renderPagination(totalItems) {
    const pagination = document.querySelector('.pagination');
    const totalPages = Math.ceil(totalItems / productsPerPage); // Tính tổng số trang
    if (totalPages <= 1) return pagination.innerHTML = '';

    let html = `<a href="#" class="prev"><i class="fas fa-chevron-left"></i></a>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<a href="#" class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
    }
    html += `<a href="#" class="next"><i class="fas fa-chevron-right"></i></a>`;

    pagination.innerHTML = html;

    // Xử lý sự kiện click vào các trang phân trang
    document.querySelectorAll('.pagination a[data-page]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            currentPage = parseInt(a.dataset.page);
            renderProducts(currentPage); // Render lại sản phẩm theo trang được chọn
        });
    });
}

// Xử lý sự kiện khi người dùng thêm sản phẩm
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const code = document.getElementById('product-code').value.trim();
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('category').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = document.getElementById('price').value;
    const discount = parseInt(document.getElementById('discount').value);
    const image = document.getElementById('image').value;
    const details = document.getElementById('details').value;
    const status = document.getElementById('active').checked ? '1' : '2';
    if (!code || !name || !image) return showError("Vui lòng nhập đầy đủ thông tin bắt buộc.");

    const products = getProducts();
    const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const newProduct = { id: newId, code, name, category, quantity, price, discount, image, details, status };
    products.push(newProduct);
    saveProducts(products);
    form.reset();
    overlay.classList.remove('active');
    currentPage = Math.ceil(products.length / productsPerPage); // Chuyển sang trang cuối sau khi thêm sản phẩm
    renderProducts(currentPage); // Hiển thị lại danh sách sản phẩm
});

//  sự kiện thay đổi của các bộ lọc và tìm kiếm
[searchInput, filterCategory, filterStatus].forEach(input => {
    input.addEventListener('input', () => {
        currentPage = 1;
        renderProducts(currentPage); // Render lại sản phẩm theo các bộ lọc và tìm kiếm
    });
});

renderProducts(currentPage); // Hiển thị sản phẩm lần đầu tiên
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