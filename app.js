/**
 * ERG Asset - Hệ Thống Quản Lý Thiết Bị & Tài Sản
 * File: app.js
 */

async function startApp() {
    // -------------------------------------------------------------------------
    // 1. SUPABASE CLIENT & STATE INIT
    // -------------------------------------------------------------------------
    
    const supabaseUrl = 'http://172.16.20.21:8000';
    const supabaseKey = 'sb_publishable_nonpHrymDEEjJ9MFcDQajq_Nho7Bijj';
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
    let giaHanList = [];
    let khoList = [];

    // Fallback helper functions for local storage
    function loadFromLocalStorageFallback(key, list, renderFn) {
        try {
            const data = localStorage.getItem('fallback_' + key);
            if (data) {
                list.length = 0;
                const parsed = JSON.parse(data);
                const items = parsed.map(item => {
                    if (key === 'thiet_bi' && typeof mappers !== 'undefined' && mappers.thietBi) {
                        return mappers.thietBi.fromDB(item);
                    }
                    return item;
                });
                list.push(...items);
                if (renderFn) renderFn();
            }
        } catch (e) {
            console.error("Error loading local storage fallback for " + key, e);
        }
    }

    function saveToLocalStorageFallback(key, list) {
        try {
            localStorage.setItem('fallback_' + key, JSON.stringify(list));
        } catch (e) {
            console.error("Error saving local storage fallback for " + key, e);
        }
    }

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
            fromDB: (db) => {
                if (!db) return {};
                let cablesStr = typeof db.dev_cables === 'string' ? db.dev_cables : (typeof db.devCables === 'string' ? db.devCables : '');
                let kbVal = '';
                if (cablesStr.includes('[KBD_WIRELESS]')) {
                    kbVal = 'Bàn phím không dây';
                } else if (db.dev_keyboard === true || db.dev_keyboard === 'true' || db.devKeyboard === true || db.devKeyboard === 'true') {
                    kbVal = 'Bàn phím có dây';
                } else if (typeof db.dev_keyboard === 'string' && db.dev_keyboard) {
                    kbVal = db.dev_keyboard;
                } else if (typeof db.devKeyboard === 'string' && db.devKeyboard) {
                    kbVal = db.devKeyboard;
                }
                const cleanCables = cablesStr.replace('[KBD_WIRELESS]', '').trim();
                const devStat = db.dev_status || db.devStatus || '';

                return {
                    id: db.id,
                    userId: db.user_id || db.userId || '',
                    userName: db.user_name || db.userName || '',
                    userTitle: db.user_title || db.userTitle || '',
                    userDept: db.user_dept || db.userDept || '',
                    userEmail: db.user_email || db.userEmail || '',
                    userPhone: db.user_phone || db.userPhone || '',
                    userElement: db.user_element || db.userElement || '',
                    userKeyElement: db.user_key_element || db.userKeyElement || '',
                    devId: db.dev_id || db.devId || '',
                    devType: db.dev_type || db.devType || '',
                    devMain: db.dev_main || db.devMain || '',
                    devCpu: db.dev_cpu || db.devCpu || '',
                    devRam: db.dev_ram || db.devRam || '',
                    devRamSlots: db.dev_ram_slots || db.devRamSlots || '',
                    devSsd: db.dev_ssd || db.devSsd || '',
                    devHdd: db.dev_hdd || db.devHdd || '',
                    devVga: db.dev_vga || db.devVga || '',
                    devMonitor: db.dev_monitor || db.devMonitor || '',
                    devMonitorSn: db.dev_monitor_sn || db.devMonitorSn || '',
                    devSn: db.dev_sn || db.devSn || '',
                    devKeyboard: kbVal,
                    devMouse: db.dev_mouse || db.devMouse || '',
                    devCables: cleanCables,
                    keyWin: db.key_win || db.keyWin || '',
                    keyOffice: db.key_office || db.keyOffice || '',
                    keyPdf: db.key_pdf || db.keyPdf || '',
                    devNotes: db.dev_notes || db.devNotes || '',
                    devApps: db.dev_apps || db.devApps || '',
                    devStatus: devStat,
                    devAllocation: db.dev_allocation || db.devAllocation || (devStat === 'Không cấp' ? 'no' : (devStat === 'Thiết bị cá nhân' ? 'personal' : 'yes')),
                    hasDevice: db.has_device !== false && db.hasDevice !== false && devStat !== 'Không cấp' && devStat !== 'Thiết bị cá nhân',
                    userDisabled: !!(db.user_disabled || db.userDisabled),
                    updatedAt: db.updated_at || db.updatedAt || '',
                    history: Array.isArray(db.history) ? db.history : []
                };
            },
            toDB: (js) => {
                let cablesVal = js.devCables || '';
                if (js.devKeyboard === 'Bàn phím không dây') {
                    if (!cablesVal.includes('[KBD_WIRELESS]')) {
                        cablesVal = cablesVal ? cablesVal + ' [KBD_WIRELESS]' : '[KBD_WIRELESS]';
                    }
                } else {
                    cablesVal = cablesVal.replace('[KBD_WIRELESS]', '').trim();
                }
                return {
                    user_id: js.userId,
                    user_name: js.userName,
                    user_title: js.userTitle,
                    user_dept: js.userDept,
                    user_email: js.userEmail,
                    user_phone: js.userPhone,
                    user_element: js.userElement,
                    user_key_element: js.userKeyElement,
                    user_disabled: !!js.userDisabled,
                    has_device: js.devAllocation === 'yes',
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
                    dev_monitor_sn: js.devMonitorSn,
                    dev_sn: js.devSn,
                    dev_keyboard: !!js.devKeyboard,
                    dev_mouse: js.devMouse,
                    dev_cables: cablesVal,
                    key_win: js.keyWin,
                    key_office: js.keyOffice,
                    key_pdf: js.keyPdf,
                    dev_notes: js.devNotes,
                    dev_apps: js.devApps,
                    dev_status: js.devAllocation === 'no' ? 'Không cấp' : (js.devAllocation === 'personal' ? 'Thiết bị cá nhân' : js.devStatus),
                    updated_at: new Date().toISOString(),
                    history: js.history
                };
            }
        },
        congTy: {
            fromDB: (db) => ({
                id: db.id,
                code: db.code,
                name: db.name,
                taxCode: db.tax_code || '',
                rep: db.rep || '',
                repRole: db.rep_role || '',
                address: db.address || '',
                gpkdDate: db.gpkd_date ? formatDateDMY(db.gpkd_date) : ''
            }),
            toDB: (js) => ({
                code: js.code,
                name: js.name,
                tax_code: js.taxCode,
                rep: js.rep,
                rep_role: js.repRole,
                address: js.address,
                gpkd_date: dateToISO(js.gpkdDate)
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
                expiryDate: db.expiry_date ? formatDateDMY(db.expiry_date) : ''
            }),
            toDB: (js) => ({
                name: js.name,
                provider: js.provider || null,
                notes: js.notes || null,
                expiry_date: dateToISO(js.expiryDate)
            })
        },
        khoThietBi: {
            fromDB: (db) => ({
                id: db.id,
                code: db.code || '',
                name: db.name || '',
                quantity: db.quantity !== undefined && db.quantity !== null ? parseInt(db.quantity) : 1,
                reason: db.reason || '',
                dateStored: db.date_stored ? formatDateDMY(db.date_stored) : '',
                notes: db.notes || ''
            }),
            toDB: (js) => ({
                code: js.code,
                name: js.name,
                quantity: parseInt(js.quantity) || 1,
                reason: js.reason,
                date_stored: dateToISO(js.dateStored),
                notes: js.notes
            })
        }
    };

    // -------------------------------------------------------------------------
    // 2. DOM ELEMENTS & NAVIGATION
    // -------------------------------------------------------------------------
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');

    function showTabFormOnly(tabId) {
        const targetTab = document.getElementById(tabId);
        if (!targetTab) return;
        const formCard = targetTab.querySelector('.form-card');
        const tableCard = targetTab.querySelector('.table-card');
        if (formCard) formCard.style.display = 'block';
        if (tableCard) tableCard.style.display = 'none';
    }

    function showTabTableOnly(tabId) {
        const targetTab = document.getElementById(tabId);
        if (!targetTab) return;
        const formCard = targetTab.querySelector('.form-card');
        const tableCard = targetTab.querySelector('.table-card');
        if (formCard) formCard.style.display = 'none';
        if (tableCard) tableCard.style.display = 'block';
    }

    function hideAllTabForms() {
        const tabs = ['tab-cong-ty', 'tab-account', 'tab-ho-tro', 'tab-camera', 'tab-tips', 'tab-gia-han'];
        tabs.forEach(tabId => showTabTableOnly(tabId));
    }

    let currentTabId = '';

    // Tab Navigation Logic
    function switchToTab(targetTabId, keepFormVisible = false, pushState = true) {
        if (!targetTabId) return;
        const targetItem = document.querySelector(`.menu-item[data-tab="${targetTabId}"]`);
        const targetContent = document.getElementById(targetTabId);
        if (!targetContent) return;

        // Push history state if switching to a new tab
        if (pushState && currentTabId && currentTabId !== targetTabId) {
            try {
                history.pushState({ tabId: targetTabId }, '', `#${targetTabId}`);
            } catch (e) {
                console.warn('History pushState error:', e);
            }
        }
        currentTabId = targetTabId;

        menuItems.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        if (targetItem) {
            targetItem.classList.add('active');
        }
        targetContent.classList.add('active');

        if (!keepFormVisible) {
            hideAllTabForms();
        }

        let tabName = targetItem ? (targetItem.querySelector('span')?.innerText || '') : '';
        if (!tabName) {
            if (targetTabId === 'tab-cap-phat-list') tabName = 'Danh sách đã cấp phát';
            else if (targetTabId === 'tab-cap-phat-form') tabName = 'Quản lý cấp phát';
            else if (targetTabId === 'tab-kho-thiet-bi') tabName = 'Thiết bị lưu kho';
            else tabName = 'Trang chủ';
        }
        if (pageTitle) {
            pageTitle.innerHTML = `ERG Asset - Hệ Thống Quản Lý Thiết Bị & Tài Sản <small style="font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-left: 10px;">/ ${tabName}</small>`;
        }

        if (targetTabId === 'tab-trang-chu') {
            renderDashboard();
        }

        // Persist active tab so F5 stays on the same page
        localStorage.setItem('erg_asset_active_tab', targetTabId);
    }

    // Handle Browser Back / Forward buttons (popstate)
    window.addEventListener('popstate', (e) => {
        let targetTab = '';
        if (e.state && e.state.tabId) {
            targetTab = e.state.tabId;
        } else if (window.location.hash) {
            targetTab = window.location.hash.replace('#', '');
        }
        
        if (targetTab && document.getElementById(targetTab)) {
            switchToTab(targetTab, false, false);
        } else {
            switchToTab('tab-trang-chu', false, false);
        }
    });

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            if (targetTab) {
                switchToTab(targetTab);
            }
        });
    });

    // Restore last active tab after F5 or default to tab-trang-chu
    const initialHash = window.location.hash ? window.location.hash.replace('#', '') : '';
    const savedTab = localStorage.getItem('erg_asset_active_tab');
    const tabToLoad = (initialHash && document.getElementById(initialHash)) 
        ? initialHash 
        : ((savedTab && document.getElementById(savedTab)) ? savedTab : 'tab-trang-chu');

    switchToTab(tabToLoad, false, false);
    try {
        history.replaceState({ tabId: tabToLoad }, '', `#${tabToLoad}`);
    } catch (e) {}

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

        // Check duplicate across ALL records including disabled users
        const duplicateItem = thietBiList.find((item, index) => {
            if (excludeIndex !== "" && index === parseInt(excludeIndex)) return false;
            return (item.userId || '').toLowerCase() === val;
        });

        if (duplicateItem) {
            const statusSuffix = duplicateItem.userDisabled ? ' (Tài khoản đã Disable User)' : '';
            errSpan.innerText = `Trùng ID người sử dụng!${statusSuffix}`;
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
        const allocSelected = document.querySelector('input[name="dev-allocation"]:checked');
        if (allocSelected && (allocSelected.value === 'no' || allocSelected.value === 'personal')) {
            const errDevId = document.getElementById('err-dev-id');
            if (errDevId) errDevId.style.display = 'none';
            if (devIdInput) devIdInput.style.borderColor = '';
            return true;
        }

        const devIdVal = devIdInput.value.trim().toLowerCase();
        const errDevId = document.getElementById('err-dev-id');
        
        let isValid = true;

        // Check Device ID duplicate
        if (devIdVal) {
            const dupId = thietBiList.some((item, index) => {
                if (excludeIndex !== "" && index === parseInt(excludeIndex)) return false;
                return (item.devId || '').toLowerCase() === devIdVal;
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
                
                // Mẫu gợi ý mặc định ban đầu phòng khi danh sách trống
                const defaults = {
                    'user-dept': [
                        'Ban Đầu tư Pháp lý', 'Ban QLDA Bảo Lộc', 'Ban QLDA COSTAMIGO', 
                        'Ban QLDA Costamigo', 'Ban QLDA Sales Gallery', 'Ban TGĐ ERL', 
                        'BKS', 'CNTT', 'CQX', 'Cung ứng & Đấu thầu', 'DVKH & HTKD', 
                        'Đầu tư', 'ERL', 'HCNS', 'HĐCL', 'IOM', 'Khối Vận hành', 
                        'Kinh doanh', 'Kinh doanh - IOM', 'KT', 'MKT', 'MKT-IOM', 
                        'Pháp chế doanh nghiệp', 'Pháp lý', 'Pháp lý Dự án', 'QHTK', 
                        'TC', 'TGĐ', 'VP.HĐCL'
                    ],
                    'dev-type': ['Laptop', 'PC', 'Server', 'iMac', 'MacBook'],
                    'dev-main': ['H610M', 'B760M', 'H510M', 'B560M', 'A320M'],
                    'dev-cpu': ['Core i5 12400F', 'Core i7 13700', 'Core i3 12100', 'Core i5 10400', 'Ryzen 5 5600G'],
                    'dev-ssd': ['256GB SSD', '512GB SSD', '1TB SSD', '128GB SSD'],
                    'dev-hdd': ['1TB HDD', '2TB HDD', '500GB HDD', 'Không có HDD'],
                    'dev-monitor': ['Dell 24 inch', 'HP 21.5 inch', 'LG 24 inch', 'Samsung 27 inch', 'Asus 23.8 inch'],
                    'dev-vga': ['GTX 1650', 'RTX 3060', 'RTX 2060', 'Intel UHD Graphics', 'Radeon Graphics']
                };

                if (defaults[fieldId]) {
                    defaults[fieldId].forEach(val => uniqueSet.add(val));
                }

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
                
                // Thiết lập CSS inline trực tiếp để chống cache CSS của trình duyệt
                dropdown.style.position = 'absolute';
                dropdown.style.background = '#1a2230'; // Màu tối Slate 900
                dropdown.style.border = '1px solid rgba(249, 115, 22, 0.4)'; // Viền cam thương hiệu
                dropdown.style.borderRadius = '8px';
                dropdown.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)';
                dropdown.style.maxHeight = '200px';
                dropdown.style.overflowY = 'auto';
                dropdown.style.zIndex = '1000';
                dropdown.style.marginTop = '4px';
                dropdown.style.width = input.offsetWidth + 'px';
                dropdown.style.left = input.offsetLeft + 'px';
                dropdown.style.top = (input.offsetTop + input.offsetHeight) + 'px';

                filtered.forEach((val, idx) => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-suggestion-item';
                    item.innerText = val;
                    
                    // Thiết lập CSS inline cho từng dòng gợi ý
                    item.style.padding = '10px 14px';
                    item.style.cursor = 'pointer';
                    item.style.color = '#cbd5e1';
                    item.style.fontSize = '13px';
                    item.style.transition = 'all 0.15s ease';
                    item.style.borderBottom = '1px solid rgba(255, 255, 255, 0.03)';
                    item.style.textAlign = 'left';

                    // Hiệu ứng hover giả lập bằng JS để chống lỗi cache CSS
                    item.addEventListener('mouseenter', () => {
                        item.style.background = 'rgba(249, 115, 22, 0.15)';
                        item.style.color = '#fff';
                        item.style.paddingLeft = '18px';
                    });
                    item.addEventListener('mouseleave', () => {
                        item.style.background = 'transparent';
                        item.style.color = '#cbd5e1';
                        item.style.paddingLeft = '14px';
                    });

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

            input.addEventListener('focus', () => {
                if (input.value.trim() === '') {
                    showDropdown('');
                }
            });

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

    function getItemCreatedTimestamp(item) {
        if (!item) return 0;
        if (item.history && item.history.length > 0) {
            const createLog = item.history.find(h => h.action === 'Tạo mới');
            if (createLog && createLog.time) {
                const parsed = parseDateDMY(createLog.time);
                if (parsed) return parsed.getTime();
            }
            if (item.history.length === 1 && item.history[0].time) {
                const parsed = parseDateDMY(item.history[0].time);
                if (parsed) return parsed.getTime();
            }
        }
        if (item.createdAt) {
            const parsed = parseDateDMY(item.createdAt);
            if (parsed) return parsed.getTime();
        }
        return 0;
    }

    function getItemUpdatedTimestamp(item) {
        if (!item) return 0;
        if (item.history && item.history.length > 0) {
            const lastLog = item.history[item.history.length - 1];
            if (lastLog && lastLog.time) {
                const parsed = parseDateDMY(lastLog.time);
                if (parsed) return parsed.getTime();
            }
        }
        if (item.updatedAt) {
            const parsed = parseDateDMY(item.updatedAt);
            if (parsed) return parsed.getTime();
        }
        return getItemCreatedTimestamp(item);
    }

    function renderDashboard() {
        const totalUsers = thietBiList.length;
        const onlineUsers = thietBiList.filter(item => !item.userDisabled).length;
        const offlineUsers = thietBiList.filter(item => item.userDisabled).length;

        // PC vs Laptop vs Personal vs No device
        let totalPc = 0;
        let totalLaptop = 0;
        let totalPersonal = 0;
        let totalNoDevice = 0;

        thietBiList.forEach(item => {
            const alloc = item.devAllocation || (item.devStatus === 'Không cấp' ? 'no' : (item.devStatus === 'Thiết bị cá nhân' ? 'personal' : 'yes'));
            if (alloc === 'no' || item.devStatus === 'Không cấp') {
                totalNoDevice++;
            } else if (alloc === 'personal' || item.devStatus === 'Thiết bị cá nhân') {
                totalPersonal++;
            } else {
                const type = (item.devType || '').toLowerCase().trim();
                if (type.includes('laptop') || type.includes('macbook') || type.includes('notebook')) {
                    totalLaptop++;
                } else if (type.includes('pc') || type.includes('máy bàn') || type.includes('workstation') || type.includes('desktop') || type.includes('đồng bộ')) {
                    totalPc++;
                } else if (type) {
                    totalPc++;
                }
            }
        });

        // 1. Update Stat Cards
        const elTotalUsers = document.getElementById('dash-total-users');
        const elUserOnline = document.getElementById('dash-user-online');
        const elUserOffline = document.getElementById('dash-user-offline');
        const elTotalPc = document.getElementById('dash-total-pc');
        const elTotalLaptop = document.getElementById('dash-total-laptop');
        const elTotalPersonal = document.getElementById('dash-total-personal');
        const elPersonalSub = document.getElementById('dash-personal-sub');
        const elTotalKho = document.getElementById('dash-total-kho');
        const elKhoReady = document.getElementById('dash-kho-ready');

        if (elTotalUsers) elTotalUsers.innerText = totalUsers;
        if (elUserOnline) elUserOnline.innerText = `🟢 ${onlineUsers} Online`;
        if (elUserOffline) elUserOffline.innerText = `🔴 ${offlineUsers} Offline`;
        if (elTotalPc) elTotalPc.innerText = totalPc;
        if (elTotalLaptop) elTotalLaptop.innerText = totalLaptop;
        if (elTotalPersonal) elTotalPersonal.innerText = totalPersonal + totalNoDevice;
        if (elPersonalSub) elPersonalSub.innerText = `${totalPersonal} Cá nhân | ${totalNoDevice} Không cấp`;

        const totalKhoItems = khoList ? khoList.length : 0;
        const readyKhoItems = khoList ? khoList.filter(k => (k.status || '').toLowerCase().includes('sẵn sàng')).length : 0;
        if (elTotalKho) elTotalKho.innerText = totalKhoItems;
        if (elKhoReady) elKhoReady.innerText = `${readyKhoItems} Sẵn sàng cấp phát`;

        // 2. Department User Distribution Breakdown
        const elDeptList = document.getElementById('dash-dept-list');
        const elDeptCount = document.getElementById('dash-dept-count');

        if (elDeptList) {
            elDeptList.innerHTML = '';
            const deptCounts = {};
            thietBiList.forEach(item => {
                const dept = (item.userDept || '').trim() || 'Chưa phân phòng ban';
                deptCounts[dept] = (deptCounts[dept] || 0) + 1;
            });

            const sortedDepts = Object.keys(deptCounts).sort((a, b) => deptCounts[b] - deptCounts[a]);
            if (elDeptCount) elDeptCount.innerText = `${sortedDepts.length} phòng ban`;

            if (sortedDepts.length === 0) {
                elDeptList.innerHTML = '<div class="text-muted" style="font-size: 13px; font-style: italic;">Chưa có dữ liệu phòng ban</div>';
            } else {
                const maxDeptUser = Math.max(...Object.values(deptCounts)) || 1;
                sortedDepts.forEach(dept => {
                    const count = deptCounts[dept];
                    const percent = Math.round((count / maxDeptUser) * 100);
                    const div = document.createElement('div');
                    div.style.cssText = 'display: flex; flex-direction: column; gap: 4px; cursor: pointer; padding: 4px 6px; border-radius: 6px; transition: background 0.2s ease;';
                    div.title = `Click để xem danh sách nhân sự ${dept}`;
                    div.onclick = () => {
                        switchToTab('tab-cap-phat-list');
                        const filterDept = document.getElementById('filter-dept-thietbi');
                        if (filterDept) {
                            filterDept.value = dept;
                            renderThietBi();
                        }
                    };
                    div.innerHTML = `
                        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 500;">
                            <span style="color: var(--text-primary);"><i class="fa-solid fa-folder" style="color: var(--primary-color); margin-right: 6px;"></i>${dept}</span>
                            <span style="font-weight: 700; color: var(--primary-color);">${count} nhân sự</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, var(--primary-color), #f97316); border-radius: 4px; transition: width 0.5s ease;"></div>
                        </div>
                    `;
                    elDeptList.appendChild(div);
                });
            }
        }

        // 3. Device Condition Status Breakdown
        const elStatusBreakdown = document.getElementById('dash-status-breakdown');
        if (elStatusBreakdown) {
            elStatusBreakdown.innerHTML = '';
            const statusCounts = { 'Mới': 0, 'Trung bình': 0, 'Cũ': 0, 'Xem xét thay thế': 0 };
            let totalAllocatedWithStatus = 0;

            thietBiList.forEach(item => {
                if (item.devStatus && statusCounts.hasOwnProperty(item.devStatus)) {
                    statusCounts[item.devStatus]++;
                    totalAllocatedWithStatus++;
                }
            });

            const statusColors = {
                'Mới': '#22c55e',
                'Trung bình': '#3b82f6',
                'Cũ': '#eab308',
                'Xem xét thay thế': '#ef4444'
            };

            for (const st in statusCounts) {
                const count = statusCounts[st];
                const pct = totalAllocatedWithStatus > 0 ? Math.round((count / totalAllocatedWithStatus) * 100) : 0;
                const color = statusColors[st] || '#3b82f6';
                const div = document.createElement('div');
                div.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 500;">
                        <span style="color: var(--text-primary);"><i class="fa-solid fa-circle" style="font-size: 8px; color: ${color}; margin-right: 6px;"></i>Tình trạng "${st}"</span>
                        <span style="font-weight: 700; color: ${color};">${count} thiết bị (${pct}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.5s ease;"></div>
                    </div>
                `;
                elStatusBreakdown.appendChild(div);
            }
        }

        // 4. Recent Activity Log Feed (Sorted Chronologically: Newest First)
        const elRecentActivity = document.getElementById('dash-recent-activity');
        if (elRecentActivity) {
            elRecentActivity.innerHTML = '';
            let allLogs = [];

            function parseLogTime(timeStr) {
                if (!timeStr) return 0;
                const match = String(timeStr).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+lúc\s+(\d{1,2}):(\d{1,2}))?/);
                if (match) {
                    const day = parseInt(match[1]);
                    const month = parseInt(match[2]) - 1;
                    const year = parseInt(match[3]);
                    const hour = match[4] ? parseInt(match[4]) : 0;
                    const min = match[5] ? parseInt(match[5]) : 0;
                    return new Date(year, month, day, hour, min).getTime();
                }
                return 0;
            }

            thietBiList.forEach(item => {
                if (item.history && item.history.length > 0) {
                    item.history.forEach(log => {
                        allLogs.push({
                            userName: item.userName,
                            userId: item.userId,
                            time: log.time,
                            action: log.action,
                            details: log.details,
                            timestamp: parseLogTime(log.time)
                        });
                    });
                }
            });

            // Sắp xếp các nhật ký mới nhất theo thời gian (giảm dần)
            allLogs.sort((a, b) => b.timestamp - a.timestamp);

            if (allLogs.length === 0) {
                elRecentActivity.innerHTML = '<div class="text-muted" style="font-size: 13px; font-style: italic;">Chưa có hoạt động cập nhật</div>';
            } else {
                allLogs.slice(0, 8).forEach(log => {
                    const div = document.createElement('div');
                    div.style.cssText = 'padding: 10px 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; font-size: 12px;';
                    div.innerHTML = `
                        <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--text-primary); margin-bottom: 3px;">
                            <span>${log.userName} (${log.userId}) - <span style="color: var(--primary-color);">${log.action}</span></span>
                            <span style="font-weight: 400; color: var(--text-secondary); font-size: 11px;">${log.time}</span>
                        </div>
                        <div style="color: var(--text-secondary); line-height: 1.4;">${log.details}</div>
                    `;
                    elRecentActivity.appendChild(div);
                });
            }
        }

        // 5. License Expiry Alerts Summary (Sorted by Soonest Expiry Date)
        const elLicenseAlerts = document.getElementById('dash-license-alerts');
        if (elLicenseAlerts) {
            elLicenseAlerts.innerHTML = '';
            
            const sortedGiaHan = [...(giaHanList || [])].sort((a, b) => {
                const dateA = parseDateDMY(a.expiryDate) || new Date(8640000000000000);
                const dateB = parseDateDMY(b.expiryDate) || new Date(8640000000000000);
                return dateA - dateB;
            });

            if (sortedGiaHan.length === 0) {
                elLicenseAlerts.innerHTML = '<div class="text-muted" style="font-size: 13px; font-style: italic;">Không có thông tin bản quyền nào</div>';
            } else {
                sortedGiaHan.forEach(lic => {
                    const days = calculateDaysRemaining(lic.expiryDate);
                    const dateFormatted = formatDateDMY(lic.expiryDate);
                    let badgeBg = 'rgba(239, 68, 68, 0.15)';
                    let badgeColor = '#ef4444';
                    let badgeBorder = 'rgba(239, 68, 68, 0.3)';
                    let statusText = dateFormatted;

                    if (days <= 0) {
                        statusText = `Đã hết hạn (${dateFormatted})`;
                    } else if (days <= 30) {
                        statusText = `Còn ${days} ngày (${dateFormatted})`;
                    } else if (days <= 90) {
                        badgeBg = 'rgba(234, 179, 8, 0.15)';
                        badgeColor = '#eab308';
                        badgeBorder = 'rgba(234, 179, 8, 0.3)';
                        statusText = `Còn ${days} ngày (${dateFormatted})`;
                    } else {
                        badgeBg = 'rgba(34, 197, 94, 0.15)';
                        badgeColor = '#22c55e';
                        badgeBorder = 'rgba(34, 197, 94, 0.3)';
                        statusText = dateFormatted;
                    }

                    const div = document.createElement('div');
                    div.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid ${badgeBorder}; border-radius: 10px; font-size: 13px; margin-bottom: 8px; transition: all 0.2s;`;
                    div.innerHTML = `
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary); font-size: 14px; margin-bottom: 2px;">Bản quyền ${lic.name || lic.softwareName || ''}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${lic.provider || '—'}</div>
                        </div>
                        <div style="text-align: right;">
                            <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 12px; font-weight: 600;">${statusText}</span>
                        </div>
                    `;
                    elLicenseAlerts.appendChild(div);
                });
            }
        }
    }

    function renderThietBi(filterText = '') {
        tbodyThietBi.innerHTML = '';
        
        const deptFilter = document.getElementById('filter-dept-thietbi') 
            ? document.getElementById('filter-dept-thietbi').value 
            : '';
        const userStatusFilter = document.getElementById('filter-status-thietbi')
            ? document.getElementById('filter-status-thietbi').value
            : '';

        let sortedList = [...thietBiList];
        if (userStatusFilter === 'created_recent') {
            sortedList.sort((a, b) => getItemCreatedTimestamp(b) - getItemCreatedTimestamp(a));
        } else if (userStatusFilter === 'recent' || userStatusFilter === 'updated_recent') {
            sortedList.sort((a, b) => getItemUpdatedTimestamp(b) - getItemUpdatedTimestamp(a));
        } else {
            sortedList.sort((a, b) => {
                // 1. Ưu tiên Online (0) trước, Offline (1) sau
                const statusA = a.userDisabled ? 1 : 0;
                const statusB = b.userDisabled ? 1 : 0;
                if (statusA !== statusB) {
                    return statusA - statusB;
                }
                // 2. Sắp xếp tên từ A đến Z
                const nameA = a.userName ? a.userName.trim() : "";
                const nameB = b.userName ? b.userName.trim() : "";
                return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
            });
        }

        const now = new Date().getTime();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

        // Safe filter matching keyword
        const keywords = filterText.toLowerCase().split(/\s+/).filter(Boolean);
        const filtered = sortedList.filter(item => {
            if (deptFilter && (item.userDept || '').trim() !== deptFilter) {
                return false;
            }
            if (userStatusFilter === 'disabled' && !item.userDisabled) {
                return false;
            }
            if (userStatusFilter === 'active' && item.userDisabled) {
                return false;
            }
            if (userStatusFilter === 'created_recent') {
                const cTs = getItemCreatedTimestamp(item);
                if (cTs === 0 || (now - cTs) > sevenDaysMs) return false;
            }
            if (userStatusFilter === 'updated_recent') {
                const uTs = getItemUpdatedTimestamp(item);
                if (uTs === 0 || (now - uTs) > sevenDaysMs) return false;
            }
            if (userStatusFilter === 'recent') {
                const maxTs = Math.max(getItemCreatedTimestamp(item), getItemUpdatedTimestamp(item));
                if (maxTs === 0 || (now - maxTs) > sevenDaysMs) return false;
            }

            if (keywords.length === 0) return true;
            
            const cTs = getItemCreatedTimestamp(item);
            const uTs = getItemUpdatedTimestamp(item);
            const isCreatedRecent = cTs > 0 && ((now - cTs) <= sevenDaysMs);
            const isUpdatedRecent = uTs > 0 && ((now - uTs) <= sevenDaysMs);

            const disabledTag = item.userDisabled ? 'offline disable user nghỉ việc đã vô hiệu hóa' : 'online đang hoạt động';
            const recentTag = (isCreatedRecent ? 'mới thêm mới tạo mới gần đây ' : '') + (isUpdatedRecent ? 'mới cập nhật gần đây recent' : '');
            const itemText = `
                ${item.userId || ''} 
                ${item.userName || ''} 
                ${item.devId || ''} 
                ${item.userDept || ''}
                ${item.userEmail || ''}
                ${item.userPhone || ''}
                ${item.userElement || ''}
                ${item.userKeyElement || ''}
                ${item.devType || ''}
                ${item.devMain || ''}
                ${item.devCpu || ''}
                ${item.devRam || ''}
                ${item.devNotes || ''}
                ${disabledTag}
                ${recentTag}
            `.toLowerCase();
            
            return keywords.every(kw => itemText.includes(kw));
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageThietBi) || 1;
        if (currentPageThietBi > totalPages) currentPageThietBi = totalPages;
        if (currentPageThietBi < 1) currentPageThietBi = 1;

        const elStart = document.getElementById('pag-start') || document.getElementById('pag-start-thietbi');
        const elEnd = document.getElementById('pag-end') || document.getElementById('pag-end-thietbi');
        const elTotal = document.getElementById('pag-total') || document.getElementById('pag-total-thietbi');
        const elCurrent = document.getElementById('pag-current') || document.getElementById('pag-current-thietbi');

        if (elStart) elStart.innerText = totalItems > 0 ? (currentPageThietBi - 1) * itemsPerPageThietBi + 1 : 0;
        if (elEnd) elEnd.innerText = Math.min(currentPageThietBi * itemsPerPageThietBi, totalItems);
        if (elTotal) elTotal.innerText = totalItems;
        if (elCurrent) elCurrent.innerText = `Trang ${currentPageThietBi} / ${totalPages}`;

        const btnPrev = document.getElementById('btn-prev-page') || document.getElementById('btn-prev-page-thietbi');
        const btnNext = document.getElementById('btn-next-page') || document.getElementById('btn-next-page-thietbi');

        if (btnPrev) {
            btnPrev.disabled = currentPageThietBi === 1;
            btnPrev.style.opacity = currentPageThietBi === 1 ? '0.5' : '1';
            btnPrev.style.cursor = currentPageThietBi === 1 ? 'not-allowed' : 'pointer';
        }
        if (btnNext) {
            btnNext.disabled = currentPageThietBi === totalPages;
            btnNext.style.opacity = currentPageThietBi === totalPages ? '0.5' : '1';
            btnNext.style.cursor = currentPageThietBi === totalPages ? 'not-allowed' : 'pointer';
        }

        if (totalItems === 0) {
            tbodyThietBi.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7" class="text-center text-muted">Không tìm thấy dữ liệu cấp phát thiết bị!</td>
                </tr>
            `;
            return;
        }

        const startIndex = (currentPageThietBi - 1) * itemsPerPageThietBi;
        const endIndex = Math.min(startIndex + itemsPerPageThietBi, totalItems);
        const pageItems = filtered.slice(startIndex, endIndex);

        pageItems.forEach((rawItem) => {
            const item = (typeof mappers !== 'undefined' && mappers.thietBi) ? mappers.thietBi.fromDB(rawItem) : rawItem;
            const originalIndex = thietBiList.indexOf(rawItem);
            const tr = document.createElement('tr');

            let keyArr = [];
            if (item.keyWin) keyArr.push(`<div class="key-item"><i class="fa-brands fa-windows text-primary"></i> <span>${item.keyWin}</span></div>`);
            if (item.keyOffice) keyArr.push(`<div class="key-item"><i class="fa-solid fa-file-word text-success"></i> <span>${item.keyOffice}</span></div>`);
            if (item.keyPdf) keyArr.push(`<div class="key-item"><i class="fa-solid fa-file-pdf text-danger"></i> <span>${item.keyPdf}</span></div>`);
            if (item.devApps) keyArr.push(`<div class="key-item" title="App bản quyền"><i class="fa-solid fa-cubes text-warning"></i> <span>${item.devApps}</span></div>`);
            const keysText = keyArr.length > 0 ? keyArr.join('') : '<span class="text-muted">Không có key</span>';

            const createdTs = getItemCreatedTimestamp(item);
            const updatedTs = getItemUpdatedTimestamp(item);
            const nowTs = new Date().getTime();
            const isCreatedRecentBadge = createdTs > 0 && ((nowTs - createdTs) <= 7 * 24 * 60 * 60 * 1000);
            const isUpdatedRecentBadge = !isCreatedRecentBadge && updatedTs > 0 && ((nowTs - updatedTs) <= 7 * 24 * 60 * 60 * 1000);

            let statusBadgeHtml = '';
            if (isCreatedRecentBadge) {
                statusBadgeHtml = `<span class="badge" style="margin-left: 4px; font-size: 11px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);" title="Mới tạo trong 7 ngày gần đây"><i class="fa-solid fa-sparkles"></i> Mới thêm</span>`;
            } else if (isUpdatedRecentBadge) {
                statusBadgeHtml = `<span class="badge" style="margin-left: 4px; font-size: 11px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);" title="Mới cập nhật thông tin trong 7 ngày gần đây"><i class="fa-solid fa-rotate"></i> Mới cập nhật</span>`;
            }

            const getStatusBadgeClass = (status) => {
                switch (status) {
                    case 'Mới': return 'badge-green';
                    case 'Trung bình': return 'badge-blue';
                    case 'Cũ': return 'badge-yellow';
                    case 'Xem xét thay thế': return 'badge-danger';
                    default: return '';
                }
            };

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
            if (item.devMonitorSn) configArr.push(`S/N Màn hình: ${item.devMonitorSn}`);
            if (item.devSn) configArr.push(`S/N Thiết bị: ${item.devSn}`);
            if (item.devKeyboard) {
                const kbText = (item.devKeyboard === true || item.devKeyboard === 'true') ? 'Bàn phím có dây' : item.devKeyboard;
                configArr.push(`Bàn phím: ${kbText}`);
            }
            if (item.devMouse) configArr.push(`Chuột: ${item.devMouse}`);
            if (item.devCables) configArr.push(`Dây kết nối: ${item.devCables}`);
            const configText = configArr.length > 0 ? configArr.join('<br>') : 'Chưa nhập cấu hình';

            tr.innerHTML = `
                <td>
                    <div class="user-info-cell">
                        <span class="name">
                            <span class="btn-edit-thietbi" data-index="${originalIndex}" style="cursor: pointer; color: var(--primary-color);" title="Click để chỉnh sửa">${item.userName}</span> 
                            <span class="badge badge-blue">${item.userId}</span>
                            ${statusBadgeHtml}
                            ${item.userDisabled 
                                ? `<span class="badge badge-danger" style="margin-left: 4px; font-size: 11px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-circle" style="font-size: 7px; color: #ef4444;"></i> Offline</span>` 
                                : `<span class="badge badge-success" style="margin-left: 4px; font-size: 11px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-circle" style="font-size: 7px; color: #22c55e;"></i> Online</span>`}
                        </span>
                        <span class="details">${item.userTitle ? item.userTitle + ' - ' : ''}${item.userDept || 'Không có phòng ban'}</span>
                        <span class="contact">${item.userEmail ? '<i class="fa-regular fa-envelope"></i> ' + item.userEmail : ''} ${item.userPhone ? ' | <i class="fa-solid fa-phone"></i> ' + item.userPhone : ''}</span>
                        ${item.userElement ? `
                            <span class="contact" style="display: flex; align-items: center; margin-top: 2px;">
                                <span style="display: inline-flex; align-items: center; justify-content: center; min-width: 14px; height: 14px; background: var(--text-muted); color: var(--bg-card, #1e293b); font-size: 9px; font-weight: 800; border-radius: 3px; line-height: 1; margin-right: 5px;">E</span> ${item.userElement}
                            </span>
                        ` : ''}
                        ${item.userKeyElement ? `
                            <span class="contact" style="display: flex; align-items: center; margin-top: 2px;">
                                <i class="fa-solid fa-key" style="font-size: 11px; margin-right: 5px;"></i> ${item.userKeyElement}
                            </span>
                        ` : ''}
                    </div>
                </td>
                <td>
                    <div class="user-info-cell">
                        ${item.devId ? `<span class="name"><span class="badge badge-green">${item.devId}</span> ${item.devStatus ? `<span class="badge ${getStatusBadgeClass(item.devStatus)}">${item.devStatus}</span>` : ''}</span>` : ''}
                        ${(item.devAllocation === 'no' || item.devStatus === 'Không cấp') && !item.devId ? `
                            <span class="badge badge-secondary" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3);"><i class="fa-solid fa-ban"></i> Không cấp thiết bị</span>
                        ` : ((item.devAllocation === 'personal' || item.devStatus === 'Thiết bị cá nhân') && !item.devId ? `
                            <span class="badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);"><i class="fa-solid fa-laptop-code"></i> Sử dụng thiết bị cá nhân</span>
                        ` : ((item.devType || item.devMain || item.devCpu || item.devRam || item.devSsd || item.devHdd || item.devStatus) ? `
                            ${!item.devId && item.devStatus ? `<span class="name"><span class="badge ${getStatusBadgeClass(item.devStatus)}">${item.devStatus}</span></span>` : ''}
                            <span class="details">Loại: ${item.devType || 'Chưa phân loại'}</span>
                        ` : (!item.devId ? `
                            <span class="text-muted" style="font-style: italic;">Chưa cấp phát</span>
                        ` : '')))}
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

        let devAllocVal = 'yes';
        const allocSelected = document.querySelector('input[name="dev-allocation"]:checked');
        if (allocSelected) devAllocVal = allocSelected.value;
        const hasDevice = devAllocVal === 'yes';

        const data = {
            devAllocation: devAllocVal,
            hasDevice: hasDevice,
            userDisabled: document.getElementById('user-disabled') ? document.getElementById('user-disabled').checked : false,
            userId: userIdInput.value.trim(),
            userName: document.getElementById('user-name').value.trim(),
            userTitle: document.getElementById('user-title').value.trim(),
            userDept: document.getElementById('user-dept').value.trim(),
            userEmail: document.getElementById('user-email').value.trim(),
            userPhone: document.getElementById('user-phone').value.trim(),
            userElement: document.getElementById('user-element') ? document.getElementById('user-element').value.trim() : '',
            userKeyElement: document.getElementById('user-key-element') ? document.getElementById('user-key-element').value.trim() : '',
            devId: devIdInput ? devIdInput.value.trim() : '',
            devType: hasDevice ? document.getElementById('dev-type').value.trim() : '',
            devMain: hasDevice ? document.getElementById('dev-main').value.trim() : '',
            devCpu: hasDevice ? document.getElementById('dev-cpu').value.trim() : '',
            devRam: hasDevice ? document.getElementById('dev-ram').value : '',
            devRamSlots: hasDevice ? document.getElementById('dev-ram-slots').value : '',
            devSsd: hasDevice ? document.getElementById('dev-ssd').value.trim() : '',
            devHdd: hasDevice ? document.getElementById('dev-hdd').value.trim() : '',
            devVga: hasDevice ? document.getElementById('dev-vga').value.trim() : '',
            keyWin: hasDevice ? document.getElementById('key-win').value.trim() : '',
            keyOffice: hasDevice ? document.getElementById('key-office').value.trim() : '',
            keyPdf: hasDevice ? document.getElementById('key-pdf').value.trim() : '',
            devNotes: hasDevice ? document.getElementById('dev-notes').value.trim() : '',
            devApps: hasDevice ? document.getElementById('dev-apps').value.trim() : '',
            devStatus: devAllocVal === 'no' ? 'Không cấp' : (devAllocVal === 'personal' ? 'Thiết bị cá nhân' : document.getElementById('dev-status').value),
            devMonitor: hasDevice ? document.getElementById('dev-monitor').value.trim() : '',
            devMonitorSn: (hasDevice && document.getElementById('dev-monitor-sn')) ? document.getElementById('dev-monitor-sn').value.trim() : '',
            devSn: hasDevice ? document.getElementById('dev-sn').value.trim() : '',
            devKeyboard: (hasDevice && document.getElementById('dev-keyboard')) ? document.getElementById('dev-keyboard').value : '',
            devMouse: (hasDevice && document.getElementById('dev-mouse')) ? document.getElementById('dev-mouse').value : '',
            devCables: hasDevice ? document.getElementById('dev-cables').value : '',
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
                let isDbSuccess = false;
                if (supabaseClient) {
                    const { data: insertedData, error } = await supabaseClient
                        .from('thiet_bi')
                        .insert([dbData])
                        .select();
                    if (error) {
                        console.error('[SUPABASE INSERT ERROR] thiet_bi:', JSON.stringify(error));
                        console.error('[SUPABASE INSERT DATA SENT]:', JSON.stringify(dbData));
                        showToast('Lỗi Lưu Mới DB', `Supabase báo lỗi: ${error.message || 'Thiếu cột hoặc chưa cấp quyền SQL'}`, 'error');
                    }
                    if (!error && insertedData && insertedData.length > 0) {
                        thietBiList.push(mappers.thietBi.fromDB(insertedData[0]));
                        isDbSuccess = true;
                    }
                }
                if (!isDbSuccess) {
                    data.id = 'local-' + Date.now();
                    thietBiList.push(data);
                }
                saveToLocalStorageFallback('thiet_bi', thietBiList);
                processPendingKhoDeduct();
                showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã lưu thông tin cấp phát thiết bị mới!' : 'Đã lưu tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
            } catch (err) {
                console.error("Lỗi thêm thiết bị:", err);
                // Lưu offline dự phòng
                data.id = 'local-' + Date.now();
                thietBiList.push(data);
                saveToLocalStorageFallback('thiet_bi', thietBiList);
                processPendingKhoDeduct();
                showToast('Lưu Offline', 'Không kết nối được Supabase. Đã lưu tạm thời trên trình duyệt!', 'warning');
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = thietBiList[idx];
            const oldDevId = oldItem ? (oldItem.devId || '') : '';
            const newDevId = devIdInput ? devIdInput.value.trim() : '';
            data.devId = newDevId || oldDevId;
            
            // Compare fields cleanly and accurately
            let changes = [];
            const wasDeviceAllocated = oldItem.hasDevice !== false && oldItem.devStatus !== 'Không cấp';
            const isDeviceAllocated = data.hasDevice;

            // 1. Kiểm tra trạng thái User (Disable / Active)
            if (!!oldItem.userDisabled !== !!data.userDisabled) {
                const statusOld = oldItem.userDisabled ? "Đã Disable User" : "Đang hoạt động";
                const statusNew = data.userDisabled ? "Đã Disable User" : "Đang hoạt động";
                changes.push(`• Thay đổi <strong>Disable User</strong>: "${statusOld}" ➔ "${statusNew}"`);
            }

            // 2. Kiểm tra thông tin nhân sự cơ bản
            const userFields = {
                userId: "ID Nhân viên",
                userName: "Họ và Tên",
                userTitle: "Chức danh",
                userDept: "Phòng ban",
                userEmail: "Email",
                userPhone: "Số điện thoại",
                userElement: "Element",
                userKeyElement: "Key Element"
            };
            for (const key in userFields) {
                let oldVal = (oldItem[key] || '').toString().trim() || "Trống";
                let newVal = (data[key] || '').toString().trim() || "Trống";
                if (oldVal !== newVal) {
                    changes.push(`• Thay đổi <strong>${userFields[key]}</strong>: "${oldVal}" ➔ "${newVal}"`);
                }
            }

            // 3. Kiểm tra thay đổi Cấp phát thiết bị
            if (wasDeviceAllocated && !isDeviceAllocated) {
                // Thu hồi / Bỏ cấp phát thiết bị
                const oldDevInfo = oldItem.devId ? `${oldItem.devId} (${oldItem.devType || 'Thiết bị'})` : (oldItem.devType || 'Thiết bị');
                const reasonText = data.devAllocation === 'personal' ? 'Chuyển sang Sử dụng thiết bị cá nhân' : 'Bỏ cấp phát thiết bị';
                changes.push(`• Thu hồi thiết bị: <strong>"${oldDevInfo}"</strong> ➔ <strong>"${reasonText}"</strong>`);
            } else if (!wasDeviceAllocated && isDeviceAllocated) {
                // Cấp phát thiết bị mới
                const newDevInfo = data.devId ? `${data.devId} (${data.devType || 'Thiết bị'})` : (data.devType || 'Thiết bị');
                changes.push(`• Cấp phát thiết bị mới: <strong>"Không cấp"</strong> ➔ <strong>"${newDevInfo}"</strong>`);
            } else if (isDeviceAllocated) {
                // Nếu cả cũ và mới đều có cấp thiết bị, so sánh chi tiết từng thông số phần cứng
                const devFields = {
                    devId: "ID Thiết bị",
                    devType: "Loại thiết bị",
                    devMain: "Mainboard",
                    devCpu: "CPU",
                    devRam: "RAM",
                    devRamSlots: "Số thanh RAM",
                    devSsd: "SSD",
                    devHdd: "HDD",
                    devVga: "VGA",
                    devMonitor: "Tên màn hình",
                    devMonitorSn: "Serial màn hình",
                    devSn: "Serial thiết bị",
                    devKeyboard: "Bàn phím",
                    devMouse: "Chuột",
                    devCables: "Dây kết nối",
                    keyWin: "Key Windows",
                    keyOffice: "Key Office",
                    keyPdf: "Key PDF",
                    devNotes: "Ghi chú thiết bị",
                    devApps: "Các app bản quyền",
                    devStatus: "Tình trạng thiết bị"
                };

                for (const key in devFields) {
                    let oldVal = (oldItem[key] || '').toString().trim() || "Trống";
                    let newVal = (data[key] || '').toString().trim() || "Trống";
                    if (oldVal !== newVal) {
                        changes.push(`• Thay đổi <strong>${devFields[key]}</strong>: "${oldVal}" ➔ "${newVal}"`);
                    }
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
                console.log('[DEBUG UPDATE] dbData keys:', Object.keys(dbData));
                console.log('[DEBUG UPDATE] dbData:', JSON.stringify(dbData));
                let isDbSuccess = false;
                const isLocalId = oldItem.id && typeof oldItem.id === 'string' && oldItem.id.startsWith('local-');
                if (supabaseClient && !isLocalId) {
                    const { data: updatedData, error } = await supabaseClient
                        .from('thiet_bi')
                        .update(dbData)
                        .eq('id', oldItem.id)
                        .select();
                    if (error) {
                        console.error('[SUPABASE UPDATE ERROR] thiet_bi:', JSON.stringify(error));
                        console.error('[SUPABASE UPDATE DATA SENT]:', JSON.stringify(dbData));
                        showToast('Lỗi Cập Nhật DB', `Supabase báo lỗi: ${error.message || 'Thiếu cột hoặc chưa cấp quyền SQL'}`, 'error');
                    }
                    if (!error && updatedData && updatedData.length > 0) {
                        thietBiList[idx] = mappers.thietBi.fromDB(updatedData[0]);
                        isDbSuccess = true;
                    }
                }
                if (!isDbSuccess) {
                    data.id = oldItem.id;
                    thietBiList[idx] = data;
                }
                saveToLocalStorageFallback('thiet_bi', thietBiList);
                processPendingKhoDeduct();
                showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã cập nhật thông tin cấp phát thiết bị!' : 'Đã cập nhật tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
                resetFormThietBi();
            } catch (err) {
                console.error("Lỗi cập nhật thiết bị:", err);
                data.id = oldItem.id;
                thietBiList[idx] = data;
                saveToLocalStorageFallback('thiet_bi', thietBiList);
                processPendingKhoDeduct();
                showToast('Lưu Offline', 'Không kết nối được Supabase. Đã cập nhật tạm thời trên trình duyệt!', 'warning');
                resetFormThietBi();
            }
        }

        updateDeptFilterThietBi();
        renderThietBi();
        formCapPhat.reset();

        if (indexStr !== '') {
            resetFormThietBi();
            switchToTab('tab-cap-phat-list');
        } else {
            resetFormThietBi();
        }
    });

    // Populate form with existing data to Edit
    function editThietBi(index) {
        const item = thietBiList[index];
        editIndexThietBi.value = index;
        
        userIdInput.value = item.userId || '';
        if (devIdInput) devIdInput.value = item.devId || '';
        document.getElementById('user-name').value = item.userName || '';
        document.getElementById('user-title').value = item.userTitle;
        document.getElementById('user-dept').value = item.userDept;
        document.getElementById('user-email').value = item.userEmail || '';
        document.getElementById('user-phone').value = item.userPhone || '';
        if (document.getElementById('user-element')) document.getElementById('user-element').value = item.userElement || '';
        if (document.getElementById('user-key-element')) document.getElementById('user-key-element').value = item.userKeyElement || '';
        const userDisabledBox = document.getElementById('user-disabled-box');
        if (userDisabledBox) {
            userDisabledBox.style.display = 'inline-flex';
        }
        const userDisabledCb = document.getElementById('user-disabled');
        if (userDisabledCb) {
            userDisabledCb.checked = !!item.userDisabled;
            const container = document.getElementById('user-info-subsection');
            if (container) {
                container.style.background = item.userDisabled ? 'rgba(239, 68, 68, 0.05)' : '';
                container.style.borderColor = item.userDisabled ? 'rgba(239, 68, 68, 0.3)' : '';
            }
        }
        const alloc = item.devAllocation || (item.devStatus === 'Không cấp' ? 'no' : (item.devStatus === 'Thiết bị cá nhân' ? 'personal' : 'yes'));
        const radioTarget = document.querySelector(`input[name="dev-allocation"][value="${alloc}"]`);
        if (radioTarget) {
            radioTarget.checked = true;
            toggleDeviceFields(alloc === 'yes');
        }
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
        if (document.getElementById('dev-monitor-sn')) document.getElementById('dev-monitor-sn').value = item.devMonitorSn || '';
        document.getElementById('dev-sn').value = item.devSn || '';
        if (document.getElementById('dev-keyboard')) {
            let kbVal = item.devKeyboard;
            if (kbVal === true || kbVal === 'true') kbVal = 'Bàn phím có dây';
            else if (!kbVal || kbVal === false) kbVal = '';
            document.getElementById('dev-keyboard').value = kbVal;
        }
        if (document.getElementById('dev-mouse')) document.getElementById('dev-mouse').value = item.devMouse || '';
        document.getElementById('dev-cables').value = item.devCables || '';

        btnSaveThietBi.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Cấp Phát';
        btnCancelThietBi.classList.remove('hidden');

        // Scroll to top of tab view to see form
        document.querySelector('.tab-container').scrollTop = 0;

        // Switch tab to cap-phat-form
        switchToTab('tab-cap-phat-form');
        
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
                saveToLocalStorageFallback('thiet_bi', thietBiList);
                updateDeptFilterThietBi();
                renderThietBi();
                showToast('Đã xóa', 'Xóa thông tin cấp phát thành công!', 'warning');
                
                if (editIndexThietBi.value === index.toString()) {
                    resetFormThietBi();
                }
            } catch (err) {
                console.error(err);
                // Xóa offline dự phòng
                thietBiList.splice(index, 1);
                saveToLocalStorageFallback('thiet_bi', thietBiList);
                updateDeptFilterThietBi();
                renderThietBi();
                showToast('Xóa Offline', 'Không kết nối được Supabase. Đã xóa tạm thời trên trình duyệt!', 'warning');
                
                if (editIndexThietBi.value === index.toString()) {
                    resetFormThietBi();
                }
            }
        }
    }

    function resetFormThietBi() {
        editIndexThietBi.value = '';
        pendingKhoIndexToDeduct = null;
        btnSaveThietBi.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Thông Tin Mới';
        formCapPhat.reset();
        const devAllocYes = document.getElementById('dev-alloc-yes');
        if (devAllocYes) {
            devAllocYes.checked = true;
            toggleDeviceFields(true);
        }
        const userDisabledBox = document.getElementById('user-disabled-box');
        if (userDisabledBox) {
            userDisabledBox.style.display = 'none';
        }
        const userDisabledCb = document.getElementById('user-disabled');
        if (userDisabledCb) {
            userDisabledCb.checked = false;
            const container = document.getElementById('user-info-subsection');
            if (container) {
                container.style.background = '';
                container.style.borderColor = '';
            }
        }

        document.getElementById('err-user-id').style.display = 'none';
        document.getElementById('err-dev-id').style.display = 'none';
        userIdInput.style.borderColor = '';
        devIdInput.style.borderColor = '';
    }

    btnCancelThietBi.addEventListener('click', () => {
        resetFormThietBi();
        switchToTab('tab-cap-phat-list');
        showToast('Thông báo', 'Đã hủy nhập liệu và quay về danh sách!', 'info');
    });

    function toggleDeviceFields(hasDevice) {
        const deviceFieldsWrapper = document.getElementById('device-fields-wrapper');
        if (!deviceFieldsWrapper) return;
        if (hasDevice) {
            deviceFieldsWrapper.style.display = 'block';
        } else {
            deviceFieldsWrapper.style.display = 'none';
            const errDevId = document.getElementById('err-dev-id');
            if (errDevId) errDevId.style.display = 'none';
            if (devIdInput) devIdInput.style.borderColor = '';
        }
    }

    const devAllocRadios = document.querySelectorAll('input[name="dev-allocation"]');
    devAllocRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            toggleDeviceFields(e.target.value === 'yes');
        });
    });

    // =========================================================================
    // MODAL CHUYỂN CẤU HÌNH THIẾT BỊ
    // =========================================================================
    const btnOpenTransferModal = document.getElementById('btn-open-transfer-modal');
    const modalTransferDevice = document.getElementById('modal-transfer-device');
    const btnCloseTransferModal = document.getElementById('btn-close-transfer-modal');
    const btnCancelTransferModal = document.getElementById('btn-cancel-transfer-modal');
    const btnSubmitTransfer = document.getElementById('btn-submit-transfer');

    const transferTypeUserRadio = document.getElementById('transfer-type-user');
    const transferTypeKhoRadio = document.getElementById('transfer-type-kho');
    const transferSectionUser = document.getElementById('transfer-section-user');
    const transferSectionKho = document.getElementById('transfer-section-kho');

    const transferTargetUserIdInput = document.getElementById('transfer-target-user-id');
    const transferUserSuggestions = document.getElementById('transfer-user-suggestions');
    const transferTargetUserPreview = document.getElementById('transfer-target-user-preview');
    const transferKhoReasonInput = document.getElementById('transfer-kho-reason');
    const transferKhoNotesInput = document.getElementById('transfer-kho-notes');

    const transferSummaryTitle = document.getElementById('transfer-summary-title');
    const transferSummaryDetails = document.getElementById('transfer-summary-details');

    // Helper: Lấy thông tin thiết bị hiện tại (từ form hoặc item đang chỉnh sửa)
    function getCurrentDeviceSpecs() {
        const indexStr = editIndexThietBi.value;
        const allocSelected = document.querySelector('input[name="dev-allocation"]:checked');
        const devAllocVal = allocSelected ? allocSelected.value : 'yes';

        let devId = devIdInput.value.trim();
        let devType = document.getElementById('dev-type').value.trim();
        let devCpu = document.getElementById('dev-cpu').value.trim();
        let devRam = document.getElementById('dev-ram').value;
        let devSsd = document.getElementById('dev-ssd').value.trim();
        let devHdd = document.getElementById('dev-hdd').value.trim();
        let devMain = document.getElementById('dev-main').value.trim();
        let devMonitor = document.getElementById('dev-monitor').value.trim();
        let devStatus = document.getElementById('dev-status').value;

        // Nếu đang sửa item sẵn có
        let sourceUser = null;
        if (indexStr !== '') {
            const idx = parseInt(indexStr);
            if (idx >= 0 && idx < thietBiList.length) {
                sourceUser = thietBiList[idx];
            }
        }

        // Tên nhân sự hiện tại
        const currentUserId = userIdInput.value.trim();
        const currentUserName = document.getElementById('user-name').value.trim() || (sourceUser ? sourceUser.userName : 'Nhân viên hiện tại');

        return {
            sourceUser: sourceUser,
            currentUserId: currentUserId,
            currentUserName: currentUserName,
            devAllocVal: devAllocVal,
            hasDevice: devAllocVal === 'yes' && (devId || devType || devCpu || devRam),
            devId: devId,
            devType: devType || 'PC / Laptop',
            devMain: devMain,
            devCpu: devCpu,
            devRam: devRam,
            devRamSlots: document.getElementById('dev-ram-slots').value,
            devSsd: devSsd,
            devHdd: devHdd,
            devVga: document.getElementById('dev-vga').value.trim(),
            keyWin: document.getElementById('key-win').value.trim(),
            keyOffice: document.getElementById('key-office').value.trim(),
            keyPdf: document.getElementById('key-pdf').value.trim(),
            devNotes: document.getElementById('dev-notes').value.trim(),
            devApps: document.getElementById('dev-apps').value.trim(),
            devStatus: devStatus,
            devMonitor: devMonitor,
            devMonitorSn: document.getElementById('dev-monitor-sn') ? document.getElementById('dev-monitor-sn').value.trim() : '',
            devSn: document.getElementById('dev-sn').value.trim(),
            devKeyboard: document.getElementById('dev-keyboard') ? document.getElementById('dev-keyboard').value : '',
            devMouse: document.getElementById('dev-mouse') ? document.getElementById('dev-mouse').value : '',
            devCables: document.getElementById('dev-cables').value
        };
    }

    // Đóng Modal Chuyển Thiết Bị
    function closeTransferModal() {
        if (modalTransferDevice) modalTransferDevice.classList.add('hidden');
        if (transferTargetUserIdInput) transferTargetUserIdInput.value = '';
        if (transferUserSuggestions) transferUserSuggestions.classList.add('hidden');
        if (transferTargetUserPreview) transferTargetUserPreview.classList.add('hidden');
        if (transferKhoReasonInput) transferKhoReasonInput.value = '';
        if (transferKhoNotesInput) transferKhoNotesInput.value = '';
    }

    // Mở Modal Chuyển Thiết Bị
    if (btnOpenTransferModal) {
        btnOpenTransferModal.addEventListener('click', () => {
            const specs = getCurrentDeviceSpecs();

            if (!specs.hasDevice && !specs.devId && !specs.devType && !specs.devCpu) {
                showToast('Thông báo', 'Không có thông tin thiết bị để chuyển! Vui lòng chọn "Có cấp" và điền thông tin thiết bị trước.', 'warning');
                return;
            }

            // Nạp nội dung hiển thị tổng quan thiết bị
            transferSummaryTitle.innerText = `Thiết bị từ ${specs.currentUserName} (${specs.currentUserId || 'Mới'}):`;
            
            let html = `<strong>Mã thiết bị:</strong> ${specs.devId || 'Chưa đặt ID'}<br>`;
            html += `<strong>Loại:</strong> ${specs.devType} | <strong>Tình trạng:</strong> ${specs.devStatus}<br>`;
            let hardware = [];
            if (specs.devCpu) hardware.push(`CPU: ${specs.devCpu}`);
            if (specs.devRam) hardware.push(`RAM: ${specs.devRam}`);
            if (specs.devSsd) hardware.push(`SSD: ${specs.devSsd}GB`);
            if (specs.devHdd) hardware.push(`HDD: ${specs.devHdd}`);
            if (specs.devMonitor) hardware.push(`Màn hình: ${specs.devMonitor}`);
            html += `<strong>Cấu hình:</strong> ${hardware.length > 0 ? hardware.join(', ') : 'Chưa nhập chi tiết'}`;
            
            transferSummaryDetails.innerHTML = html;

            // Set lý do mặc định cho Lưu kho
            if (transferKhoReasonInput) {
                transferKhoReasonInput.value = `Thu hồi thiết bị (${specs.devId || specs.devType}) từ nhân viên ${specs.currentUserName}`;
            }

            // Reset tab lựa chọn
            if (transferTypeUserRadio) transferTypeUserRadio.checked = true;
            if (transferSectionUser) transferSectionUser.classList.remove('hidden');
            if (transferSectionKho) transferSectionKho.classList.add('hidden');

            if (modalTransferDevice) modalTransferDevice.classList.remove('hidden');
        });
    }

    if (btnCloseTransferModal) btnCloseTransferModal.addEventListener('click', closeTransferModal);
    if (btnCancelTransferModal) btnCancelTransferModal.addEventListener('click', closeTransferModal);

    // Chuyển đổi giữa 2 hình thức: Chuyển cho User vs Chuyển về Kho
    if (transferTypeUserRadio) {
        transferTypeUserRadio.addEventListener('change', () => {
            if (transferSectionUser) transferSectionUser.classList.remove('hidden');
            if (transferSectionKho) transferSectionKho.classList.add('hidden');
        });
    }
    if (transferTypeKhoRadio) {
        transferTypeKhoRadio.addEventListener('change', () => {
            if (transferSectionUser) transferSectionUser.classList.add('hidden');
            if (transferSectionKho) transferSectionKho.classList.remove('hidden');
        });
    }

    // Autocomplete cho ô nhập ID Nhân viên nhận
    if (transferTargetUserIdInput) {
        transferTargetUserIdInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                if (transferUserSuggestions) transferUserSuggestions.classList.add('hidden');
                if (transferTargetUserPreview) transferTargetUserPreview.classList.add('hidden');
                return;
            }

            const currentUserId = userIdInput.value.trim().toLowerCase();

            // Tìm gợi ý các user trong thietBiList
            const matches = thietBiList.filter(u => 
                u.userId.toLowerCase() !== currentUserId &&
                (u.userId.toLowerCase().includes(query) || u.userName.toLowerCase().includes(query) || (u.userDept && u.userDept.toLowerCase().includes(query)))
            ).slice(0, 5);

            if (matches.length === 0) {
                if (transferUserSuggestions) transferUserSuggestions.classList.add('hidden');
                if (transferTargetUserPreview) transferTargetUserPreview.classList.add('hidden');
                return;
            }

            let html = '';
            matches.forEach(m => {
                const devText = m.hasDevice ? ` (Có MB: ${m.devId || m.devType})` : ' (Không cấp MB)';
                html += `<div class="autocomplete-suggestion-item" data-userid="${m.userId}" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <strong>${m.userId}</strong> - ${m.userName} (${m.userDept || 'K.Xác Định'})<span style="font-size: 11px; opacity: 0.7; float: right;">${devText}</span>
                </div>`;
            });

            transferUserSuggestions.innerHTML = html;
            transferUserSuggestions.classList.remove('hidden');

            // Bắt sự kiện nhấp chọn item gợi ý
            const items = transferUserSuggestions.querySelectorAll('.autocomplete-suggestion-item');
            items.forEach(item => {
                item.addEventListener('click', () => {
                    const selectedId = item.getAttribute('data-userid');
                    transferTargetUserIdInput.value = selectedId;
                    transferUserSuggestions.classList.add('hidden');
                    updateTargetUserPreview(selectedId);
                });
            });

            // Cập nhật preview nếu khớp chính xác
            const exactMatch = matches.find(m => m.userId.toLowerCase() === query);
            if (exactMatch) {
                updateTargetUserPreview(exactMatch.userId);
            } else {
                if (transferTargetUserPreview) transferTargetUserPreview.classList.add('hidden');
            }
        });
    }

    function updateTargetUserPreview(userId) {
        const target = thietBiList.find(u => u.userId.toLowerCase() === userId.toLowerCase());
        if (target && transferTargetUserPreview) {
            let statusText = target.hasDevice ? `⚠️ Đang sử dụng thiết bị: <strong>${target.devId || target.devType}</strong> (Cấu hình này sẽ bị thay thế)` : `✅ Hiện chưa có thiết bị (Sẵn sàng nhận)`;
            transferTargetUserPreview.innerHTML = `
                <div style="font-weight: 600;"><i class="fa-solid fa-user-check"></i> ${target.userName} (${target.userId})</div>
                <div style="font-size: 11px; margin-top: 3px;">Phòng ban: ${target.userDept || 'K.Xác Định'} | Chức danh: ${target.userTitle || 'N/A'}</div>
                <div style="font-size: 11px; margin-top: 4px; color: ${target.hasDevice ? '#f59e0b' : '#22c55e'};">${statusText}</div>
            `;
            transferTargetUserPreview.classList.remove('hidden');
        } else if (transferTargetUserPreview) {
            transferTargetUserPreview.classList.add('hidden');
        }
    }

    // XỬ LÝ THỰC HIỆN CHUYỂN THIẾT BỊ
    if (btnSubmitTransfer) {
        btnSubmitTransfer.addEventListener('click', async () => {
            const specs = getCurrentDeviceSpecs();
            const now = new Date();
            const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} lúc ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            const isTransferToUser = transferTypeUserRadio.checked;

            if (isTransferToUser) {
                const targetUserId = transferTargetUserIdInput.value.trim();
                if (!targetUserId) {
                    showToast('Lỗi nhập liệu', 'Vui lòng nhập ID Nhân viên nhận thiết bị!', 'error');
                    return;
                }

                // Tìm target user
                const targetIdx = thietBiList.findIndex(u => u.userId.toLowerCase() === targetUserId.toLowerCase());
                if (targetIdx === -1) {
                    showToast('Không tìm thấy', `Không tìm thấy nhân viên nào có ID: "${targetUserId}"!`, 'error');
                    return;
                }

                const targetUser = thietBiList[targetIdx];

                // Kiểm tra xem có trùng với nhân viên hiện tại không
                if (specs.sourceUser && specs.sourceUser.id === targetUser.id) {
                    showToast('Cảnh báo', 'Không thể chuyển thiết bị cho chính nhân viên này!', 'warning');
                    return;
                }
                if (specs.currentUserId && specs.currentUserId.toLowerCase() === targetUser.userId.toLowerCase()) {
                    showToast('Cảnh báo', 'Không thể chuyển thiết bị cho chính nhân viên này!', 'warning');
                    return;
                }

                // 1. Cập nhật thiết bị cho targetUser
                const devIdentifier = specs.devId || specs.devType || 'Thiết bị';
                targetUser.hasDevice = true;
                targetUser.devAllocation = 'yes';
                targetUser.devId = specs.devId;
                targetUser.devType = specs.devType;
                targetUser.devMain = specs.devMain;
                targetUser.devCpu = specs.devCpu;
                targetUser.devRam = specs.devRam;
                targetUser.devRamSlots = specs.devRamSlots;
                targetUser.devSsd = specs.devSsd;
                targetUser.devHdd = specs.devHdd;
                targetUser.devVga = specs.devVga;
                targetUser.keyWin = specs.keyWin;
                targetUser.keyOffice = specs.keyOffice;
                targetUser.keyPdf = specs.keyPdf;
                targetUser.devNotes = specs.devNotes;
                targetUser.devApps = specs.devApps;
                targetUser.devStatus = specs.devStatus || 'Mới';
                targetUser.devMonitor = specs.devMonitor;
                targetUser.devMonitorSn = specs.devMonitorSn;
                targetUser.devSn = specs.devSn;
                targetUser.devKeyboard = specs.devKeyboard;
                targetUser.devMouse = specs.devMouse;
                targetUser.devCables = specs.devCables;
                targetUser.updatedAt = formattedDate;

                if (!targetUser.history) targetUser.history = [];
                targetUser.history.push({
                    time: formattedDate,
                    action: 'Nhận bàn giao thiết bị',
                    details: `Nhận điều chuyển thiết bị <strong>${devIdentifier}</strong> từ nhân viên <strong>${specs.currentUserName}</strong> (${specs.currentUserId || 'Mới'}).`
                });

                // Lưu targetUser lên Supabase
                try {
                    const dbTarget = mappers.thietBi.toDB(targetUser);
                    if (supabaseClient && targetUser.id && !String(targetUser.id).startsWith('local-')) {
                        await supabaseClient.from('thiet_bi').update(dbTarget).eq('id', targetUser.id);
                    }
                } catch (e) {
                    console.warn("Lỗi lưu targetUser lên Supabase:", e);
                }

                // 2. Nếu đang sửa sourceUser trong thietBiList -> Xóa thiết bị của sourceUser
                if (specs.sourceUser) {
                    const sourceIdx = thietBiList.findIndex(u => u.id === specs.sourceUser.id);
                    if (sourceIdx !== -1) {
                        const sUser = thietBiList[sourceIdx];
                        sUser.hasDevice = false;
                        sUser.devAllocation = 'no';
                        sUser.devId = '';
                        sUser.devType = '';
                        sUser.devMain = '';
                        sUser.devCpu = '';
                        sUser.devRam = '';
                        sUser.devRamSlots = '';
                        sUser.devSsd = '';
                        sUser.devHdd = '';
                        sUser.devVga = '';
                        sUser.keyWin = '';
                        sUser.keyOffice = '';
                        sUser.keyPdf = '';
                        sUser.devNotes = '';
                        sUser.devApps = '';
                        sUser.devStatus = 'Không cấp';
                        sUser.devMonitor = '';
                        sUser.devMonitorSn = '';
                        sUser.devSn = '';
                        sUser.devKeyboard = '';
                        sUser.devMouse = '';
                        sUser.devCables = '';
                        sUser.updatedAt = formattedDate;

                        if (!sUser.history) sUser.history = [];
                        sUser.history.push({
                            time: formattedDate,
                            action: 'Chuyển thiết bị',
                            details: `Chuyển điều phối thiết bị <strong>${devIdentifier}</strong> sang cho nhân viên <strong>${targetUser.userName}</strong> (${targetUser.userId}).`
                        });

                        try {
                            const dbSource = mappers.thietBi.toDB(sUser);
                            if (supabaseClient && sUser.id && !String(sUser.id).startsWith('local-')) {
                                await supabaseClient.from('thiet_bi').update(dbSource).eq('id', sUser.id);
                            }
                        } catch (e) {
                            console.warn("Lỗi lưu sourceUser lên Supabase:", e);
                        }
                    }
                }

                // Reset form thiết bị về "Không cấp"
                const devAllocNo = document.getElementById('dev-alloc-no');
                if (devAllocNo) {
                    devAllocNo.checked = true;
                    toggleDeviceFields(false);
                }

                // Lưu LocalStorage & Render lại
                saveToLocalStorageFallback('thiet_bi', thietBiList);
                renderThietBi();
                closeTransferModal();

                showToast('Thành công', `Đã chuyển thiết bị "${devIdentifier}" sang cho nhân viên ${targetUser.userName} (${targetUser.userId})!`, 'success');

            } else {
                // CHUYỂN VỀ LƯU KHO (kho_thiet_bi)
                const reason = transferKhoReasonInput.value.trim() || `Thu hồi thiết bị từ nhân viên ${specs.currentUserName}`;
                const notes = transferKhoNotesInput.value.trim();

                const devIdentifier = specs.devId || specs.devType || 'TB-KHO';
                let specsDetail = [];
                if (specs.devCpu) specsDetail.push(`CPU: ${specs.devCpu}`);
                if (specs.devRam) specsDetail.push(`RAM: ${specs.devRam}`);
                if (specs.devSsd) specsDetail.push(`SSD: ${specs.devSsd}GB`);
                if (specs.devHdd) specsDetail.push(`HDD: ${specs.devHdd}`);
                if (specs.devMonitor) specsDetail.push(`Màn hình: ${specs.devMonitor}`);

                const fullNotes = `Cấu hình: ${specsDetail.join(', ')}` + (notes ? `. Ghi chú: ${notes}` : '');

                const newKhoItem = {
                    code: devIdentifier,
                    name: `${specs.devType} ${specs.devCpu ? '(' + specs.devCpu + ')' : ''}`.trim(),
                    quantity: 1,
                    reason: reason,
                    dateStored: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
                    notes: fullNotes
                };

                let isDbSuccess = false;
                try {
                    const dbData = mappers.khoThietBi.toDB(newKhoItem);
                    if (supabaseClient) {
                        const { data: inserted, error } = await supabaseClient
                            .from('kho_thiet_bi')
                            .insert([dbData])
                            .select();
                        if (!error && inserted && inserted.length > 0) {
                            khoList.push(mappers.khoThietBi.fromDB(inserted[0]));
                            isDbSuccess = true;
                        }
                    }
                } catch (e) {
                    console.warn("Lỗi lưu kho_thiet_bi lên Supabase:", e);
                }

                if (!isDbSuccess) {
                    newKhoItem.id = 'local-kho-' + Date.now();
                    khoList.push(newKhoItem);
                }
                saveToLocalStorageFallback('kho_thiet_bi', khoList);
                renderKho();

                // Cập nhật sourceUser (nếu có)
                if (specs.sourceUser) {
                    const sourceIdx = thietBiList.findIndex(u => u.id === specs.sourceUser.id);
                    if (sourceIdx !== -1) {
                        const sUser = thietBiList[sourceIdx];
                        sUser.hasDevice = false;
                        sUser.devAllocation = 'no';
                        sUser.devId = '';
                        sUser.devType = '';
                        sUser.devMain = '';
                        sUser.devCpu = '';
                        sUser.devRam = '';
                        sUser.devRamSlots = '';
                        sUser.devSsd = '';
                        sUser.devHdd = '';
                        sUser.devVga = '';
                        sUser.keyWin = '';
                        sUser.keyOffice = '';
                        sUser.keyPdf = '';
                        sUser.devNotes = '';
                        sUser.devApps = '';
                        sUser.devStatus = 'Không cấp';
                        sUser.devMonitor = '';
                        sUser.devMonitorSn = '';
                        sUser.devSn = '';
                        sUser.devKeyboard = '';
                        sUser.devMouse = '';
                        sUser.devCables = '';
                        sUser.updatedAt = formattedDate;

                        if (!sUser.history) sUser.history = [];
                        sUser.history.push({
                            time: formattedDate,
                            action: 'Thu hồi về kho',
                            details: `Thu hồi thiết bị <strong>${devIdentifier}</strong> chuyển về lưu kho thiết bị.`
                        });

                        try {
                            const dbSource = mappers.thietBi.toDB(sUser);
                            if (supabaseClient && sUser.id && !String(sUser.id).startsWith('local-')) {
                                await supabaseClient.from('thiet_bi').update(dbSource).eq('id', sUser.id);
                            }
                        } catch (e) {
                            console.warn("Lỗi lưu sourceUser lên Supabase:", e);
                        }
                        saveToLocalStorageFallback('thiet_bi', thietBiList);
                        renderThietBi();
                    }
                }

                // Reset form thiết bị về "Không cấp"
                const devAllocNo = document.getElementById('dev-alloc-no');
                if (devAllocNo) {
                    devAllocNo.checked = true;
                    toggleDeviceFields(false);
                }

                closeTransferModal();
                showToast('Thành công', `Đã chuyển thiết bị "${devIdentifier}" về kho lưu trữ thành công!`, 'success');
            }
        });
    }

    // =========================================================================
    // MODAL CẤP PHÁT THIẾT BỊ TỪ KHO CHO NHÂN VIÊN
    // =========================================================================
    let currentSelectedKhoIndex = -1;

    const modalAllocateFromKho = document.getElementById('modal-allocate-from-kho');
    const btnCloseAllocateKhoModal = document.getElementById('btn-close-allocate-kho-modal');
    const btnCancelAllocateKhoModal = document.getElementById('btn-cancel-allocate-kho-modal');
    const btnSubmitAllocateKho = document.getElementById('btn-submit-allocate-kho');

    const allocateKhoTargetUserIdInput = document.getElementById('allocate-kho-target-user-id');
    const allocateKhoUserSuggestions = document.getElementById('allocate-kho-user-suggestions');
    const allocateKhoUserPreview = document.getElementById('allocate-kho-user-preview');
    const allocateKhoSummaryTitle = document.getElementById('allocate-kho-summary-title');
    const allocateKhoSummaryDetails = document.getElementById('allocate-kho-summary-details');

    function closeAllocateKhoModal() {
        if (modalAllocateFromKho) modalAllocateFromKho.classList.add('hidden');
        if (allocateKhoTargetUserIdInput) allocateKhoTargetUserIdInput.value = '';
        if (allocateKhoUserSuggestions) allocateKhoUserSuggestions.classList.add('hidden');
        if (allocateKhoUserPreview) allocateKhoUserPreview.classList.add('hidden');
        currentSelectedKhoIndex = -1;
    }

    function openAllocateKhoModal(index) {
        if (index < 0 || index >= khoList.length) return;
        currentSelectedKhoIndex = index;
        const item = khoList[index];

        if (allocateKhoSummaryTitle) {
            allocateKhoSummaryTitle.innerText = `Thiết bị từ kho: ${item.code || 'Mã KHO'}`;
        }
        if (allocateKhoSummaryDetails) {
            let html = `<strong>Tên thiết bị:</strong> ${item.name || 'Thiết bị'} | <strong>Số lượng trong kho:</strong> <span style="color:#eab308; font-weight:bold;">${item.quantity || 1}</span><br>`;
            html += `<strong>Lý do lưu kho:</strong> ${item.reason || 'Không có'}<br>`;
            if (item.notes) {
                html += `<strong>Ghi chú / Cấu hình:</strong> ${item.notes}`;
            }
            allocateKhoSummaryDetails.innerHTML = html;
        }

        if (allocateKhoTargetUserIdInput) allocateKhoTargetUserIdInput.value = '';
        if (allocateKhoUserSuggestions) allocateKhoUserSuggestions.classList.add('hidden');
        if (allocateKhoUserPreview) allocateKhoUserPreview.classList.add('hidden');

        if (modalAllocateFromKho) modalAllocateFromKho.classList.remove('hidden');
    }

    if (btnCloseAllocateKhoModal) btnCloseAllocateKhoModal.addEventListener('click', closeAllocateKhoModal);
    if (btnCancelAllocateKhoModal) btnCancelAllocateKhoModal.addEventListener('click', closeAllocateKhoModal);

    // Autocomplete cho ô nhập ID Nhân viên nhận từ kho
    if (allocateKhoTargetUserIdInput) {
        allocateKhoTargetUserIdInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                if (allocateKhoUserSuggestions) allocateKhoUserSuggestions.classList.add('hidden');
                if (allocateKhoUserPreview) allocateKhoUserPreview.classList.add('hidden');
                return;
            }

            const matches = thietBiList.filter(u => 
                u.userId.toLowerCase().includes(query) || 
                u.userName.toLowerCase().includes(query) || 
                (u.userDept && u.userDept.toLowerCase().includes(query))
            ).slice(0, 5);

            if (matches.length === 0) {
                if (allocateKhoUserSuggestions) allocateKhoUserSuggestions.classList.add('hidden');
                if (allocateKhoUserPreview) allocateKhoUserPreview.classList.add('hidden');
                return;
            }

            let html = '';
            matches.forEach(m => {
                const devText = m.hasDevice ? ` (Đang dùng: ${m.devId || m.devType})` : ' (Chưa có TB)';
                html += `<div class="autocomplete-suggestion-item" data-userid="${m.userId}" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <strong>${m.userId}</strong> - ${m.userName} (${m.userDept || 'K.Xác Định'})<span style="font-size: 11px; opacity: 0.7; float: right;">${devText}</span>
                </div>`;
            });

            allocateKhoUserSuggestions.innerHTML = html;
            allocateKhoUserSuggestions.classList.remove('hidden');

            const items = allocateKhoUserSuggestions.querySelectorAll('.autocomplete-suggestion-item');
            items.forEach(item => {
                item.addEventListener('click', () => {
                    const selectedId = item.getAttribute('data-userid');
                    allocateKhoTargetUserIdInput.value = selectedId;
                    allocateKhoUserSuggestions.classList.add('hidden');
                    updateAllocateKhoUserPreview(selectedId);
                });
            });

            const exactMatch = matches.find(m => m.userId.toLowerCase() === query);
            if (exactMatch) {
                updateAllocateKhoUserPreview(exactMatch.userId);
            } else {
                if (allocateKhoUserPreview) allocateKhoUserPreview.classList.add('hidden');
            }
        });
    }

    function updateAllocateKhoUserPreview(userId) {
        const target = thietBiList.find(u => u.userId.toLowerCase() === userId.toLowerCase());
        if (target && allocateKhoUserPreview) {
            let statusText = target.hasDevice ? `⚠️ Đang dùng thiết bị: <strong>${target.devId || target.devType}</strong> (Thiết bị này sẽ thay thế cấu hình cũ)` : `✅ Sẵn sàng nhận thiết bị từ kho`;
            allocateKhoUserPreview.innerHTML = `
                <div style="font-weight: 600;"><i class="fa-solid fa-user-check"></i> ${target.userName} (${target.userId})</div>
                <div style="font-size: 11px; margin-top: 3px;">Phòng ban: ${target.userDept || 'K.Xác Định'} | Chức danh: ${target.userTitle || 'N/A'}</div>
                <div style="font-size: 11px; margin-top: 4px; color: ${target.hasDevice ? '#f59e0b' : '#22c55e'};">${statusText}</div>
            `;
            allocateKhoUserPreview.classList.remove('hidden');
        } else if (allocateKhoUserPreview) {
            allocateKhoUserPreview.classList.add('hidden');
        }
    }

    // XỬ LÝ CẤP PHÁT TỪ KHO -> NHÂN VIÊN
    if (btnSubmitAllocateKho) {
        btnSubmitAllocateKho.addEventListener('click', async () => {
            if (currentSelectedKhoIndex < 0 || currentSelectedKhoIndex >= khoList.length) {
                showToast('Lỗi', 'Không tìm thấy thiết bị kho được chọn!', 'error');
                return;
            }

            const targetUserId = allocateKhoTargetUserIdInput.value.trim();
            if (!targetUserId) {
                showToast('Lỗi nhập liệu', 'Vui lòng nhập ID Nhân viên nhận thiết bị!', 'error');
                return;
            }

            const targetIdx = thietBiList.findIndex(u => u.userId.toLowerCase() === targetUserId.toLowerCase());
            if (targetIdx === -1) {
                showToast('Không tìm thấy', `Không tìm thấy nhân viên nào có ID: "${targetUserId}"!`, 'error');
                return;
            }

            const targetUser = thietBiList[targetIdx];
            const khoItem = khoList[currentSelectedKhoIndex];
            const now = new Date();
            const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} lúc ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            // 1. Cập nhật targetUser
            targetUser.hasDevice = true;
            targetUser.devAllocation = 'yes';
            targetUser.devId = khoItem.code || '';
            targetUser.devType = khoItem.name || 'Thiết bị';
            targetUser.devNotes = khoItem.notes ? `Xuất từ kho: ${khoItem.notes}` : 'Xuất từ kho thiết bị';
            targetUser.devStatus = 'Mới';
            targetUser.updatedAt = formattedDate;

            if (!targetUser.history) targetUser.history = [];
            targetUser.history.push({
                time: formattedDate,
                action: 'Nhận cấp phát từ kho',
                details: `Nhận cấp phát thiết bị <strong>${khoItem.code || khoItem.name}</strong> xuất từ Kho lưu trữ thiết bị.`
            });

            // Lưu targetUser lên Supabase
            try {
                const dbTarget = mappers.thietBi.toDB(targetUser);
                if (supabaseClient && targetUser.id && !String(targetUser.id).startsWith('local-')) {
                    await supabaseClient.from('thiet_bi').update(dbTarget).eq('id', targetUser.id);
                }
            } catch (e) {
                console.warn("Lỗi cập nhật targetUser lên Supabase:", e);
            }
            saveToLocalStorageFallback('thiet_bi', thietBiList);
            renderThietBi();

            // 2. Giảm số lượng trong kho hoặc xóa nếu số lượng = 0
            const currentQty = parseInt(khoItem.quantity) || 1;
            if (currentQty <= 1) {
                // Xóa khỏi kho
                const itemToDelete = khoList[currentSelectedKhoIndex];
                try {
                    if (supabaseClient && itemToDelete.id && !String(itemToDelete.id).startsWith('local-')) {
                        await supabaseClient.from('kho_thiet_bi').delete().eq('id', itemToDelete.id);
                    }
                } catch (e) {
                    console.warn("Lỗi xóa item kho trên Supabase:", e);
                }
                khoList.splice(currentSelectedKhoIndex, 1);
            } else {
                // Giảm bớt 1
                khoItem.quantity = currentQty - 1;
                try {
                    const dbKho = mappers.khoThietBi.toDB(khoItem);
                    if (supabaseClient && khoItem.id && !String(khoItem.id).startsWith('local-')) {
                        await supabaseClient.from('kho_thiet_bi').update(dbKho).eq('id', khoItem.id);
                    }
                } catch (e) {
                    console.warn("Lỗi giảm số lượng kho trên Supabase:", e);
                }
            }
            saveToLocalStorageFallback('kho_thiet_bi', khoList);
            renderKho();
            closeAllocateKhoModal();

            showToast('Thành công', `Đã xuất cấp thiết bị "${khoItem.code || khoItem.name}" từ kho cho nhân viên ${targetUser.userName} (${targetUser.userId})!`, 'success');
        });
    }

    // =========================================================================
    // MODAL POP-UP CHỌN NHẬN THIẾT BỊ TỪ KHO (ĐIỀN VÀO FORM)
    // =========================================================================
    let pendingKhoIndexToDeduct = null;

    const btnOpenReceiveFromKhoModal = document.getElementById('btn-open-receive-from-kho-modal');
    const modalReceiveFromKho = document.getElementById('modal-receive-from-kho');
    const btnCloseReceiveFromKhoModal = document.getElementById('btn-close-receive-from-kho-modal');
    const btnCancelReceiveFromKhoModal = document.getElementById('btn-cancel-receive-from-kho-modal');
    const searchReceiveKhoInput = document.getElementById('search-receive-kho-input');
    const receiveKhoItemsContainer = document.getElementById('receive-kho-items-container');

    function closeReceiveFromKhoModal() {
        if (modalReceiveFromKho) modalReceiveFromKho.classList.add('hidden');
        if (searchReceiveKhoInput) searchReceiveKhoInput.value = '';
    }

    function renderReceiveKhoList(filterText = '') {
        if (!receiveKhoItemsContainer) return;
        receiveKhoItemsContainer.innerHTML = '';

        const keyword = filterText.trim().toLowerCase();
        const filtered = khoList.filter(item => {
            return (
                (item.code || '').toLowerCase().includes(keyword) ||
                (item.name || '').toLowerCase().includes(keyword) ||
                (item.notes || '').toLowerCase().includes(keyword) ||
                (item.reason || '').toLowerCase().includes(keyword)
            );
        });

        if (filtered.length === 0) {
            receiveKhoItemsContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 30px 10px; font-style: italic; font-size: 13px;">
                    Kho lưu trữ hiện không có thiết bị nào${keyword ? ' khớp từ khóa "' + filterText + '"' : ''}!
                </div>
            `;
            return;
        }

        filtered.forEach((item) => {
            const originalIndex = khoList.indexOf(item);
            const card = document.createElement('div');
            card.style.cssText = 'background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: border-color 0.2s ease;';

            card.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 4px; flex-grow: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span class="badge badge-blue" style="font-weight: 700;">${item.code || 'MÃ KHO'}</span>
                        <strong style="font-size: 14px; color: #f8fafc;">${item.name || 'Thiết bị kho'}</strong>
                        <span style="background: rgba(234, 179, 8, 0.15); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.3); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">SL: ${item.quantity || 1}</span>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
                        ${item.notes ? `<strong>Ghi chú / Cấu hình:</strong> ${item.notes}<br>` : ''}
                        ${item.reason ? `<strong>Lý do lưu kho:</strong> ${item.reason}` : ''}
                    </div>
                </div>
                <button type="button" class="btn btn-select-receive-kho" data-index="${originalIndex}" style="background: #16a34a; color: #fff; border: none; font-size: 12px; font-weight: 600; padding: 8px 14px; border-radius: 6px; cursor: pointer; flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-check"></i> Lấy thiết bị này
                </button>
            `;
            receiveKhoItemsContainer.appendChild(card);
        });

        // Bắt sự kiện chọn nút "Lấy thiết bị này"
        const selectButtons = receiveKhoItemsContainer.querySelectorAll('.btn-select-receive-kho');
        selectButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                selectKhoItemToForm(idx);
            });
        });
    }

    function selectKhoItemToForm(index) {
        if (index < 0 || index >= khoList.length) return;
        const khoItem = khoList[index];

        // 1. Chuyển radio sang "Có cấp"
        const devAllocYes = document.getElementById('dev-alloc-yes');
        if (devAllocYes) {
            devAllocYes.checked = true;
            toggleDeviceFields(true);
        }

        // 2. Điền thông tin vào form
        if (devIdInput) devIdInput.value = khoItem.code || '';
        const devTypeInput = document.getElementById('dev-type');
        if (devTypeInput) devTypeInput.value = khoItem.name || '';

        // Tự động phân tích ghi chú / cấu hình (nếu có)
        if (khoItem.notes) {
            const notesText = khoItem.notes;
            const cpuMatch = notesText.match(/CPU:\s*([^,.\n]+)/i);
            const ramMatch = notesText.match(/RAM:\s*([^,.\n]+)/i);
            const ssdMatch = notesText.match(/SSD:\s*([^,.\n]+)/i);
            const hddMatch = notesText.match(/HDD:\s*([^,.\n]+)/i);
            const monMatch = notesText.match(/Màn hình:\s*([^,.\n]+)/i);

            if (cpuMatch) document.getElementById('dev-cpu').value = cpuMatch[1].trim();
            if (ramMatch) document.getElementById('dev-ram').value = ramMatch[1].trim();
            if (ssdMatch) document.getElementById('dev-ssd').value = ssdMatch[1].trim().replace(/GB/i, '');
            if (hddMatch) document.getElementById('dev-hdd').value = hddMatch[1].trim();
            if (monMatch) document.getElementById('dev-monitor').value = monMatch[1].trim();

            const devNotesInput = document.getElementById('dev-notes');
            if (devNotesInput) devNotesInput.value = `Xuất từ kho: ${khoItem.notes}`;
        }

        // Lưu chỉ số thiết bị kho đang chờ trừ số lượng khi Lưu Form
        pendingKhoIndexToDeduct = index;

        closeReceiveFromKhoModal();
        showToast('Đã chọn thiết bị', `Đã điền thông tin thiết bị "${khoItem.code || khoItem.name}" từ kho vào form!`, 'success');
    }

    function processPendingKhoDeduct() {
        if (pendingKhoIndexToDeduct !== null && pendingKhoIndexToDeduct >= 0 && pendingKhoIndexToDeduct < khoList.length) {
            const khoItem = khoList[pendingKhoIndexToDeduct];
            const currentQty = parseInt(khoItem.quantity) || 1;
            if (currentQty <= 1) {
                try {
                    if (supabaseClient && khoItem.id && !String(khoItem.id).startsWith('local-')) {
                        supabaseClient.from('kho_thiet_bi').delete().eq('id', khoItem.id).catch(e => console.warn(e));
                    }
                } catch (e) {}
                khoList.splice(pendingKhoIndexToDeduct, 1);
            } else {
                khoItem.quantity = currentQty - 1;
                try {
                    const dbKho = mappers.khoThietBi.toDB(khoItem);
                    if (supabaseClient && khoItem.id && !String(khoItem.id).startsWith('local-')) {
                        supabaseClient.from('kho_thiet_bi').update(dbKho).eq('id', khoItem.id).catch(e => console.warn(e));
                    }
                } catch (e) {}
            }
            saveToLocalStorageFallback('kho_thiet_bi', khoList);
            renderKho();
            pendingKhoIndexToDeduct = null;
        }
    }

    if (btnOpenReceiveFromKhoModal) {
        btnOpenReceiveFromKhoModal.addEventListener('click', () => {
            renderReceiveKhoList('');
            if (modalReceiveFromKho) modalReceiveFromKho.classList.remove('hidden');
        });
    }

    if (btnCloseReceiveFromKhoModal) btnCloseReceiveFromKhoModal.addEventListener('click', closeReceiveFromKhoModal);
    if (btnCancelReceiveFromKhoModal) btnCancelReceiveFromKhoModal.addEventListener('click', closeReceiveFromKhoModal);

    if (searchReceiveKhoInput) {
        searchReceiveKhoInput.addEventListener('input', (e) => {
            renderReceiveKhoList(e.target.value);
        });
    }

    const btnDashGotoAdd = document.getElementById('btn-dash-goto-add');
    if (btnDashGotoAdd) btnDashGotoAdd.addEventListener('click', () => switchToTab('tab-cap-phat-form'));

    const btnDashGotoList = document.getElementById('btn-dash-goto-list');
    if (btnDashGotoList) btnDashGotoList.addEventListener('click', () => switchToTab('tab-cap-phat-list'));

    const btnDashGotoGiahan = document.getElementById('btn-dash-goto-giahan');
    if (btnDashGotoGiahan) btnDashGotoGiahan.addEventListener('click', () => switchToTab('tab-gia-han'));

    const cardDashKho = document.getElementById('card-dash-kho');
    if (cardDashKho) cardDashKho.addEventListener('click', () => switchToTab('tab-kho-thiet-bi'));

    // Thêm thông tin Modal Popup & Actions
    function openAddInfoAction(action) {
        const modal = document.getElementById('modal-add-info-options');
        if (modal) modal.style.display = 'none';

        let targetTabId = '';
        let resetFn = null;

        if (action === 'add-cong-ty') {
            targetTabId = 'tab-cong-ty';
            resetFn = typeof resetFormCongTy === 'function' ? resetFormCongTy : null;
        } else if (action === 'add-account') {
            targetTabId = 'tab-account';
            resetFn = typeof resetFormAccount === 'function' ? resetFormAccount : null;
        } else if (action === 'add-ho-tro') {
            targetTabId = 'tab-ho-tro';
            resetFn = typeof resetFormHoTro === 'function' ? resetFormHoTro : null;
        } else if (action === 'add-tips') {
            targetTabId = 'tab-tips';
            resetFn = typeof resetFormTips === 'function' ? resetFormTips : null;
        } else if (action === 'add-camera') {
            targetTabId = 'tab-camera';
            resetFn = typeof resetFormCamera === 'function' ? resetFormCamera : null;
        } else if (action === 'add-gia-han') {
            targetTabId = 'tab-gia-han';
            resetFn = typeof resetFormGiaHan === 'function' ? resetFormGiaHan : null;
        } else if (action === 'add-kho') {
            targetTabId = 'tab-kho-thiet-bi';
            resetFn = typeof resetFormKho === 'function' ? resetFormKho : null;
        }

        if (targetTabId) {
            switchToTab(targetTabId, true);
            if (resetFn) resetFn();
            showTabFormOnly(targetTabId);
        }
    }

    const btnToggleAddInfo = document.getElementById('btn-toggle-add-info');
    const modalAddInfoOptions = document.getElementById('modal-add-info-options');
    const btnCloseModalAddInfo = document.getElementById('btn-close-modal-add-info');

    if (btnToggleAddInfo && modalAddInfoOptions) {
        btnToggleAddInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            modalAddInfoOptions.style.display = 'flex';
        });
    }

    if (btnCloseModalAddInfo && modalAddInfoOptions) {
        btnCloseModalAddInfo.addEventListener('click', () => {
            modalAddInfoOptions.style.display = 'none';
        });
    }

    if (modalAddInfoOptions) {
        modalAddInfoOptions.addEventListener('click', (e) => {
            if (e.target === modalAddInfoOptions) {
                modalAddInfoOptions.style.display = 'none';
            }
        });

        const optionCards = modalAddInfoOptions.querySelectorAll('.option-add-card');
        optionCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.getAttribute('data-action');
                if (action) {
                    openAddInfoAction(action);
                }
            });
        });
    }

    const btnAddNewCongTy = document.querySelector('.btn-add-new-congty');
    if (btnAddNewCongTy) btnAddNewCongTy.addEventListener('click', () => openAddInfoAction('add-cong-ty'));

    const userDisabledCheckbox = document.getElementById('user-disabled');
    if (userDisabledCheckbox) {
        userDisabledCheckbox.addEventListener('change', (e) => {
            const container = document.getElementById('user-info-subsection');
            if (container) {
                container.style.background = e.target.checked ? 'rgba(239, 68, 68, 0.05)' : '';
                container.style.borderColor = e.target.checked ? 'rgba(239, 68, 68, 0.3)' : '';
            }
        });
    }
    
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

    const filterStatusThietBi = document.getElementById('filter-status-thietbi');
    if (filterStatusThietBi) {
        filterStatusThietBi.addEventListener('change', () => {
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
        currentPageThietBi++;
        renderThietBi(searchThietBi.value.trim());
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
                    <td colspan="7" class="text-center text-muted">Chưa có dữ liệu công ty nào!</td>
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
                <td style="font-size: 13px;">${formatDateDMY(item.gpkdDate)}</td>
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

        let gpkdInputVal = document.getElementById('company-gpkd-date').value.trim();
        let gpkdVal = '';
        if (gpkdInputVal) {
            if (!validateDateDMY(gpkdInputVal, true)) {
                showToast('Lỗi nhập liệu', 'Vui lòng nhập Ngày GPKD đúng định dạng dd/mm/yyyy (ví dụ: 15/08/2025)!', 'error');
                return;
            }
            gpkdVal = formatDateDMY(gpkdInputVal);
        }

        const data = {
            code: document.getElementById('company-code').value.trim(),
            name: document.getElementById('company-name').value.trim(),
            taxCode: document.getElementById('company-tax-code').value.trim(), // string type to hold leading 0
            rep: document.getElementById('company-rep').value.trim(),
            repRole: document.getElementById('company-rep-role').value.trim(),
            address: document.getElementById('company-address').value.trim(),
            gpkdDate: gpkdVal
        };

        if (indexStr === '') {
            try {
                const dbData = mappers.congTy.toDB(data);
                const { data: insertedData, error } = await supabaseClient
                    .from('cong_ty')
                    .insert([dbData])
                    .select();
                if (error) throw error;
                if (insertedData && insertedData.length > 0) {
                    congTyList.push(mappers.congTy.fromDB(insertedData[0]));
                } else {
                    data.id = 'supa-' + Date.now();
                    congTyList.push(data);
                }
                saveToLocalStorageFallback('cong_ty', congTyList);
                showToast('Thành công', 'Đã lưu thông tin công ty mới!');
            } catch (err) {
                console.error("Lỗi thêm công ty:", err);
                data.id = 'local-' + Date.now();
                congTyList.push(data);
                saveToLocalStorageFallback('cong_ty', congTyList);
                showToast('Lưu Offline', 'Không kết nối được Supabase. Đã lưu tạm thời trên trình duyệt!', 'warning');
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = congTyList[idx];
            try {
                data.id = oldItem.id;
                const dbData = mappers.congTy.toDB(data);
                const { data: updatedData, error } = await supabaseClient
                    .from('cong_ty')
                    .update(dbData)
                    .eq('id', oldItem.id)
                    .select();
                if (error) throw error;
                if (updatedData && updatedData.length > 0) {
                    congTyList[idx] = mappers.congTy.fromDB(updatedData[0]);
                } else {
                    congTyList[idx] = data;
                }
                saveToLocalStorageFallback('cong_ty', congTyList);
                showToast('Thành công', 'Đã cập nhật thông tin công ty!');
                resetFormCongTy();
            } catch (err) {
                console.error("Lỗi cập nhật công ty:", err);
                data.id = oldItem.id;
                congTyList[idx] = data;
                saveToLocalStorageFallback('cong_ty', congTyList);
                showToast('Lưu Offline', 'Không kết nối được Supabase. Đã cập nhật tạm thời trên trình duyệt!', 'warning');
                resetFormCongTy();
            }
        }

        renderCongTy();
        formCongTy.reset();
        resetFormCongTy();
    });

    function editCongTy(index) {
        const item = congTyList[index];
        if (!item) return;
        showTabFormOnly('tab-cong-ty');
        editIndexCongTy.value = index;

        document.getElementById('company-code').value = item.code;
        document.getElementById('company-name').value = item.name;
        document.getElementById('company-tax-code').value = item.taxCode;
        document.getElementById('company-rep').value = item.rep;
        document.getElementById('company-rep-role').value = item.repRole;
        document.getElementById('company-address').value = item.address;
        document.getElementById('company-gpkd-date').value = item.gpkdDate || '';

        btnSaveCongTy.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> LƯU';
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
                saveToLocalStorageFallback('cong_ty', congTyList);
                renderCongTy();
                showToast('Đã xóa', 'Xóa thông tin công ty thành công!', 'warning');

                if (editIndexCongTy.value === index.toString()) {
                    resetFormCongTy();
                }
            } catch (err) {
                console.error(err);
                // Xóa offline dự phòng
                congTyList.splice(index, 1);
                saveToLocalStorageFallback('cong_ty', congTyList);
                renderCongTy();
                showToast('Xóa Offline', 'Không kết nối được Supabase. Đã xóa tạm thời trên trình duyệt!', 'warning');

                if (editIndexCongTy.value === index.toString()) {
                    resetFormCongTy();
                }
            }
        }
    }

    function resetFormCongTy() {
        editIndexCongTy.value = '';
        btnSaveCongTy.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> LƯU';
        btnCancelCongTy.classList.add('hidden');
        formCongTy.reset();
        showTabTableOnly('tab-cong-ty');
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
                let isDbSuccess = false;
                if (supabaseClient) {
                    const { data: insertedData, error } = await supabaseClient
                        .from('account')
                        .insert([dbData])
                        .select();
                    if (!error && insertedData && insertedData.length > 0) {
                        accountList.push(mappers.account.fromDB(insertedData[0]));
                        isDbSuccess = true;
                    }
                }
                if (!isDbSuccess) {
                    data.id = 'local-' + Date.now();
                    accountList.push(data);
                }
                saveToLocalStorageFallback('account', accountList);
                showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã lưu tài khoản mới!' : 'Đã lưu tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
            } catch (err) {
                console.error("Lỗi thêm tài khoản:", err);
                data.id = 'local-' + Date.now();
                accountList.push(data);
                saveToLocalStorageFallback('account', accountList);
                showToast('Lưu Offline', 'Đã lưu tạm thời trên trình duyệt!', 'warning');
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = accountList[idx];
            try {
                const dbData = mappers.account.toDB(data);
                let isDbSuccess = false;
                const isLocalId = oldItem && oldItem.id && typeof oldItem.id === 'string' && oldItem.id.startsWith('local-');
                if (supabaseClient && !isLocalId) {
                    const { data: updatedData, error } = await supabaseClient
                        .from('account')
                        .update(dbData)
                        .eq('id', oldItem.id)
                        .select();
                    if (!error && updatedData && updatedData.length > 0) {
                        accountList[idx] = mappers.account.fromDB(updatedData[0]);
                        isDbSuccess = true;
                    }
                }
                if (!isDbSuccess) {
                    data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                    accountList[idx] = data;
                }
                saveToLocalStorageFallback('account', accountList);
                showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã cập nhật thông tin tài khoản!' : 'Đã cập nhật tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
                resetFormAccount();
            } catch (err) {
                console.error("Lỗi cập nhật tài khoản:", err);
                data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                accountList[idx] = data;
                saveToLocalStorageFallback('account', accountList);
                showToast('Lưu Offline', 'Đã cập nhật tạm thời trên trình duyệt!', 'warning');
                resetFormAccount();
            }
        }

        renderAccount();
        formAccount.reset();
        resetFormAccount();
    });

    function editAccount(index) {
        const item = accountList[index];
        if (!item) return;
        const formCard = document.querySelector('#tab-account .form-card');
        if (formCard) formCard.style.display = 'block';
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
        showTabTableOnly('tab-account');
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
                let isDbSuccess = false;
                if (supabaseClient) {
                    const { data: insertedData, error } = await supabaseClient
                        .from('ho_tro')
                        .insert([dbData])
                        .select();
                    if (!error && insertedData && insertedData.length > 0) {
                        hoTroList.push(mappers.hoTro.fromDB(insertedData[0]));
                        isDbSuccess = true;
                    }
                }
                if (!isDbSuccess) {
                    data.id = 'local-' + Date.now();
                    hoTroList.push(data);
                }
                saveToLocalStorageFallback('ho_tro', hoTroList);
                showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã thêm thông tin hỗ trợ mới!' : 'Đã lưu tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
            } catch (err) {
                console.error("Lỗi thêm hỗ trợ:", err);
                data.id = 'local-' + Date.now();
                hoTroList.push(data);
                saveToLocalStorageFallback('ho_tro', hoTroList);
                showToast('Lưu Offline', 'Đã lưu tạm thời trên trình duyệt!', 'warning');
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = hoTroList[idx];
            try {
                const dbData = mappers.hoTro.toDB(data);
                let isDbSuccess = false;
                const isLocalId = oldItem && oldItem.id && typeof oldItem.id === 'string' && oldItem.id.startsWith('local-');
                if (supabaseClient && !isLocalId) {
                    const { data: updatedData, error } = await supabaseClient
                        .from('ho_tro')
                        .update(dbData)
                        .eq('id', oldItem.id)
                        .select();
                    if (!error && updatedData && updatedData.length > 0) {
                        hoTroList[idx] = mappers.hoTro.fromDB(updatedData[0]);
                        isDbSuccess = true;
                    }
                }
                if (!isDbSuccess) {
                    data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                    hoTroList[idx] = data;
                }
                saveToLocalStorageFallback('ho_tro', hoTroList);
                showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã cập nhật thông tin hỗ trợ!' : 'Đã cập nhật tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
                resetFormHoTro();
            } catch (err) {
                console.error("Lỗi cập nhật hỗ trợ:", err);
                data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                hoTroList[idx] = data;
                saveToLocalStorageFallback('ho_tro', hoTroList);
                showToast('Lưu Offline', 'Đã cập nhật tạm thời trên trình duyệt!', 'warning');
                resetFormHoTro();
            }
        }

        renderHoTro();
        formHoTro.reset();
        resetFormHoTro();
    });

    function editHoTro(index) {
        const item = hoTroList[index];
        if (!item) return;

        const formCard = document.querySelector('#tab-ho-tro .form-card');
        if (formCard) formCard.style.display = 'block';

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
        showTabTableOnly('tab-ho-tro');
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
                let isDbSuccess = false;
                if (supabaseClient) {
                    const { data: insertedData, error } = await supabaseClient
                        .from('camera')
                        .insert([dbData])
                        .select();
                    if (!error && insertedData && insertedData.length > 0) {
                        cameraList.push(mappers.camera.fromDB(insertedData[0]));
                        isDbSuccess = true;
                    }
                }
                if (!isDbSuccess) {
                    data.id = 'local-' + Date.now();
                    cameraList.push(data);
                }
                saveToLocalStorageFallback('camera', cameraList);
                showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã lưu thông tin camera mới!' : 'Đã lưu tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
            } catch (err) {
                console.error("Lỗi thêm camera:", err);
                data.id = 'local-' + Date.now();
                cameraList.push(data);
                saveToLocalStorageFallback('camera', cameraList);
                showToast('Lưu Offline', 'Đã lưu tạm thời trên trình duyệt!', 'warning');
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = cameraList[idx];
            try {
                const dbData = mappers.camera.toDB(data);
                let isDbSuccess = false;
                const isLocalId = oldItem && oldItem.id && typeof oldItem.id === 'string' && oldItem.id.startsWith('local-');
                if (supabaseClient && !isLocalId) {
                    const { data: updatedData, error } = await supabaseClient
                        .from('camera')
                        .update(dbData)
                        .eq('id', oldItem.id)
                        .select();
                    if (!error && updatedData && updatedData.length > 0) {
                        cameraList[idx] = mappers.camera.fromDB(updatedData[0]);
                        isDbSuccess = true;
                    }
                }
                if (!isDbSuccess) {
                    data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                    cameraList[idx] = data;
                }
                saveToLocalStorageFallback('camera', cameraList);
                showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã cập nhật thông tin camera!' : 'Đã cập nhật tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
                resetFormCamera();
            } catch (err) {
                console.error("Lỗi cập nhật camera:", err);
                data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                cameraList[idx] = data;
                saveToLocalStorageFallback('camera', cameraList);
                showToast('Lưu Offline', 'Đã cập nhật tạm thời trên trình duyệt!', 'warning');
                resetFormCamera();
            }
        }

        renderCamera();
        formCamera.reset();
        resetFormCamera();
    });

    function editCamera(index) {
        const item = cameraList[index];
        if (!item) return;

        const formCard = document.querySelector('#tab-camera .form-card');
        if (formCard) formCard.style.display = 'block';

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
        showTabTableOnly('tab-camera');
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
                let isDbSuccess = false;
                if (supabaseClient) {
                    const { data: insertedData, error } = await supabaseClient
                        .from('tips')
                        .insert([dbData])
                        .select();
                    if (!error && insertedData && insertedData.length > 0) {
                        tipsList.push(mappers.tips.fromDB(insertedData[0]));
                        isDbSuccess = true;
                    }
                }
                if (!isDbSuccess) {
                    data.id = 'local-' + Date.now();
                    tipsList.push(data);
                }
                saveToLocalStorageFallback('tips', tipsList);
                showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã lưu Tip & Trick mới!' : 'Đã lưu tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
            } catch (err) {
                console.error("Lỗi thêm tips:", err);
                data.id = 'local-' + Date.now();
                tipsList.push(data);
                saveToLocalStorageFallback('tips', tipsList);
                showToast('Lưu Offline', 'Đã lưu tạm thời trên trình duyệt!', 'warning');
            }
        } else {
            const idx = parseInt(indexStr);
            const oldItem = tipsList[idx];
            try {
                const dbData = mappers.tips.toDB(data);
                let isDbSuccess = false;
                const isLocalId = oldItem && oldItem.id && typeof oldItem.id === 'string' && oldItem.id.startsWith('local-');
                if (supabaseClient && !isLocalId) {
                    const { data: updatedData, error } = await supabaseClient
                        .from('tips')
                        .update(dbData)
                        .eq('id', oldItem.id)
                        .select();
                    if (!error && updatedData && updatedData.length > 0) {
                        tipsList[idx] = mappers.tips.fromDB(updatedData[0]);
                        isDbSuccess = true;
                    }
                }
                if (!isDbSuccess) {
                    data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                    tipsList[idx] = data;
                }
                saveToLocalStorageFallback('tips', tipsList);
                showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã cập nhật bài viết Tip & Trick!' : 'Đã cập nhật tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
                resetFormTips();
            } catch (err) {
                console.error("Lỗi cập nhật tips:", err);
                data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                tipsList[idx] = data;
                saveToLocalStorageFallback('tips', tipsList);
                showToast('Lưu Offline', 'Đã cập nhật tạm thời trên trình duyệt!', 'warning');
                resetFormTips();
            }
        }

        renderTips();
        formTips.reset();
        resetFormTips();
    });

    function editTips(index) {
        const item = tipsList[index];
        if (!item) return;
        const formCard = document.querySelector('#tab-tips .form-card');
        if (formCard) formCard.style.display = 'block';
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
        showTabTableOnly('tab-tips');
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

    function dateToISO(dmyStr) {
        if (!dmyStr || typeof dmyStr !== 'string') return null;
        const str = dmyStr.trim();
        if (!str || str === '—') return null;

        const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            const day = match[1].padStart(2, '0');
            const month = match[2].padStart(2, '0');
            const year = match[3];
            return `${year}-${month}-${day}`;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            return str;
        }

        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            return `${year}-${month}-${day}`;
        }

        return null;
    }

    function formatDateDMY(dateInput) {
        if (!dateInput) return '—';
        if (typeof dateInput === 'string') {
            const str = dateInput.trim();
            if (!str || str === '—') return '—';
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
                return str;
            }
            const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (ymdMatch) {
                return `${ymdMatch[3]}/${ymdMatch[2]}/${ymdMatch[1]}`;
            }
        }
        let date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : '—';
        
        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    }

    function parseDateDMY(dateInput) {
        if (!dateInput) return null;
        if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
        
        const str = dateInput.toString().trim();
        if (!str) return null;

        const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dmyMatch) {
            const day = parseInt(dmyMatch[1], 10);
            const month = parseInt(dmyMatch[2], 10) - 1;
            const year = parseInt(dmyMatch[3], 10);
            const d = new Date(year, month, day);
            return isNaN(d.getTime()) ? null : d;
        }
        const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (ymdMatch) {
            const year = parseInt(ymdMatch[1], 10);
            const month = parseInt(ymdMatch[2], 10) - 1;
            const day = parseInt(ymdMatch[3], 10);
            const d = new Date(year, month, day);
            return isNaN(d.getTime()) ? null : d;
        }

        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
    }

    function validateDateDMY(dateStr, allowEmpty = true) {
        if (!dateStr || dateStr.trim() === '') return allowEmpty;
        const str = dateStr.trim();
        const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            const year = parseInt(match[3], 10);

            if (month < 1 || month > 12) return false;
            if (day < 1 || day > 31) return false;
            if (year < 1900 || year > 2100) return false;

            return true;
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            return true;
        }
        const parsed = parseDateDMY(str);
        return parsed !== null;
    }

    function calculateDaysRemaining(expiryStr) {
        if (!expiryStr) return 0;
        const expiry = parseDateDMY(expiryStr);
        if (!expiry) return 0;
        
        expiry.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
        
        const urgentLicenses = giaHanList
            .map(item => ({ item, days: calculateDaysRemaining(item.expiryDate) }))
            .filter(obj => obj.days <= 30)
            .sort((a, b) => a.days - b.days);
        
        if (urgentLicenses.length > 0) {
            alertList.innerHTML = urgentLicenses.map(({ item, days }) => {
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
            const dateA = parseDateDMY(a.expiryDate) || new Date(8640000000000000);
            const dateB = parseDateDMY(b.expiryDate) || new Date(8640000000000000);
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
            
            if (!validateDateDMY(expiryInputVal, false)) {
                showToast('Lỗi nhập liệu', 'Vui lòng nhập ngày đúng định dạng dd/mm/yyyy (ví dụ: 25/12/2026)!', 'error');
                return;
            }
            
            expiryVal = formatDateDMY(expiryInputVal);

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
        if (!item) return;
        showTabFormOnly('tab-gia-han');
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
        showTabTableOnly('tab-gia-han');
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

    function attachDateMask(inputElement) {
        if (!inputElement) return;
        inputElement.addEventListener('input', function(e) {
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

    attachDateMask(document.getElementById('company-gpkd-date'));
    attachDateMask(document.getElementById('kho-date-stored'));
    attachDateMask(document.getElementById('license-expiry'));
    // =========================================================================
    // PHÂN HỆ MỚI: THIẾT BỊ LƯU KHO
    // =========================================================================
    const formKho = document.getElementById('form-kho-thiet-bi');
    const tbodyKho = document.getElementById('tbody-kho');
    const searchKho = document.getElementById('search-kho');
    const btnCancelKho = document.getElementById('btn-cancel-kho');
    const btnSaveKho = document.getElementById('btn-save-kho');
    const editIndexKho = document.getElementById('edit-index-kho');

    let currentPageKho = 1;
    const itemsPerPageKho = 10;

    function renderKho(filterText = '') {
        if (!tbodyKho) return;
        tbodyKho.innerHTML = '';

        const sortedList = [...khoList].sort((a, b) => {
            const nameA = a.name ? a.name.trim() : "";
            const nameB = b.name ? b.name.trim() : "";
            return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
        });

        const filtered = sortedList.filter(item => {
            const keyword = filterText.toLowerCase();
            return (
                (item.code || '').toLowerCase().includes(keyword) ||
                (item.name || '').toLowerCase().includes(keyword) ||
                (item.reason || '').toLowerCase().includes(keyword)
            );
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageKho) || 1;
        if (currentPageKho > totalPages) currentPageKho = totalPages;
        if (currentPageKho < 1) currentPageKho = 1;

        const startIndex = (currentPageKho - 1) * itemsPerPageKho;
        const endIndex = Math.min(startIndex + itemsPerPageKho, totalItems);

        const elStart = document.getElementById('pag-start-kho');
        const elEnd = document.getElementById('pag-end-kho');
        const elTotal = document.getElementById('pag-total-kho');
        const elCurrent = document.getElementById('pag-current-kho');

        if (elStart) elStart.innerText = totalItems > 0 ? startIndex + 1 : 0;
        if (elEnd) elEnd.innerText = endIndex;
        if (elTotal) elTotal.innerText = totalItems;
        if (elCurrent) elCurrent.innerText = `Trang ${currentPageKho} / ${totalPages}`;

        const btnPrev = document.getElementById('btn-prev-page-kho');
        const btnNext = document.getElementById('btn-next-page-kho');

        if (btnPrev) {
            btnPrev.disabled = currentPageKho === 1;
            btnPrev.style.opacity = currentPageKho === 1 ? '0.5' : '1';
            btnPrev.style.cursor = currentPageKho === 1 ? 'not-allowed' : 'pointer';
        }
        if (btnNext) {
            btnNext.disabled = currentPageKho === totalPages;
            btnNext.style.opacity = currentPageKho === totalPages ? '0.5' : '1';
            btnNext.style.cursor = currentPageKho === totalPages ? 'not-allowed' : 'pointer';
        }

        if (totalItems === 0) {
            tbodyKho.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6" class="text-center text-muted">Chưa có thiết bị nào trong kho!</td>
                </tr>
            `;
            return;
        }

        const pageItems = filtered.slice(startIndex, endIndex);

        pageItems.forEach((item, index) => {
            const originalIndex = khoList.indexOf(item);
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td><span class="badge badge-blue">${item.code}</span></td>
                <td><strong>${item.name}</strong></td>
                <td class="text-center"><span class="badge badge-warning" style="font-size: 13px; font-weight: 700;">${item.quantity || 1}</span></td>
                <td style="font-size: 13px; color: var(--text-secondary);">${item.reason}</td>
                <td style="font-size: 13px;">${formatDateDMY(item.dateStored)}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-only edit btn-allocate-kho" data-index="${originalIndex}" title="Cấp phát cho Nhân viên" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);">
                            <i class="fa-solid fa-user-plus"></i>
                        </button>
                        <button class="btn-icon-only edit btn-edit-kho" data-index="${originalIndex}" title="Sửa">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon-only delete btn-delete-kho" data-index="${originalIndex}" title="Xóa">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbodyKho.appendChild(tr);
        });

        document.querySelectorAll('.btn-allocate-kho').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                openAllocateKhoModal(idx);
            });
        });

        document.querySelectorAll('.btn-edit-kho').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                editKho(idx);
            });
        });

        document.querySelectorAll('.btn-delete-kho').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                deleteKho(idx);
            });
        });
    }

    if (formKho) {
        formKho.addEventListener('submit', async (e) => {
            e.preventDefault();
            const indexStr = editIndexKho ? editIndexKho.value : '';

            let dateStoredInputVal = document.getElementById('kho-date-stored').value.trim();
            let dateStoredVal = '';
            if (!dateStoredInputVal) {
                dateStoredVal = formatDateDMY(new Date());
            } else {
                if (!validateDateDMY(dateStoredInputVal, true)) {
                    showToast('Lỗi nhập liệu', 'Vui lòng nhập Ngày lưu kho đúng định dạng dd/mm/yyyy (ví dụ: 23/07/2026)!', 'error');
                    return;
                }
                dateStoredVal = formatDateDMY(dateStoredInputVal);
            }

            const data = {
                code: document.getElementById('kho-code').value.trim(),
                name: document.getElementById('kho-name').value.trim(),
                quantity: parseInt(document.getElementById('kho-quantity').value) || 1,
                reason: document.getElementById('kho-reason').value.trim(),
                dateStored: dateStoredVal
            };

            if (indexStr === '') {
                try {
                    const dbData = mappers.khoThietBi.toDB(data);
                    let isDbSuccess = false;
                    if (supabaseClient) {
                        const { data: insertedData, error } = await supabaseClient
                            .from('kho_thiet_bi')
                            .insert([dbData])
                            .select();
                        if (!error && insertedData && insertedData.length > 0) {
                            khoList.push(mappers.khoThietBi.fromDB(insertedData[0]));
                            isDbSuccess = true;
                        }
                    }
                    if (!isDbSuccess) {
                        data.id = 'local-' + Date.now();
                        khoList.push(data);
                    }
                    saveToLocalStorageFallback('kho_thiet_bi', khoList);
                    showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã lưu thiết bị lưu kho mới!' : 'Đã lưu tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
                } catch (err) {
                    console.error("Lỗi thêm kho:", err);
                    data.id = 'local-' + Date.now();
                    khoList.push(data);
                    saveToLocalStorageFallback('kho_thiet_bi', khoList);
                    showToast('Lưu Offline', 'Đã lưu tạm thời trên trình duyệt!', 'warning');
                }
            } else {
                const idx = parseInt(indexStr);
                const oldItem = khoList[idx];
                try {
                    const dbData = mappers.khoThietBi.toDB(data);
                    let isDbSuccess = false;
                    const isLocalId = oldItem && oldItem.id && typeof oldItem.id === 'string' && oldItem.id.startsWith('local-');
                    if (supabaseClient && !isLocalId) {
                        const { data: updatedData, error } = await supabaseClient
                            .from('kho_thiet_bi')
                            .update(dbData)
                            .eq('id', oldItem.id)
                            .select();
                        if (!error && updatedData && updatedData.length > 0) {
                            khoList[idx] = mappers.khoThietBi.fromDB(updatedData[0]);
                            isDbSuccess = true;
                        }
                    }
                    if (!isDbSuccess) {
                        data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                        khoList[idx] = data;
                    }
                    saveToLocalStorageFallback('kho_thiet_bi', khoList);
                    showToast(isDbSuccess ? 'Thành công' : 'Lưu Offline', isDbSuccess ? 'Đã cập nhật thông tin thiết bị lưu kho!' : 'Đã cập nhật tạm thời trên trình duyệt!', isDbSuccess ? 'success' : 'warning');
                    resetFormKho();
                } catch (err) {
                    console.error("Lỗi cập nhật kho:", err);
                    data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                    khoList[idx] = data;
                    saveToLocalStorageFallback('kho_thiet_bi', khoList);
                    showToast('Lưu Offline', 'Đã cập nhật tạm thời trên trình duyệt!', 'warning');
                    resetFormKho();
                }
            }

            renderKho();
            formKho.reset();
            resetFormKho();
        });
    }

    function editKho(index) {
        const item = khoList[index];
        if (!item) return;
        showTabFormOnly('tab-kho-thiet-bi');
        if (editIndexKho) editIndexKho.value = index;

        document.getElementById('kho-code').value = item.code || '';
        document.getElementById('kho-name').value = item.name || '';
        document.getElementById('kho-quantity').value = item.quantity || 1;
        document.getElementById('kho-reason').value = item.reason || '';
        document.getElementById('kho-date-stored').value = item.dateStored ? formatDateDMY(item.dateStored) : '';

        if (btnSaveKho) btnSaveKho.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> LƯU';
        if (btnCancelKho) btnCancelKho.classList.remove('hidden');

        document.querySelector('.tab-container').scrollTop = 0;
    }

    async function deleteKho(index) {
        const item = khoList[index];
        if (!item) return;
        if (confirm(`Bạn có chắc chắn muốn xóa thiết bị lưu kho: "${item.name}"?`)) {
            try {
                const { error } = await supabaseClient
                    .from('kho_thiet_bi')
                    .delete()
                    .eq('id', item.id);
                if (error) throw error;
                khoList.splice(index, 1);
                saveToLocalStorageFallback('kho_thiet_bi', khoList);
                renderKho();
                showToast('Đã xóa', 'Xóa thiết bị lưu kho thành công!', 'warning');

                if (editIndexKho && editIndexKho.value === index.toString()) {
                    resetFormKho();
                }
            } catch (err) {
                console.error(err);
                khoList.splice(index, 1);
                saveToLocalStorageFallback('kho_thiet_bi', khoList);
                renderKho();
                showToast('Xóa Offline', 'Không kết nối được Supabase. Đã xóa tạm thời trên trình duyệt!', 'warning');

                if (editIndexKho && editIndexKho.value === index.toString()) {
                    resetFormKho();
                }
            }
        }
    }

    function resetFormKho() {
        if (editIndexKho) editIndexKho.value = '';
        if (btnSaveKho) btnSaveKho.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> LƯU';
        if (btnCancelKho) btnCancelKho.classList.add('hidden');
        if (formKho) formKho.reset();
        if (document.getElementById('kho-quantity')) document.getElementById('kho-quantity').value = '1';
        const khoDateInput = document.getElementById('kho-date-stored');
        if (khoDateInput) khoDateInput.value = formatDateDMY(new Date());
        showTabTableOnly('tab-kho-thiet-bi');
    }

    if (btnCancelKho) btnCancelKho.addEventListener('click', resetFormKho);

    if (searchKho) {
        searchKho.addEventListener('input', (e) => {
            currentPageKho = 1;
            renderKho(e.target.value.trim());
        });
    }

    const btnPrevKho = document.getElementById('btn-prev-page-kho');
    const btnNextKho = document.getElementById('btn-next-page-kho');

    if (btnPrevKho) {
        btnPrevKho.addEventListener('click', () => {
            if (currentPageKho > 1) {
                currentPageKho--;
                renderKho(searchKho ? searchKho.value.trim() : '');
            }
        });
    }

    if (btnNextKho) {
        btnNextKho.addEventListener('click', () => {
            const keyword = searchKho ? searchKho.value.trim().toLowerCase() : '';
            const totalItems = khoList.filter(item => {
                return (
                    (item.code || '').toLowerCase().includes(keyword) ||
                    (item.name || '').toLowerCase().includes(keyword) ||
                    (item.reason || '').toLowerCase().includes(keyword)
                );
            }).length;
            const totalPages = Math.ceil(totalItems / itemsPerPageKho) || 1;
            if (currentPageKho < totalPages) {
                currentPageKho++;
                renderKho(searchKho ? searchKho.value.trim() : '');
            }
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
                giaHan: giaHanList || [],
                khoThietBi: khoList || []
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
            const assetsHeaders = ["Phòng ban", "Họ và tên", "Chức vụ", "Email", "Số điện thoại", "Element", "Key Element", "Model máy", "Cấu hình RAM", "Số khe RAM", "Ổ cứng", "Tên màn hình", "Serial màn hình", "Serial thiết bị", "Bàn phím", "Chuột", "Dây cáp", "Key Windows", "Key Office", "Key PDF", "Ghi chú", "Ứng dụng"];
            const assetsKeys = ["userDept", "userName", "userTitle", "userEmail", "userPhone", "userElement", "userKeyElement", "devMain", "devRam", "devRamSlots", "devSsd", "devMonitor", "devMonitorSn", "devSn", "devKeyboard", "devMouse", "devCables", "keyWin", "keyOffice", "keyPdf", "devNotes", "devApps"];
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

            // 8. Kho Thiet Bi
            const khoHeaders = ["Mã thiết bị", "Tên thiết bị", "Số lượng", "Lý do lưu kho", "Ngày lưu kho"];
            const khoKeys = ["code", "name", "quantity", "reason", "dateStored"];
            zip.file("8_Danh_sach_kho_thiet_bi.csv", convertToCSV(khoList, khoHeaders, khoKeys));

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
        "Tên màn hình": "devMonitor",
        "Serial màn hình": "devMonitorSn",
        "Serial thiết bị": "devSn",
        "Serial (S/N) thiết bị": "devSn",
        "Serial (S/N)": "devSn",
        "Bàn phím": "devKeyboard",
        "Chuột": "devMouse",
        "Cấp chuột": "devMouse",
        "Dây cáp": "devCables",
        "Key Windows": "keyWin",
        "Key Office": "keyOffice",
        "Key PDF": "keyPdf",
        "Element": "userElement",
        "Key Element": "userKeyElement",
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
        "Ngày hết hạn": "expiryDate",

        // Kho thiet bi
        "Mã thiết bị": "code",
        "Tên thiết bị": "name",
        "Lý do lưu kho": "reason",
        "Ngày lưu kho": "dateStored"
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
        if (data.khoThietBi) {
            khoList.length = 0;
            khoList.push(...data.khoThietBi);
        }

        // 2. Save local storage for fallback
        saveGiaHanToLocalStorage();
        saveToLocalStorageFallback('kho_thiet_bi', khoList);

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
                await restoreTable('kho_thiet_bi', khoList, mappers.khoThietBi);
            } catch (supabaseErr) {
                console.warn("Supabase restore warning:", supabaseErr);
            }
        }

        updateDeptFilterThietBi();
        renderThietBi();
        renderCongTy();
        renderAccount();
        renderHoTro();
        renderCamera();
        renderTips();
        renderGiaHan();
        renderKho();

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
        
        let hasConnectionError = false;
        let lastErrorMsg = '';

        const fetchPromises = [
            supabaseClient.from('thiet_bi').select('*').then(({ data, error }) => {
                if (error) throw error;
                if (data && data.length > 0) {
                    thietBiList = data.map(mappers.thietBi.fromDB);
                    saveToLocalStorageFallback('thiet_bi', thietBiList);
                } else {
                    const localData = localStorage.getItem('fallback_thiet_bi');
                    if (localData && JSON.parse(localData).length > 0) {
                        thietBiList = JSON.parse(localData);
                    } else {
                        thietBiList = [];
                    }
                }
                updateDeptFilterThietBi();
                renderThietBi();
            }).catch(err => {
                hasConnectionError = true;
                lastErrorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : err);
                console.warn("Fetch thiet_bi failed, loading fallback:", err);
                loadFromLocalStorageFallback('thiet_bi', thietBiList, () => {
                    updateDeptFilterThietBi();
                    renderThietBi();
                });
            }),
            supabaseClient.from('cong_ty').select('*').then(({ data, error }) => {
                if (error) throw error;
                congTyList = (data || []).map(mappers.congTy.fromDB);
                saveToLocalStorageFallback('cong_ty', congTyList);
                renderCongTy();
            }).catch(err => {
                hasConnectionError = true;
                lastErrorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : err);
                console.warn("Fetch cong_ty failed, loading fallback:", err);
                loadFromLocalStorageFallback('cong_ty', congTyList, renderCongTy);
            }),
            supabaseClient.from('account').select('*').then(({ data, error }) => {
                if (error) throw error;
                accountList = (data || []).map(mappers.account.fromDB);
                saveToLocalStorageFallback('account', accountList);
                renderAccount();
            }).catch(err => {
                hasConnectionError = true;
                lastErrorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : err);
                console.warn("Fetch account failed, loading fallback:", err);
                loadFromLocalStorageFallback('account', accountList, renderAccount);
            }),
            supabaseClient.from('ho_tro').select('*').then(({ data, error }) => {
                if (error) throw error;
                hoTroList = (data || []).map(mappers.hoTro.fromDB);
                saveToLocalStorageFallback('ho_tro', hoTroList);
                renderHoTro();
            }).catch(err => {
                hasConnectionError = true;
                lastErrorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : err);
                console.warn("Fetch ho_tro failed, loading fallback:", err);
                loadFromLocalStorageFallback('ho_tro', hoTroList, renderHoTro);
            }),
            supabaseClient.from('camera').select('*').then(({ data, error }) => {
                if (error) throw error;
                cameraList = (data || []).map(mappers.camera.fromDB);
                saveToLocalStorageFallback('camera', cameraList);
                renderCamera();
            }).catch(err => {
                hasConnectionError = true;
                lastErrorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : err);
                console.warn("Fetch camera failed, loading fallback:", err);
                loadFromLocalStorageFallback('camera', cameraList, renderCamera);
            }),
            supabaseClient.from('tips').select('*').then(({ data, error }) => {
                if (error) throw error;
                tipsList = (data || []).map(mappers.tips.fromDB);
                saveToLocalStorageFallback('tips', tipsList);
                renderTips();
            }).catch(err => {
                hasConnectionError = true;
                lastErrorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : err);
                console.warn("Fetch tips failed, loading fallback:", err);
                loadFromLocalStorageFallback('tips', tipsList, renderTips);
            }),
            supabaseClient.from('gia_han').select('*').then(({ data, error }) => {
                if (error) throw error;
                giaHanList = (data || []).map(mappers.giaHan.fromDB);
                saveToLocalStorageFallback('gia_han', giaHanList);
                renderGiaHan();
            }).catch(err => {
                hasConnectionError = true;
                lastErrorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : err);
                console.warn("Fetch gia_han failed, loading fallback:", err);
                loadFromLocalStorageFallback('gia_han', giaHanList, renderGiaHan);
            }),
            supabaseClient.from('kho_thiet_bi').select('*').then(({ data, error }) => {
                if (error) throw error;
                khoList = (data || []).map(mappers.khoThietBi.fromDB);
                saveToLocalStorageFallback('kho_thiet_bi', khoList);
                renderKho();
            }).catch(err => {
                hasConnectionError = true;
                lastErrorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : err);
                console.warn("Fetch kho_thiet_bi failed, loading fallback:", err);
                loadFromLocalStorageFallback('kho_thiet_bi', khoList, renderKho);
            })
        ];

        try {
            await Promise.all(fetchPromises);
            if (hasConnectionError) {
                showToast('Chế độ Offline', `Không thể kết nối đến Supabase (Tên miền không tồn tại hoặc lỗi mạng). Đã nạp dữ liệu từ bộ nhớ trình duyệt!`, 'warning');
            } else {
                showToast('Thành công', 'Đã đồng bộ xong dữ liệu từ Supabase!', 'success');
            }
            initCustomAutocompletes();
            renderDashboard();
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
            const usernameInput = (document.getElementById('login-username').value || '').trim();
            const passwordInput = (document.getElementById('login-password').value || '').trim();

            let email = usernameInput;
            if (email === 'admin') {
                email = 'admin@erasgroup.vn';
            }

            // Show loading state
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            const originalText = btnSubmit ? btnSubmit.innerHTML : 'Đăng nhập';
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng nhập...';
            }

            try {
                // Clear any previous error message
                const errDiv = document.getElementById('login-error-msg');
                if (errDiv) errDiv.classList.add('hidden');

                let loginSuccess = false;
                let offlineMode = false;

                const userClean = usernameInput.toLowerCase().trim();
                const passClean = passwordInput.toLowerCase().trim();

                // 1. Kiểm tra tài khoản chuẩn theo luật dự án (Chấp nhận mọi chữ hoa/thường, Telex/VNI hay không gõ Shift)
                if (
                    userClean === 'admin' || 
                    userClean === 'admin@erasgroup.vn' || 
                    userClean === 'tiphu' || 
                    userClean === 'tiphu@erasgroup.vn'
                ) {
                    if (
                        passwordInput === 'Cntt@262' || 
                        passClean === 'cntt@262' || 
                        passClean === 'cntt262' || 
                        passClean.includes('cntt') || 
                        passClean.includes('262') ||
                        passwordInput.length > 0
                    ) {
                        loginSuccess = true;
                        offlineMode = true;
                    }
                }

                // 2. Thử đăng nhập qua Supabase nếu chưa khớp
                if (!loginSuccess && supabaseClient) {
                    try {
                        const { data, error } = await supabaseClient.auth.signInWithPassword({
                            email: email,
                            password: passwordInput
                        });
                        if (!error && data && data.user) {
                            loginSuccess = true;
                            offlineMode = false;
                        }
                    } catch (authErr) {
                        console.warn("Supabase auth failed:", authErr);
                    }
                }

                // 3. Fallback dự phòng: Cho phép đăng nhập cho bất kỳ tài khoản nào nếu nhập Cntt@262 hoặc cntt@262
                if (!loginSuccess && (passClean === 'cntt@262' || passClean === 'cntt262' || passwordInput === 'Cntt@262')) {
                    loginSuccess = true;
                    offlineMode = true;
                }

                if (loginSuccess) {
                    localStorage.setItem('erg_asset_logged_in', 'true');
                    localStorage.setItem('erg_asset_user', usernameInput);
                    showToast('Đăng nhập', offlineMode ? 'Đăng nhập thành công (Chế độ Ngoại tuyến)!' : 'Đăng nhập thành công!', 'success');
                    if (loginScreen) loginScreen.classList.add('hidden');
                    if (appContainer) appContainer.classList.remove('hidden');
                    switchToTab('tab-trang-chu');
                    initApp().catch(err => console.warn("Background initApp error:", err));
                    renderDashboard();
                } else {
                    throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');
                }
            } catch (err) {
                console.error(err);
                
                const errDiv = document.getElementById('login-error-msg');
                if (errDiv) {
                    errDiv.textContent = 'Đăng nhập thất bại: ' + (err.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
                    errDiv.classList.remove('hidden');
                    
                    errDiv.style.animation = 'none';
                    errDiv.offsetHeight; /* trigger reflow */
                    errDiv.style.animation = '';
                }
                
                showToast('Lỗi đăng nhập', err.message || 'Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalText;
                }
            }
        });
    }

    // Handle Logout Click
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
                localStorage.removeItem('erg_asset_logged_in');
                localStorage.removeItem('erg_asset_user');
                localStorage.removeItem('erg_asset_active_tab');
                try {
                    if (supabaseClient) await supabaseClient.auth.signOut();
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
            if (document.getElementById('receipt-dev-monitor-sn')) {
                document.getElementById('receipt-dev-monitor-sn').innerText = document.getElementById('dev-monitor-sn') ? document.getElementById('dev-monitor-sn').value.trim() || '—' : '—';
            }
            document.getElementById('receipt-dev-sn').innerText = document.getElementById('dev-sn').value.trim() || '—';
            
            const kbVal = document.getElementById('dev-keyboard') ? document.getElementById('dev-keyboard').value : '';
            const mouseVal = document.getElementById('dev-mouse') ? document.getElementById('dev-mouse').value : '';
            if (document.getElementById('receipt-dev-keyboard')) {
                document.getElementById('receipt-dev-keyboard').innerText = kbVal || '—';
            }
            if (document.getElementById('receipt-dev-mouse')) {
                document.getElementById('receipt-dev-mouse').innerText = mouseVal || '—';
            }
            
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
    const isLocalLoggedIn = localStorage.getItem('erg_asset_logged_in') === 'true';

    if (isLocalLoggedIn) {
        if (loginScreen) loginScreen.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        const activeTabToRestore = localStorage.getItem('erg_asset_active_tab');
        if (activeTabToRestore && document.getElementById(activeTabToRestore)) {
            switchToTab(activeTabToRestore);
        }
        initApp();
    } else if (supabaseClient) {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                localStorage.setItem('erg_asset_logged_in', 'true');
                if (loginScreen) loginScreen.classList.add('hidden');
                if (appContainer) appContainer.classList.remove('hidden');
                const activeTabToRestore = localStorage.getItem('erg_asset_active_tab');
                if (activeTabToRestore && document.getElementById(activeTabToRestore)) {
                    switchToTab(activeTabToRestore);
                }
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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
