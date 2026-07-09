/**
 * ERG Asset - Hệ Thống Quản Lý Thiết Bị & Tài Sản
 * File: app.js
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. STATE & LOCALSTORAGE INIT
    // -------------------------------------------------------------------------
    
    // Load lists from LocalStorage or initialize default arrays
    let thietBiList = JSON.parse(localStorage.getItem('erg_thiet_bi') || localStorage.getItem('elodie_thiet_bi') || localStorage.getItem('nkc_thiet_bi')) || [];
    let congTyList = JSON.parse(localStorage.getItem('erg_cong_ty') || localStorage.getItem('elodie_cong_ty') || localStorage.getItem('nkc_cong_ty')) || [];
    let accountList = JSON.parse(localStorage.getItem('erg_account') || localStorage.getItem('elodie_account') || localStorage.getItem('nkc_account')) || [];
    let hoTroList = JSON.parse(localStorage.getItem('erg_ho_tro') || localStorage.getItem('elodie_ho_tro') || localStorage.getItem('nkc_ho_tro')) || [];
    let cameraList = JSON.parse(localStorage.getItem('erg_camera') || localStorage.getItem('elodie_camera') || localStorage.getItem('nkc_camera')) || [];
    let tipsList = JSON.parse(localStorage.getItem('erg_tips') || localStorage.getItem('elodie_tips') || localStorage.getItem('nkc_tips')) || [];

    // Helper functions to sync memory array with LocalStorage
    const saveState = {
        thietBi: () => localStorage.setItem('erg_thiet_bi', JSON.stringify(thietBiList)),
        congTy: () => localStorage.setItem('erg_cong_ty', JSON.stringify(congTyList)),
        account: () => localStorage.setItem('erg_account', JSON.stringify(accountList)),
        hoTro: () => localStorage.setItem('erg_ho_tro', JSON.stringify(hoTroList)),
        camera: () => localStorage.setItem('erg_camera', JSON.stringify(cameraList)),
        tips: () => localStorage.setItem('erg_tips', JSON.stringify(tipsList))
    };

    // -------------------------------------------------------------------------
    // 2. DOM ELEMENTS & NAVIGATION
    // -------------------------------------------------------------------------
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');

    // Tab Navigation Logic
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active classes
            menuItems.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button & target tab content
            item.classList.add('active');
            const targetTab = item.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');

            // Update page header title according to selected tab
            const tabName = item.querySelector('span').innerText;
            pageTitle.innerHTML = `ERG Asset - Hệ Thống Quản Lý Thiết Bị & Tài Sản <small style="font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-left: 10px;">/ ${tabName}</small>`;
        });
    });

    // -------------------------------------------------------------------------
    // 3. TOAST NOTIFICATION SYSTEM
    // -------------------------------------------------------------------------
    const toastContainer = document.getElementById('toast-container');

    function showToast(title, message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconClass = 'fa-circle-check';
        if (type === 'error') iconClass = 'fa-circle-xmark';
        if (type === 'warning') iconClass = 'fa-circle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
        `;

        toastContainer.appendChild(toast);

        // Bind close button event
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto remove toast after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    // -------------------------------------------------------------------------
    // 4. PASSWORD VISIBILITY TOGGLER
    // -------------------------------------------------------------------------
    document.querySelectorAll('.btn-toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="fa-regular fa-eye"></i>';
            }
        });
    });

    // Modal Lịch Sử Cập Nhật
    const historyModal = document.getElementById('history-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnFooterCloseModal = document.getElementById('btn-footer-close-modal');
    const histUser = document.getElementById('hist-user');
    const histDevice = document.getElementById('hist-device');
    const histTimeline = document.getElementById('hist-timeline');

    const closeModal = () => historyModal.classList.remove('show');
    btnCloseModal.addEventListener('click', closeModal);
    btnFooterCloseModal.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === historyModal) closeModal();
    });


    // =========================================================================
    // 5. PHÂN HỆ 1: QUẢN LÝ CẤP PHÁT THIẾT BỊ (ASSET)
    // =========================================================================
    const formCapPhat = document.getElementById('form-cap-phat');
    const tbodyThietBi = document.getElementById('tbody-thiet-bi');
    const searchThietBi = document.getElementById('search-thiet-bi');
    const btnCancelThietBi = document.getElementById('btn-cancel-thiet-bi');
    const btnSaveThietBi = document.getElementById('btn-save-thiet-bi');
    const editIndexThietBi = document.getElementById('edit-index-thiet-bi');

    // Input elements for validation
    const userIdInput = document.getElementById('user-id');
    const devIdInput = document.getElementById('dev-id');

    // Realtime inline validation triggers
    userIdInput.addEventListener('input', () => validateDuplicateUser(editIndexThietBi.value));
    devIdInput.addEventListener('input', () => validateDuplicateDevice(editIndexThietBi.value));

    function validateDuplicateUser(excludeIndex = "") {
        const val = userIdInput.value.trim().toLowerCase();
        const errSpan = document.getElementById('err-user-id');
        if (!val) {
            errSpan.style.display = 'none';
            return true;
        }

        // Check duplicate
        const duplicate = thietBiList.some((item, index) => {
            if (excludeIndex !== "" && index === parseInt(excludeIndex)) return false;
            return item.userId.toLowerCase() === val;
        });

        if (duplicate) {
            errSpan.innerText = 'Trùng ID người sử dụng!';
            errSpan.style.display = 'block';
            userIdInput.style.borderColor = 'var(--danger-color)';
            return false;
        } else {
            errSpan.style.display = 'none';
            userIdInput.style.borderColor = '';
            return true;
        }
    }

    function validateDuplicateDevice(excludeIndex = "") {
        const devIdVal = devIdInput.value.trim().toLowerCase();
        const errDevId = document.getElementById('err-dev-id');
        
        let isValid = true;

        // Check Device ID duplicate
        if (devIdVal) {
            const dupId = thietBiList.some((item, index) => {
                if (excludeIndex !== "" && index === parseInt(excludeIndex)) return false;
                return item.devId.toLowerCase() === devIdVal;
            });
            if (dupId) {
                errDevId.innerText = 'Trùng ID Thiết bị!';
                errDevId.style.display = 'block';
                devIdInput.style.borderColor = 'var(--danger-color)';
                isValid = false;
            } else {
                errDevId.style.display = 'none';
                devIdInput.style.borderColor = '';
            }
        } else {
            errDevId.style.display = 'none';
            devIdInput.style.borderColor = '';
        }

        return isValid;
    }

    // Render Device Allocation Table
    let currentPageThietBi = 1;
    const itemsPerPageThietBi = 10;

    function renderThietBi(filterText = '') {
        tbodyThietBi.innerHTML = '';
        
        // Prioritize by department (sort alphabetically by userDept)
        const sortedList = [...thietBiList].sort((a, b) => {
            const deptA = a.userDept ? a.userDept.trim() : "";
            const deptB = b.userDept ? b.userDept.trim() : "";
            if (deptA === "" && deptB !== "") return 1;
            if (deptA !== "" && deptB === "") return -1;
            return deptA.localeCompare(deptB, 'vi', { sensitivity: 'base' });
        });

        // Safe filter matching keyword
        const keyword = filterText.toLowerCase();
        const filtered = sortedList.filter(item => {
            return (
                (item.userId || '').toLowerCase().includes(keyword) ||
                (item.userName || '').toLowerCase().includes(keyword) ||
                (item.devId || '').toLowerCase().includes(keyword) ||
                (item.userDept || '').toLowerCase().includes(keyword)
            );
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageThietBi) || 1;
        if (currentPageThietBi > totalPages) currentPageThietBi = totalPages;
        if (currentPageThietBi < 1) currentPageThietBi = 1;

        const startIndex = (currentPageThietBi - 1) * itemsPerPageThietBi;
        const endIndex = Math.min(startIndex + itemsPerPageThietBi, totalItems);

        // Update pagination labels
        document.getElementById('pag-start').innerText = totalItems > 0 ? startIndex + 1 : 0;
        document.getElementById('pag-end').innerText = endIndex;
        document.getElementById('pag-total').innerText = totalItems;
        document.getElementById('pag-current').innerText = `Trang ${currentPageThietBi} / ${totalPages}`;

        // Disable/enable pagination buttons
        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');
        
        btnPrev.disabled = currentPageThietBi === 1;
        btnNext.disabled = currentPageThietBi === totalPages;
        btnPrev.style.opacity = currentPageThietBi === 1 ? '0.5' : '1';
        btnPrev.style.cursor = currentPageThietBi === 1 ? 'not-allowed' : 'pointer';
        btnNext.style.opacity = currentPageThietBi === totalPages ? '0.5' : '1';
        btnNext.style.cursor = currentPageThietBi === totalPages ? 'not-allowed' : 'pointer';

        if (totalItems === 0) {
            tbodyThietBi.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6" class="text-center text-muted">Không tìm thấy dữ liệu cấp phát!</td>
                </tr>
            `;
            return;
        }

        const pageItems = filtered.slice(startIndex, endIndex);

        pageItems.forEach((item, index) => {
            // Find the original index in the main list
            const originalIndex = thietBiList.indexOf(item);
            
            const getStatusBadgeClass = (status) => {
                switch (status) {
                    case 'Mới': return 'badge-green';
                    case 'Trung bình': return 'badge-blue';
                    case 'Cũ': return 'badge-yellow';
                    case 'Xem xét thay thế': return 'badge-danger';
                    default: return '';
                }
            };

            const tr = document.createElement('tr');
            
            // Format Config details
            const configArr = [];
            if (item.devMain) configArr.push(`Main: ${item.devMain}`);
            if (item.devCpu) configArr.push(`CPU: ${item.devCpu}`);
            if (item.devRam) {
                const ramInfo = item.devRamSlots ? `${item.devRam} (${item.devRamSlots})` : item.devRam;
                configArr.push(`RAM: ${ramInfo}`);
            }
            if (item.devSsd) configArr.push(`SSD: ${item.devSsd}`);
            if (item.devHdd) configArr.push(`HDD: ${item.devHdd}`);
            if (item.devVga) configArr.push(`VGA: ${item.devVga}`);
            if (item.devMonitor) configArr.push(`Màn hình: ${item.devMonitor}`);
            if (item.devCables) configArr.push(`Dây kết nối: ${item.devCables}`);
            const configText = configArr.length > 0 ? configArr.join('<br>') : 'Chưa nhập cấu hình';

            // Format License keys
            const keyArr = [];
            if (item.keyWin) keyArr.push(`<div class="key-item"><i class="fa-brands fa-windows text-primary"></i> <span>${item.keyWin}</span></div>`);
            if (item.keyOffice) keyArr.push(`<div class="key-item"><i class="fa-solid fa-file-word text-success"></i> <span>${item.keyOffice}</span></div>`);
            if (item.keyPdf) keyArr.push(`<div class="key-item"><i class="fa-solid fa-file-pdf text-danger"></i> <span>${item.keyPdf}</span></div>`);
            if (item.devApps) keyArr.push(`<div class="key-item" title="App bản quyền"><i class="fa-solid fa-cubes text-warning"></i> <span>${item.devApps}</span></div>`);
            const keysText = keyArr.length > 0 ? keyArr.join('') : '<span class="text-muted">Không có key</span>';

            tr.innerHTML = `
                <td>
                    <div class="user-info-cell">
                        <span class="name">${item.userName} <span class="badge badge-blue">${item.userId}</span></span>
                        <span class="details">${item.userTitle ? item.userTitle + ' - ' : ''}${item.userDept || 'Không có phòng ban'}</span>
                        <span class="contact">${item.userEmail ? '<i class="fa-regular fa-envelope"></i> ' + item.userEmail : ''} ${item.userPhone ? ' | <i class="fa-solid fa-phone"></i> ' + item.userPhone : ''}</span>
                    </div>
                </td>
                <td>
                    <div class="user-info-cell">
                        ${item.devId ? `
                            <span class="name">
                                <span class="badge badge-green">${item.devId}</span>
                                ${item.devStatus ? `<span class="badge ${getStatusBadgeClass(item.devStatus)}">${item.devStatus}</span>` : ''}
                            </span>
                            <span class="details">Loại: ${item.devType || 'Chưa phân loại'}</span>
                        ` : `
                            <span class="text-muted" style="font-style: italic;">Chưa cấp thiết bị</span>
                        `}
                    </div>
                </td>
                <td style="max-width: 250px; font-size: 13px;">
                    ${configText}
                </td>
                <td>
                    <div class="keys-container">
                        ${keysText}
                    </div>
                </td>
                <td>
                    <span style="font-size: 13px; color: var(--text-secondary); font-style: italic;">${item.devNotes || '—'}</span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-only history btn-history-thietbi" data-index="${originalIndex}" title="Xem ngày cập nhật">
                            <i class="fa-solid fa-clock-rotate-left"></i>
                        </button>
                        <button class="btn-icon-only edit btn-edit-thietbi" data-index="${originalIndex}" title="Sửa">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon-only delete btn-delete-thietbi" data-index="${originalIndex}" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbodyThietBi.appendChild(tr);
        });

        // Bind events to action buttons inside the table
        document.querySelectorAll('.btn-edit-thietbi').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                editThietBi(idx);
            });
        });

        document.querySelectorAll('.btn-delete-thietbi').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                deleteThietBi(idx);
            });
        });

        document.querySelectorAll('.btn-history-thietbi').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                const item = thietBiList[idx];
                
                // Set details
                histUser.innerText = `${item.userName} (${item.userId})`;
                histDevice.innerText = item.devId ? `ID Thiết bị: ${item.devId}` : 'Không cấp phát thiết bị';
                
                // Render timeline
                histTimeline.innerHTML = '';
                const historyLogs = item.history || [];
                
                if (historyLogs.length === 0) {
                    const fallbackTime = item.updatedAt || 'Chưa rõ thời gian';
                    histTimeline.innerHTML = `
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-time">${fallbackTime}</div>
                            <div class="timeline-action">Thông tin cấp phát</div>
                            <div class="timeline-details">Đã lưu trữ trước đó. Chưa có nhật ký chi tiết thay đổi.</div>
                        </div>
                    `;
                } else {
                    [...historyLogs].reverse().forEach(log => {
                        const div = document.createElement('div');
                        div.className = 'timeline-item';
                        div.innerHTML = `
                            <div class="timeline-dot"></div>
                            <div class="timeline-time">${log.time}</div>
                            <div class="timeline-action">${log.action}</div>
                            <div class="timeline-details">${log.details}</div>
                        `;
                        histTimeline.appendChild(div);
                    });
                }
                
                // Show modal
                historyModal.classList.add('show');
            });
        });
    }

    // Submit Action for Asset management form
    formCapPhat.addEventListener('submit', (e) => {
        e.preventDefault();
        const indexStr = editIndexThietBi.value;

        // Perform validation
        const userOk = validateDuplicateUser(indexStr);
        const devOk = validateDuplicateDevice(indexStr);

        if (!userOk || !devOk) {
            showToast('Lỗi nhập liệu', 'Vui lòng kiểm tra lại thông tin bị trùng lắp!', 'error');
            return;
        }

        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} lúc ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const data = {
            userId: userIdInput.value.trim(),
            userName: document.getElementById('user-name').value.trim(),
            userTitle: document.getElementById('user-title').value.trim(),
            userDept: document.getElementById('user-dept').value.trim(),
            userEmail: document.getElementById('user-email').value.trim(),
            userPhone: document.getElementById('user-phone').value.trim(),
            devId: devIdInput.value.trim(),
            devType: document.getElementById('dev-type').value.trim(),
            devMain: document.getElementById('dev-main').value.trim(),
            devCpu: document.getElementById('dev-cpu').value.trim(),
            devRam: document.getElementById('dev-ram').value,
            devRamSlots: document.getElementById('dev-ram-slots').value,
            devSsd: document.getElementById('dev-ssd').value.trim(),
            devHdd: document.getElementById('dev-hdd').value.trim(),
            devVga: document.getElementById('dev-vga').value.trim(),
            keyWin: document.getElementById('key-win').value.trim(),
            keyOffice: document.getElementById('key-office').value.trim(),
            keyPdf: document.getElementById('key-pdf').value.trim(),
            devNotes: document.getElementById('dev-notes').value.trim(),
            devApps: document.getElementById('dev-apps').value.trim(),
            devStatus: document.getElementById('dev-status').value,
            devMonitor: document.getElementById('dev-monitor').value.trim(),
            devCables: document.getElementById('dev-cables').value,
            updatedAt: formattedDate
        };

        if (indexStr === '') {
            data.history = [{
                time: formattedDate,
                action: 'Tạo mới',
                details: 'Khởi tạo cấp phát thiết bị ban đầu.'
            }];
            thietBiList.push(data);
            showToast('Thành công', 'Đã lưu thông tin cấp phát thiết bị mới!');
        } else {
            const idx = parseInt(indexStr);
            const oldItem = thietBiList[idx];
            
            // Compare fields
            let changes = [];
            const fieldsToCompare = {
                userId: "ID Nhân viên",
                userName: "Họ và Tên",
                userTitle: "Chức danh",
                userDept: "Phòng ban",
                userEmail: "Email",
                userPhone: "Số điện thoại",
                devId: "ID Thiết bị",
                devType: "Loại thiết bị",
                devMain: "Mainboard",
                devCpu: "CPU",
                devRam: "RAM",
                devRamSlots: "Số thanh RAM",
                devSsd: "SSD",
                devHdd: "HDD",
                devVga: "VGA",
                keyWin: "Key Windows",
                keyOffice: "Key Office",
                keyPdf: "Key PDF",
                devNotes: "Ghi chú thiết bị",
                devApps: "Các app bản quyền",
                devStatus: "Tình trạng thiết bị",
                devMonitor: "Thông tin màn hình",
                devCables: "Dây kết nối"
            };

            for (const key in fieldsToCompare) {
                if ((oldItem[key] || '') !== (data[key] || '')) {
                    const oldVal = oldItem[key] || "Trống";
                    const newVal = data[key] || "Trống";
                    changes.push(`• Thay đổi <strong>${fieldsToCompare[key]}</strong>: "${oldVal}" ➔ "${newVal}"`);
                }
            }

            data.history = oldItem.history || [];
            if (changes.length > 0) {
                data.history.push({
                    time: formattedDate,
                    action: 'Cập nhật thông tin',
                    details: changes.join('<br>')
                });
                data.updatedAt = formattedDate;
            } else {
                data.updatedAt = oldItem.updatedAt || formattedDate;
            }
            
            thietBiList[idx] = data;
            showToast('Thành công', 'Đã cập nhật thông tin cấp phát thiết bị!');
            resetFormThietBi();
        }

        saveState.thietBi();
        renderThietBi();
        formCapPhat.reset();
        resetFormThietBi();
    });

    // Populate form with existing data to Edit
    function editThietBi(index) {
        const item = thietBiList[index];
        editIndexThietBi.value = index;
        
        userIdInput.value = item.userId;
        document.getElementById('user-name').value = item.userName;
        document.getElementById('user-title').value = item.userTitle;
        document.getElementById('user-dept').value = item.userDept;
        document.getElementById('user-email').value = item.userEmail;
        document.getElementById('user-phone').value = item.userPhone;
        devIdInput.value = item.devId || '';
        document.getElementById('dev-type').value = item.devType || '';
        document.getElementById('dev-main').value = item.devMain;
        document.getElementById('dev-cpu').value = item.devCpu;
        document.getElementById('dev-ram').value = item.devRam;
        document.getElementById('dev-ram-slots').value = item.devRamSlots || '';
        document.getElementById('dev-ssd').value = item.devSsd;
        document.getElementById('dev-hdd').value = item.devHdd;
        document.getElementById('dev-vga').value = item.devVga;
        document.getElementById('key-win').value = item.keyWin;
        document.getElementById('key-office').value = item.keyOffice;
        document.getElementById('key-pdf').value = item.keyPdf;
        document.getElementById('dev-notes').value = item.devNotes || '';
        document.getElementById('dev-apps').value = item.devApps || '';
        document.getElementById('dev-status').value = item.devStatus || '';
        document.getElementById('dev-monitor').value = item.devMonitor || '';
        document.getElementById('dev-cables').value = item.devCables || '';

        btnSaveThietBi.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Cấp Phát';
        btnCancelThietBi.classList.remove('hidden');

        // Scroll to top of tab view to see form
        document.querySelector('.tab-container').scrollTop = 0;

        // Switch tab to cap-phat-form (1.1)
        menuItems.forEach(btn => {
            if (btn.getAttribute('data-tab') === 'tab-cap-phat-form') {
                btn.click();
            }
        });
        
        // Remove error states if any
        document.getElementById('err-user-id').style.display = 'none';
        document.getElementById('err-dev-id').style.display = 'none';
        userIdInput.style.borderColor = '';
        devIdInput.style.borderColor = '';
    }

    function deleteThietBi(index) {
        if (confirm(`Bạn có chắc chắn muốn xóa cấp phát thiết bị của nhân sự ${thietBiList[index].userName} (${thietBiList[index].userId})?`)) {
            thietBiList.splice(index, 1);
            saveState.thietBi();
            renderThietBi();
            showToast('Đã xóa', 'Xóa thông tin cấp phát thành công!', 'warning');
            
            // If deleting the item currently being edited, reset the form status
            if (editIndexThietBi.value === index.toString()) {
                resetFormThietBi();
            }
        }
    }

    function resetFormThietBi() {
        editIndexThietBi.value = '';
        btnSaveThietBi.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Thông Tin Mới';
        btnCancelThietBi.classList.add('hidden');
        formCapPhat.reset();

        document.getElementById('err-user-id').style.display = 'none';
        document.getElementById('err-dev-id').style.display = 'none';
        userIdInput.style.borderColor = '';
        devIdInput.style.borderColor = '';
    }

    btnCancelThietBi.addEventListener('click', resetFormThietBi);
    
    // Realtime search and pagination triggers for Device List
    searchThietBi.addEventListener('input', (e) => {
        currentPageThietBi = 1;
        renderThietBi(e.target.value.trim());
    });

    document.getElementById('btn-prev-page').addEventListener('click', () => {
        if (currentPageThietBi > 1) {
            currentPageThietBi--;
            renderThietBi(searchThietBi.value.trim());
        }
    });

    document.getElementById('btn-next-page').addEventListener('click', () => {
        const keyword = searchThietBi.value.trim().toLowerCase();
        const totalItems = thietBiList.filter(item => {
            return (
                (item.userId || '').toLowerCase().includes(keyword) ||
                (item.userName || '').toLowerCase().includes(keyword) ||
                (item.devId || '').toLowerCase().includes(keyword) ||
                (item.userDept || '').toLowerCase().includes(keyword)
            );
        }).length;
        const totalPages = Math.ceil(totalItems / itemsPerPageThietBi) || 1;
        if (currentPageThietBi < totalPages) {
            currentPageThietBi++;
            renderThietBi(searchThietBi.value.trim());
        }
    });


    // =========================================================================
    // 6. PHÂN HỆ 2: THÔNG TIN CÔNG TY
    // =========================================================================
    const formCongTy = document.getElementById('form-cong-ty');
    const tbodyCongTy = document.getElementById('tbody-cong-ty');
    const searchCongTy = document.getElementById('search-cong-ty');
    const btnCancelCongTy = document.getElementById('btn-cancel-cong-ty');
    const btnSaveCongTy = document.getElementById('btn-save-cong-ty');
    const editIndexCongTy = document.getElementById('edit-index-cong-ty');

    function renderCongTy(filterText = '') {
        tbodyCongTy.innerHTML = '';
        
        const filtered = congTyList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.code || '').toLowerCase().includes(keyword) ||
                (item.name || '').toLowerCase().includes(keyword) ||
                (item.taxCode || '').toLowerCase().includes(keyword) ||
                (item.rep || '').toLowerCase().includes(keyword)
            );
        });

        if (filtered.length === 0) {
            tbodyCongTy.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6" class="text-center text-muted">Chưa có dữ liệu công ty nào!</td>
                </tr>
            `;
            return;
        }

        filtered.forEach((item, index) => {
            const originalIndex = congTyList.indexOf(item);
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td><span class="badge badge-blue">${item.code}</span></td>
                <td>
                    <strong>${item.name}</strong>
                </td>
                <td><span style="font-family: monospace; font-weight: 500;">${item.taxCode}</span></td>
                <td>
                    <div style="font-size: 13px;">
                        <span>${item.rep}</span>
                        <div class="text-muted" style="font-size: 11px;">CV: ${item.repRole}</div>
                    </div>
                </td>
                <td style="font-size: 13px; max-width: 250px;">${item.address}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-only edit btn-edit-congty" data-index="${originalIndex}" title="Sửa">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon-only delete btn-delete-congty" data-index="${originalIndex}" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbodyCongTy.appendChild(tr);
        });

        // Actions
        document.querySelectorAll('.btn-edit-congty').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                editCongTy(idx);
            });
        });

        document.querySelectorAll('.btn-delete-congty').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                deleteCongTy(idx);
            });
        });
    }

    formCongTy.addEventListener('submit', (e) => {
        e.preventDefault();
        const indexStr = editIndexCongTy.value;

        const data = {
            code: document.getElementById('company-code').value.trim(),
            name: document.getElementById('company-name').value.trim(),
            taxCode: document.getElementById('company-tax-code').value.trim(), // string type to hold leading 0
            rep: document.getElementById('company-rep').value.trim(),
            repRole: document.getElementById('company-rep-role').value.trim(),
            address: document.getElementById('company-address').value.trim()
        };

        if (indexStr === '') {
            congTyList.push(data);
            showToast('Thành công', 'Đã lưu thông tin công ty mới!');
        } else {
            const idx = parseInt(indexStr);
            congTyList[idx] = data;
            showToast('Thành công', 'Đã cập nhật thông tin công ty!');
            resetFormCongTy();
        }

        saveState.congTy();
        renderCongTy();
        formCongTy.reset();
        resetFormCongTy();
    });

    function editCongTy(index) {
        const item = congTyList[index];
        editIndexCongTy.value = index;

        document.getElementById('company-code').value = item.code;
        document.getElementById('company-name').value = item.name;
        document.getElementById('company-tax-code').value = item.taxCode;
        document.getElementById('company-rep').value = item.rep;
        document.getElementById('company-rep-role').value = item.repRole;
        document.getElementById('company-address').value = item.address;

        btnSaveCongTy.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Công Ty';
        btnCancelCongTy.classList.remove('hidden');

        document.querySelector('.tab-container').scrollTop = 0;
    }

    function deleteCongTy(index) {
        if (confirm(`Bạn có chắc chắn muốn xóa thông tin công ty: ${congTyList[index].name}?`)) {
            congTyList.splice(index, 1);
            saveState.congTy();
            renderCongTy();
            showToast('Đã xóa', 'Xóa thông tin công ty thành công!', 'warning');

            if (editIndexCongTy.value === index.toString()) {
                resetFormCongTy();
            }
        }
    }

    function resetFormCongTy() {
        editIndexCongTy.value = '';
        btnSaveCongTy.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Thông Tin Công Ty';
        btnCancelCongTy.classList.add('hidden');
        formCongTy.reset();
    }

    btnCancelCongTy.addEventListener('click', resetFormCongTy);
    searchCongTy.addEventListener('input', (e) => {
        renderCongTy(e.target.value.trim());
    });


    // =========================================================================
    // 7. PHÂN HỆ 3: TÀI KHOẢN (ACCOUNT)
    // =========================================================================
    const formAccount = document.getElementById('form-account');
    const tbodyAccount = document.getElementById('tbody-account');
    const searchAccount = document.getElementById('search-account');
    const btnCancelAccount = document.getElementById('btn-cancel-account');
    const btnSaveAccount = document.getElementById('btn-save-account');
    const editIndexAccount = document.getElementById('edit-index-account');

    function renderAccount(filterText = '') {
        tbodyAccount.innerHTML = '';
        
        const filtered = accountList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.func || '').toLowerCase().includes(keyword) ||
                (item.ip || '').toLowerCase().includes(keyword) ||
                (item.username || '').toLowerCase().includes(keyword)
            );
        });

        if (filtered.length === 0) {
            tbodyAccount.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5" class="text-center text-muted">Chưa có dữ liệu tài khoản!</td>
                </tr>
            `;
            return;
        }

        filtered.forEach((item, index) => {
            const originalIndex = accountList.indexOf(item);
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td><strong>${item.func}</strong></td>
                <td><span class="badge badge-blue">${item.ip || 'Local/Cloud'}</span></td>
                <td><span style="font-family: monospace; font-size: 14px;">${item.username}</span></td>
                <td>
                    <div class="password-hidden-container" style="display: flex; align-items: center; gap: 8px;">
                        <span class="masked-pass" style="font-family: monospace;">••••••••</span>
                        <span class="raw-pass hidden" style="font-family: monospace; font-weight: 500;">${item.password}</span>
                        <button class="btn-toggle-row-password" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;" tabindex="-1">
                            <i class="fa-regular fa-eye"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-only edit btn-edit-account" data-index="${originalIndex}" title="Sửa">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon-only delete btn-delete-account" data-index="${originalIndex}" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbodyAccount.appendChild(tr);
        });

        // Row password toggle event
        document.querySelectorAll('.btn-toggle-row-password').forEach(btn => {
            btn.addEventListener('click', function() {
                const parent = this.parentNode;
                const masked = parent.querySelector('.masked-pass');
                const raw = parent.querySelector('.raw-pass');
                const icon = this.querySelector('i');

                if (raw.classList.contains('hidden')) {
                    raw.classList.remove('hidden');
                    masked.classList.add('hidden');
                    icon.className = 'fa-regular fa-eye-slash';
                } else {
                    raw.classList.add('hidden');
                    masked.classList.remove('hidden');
                    icon.className = 'fa-regular fa-eye';
                }
            });
        });

        // Actions
        document.querySelectorAll('.btn-edit-account').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                editAccount(idx);
            });
        });

        document.querySelectorAll('.btn-delete-account').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                deleteAccount(idx);
            });
        });
    }

    formAccount.addEventListener('submit', (e) => {
        e.preventDefault();
        const indexStr = editIndexAccount.value;

        const data = {
            func: document.getElementById('acc-func').value.trim(),
            ip: document.getElementById('acc-ip').value.trim(),
            username: document.getElementById('acc-username').value.trim(),
            password: document.getElementById('acc-password').value.trim()
        };

        if (indexStr === '') {
            accountList.push(data);
            showToast('Thành công', 'Đã lưu tài khoản mới!');
        } else {
            const idx = parseInt(indexStr);
            accountList[idx] = data;
            showToast('Thành công', 'Đã cập nhật thông tin tài khoản!');
            resetFormAccount();
        }

        saveState.account();
        renderAccount();
        formAccount.reset();
        resetFormAccount();
    });

    function editAccount(index) {
        const item = accountList[index];
        editIndexAccount.value = index;

        document.getElementById('acc-func').value = item.func;
        document.getElementById('acc-ip').value = item.ip;
        document.getElementById('acc-username').value = item.username;
        document.getElementById('acc-password').value = item.password;

        // Reset toggled raw pass view inside input if it was open
        const passInput = document.getElementById('acc-password');
        passInput.type = 'password';
        const toggleBtn = passInput.nextElementSibling;
        toggleBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';

        btnSaveAccount.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Tài Khoản';
        btnCancelAccount.classList.remove('hidden');

        document.querySelector('.tab-container').scrollTop = 0;
    }

    function deleteAccount(index) {
        if (confirm(`Bạn có chắc chắn muốn xóa tài khoản thuộc chức năng: ${accountList[index].func}?`)) {
            accountList.splice(index, 1);
            saveState.account();
            renderAccount();
            showToast('Đã xóa', 'Xóa tài khoản thành công!', 'warning');

            if (editIndexAccount.value === index.toString()) {
                resetFormAccount();
            }
        }
    }

    function resetFormAccount() {
        editIndexAccount.value = '';
        btnSaveAccount.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Tài Khoản';
        btnCancelAccount.classList.add('hidden');
        formAccount.reset();

        const passInput = document.getElementById('acc-password');
        passInput.type = 'password';
        const toggleBtn = passInput.nextElementSibling;
        toggleBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }

    btnCancelAccount.addEventListener('click', resetFormAccount);
    searchAccount.addEventListener('input', (e) => {
        renderAccount(e.target.value.trim());
    });


    // =========================================================================
    // 8. PHÂN HỆ 4: TRANG HỖ TRỢ
    // =========================================================================
    const formHoTro = document.getElementById('form-ho-tro');
    const tbodyHoTro = document.getElementById('tbody-ho-tro');
    const searchHoTro = document.getElementById('search-ho-tro');
    const btnCancelHoTro = document.getElementById('btn-cancel-ho-tro');
    const btnSaveHoTro = document.getElementById('btn-save-ho-tro');
    const editIndexHoTro = document.getElementById('edit-index-ho-tro');

    function renderHoTro(filterText = '') {
        tbodyHoTro.innerHTML = '';
        
        const filtered = hoTroList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.unit || '').toLowerCase().includes(keyword) ||
                (item.name || '').toLowerCase().includes(keyword) ||
                (item.phone || '').toLowerCase().includes(keyword) ||
                (item.scope || '').toLowerCase().includes(keyword)
            );
        });

        if (filtered.length === 0) {
            tbodyHoTro.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5" class="text-center text-muted">Chưa có thông tin hỗ trợ nào!</td>
                </tr>
            `;
            return;
        }

        filtered.forEach((item, index) => {
            const originalIndex = hoTroList.indexOf(item);
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td><strong>${item.unit}</strong></td>
                <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${item.name}</div>
                </td>
                <td>
                    <a href="tel:${item.phone}" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">
                        <i class="fa-solid fa-phone"></i> ${item.phone}
                    </a>
                </td>
                <td><span class="badge badge-yellow">${item.scope}</span></td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-only edit btn-edit-hotro" data-index="${originalIndex}" title="Sửa">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon-only delete btn-delete-hotro" data-index="${originalIndex}" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbodyHoTro.appendChild(tr);
        });

        // Actions
        document.querySelectorAll('.btn-edit-hotro').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                editHoTro(idx);
            });
        });

        document.querySelectorAll('.btn-delete-hotro').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                deleteHoTro(idx);
            });
        });
    }

    formHoTro.addEventListener('submit', (e) => {
        e.preventDefault();
        const indexStr = editIndexHoTro.value;

        const data = {
            unit: document.getElementById('support-unit').value.trim(),
            name: document.getElementById('support-name').value.trim(),
            phone: document.getElementById('support-phone').value.trim(),
            scope: document.getElementById('support-scope').value.trim()
        };

        if (indexStr === '') {
            hoTroList.push(data);
            showToast('Thành công', 'Đã thêm thông tin hỗ trợ mới!');
        } else {
            const idx = parseInt(indexStr);
            hoTroList[idx] = data;
            showToast('Thành công', 'Đã cập nhật thông tin hỗ trợ!');
            resetFormHoTro();
        }

        saveState.hoTro();
        renderHoTro();
        formHoTro.reset();
        resetFormHoTro();
    });

    function editHoTro(index) {
        const item = hoTroList[index];
        editIndexHoTro.value = index;

        document.getElementById('support-unit').value = item.unit;
        document.getElementById('support-name').value = item.name;
        document.getElementById('support-phone').value = item.phone;
        document.getElementById('support-scope').value = item.scope;

        btnSaveHoTro.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Hỗ Trợ';
        btnCancelHoTro.classList.remove('hidden');

        document.querySelector('.tab-container').scrollTop = 0;
    }

    function deleteHoTro(index) {
        if (confirm(`Bạn có chắc chắn muốn xóa thông tin hỗ trợ của đầu mối: ${hoTroList[index].name}?`)) {
            hoTroList.splice(index, 1);
            saveState.hoTro();
            renderHoTro();
            showToast('Đã xóa', 'Xóa thông tin hỗ trợ thành công!', 'warning');

            if (editIndexHoTro.value === index.toString()) {
                resetFormHoTro();
            }
        }
    }

    function resetFormHoTro() {
        editIndexHoTro.value = '';
        btnSaveHoTro.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Thông Tin Hỗ Trợ';
        btnCancelHoTro.classList.add('hidden');
        formHoTro.reset();
    }

    btnCancelHoTro.addEventListener('click', resetFormHoTro);
    searchHoTro.addEventListener('input', (e) => {
        renderHoTro(e.target.value.trim());
    });


    // =========================================================================
    // 9. PHÂN HỆ 5: THÔNG TIN CAMERA
    // =========================================================================
    const formCamera = document.getElementById('form-camera');
    const tbodyCamera = document.getElementById('tbody-camera');
    const searchCamera = document.getElementById('search-camera');
    const btnCancelCamera = document.getElementById('btn-cancel-camera');
    const btnSaveCamera = document.getElementById('btn-save-camera');
    const editIndexCamera = document.getElementById('edit-index-camera');

    function renderCamera(filterText = '') {
        tbodyCamera.innerHTML = '';
        
        const filtered = cameraList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.project || '').toLowerCase().includes(keyword) ||
                (item.device || '').toLowerCase().includes(keyword) ||
                (item.ipWan || '').toLowerCase().includes(keyword)
            );
        });

        if (filtered.length === 0) {
            tbodyCamera.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6" class="text-center text-muted">Chưa có thông tin camera nào!</td>
                </tr>
            `;
            return;
        }

        filtered.forEach((item, index) => {
            const originalIndex = cameraList.indexOf(item);
            const tr = document.createElement('tr');
            
            // Format ports display list
            const portList = [];
            if (item.rtsp) portList.push(`<div class="port-badge">RTSP: <span>${item.rtsp}</span></div>`);
            if (item.tcp) portList.push(`<div class="port-badge">TCP: <span>${item.tcp}</span></div>`);
            if (item.http) portList.push(`<div class="port-badge">HTTP: <span>${item.http}</span></div>`);
            if (item.https) portList.push(`<div class="port-badge">HTTPS: <span>${item.https}</span></div>`);
            const portsHTML = portList.length > 0 ? `<div class="ports-container">${portList.join('')}</div>` : '<span class="text-muted">Không mở port</span>';

            // ONVIF and Notes (Separated Columns)
            let onvifHTML = '<span class="text-muted" style="font-size: 12px; font-style: italic;">Không dùng ONVIF</span>';
            if (item.onvifUser) {
                onvifHTML = `
                    <div style="font-size: 12px;">
                        <div style="margin-bottom: 2px;">User: <span style="font-family: monospace; font-weight: 600;">${item.onvifUser}</span></div>
                        <div class="password-hidden-container" style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                            <span>Pass: </span>
                            <span class="masked-pass" style="font-family: monospace;">••••••••</span>
                            <span class="raw-pass hidden" style="font-family: monospace; font-weight: 500;">${item.onvifPass || ''}</span>
                            <button class="btn-toggle-row-password" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;" tabindex="-1">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
            const notesHTML = item.notes ? `<span class="text-secondary" style="font-size: 12px; font-style: italic;">${item.notes}</span>` : '<span class="text-muted">—</span>';

            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${item.project}</div>
                    <div class="text-secondary" style="font-size: 12px; margin-top: 2px;">${item.device}</div>
                </td>
                <td>
                    <span style="font-family: monospace; font-size: 13px; font-weight: 600;">${item.ipWan}</span>
                </td>
                <td>
                    ${portsHTML}
                </td>
                <td>
                    <div style="font-size: 12px;">
                        <div>User: <span style="font-family: monospace; font-weight: 600;">${item.username}</span></div>
                        <div class="password-hidden-container" style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                            <span>Pass: </span>
                            <span class="masked-pass" style="font-family: monospace;">••••••••</span>
                            <span class="raw-pass hidden" style="font-family: monospace; font-weight: 500;">${item.password}</span>
                            <button class="btn-toggle-row-password" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;" tabindex="-1">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </td>
                <td>
                    ${onvifHTML}
                </td>
                <td>
                    ${notesHTML}
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-only edit btn-edit-camera" data-index="${originalIndex}" title="Sửa">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon-only delete btn-delete-camera" data-index="${originalIndex}" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbodyCamera.appendChild(tr);
        });

        // Row password toggle event for Camera row
        document.querySelectorAll('#tbody-camera .btn-toggle-row-password').forEach(btn => {
            btn.addEventListener('click', function() {
                const parent = this.parentNode;
                const masked = parent.querySelector('.masked-pass');
                const raw = parent.querySelector('.raw-pass');
                const icon = this.querySelector('i');

                if (raw.classList.contains('hidden')) {
                    raw.classList.remove('hidden');
                    masked.classList.add('hidden');
                    icon.className = 'fa-regular fa-eye-slash';
                } else {
                    raw.classList.add('hidden');
                    masked.classList.remove('hidden');
                    icon.className = 'fa-regular fa-eye';
                }
            });
        });

        // Actions
        document.querySelectorAll('.btn-edit-camera').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                editCamera(idx);
            });
        });

        document.querySelectorAll('.btn-delete-camera').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                deleteCamera(idx);
            });
        });
    }

    formCamera.addEventListener('submit', (e) => {
        e.preventDefault();
        const indexStr = editIndexCamera.value;

        const data = {
            project: document.getElementById('cam-project').value.trim(),
            device: document.getElementById('cam-device').value.trim(),
            ipWan: document.getElementById('cam-ip-wan').value.trim(),
            rtsp: document.getElementById('cam-rtsp').value.trim(),
            tcp: document.getElementById('cam-tcp').value.trim(),
            http: document.getElementById('cam-http').value.trim(),
            https: document.getElementById('cam-https').value.trim(),
            username: document.getElementById('cam-username').value.trim(),
            password: document.getElementById('cam-password').value.trim(),
            notes: document.getElementById('cam-notes').value.trim(),
            onvifUser: document.getElementById('cam-onvif-user').value.trim(),
            onvifPass: document.getElementById('cam-onvif-pass').value.trim()
        };

        if (indexStr === '') {
            cameraList.push(data);
            showToast('Thành công', 'Đã lưu thông tin camera mới!');
        } else {
            const idx = parseInt(indexStr);
            cameraList[idx] = data;
            showToast('Thành công', 'Đã cập nhật thông tin camera!');
            resetFormCamera();
        }

        saveState.camera();
        renderCamera();
        formCamera.reset();
        resetFormCamera();
    });

    function editCamera(index) {
        const item = cameraList[index];
        editIndexCamera.value = index;

        document.getElementById('cam-project').value = item.project;
        document.getElementById('cam-device').value = item.device;
        document.getElementById('cam-ip-wan').value = item.ipWan;
        document.getElementById('cam-rtsp').value = item.rtsp;
        document.getElementById('cam-tcp').value = item.tcp;
        document.getElementById('cam-http').value = item.http;
        document.getElementById('cam-https').value = item.https;
        document.getElementById('cam-username').value = item.username;
        document.getElementById('cam-password').value = item.password;
        document.getElementById('cam-notes').value = item.notes;
        document.getElementById('cam-onvif-user').value = item.onvifUser;
        document.getElementById('cam-onvif-pass').value = item.onvifPass;

        btnSaveCamera.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Camera';
        btnCancelCamera.classList.remove('hidden');

        document.querySelector('.tab-container').scrollTop = 0;
    }

    function deleteCamera(index) {
        if (confirm(`Bạn có chắc chắn muốn xóa thông tin camera dự án: ${cameraList[index].project}?`)) {
            cameraList.splice(index, 1);
            saveState.camera();
            renderCamera();
            showToast('Đã xóa', 'Xóa thông tin camera thành công!', 'warning');

            if (editIndexCamera.value === index.toString()) {
                resetFormCamera();
            }
        }
    }

    function resetFormCamera() {
        editIndexCamera.value = '';
        btnSaveCamera.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Thông Tin Camera';
        btnCancelCamera.classList.add('hidden');
        formCamera.reset();
    }

    btnCancelCamera.addEventListener('click', resetFormCamera);
    searchCamera.addEventListener('input', (e) => {
        renderCamera(e.target.value.trim());
    });


    // =========================================================================
    // 9. PHÂN HỆ 6: QUẢN LÝ TIP & TRICK
    // =========================================================================
    const formTips = document.getElementById('form-tips');
    const tbodyTips = document.getElementById('tbody-tips');
    const searchTips = document.getElementById('search-tips');
    const btnCancelTips = document.getElementById('btn-cancel-tips');
    const btnSaveTips = document.getElementById('btn-save-tips');
    const editIndexTips = document.getElementById('edit-index-tips');

    function renderTips(filterText = "") {
        tbodyTips.innerHTML = '';
        
        const filtered = tipsList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.issue || '').toLowerCase().includes(keyword) ||
                (item.solution || '').toLowerCase().includes(keyword)
            );
        });

        if (filtered.length === 0) {
            tbodyTips.innerHTML = `
                <tr class="empty-row">
                    <td colspan="3" class="text-center text-muted">Chưa có bài viết Tip & Trick nào!</td>
                </tr>
            `;
            return;
        }

        filtered.forEach((item, index) => {
            const originalIndex = tipsList.indexOf(item);
            
            const tr = document.createElement('tr');
            const formattedSolution = item.solution.replace(/\n/g, '<br>');

            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 14px;">
                        ${item.issue}
                    </div>
                </td>
                <td>
                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; max-height: 200px; overflow-y: auto;">
                        ${formattedSolution}
                    </div>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-only edit btn-edit-tips" data-index="${originalIndex}" title="Sửa">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon-only delete btn-delete-tips" data-index="${originalIndex}" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbodyTips.appendChild(tr);
        });

        document.querySelectorAll('.btn-edit-tips').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                editTips(idx);
            });
        });

        document.querySelectorAll('.btn-delete-tips').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                deleteTips(idx);
            });
        });
    }

    formTips.addEventListener('submit', (e) => {
        e.preventDefault();
        const indexStr = editIndexTips.value;

        const data = {
            issue: document.getElementById('tip-issue').value.trim(),
            solution: document.getElementById('tip-solution').value.trim()
        };

        if (indexStr === '') {
            tipsList.push(data);
            showToast('Thành công', 'Đã lưu Tip & Trick mới!');
        } else {
            const idx = parseInt(indexStr);
            tipsList[idx] = data;
            showToast('Thành công', 'Đã cập nhật bài viết Tip & Trick!');
            resetFormTips();
        }

        saveState.tips();
        renderTips();
        formTips.reset();
        resetFormTips();
    });

    function editTips(index) {
        const item = tipsList[index];
        editIndexTips.value = index;
        
        document.getElementById('tip-issue').value = item.issue;
        document.getElementById('tip-solution').value = item.solution;

        btnSaveTips.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Tip & Trick';
        btnCancelTips.classList.remove('hidden');

        document.querySelector('.tab-container').scrollTop = 0;
    }

    function deleteTips(index) {
        if (confirm(`Bạn có chắc chắn muốn xóa bài viết Tip & Trick: "${tipsList[index].issue}"?`)) {
            tipsList.splice(index, 1);
            saveState.tips();
            renderTips();
            showToast('Đã xóa', 'Xóa Tip & Trick thành công!', 'warning');

            if (editIndexTips.value === index.toString()) {
                resetFormTips();
            }
        }
    }

    function resetFormTips() {
        editIndexTips.value = '';
        btnSaveTips.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Tip & Trick';
        btnCancelTips.classList.add('hidden');
        formTips.reset();
    }

    btnCancelTips.addEventListener('click', resetFormTips);
    searchTips.addEventListener('input', (e) => {
        renderTips(e.target.value.trim());
    });


    // =========================================================================
    // 10. INITIALIZATION RUN
    // =========================================================================
    // Render all lists at initial load
    renderThietBi();
    renderCongTy();
    renderAccount();
    renderHoTro();
    renderCamera();
    renderTips();

    // Show a welcome message toast
    showToast('Chào mừng', 'ERG Asset đã sẵn sàng hoạt động!', 'success');
});
