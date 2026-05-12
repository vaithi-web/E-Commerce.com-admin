// ==================== ADMIN DASHBOARD ==================== //
// Complete admin panel with all features

// ==================== STATE MANAGEMENT ==================== //
const adminState = {
    isLoggedIn: false,
    currentUser: 'Admin User',
    darkMode: true,
    orders: [],
    products: [],
    users: [],
    notifications: [],
    currentPage: 'dashboard',
    settings: {
        notifyOrders: true,
        notifyLowStock: true,
        notifyNewUsers: true
    }
};

// ==================== INITIALIZATION ==================== //
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    initializeEventListeners();
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn')) {
        showDashboard();
    } else {
        showLogin();
    }
});

// ==================== LOGIN SYSTEM ==================== //
function initializeEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Products
    document.getElementById('addProductBtn').addEventListener('click', openProductModal);
    document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
    document.getElementById('cancelProductBtn').addEventListener('click', closeProductModal);
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('productSearch').addEventListener('input', filterProducts);
    document.getElementById('productCategoryFilter').addEventListener('change', filterProducts);

    // Orders
    document.getElementById('orderSearch').addEventListener('input', filterOrders);
    document.getElementById('orderStatusFilter').addEventListener('change', filterOrders);
    document.getElementById('orderDateFilter').addEventListener('change', filterOrders);

    // Users
    document.getElementById('userSearch').addEventListener('input', filterUsers);
    document.getElementById('userStatusFilter').addEventListener('change', filterUsers);

    // Modals
    document.getElementById('closeOrderModal').addEventListener('click', closeOrderModal);
    document.getElementById('closeUserModal').addEventListener('click', closeUserModal);
    document.getElementById('modalOverlay').addEventListener('click', closeAllModals);

    // Notifications
    document.getElementById('bellBtn').addEventListener('click', toggleNotifications);
    document.getElementById('closeNotification').addEventListener('click', closeNotifications);

    // Reports
    document.getElementById('exportDailyCSV').addEventListener('click', () => exportReport('daily', 'csv'));
    document.getElementById('exportDailyJSON').addEventListener('click', () => exportReport('daily', 'json'));
    document.getElementById('exportWeeklyCSV').addEventListener('click', () => exportReport('weekly', 'csv'));
    document.getElementById('exportWeeklyJSON').addEventListener('click', () => exportReport('weekly', 'json'));
    document.getElementById('exportMonthlyCSV').addEventListener('click', () => exportReport('monthly', 'csv'));
    document.getElementById('exportMonthlyJSON').addEventListener('click', () => exportReport('monthly', 'json'));

    // Settings
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    document.getElementById('themePreference').addEventListener('change', saveSettings);
    document.getElementById('notifyOrders').addEventListener('change', saveSettings);
    document.getElementById('notifyLowStock').addEventListener('change', saveSettings);
    document.getElementById('notifyNewUsers').addEventListener('change', saveSettings);

    // Chart period buttons
    document.querySelectorAll('.chart-period').forEach(btn => {
        btn.addEventListener('click', handleChartPeriodChange);
    });

    // Global search
    document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Demo credentials
    if (email === 'admin@veloura.com' && password === 'password123') {
        adminState.isLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        if (rememberMe) {
            localStorage.setItem('adminEmail', email);
        }
        showDashboard();
        loadDemoData();
    } else {
        showNotification('Invalid credentials. Use admin@veloura.com / password123', 'error');
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        adminState.isLoggedIn = false;
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminEmail');
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('dashboardWrapper').style.display = 'none';
    
    // Pre-fill email if remembered
    const rememberedEmail = localStorage.getItem('adminEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
}

function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardWrapper').style.display = 'flex';
    loadAllData();
    renderDashboard();
    loadThemePreference();
}

