/**
 * ERG Asset - Hệ Thống Quản Lý Thiết Bị & Tài Sản
 * File: app.js
 */

document.addEventListener('DOMContentLoaded', async () => {
    // -------------------------------------------------------------------------
    // 1. SUPABASE CLIENT & STATE INIT
    // -------------------------------------------------------------------------
    
    const supabaseUrl = 'https://nmfeyrokdfjrsbmtxwts.supabase.co';
    const supabaseKey = 'sb_publishable_xkNEdZfr-_zenINmII9zPg_VhaFkGOX';
    let supabaseClient = null;
    try {
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
        } else {
            console.error("Supabase SDK is not loaded. Please make sure index.html has the Supabase script tag.");
            setTimeout(() => {
                showToast("Lỗi hệ thống", "Không thể nạp thư viện Supabase. Hãy kiểm tra lại file index.html!", "error");
            }, 1000);
        }
    } catch (e) {
        console.error("Error initializing Supabase client:", e);
    }

    let thietBiList = [];
    let congTyList = [];
    let accountList = [];
    let hoTroList = [];
    let cameraList = [];
    let tipsList = [];

    // Keep saveState empty mock for backward compatibility
    const saveState = {
        thietBi: () => {},
        congTy: () => {},
        account: () => {},
        hoTro: () => {},
        camera: () => {},
        tips: () => {}
    };

    // Mappers to translate between Javascript camelCase and PostgreSQL snake_case
    const mappers = {
        thietBi: {
            fromDB: (db) => ({
                id: db.id,
                userId: db.user_id,
                userName: db.user_name,
                userTitle: db.user_title || '',
                userDept: db.user_dept || '',
                userEmail: db.user_email || '',
                userPhone: db.user_phone || '',
                devId: db.dev_id || '',
                devType: db.dev_type || '',
                devMain: db.dev_main || '',
                devCpu: db.dev_cpu || '',
                devRam: db.dev_ram || '',
                devRamSlots: db.dev_ram_slots || '',
                devSsd: db.dev_ssd || '',
                devHdd: db.dev_hdd || '',
                devVga: db.dev_vga || '',
                devMonitor: db.dev_monitor || '',
                devCables: db.dev_cables || '',
                keyWin: db.key_win || '',
                keyOffice: db.key_office || '',
                keyPdf: db.key_pdf || '',
                devNotes: db.dev_notes || '',
                devApps: db.dev_apps || '',
                devStatus: db.dev_status || '',
                updatedAt: db.updated_at || '',
                history: db.history || []
            }),
            toDB: (js) => ({
                user_id: js.userId,
                user_name: js.userName,
                user_title: js.userTitle,
                user_dept: js.userDept,
                user_email: js.userEmail,
                user_phone: js.userPhone,
                dev_id: js.devId || null,
                dev_type: js.devType,
                dev_main: js.devMain,
                dev_cpu: js.devCpu,
                dev_ram: js.devRam,
                dev_ram_slots: js.devRamSlots,
                dev_ssd: js.devSsd,
                dev_hdd: js.devHdd,
                dev_vga: js.devVga,
                dev_monitor: js.devMonitor,
                dev_cables: js.devCables,
                key_win: js.keyWin,
                key_office: js.keyOffice,
                key_pdf: js.keyPdf,
                dev_notes: js.devNotes,
                dev_apps: js.devApps,
                dev_status: js.devStatus,
                updated_at: new Date().toISOString(),
                history: js.history
            })
        },
        congTy: {
            fromDB: (db) => ({
                id: db.id,
                code: db.code,
                name: db.name,
                taxCode: db.tax_code || '',
                rep: db.rep || '',
                repRole: db.rep_role || '',
                address: db.address || ''
            }),
            toDB: (js) => ({
                code: js.code,
                name: js.name,
                tax_code: js.taxCode,
                rep: js.rep,
                rep_role: js.repRole,
                address: js.address
            })
        },
        account: {
            fromDB: (db) => ({
                id: db.id,
                func: db.func,
                ip: db.ip || '',
                username: db.username,
                password: db.password,
                notes: db.notes || ''
            }),
            toDB: (js) => ({
                func: js.func,
                ip: js.ip,
                username: js.username,
                password: js.password,
                notes: js.notes
            })
        },
        hoTro: {
            fromDB: (db) => ({
                id: db.id,
                unit: db.unit,
                name: db.name,
                phone: db.phone || '',
                scope: db.scope || '',
                hasZalo: !!db.has_zalo,
                role: db.role || ''
            }),
            toDB: (js) => ({
                unit: js.unit,
                name: js.name,
                phone: js.phone,
                scope: js.scope,
                has_zalo: js.hasZalo || false,
                role: js.role
            })
        },
        camera: {
            fromDB: (db) => ({
                id: db.id,
                project: db.project,
                device: db.device || '',
                ipWan: db.ip_wan || '',
                rtsp: db.rtsp || '',
                tcp: db.tcp || '',
                http: db.http || '',
                https: db.https || '',
                username: db.username || '',
                password: db.password || '',
                notes: db.notes || '',
                onvifUser: db.onvif_user || '',
                onvifPass: db.onvif_pass || ''
            }),
            toDB: (js) => ({
                project: js.project,
                device: js.device,
                ip_wan: js.ipWan,
                rtsp: js.rtsp,
                tcp: js.tcp,
                http: js.http,
                https: js.https,
                username: js.username,
                password: js.password,
                notes: js.notes,
                onvif_user: js.onvifUser,
                onvif_pass: js.onvifPass
            })
        },
        tips: {
            fromDB: (db) => ({
                id: db.id,
                issue: db.issue,
                solution: db.solution
            }),
            toDB: (js) => ({
                issue: js.issue,
                solution: js.solution
            })
        },
        giaHan: {
            fromDB: (db) => ({
                id: db.id,
                name: db.name,
                provider: db.provider || '',
                notes: db.notes || '',
                expiryDate: db.expiry_date
            }),
            toDB: (js) => ({
                name: js.name,
                provider: js.provider || null,
                notes: js.notes || null,
                expiry_date: js.expiryDate
            })
        }
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

    function updateDeptFilterThietBi() {
        const select = document.getElementById('filter-dept-thietbi');
        if (!select) return;
        const currentValue = select.value;
        
        const depts = [...new Set(thietBiList.map(item => (item.userDept || '').trim()).filter(Boolean))];
        depts.sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
        
        select.innerHTML = '<option value="">-- Tất cả phòng ban --</option>';
        depts.forEach(dept => {
            const opt = document.createElement('option');
            opt.value = dept;
            opt.textContent = dept;
            select.appendChild(opt);
        });
        
        if (depts.includes(currentValue)) {
            select.value = currentValue;
        } else {
            select.value = '';
        }
    }

    function initCustomAutocompletes() {
        const targetIds = [
            'user-dept',
            'dev-type',
            'dev-main',
            'dev-cpu',
            'dev-ssd',
            'dev-hdd',
            'dev-monitor',
            'dev-vga'
        ];

        targetIds.forEach(id => {
            const input = document.getElementById(id);
            if (!input) return;

            const parent = input.parentElement;
            if (parent) {
                parent.style.position = 'relative';
            }

            let activeIndex = -1;
            let currentSuggestions = [];
            let isSelectingSuggestion = false;

            function getUniqueValuesFor(fieldId) {
                const uniqueSet = new Set();
                thietBiList.forEach(item => {
                    let val = '';
                    if (fieldId === 'user-dept') val = item.userDept;
                    else if (fieldId === 'dev-type') val = item.devType;
                    else if (fieldId === 'dev-main') val = item.devMain;
                    else if (fieldId === 'dev-cpu') val = item.devCpu;
                    else if (fieldId === 'dev-ssd') val = item.devSsd;
                    else if (fieldId === 'dev-hdd') val = item.devHdd;
                    else if (fieldId === 'dev-monitor') val = item.devMonitor;
                    else if (fieldId === 'dev-vga') val = item.devVga;

                    if (val && val.trim() !== '') {
                        uniqueSet.add(val.trim());
                    }
                });
                return Array.from(uniqueSet).sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
            }

            function closeAllDropdowns() {
                const existing = document.querySelectorAll('.autocomplete-suggestions');
                existing.forEach(el => el.remove());
                activeIndex = -1;
            }

            function closeCurrentDropdown() {
                const dropdown = parent.querySelector('.autocomplete-suggestions');
                if (dropdown) {
                    dropdown.remove();
                }
                activeIndex = -1;
            }

            function showDropdown(query = '') {
                closeAllDropdowns();
                const allValues = getUniqueValuesFor(id);
                const filtered = allValues.filter(val => val.toLowerCase().includes(query.toLowerCase()));
                
                if (filtered.length === 0) return;

                currentSuggestions = filtered;

                const dropdown = document.createElement('div');
                dropdown.className = 'autocomplete-suggestions';
                dropdown.style.width = input.offsetWidth + 'px';

                filtered.forEach((val, idx) => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-suggestion-item';
                    item.innerText = val;
                    // Sử dụng mousedown và e.preventDefault() để ngăn input bị blur trước khi dữ liệu được chọn
                    item.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        isSelectingSuggestion = true;
                        input.value = val;
                        input.dispatchEvent(new Event('input'));
                        input.dispatchEvent(new Event('change'));
                        closeCurrentDropdown();
                        isSelectingSuggestion = false;
                    });
                    dropdown.appendChild(item);
                });

                parent.appendChild(dropdown);
            }

            input.addEventListener('input', (e) => {
                if (isSelectingSuggestion) return;
                showDropdown(e.target.value);
            });

            input.addEventListener('keydown', (e) => {
                const dropdown = parent.querySelector('.autocomplete-suggestions');
                if (!dropdown) {
                    if (e.key === 'ArrowDown') {
                        showDropdown(input.value);
                    }
                    return;
                }

                const items = dropdown.querySelectorAll('.autocomplete-suggestion-item');
                if (items.length === 0) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    activeIndex++;
                    if (activeIndex >= items.length) activeIndex = 0;
                    updateActiveSuggestion(items);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    activeIndex--;
                    if (activeIndex < 0) activeIndex = items.length - 1;
                    updateActiveSuggestion(items);
                } else if (e.key === 'Enter') {
                    if (activeIndex >= 0 && activeIndex < items.length) {
                        e.preventDefault();
                        isSelectingSuggestion = true;
                        input.value = currentSuggestions[activeIndex];
                        input.dispatchEvent(new Event('input'));
                        input.dispatchEvent(new Event('change'));
                        closeCurrentDropdown();
                        isSelectingSuggestion = false;
                    }
                } else if (e.key === 'Escape') {
                    closeCurrentDropdown();
                }
            });

            function updateActiveSuggestion(items) {
                items.forEach((item, idx) => {
                    if (idx === activeIndex) {
                        item.classList.add('active');
                        item.scrollIntoView({ block: 'nearest' });
                    } else {
                        item.classList.remove('active');
                    }
                });
            }

            document.addEventListener('click', (e) => {
                const isClickInsideDropdown = parent.querySelector('.autocomplete-suggestions')?.contains(e.target);
                if (e.target !== input && !isClickInsideDropdown) {
                    closeCurrentDropdown();
                }
            });
        });
    }

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

        const deptFilter = document.getElementById('filter-dept-thietbi') 
            ? document.getElementById('filter-dept-thietbi').value 
            : '';

        // Safe filter matching keyword
        const keywords = filterText.toLowerCase().split(/\s+/).filter(Boolean);
        const filtered = sortedList.filter(item => {
            if (deptFilter && (item.userDept || '').trim() !== deptFilter) {
                return false;
            }
            if (keywords.length === 0) return true;
            
            const itemText = `
                ${item.userId || ''} 
                ${item.userName || ''} 
                ${item.devId || ''} 
                ${item.userDept || ''}
                ${item.devType || ''}
                ${item.devMain || ''}
                ${item.devCpu || ''}
                ${item.devRam || ''}
                ${item.devNotes || ''}
            `.toLowerCase();
            
            return keywords.every(kw => itemText.includes(kw));
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
                        <span class="name"><span class="btn-edit-thietbi" data-index="${originalIndex}" style="cursor: pointer; color: var(--primary-color);" title="Click để chỉnh sửa">${item.userName}</span> <span class="badge badge-blue">${item.userId}</span></span>
                        <span class="details">${item.userTitle ? item.userTitle + ' - ' : ''}${item.userDept || 'Không có phòng ban'}</span>
                        <span class="contact">${item.userEmail ? '<i class="fa-regular fa-envelope"></i> ' + item.userEmail : ''} ${item.userPhone ? ' | <i class="fa-solid fa-phone"></i> ' + item.userPhone : ''}</span>
                    </div>
                </td>
                <td>
                    <div class="user-info-cell">
                        ${(item.devId || item.devType || item.devMain || item.devCpu || item.devRam || item.devSsd || item.devHdd || item.devStatus) ? `
                            <span class="name">
                                ${item.devId ? `<span class="badge badge-green">${item.devId}</span>` : ''}
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
    formCapPhat.addEventListener('submit', async (e) => {
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
            try {
                const dbData = mappers.thietBi.toDB(data);
                const { data: insertedData, error } = await supabaseClient
                    .from('thiet_bi')
                    .insert([dbData])
                    .select();
                if (error) throw error;
                thietBiList.push(mappers.thietBi.fromDB(insertedData[0]));
                showToast('Thành công', 'Đã lưu thông tin cấp phát thiết bị mới!');
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể lưu dữ liệu lên Supabase!', 'error');
                return;
            }
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
            
            try {
                const dbData = mappers.thietBi.toDB(data);
                const { data: updatedData, error } = await supabaseClient
                    .from('thiet_bi')
                    .update(dbData)
                    .eq('id', oldItem.id)
                    .select();
                if (error) throw error;
                thietBiList[idx] = mappers.thietBi.fromDB(updatedData[0]);
                showToast('Thành công', 'Đã cập nhật thông tin cấp phát thiết bị!');
                resetFormThietBi();
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể cập nhật dữ liệu lên Supabase!', 'error');
                return;
            }
        }

        updateDeptFilterThietBi();
        renderThietBi();
        formCapPhat.reset();

        if (indexStr !== '') {
            resetFormThietBi();
            menuItems.forEach(btn => {
                if (btn.getAttribute('data-tab') === 'tab-cap-phat-list') {
                    btn.click();
                }
            });
        } else {
            resetFormThietBi();
        }
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

    async function deleteThietBi(index) {
        const item = thietBiList[index];
        if (confirm(`Bạn có chắc chắn muốn xóa cấp phát thiết bị của nhân sự ${item.userName} (${item.userId})?`)) {
            try {
                const { error } = await supabaseClient
                    .from('thiet_bi')
                    .delete()
                    .eq('id', item.id);
                if (error) throw error;
                thietBiList.splice(index, 1);
                updateDeptFilterThietBi();
                renderThietBi();
                showToast('Đã xóa', 'Xóa thông tin cấp phát thành công!', 'warning');
                
                // If deleting the item currently being edited, reset the form status
                if (editIndexThietBi.value === index.toString()) {
                    resetFormThietBi();
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể xóa dữ liệu trên Supabase!', 'error');
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

    btnCancelThietBi.addEventListener('click', () => {
        resetFormThietBi();
        menuItems.forEach(btn => {
            if (btn.getAttribute('data-tab') === 'tab-cap-phat-list') {
                btn.click();
            }
        });
    });
    
    // Realtime search and pagination triggers for Device List
    searchThietBi.addEventListener('input', (e) => {
        currentPageThietBi = 1;
        renderThietBi(e.target.value.trim());
    });

    const filterDeptThietBi = document.getElementById('filter-dept-thietbi');
    if (filterDeptThietBi) {
        filterDeptThietBi.addEventListener('change', () => {
            currentPageThietBi = 1;
            renderThietBi(searchThietBi.value.trim());
        });
    }

    document.getElementById('btn-prev-page').addEventListener('click', () => {
        if (currentPageThietBi > 1) {
            currentPageThietBi--;
            renderThietBi(searchThietBi.value.trim());
        }
    });

    document.getElementById('btn-next-page').addEventListener('click', () => {
        const keyword = searchThietBi.value.trim();
        const deptFilter = document.getElementById('filter-dept-thietbi') 
            ? document.getElementById('filter-dept-thietbi').value 
            : '';
        const keywords = keyword.toLowerCase().split(/\s+/).filter(Boolean);
        const totalItems = thietBiList.filter(item => {
            if (deptFilter && (item.userDept || '').trim() !== deptFilter) {
                return false;
            }
            if (keywords.length === 0) return true;
            const itemText = `
                ${item.userId || ''} 
                ${item.userName || ''} 
                ${item.devId || ''} 
                ${item.userDept || ''}
                ${item.devType || ''}
                ${item.devMain || ''}
                ${item.devCpu || ''}
                ${item.devRam || ''}
                ${item.devNotes || ''}
            `.toLowerCase();
            return keywords.every(kw => itemText.includes(kw));
        }).length;
        const totalPages = Math.ceil(totalItems / itemsPerPageThietBi) || 1;
        if (currentPageThietBi < totalPages) {
            currentPageThietBi++;
            renderThietBi(keyword);
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

    let currentPageCongTy = 1;
    const itemsPerPageCongTy = 10;

    function renderCongTy(filterText = '') {
        tbodyCongTy.innerHTML = '';
        
        const sortedList = [...congTyList].sort((a, b) => {
            const nameA = a.name ? a.name.trim() : "";
            const nameB = b.name ? b.name.trim() : "";
            return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
        });

        const filtered = sortedList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.code || '').toLowerCase().includes(keyword) ||
                (item.name || '').toLowerCase().includes(keyword) ||
                (item.taxCode || '').toLowerCase().includes(keyword) ||
                (item.rep || '').toLowerCase().includes(keyword)
            );
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageCongTy) || 1;
        if (currentPageCongTy > totalPages) currentPageCongTy = totalPages;
        if (currentPageCongTy < 1) currentPageCongTy = 1;

        const startIndex = (currentPageCongTy - 1) * itemsPerPageCongTy;
        const endIndex = Math.min(startIndex + itemsPerPageCongTy, totalItems);

        document.getElementById('pag-start-congty').innerText = totalItems > 0 ? startIndex + 1 : 0;
        document.getElementById('pag-end-congty').innerText = endIndex;
        document.getElementById('pag-total-congty').innerText = totalItems;
        document.getElementById('pag-current-congty').innerText = `Trang ${currentPageCongTy} / ${totalPages}`;

        const btnPrev = document.getElementById('btn-prev-page-congty');
        const btnNext = document.getElementById('btn-next-page-congty');
        
        btnPrev.disabled = currentPageCongTy === 1;
        btnNext.disabled = currentPageCongTy === totalPages;
        btnPrev.style.opacity = currentPageCongTy === 1 ? '0.5' : '1';
        btnPrev.style.cursor = currentPageCongTy === 1 ? 'not-allowed' : 'pointer';
        btnNext.style.opacity = currentPageCongTy === totalPages ? '0.5' : '1';
        btnNext.style.cursor = currentPageCongTy === totalPages ? 'not-allowed' : 'pointer';

        if (totalItems === 0) {
            tbodyCongTy.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6" class="text-center text-muted">Chưa có dữ liệu công ty nào!</td>
                </tr>
            `;
            return;
        }

        const pageItems = filtered.slice(startIndex, endIndex);

        pageItems.forEach((item, index) => {
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

    formCongTy.addEventListener('submit', async (e) => {
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
            try {
                const dbData = mappers.congTy.toDB(data);
                const { data: insertedData, error } = await supabaseClient
                    .from('cong_ty')
                    .insert([dbData])
                    .select();
                if (error) throw error;
                congTyList.push(mappers.congTy.fromDB(insertedData[0]));
                showToast('Thành công', 'Đã lưu thông tin công ty mới!');
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể lưu dữ liệu công ty lên Supabase!', 'error');
                return;
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = congTyList[idx];
            try {
                const dbData = mappers.congTy.toDB(data);
                const { data: updatedData, error } = await supabaseClient
                    .from('cong_ty')
                    .update(dbData)
                    .eq('id', oldItem.id)
                    .select();
                if (error) throw error;
                congTyList[idx] = mappers.congTy.fromDB(updatedData[0]);
                showToast('Thành công', 'Đã cập nhật thông tin công ty!');
                resetFormCongTy();
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể cập nhật dữ liệu công ty lên Supabase!', 'error');
                return;
            }
        }

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

    async function deleteCongTy(index) {
        const item = congTyList[index];
        if (confirm(`Bạn có chắc chắn muốn xóa thông tin công ty: ${item.name}?`)) {
            try {
                const { error } = await supabaseClient
                    .from('cong_ty')
                    .delete()
                    .eq('id', item.id);
                if (error) throw error;
                congTyList.splice(index, 1);
                renderCongTy();
                showToast('Đã xóa', 'Xóa thông tin công ty thành công!', 'warning');

                if (editIndexCongTy.value === index.toString()) {
                    resetFormCongTy();
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể xóa dữ liệu công ty trên Supabase!', 'error');
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
        currentPageCongTy = 1;
        renderCongTy(e.target.value.trim());
    });

    document.getElementById('btn-prev-page-congty').addEventListener('click', () => {
        if (currentPageCongTy > 1) {
            currentPageCongTy--;
            renderCongTy(searchCongTy.value.trim());
        }
    });

    document.getElementById('btn-next-page-congty').addEventListener('click', () => {
        const keyword = searchCongTy.value.trim().toLowerCase();
        const totalItems = congTyList.filter(item => {
            return (
                (item.code || '').toLowerCase().includes(keyword) ||
                (item.name || '').toLowerCase().includes(keyword) ||
                (item.taxCode || '').toLowerCase().includes(keyword) ||
                (item.rep || '').toLowerCase().includes(keyword)
            );
        }).length;
        const totalPages = Math.ceil(totalItems / itemsPerPageCongTy) || 1;
        if (currentPageCongTy < totalPages) {
            currentPageCongTy++;
            renderCongTy(searchCongTy.value.trim());
        }
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

    let currentPageAccount = 1;
    const itemsPerPageAccount = 10;

    function renderAccount(filterText = '') {
        tbodyAccount.innerHTML = '';
        
        const sortedList = [...accountList].sort((a, b) => {
            const funcA = a.func ? a.func.trim() : "";
            const funcB = b.func ? b.func.trim() : "";
            return funcA.localeCompare(funcB, 'vi', { sensitivity: 'base' });
        });

        const filtered = sortedList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.func || '').toLowerCase().includes(keyword) ||
                (item.ip || '').toLowerCase().includes(keyword) ||
                (item.username || '').toLowerCase().includes(keyword)
            );
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageAccount) || 1;
        if (currentPageAccount > totalPages) currentPageAccount = totalPages;
        if (currentPageAccount < 1) currentPageAccount = 1;

        const startIndex = (currentPageAccount - 1) * itemsPerPageAccount;
        const endIndex = Math.min(startIndex + itemsPerPageAccount, totalItems);

        document.getElementById('pag-start-account').innerText = totalItems > 0 ? startIndex + 1 : 0;
        document.getElementById('pag-end-account').innerText = endIndex;
        document.getElementById('pag-total-account').innerText = totalItems;
        document.getElementById('pag-current-account').innerText = `Trang ${currentPageAccount} / ${totalPages}`;

        const btnPrev = document.getElementById('btn-prev-page-account');
        const btnNext = document.getElementById('btn-next-page-account');
        
        btnPrev.disabled = currentPageAccount === 1;
        btnNext.disabled = currentPageAccount === totalPages;
        btnPrev.style.opacity = currentPageAccount === 1 ? '0.5' : '1';
        btnPrev.style.cursor = currentPageAccount === 1 ? 'not-allowed' : 'pointer';
        btnNext.style.opacity = currentPageAccount === totalPages ? '0.5' : '1';
        btnNext.style.cursor = currentPageAccount === totalPages ? 'not-allowed' : 'pointer';

        if (totalItems === 0) {
            tbodyAccount.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5" class="text-center text-muted">Chưa có dữ liệu tài khoản!</td>
                </tr>
            `;
            return;
        }

        const pageItems = filtered.slice(startIndex, endIndex);

        pageItems.forEach((item, index) => {
            const originalIndex = accountList.indexOf(item);
            const tr = document.createElement('tr');
            
            const notesSubText = item.notes 
                ? `<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${item.notes}</div>` 
                : '';

            tr.innerHTML = `
                <td>
                    <strong>${item.func}</strong>
                    ${notesSubText}
                </td>
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

    formAccount.addEventListener('submit', async (e) => {
        e.preventDefault();
        const indexStr = editIndexAccount.value;

        const data = {
            func: document.getElementById('acc-func').value.trim(),
            ip: document.getElementById('acc-ip').value.trim(),
            username: document.getElementById('acc-username').value.trim(),
            password: document.getElementById('acc-password').value.trim(),
            notes: document.getElementById('acc-notes').value.trim()
        };

        if (indexStr === '') {
            try {
                const dbData = mappers.account.toDB(data);
                const { data: insertedData, error } = await supabaseClient
                    .from('account')
                    .insert([dbData])
                    .select();
                if (error) throw error;
                accountList.push(mappers.account.fromDB(insertedData[0]));
                showToast('Thành công', 'Đã lưu tài khoản mới!');
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể lưu tài khoản lên Supabase!', 'error');
                return;
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = accountList[idx];
            try {
                const dbData = mappers.account.toDB(data);
                const { data: updatedData, error } = await supabaseClient
                    .from('account')
                    .update(dbData)
                    .eq('id', oldItem.id)
                    .select();
                if (error) throw error;
                accountList[idx] = mappers.account.fromDB(updatedData[0]);
                showToast('Thành công', 'Đã cập nhật thông tin tài khoản!');
                resetFormAccount();
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể cập nhật tài khoản lên Supabase!', 'error');
                return;
            }
        }

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
        document.getElementById('acc-notes').value = item.notes || '';

        // Reset toggled raw pass view inside input if it was open
        const passInput = document.getElementById('acc-password');
        passInput.type = 'password';
        const toggleBtn = passInput.nextElementSibling;
        toggleBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';

        btnSaveAccount.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Tài Khoản';
        btnCancelAccount.classList.remove('hidden');

        document.querySelector('.tab-container').scrollTop = 0;
    }

    async function deleteAccount(index) {
        const item = accountList[index];
        if (confirm(`Bạn có chắc chắn muốn xóa tài khoản thuộc chức năng: ${item.func}?`)) {
            try {
                const { error } = await supabaseClient
                    .from('account')
                    .delete()
                    .eq('id', item.id);
                if (error) throw error;
                accountList.splice(index, 1);
                renderAccount();
                showToast('Đã xóa', 'Xóa tài khoản thành công!', 'warning');

                if (editIndexAccount.value === index.toString()) {
                    resetFormAccount();
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể xóa tài khoản trên Supabase!', 'error');
            }
        }
    }

    function resetFormAccount() {
        editIndexAccount.value = '';
        btnSaveAccount.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Tài Khoản';
        btnCancelAccount.classList.add('hidden');
        formAccount.reset();
        document.getElementById('acc-notes').value = '';

        const passInput = document.getElementById('acc-password');
        passInput.type = 'password';
        const toggleBtn = passInput.nextElementSibling;
        toggleBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }

    btnCancelAccount.addEventListener('click', resetFormAccount);
    searchAccount.addEventListener('input', (e) => {
        currentPageAccount = 1;
        renderAccount(e.target.value.trim());
    });

    document.getElementById('btn-prev-page-account').addEventListener('click', () => {
        if (currentPageAccount > 1) {
            currentPageAccount--;
            renderAccount(searchAccount.value.trim());
        }
    });

    document.getElementById('btn-next-page-account').addEventListener('click', () => {
        const keyword = searchAccount.value.trim().toLowerCase();
        const totalItems = accountList.filter(item => {
            return (
                (item.func || '').toLowerCase().includes(keyword) ||
                (item.ip || '').toLowerCase().includes(keyword) ||
                (item.username || '').toLowerCase().includes(keyword)
            );
        }).length;
        const totalPages = Math.ceil(totalItems / itemsPerPageAccount) || 1;
        if (currentPageAccount < totalPages) {
            currentPageAccount++;
            renderAccount(searchAccount.value.trim());
        }
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

    let currentPageHoTro = 1;
    const itemsPerPageHoTro = 10;

    function renderHoTro(filterText = '') {
        tbodyHoTro.innerHTML = '';
        
        const sortedList = [...hoTroList].sort((a, b) => {
            const unitA = a.unit ? a.unit.trim() : "";
            const unitB = b.unit ? b.unit.trim() : "";
            return unitA.localeCompare(unitB, 'vi', { sensitivity: 'base' });
        });

        const filtered = sortedList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.unit || '').toLowerCase().includes(keyword) ||
                (item.name || '').toLowerCase().includes(keyword) ||
                (item.phone || '').toLowerCase().includes(keyword) ||
                (item.scope || '').toLowerCase().includes(keyword)
            );
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageHoTro) || 1;
        if (currentPageHoTro > totalPages) currentPageHoTro = totalPages;
        if (currentPageHoTro < 1) currentPageHoTro = 1;

        const startIndex = (currentPageHoTro - 1) * itemsPerPageHoTro;
        const endIndex = Math.min(startIndex + itemsPerPageHoTro, totalItems);

        document.getElementById('pag-start-hotro').innerText = totalItems > 0 ? startIndex + 1 : 0;
        document.getElementById('pag-end-hotro').innerText = endIndex;
        document.getElementById('pag-total-hotro').innerText = totalItems;
        document.getElementById('pag-current-hotro').innerText = `Trang ${currentPageHoTro} / ${totalPages}`;

        const btnPrev = document.getElementById('btn-prev-page-hotro');
        const btnNext = document.getElementById('btn-next-page-hotro');
        
        btnPrev.disabled = currentPageHoTro === 1;
        btnNext.disabled = currentPageHoTro === totalPages;
        btnPrev.style.opacity = currentPageHoTro === 1 ? '0.5' : '1';
        btnPrev.style.cursor = currentPageHoTro === 1 ? 'not-allowed' : 'pointer';
        btnNext.style.opacity = currentPageHoTro === totalPages ? '0.5' : '1';
        btnNext.style.cursor = currentPageHoTro === totalPages ? 'not-allowed' : 'pointer';

        if (totalItems === 0) {
            tbodyHoTro.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5" class="text-center text-muted">Chưa có thông tin hỗ trợ nào!</td>
                </tr>
            `;
            return;
        }

        const pageItems = filtered.slice(startIndex, endIndex);

        pageItems.forEach((item, index) => {
            const originalIndex = hoTroList.indexOf(item);
            const tr = document.createElement('tr');
            const zaloBadge = item.hasZalo 
                ? ` <span class="badge" style="background-color: #0068ff; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 4px; font-weight: 600;">Zalo</span>` 
                : '';
            
            const roleSubText = item.role 
                ? `<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${item.role}</div>` 
                : '';

            tr.innerHTML = `
                <td><strong>${item.unit}</strong></td>
                <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${item.name}</div>
                    ${roleSubText}
                </td>
                <td>
                    <a href="tel:${item.phone}" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">
                        <i class="fa-solid fa-phone"></i> ${item.phone}
                    </a>
                    ${zaloBadge}
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

    formHoTro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const indexStr = editIndexHoTro.value;

        const data = {
            unit: document.getElementById('support-unit').value.trim(),
            name: document.getElementById('support-name').value.trim(),
            phone: document.getElementById('support-phone').value.trim(),
            scope: document.getElementById('support-scope').value.trim(),
            hasZalo: document.getElementById('support-zalo').checked,
            role: document.getElementById('support-role').value.trim()
        };

        if (indexStr === '') {
            try {
                const dbData = mappers.hoTro.toDB(data);
                const { data: insertedData, error } = await supabaseClient
                    .from('ho_tro')
                    .insert([dbData])
                    .select();
                if (error) throw error;
                hoTroList.push(mappers.hoTro.fromDB(insertedData[0]));
                showToast('Thành công', 'Đã thêm thông tin hỗ trợ mới!');
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể lưu thông tin hỗ trợ lên Supabase!', 'error');
                return;
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = hoTroList[idx];
            try {
                const dbData = mappers.hoTro.toDB(data);
                const { data: updatedData, error } = await supabaseClient
                    .from('ho_tro')
                    .update(dbData)
                    .eq('id', oldItem.id)
                    .select();
                if (error) throw error;
                hoTroList[idx] = mappers.hoTro.fromDB(updatedData[0]);
                showToast('Thành công', 'Đã cập nhật thông tin hỗ trợ!');
                resetFormHoTro();
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể cập nhật thông tin hỗ trợ lên Supabase!', 'error');
                return;
            }
        }

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
        document.getElementById('support-zalo').checked = !!item.hasZalo;
        document.getElementById('support-role').value = item.role || '';

        btnSaveHoTro.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Hỗ Trợ';
        btnCancelHoTro.classList.remove('hidden');

        document.querySelector('.tab-container').scrollTop = 0;
    }

    async function deleteHoTro(index) {
        const item = hoTroList[index];
        if (confirm(`Bạn có chắc chắn muốn xóa thông tin hỗ trợ của đầu mối: ${item.name}?`)) {
            try {
                const { error } = await supabaseClient
                    .from('ho_tro')
                    .delete()
                    .eq('id', item.id);
                if (error) throw error;
                hoTroList.splice(index, 1);
                renderHoTro();
                showToast('Đã xóa', 'Xóa thông tin hỗ trợ thành công!', 'warning');

                if (editIndexHoTro.value === index.toString()) {
                    resetFormHoTro();
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể xóa thông tin hỗ trợ trên Supabase!', 'error');
            }
        }
    }

    function resetFormHoTro() {
        editIndexHoTro.value = '';
        btnSaveHoTro.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Thông Tin Hỗ Trợ';
        btnCancelHoTro.classList.add('hidden');
        formHoTro.reset();
        document.getElementById('support-zalo').checked = false;
        document.getElementById('support-role').value = '';
    }

    btnCancelHoTro.addEventListener('click', resetFormHoTro);
    searchHoTro.addEventListener('input', (e) => {
        currentPageHoTro = 1;
        renderHoTro(e.target.value.trim());
    });

    document.getElementById('btn-prev-page-hotro').addEventListener('click', () => {
        if (currentPageHoTro > 1) {
            currentPageHoTro--;
            renderHoTro(searchHoTro.value.trim());
        }
    });

    document.getElementById('btn-next-page-hotro').addEventListener('click', () => {
        const keyword = searchHoTro.value.trim().toLowerCase();
        const totalItems = hoTroList.filter(item => {
            return (
                (item.unit || '').toLowerCase().includes(keyword) ||
                (item.name || '').toLowerCase().includes(keyword) ||
                (item.phone || '').toLowerCase().includes(keyword) ||
                (item.scope || '').toLowerCase().includes(keyword)
            );
        }).length;
        const totalPages = Math.ceil(totalItems / itemsPerPageHoTro) || 1;
        if (currentPageHoTro < totalPages) {
            currentPageHoTro++;
            renderHoTro(searchHoTro.value.trim());
        }
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

    let currentPageCamera = 1;
    const itemsPerPageCamera = 10;

    function renderCamera(filterText = '') {
        tbodyCamera.innerHTML = '';
        
        const sortedList = [...cameraList].sort((a, b) => {
            const projectA = a.project ? a.project.trim() : "";
            const projectB = b.project ? b.project.trim() : "";
            return projectA.localeCompare(projectB, 'vi', { sensitivity: 'base' });
        });

        const filtered = sortedList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.project || '').toLowerCase().includes(keyword) ||
                (item.device || '').toLowerCase().includes(keyword) ||
                (item.ipWan || '').toLowerCase().includes(keyword)
            );
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageCamera) || 1;
        if (currentPageCamera > totalPages) currentPageCamera = totalPages;
        if (currentPageCamera < 1) currentPageCamera = 1;

        const startIndex = (currentPageCamera - 1) * itemsPerPageCamera;
        const endIndex = Math.min(startIndex + itemsPerPageCamera, totalItems);

        document.getElementById('pag-start-camera').innerText = totalItems > 0 ? startIndex + 1 : 0;
        document.getElementById('pag-end-camera').innerText = endIndex;
        document.getElementById('pag-total-camera').innerText = totalItems;
        document.getElementById('pag-current-camera').innerText = `Trang ${currentPageCamera} / ${totalPages}`;

        const btnPrev = document.getElementById('btn-prev-page-camera');
        const btnNext = document.getElementById('btn-next-page-camera');
        
        btnPrev.disabled = currentPageCamera === 1;
        btnNext.disabled = currentPageCamera === totalPages;
        btnPrev.style.opacity = currentPageCamera === 1 ? '0.5' : '1';
        btnPrev.style.cursor = currentPageCamera === 1 ? 'not-allowed' : 'pointer';
        btnNext.style.opacity = currentPageCamera === totalPages ? '0.5' : '1';
        btnNext.style.cursor = currentPageCamera === totalPages ? 'not-allowed' : 'pointer';

        if (totalItems === 0) {
            tbodyCamera.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7" class="text-center text-muted">Chưa có thông tin camera nào!</td>
                </tr>
            `;
            return;
        }

        const pageItems = filtered.slice(startIndex, endIndex);

        pageItems.forEach((item, index) => {
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

    formCamera.addEventListener('submit', async (e) => {
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
            try {
                const dbData = mappers.camera.toDB(data);
                const { data: insertedData, error } = await supabaseClient
                    .from('camera')
                    .insert([dbData])
                    .select();
                if (error) throw error;
                cameraList.push(mappers.camera.fromDB(insertedData[0]));
                showToast('Thành công', 'Đã lưu thông tin camera mới!');
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể lưu camera lên Supabase!', 'error');
                return;
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = cameraList[idx];
            try {
                const dbData = mappers.camera.toDB(data);
                const { data: updatedData, error } = await supabaseClient
                    .from('camera')
                    .update(dbData)
                    .eq('id', oldItem.id)
                    .select();
                if (error) throw error;
                cameraList[idx] = mappers.camera.fromDB(updatedData[0]);
                showToast('Thành công', 'Đã cập nhật thông tin camera!');
                resetFormCamera();
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể cập nhật camera lên Supabase!', 'error');
                return;
            }
        }

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

    async function deleteCamera(index) {
        const item = cameraList[index];
        if (confirm(`Bạn có chắc chắn muốn xóa thông tin camera dự án: ${item.project}?`)) {
            try {
                const { error } = await supabaseClient
                    .from('camera')
                    .delete()
                    .eq('id', item.id);
                if (error) throw error;
                cameraList.splice(index, 1);
                renderCamera();
                showToast('Đã xóa', 'Xóa thông tin camera thành công!', 'warning');

                if (editIndexCamera.value === index.toString()) {
                    resetFormCamera();
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể xóa camera trên Supabase!', 'error');
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
        currentPageCamera = 1;
        renderCamera(e.target.value.trim());
    });

    document.getElementById('btn-prev-page-camera').addEventListener('click', () => {
        if (currentPageCamera > 1) {
            currentPageCamera--;
            renderCamera(searchCamera.value.trim());
        }
    });

    document.getElementById('btn-next-page-camera').addEventListener('click', () => {
        const keyword = searchCamera.value.trim().toLowerCase();
        const totalItems = cameraList.filter(item => {
            return (
                (item.project || '').toLowerCase().includes(keyword) ||
                (item.device || '').toLowerCase().includes(keyword) ||
                (item.ipWan || '').toLowerCase().includes(keyword)
            );
        }).length;
        const totalPages = Math.ceil(totalItems / itemsPerPageCamera) || 1;
        if (currentPageCamera < totalPages) {
            currentPageCamera++;
            renderCamera(searchCamera.value.trim());
        }
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

    let currentPageTips = 1;
    const itemsPerPageTips = 10;

    function renderTips(filterText = "") {
        tbodyTips.innerHTML = '';
        
        const sortedList = [...tipsList].sort((a, b) => {
            const issueA = a.issue ? a.issue.trim() : "";
            const issueB = b.issue ? b.issue.trim() : "";
            return issueA.localeCompare(issueB, 'vi', { sensitivity: 'base' });
        });

        const filtered = sortedList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.issue || '').toLowerCase().includes(keyword) ||
                (item.solution || '').toLowerCase().includes(keyword)
            );
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageTips) || 1;
        if (currentPageTips > totalPages) currentPageTips = totalPages;
        if (currentPageTips < 1) currentPageTips = 1;

        const startIndex = (currentPageTips - 1) * itemsPerPageTips;
        const endIndex = Math.min(startIndex + itemsPerPageTips, totalItems);

        document.getElementById('pag-start-tips').innerText = totalItems > 0 ? startIndex + 1 : 0;
        document.getElementById('pag-end-tips').innerText = endIndex;
        document.getElementById('pag-total-tips').innerText = totalItems;
        document.getElementById('pag-current-tips').innerText = `Trang ${currentPageTips} / ${totalPages}`;

        const btnPrev = document.getElementById('btn-prev-page-tips');
        const btnNext = document.getElementById('btn-next-page-tips');
        
        btnPrev.disabled = currentPageTips === 1;
        btnNext.disabled = currentPageTips === totalPages;
        btnPrev.style.opacity = currentPageTips === 1 ? '0.5' : '1';
        btnPrev.style.cursor = currentPageTips === 1 ? 'not-allowed' : 'pointer';
        btnNext.style.opacity = currentPageTips === totalPages ? '0.5' : '1';
        btnNext.style.cursor = currentPageTips === totalPages ? 'not-allowed' : 'pointer';

        if (totalItems === 0) {
            tbodyTips.innerHTML = `
                <tr class="empty-row">
                    <td colspan="3" class="text-center text-muted">Chưa có bài viết Tip & Trick nào!</td>
                </tr>
            `;
            return;
        }

        const pageItems = filtered.slice(startIndex, endIndex);

        pageItems.forEach((item, index) => {
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

    formTips.addEventListener('submit', async (e) => {
        e.preventDefault();
        const indexStr = editIndexTips.value;

        const data = {
            issue: document.getElementById('tip-issue').value.trim(),
            solution: document.getElementById('tip-solution').value.trim()
        };

        if (indexStr === '') {
            try {
                const dbData = mappers.tips.toDB(data);
                const { data: insertedData, error } = await supabaseClient
                    .from('tips')
                    .insert([dbData])
                    .select();
                if (error) throw error;
                tipsList.push(mappers.tips.fromDB(insertedData[0]));
                showToast('Thành công', 'Đã lưu Tip & Trick mới!');
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể lưu bài viết lên Supabase!', 'error');
                return;
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = tipsList[idx];
            try {
                const dbData = mappers.tips.toDB(data);
                const { data: updatedData, error } = await supabaseClient
                    .from('tips')
                    .update(dbData)
                    .eq('id', oldItem.id)
                    .select();
                if (error) throw error;
                tipsList[idx] = mappers.tips.fromDB(updatedData[0]);
                showToast('Thành công', 'Đã cập nhật bài viết Tip & Trick!');
                resetFormTips();
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể cập nhật bài viết lên Supabase!', 'error');
                return;
            }
        }

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

    async function deleteTips(index) {
        const item = tipsList[index];
        if (confirm(`Bạn có chắc chắn muốn xóa bài viết Tip & Trick: "${item.issue}"?`)) {
            try {
                const { error } = await supabaseClient
                    .from('tips')
                    .delete()
                    .eq('id', item.id);
                if (error) throw error;
                tipsList.splice(index, 1);
                renderTips();
                showToast('Đã xóa', 'Xóa Tip & Trick thành công!', 'warning');

                if (editIndexTips.value === index.toString()) {
                    resetFormTips();
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi', 'Không thể xóa bài viết trên Supabase!', 'error');
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
        currentPageTips = 1;
        renderTips(e.target.value.trim());
    });

    document.getElementById('btn-prev-page-tips').addEventListener('click', () => {
        if (currentPageTips > 1) {
            currentPageTips--;
            renderTips(searchTips.value.trim());
        }
    });

    document.getElementById('btn-next-page-tips').addEventListener('click', () => {
        const keyword = searchTips.value.trim().toLowerCase();
        const totalItems = tipsList.filter(item => {
            return (
                (item.issue || '').toLowerCase().includes(keyword) ||
                (item.solution || '').toLowerCase().includes(keyword)
            );
        }).length;
        const totalPages = Math.ceil(totalItems / itemsPerPageTips) || 1;
        if (currentPageTips < totalPages) {
            currentPageTips++;
            renderTips(searchTips.value.trim());
        }
    });


    // =========================================================================
    // 9.1. PHÂN HỆ 7: GIA HẠN BẢN QUYỀN
    // =========================================================================
    let giaHanList = [];
    const formGiaHan = document.getElementById('form-gia-han');
    const tbodyGiaHan = document.getElementById('tbody-gia-han');
    const searchGiaHan = document.getElementById('search-gia-han');
    const btnCancelGiaHan = document.getElementById('btn-cancel-gia-han');
    const btnSaveGiaHan = document.getElementById('btn-save-gia-han');
    const editIndexGiaHan = document.getElementById('edit-index-gia-han');
    
    let currentPageGiaHan = 1;
    const itemsPerPageGiaHan = 10;

    function loadGiaHanFromLocalStorage() {
        try {
            const stored = localStorage.getItem('gia_han_list');
            if (stored) {
                giaHanList = JSON.parse(stored);
            } else {
                giaHanList = [];
            }
        } catch (e) {
            console.error("Error reading LocalStorage for gia_han:", e);
            giaHanList = [];
        }
        renderGiaHan();
    }

    function saveGiaHanToLocalStorage() {
        try {
            localStorage.setItem('gia_han_list', JSON.stringify(giaHanList));
        } catch (e) {
            console.error("Error writing LocalStorage for gia_han:", e);
        }
    }

    function formatDateDMY(dateStr) {
        if (!dateStr) return '—';
        let date = new Date(dateStr);
        if (isNaN(date.getTime())) return '—';
        
        let year = date.getFullYear();
        if (year < 100) {
            year += 2000;
        } else if (year < 1000) {
            year = (year % 100) + 2000;
        }
        
        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        
        return `${day}/${month}/${year}`;
    }

    function calculateDaysRemaining(expiryStr) {
        if (!expiryStr) return 0;
        let expiry = new Date(expiryStr);
        if (isNaN(expiry.getTime())) return 0;
        
        let year = expiry.getFullYear();
        if (year < 100) {
            expiry.setFullYear(year + 2000);
        } else if (year < 1000) {
            expiry.setFullYear((year % 100) + 2000);
        }
        
        expiry.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function getCountdownBarHTML(days) {
        let percent = 0;
        let colorClass = 'countdown-green';
        let label = '';
        
        if (days > 30) {
            percent = 100;
            colorClass = 'countdown-green';
            label = `Còn ${days} ngày`;
        } else if (days > 0) {
            // Shrinks from 100% to 0% as days go from 30 to 1
            percent = Math.round((days / 30) * 100);
            colorClass = 'countdown-orange';
            label = `Còn ${days} ngày`;
        } else if (days === 0) {
            percent = 0;
            colorClass = 'countdown-red';
            label = `Hôm nay hết hạn!`;
        } else {
            percent = 100;
            colorClass = 'countdown-red';
            label = `Đã hết hạn ${Math.abs(days)} ngày`;
        }
        
        return `
            <div class="countdown-container">
                <div class="countdown-text">
                    <span>${label}</span>
                </div>
                <div class="countdown-bar">
                    <div class="countdown-fill ${colorClass}" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }

    function getLicenseStatusBadge(days) {
        if (days > 30) {
            return `<span class="badge badge-green"><i class="fa-solid fa-circle-check"></i> An toàn</span>`;
        } else if (days > 0) {
            return `<span class="badge badge-yellow badge-pulse-yellow"><i class="fa-solid fa-triangle-exclamation"></i> Sắp hết hạn</span>`;
        } else {
            return `<span class="badge badge-danger"><i class="fa-solid fa-circle-xmark"></i> Đã hết hạn</span>`;
        }
    }

    function updateLicenseAlerts() {
        const banner = document.getElementById('license-alert-banner');
        const alertList = document.getElementById('license-alert-list');
        if (!banner || !alertList) return;
        
        const urgentLicenses = giaHanList.filter(item => {
            const days = calculateDaysRemaining(item.expiryDate);
            return days <= 30;
        });
        
        if (urgentLicenses.length > 0) {
            alertList.innerHTML = urgentLicenses.map(item => {
                const days = calculateDaysRemaining(item.expiryDate);
                const dateStr = formatDateDMY(item.expiryDate);
                if (days > 0) {
                    return `<li>Bản quyền <strong>${item.name}</strong> sắp hết hạn vào ngày <strong>${dateStr}</strong> (Còn <strong>${days} ngày</strong> nữa). Vui lòng lên phương án gia hạn!</li>`;
                } else if (days === 0) {
                    return `<li style="font-weight: bold; color: var(--danger-color);">Bản quyền <strong>${item.name}</strong> HẾT HẠN HÔM NAY!</li>`;
                } else {
                    return `<li style="font-weight: bold;">Bản quyền <strong>${item.name}</strong> đã HẾT HẠN vào ngày <strong>${dateStr}</strong> (Quá hạn <strong>${Math.abs(days)} ngày</strong>).</li>`;
                }
            }).join('');
            banner.style.display = 'block';
        } else {
            banner.style.display = 'none';
        }
    }

    function renderGiaHan(filterText = '') {
        if (!tbodyGiaHan) return;
        tbodyGiaHan.innerHTML = '';
        
        // Sort by expiry date (soonest expiry first)
        const sortedList = [...giaHanList].sort((a, b) => {
            const dateA = a.expiryDate ? new Date(a.expiryDate) : new Date(0);
            const dateB = b.expiryDate ? new Date(b.expiryDate) : new Date(0);
            return dateA - dateB;
        });

        const keyword = filterText.toLowerCase();
        const filtered = sortedList.filter(item => {
            return (
                (item.name || '').toLowerCase().includes(keyword) ||
                (item.provider || '').toLowerCase().includes(keyword)
            );
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageGiaHan) || 1;
        if (currentPageGiaHan > totalPages) currentPageGiaHan = totalPages;
        if (currentPageGiaHan < 1) currentPageGiaHan = 1;

        const startIndex = (currentPageGiaHan - 1) * itemsPerPageGiaHan;
        const endIndex = Math.min(startIndex + itemsPerPageGiaHan, totalItems);

        const pagStart = document.getElementById('pag-start-gia-han');
        const pagEnd = document.getElementById('pag-end-gia-han');
        const pagTotal = document.getElementById('pag-total-gia-han');
        const pagCurrent = document.getElementById('pag-current-gia-han');

        if (pagStart) pagStart.innerText = totalItems > 0 ? startIndex + 1 : 0;
        if (pagEnd) pagEnd.innerText = endIndex;
        if (pagTotal) pagTotal.innerText = totalItems;
        if (pagCurrent) pagCurrent.innerText = `Trang ${currentPageGiaHan} / ${totalPages}`;

        const btnPrev = document.getElementById('btn-prev-gia-han');
        const btnNext = document.getElementById('btn-next-gia-han');
        
        if (btnPrev && btnNext) {
            btnPrev.disabled = currentPageGiaHan === 1;
            btnNext.disabled = currentPageGiaHan === totalPages;
            btnPrev.style.opacity = currentPageGiaHan === 1 ? '0.5' : '1';
            btnPrev.style.cursor = currentPageGiaHan === 1 ? 'not-allowed' : 'pointer';
            btnNext.style.opacity = currentPageGiaHan === totalPages ? '0.5' : '1';
            btnNext.style.cursor = currentPageGiaHan === totalPages ? 'not-allowed' : 'pointer';
        }

        updateLicenseAlerts();

        if (totalItems === 0) {
            tbodyGiaHan.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5" class="text-center text-muted">Chưa có thông tin bản quyền nào!</td>
                </tr>
            `;
            return;
        }

        const pageItems = filtered.slice(startIndex, endIndex);

        pageItems.forEach((item) => {
            const originalIndex = giaHanList.indexOf(item);
            const tr = document.createElement('tr');
            
            const days = calculateDaysRemaining(item.expiryDate);
            const dateFormatted = formatDateDMY(item.expiryDate);
            const countdownBarHTML = getCountdownBarHTML(days);
            const statusBadgeHTML = getLicenseStatusBadge(days);

            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${item.name}</div>
                </td>
                <td>
                    <span style="font-size: 13px; color: var(--text-secondary); font-style: italic; white-space: pre-line; word-break: break-word; display: block; line-height: 1.4;">${item.notes || '—'}</span>
                </td>
                <td>
                    <span style="font-weight: 500; color: var(--text-secondary);">${item.provider || '—'}</span>
                </td>
                <td>
                    <span style="font-family: monospace; font-size: 13px; font-weight: 600;">${dateFormatted}</span>
                </td>
                <td>
                    ${countdownBarHTML}
                </td>
                <td>
                    ${statusBadgeHTML}
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-only edit btn-edit-giahan" data-index="${originalIndex}" title="Sửa">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon-only delete btn-delete-giahan" data-index="${originalIndex}" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbodyGiaHan.appendChild(tr);
        });

        // Bind events
        document.querySelectorAll('.btn-edit-giahan').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                editGiaHan(idx);
            });
        });

        document.querySelectorAll('.btn-delete-giahan').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                deleteGiaHan(idx);
            });
        });
    }

    if (formGiaHan) {
        formGiaHan.addEventListener('submit', async (e) => {
            e.preventDefault();
            const indexStr = editIndexGiaHan.value;

            let expiryInputVal = document.getElementById('license-expiry').value.trim();
            let expiryVal = '';
            
            const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            const match = expiryInputVal.match(dateRegex);
            if (!match) {
                showToast('Lỗi nhập liệu', 'Vui lòng nhập ngày đúng định dạng dd/mm/yyyy!', 'error');
                return;
            }
            
            const day = match[1];
            const month = match[2];
            let year = parseInt(match[3]);
            
            const dayNum = parseInt(day);
            const monthNum = parseInt(month);
            
            if (monthNum < 1 || monthNum > 12) {
                showToast('Lỗi nhập liệu', 'Tháng không hợp lệ (01 - 12)!', 'error');
                return;
            }
            if (dayNum < 1 || dayNum > 31) {
                showToast('Lỗi nhập liệu', 'Ngày không hợp lệ (01 - 31)!', 'error');
                return;
            }
            
            if (year < 100) {
                year += 2000;
            } else if (year < 1000) {
                year = (year % 100) + 2000;
            }
            
            expiryVal = `${year}-${month}-${day}`;

            const data = {
                name: document.getElementById('license-name').value.trim(),
                provider: document.getElementById('license-provider').value.trim(),
                notes: document.getElementById('license-notes').value.trim(),
                expiryDate: expiryVal
            };

            if (indexStr === '') {
                const newId = 'lh-' + Date.now();
                const newItem = { id: newId, ...data };
                
                // Local save first for safety
                giaHanList.push(newItem);
                saveGiaHanToLocalStorage();
                
                // Sync with Supabase
                if (supabaseClient) {
                    const dbData = mappers.giaHan.toDB(newItem);
                    supabaseClient.from('gia_han').insert([dbData]).then(({ error }) => {
                        if (error) {
                            console.warn("Supabase insert error for 'gia_han' (saved locally):", error);
                        }
                    }).catch(err => {
                        console.warn("Supabase insert catch for 'gia_han' (saved locally):", err);
                    });
                }
                showToast('Thành công', 'Đã thêm thông tin gia hạn mới!');
            } else {
                const idx = parseInt(indexStr);
                const oldItem = giaHanList[idx];
                const updatedItem = { ...oldItem, ...data };
                
                // Local save first for safety
                giaHanList[idx] = updatedItem;
                saveGiaHanToLocalStorage();

                // Sync with Supabase
                if (supabaseClient) {
                    const dbData = mappers.giaHan.toDB(updatedItem);
                    supabaseClient.from('gia_han').update(dbData).eq('id', oldItem.id).then(({ error }) => {
                        if (error) {
                            console.warn("Supabase update error for 'gia_han' (saved locally):", error);
                        }
                    }).catch(err => {
                        console.warn("Supabase update catch for 'gia_han' (saved locally):", err);
                    });
                }
                showToast('Thành công', 'Đã cập nhật thông tin gia hạn!');
                resetFormGiaHan();
            }

            renderGiaHan();
            formGiaHan.reset();
        });
    }

    function editGiaHan(index) {
        const item = giaHanList[index];
        editIndexGiaHan.value = index;
        
        document.getElementById('license-name').value = item.name;
        document.getElementById('license-provider').value = item.provider || '';
        document.getElementById('license-notes').value = item.notes || '';
        document.getElementById('license-expiry').value = formatDateDMY(item.expiryDate);

        btnSaveGiaHan.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Bản Quyền';
        btnCancelGiaHan.classList.remove('hidden');

        document.querySelector('.tab-container').scrollTop = 0;
    }

    function deleteGiaHan(index) {
        const item = giaHanList[index];
        if (confirm(`Bạn có chắc chắn muốn xóa thông tin gia hạn bản quyền: "${item.name}"?`)) {
            // Local delete first for safety
            giaHanList.splice(index, 1);
            saveGiaHanToLocalStorage();

            // Sync with Supabase
            if (supabaseClient) {
                supabaseClient.from('gia_han').delete().eq('id', item.id).then(({ error }) => {
                    if (error) {
                        console.warn("Supabase delete error for 'gia_han' (deleted locally):", error);
                    }
                }).catch(err => {
                    console.warn("Supabase delete catch for 'gia_han' (deleted locally):", err);
                });
            }
            
            renderGiaHan();
            showToast('Đã xóa', 'Xóa thông tin gia hạn thành công!', 'warning');

            if (editIndexGiaHan.value === index.toString()) {
                resetFormGiaHan();
            }
        }
    }

    function resetFormGiaHan() {
        if (editIndexGiaHan) editIndexGiaHan.value = '';
        if (btnSaveGiaHan) btnSaveGiaHan.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Thông Tin Gia Hạn';
        if (btnCancelGiaHan) btnCancelGiaHan.classList.add('hidden');
        if (formGiaHan) formGiaHan.reset();
    }

    if (btnCancelGiaHan) btnCancelGiaHan.addEventListener('click', resetFormGiaHan);
    
    if (searchGiaHan) {
        searchGiaHan.addEventListener('input', (e) => {
            currentPageGiaHan = 1;
            renderGiaHan(e.target.value.trim());
        });
    }

    const btnPrevGiaHan = document.getElementById('btn-prev-gia-han');
    const btnNextGiaHan = document.getElementById('btn-next-gia-han');

    if (btnPrevGiaHan) {
        btnPrevGiaHan.addEventListener('click', () => {
            if (currentPageGiaHan > 1) {
                currentPageGiaHan--;
                renderGiaHan(searchGiaHan.value.trim());
            }
        });
    }

    if (btnNextGiaHan) {
        btnNextGiaHan.addEventListener('click', () => {
            const keyword = searchGiaHan.value.trim().toLowerCase();
            const totalItems = giaHanList.filter(item => {
                return (item.name || '').toLowerCase().includes(keyword);
            }).length;
            const totalPages = Math.ceil(totalItems / itemsPerPageGiaHan) || 1;
            if (currentPageGiaHan < totalPages) {
                currentPageGiaHan++;
                renderGiaHan(searchGiaHan.value.trim());
            }
        });
    }

    const expiryInput = document.getElementById('license-expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Keep only numbers
            if (value.length > 8) {
                value = value.substring(0, 8);
            }
            let formatted = '';
            if (value.length > 0) {
                formatted += value.substring(0, 2);
            }
            if (value.length > 2) {
                formatted += '/' + value.substring(2, 4);
            }
            if (value.length > 4) {
                formatted += '/' + value.substring(4, 8);
            }
            e.target.value = formatted;
        });
    }


    // =========================================================================
    // 9.2. SAO LƯU & KHÔI PHỤC DỮ LIỆU (IMPORT & EXPORT DATABASE)
    // =========================================================================
    const btnExportDb = document.getElementById('btn-export-db');
    const btnImportDb = document.getElementById('btn-import-db');
    const modalBackup = document.getElementById('modal-backup');
    const btnCloseBackupModal = document.getElementById('btn-close-backup-modal');
    
    const backupExportSection = document.getElementById('backup-export-section');
    const backupImportSection = document.getElementById('backup-import-section');
    
    const btnDoExportJson = document.getElementById('btn-do-export-json');
    const btnDoExportZip = document.getElementById('btn-do-export-zip');
    const importFileSelector = document.getElementById('import-file-selector');

    if (btnExportDb) {
        btnExportDb.addEventListener('click', () => {
            if (modalBackup) {
                modalBackup.classList.remove('hidden');
                backupExportSection.classList.remove('hidden');
                backupImportSection.classList.add('hidden');
                document.getElementById('backup-modal-title').innerHTML = '<i class="fa-solid fa-file-export"></i> Xuất Dữ Liệu Hệ Thống';
            }
        });
    }

    if (btnImportDb) {
        btnImportDb.addEventListener('click', () => {
            if (modalBackup) {
                modalBackup.classList.remove('hidden');
                backupExportSection.classList.add('hidden');
                backupImportSection.classList.remove('hidden');
                document.getElementById('backup-modal-title').innerHTML = '<i class="fa-solid fa-file-import"></i> Nhập Dữ Liệu Hệ Thống';
            }
        });
    }

    if (btnCloseBackupModal) {
        btnCloseBackupModal.addEventListener('click', () => {
            if (modalBackup) modalBackup.classList.add('hidden');
        });
    }

    if (modalBackup) {
        modalBackup.addEventListener('click', (e) => {
            if (e.target === modalBackup) {
                modalBackup.classList.add('hidden');
            }
        });
    }

    // Helper to escape values for CSV
    function convertToCSV(dataList, headers, keyMap) {
        if (!dataList || dataList.length === 0) {
            return '\ufeff' + headers.join(',') + '\r\n';
        }
        
        const escapeCSVValue = (val) => {
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') {
                return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            }
            let stringVal = String(val);
            stringVal = stringVal.replace(/"/g, '""');
            if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
                stringVal = `"${stringVal}"`;
            }
            return stringVal;
        };

        let csvRows = [];
        csvRows.push(headers.map(escapeCSVValue).join(','));

        for (const item of dataList) {
            const rowValues = keyMap.map(key => item[key]);
            csvRows.push(rowValues.map(escapeCSVValue).join(','));
        }

        return '\ufeff' + csvRows.join('\r\n');
    }

    // Handle Export to JSON (Full Backup)
    if (btnDoExportJson) {
        btnDoExportJson.addEventListener('click', () => {
            const backup = {
                assets: thietBiList || [],
                companies: congTyList || [],
                accounts: accountList || [],
                support: hoTroList || [],
                cameras: cameraList || [],
                tips: tipsList || [],
                giaHan: giaHanList || []
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Sao_luu_database_QLTS_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Thành công', 'Đã xuất file sao lưu hệ thống JSON thành công!');
            if (modalBackup) modalBackup.classList.add('hidden');
        });
    }

    // Handle Export to ZIP containing CSVs
    if (btnDoExportZip) {
        btnDoExportZip.addEventListener('click', () => {
            if (typeof JSZip === 'undefined') {
                showToast('Lỗi', 'Thư viện JSZip chưa được nạp. Không thể tạo file ZIP!', 'error');
                return;
            }

            const zip = new JSZip();

            // 1. Assets
            const assetsHeaders = ["Phòng ban", "Họ và tên", "Chức vụ", "Model máy", "Cấu hình RAM", "Số khe RAM", "Ổ cứng", "Màn hình", "Dây cáp", "Key Windows", "Key Office", "Key PDF", "Ghi chú", "Ứng dụng"];
            const assetsKeys = ["userDept", "userName", "userTitle", "devMain", "devRam", "devRamSlots", "devSsd", "devMonitor", "devCables", "keyWin", "keyOffice", "keyPdf", "devNotes", "devApps"];
            zip.file("1_Danh_sach_cap_phat.csv", convertToCSV(thietBiList, assetsHeaders, assetsKeys));

            // 2. Companies
            const companyHeaders = ["Mã công ty", "Tên chi nhánh/công ty", "Mã số thuế", "Người đại diện", "Chức vụ", "Địa chỉ"];
            const companyKeys = ["code", "name", "taxCode", "rep", "repRole", "address"];
            zip.file("2_Danh_sach_chi_nhanh.csv", convertToCSV(congTyList, companyHeaders, companyKeys));

            // 3. Accounts
            const accountHeaders = ["Hệ thống/Dịch vụ", "IP / Đường dẫn", "User", "Pass", "Ghi chú"];
            const accountKeys = ["func", "ip", "username", "password", "notes"];
            zip.file("3_Danh_sach_tai_khoan.csv", convertToCSV(accountList, accountHeaders, accountKeys));

            // 4. Support
            const supportHeaders = ["Đơn vị hỗ trợ", "Nội dung hỗ trợ", "Số điện thoại", "Nội dung/Phạm vi", "Zalo", "Vai trò"];
            const supportKeys = ["unit", "name", "phone", "scope", "hasZalo", "role"];
            zip.file("4_Danh_sach_ho_tro.csv", convertToCSV(hoTroList, supportHeaders, supportKeys));

            // 5. Cameras
            const cameraHeaders = ["Dự án", "Thiết bị", "IP Wan", "RTSP Port", "TCP Port", "HTTP Port", "HTTPS Port", "User", "Pass", "User ONVIF", "Pass ONVIF", "Ghi chú"];
            const cameraKeys = ["project", "device", "ipWan", "rtsp", "tcp", "http", "https", "username", "password", "onvifUser", "onvifPass", "notes"];
            zip.file("5_Danh_sach_camera.csv", convertToCSV(cameraList, cameraHeaders, cameraKeys));

            // 6. Tips
            const tipHeaders = ["Vấn đề / Lỗi", "Cách khắc phục"];
            const tipKeys = ["issue", "solution"];
            zip.file("6_Danh_sach_tips.csv", convertToCSV(tipsList, tipHeaders, tipKeys));

            // 7. Gia Han
            const giaHanHeaders = ["Dịch vụ", "Ghi chú", "Đơn vị thực hiện", "Ngày hết hạn"];
            const giaHanKeys = ["name", "notes", "provider", "expiryDate"];
            zip.file("7_Danh_sach_gia_han.csv", convertToCSV(giaHanList, giaHanHeaders, giaHanKeys));

            showToast('Đang xử lý', 'Đang tạo file ZIP chứa các báo cáo...', 'info');

            zip.generateAsync({ type: "blob" }).then(function (content) {
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Bao_cao_Excel_QLTS_${new Date().toISOString().slice(0, 10)}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Thành công', 'Đã xuất file báo cáo ZIP thành công!');
                if (modalBackup) modalBackup.classList.add('hidden');
            }).catch(err => {
                showToast('Lỗi', 'Không thể nén file ZIP!', 'error');
                console.error(err);
            });
        });
    }

    // Helper to map CSV headers to JS keys
    const headerToKeyMap = {
        // Assets (Thiết bị)
        "Phòng ban": "userDept",
        "Họ và tên": "userName",
        "Chức vụ": "userTitle",
        "Model máy": "devMain",
        "Cấu hình RAM": "devRam",
        "Số khe RAM": "devRamSlots",
        "Ổ cứng": "devSsd",
        "Màn hình": "devMonitor",
        "Dây cáp": "devCables",
        "Key Windows": "keyWin",
        "Key Office": "keyOffice",
        "Key PDF": "keyPdf",
        "Ghi chú thiết bị": "devNotes",
        "Ghi chú": "notes",
        "Ứng dụng": "devApps",
        
        // Companies (Chi nhánh)
        "Mã công ty": "code",
        "Tên chi nhánh/công ty": "name",
        "Mã số thuế": "taxCode",
        "Người đại diện": "rep",
        "Chức vụ đại diện": "repRole",
        "Địa chỉ": "address",
        
        // Accounts (Tài khoản)
        "Hệ thống/Dịch vụ": "func",
        "IP / Đường dẫn": "ip",
        "User": "username",
        "Pass": "password",
        
        // Support (Hỗ trợ)
        "Đơn vị hỗ trợ": "unit",
        "Nội dung hỗ trợ": "name",
        "Số điện thoại": "phone",
        "Nội dung/Phạm vi": "scope",
        "Zalo": "hasZalo",
        "Vai trò": "role",
        
        // Cameras (Camera)
        "Dự án": "project",
        "Thiết bị": "device",
        "IP Wan": "ipWan",
        "RTSP Port": "rtsp",
        "TCP Port": "tcp",
        "HTTP Port": "http",
        "HTTPS Port": "https",
        "User camera": "username",
        "Pass camera": "password",
        "User ONVIF": "onvifUser",
        "Pass ONVIF": "onvifPass",
        
        // Tips
        "Vấn đề / Lỗi": "issue",
        "Cách khắc phục": "solution",
        
        // Gia han
        "Dịch vụ": "name",
        "Đơn vị thực hiện": "provider",
        "Ngày hết hạn": "expiryDate"
    };

    // Helper to parse CSV string to 2D array
    function parseCSV(csvText) {
        if (csvText.startsWith('\ufeff')) {
            csvText = csvText.substring(1);
        }
        
        let lines = [];
        let row = [];
        let inQuotes = false;
        let cell = '';
        
        for (let i = 0; i < csvText.length; i++) {
            let char = csvText[i];
            let nextChar = csvText[i + 1];
            
            if (inQuotes) {
                if (char === '"') {
                    if (nextChar === '"') {
                        cell += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    cell += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    row.push(cell);
                    cell = '';
                } else if (char === '\r' || char === '\n') {
                    row.push(cell);
                    cell = '';
                    if (row.length > 0 && row.some(c => c !== '')) {
                        lines.push(row);
                    }
                    row = [];
                    if (char === '\r' && nextChar === '\n') {
                        i++;
                    }
                } else {
                    cell += char;
                }
            }
        }
        if (cell || row.length > 0) {
            row.push(cell);
            if (row.some(c => c !== '')) {
                lines.push(row);
            }
        }
        return lines;
    }

    // Helper to convert CSV 2D array to JS objects list
    function csvToObjects(csvLines, headerMap, tableName) {
        if (csvLines.length < 2) return [];
        const headers = csvLines[0];
        const objects = [];
        
        for (let i = 1; i < csvLines.length; i++) {
            const row = csvLines[i];
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                const header = headers[j] ? headers[j].trim() : '';
                const key = headerMap[header] || headerMap[header.replace(' (*)', '')];
                if (key) {
                    let val = row[j] ? row[j].trim() : '';
                    if (key === 'hasZalo') {
                        val = (val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'có' || val.toLowerCase() === 'yes');
                    } else if (key === 'devRamSlots') {
                        val = val ? parseInt(val) || '' : '';
                    }
                    obj[key] = val;
                }
            }
            if (!obj.id) {
                obj.id = 'import-' + Math.random().toString(36).substring(2, 9);
            }
            objects.push(obj);
        }
        return objects;
    }

    // Common restore database function
    async function restoreDatabase(data) {
        // 1. Assign restored lists to memory
        if (data.assets) {
            thietBiList.length = 0;
            data.assets.forEach(item => {
                if (!item.userId) item.userId = 'NV-' + Math.random().toString(36).substring(2, 7).toUpperCase();
                if (!item.devType) item.devType = 'Laptop';
                if (!item.devStatus) item.devStatus = 'Đang sử dụng';
                if (!item.history) item.history = [];
            });
            thietBiList.push(...data.assets);
        }
        if (data.companies) {
            congTyList.length = 0;
            congTyList.push(...data.companies);
        }
        if (data.accounts) {
            accountList.length = 0;
            accountList.push(...data.accounts);
        }
        if (data.support) {
            hoTroList.length = 0;
            hoTroList.push(...data.support);
        }
        if (data.cameras) {
            cameraList.length = 0;
            cameraList.push(...data.cameras);
        }
        if (data.tips) {
            tipsList.length = 0;
            tipsList.push(...data.tips);
        }
        if (data.giaHan) {
            giaHanList.length = 0;
            giaHanList.push(...data.giaHan);
        }

        // 2. Save local storage for fallback
        saveGiaHanToLocalStorage();

        // 3. Synchronize with Supabase database
        if (supabaseClient) {
            const restoreTable = async (tableName, list, mapper) => {
                const { data: records, error: fetchErr } = await supabaseClient.from(tableName).select('id');
                if (fetchErr) {
                    console.error(`Error fetching IDs from ${tableName}:`, fetchErr);
                    return;
                }
                
                if (records && records.length > 0) {
                    const ids = records.map(r => r.id);
                    const { error: delErr } = await supabaseClient.from(tableName).delete().in('id', ids);
                    if (delErr) {
                        console.error(`Error deleting from ${tableName}:`, delErr);
                        return;
                    }
                }
                
                if (list && list.length > 0) {
                    const dbData = list.map(item => {
                        const dbObj = mapper.toDB(item);
                        if (item.id && !String(item.id).startsWith('import-')) {
                            dbObj.id = item.id;
                        }
                        return dbObj;
                    });
                    const { error: insErr } = await supabaseClient.from(tableName).insert(dbData);
                    if (insErr) {
                        console.error(`Error inserting into ${tableName}:`, insErr);
                    }
                }
            };

            try {
                await restoreTable('thiet_bi', thietBiList, mappers.thietBi);
                await restoreTable('cong_ty', congTyList, mappers.congTy);
                await restoreTable('account', accountList, mappers.account);
                await restoreTable('ho_tro', hoTroList, mappers.hoTro);
                await restoreTable('camera', cameraList, mappers.camera);
                await restoreTable('tips', tipsList, mappers.tips);
                await restoreTable('gia_han', giaHanList, mappers.giaHan);
            } catch (supabaseErr) {
                console.warn("Supabase restore warning:", supabaseErr);
            }
        }

        // 4. Re-render UI
        updateDeptFilterThietBi();
        renderThietBi();
        renderCongTy();
        renderAccount();
        renderHoTro();
        renderCamera();
        renderTips();
        renderGiaHan();

        showToast('Khôi phục thành công', 'Toàn bộ dữ liệu hệ thống đã được phục hồi!', 'success');
        if (modalBackup) modalBackup.classList.add('hidden');
    }

    // Handle Import database (.json or .zip containing CSVs)
    if (importFileSelector) {
        importFileSelector.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Handle ZIP file import (Excel reports ZIP)
            if (file.name.endsWith('.zip')) {
                if (typeof JSZip === 'undefined') {
                    showToast('Lỗi', 'Thư viện JSZip chưa được nạp. Không thể giải nén file ZIP!', 'error');
                    return;
                }

                const confirmRestore = confirm("CẢNH BÁO: Việc khôi phục từ file ZIP chứa các báo cáo Excel (CSV) sẽ XÓA TOÀN BỘ dữ liệu hiện tại trên database để nạp dữ liệu từ file zip. Bạn có chắc chắn muốn thực hiện?");
                if (!confirmRestore) {
                    importFileSelector.value = '';
                    return;
                }

                showToast('Đang khôi phục', 'Đang đọc và giải nén file ZIP...', 'info');

                const reader = new FileReader();
                reader.onload = async function (evt) {
                    try {
                        const zip = await JSZip.loadAsync(evt.target.result);
                        
                        const csvFiles = {
                            "assets": "1_Danh_sach_cap_phat.csv",
                            "companies": "2_Danh_sach_chi_nhanh.csv",
                            "accounts": "3_Danh_sach_tai_khoan.csv",
                            "support": "4_Danh_sach_ho_tro.csv",
                            "cameras": "5_Danh_sach_camera.csv",
                            "tips": "6_Danh_sach_tips.csv",
                            "giaHan": "7_Danh_sach_gia_han.csv"
                        };
                        
                        const parsePromises = Object.entries(csvFiles).map(async ([key, fileName]) => {
                            const fileObj = zip.file(fileName);
                            if (fileObj) {
                                const text = await fileObj.async("string");
                                const csvLines = parseCSV(text);
                                return { key, data: csvToObjects(csvLines, headerToKeyMap, key) };
                            }
                            return { key, data: null };
                        });
                        
                        const parsedResults = await Promise.all(parsePromises);
                        const data = {};
                        parsedResults.forEach(r => {
                            if (r.data !== null) {
                                data[r.key] = r.data;
                            }
                        });
                        
                        await restoreDatabase(data);
                    } catch (zipErr) {
                        showToast('Lỗi giải nén', 'Không thể giải nén hoặc phân tích file ZIP. Vui lòng kiểm tra lại!', 'error');
                        console.error(zipErr);
                    } finally {
                        importFileSelector.value = '';
                    }
                };
                reader.readAsArrayBuffer(file);
                return;
            }

            // Handle JSON file import (System backup JSON)
            const reader = new FileReader();
            reader.onload = async function (evt) {
                try {
                    const data = JSON.parse(evt.target.result);

                    if (!data.assets && !data.companies && !data.accounts && !data.cameras && !data.giaHan) {
                        showToast('Lỗi file', 'File sao lưu không đúng định dạng JSON hệ thống!', 'error');
                        return;
                    }

                    const confirmRestore = confirm("CẢNH BÁO: Việc khôi phục dữ liệu sẽ XÓA TOÀN BỘ dữ liệu hiện tại trên database để nạp dữ liệu từ file sao lưu. Bạn có chắc chắn muốn thực hiện?");
                    if (!confirmRestore) {
                        importFileSelector.value = '';
                        return;
                    }

                    showToast('Đang khôi phục', 'Đang xử lý khôi phục dữ liệu...', 'info');
                    await restoreDatabase(data);
                } catch (parseErr) {
                    showToast('Lỗi nạp file', 'Không thể đọc nội dung file sao lưu JSON. Vui lòng kiểm tra lại!', 'error');
                    console.error(parseErr);
                } finally {
                    importFileSelector.value = '';
                }
            };
            reader.readAsText(file);
        });
    }


    // =========================================================================
    // 10. INITIALIZATION RUN (FETCH FROM SUPABASE)
    // =========================================================================
    async function initApp() {
        if (!supabaseClient) {
            showToast('Lỗi đồng bộ', 'Không thể kết nối đến Supabase. Chi tiết: Thư viện Supabase chưa được nạp (vui lòng kiểm tra lại file index.html).', 'error');
            return;
        }
        showToast('Đang kết nối', 'Đang đồng bộ dữ liệu với Supabase...', 'warning');
        
        const fetchPromises = [
            supabaseClient.from('thiet_bi').select('*').then(({ data, error }) => {
                if (error) throw error;
                thietBiList = (data || []).map(mappers.thietBi.fromDB);
                updateDeptFilterThietBi();
                renderThietBi();
            }),
            supabaseClient.from('cong_ty').select('*').then(({ data, error }) => {
                if (error) throw error;
                congTyList = (data || []).map(mappers.congTy.fromDB);
                renderCongTy();
            }),
            supabaseClient.from('account').select('*').then(({ data, error }) => {
                if (error) throw error;
                accountList = (data || []).map(mappers.account.fromDB);
                renderAccount();
            }),
            supabaseClient.from('ho_tro').select('*').then(({ data, error }) => {
                if (error) throw error;
                hoTroList = (data || []).map(mappers.hoTro.fromDB);
                renderHoTro();
            }),
            supabaseClient.from('camera').select('*').then(({ data, error }) => {
                if (error) throw error;
                cameraList = (data || []).map(mappers.camera.fromDB);
                renderCamera();
            }),
            supabaseClient.from('tips').select('*').then(({ data, error }) => {
                if (error) throw error;
                tipsList = (data || []).map(mappers.tips.fromDB);
                renderTips();
            }),
            supabaseClient.from('gia_han').select('*').then(({ data, error }) => {
                if (error) throw error;
                giaHanList = (data || []).map(mappers.giaHan.fromDB);
                renderGiaHan();
            }).catch(err => {
                console.warn("Table 'gia_han' fetch failed, using local storage fallback. Error:", err);
                loadGiaHanFromLocalStorage();
            })
        ];

        try {
            await Promise.all(fetchPromises);
            showToast('Thành công', 'Đã đồng bộ xong dữ liệu từ Supabase!', 'success');
            initCustomAutocompletes();
        } catch (err) {
            console.error('Initial load failed:', err);
            const errorDetails = err.message || err.details || (typeof err === 'object' ? JSON.stringify(err) : err);
            showToast('Lỗi đồng bộ', `Không thể kết nối đến Supabase. Chi tiết: ${errorDetails}`, 'error');
        }
    }

    // -------------------------------------------------------------------------
    // 11. LOGIN & ADMIN AUTHENTICATION LOGIC
    // -------------------------------------------------------------------------
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const formLogin = document.getElementById('form-login');
    const btnToggleLoginPass = document.getElementById('btn-toggle-login-pass');
    const btnLogout = document.getElementById('btn-logout-header');

    // Toggle Password Visibility on Login Screen
    if (btnToggleLoginPass) {
        btnToggleLoginPass.addEventListener('click', () => {
            const passInput = document.getElementById('login-password');
            if (passInput.type === 'password') {
                passInput.type = 'text';
                btnToggleLoginPass.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
            } else {
                passInput.type = 'password';
                btnToggleLoginPass.innerHTML = '<i class="fa-regular fa-eye"></i>';
            }
        });
    }

    // Handle Login Form Submit
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('login-username').value.trim();
            const passwordInput = document.getElementById('login-password').value;

            let email = usernameInput;
            if (email === 'admin') {
                email = 'admin@erasgroup.vn';
            }

            // Show loading state
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerHTML;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng nhập...';

            try {
                // Clear any previous error message
                const errDiv = document.getElementById('login-error-msg');
                if (errDiv) errDiv.classList.add('hidden');

                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: passwordInput
                });

                if (error) throw error;

                showToast('Đăng nhập', 'Đăng nhập thành công! Đang đồng bộ...', 'success');
                if (loginScreen) loginScreen.classList.add('hidden');
                if (appContainer) appContainer.classList.remove('hidden');
                initApp();
            } catch (err) {
                console.error(err);
                
                // Show warning inside login card
                const errDiv = document.getElementById('login-error-msg');
                if (errDiv) {
                    if (err.message && err.message.includes('confirm')) {
                        errDiv.textContent = 'Đăng nhập thất bại: Tài khoản chưa được xác nhận email trên Supabase!';
                    } else if (err.message && err.message.includes('Invalid login')) {
                        errDiv.textContent = 'Đăng nhập thất bại: Tên đăng nhập hoặc mật khẩu không chính xác!';
                    } else {
                        errDiv.textContent = 'Đăng nhập thất bại: ' + (err.message || 'Tài khoản hoặc mật khẩu không đúng!');
                    }
                    errDiv.classList.remove('hidden');
                    
                    // Re-trigger shake animation
                    errDiv.style.animation = 'none';
                    errDiv.offsetHeight; /* trigger reflow */
                    errDiv.style.animation = '';
                }
                
                showToast('Lỗi đăng nhập', err.message || 'Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalText;
            }
        });
    }

    // Handle Logout Click
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
                try {
                    await supabaseClient.auth.signOut();
                } catch (e) {
                    console.error("Signout error:", e);
                }
                location.reload();
            }
        });
    }

    // Sidebar toggle for mobile
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (btnToggleSidebar && sidebar && sidebarOverlay) {
        btnToggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });

        // Close sidebar when clicking a menu item on mobile
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
    }

    // =========================================================================
    // 9.3. XUẤT HÌNH ẢNH THẺ NHÂN VIÊN & BIÊN BẢN BÀN GIAO (PNG)
    // =========================================================================
    const titleUserInfo = document.getElementById('title-user-info');
    const modalUserPreview = document.getElementById('modal-user-preview');
    const btnCloseUserModal = document.getElementById('btn-close-user-modal');
    const btnExportUserCardPngIcon = document.getElementById('btn-export-user-card-png-icon');

    const btnShowHandoverModal = document.getElementById('btn-show-handover-modal');
    const modalHandoverPreview = document.getElementById('modal-handover-preview');
    const btnCloseHandoverModal = document.getElementById('btn-close-handover-modal');
    const btnExportHandoverPngIcon = document.getElementById('btn-export-handover-png-icon');

    // 1. Click title to show User Info Card Preview popup
    if (titleUserInfo) {
        titleUserInfo.addEventListener('click', () => {
            const userId = document.getElementById('user-id').value.trim();
            const userName = document.getElementById('user-name').value.trim();
            const userTitle = document.getElementById('user-title').value.trim();
            const userDept = document.getElementById('user-dept').value.trim();
            const userEmail = document.getElementById('user-email').value.trim();
            const userPhone = document.getElementById('user-phone').value.trim();

            if (!userId || !userName) {
                showToast('Thông báo', 'Vui lòng nhập ít nhất ID và Họ và Tên của nhân viên để xem thẻ!', 'warning');
                return;
            }

            document.getElementById('preview-user-id').innerText = userId;
            document.getElementById('preview-user-name').innerText = userName;
            document.getElementById('preview-user-title').innerText = userTitle || 'Chưa cập nhật chức danh';
            document.getElementById('preview-user-dept').innerText = userDept || 'Chưa cập nhật phòng ban';
            document.getElementById('preview-user-email').innerText = userEmail || '—';
            document.getElementById('preview-user-phone').innerText = userPhone || '—';

            if (modalUserPreview) {
                modalUserPreview.classList.remove('hidden');
            }
        });
    }

    // Close user preview modal
    if (btnCloseUserModal) {
        btnCloseUserModal.addEventListener('click', () => {
            if (modalUserPreview) modalUserPreview.classList.add('hidden');
        });
    }

    if (modalUserPreview) {
        modalUserPreview.addEventListener('click', (e) => {
            if (e.target === modalUserPreview) {
                modalUserPreview.classList.add('hidden');
            }
        });
    }

    // 2. Export User Info Card as PNG (Print Icon)
    if (btnExportUserCardPngIcon) {
        btnExportUserCardPngIcon.addEventListener('click', () => {
            if (typeof html2canvas === 'undefined') {
                showToast('Lỗi', 'Thư viện html2canvas chưa được nạp. Không thể tạo hình ảnh!', 'error');
                return;
            }

            const target = document.getElementById('user-card-export-target');
            const userId = document.getElementById('user-id').value.trim() || 'user';
            
            showToast('Đang tạo ảnh', 'Đang kết xuất hình ảnh thẻ nhân viên...', 'info');

            html2canvas(target, {
                useCORS: true,
                scale: 2,
                backgroundColor: null
            }).then(canvas => {
                const url = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = url;
                a.download = `The_nhan_vien_${userId}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showToast('Thành công', 'Đã tải xuống hình ảnh thẻ nhân viên!', 'success');
                if (modalUserPreview) modalUserPreview.classList.add('hidden');
            }).catch(err => {
                showToast('Lỗi', 'Không thể tạo hình ảnh!', 'error');
                console.error(err);
            });
        });
    }

    // 3. Show Handover Receipt Modal
    if (btnShowHandoverModal) {
        btnShowHandoverModal.addEventListener('click', () => {
            const userId = document.getElementById('user-id').value.trim();
            const userName = document.getElementById('user-name').value.trim();
            
            if (!userId || !userName) {
                showToast('Thông báo', 'Vui lòng nhập ID và Họ tên người sử dụng trước khi xem thông tin bàn giao!', 'warning');
                return;
            }

            // Populate handover template
            document.getElementById('receipt-user-name').innerText = userName;
            document.getElementById('receipt-user-title').innerText = document.getElementById('user-title').value.trim() || '—';
            document.getElementById('receipt-user-dept').innerText = document.getElementById('user-dept').value.trim() || '—';
            document.getElementById('receipt-user-email').innerText = document.getElementById('user-email').value.trim() || '—';
            
            document.getElementById('receipt-dev-name').innerText = document.getElementById('dev-type').value.trim() || '—';
            document.getElementById('receipt-dev-main').innerText = document.getElementById('dev-main').value.trim() || '—';
            document.getElementById('receipt-dev-cpu').innerText = document.getElementById('dev-cpu').value.trim() || '—';
            
            const ramVal = document.getElementById('dev-ram').value || '';
            const ramSlotsVal = document.getElementById('dev-ram-slots').value || '';
            document.getElementById('receipt-dev-ram').innerText = ramVal ? `${ramVal} ${ramSlotsVal ? `(${ramSlotsVal})` : ''}` : '—';
            
            const ssdVal = document.getElementById('dev-ssd').value.trim() || '';
            const hddVal = document.getElementById('dev-hdd').value.trim() || '';
            let diskStr = '';
            if (ssdVal) diskStr += `SSD: ${ssdVal}`;
            if (hddVal) diskStr += (diskStr ? ' / ' : '') + `HDD: ${hddVal}`;
            document.getElementById('receipt-dev-disk').innerText = diskStr || '—';
            
            document.getElementById('receipt-dev-monitor').innerText = document.getElementById('dev-monitor').value.trim() || '—';
            
            document.getElementById('receipt-key-win').innerText = document.getElementById('key-win').value.trim() || '—';
            document.getElementById('receipt-key-office').innerText = document.getElementById('key-office').value.trim() || '—';
            document.getElementById('receipt-key-pdf').innerText = document.getElementById('key-pdf').value.trim() || '—';
            
            document.getElementById('receipt-dev-apps').innerText = document.getElementById('dev-apps').value.trim() || '—';
            document.getElementById('receipt-dev-notes').innerText = document.getElementById('dev-notes').value.trim() || '—';
            
            document.getElementById('receipt-user-sign-name').innerText = userName;
            
            const today = new Date();
            const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
            document.getElementById('receipt-handover-date').innerText = `Ngày bàn giao: ${dateStr}`;

            if (modalHandoverPreview) {
                modalHandoverPreview.classList.remove('hidden');
            }
        });
    }

    // Close handover modal
    if (btnCloseHandoverModal) {
        btnCloseHandoverModal.addEventListener('click', () => {
            if (modalHandoverPreview) modalHandoverPreview.classList.add('hidden');
        });
    }

    if (modalHandoverPreview) {
        modalHandoverPreview.addEventListener('click', (e) => {
            if (e.target === modalHandoverPreview) {
                modalHandoverPreview.classList.add('hidden');
            }
        });
    }

    // 4. Export Handover Receipt as PNG (Print Icon)
    if (btnExportHandoverPngIcon) {
        btnExportHandoverPngIcon.addEventListener('click', () => {
            if (typeof html2canvas === 'undefined') {
                showToast('Lỗi', 'Thư viện html2canvas chưa được nạp. Không thể tạo hình ảnh!', 'error');
                return;
            }

            const target = document.getElementById('handover-receipt-target');
            const userId = document.getElementById('user-id').value.trim() || 'user';
            
            showToast('Đang kết xuất', 'Đang tạo biên bản bàn giao thiết bị dạng hình ảnh...', 'info');

            html2canvas(target, {
                useCORS: true,
                scale: 2,
                backgroundColor: null
            }).then(canvas => {
                const url = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = url;
                a.download = `Bien_ban_ban_giao_${userId}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                showToast('Thành công', 'Đã xuất và tải biên bản bàn giao dạng PNG!', 'success');
                if (modalHandoverPreview) modalHandoverPreview.classList.add('hidden');
            }).catch(err => {
                showToast('Lỗi', 'Không thể tạo hình ảnh biên bản bàn giao!', 'error');
                console.error(err);
            });
        });
    }

    // Check auth status on load
    if (supabaseClient) {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                if (loginScreen) loginScreen.classList.add('hidden');
                if (appContainer) appContainer.classList.remove('hidden');
                initApp();
            } else {
                if (loginScreen) loginScreen.classList.remove('hidden');
                if (appContainer) appContainer.classList.add('hidden');
            }
        }).catch(err => {
            console.error("Auth session error:", err);
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
        });
    } else {
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');
    }
});