// ==================== NAVIGATION ==================== //
function handleNavigation(e) {
    e.preventDefault();
    
    const page = e.currentTarget.dataset.page;
    adminState.currentPage = page;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard Overview',
        orders: 'Order Management',
        products: 'Product Management',
        users: 'User Management',
        reports: 'Sales Reports',
        inventory: 'Inventory Management',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page];

    // Hide all pages and show selected
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(page + 'Page').style.display = 'block';

    // Load data for the page
    if (page === 'orders') {
        renderOrders(adminState.orders);
    } else if (page === 'products') {
        renderProducts();
    } else if (page === 'users') {
        renderUsers();
    } else if (page === 'reports') {
        renderReports();
    } else if (page === 'inventory') {
        renderInventory();
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

// ==================== DEMO DATA ==================== //
function loadDemoData() {
    // Generate demo orders
    const demoOrders = generateDemoOrders(15);
    const demoUsers = generateDemoUsers(25);
    
    adminState.orders = demoOrders;
    adminState.users = demoUsers;
    
    // Load products from main website's localStorage
    const mainProducts = JSON.parse(localStorage.getItem('velouraProducts') || '[]');
    if (mainProducts.length > 0) {
        adminState.products = mainProducts;
    } else {
        adminState.products = generateDemoProducts(20);
    }

    saveToLocalStorage();
    addNotification('Demo data loaded successfully', 'info');
}

function generateDemoOrders(count) {
    const orders = [];
    const statuses = ['pending', 'processing', 'delivered', 'cancelled'];
    const paymentMethods = ['Credit Card', 'Debit Card', 'UPI', 'Wallet'];
    
    for (let i = 0; i < count; i++) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = Math.floor(Math.random() * 2000) + 500;
        
        orders.push({
            id: 'ORD' + String(10001 + i).slice(-5),
            productName: `Beauty Product ${i + 1}`,
            color: ['Red', 'Pink', 'Nude', 'Brown'][Math.floor(Math.random() * 4)],
            quantity: quantity,
            price: price,
            total: price * quantity,
            customerName: `Customer ${i + 1}`,
            email: `customer${i + 1}@example.com`,
            phone: '98' + String(Math.floor(Math.random() * 1000000000)).padStart(8, '0'),
            address: `${100 + i} Main Street, City ${String.fromCharCode(65 + (i % 26))}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            image: 'https://images.unsplash.com/photo-1596462502278-af407713fc22?w=100&h=100&fit=crop'
        });
    }
    return orders;
}

function generateDemoUsers(count) {
    const users = [];
    const statuses = ['active', 'inactive', 'blocked'];
    
    for (let i = 0; i < count; i++) {
        users.push({
            id: 'USR' + String(1001 + i).slice(-4),
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            orders: Math.floor(Math.random() * 10),
            lastLogin: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    return users;
}

function generateDemoProducts(count) {
    const categories = ['Face Wash', 'Shampoo', 'Lipstick', 'Perfume', 'Serum', 'Moisturizer'];
    const products = [];
    
    for (let i = 0; i < count; i++) {
        products.push({
            id: i + 1,
            name: `Beauty Product ${i + 1}`,
            category: categories[Math.floor(Math.random() * categories.length)],
            price: Math.floor(Math.random() * 2000) + 500,
            stock: Math.floor(Math.random() * 100),
            colors: ['#FF1744', '#FF69B4', '#FFB6C1'],
            status: Math.random() > 0.3 ? 'active' : 'inactive'
        });
    }
    return products;
}

// ==================== DASHBOARD PAGE ==================== //
function renderDashboard() {
    updateStats();
    renderCharts();
    renderTopProducts();
    renderRecentActivity();
}

function updateStats() {
    const totalOrders = adminState.orders.length;
    const totalRevenue = adminState.orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalUsers = adminState.users.length;
    const pendingOrders = adminState.orders.filter(o => o.status === 'pending').length;
    const completedOrders = adminState.orders.filter(o => o.status === 'delivered').length;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toLocaleString();
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalProducts').textContent = adminState.products.length;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;

    // Update notification badge
    document.getElementById('orderBadge').textContent = pendingOrders;
}

function renderCharts() {
    // Simple bar chart for sales
    const chartContainer = document.getElementById('salesChart');
    chartContainer.innerHTML = '';
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyRevenue = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
    
    const maxRevenue = Math.max(...dailyRevenue);
    
    const chartHTML = dailyRevenue.map((revenue, idx) => {
        const height = (revenue / maxRevenue) * 100;
        return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                <div class="chart-bar" style="height: ${height}%;"></div>
                <div class="chart-label">${days[idx]}</div>
            </div>
        `;
    }).join('');
    
    chartContainer.innerHTML = chartHTML;

    // Pie chart for revenue distribution
    const revenueChart = document.getElementById('revenueChart');
    revenueChart.innerHTML = `
        <div class="pie-chart">
            <div class="pie-chart-visual"></div>
            <div class="pie-chart-legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: var(--primary-color);"></div>
                    <span>Online Sales</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: var(--success-color);"></div>
                    <span>Premium Products</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: var(--warning-color);"></div>
                    <span>Promotions</span>
                </div>
            </div>
        </div>
    `;
}

function renderTopProducts() {
    const topProductsList = document.getElementById('topProductsList');
    
    if (adminState.products.length === 0) {
        topProductsList.innerHTML = '<p class="empty-state">No products yet</p>';
        return;
    }

    const topProducts = adminState.products.slice(0, 5);
    
    topProductsList.innerHTML = topProducts.map(product => `
        <div class="product-item">
            <div class="product-item-title">${product.name}</div>
            <div class="product-item-stats">
                <span class="product-item-stat">Category: ${product.category}</span>
                <span class="product-item-stat">Stock: ${product.stock}</span>
                <span class="product-item-stat">Price: ₹${product.price}</span>
            </div>
        </div>
    `).join('');
}

function renderRecentActivity() {
    const recentActivityList = document.getElementById('recentActivityList');
    
    if (adminState.orders.length === 0) {
        recentActivityList.innerHTML = '<p class="empty-state">No recent activity</p>';
        return;
    }

    const recentOrders = adminState.orders.slice(0, 5);
    
    recentActivityList.innerHTML = recentOrders.map(order => {
        const time = new Date(order.date);
        const timeAgo = getTimeAgo(time);
        
        return `
            <div class="activity-item">
                <div class="activity-item-title">Order #${order.id}</div>
                <div class="activity-item-text">${order.customerName} - ₹${order.total}</div>
                <div class="activity-item-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

function handleChartPeriodChange(e) {
    document.querySelectorAll('.chart-period').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    renderCharts();
}

// ==================== ORDERS PAGE ==================== //
function renderOrders(orders = adminState.orders) {
    const container = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="empty-state">No orders found</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">Order #${order.id}</div>
                <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
            </div>

            <div class="order-body">
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${order.image}" alt="${order.productName}">
                    </div>
                    <div class="order-item-details">
                        <div class="order-item-name">${order.productName}</div>
                        <div class="order-item-color">Color: ${order.color}</div>
                        <div class="order-item-qty">Qty: ${order.quantity} × ₹${order.price} = ₹${order.total}</div>
                    </div>
                </div>

                <div class="order-customer">
                    <div class="order-customer-name">${order.customerName}</div>
                    <div class="order-customer-detail">📧 ${order.email}</div>
                    <div class="order-customer-detail">📱 ${order.phone}</div>
                    <div class="order-customer-detail">📍 ${order.address}</div>
                </div>

                <div class="order-customer-detail">
                    💳 ${order.paymentMethod} | 📅 ${new Date(order.date).toLocaleDateString()}
                </div>
            </div>

            <div class="order-actions">
                ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
                    <button class="btn btn-success" onclick="completeOrder('${order.id}')">✓ Complete</button>
                ` : ''}
                ${order.status === 'pending' ? `
                    <button class="btn btn-primary" onclick="markProcessing('${order.id}')">Process</button>
                ` : ''}
                ${order.status !== 'cancelled' && order.status !== 'delivered' ? `
                    <button class="btn btn-danger" onclick="cancelOrder('${order.id}')">Cancel</button>
                ` : ''}
                <button class="btn btn-secondary" onclick="viewOrderDetails('${order.id}')">View Details</button>
            </div>
        </div>
    `).join('');
}

function completeOrder(orderId) {
    const order = adminState.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'delivered';
        saveToLocalStorage();
        renderOrders();
        addNotification(`Order ${orderId} marked as delivered`, 'success');
        updateStats();
    }
}

function markProcessing(orderId) {
    const order = adminState.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'processing';
        saveToLocalStorage();
        renderOrders();
        addNotification(`Order ${orderId} is now processing`, 'info');
    }
}

function cancelOrder(orderId) {
    if (confirm('Cancel this order?')) {
        const order = adminState.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'cancelled';
            saveToLocalStorage();
            renderOrders();
            addNotification(`Order ${orderId} has been cancelled`, 'warning');
            updateStats();
        }
    }
}

function viewOrderDetails(orderId) {
    const order = adminState.orders.find(o => o.id === orderId);
    if (order) {
        const detailsHTML = `
            <div class="detail-section">
                <div class="detail-title">Order Information</div>
                <div class="detail-row">
                    <div class="detail-label">Order ID:</div>
                    <div class="detail-value">${order.id}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value"><span class="status-badge status-${order.status}">${order.status}</span></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Date:</div>
                    <div class="detail-value">${new Date(order.date).toLocaleString()}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Total Amount:</div>
                    <div class="detail-value" style="color: var(--primary-color); font-weight: 700;">₹${order.total}</div>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-title">Product Details</div>
                <div class="detail-product-item">
                    <div class="detail-row">
                        <div class="detail-label">Product:</div>
                        <div class="detail-value">${order.productName}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Color:</div>
                        <div class="detail-value">${order.color}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Quantity:</div>
                        <div class="detail-value">${order.quantity}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Unit Price:</div>
                        <div class="detail-value">₹${order.price}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-title">Customer Details</div>
                <div class="detail-row">
                    <div class="detail-label">Name:</div>
                    <div class="detail-value">${order.customerName}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${order.email}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${order.phone}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Address:</div>
                    <div class="detail-value">${order.address}</div>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-title">Payment Details</div>
                <div class="detail-row">
                    <div class="detail-label">Payment Method:</div>
                    <div class="detail-value">${order.paymentMethod}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value" style="color: var(--success-color);">✓ Completed</div>
                </div>
            </div>
        `;

        document.getElementById('orderDetails').innerHTML = detailsHTML;
        document.getElementById('orderModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
    }
}

function filterOrders() {
    const searchQuery = document.getElementById('orderSearch').value.toLowerCase();
    const statusFilter = document.getElementById('orderStatusFilter').value;
    const dateFilter = document.getElementById('orderDateFilter').value;

    let filtered = adminState.orders.filter(order => {
        const matchSearch = order.productName.toLowerCase().includes(searchQuery) ||
                          order.customerName.toLowerCase().includes(searchQuery) ||
                          order.id.toLowerCase().includes(searchQuery);
        
        const matchStatus = !statusFilter || order.status === statusFilter;
        
        const matchDate = !dateFilter || new Date(order.date).toISOString().split('T')[0] === dateFilter;

        return matchSearch && matchStatus && matchDate;
    });

    renderOrders(filtered);
}

// ==================== PRODUCTS PAGE ==================== //
function renderProducts(products = adminState.products) {
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        const stockStatus = product.stock > 20 ? 'status-active' : 
                           product.stock > 0 ? 'status-low' : 
                           'status-inactive';
        
        return `
            <tr>
                <td class="product-name">${product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price}</td>
                <td>${product.stock}</td>
                <td>
                    <div class="product-color">
                        ${product.colors.map(color => `
                            <div class="color-dot" style="background-color: ${color};" title="${color}"></div>
                        `).join('')}
                    </div>
                </td>
                <td><span class="status-badge ${stockStatus}">${product.status}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn action-edit" onclick="editProduct(${product.id})">Edit</button>
                        <button class="action-btn action-delete" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterProducts() {
    const searchQuery = document.getElementById('productSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('productCategoryFilter').value;

    let filtered = adminState.products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(searchQuery);
        const matchCategory = !categoryFilter || product.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    renderProducts(filtered);
}

function openProductModal(productId = null) {
    document.getElementById('productModalTitle').textContent = productId ? 'Edit Product' : 'Add New Product';
    document.getElementById('productForm').reset();
    
    if (productId) {
        const product = adminState.products.find(p => p.id === productId);
        if (product) {
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productOldPrice').value = product.oldPrice || product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productGender').value = product.gender || 'unisex';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productColors').value = product.colors.join(', ');
        }
    }

    document.getElementById('productModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

function handleProductSubmit(e) {
    e.preventDefault();

    const product = {
        id: adminState.products.length + 1,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        oldPrice: parseInt(document.getElementById('productOldPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        gender: document.getElementById('productGender').value,
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value || 'https://via.placeholder.com/100',
        colors: document.getElementById('productColors').value.split(',').map(c => c.trim()),
        status: 'active',
        createdAt: new Date().toISOString()
    };

    adminState.products.push(product);
    saveToLocalStorage();
    syncWithMainWebsite();
    renderProducts();
    closeProductModal();
    addNotification(`Product "${product.name}" added successfully!`, 'success');
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        adminState.products = adminState.products.filter(p => p.id !== productId);
        saveToLocalStorage();
        syncWithMainWebsite();
        renderProducts();
        addNotification('Product deleted successfully', 'success');
    }
}

// ==================== USERS PAGE ==================== //
function renderUsers(users = adminState.users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => {
        const lastLogin = new Date(user.lastLogin);
        const lastLoginText = getTimeAgo(lastLogin);

        return `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${lastLoginText}</td>
                <td>${user.orders}</td>
                <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn action-view" onclick="viewUserDetails('${user.id}')">View</button>
                        ${user.status !== 'blocked' ? `<button class="action-btn action-delete" onclick="blockUser('${user.id}')">Block</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterUsers() {
    const searchQuery = document.getElementById('userSearch').value.toLowerCase();
    const statusFilter = document.getElementById('userStatusFilter').value;

    let filtered = adminState.users.filter(user => {
        const matchSearch = user.name.toLowerCase().includes(searchQuery) ||
                          user.email.toLowerCase().includes(searchQuery);
        const matchStatus = !statusFilter || user.status === statusFilter;
        return matchSearch && matchStatus;
    });

    renderUsers(filtered);
}

function viewUserDetails(userId) {
    const user = adminState.users.find(u => u.id === userId);
    if (user) {
        const joinDate = new Date(user.joinDate);
        
        const detailsHTML = `
            <div class="detail-section">
                <div class="detail-title">User Information</div>
                <div class="detail-row">
                    <div class="detail-label">User ID:</div>
                    <div class="detail-value">${user.id}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Name:</div>
                    <div class="detail-value">${user.name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${user.email}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value"><span class="status-badge status-${user.status}">${user.status}</span></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Join Date:</div>
                    <div class="detail-value">${joinDate.toLocaleDateString()}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Total Orders:</div>
                    <div class="detail-value" style="color: var(--primary-color); font-weight: 700;">${user.orders}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Last Login:</div>
                    <div class="detail-value">${new Date(user.lastLogin).toLocaleString()}</div>
                </div>
            </div>
        `;

        document.getElementById('userDetails').innerHTML = detailsHTML;
        document.getElementById('userModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
    }
}

function blockUser(userId) {
    const user = adminState.users.find(u => u.id === userId);
    if (user && confirm(`Block user ${user.name}?`)) {
        user.status = 'blocked';
        saveToLocalStorage();
        renderUsers();
        addNotification(`User ${user.name} has been blocked`, 'warning');
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

// ==================== REPORTS PAGE ==================== //
function renderReports() {
    const reportTableBody = document.getElementById('reportTableBody');
    
    if (adminState.orders.length === 0) {
        reportTableBody.innerHTML = '<tr><td colspan="8" class="empty-state">No sales data</td></tr>';
        return;
    }

    reportTableBody.innerHTML = adminState.orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.productName}</td>
            <td>${order.quantity}</td>
            <td>${order.color}</td>
            <td>${order.customerName}</td>
            <td>₹${order.total}</td>
            <td>${order.paymentMethod}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function exportReport(period, format) {
    let data = adminState.orders;
    const now = new Date();
    const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (period === 'daily') {
        data = data.filter(order => 
            new Date(order.date).toDateString() === currentDay.toDateString()
        );
    } else if (period === 'weekly') {
        data = data.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= currentWeekStart;
        });
    } else if (period === 'monthly') {
        data = data.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.getFullYear() === now.getFullYear() &&
                   orderDate.getMonth() === now.getMonth();
        });
    }

    if (format === 'csv') {
        exportToCSV(data, `${period}-sales-report.csv`);
    } else if (format === 'json') {
        exportToJSON(data, `${period}-sales-report.json`);
    }

    addNotification(`${period.capitalize()} ${format.toUpperCase()} report exported!`, 'success');
}

function exportToCSV(data, filename) {
    const headers = ['Order ID', 'Product', 'Quantity', 'Color', 'Customer', 'Amount', 'Payment', 'Date'];
    const rows = data.map(order => [
        order.id,
        order.productName,
        order.quantity,
        order.color,
        order.customerName,
        order.total,
        order.paymentMethod,
        new Date(order.date).toLocaleDateString()
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => csv += row.join(',') + '\n');

    downloadFile(csv, filename, 'text/csv');
}

function exportToJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, filename, 'application/json');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// ==================== INVENTORY PAGE ==================== //
function renderInventory() {
    const lowStockCount = adminState.products.filter(p => p.stock > 0 && p.stock <= 20).length;
    const outOfStockCount = adminState.products.filter(p => p.stock === 0).length;
    const totalStock = adminState.products.reduce((sum, p) => sum + p.stock, 0);

    document.getElementById('lowStockCount').textContent = lowStockCount;
    document.getElementById('outOfStockCount').textContent = outOfStockCount;
    document.getElementById('totalStockCount').textContent = totalStock;

    const alertsContainer = document.getElementById('inventoryAlerts');
    const alerts = [];

    // Low stock alerts
    adminState.products.forEach(product => {
        if (product.stock > 0 && product.stock <= 20) {
            alerts.push({
                type: 'low',
                product: product.name,
                stock: product.stock,
                message: `Only ${product.stock} units left`
            });
        }
        if (product.stock === 0) {
            alerts.push({
                type: 'critical',
                product: product.name,
                stock: 0,
                message: 'Out of stock'
            });
        }
    });

    if (alerts.length === 0) {
        alertsContainer.innerHTML = '<p class="empty-state">No inventory alerts</p>';
    } else {
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type === 'critical' ? 'critical' : ''}">
                <div class="alert-item-title">${alert.product}</div>
                <div class="alert-item-text">📦 Stock: ${alert.stock} - ${alert.message}</div>
            </div>
        `).join('');
    }
}

// ==================== THEME & NOTIFICATIONS ==================== //
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('light-mode');
    adminState.darkMode = !isDarkMode;
    localStorage.setItem('adminTheme', isDarkMode ? 'light' : 'dark');
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function loadThemePreference() {
    const theme = localStorage.getItem('adminTheme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('themeToggle').textContent = '☀️';
        adminState.darkMode = false;
    }
}

function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('active');
}

function closeNotifications() {
    document.getElementById('notificationDropdown').classList.remove('active');
}

function addNotification(message, type = 'info') {
    const notification = {
        id: Date.now(),
        message: message,
        type: type,
        time: new Date().toISOString()
    };

    adminState.notifications.unshift(notification);
    if (adminState.notifications.length > 10) {
        adminState.notifications.pop();
    }

    updateNotificationUI();
}

function updateNotificationUI() {
    const count = adminState.notifications.length;
    document.getElementById('notificationCount').textContent = count;

    const notificationList = document.getElementById('notificationList');
    if (count === 0) {
        notificationList.innerHTML = '<p class="empty-state">No new notifications</p>';
    } else {
        notificationList.innerHTML = adminState.notifications.map(notif => `
            <div class="notification-item">
                <div class="notification-item-title">${notif.message}</div>
                <div class="notification-item-time">${getTimeAgo(new Date(notif.time))}</div>
            </div>
        `).join('');
    }
}

function toggleNotifications() {
    document.getElementById('notificationDropdown').classList.toggle('active');
}

function closeNotifications() {
    document.getElementById('notificationDropdown').classList.remove('active');
}

// ==================== SETTINGS ==================== //
function saveSettings() {
    adminState.settings.notifyOrders = document.getElementById('notifyOrders').checked;
    adminState.settings.notifyLowStock = document.getElementById('notifyLowStock').checked;
    adminState.settings.notifyNewUsers = document.getElementById('notifyNewUsers').checked;

    const theme = document.getElementById('themePreference').value;
    if (theme === 'dark') {
        document.body.classList.remove('light-mode');
        adminState.darkMode = true;
    } else if (theme === 'light') {
        document.body.classList.add('light-mode');
        adminState.darkMode = false;
    }

    localStorage.setItem('adminSettings', JSON.stringify(adminState.settings));
    addNotification('Settings saved successfully', 'success');
}

function clearAllData() {
    if (confirm('This will clear all demo data. Continue?')) {
        adminState.orders = [];
        adminState.products = [];
        adminState.users = [];
        adminState.notifications = [];
        saveToLocalStorage();
        loadDemoData();
        addNotification('All data has been reset', 'info');
    }
}

// ==================== SEARCH & FILTER ==================== //
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (!query) {
        renderDashboard();
        return;
    }

    // Search across all data
    const searchResults = {
        orders: adminState.orders.filter(o => 
            o.productName.toLowerCase().includes(query) ||
            o.customerName.toLowerCase().includes(query) ||
            o.id.toLowerCase().includes(query)
        ),
        products: adminState.products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        ),
        users: adminState.users.filter(u =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
        )
    };

    console.log('Search results:', searchResults);
    addNotification(`Found ${searchResults.orders.length + searchResults.products.length + searchResults.users.length} results`, 'info');
}

// ==================== MODAL MANAGEMENT ==================== //
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('modalOverlay').classList.remove('active');
}

// ==================== DATA SYNC ==================== //
function saveToLocalStorage() {
    localStorage.setItem('adminOrders', JSON.stringify(adminState.orders));
    localStorage.setItem('adminProducts', JSON.stringify(adminState.products));
    localStorage.setItem('adminUsers', JSON.stringify(adminState.users));
    localStorage.setItem('adminNotifications', JSON.stringify(adminState.notifications));
}

function loadFromLocalStorage() {
    const orders = localStorage.getItem('adminOrders');
    const products = localStorage.getItem('adminProducts');
    const users = localStorage.getItem('adminUsers');
    const notifications = localStorage.getItem('adminNotifications');

    if (orders) adminState.orders = JSON.parse(orders);
    if (products) adminState.products = JSON.parse(products);
    if (users) adminState.users = JSON.parse(users);
    if (notifications) adminState.notifications = JSON.parse(notifications);
}

function loadAllData() {
    loadFromLocalStorage();
}

function syncWithMainWebsite() {
    // Sync products with main website
    localStorage.setItem('velouraAdminProducts', JSON.stringify(adminState.products));
    
    // Trigger event for main website to listen
    window.dispatchEvent(new CustomEvent('adminProductsUpdated', {
        detail: { products: adminState.products }
    }));
}

// ==================== UTILITY FUNCTIONS ==================== //
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// ==================== KEYBOARD SHORTCUTS ==================== //
document.addEventListener('keydown', function(e) {
    // Alt+D for dashboard, Alt+O for orders, etc.
    if (e.altKey) {
        switch(e.key.toLowerCase()) {
            case 'd':
                e.preventDefault();
                document.querySelector('[data-page="dashboard"]').click();
                break;
            case 'o':
                e.preventDefault();
                document.querySelector('[data-page="orders"]').click();
                break;
            case 'p':
                e.preventDefault();
                document.querySelector('[data-page="products"]').click();
                break;
        }
    }
});

localStorage.setItem("products", JSON.stringify(products))

// Auto-update notification count
setInterval(() => {
    if (adminState.isLoggedIn) {
        const pendingOrders = adminState.orders.filter(o => o.status === 'pending').length;
        document.getElementById('orderBadge').textContent = pendingOrders;
    }
}, 5000);
