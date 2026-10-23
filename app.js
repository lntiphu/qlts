/**
 * ERAS GROUP - Hệ Thống Quản Lý Thiết Bị & Tài Sản
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
    // Dữ liệu thiết bị lưu kho phục hồi an toàn (Initial Seed)
    const initialKhoSeed = [
    {
        "id": 2,
        "code": "PC Văn phòng",
        "assetCode": "PC Văn phòng",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "PC Văn phòng (I5-12400)",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (PC Văn phòng) từ nhân viên Đoàn Văn Trường",
        "dateStored": "05/08/2026",
        "notes": "Cấu hình: CPU: I5-12400, RAM: 16GB DDR4, SSD: 500GB, HDD: 1TB, Màn hình: LG 24",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "",
        "devCpu": "I5-12400",
        "devRam": "16GB DDR4",
        "devRamSlots": "",
        "devSsd": "500GB",
        "devHdd": "1TB",
        "devVga": "",
        "devMain": "",
        "devMonitor": "LG 24",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "",
        "warrantyEndDate": ""
    },
    {
        "id": 4,
        "code": "PC Văn phòng",
        "assetCode": "PC Văn phòng",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "PC Văn phòng (Ryzen7 5700G)",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (PC Văn phòng) từ nhân viên Thắng ĐT",
        "dateStored": "06/08/2026",
        "notes": "Cấu hình: CPU: Ryzen7 5700G, RAM: 16GB DDR4, SSD: 500GB, Màn hình: LG 24",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "",
        "devCpu": "Ryzen7 5700G",
        "devRam": "16GB DDR4",
        "devRamSlots": "",
        "devSsd": "500GB",
        "devHdd": "",
        "devVga": "",
        "devMain": "",
        "devMonitor": "LG 24",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "",
        "warrantyEndDate": ""
    },
    {
        "id": 7,
        "code": "BAOTOAN-DTHAU",
        "assetCode": "BAOTOAN-DTHAU",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "PC Văn phòng (I5-12400)",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (BAOTOAN-DTHAU) từ nhân viên Nguyễn Hữu Bảo Toàn",
        "dateStored": "10/09/2026",
        "notes": "Cấu hình: CPU: I5-12400, RAM: 16GB DDR4, SSD: 500GB, HDD: 1TB, Màn hình: LG 24",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "",
        "devCpu": "I5-12400",
        "devRam": "16GB DDR4",
        "devRamSlots": "",
        "devSsd": "500GB",
        "devHdd": "1TB",
        "devVga": "",
        "devMain": "",
        "devMonitor": "LG 24",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "",
        "warrantyEndDate": ""
    },
    {
        "id": 9,
        "code": "ERGPC-HCNS002",
        "assetCode": "ERGPC-HCNS002",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "PC Văn phòng (I3-4170)",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (ERGPC-HCNS002) từ nhân viên Nguyễn Thị Mai Huyên",
        "dateStored": "11/09/2026",
        "notes": "Cấu hình: CPU: I3-4170, RAM: 16GB DDR3, SSD: 480GB, HDD: 500, Màn hình: Dell 24",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "",
        "devCpu": "I3-4170",
        "devRam": "16GB DDR3",
        "devRamSlots": "",
        "devSsd": "480GB",
        "devHdd": "500",
        "devVga": "",
        "devMain": "",
        "devMonitor": "Dell 24",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "",
        "warrantyEndDate": ""
    },
    {
        "id": 10,
        "code": "MINHDUC-PTC",
        "assetCode": "MINHDUC-PTC",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "PC Văn phòng (I5-12400)",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (MINHDUC-PTC) từ nhân viên Nguyễn Minh Đức",
        "dateStored": "21/09/2026",
        "notes": "Cấu hình: Main: Asus Prime H610M-K D4, CPU: I5-12400, RAM: 16GB DDR4 (2 thanh), SSD: 500, HDD: 1TB, Màn hình: LG 24\n[SPECS_JSON:{\"devType\":\"PC Văn phòng\",\"devMain\":\"Asus Prime H610M-K D4\",\"devCpu\":\"I5-12400\",\"devRam\":\"16GB DDR4\",\"devRamSlots\":\"2 thanh\",\"devSsd\":\"500\",\"devSsd2\":\"\",\"devHdd\":\"1TB\",\"devHdd2\":\"\",\"devVga\":\"\",\"devMonitor\":\"LG 24\",\"devMonitor2\":\"\",\"devMonitorSn\":\"\",\"devMonitorSn2\":\"\",\"devSn\":\"\",\"devKeyboard\":\"\",\"devMouse\":\"\",\"devCables\":\"HDMI và nguồn nhỏ\",\"keyWin\":\"\",\"keyOffice\":\"\",\"keyPdf\":\"\",\"devApps\":\"\",\"devStatus\":\"Mới\"}]",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "",
        "devCpu": "I5-12400",
        "devRam": "16GB DDR4",
        "devRamSlots": "2 thanh",
        "devSsd": "500",
        "devHdd": "1TB",
        "devVga": "",
        "devMain": "Asus Prime H610M-K D4",
        "devMonitor": "LG 24",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "HDMI và nguồn nhỏ",
        "warrantyEndDate": ""
    },
    {
        "id": 11,
        "code": "ERGLAP-QLDA001",
        "assetCode": "ERGLAP-QLDA001",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "Laptop - Lenovo (R7 8845HS)",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (ERGLAP-QLDA001) từ nhân viên Lê Hữu Chiến",
        "dateStored": "26/09/2026",
        "notes": "Cấu hình: Main: Lenovo161216, CPU: R7 8845HS, RAM: 16GB DDR5 (4 thanh), SSD: 512\n[SPECS_JSON:{\"devType\":\"Laptop - Lenovo\",\"devMain\":\"Lenovo161216\",\"devCpu\":\"R7 8845HS\",\"devRam\":\"16GB DDR5\",\"devRamSlots\":\"4 thanh\",\"devSsd\":\"512\",\"devSsd2\":\"\",\"devHdd\":\"\",\"devHdd2\":\"\",\"devVga\":\"\",\"devMonitor\":\"\",\"devMonitor2\":\"\",\"devMonitorSn\":\"\",\"devMonitorSn2\":\"\",\"devSn\":\"\",\"devKeyboard\":\"\",\"devMouse\":\"\",\"devCables\":\"\",\"keyWin\":\"\",\"keyOffice\":\"\",\"keyPdf\":\"\",\"devApps\":\"\",\"devStatus\":\"Trung bình\"}]",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "",
        "devCpu": "R7 8845HS",
        "devRam": "16GB DDR5",
        "devRamSlots": "4 thanh",
        "devSsd": "512",
        "devHdd": "",
        "devVga": "",
        "devMain": "Lenovo161216",
        "devMonitor": "",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "",
        "warrantyEndDate": ""
    },
    {
        "id": 12,
        "code": "ERGPC-GDHCNS",
        "assetCode": "ERGPC-GDHCNS",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "PC Văn phòng (R7 5700G)",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (ERGPC-GDHCNS) từ nhân viên Nguyễn Ngọc Trâm",
        "dateStored": "29/09/2026",
        "notes": "Cấu hình: Main: Asus Prime A520M-R, CPU: R7 5700G, RAM: 16GB DDR4 (2 thanh), SSD: 512, Màn hình: LG 24 inch\n[SPECS_JSON:{\"devType\":\"PC Văn phòng\",\"devMain\":\"Asus Prime A520M-R\",\"devCpu\":\"R7 5700G\",\"devRam\":\"16GB DDR4\",\"devRamSlots\":\"2 thanh\",\"devSsd\":\"512\",\"devSsd2\":\"\",\"devHdd\":\"\",\"devHdd2\":\"\",\"devVga\":\"\",\"devMonitor\":\"LG 24 inch\",\"devMonitor2\":\"\",\"devMonitorSn\":\"507BODG0T130\",\"devMonitorSn2\":\"\",\"devSn\":\"PC39677TAM0KK06M060DYM\",\"devKeyboard\":\"Bàn phím có dây\",\"devMouse\":\"Chuột có dây\",\"devCables\":\"HDMI và nguồn nhỏ\",\"keyWin\":\"\",\"keyOffice\":\"\",\"keyPdf\":\"\",\"devApps\":\"\",\"devStatus\":\"Mới\"}]",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "PC39677TAM0KK06M060DYM",
        "devCpu": "R7 5700G",
        "devRam": "16GB DDR4",
        "devRamSlots": "2 thanh",
        "devSsd": "512",
        "devHdd": "",
        "devVga": "",
        "devMain": "Asus Prime A520M-R",
        "devMonitor": "LG 24 inch",
        "devMonitorSn": "507BODG0T130",
        "monitorSize": "",
        "devCables": "HDMI và nguồn nhỏ",
        "warrantyEndDate": ""
    },
    {
        "id": 14,
        "code": "Laptop Lenovo",
        "assetCode": "Laptop Lenovo",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "Laptop Lenovo",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (Laptop Lenovo) từ nhân viên Nguyễn Anh Tú",
        "dateStored": "02/10/2026",
        "notes": "Cấu hình: RAM: 16GB DDR5 (2 thanh), SSD: 512\n[SPECS_JSON:{\"devType\":\"Laptop Lenovo\",\"devMain\":\"\",\"devCpu\":\"\",\"devRam\":\"16GB DDR5\",\"devRamSlots\":\"2 thanh\",\"devSsd\":\"512\",\"devSsd2\":\"\",\"devHdd\":\"\",\"devHdd2\":\"\",\"devVga\":\"\",\"devMonitor\":\"\",\"devMonitor2\":\"\",\"devMonitorSn\":\"\",\"devMonitorSn2\":\"\",\"devSn\":\"\",\"devKeyboard\":\"\",\"devMouse\":\"Chuột có dây\",\"devCables\":\"\",\"keyWin\":\"\",\"keyOffice\":\"\",\"keyPdf\":\"\",\"devApps\":\"\",\"devStatus\":\"Mới\"}]",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "",
        "devCpu": "",
        "devRam": "16GB DDR5",
        "devRamSlots": "2 thanh",
        "devSsd": "512",
        "devHdd": "",
        "devVga": "",
        "devMain": "",
        "devMonitor": "",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "",
        "warrantyEndDate": ""
    },
    {
        "id": 16,
        "code": "IOM-LETAN",
        "assetCode": "IOM-LETAN",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "PC Văn phòng",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (IOM-LETAN) từ nhân viên Lê Nguyễn Thúy Điền",
        "dateStored": "13/10/2026",
        "notes": "Cấu hình: RAM: 16GB DDR3 (2 thanh), Màn hình: Dell 24\n[SPECS_JSON:{\"devType\":\"PC Văn phòng\",\"devMain\":\"\",\"devCpu\":\"\",\"devRam\":\"16GB DDR3\",\"devRamSlots\":\"2 thanh\",\"devSsd\":\"\",\"devSsd2\":\"\",\"devHdd\":\"\",\"devHdd2\":\"\",\"devVga\":\"\",\"devMonitor\":\"Dell 24\",\"devMonitor2\":\"\",\"devMonitorSn\":\"\",\"devMonitorSn2\":\"\",\"devSn\":\"\",\"devKeyboard\":\"\",\"devMouse\":\"\",\"devCables\":\"VGA và nguồn lớn\",\"keyWin\":\"\",\"keyOffice\":\"\",\"keyPdf\":\"\",\"devApps\":\"\",\"devStatus\":\"Xem xét thay thế\"}]",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "",
        "devCpu": "",
        "devRam": "16GB DDR3",
        "devRamSlots": "2 thanh",
        "devSsd": "",
        "devHdd": "",
        "devVga": "",
        "devMain": "",
        "devMonitor": "Dell 24",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "VGA và nguồn lớn",
        "warrantyEndDate": ""
    },
    {
        "id": 17,
        "code": "IOMLAP-CHEF",
        "assetCode": "IOMLAP-CHEF",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "Laptop - Lenovo IdeaPad Slim 5 14IRH10R (Core 5 210H)",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (IOMLAP-CHEF) từ nhân viên Phan Thanh Tùng",
        "dateStored": "13/10/2026",
        "notes": "Cấu hình: Main: Lenovo161216, CPU: Core 5 210H, RAM: 16GB DDR5 (2 thanh), SSD: 512\n[SPECS_JSON:{\"devType\":\"Laptop - Lenovo IdeaPad Slim 5 14IRH10R\",\"devMain\":\"Lenovo161216\",\"devCpu\":\"Core 5 210H\",\"devRam\":\"16GB DDR5\",\"devRamSlots\":\"2 thanh\",\"devSsd\":\"512\",\"devSsd2\":\"\",\"devHdd\":\"\",\"devHdd2\":\"\",\"devVga\":\"\",\"devMonitor\":\"\",\"devMonitor2\":\"\",\"devMonitorSn\":\"\",\"devMonitorSn2\":\"\",\"devSn\":\"YX0HXSTN\",\"devKeyboard\":\"\",\"devMouse\":\"Chuột không dây\",\"devCables\":\"\",\"keyWin\":\"\",\"keyOffice\":\"\",\"keyPdf\":\"\",\"devApps\":\"\",\"devStatus\":\"Mới\"}]",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "YX0HXSTN",
        "devCpu": "Core 5 210H",
        "devRam": "16GB DDR5",
        "devRamSlots": "2 thanh",
        "devSsd": "512",
        "devHdd": "",
        "devVga": "",
        "devMain": "Lenovo161216",
        "devMonitor": "",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "",
        "warrantyEndDate": ""
    },
    {
        "id": 18,
        "code": "ERGPC-KT005",
        "assetCode": "ERGPC-KT005",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "PC Văn phòng (Core i5 12400)",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (ERGPC-KT005) từ nhân viên Nguyễn Thanh Huyền",
        "dateStored": "15/10/2026",
        "notes": "Cấu hình: Main: Asus Prime H610M-K D4, CPU: Core i5 12400, RAM: 16GB (2 thanh), SSD: 256, HDD: 1T, Màn hình: LG 24\n[SPECS_JSON:{\"devType\":\"PC Văn phòng\",\"devMain\":\"Asus Prime H610M-K D4\",\"devCpu\":\"Core i5 12400\",\"devRam\":\"16GB\",\"devRamSlots\":\"2 thanh\",\"devSsd\":\"256\",\"devSsd2\":\"\",\"devHdd\":\"1T\",\"devHdd2\":\"\",\"devVga\":\"\",\"devMonitor\":\"LG 24\",\"devMonitor2\":\"\",\"devMonitorSn\":\"\",\"devMonitorSn2\":\"\",\"devSn\":\"\",\"devKeyboard\":\"Bàn phím có dây\",\"devMouse\":\"Chuột có dây\",\"devCables\":\"HDMI và nguồn nhỏ\",\"keyWin\":\"\",\"keyOffice\":\"\",\"keyPdf\":\"\",\"devApps\":\"\",\"devStatus\":\"Mới\"}]",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "",
        "devCpu": "Core i5 12400",
        "devRam": "16GB",
        "devRamSlots": "2 thanh",
        "devSsd": "256",
        "devHdd": "1T",
        "devVga": "",
        "devMain": "Asus Prime H610M-K D4",
        "devMonitor": "LG 24",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "HDMI và nguồn nhỏ",
        "warrantyEndDate": ""
    },
    {
        "id": 19,
        "code": "ERGLAP-QLTC02",
        "assetCode": "ERGLAP-QLTC02",
        "maTaiSan": "",
        "assetCompany": "ERG",
        "name": "Laptop Acer (Ryzen 5 6600H)",
        "quantity": 1,
        "reason": "Thu hồi thiết bị (ERGLAP-QLTC02) từ nhân viên Lê Đình Dụ",
        "dateStored": "15/10/2026",
        "notes": "Cấu hình: Main: Nitro ANV15-41, CPU: Ryzen 5 6600H, RAM: 16GB DDR5 (2 thanh), SSD: 512, VGA: RTX 3050\n[SPECS_JSON:{\"devType\":\"Laptop Acer\",\"devMain\":\"Nitro ANV15-41\",\"devCpu\":\"Ryzen 5 6600H\",\"devRam\":\"16GB DDR5\",\"devRamSlots\":\"2 thanh\",\"devSsd\":\"512\",\"devSsd2\":\"\",\"devHdd\":\"\",\"devHdd2\":\"\",\"devVga\":\"RTX 3050\",\"devMonitor\":\"\",\"devMonitor2\":\"\",\"devMonitorSn\":\"\",\"devMonitorSn2\":\"\",\"devSn\":\"\",\"devKeyboard\":\"\",\"devMouse\":\"\",\"devCables\":\"\",\"keyWin\":\"\",\"keyOffice\":\"\",\"keyPdf\":\"\",\"devApps\":\"\",\"devStatus\":\"Mới\"}]",
        "status": "Sẵn sàng cấp phát",
        "location": "",
        "storedBy": "",
        "assetGroup": "CCDC",
        "currentAssetGroup": "CCDC",
        "assetType": "LT",
        "devSn": "",
        "devCpu": "Ryzen 5 6600H",
        "devRam": "16GB DDR5",
        "devRamSlots": "2 thanh",
        "devSsd": "512",
        "devHdd": "",
        "devVga": "RTX 3050",
        "devMain": "Nitro ANV15-41",
        "devMonitor": "",
        "devMonitorSn": "",
        "monitorSize": "",
        "devCables": "",
        "warrantyEndDate": ""
    }
];

    let khoList = JSON.parse(JSON.stringify(initialKhoSeed));

    // Fallback helper functions for local storage
    function loadFromLocalStorageFallback(key, list, renderFn) {
        try {
            const data = localStorage.getItem('fallback_' + key);
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    list.length = 0;
                    const items = parsed.map(item => {
                        if (key === 'thiet_bi' && typeof mappers !== 'undefined' && mappers.thietBi) {
                            return mappers.thietBi.fromDB(item);
                        }
                        return item;
                    });
                    list.push(...items);
                } else if (key === 'kho_thiet_bi' && initialKhoSeed.length > 0) {
                    list.length = 0;
                    list.push(...JSON.parse(JSON.stringify(initialKhoSeed)));
                    localStorage.setItem('fallback_kho_thiet_bi', JSON.stringify(list));
                }
            } else if (key === 'kho_thiet_bi' && initialKhoSeed.length > 0) {
                list.length = 0;
                list.push(...JSON.parse(JSON.stringify(initialKhoSeed)));
                localStorage.setItem('fallback_kho_thiet_bi', JSON.stringify(list));
            }
            if (renderFn) renderFn();
        } catch (e) {
            console.error("Error loading local storage fallback for " + key, e);
            if (key === 'kho_thiet_bi' && initialKhoSeed.length > 0) {
                list.length = 0;
                list.push(...JSON.parse(JSON.stringify(initialKhoSeed)));
                if (renderFn) renderFn();
            }
        }
    }

    function saveToLocalStorageFallback(key, list) {
        try {
            if (key === 'kho_thiet_bi' && (!Array.isArray(list) || list.length === 0) && initialKhoSeed.length > 0) {
                // Bảo vệ chống ghi đè danh sách rỗng làm mất dữ liệu kho
                return;
            }
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

        // =========================================================================
    // FEATURE HELPERS: STORAGE FOR DEVICE EXTRAS (DEPRECIATION & MAINTENANCE)
    // =========================================================================
    function getDeviceExtrasMap() {
        try {
            return JSON.parse(localStorage.getItem('eras_device_extras') || '{}');
        } catch (e) {
            return {};
        }
    }

    function getDeviceExtras(key) {
        if (!key) return {};
        const map = getDeviceExtrasMap();
        return map[key] || {};
    }

    function saveDeviceExtras(key, extrasObj) {
        if (!key) return;
        try {
            const map = getDeviceExtrasMap();
            map[key] = { ...(map[key] || {}), ...extrasObj };
            localStorage.setItem('eras_device_extras', JSON.stringify(map));
        } catch (e) {
            console.error("Error saving device extras:", e);
        }
    }

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
                    devSsd2: db.dev_ssd_2 || db.devSsd2 || '',
                    devHdd: db.dev_hdd || db.devHdd || '',
                    devHdd2: db.dev_hdd_2 || db.devHdd2 || '',
                    devVga: db.dev_vga || db.devVga || '',
                    devMonitor: db.dev_monitor || db.devMonitor || '',
                    devMonitor2: db.dev_monitor_2 || db.devMonitor2 || '',
                    devMonitorSn: db.dev_monitor_sn || db.devMonitorSn || '',
                    devMonitorSn2: db.dev_monitor_sn_2 || db.devMonitorSn2 || '',
                    devSn: db.dev_sn || db.devSn || '',
                    devKeyboard: kbVal,
                    devMouse: db.dev_mouse || db.devMouse || '',
                    devCables: cleanCables,
                    keyWin: db.key_win || db.keyWin || '',
                    keyOffice: db.key_office || db.keyOffice || '',
                    keyPdf: db.key_pdf || db.keyPdf || '',
                    devNotes: db.dev_notes || db.devNotes || '',
                    devApps: db.dev_apps || db.devApps || '',
                    devIssueDesc: db.dev_issue_desc || db.devIssueDesc || '',
                    devIssueFix: db.dev_issue_fix || db.devIssueFix || '',
                    devStatus: devStat,
                    devAllocation: db.dev_allocation || db.devAllocation || (devStat === 'Thiết bị cá nhân' || devStat === 'Cá nhân' ? 'personal' : (devStat === 'Thiết bị dùng chung dự án' || devStat === 'Thiết bị dự án' || devStat === 'Dùng chung' ? 'project' : (devStat === 'Không cấp' ? 'no' : 'yes'))),
                    hasDevice: db.has_device !== false && db.hasDevice !== false && devStat !== 'Không cấp' && devStat !== 'Thiết bị cá nhân' && devStat !== 'Cá nhân',
                    userDisabled: !!(db.user_disabled || db.userDisabled),
                    updatedAt: db.updated_at || db.updatedAt || '',
                    history: Array.isArray(db.history) ? db.history : [],
                    purchasePrice: db.purchase_price || db.purchasePrice || (getDeviceExtras(db.user_id || db.userId || db.dev_id || db.devId || db.id).purchasePrice) || '',
                    purchaseDate: db.purchase_date || db.purchaseDate || (getDeviceExtras(db.user_id || db.userId || db.dev_id || db.devId || db.id).purchaseDate) || '',
                    depreciationYears: db.depreciation_years || db.depreciationYears || (getDeviceExtras(db.user_id || db.userId || db.dev_id || db.devId || db.id).depreciationYears) || '3',
                    maintenanceLogs: Array.isArray(db.maintenance_logs) ? db.maintenance_logs : (Array.isArray(db.maintenanceLogs) ? db.maintenanceLogs : (getDeviceExtras(db.user_id || db.userId || db.dev_id || db.devId || db.id).maintenanceLogs || [])),
                    maTaiSan: db.ma_tai_san || db.maTaiSan || db.asset_code || db.assetCode || '',
                    assetCode: db.asset_code || db.assetCode || db.ma_tai_san || db.maTaiSan || '',
                    assetCompany: db.asset_company || db.assetCompany || 'ERG',
                    assetGroup: db.asset_group || db.assetGroup || 'CCDC',
                    currentAssetGroup: db.current_asset_group || db.currentAssetGroup || db.asset_group || db.assetGroup || 'CCDC',
                    assetType: db.asset_type || db.assetType || 'LT',
                    monitorSize: db.monitor_size || db.monitorSize || '',
                    warrantyEndDate: db.warranty_end_date || db.warrantyEndDate || ''
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
                    has_device: js.devAllocation === 'yes' || js.devAllocation === 'project',
                    dev_id: js.devId || null,
                    dev_type: js.devType,
                    dev_main: js.devMain,
                    dev_cpu: js.devCpu,
                    dev_ram: js.devRam,
                    dev_ram_slots: js.devRamSlots,
                    dev_ssd: js.devSsd || '',
                    dev_ssd_2: js.devSsd2 || '',
                    dev_hdd: js.devHdd || '',
                    dev_hdd_2: js.devHdd2 || '',
                    dev_vga: js.devVga,
                    dev_monitor: js.devMonitor || '',
                    dev_monitor_2: js.devMonitor2 || '',
                    dev_monitor_sn: js.devMonitorSn || '',
                    dev_monitor_sn_2: js.devMonitorSn2 || '',
                    dev_sn: js.devSn,
                    dev_keyboard: !!js.devKeyboard,
                    dev_mouse: js.devMouse,
                    dev_cables: cablesVal,
                    key_win: js.keyWin,
                    key_office: js.keyOffice,
                    key_pdf: js.keyPdf,
                    dev_notes: js.devNotes,
                    dev_apps: js.devApps,
                    dev_issue_desc: js.devIssueDesc || '',
                    dev_issue_fix: js.devIssueFix || '',
                    dev_status: js.devAllocation === 'personal' ? 'Thiết bị cá nhân' : (js.devStatus || (js.devAllocation === 'project' ? 'Thiết bị dự án' : 'Mới')),
                    updated_at: new Date().toISOString(),
                    history: js.history,
                    asset_code: js.maTaiSan || js.assetCode || null,
                    asset_company: js.assetCompany || null,
                    asset_group: js.assetGroup || null,
                    current_asset_group: js.currentAssetGroup || js.assetGroup || null,
                    asset_type: js.assetType || null,
                    monitor_size: js.monitorSize || null,
                    warranty_end_date: js.warrantyEndDate || null
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
            fromDB: (db) => {
                let specs = {};
                if (db.notes && db.notes.includes('[SPECS_JSON:')) {
                    const match = db.notes.match(/\[SPECS_JSON:(.*?)\]/s);
                    if (match && match[1]) {
                        try { specs = JSON.parse(match[1]); } catch (e) {}
                    }
                }
                return {
                    id: db.id,
                    code: db.code || db.asset_code || specs.code || '',
                    assetCode: db.asset_code || db.assetCode || specs.maTaiSan || specs.assetCode || db.code || '',
                    maTaiSan: db.asset_code || db.assetCode || specs.maTaiSan || specs.assetCode || '',
                    assetCompany: db.asset_company || db.assetCompany || specs.assetCompany || 'ERG',
                    name: db.name || specs.name || '',
                    quantity: db.quantity !== undefined && db.quantity !== null ? parseInt(db.quantity) : (specs.quantity || 1),
                    reason: db.reason || specs.reason || '',
                    dateStored: db.date_stored ? formatDateDMY(db.date_stored) : (specs.dateStored || ''),
                    notes: db.notes || '',
                    status: db.status || specs.status || 'Sẵn sàng cấp phát',
                    location: db.location || specs.location || '',
                    storedBy: db.stored_by || db.storedBy || specs.storedBy || '',
                    assetGroup: db.asset_group || db.assetGroup || specs.assetGroup || 'CCDC',
                    currentAssetGroup: db.current_asset_group || db.currentAssetGroup || db.asset_group || specs.currentAssetGroup || specs.assetGroup || 'CCDC',
                    assetType: db.asset_type || db.assetType || specs.assetType || 'LT',
                    devSn: db.dev_sn || db.devSn || db.serial || specs.devSn || specs.serial || '',
                    devCpu: db.dev_cpu || db.devCpu || specs.devCpu || '',
                    devRam: db.dev_ram || db.devRam || specs.devRam || '',
                    devRamSlots: db.dev_ram_slots || db.devRamSlots || specs.devRamSlots || '',
                    devSsd: db.dev_ssd || db.devSsd || specs.devSsd || '',
                    devHdd: db.dev_hdd || db.devHdd || specs.devHdd || '',
                    devVga: db.dev_vga || db.devVga || specs.devVga || '',
                    devMain: db.dev_main || db.devMain || specs.devMain || '',
                    devMonitor: db.dev_monitor || db.devMonitor || specs.devMonitor || '',
                    devMonitorSn: db.dev_monitor_sn || db.devMonitorSn || specs.devMonitorSn || '',
                    monitorSize: db.monitor_size || db.monitorSize || specs.monitorSize || '',
                    devCables: db.dev_cables || db.devCables || specs.devCables || '',
                    warrantyEndDate: db.warranty_end_date || db.warrantyEndDate || specs.warrantyEndDate || ''
                };
            },
            toDB: (js) => ({
                code: js.code || js.assetCode || js.maTaiSan,
                asset_code: js.maTaiSan || js.assetCode || js.code,
                asset_company: js.assetCompany || 'ERG',
                name: js.name,
                quantity: parseInt(js.quantity) || 1,
                reason: js.reason,
                date_stored: dateToISO(js.dateStored),
                notes: js.notes,
                status: js.status || 'Sẵn sàng cấp phát',
                asset_group: js.assetGroup || 'CCDC',
                current_asset_group: js.currentAssetGroup || js.assetGroup || 'CCDC',
                asset_type: js.assetType || 'LT',
                dev_sn: js.devSn || '',
                dev_cpu: js.devCpu || '',
                dev_ram: js.devRam || '',
                dev_ssd: js.devSsd || '',
                monitor_size: js.monitorSize || '',
                warranty_end_date: js.warrantyEndDate || ''
            })
        }
    };

    // -------------------------------------------------------------------------
    // 2. DOM ELEMENTS, RBAC PERMISSIONS CORE & NAVIGATION
    // -------------------------------------------------------------------------
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');

    // RBAC (Role-Based Access Control) State & Presets
    const ALL_CONFIGURABLE_TABS = [
        { id: 'tab-trang-chu', name: 'Trang chủ' },
        { id: 'tab-cap-phat-list', name: 'Danh sách cấp phát' },
        { id: 'tab-kho-thiet-bi', name: 'Kho thiết bị' },
        { id: 'tab-cong-ty', name: 'Thông tin công ty' },
        { id: 'tab-account', name: 'Tài khoản (Account)' },
        { id: 'tab-ho-tro', name: 'Trang hỗ trợ' },
        { id: 'tab-camera', name: 'Thông tin camera' },
        { id: 'tab-tips', name: 'Tip & Trick' },
        { id: 'tab-gia-han', name: 'Gia hạn bản quyền' }
    ];

    function getRolePresetPermissions(role) {
        if (role === 'admin') {
            return { canAdd: true, canEdit: true, canDelete: true, canExport: true,
                allowedTabs: ALL_CONFIGURABLE_TABS.map(t => t.id) };
        }
        if (role === 'editor') {
            return { canAdd: true, canEdit: true, canDelete: false, canExport: false,
                allowedTabs: ['tab-trang-chu', 'tab-cap-phat-list', 'tab-kho-thiet-bi', 'tab-cong-ty', 'tab-ho-tro', 'tab-tips', 'tab-gia-han'] };
        }
        return { canAdd: false, canEdit: false, canDelete: false, canExport: false,
            allowedTabs: ['tab-trang-chu', 'tab-cap-phat-list', 'tab-kho-thiet-bi', 'tab-ho-tro', 'tab-tips'] };
    }

    function normalizeUserEmail(raw) {
        const clean = (raw || '').trim().toLowerCase();
        if (!clean) return '';
        return clean.includes('@') ? clean : `${clean}@erasgroup.vn`;
    }

    let rbacConfig = {
        defaultNewUserRole: 'viewer',
        updatedAt: 0,
        users: []
    };

    let currentUserPerm = null;

    function hasActionPermission(actionKey) {
        if (!currentUserPerm) return false;
        if (currentUserPerm.role === 'admin') return true;
        return currentUserPerm[actionKey] === true;
    }

    function canAccessTab(tabId) {
        if (!currentUserPerm) return false;
        if (tabId === 'tab-phan-quyen') {
            return currentUserPerm.role === 'admin';
        }
        if (currentUserPerm.role === 'admin') return true;
        const allowedTabs = Array.isArray(currentUserPerm.allowedTabs)
            ? currentUserPerm.allowedTabs
            : ['tab-trang-chu'];
        if (tabId === 'tab-cap-phat-form') {
            return allowedTabs.includes('tab-cap-phat-list') && (hasActionPermission('canAdd') || hasActionPermission('canEdit'));
        }
        return allowedTabs.includes(tabId);
    }

    function requirePermission(actionKey, customDesc = 'thực hiện thao tác này') {
        if (hasActionPermission(actionKey)) return true;
        if (typeof showToast === 'function') {
            showToast('Giới hạn phân quyền', `Tài khoản của bạn (${currentUserPerm?.displayName || currentUserPerm?.email || 'User'}) không được cấp quyền ${customDesc}!`, 'warning');
        }
        return false;
    }

    function getFirstAllowedTab() {
        if (!currentUserPerm || currentUserPerm.role === 'admin') return 'tab-trang-chu';
        const allowed = currentUserPerm.allowedTabs || [];
        return allowed.length > 0 ? allowed[0] : '';
    }

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
        const tabs = ['tab-kho-thiet-bi', 'tab-cong-ty', 'tab-account', 'tab-ho-tro', 'tab-camera', 'tab-tips', 'tab-gia-han', 'tab-phan-quyen'];
        tabs.forEach(tabId => showTabTableOnly(tabId));
    }

    let currentTabId = '';

    // Tab Navigation Logic
    function switchToTab(targetTabId, keepFormVisible = false, pushState = true) {
        if (!targetTabId) return;

        // RBAC Guard: Check if user has permission to access this tab
        if (currentUserPerm && !canAccessTab(targetTabId)) {
            if (typeof showToast === 'function') {
                if (targetTabId === 'tab-cap-phat-form') {
                    showToast('Giới hạn phân quyền', 'Tài khoản của bạn chỉ có quyền Xem, không được phép thêm mới hoặc chỉnh sửa thông tin cấp phát!', 'warning');
                } else {
                    showToast('Giới hạn phân quyền', 'Tài khoản của bạn không được cấp quyền truy cập mục này!', 'warning');
                }
            }
            const fallbackTab = getFirstAllowedTab();
            if (fallbackTab && fallbackTab !== targetTabId && canAccessTab(fallbackTab)) {
                targetTabId = fallbackTab;
            } else {
                return;
            }
        }

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
            else if (targetTabId === 'tab-phan-quyen') tabName = 'Phân quyền User';
            else tabName = 'Trang chủ';
        }
        if (pageTitle) {
            pageTitle.innerHTML = `<img src="favicon-32x32.png" alt="ERAS" style="width: 18px; height: 18px; object-fit: contain; margin-right: 8px; vertical-align: middle; flex-shrink: 0;">ERAS GROUP - Hệ Thống Quản Lý Thiết Bị & Tài Sản <small style="font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-left: 10px;">/ ${tabName}</small>`;
        }

        if (targetTabId === 'tab-trang-chu') {
            renderDashboard();
        } else if (targetTabId === 'tab-kho-thiet-bi') {
            renderKho();
        } else if (targetTabId === 'tab-phan-quyen' && typeof renderPhanQuyen === 'function') {
            renderPhanQuyen();
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

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
    }

    function showToast(title, message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconClass = 'fa-circle-check';
        if (type === 'error') iconClass = 'fa-circle-xmark';
        if (type === 'warning') iconClass = 'fa-circle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${escapeHtml(title)}</div>
                <div class="toast-message">${escapeHtml(message)}</div>
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
    // 4. PASSWORD VISIBILITY TOGGLER (General Modals & Forms)
    // -------------------------------------------------------------------------
    document.querySelectorAll('.btn-toggle-password').forEach(button => {
        if (button.id === 'btn-toggle-login-pass') return; // Handled separately by dedicated toggleLoginPassword
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const input = this.previousElementSibling;
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
                this.classList.add('active');
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="fa-solid fa-eye"></i>';
                this.classList.remove('active');
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
    const devSnInput = document.getElementById('dev-sn');
    if (devSnInput) {
        devSnInput.addEventListener('input', () => validateDeviceSerial(editIndexThietBi.value));
    }

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
        if (allocSelected && allocSelected.value === 'personal') {
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
            'dev-ram',
            'dev-main',
            'dev-cpu',
            'dev-ssd',
            'dev-ssd-2',
            'dev-hdd',
            'dev-hdd-2',
            'dev-monitor',
            'dev-monitor-2',
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
                    'dev-ram': ['4GB', '8GB', '16GB', '32GB', '64GB', '4GB DDR3', '8GB DDR3', '8GB DDR4', '16GB DDR4', '32GB DDR4', '16GB DDR5', '32GB DDR5', '64GB DDR5'],
                    'dev-main': ['H610M', 'B760M', 'H510M', 'B560M', 'A320M'],
                    'dev-cpu': ['Core i5 12400F', 'Core i7 13700', 'Core i3 12100', 'Core i5 10400', 'Ryzen 5 5600G'],
                    'dev-ssd': ['256GB SSD', '512GB SSD', '1TB SSD', '128GB SSD'],
                    'dev-ssd-2': ['256GB SSD', '512GB SSD', '1TB SSD', '128GB SSD'],
                    'dev-hdd': ['1TB HDD', '2TB HDD', '500GB HDD', 'Không có HDD'],
                    'dev-hdd-2': ['1TB HDD', '2TB HDD', '500GB HDD', 'Không có HDD'],
                    'dev-monitor': ['Dell 24 inch', 'HP 21.5 inch', 'LG 24 inch', 'Samsung 27 inch', 'Asus 23.8 inch'],
                    'dev-monitor-2': ['Dell 24 inch', 'HP 21.5 inch', 'LG 24 inch', 'Samsung 27 inch', 'Asus 23.8 inch'],
                    'dev-vga': ['GTX 1650', 'RTX 3060', 'RTX 2060', 'Intel UHD Graphics', 'Radeon Graphics']
                };

                if (defaults[fieldId]) {
                    defaults[fieldId].forEach(val => uniqueSet.add(val));
                }

                thietBiList.forEach(item => {
                    let val = '';
                    if (fieldId === 'user-dept') val = item.userDept;
                    else if (fieldId === 'dev-type') val = item.devType;
                    else if (fieldId === 'dev-ram') val = item.devRam;
                    else if (fieldId === 'dev-main') val = item.devMain;
                    else if (fieldId === 'dev-cpu') val = item.devCpu;
                    else if (fieldId === 'dev-ssd') val = item.devSsd;
                    else if (fieldId === 'dev-ssd-2') val = item.devSsd2;
                    else if (fieldId === 'dev-hdd') val = item.devHdd;
                    else if (fieldId === 'dev-hdd-2') val = item.devHdd2;
                    else if (fieldId === 'dev-monitor') val = item.devMonitor;
                    else if (fieldId === 'dev-monitor-2') val = item.devMonitor2;
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
                dropdown.style.border = '1px solid rgba(37, 51, 141, 0.5)'; // Viền xanh ERAS
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
                        item.style.background = 'rgba(37, 51, 141, 0.35)';
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
            const createLog = item.history.find(h => h.action === 'Tạo mới' || h.action === 'Khởi tạo cấp phát');
            if (createLog && createLog.time) {
                const parsed = parseDateDMY(createLog.time);
                if (parsed) return parsed.getTime();
            }
            if (item.history.length > 0 && item.history[0].time) {
                const parsed = parseDateDMY(item.history[0].time);
                if (parsed) return parsed.getTime();
            }
        }
        if (item.createdAt) {
            const parsed = parseDateDMY(item.createdAt);
            if (parsed) return parsed.getTime();
        }
        if (item.created_at) {
            const parsed = parseDateDMY(item.created_at);
            if (parsed) return parsed.getTime();
        }
        if (item.updatedAt) {
            const parsed = parseDateDMY(item.updatedAt);
            if (parsed) return parsed.getTime();
        }
        if (item.updated_at) {
            const parsed = parseDateDMY(item.updated_at);
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
        if (item.updated_at) {
            const parsed = parseDateDMY(item.updated_at);
            if (parsed) return parsed.getTime();
        }
        return getItemCreatedTimestamp(item);
    }

    function renderRecentActivity(filterText) {
        const elRecentActivity = document.getElementById('dash-recent-activity');
        if (!elRecentActivity) return;

        const searchInput = document.getElementById('search-recent-activity');
        const clearBtn = document.getElementById('btn-clear-recent-activity');
        const query = (typeof filterText === 'string' ? filterText : (searchInput ? searchInput.value : '')).trim();

        if (clearBtn) {
            clearBtn.style.display = query ? 'block' : 'none';
        }

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
                        userName: item.userName || 'Chưa đặt tên',
                        userId: item.userId || '',
                        userDept: item.userDept || '',
                        devId: item.devId || '',
                        devName: item.devName || '',
                        time: log.time || '',
                        action: log.action || '',
                        details: log.details || '',
                        timestamp: parseLogTime(log.time)
                    });
                });
            }
        });

        // Sắp xếp các nhật ký mới nhất theo thời gian (giảm dần)
        allLogs.sort((a, b) => b.timestamp - a.timestamp);

        if (allLogs.length === 0) {
            elRecentActivity.innerHTML = '<div class="text-muted" style="font-size: 13px; font-style: italic; text-align: center; padding: 20px 0;">Chưa có hoạt động cập nhật</div>';
            return;
        }

        let displayLogs = allLogs;
        if (query) {
            const removeAllDiacritics = (str) => {
                if (!str) return '';
                return String(str)
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[đĐ]/g, 'd')
                    .toLowerCase();
            };
            const removeOnlyToneMarks = (str) => {
                if (!str) return '';
                return String(str)
                    .normalize('NFD')
                    .replace(/[\u0300\u0301\u0303\u0309\u0323]/g, '')
                    .normalize('NFC')
                    .toLowerCase();
            };
            const hasAnyDiacritic = (str) => str.toLowerCase() !== removeAllDiacritics(str);
            const splitWords = (str) => String(str || '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(/\s+/).filter(Boolean);

            const q = query.replace(/\s+/g, ' ').toLowerCase();

            // Chuẩn bị dữ liệu tìm kiếm chỉ trên nội dung thực tế hiển thị của từng nhật ký
            // (Loại bỏ chuỗi mã khôi phục ngẫu nhiên 48 ký tự của Key Element để tránh khớp nhầm từ ngắn)
            const prepared = allLogs.map(log => {
                const cleanDetails = (log.details || '')
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/Key Element\s*:[^\n<]*/gi, 'Key Element')
                    .replace(/\s+/g, ' ')
                    .trim();
                const headerText = `${log.userName} (${log.userId}) ${log.action} ${log.time}`.toLowerCase();
                const visibleText = `${headerText} ${cleanDetails}`.toLowerCase();
                const visibleNoDia = removeAllDiacritics(visibleText);
                const headerNoDia = removeAllDiacritics(headerText);

                const wordsFull = splitWords(visibleText);
                const wordsBase = wordsFull.map(w => removeOnlyToneMarks(w));
                const wordsNoDia = wordsFull.map(w => removeAllDiacritics(w));

                const headerWordsFull = splitWords(headerText);
                const headerWordsNoDia = headerWordsFull.map(w => removeAllDiacritics(w));

                return {
                    log,
                    headerText,
                    headerNoDia,
                    visibleText,
                    visibleNoDia,
                    wordsFull,
                    wordsBase,
                    wordsNoDia,
                    headerWordsFull,
                    headerWordsNoDia
                };
            });

            const matchConsecutive = (wFullArr, wBaseArr, wNoDiaArr, qTokens, allowLastPrefix) => {
                const k = qTokens.length;
                if (k === 0 || wFullArr.length < k) return false;
                for (let i = 0; i <= wFullArr.length - k; i++) {
                    let ok = true;
                    for (let j = 0; j < k; j++) {
                        const qt = qTokens[j];
                        const isLast = allowLastPrefix && (j === k - 1);
                        if (!isLast) {
                            if (hasAnyDiacritic(qt)) {
                                if (wFullArr[i + j] !== qt) { ok = false; break; }
                            } else {
                                if (wNoDiaArr[i + j] !== qt) { ok = false; break; }
                            }
                        } else {
                            if (hasAnyDiacritic(qt)) {
                                const qtBase = removeOnlyToneMarks(qt);
                                if (!wFullArr[i + j].startsWith(qt) && !wBaseArr[i + j].startsWith(qtBase)) { ok = false; break; }
                            } else {
                                if (!wNoDiaArr[i + j].startsWith(qt)) { ok = false; break; }
                            }
                        }
                    }
                    if (ok) return true;
                }
                return false;
            };

            let matchedPrepared = [];

            // Nếu từ khóa chứa ký tự đặc biệt của ngày giờ / mã thiết bị / email (/, :, -, @, .)
            if (/[\/:\-@.]/.test(q)) {
                const qHasDia = hasAnyDiacritic(q);
                const qNoDia = removeAllDiacritics(q);
                matchedPrepared = prepared.filter(p => qHasDia ? p.visibleText.includes(q) : p.visibleNoDia.includes(qNoDia));
            } else {
                const qTokens = splitWords(q);
                if (qTokens.length > 0) {
                    // Bước 1: Khớp chính xác cụm từ nguyên vẹn (có dấu hoặc không dấu)
                    matchedPrepared = prepared.filter(p => matchConsecutive(p.wordsFull, p.wordsBase, p.wordsNoDia, qTokens, false));

                    // Bước 2: Nếu đang gõ dở từ cuối (ví dụ 'Lê P', 'Thu hô', 'tip', 'phuo', 'offb'), hỗ trợ khớp tiền tố từ cuối
                    if (matchedPrepared.length === 0) {
                        matchedPrepared = prepared.filter(p => matchConsecutive(p.wordsFull, p.wordsBase, p.wordsNoDia, qTokens, true));
                    }

                    // Bước 3: Nếu gõ nhiều từ rời nhau (ví dụ 'tiphu thu hồi', 'Nguyễn Mạnh'), khớp từng từ nguyên vẹn
                    if (matchedPrepared.length === 0 && qTokens.length > 1) {
                        matchedPrepared = prepared.filter(p => qTokens.every(qt => {
                            if (hasAnyDiacritic(qt)) {
                                return p.wordsFull.includes(qt);
                            }
                            return p.wordsNoDia.includes(qt);
                        }));
                    }

                    // Ưu tiên kết quả khớp ngay trên tiêu đề (Tên NV, ID, Hành động, Thời gian) lên trước
                    matchedPrepared.sort((a, b) => {
                        const aHeader = matchConsecutive(a.headerWordsFull, a.headerWordsFull.map(w => removeOnlyToneMarks(w)), a.headerWordsNoDia, qTokens, true) ? 0 : 1;
                        const bHeader = matchConsecutive(b.headerWordsFull, b.headerWordsFull.map(w => removeOnlyToneMarks(w)), b.headerWordsNoDia, qTokens, true) ? 0 : 1;
                        if (aHeader !== bHeader) return aHeader - bHeader;
                        return b.log.timestamp - a.log.timestamp;
                    });
                }
            }

            displayLogs = matchedPrepared.map(p => p.log);
        } else {
            // Mặc định hiển thị 8 hoạt động mới nhất
            displayLogs = allLogs.slice(0, 8);
        }

        if (displayLogs.length === 0) {
            elRecentActivity.innerHTML = `
                <div class="text-muted" style="font-size: 13px; font-style: italic; text-align: center; padding: 24px 10px;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 20px; opacity: 0.35; margin-bottom: 8px; display: block;"></i>
                    Không tìm thấy lịch sử phù hợp với "<strong>${query.replace(/"/g, '&quot;')}</strong>"
                </div>
            `;
            return;
        }

        if (query) {
            const countDiv = document.createElement('div');
            countDiv.style.cssText = 'font-size: 11.5px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; padding: 0 4px 4px 4px;';
            countDiv.innerHTML = `
                <span>Kết quả tìm kiếm: <strong style="color: var(--brand-green);">${displayLogs.length}</strong> nhật ký</span>
                <span style="font-size: 11px; opacity: 0.8;">Esc hoặc ✕ để xóa</span>
            `;
            elRecentActivity.appendChild(countDiv);
        }

        displayLogs.forEach(log => {
            const div = document.createElement('div');
            div.style.cssText = 'padding: 10px 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; font-size: 12px; transition: all 0.2s ease; cursor: pointer;';
            div.title = 'Click để xem nhân sự / thiết bị này';
            
            div.onmouseenter = () => {
                div.style.background = 'rgba(255, 255, 255, 0.06)';
                div.style.borderColor = 'rgba(123, 202, 15, 0.3)';
                div.style.transform = 'translateX(2px)';
            };
            div.onmouseleave = () => {
                div.style.background = 'rgba(255, 255, 255, 0.03)';
                div.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                div.style.transform = 'translateX(0)';
            };

            div.addEventListener('click', () => {
                if (window.getSelection && window.getSelection().toString().trim().length > 0) return;
                
                switchToTab('tab-cap-phat-list');
                const searchInputEl = document.getElementById('search-thiet-bi');
                if (searchInputEl) {
                    searchInputEl.value = log.userId || log.userName;
                    currentPageThietBi = 1;
                    renderThietBi(searchInputEl.value.trim());
                }
            });

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; gap: 8px;">
                    <span>${log.userName} (${log.userId}) - <span style="color: var(--primary-color);">${log.action}</span></span>
                    <span style="font-weight: 400; color: var(--text-secondary); font-size: 11px; white-space: nowrap;">${log.time}</span>
                </div>
                <div style="color: var(--text-secondary); line-height: 1.4;">${log.details}</div>
            `;
            elRecentActivity.appendChild(div);
        });
    }

    function renderDashboard() {
        const totalUsers = thietBiList.length;
        const onlineUsers = thietBiList.filter(item => !item.userDisabled).length;
        const offlineUsers = thietBiList.filter(item => item.userDisabled).length;

        // PC vs Laptop vs Personal vs No device
        let totalPc = 0;
        let totalLaptop = 0;
        let totalPersonal = 0;
        let totalProject = 0;
        let totalNoDevice = 0;

        thietBiList.forEach(item => {
            const alloc = item.devAllocation || (item.devStatus === 'Thiết bị cá nhân' ? 'personal' : (item.devStatus === 'Thiết bị dự án' || item.devStatus === 'Thiết bị dùng chung dự án' ? 'project' : (item.devStatus === 'Không cấp' ? 'no' : 'yes')));
            if (alloc === 'personal' || item.devStatus === 'Thiết bị cá nhân') {
                totalPersonal++;
            } else if (alloc === 'no' || item.devStatus === 'Không cấp') {
                totalNoDevice++;
            } else {
                if (alloc === 'project' || item.devStatus === 'Thiết bị dự án' || item.devStatus === 'Thiết bị dùng chung dự án') {
                    totalProject++;
                }
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
        if (elPersonalSub) elPersonalSub.innerText = `${totalPersonal} Cá nhân${totalProject > 0 ? ' | ' + totalProject + ' Dự án' : ''}${totalNoDevice > 0 ? ' | ' + totalNoDevice + ' Không cấp' : ''}`;

        const totalKhoItems = khoList ? khoList.length : 0;
        const readyKhoItems = khoList ? khoList.filter(k => (k.status || '').toLowerCase().includes('sẵn sàng')).length : 0;
        if (elTotalKho) elTotalKho.innerText = totalKhoItems;
        if (elKhoReady) elKhoReady.innerText = `${readyKhoItems} Sẵn sàng cấp phát`;

        // Executive Card 6: Depreciation & Residual Asset Value
        let totalResidual = 0;
        let totalOriginal = 0;
        thietBiList.forEach(item => {
            const dep = calculateDeviceDepreciation(item);
            totalResidual += dep.residualValue;
            totalOriginal += dep.originalPrice;
        });

        const overallDepPct = totalOriginal > 0 ? Math.round(((totalOriginal - totalResidual) / totalOriginal) * 100) : 0;
        const elDashResidual = document.getElementById('dash-residual-value');
        const elDashTotalCost = document.getElementById('dash-total-cost');
        const elDashDepPct = document.getElementById('dash-depreciation-pct');
        const cardDashDep = document.getElementById('card-dash-depreciation');

        if (elDashResidual) elDashResidual.innerText = totalResidual > 0 ? (new Intl.NumberFormat('vi-VN').format(totalResidual) + ' đ') : '0 đ';
        if (elDashTotalCost) elDashTotalCost.innerText = totalOriginal > 0 ? (new Intl.NumberFormat('vi-VN').format(totalOriginal) + ' đ') : '0 đ';
        if (elDashDepPct) elDashDepPct.innerText = `${overallDepPct}% khấu hao`;

        if (cardDashDep && !cardDashDep.dataset.boundClick) {
            cardDashDep.dataset.boundClick = 'true';
            cardDashDep.addEventListener('click', () => {
                switchToTab('tab-cap-phat-list');
            });
        }

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
                            <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, var(--brand-green), var(--primary-color)); border-radius: 4px; transition: width 0.5s ease;"></div>
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
                'Trung bình': '#38bdf8',
                'Cũ': '#eab308',
                'Xem xét thay thế': '#ef4444'
            };

            for (const st in statusCounts) {
                const count = statusCounts[st];
                const pct = totalAllocatedWithStatus > 0 ? Math.round((count / totalAllocatedWithStatus) * 100) : 0;
                const color = statusColors[st] || '#38bdf8';
                const div = document.createElement('div');
                div.style.cssText = 'display: flex; flex-direction: column; gap: 4px; cursor: pointer; padding: 6px 8px; border-radius: 6px; transition: background 0.2s ease, transform 0.15s ease; user-select: none;';
                div.title = `Click để xem danh sách thiết bị tình trạng "${st}"`;
                
                div.onmouseenter = () => {
                    div.style.background = 'rgba(255, 255, 255, 0.06)';
                    div.style.transform = 'translateX(3px)';
                };
                div.onmouseleave = () => {
                    div.style.background = 'transparent';
                    div.style.transform = 'translateX(0)';
                };

                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 500;">
                        <span style="color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-circle" style="font-size: 8px; color: ${color};"></i>
                            Tình trạng "${st}"
                            <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px; opacity: 0.5; margin-left: 2px;"></i>
                        </span>
                        <span style="font-weight: 700; color: ${color};">${count} thiết bị (${pct}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.5s ease;"></div>
                    </div>
                `;

                div.addEventListener('click', () => {
                    const filterSelect = document.getElementById('filter-status-thietbi');
                    if (filterSelect) {
                        const mapping = {
                            'Mới': 'status_moi',
                            'Trung bình': 'status_trung_binh',
                            'Cũ': 'status_cu',
                            'Xem xét thay thế': 'status_xem_xet'
                        };
                        filterSelect.value = mapping[st] || '';
                    }

                    const searchInput = document.getElementById('search-thiet-bi');
                    if (searchInput) searchInput.value = '';

                    switchToTab('tab-cap-phat-list');
                    currentPageThietBi = 1;
                    renderThietBi();
                    showToast('Lọc thiết bị', `Đang hiển thị danh sách thiết bị có tình trạng: "${st}"`, 'info');
                });

                elStatusBreakdown.appendChild(div);
            }
        }

        // 4. Recent Activity Log Feed (Sorted Chronologically: Newest First)
        renderRecentActivity();

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

    // Helpers to manage Section 3 (Troubleshooting 10 rows x 2 cols)
    function parseTroubleshootList(rawVal) {
        if (!rawVal) return [];
        if (Array.isArray(rawVal)) return rawVal;
        try {
            const parsed = JSON.parse(rawVal);
            if (Array.isArray(parsed)) return parsed;
            return [rawVal];
        } catch (e) {
            return String(rawVal).split('\n').filter(Boolean);
        }
    }

    function getTroubleshootDataFromForm() {
        const issueDescs = [];
        const issueFixes = [];
        for (let i = 1; i <= 10; i++) {
            const dEl = document.getElementById(`dev-issue-desc-${i}`);
            const fEl = document.getElementById(`dev-issue-fix-${i}`);
            issueDescs.push(dEl ? dEl.value.trim() : '');
            issueFixes.push(fEl ? fEl.value.trim() : '');
        }
        const hasDesc = issueDescs.some(x => x !== '');
        const hasFix = issueFixes.some(x => x !== '');
        return {
            devIssueDesc: hasDesc ? JSON.stringify(issueDescs) : '',
            devIssueFix: hasFix ? JSON.stringify(issueFixes) : ''
        };
    }

    function populateTroubleshootForm(issueDescRaw, issueFixRaw) {
        const descs = parseTroubleshootList(issueDescRaw);
        const fixes = parseTroubleshootList(issueFixRaw);
        for (let i = 1; i <= 10; i++) {
            const dEl = document.getElementById(`dev-issue-desc-${i}`);
            const fEl = document.getElementById(`dev-issue-fix-${i}`);
            if (dEl) dEl.value = descs[i - 1] || '';
            if (fEl) fEl.value = fixes[i - 1] || '';
        }
    }

    function resetTroubleshootForm() {
        for (let i = 1; i <= 10; i++) {
            const dEl = document.getElementById(`dev-issue-desc-${i}`);
            const fEl = document.getElementById(`dev-issue-fix-${i}`);
            if (dEl) dEl.value = '';
            if (fEl) fEl.value = '';
        }
    }

    function formatTroubleshootForDisplay(descRaw, fixRaw) {
        const descs = parseTroubleshootList(descRaw);
        const fixes = parseTroubleshootList(fixRaw);
        const pairs = [];
        const maxLen = Math.max(descs.length, fixes.length);
        for (let i = 0; i < maxLen; i++) {
            const d = descs[i] || '';
            const f = fixes[i] || '';
            if (d || f) {
                pairs.push({ index: i + 1, desc: d, fix: f });
            }
        }
        return pairs;
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
            if (userStatusFilter === 'status_moi' && item.devStatus !== 'Mới') {
                return false;
            }
            if (userStatusFilter === 'status_trung_binh' && item.devStatus !== 'Trung bình') {
                return false;
            }
            if (userStatusFilter === 'status_cu' && item.devStatus !== 'Cũ') {
                return false;
            }
            if (userStatusFilter === 'status_xem_xet' && item.devStatus !== 'Xem xét thay thế') {
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
            const troubleshootSearch = parseTroubleshootList(item.devIssueDesc).join(' ') + ' ' + parseTroubleshootList(item.devIssueFix).join(' ');
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
                ${item.devSsd || ''} ${item.devSsd2 || ''}
                ${item.devHdd || ''} ${item.devHdd2 || ''}
                ${item.devMonitor || ''} ${item.devMonitor2 || ''}
                ${item.devMonitorSn || ''} ${item.devMonitorSn2 || ''}
                ${item.devNotes || ''} 
                ${troubleshootSearch} 
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

        if (elStart) elStart.innerText = totalItems === 0 ? '0' : ((currentPageThietBi - 1) * itemsPerPageThietBi + 1);
        if (elEnd) elEnd.innerText = Math.min(currentPageThietBi * itemsPerPageThietBi, totalItems);
        if (elTotal) elTotal.innerText = totalItems;
        if (elCurrent) elCurrent.innerText = `Trang ${currentPageThietBi} / ${totalPages}`;

        const btnPrev = document.getElementById('btn-prev-page') || document.getElementById('btn-prev-page-thietbi');
        const btnNext = document.getElementById('btn-next-page') || document.getElementById('btn-next-page-thietbi');
        if (btnPrev) btnPrev.disabled = (currentPageThietBi <= 1);
        if (btnNext) btnNext.disabled = (currentPageThietBi >= totalPages);

        tbodyThietBi.innerHTML = '';

        if (filtered.length === 0) {
            tbodyThietBi.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6" class="text-center text-muted">Không tìm thấy dữ liệu cấp phát phù hợp!</td>
                </tr>
            `;
            return;
        }

        const startIndex = (currentPageThietBi - 1) * itemsPerPageThietBi;
        const pageItems = filtered.slice(startIndex, startIndex + itemsPerPageThietBi);

        pageItems.forEach(item => {
            const originalIndex = thietBiList.indexOf(item);
            const tr = document.createElement('tr');

            const keysArr = [];
            if (item.keyWin) keysArr.push(`<span class="key-badge" title="Key Windows">Win: ${item.keyWin}</span>`);
            if (item.keyOffice) keysArr.push(`<span class="key-badge" title="Key Office">Office: ${item.keyOffice}</span>`);
            if (item.keyPdf) keysArr.push(`<span class="key-badge" title="Key PDF">PDF: ${item.keyPdf}</span>`);
            if (item.devApps) keysArr.push(`<span class="key-badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border-color: rgba(168, 85, 247, 0.3);" title="Phần mềm bản quyền khác">${item.devApps}</span>`);
            const keysText = keysArr.length > 0 ? keysArr.join(' ') : '—';

            const createdTs = getItemCreatedTimestamp(item);
            const updatedTs = getItemUpdatedTimestamp(item);
            const nowTs = new Date().getTime();
            const isCreatedRecentBadge = createdTs > 0 && ((nowTs - createdTs) <= 7 * 24 * 60 * 60 * 1000);
            const isUpdatedRecentBadge = !isCreatedRecentBadge && updatedTs > 0 && ((nowTs - updatedTs) <= 7 * 24 * 60 * 60 * 1000);

            let statusBadgeHtml = '';
            if (isCreatedRecentBadge) {
                statusBadgeHtml = `<span class="badge" style="margin-left: 4px; font-size: 11px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);" title="Mới tạo trong 7 ngày gần đây"><i class="fa-solid fa-sparkles"></i> Mới thêm</span>`;
            } else if (isUpdatedRecentBadge) {
                statusBadgeHtml = `<span class="badge" style="margin-left: 4px; font-size: 11px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);" title="Mới cập nhật thông tin trong 7 ngày gần đây"><i class="fa-solid fa-rotate"></i> Mới cập nhật</span>`;
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
            if (item.devSsd || item.devSsd2) {
                const ssdParts = [item.devSsd, item.devSsd2].filter(Boolean);
                configArr.push(`SSD: ${ssdParts.join(' + ')}`);
            }
            if (item.devHdd || item.devHdd2) {
                const hddParts = [item.devHdd, item.devHdd2].filter(Boolean);
                configArr.push(`HDD: ${hddParts.join(' + ')}`);
            }
            if (item.devVga) configArr.push(`VGA: ${item.devVga}`);
            if (item.devMonitor || item.devMonitor2) {
                const monParts = [item.devMonitor, item.devMonitor2].filter(Boolean);
                configArr.push(`Màn hình: ${monParts.join(' | ')}`);
            }
            if (item.devMonitorSn || item.devMonitorSn2) {
                const monSnParts = [item.devMonitorSn, item.devMonitorSn2].filter(Boolean);
                configArr.push(`S/N Màn hình: ${monSnParts.join(' | ')}`);
            }
            if (item.devSn) configArr.push(`S/N Thiết bị: ${item.devSn}`);
            if (item.devKeyboard) {
                const kbText = (item.devKeyboard === true || item.devKeyboard === 'true') ? 'Bàn phím có dây' : item.devKeyboard;
                configArr.push(`Bàn phím: ${kbText}`);
            }
            if (item.devMouse) configArr.push(`Chuột: ${item.devMouse}`);
            if (item.devCables) configArr.push(`Dây kết nối: ${item.devCables}`);
            const configText = configArr.length > 0 ? configArr.join('<br>') : 'Chưa nhập cấu hình';

            const troubleshootPairs = formatTroubleshootForDisplay(item.devIssueDesc, item.devIssueFix);

            tr.innerHTML = `
                <td>
                    <div class="user-info-cell">
                        <span class="name">
                            <span class="btn-edit-thietbi" data-index="${originalIndex}" style="cursor: pointer; color: var(--primary-color);" title="Click để chỉnh sửa">${item.userName}</span> 
                            <span class="badge badge-blue">${item.userId}</span>
                            ${statusBadgeHtml}
                            ${item.userDisabled 
                                ? `<span class="badge badge-danger btn-toggle-user-status" data-index="${originalIndex}" style="margin-left: 4px; font-size: 11px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); display: inline-flex; align-items: center; gap: 4px; cursor: pointer;" title="Tài khoản đã vô hiệu hóa (Bấm để kích hoạt lại Online)"><i class="fa-solid fa-circle" style="font-size: 7px; color: #ef4444;"></i> Offline</span>` 
                                : `<span class="badge badge-success btn-toggle-user-status" data-index="${originalIndex}" style="margin-left: 4px; font-size: 11px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); display: inline-flex; align-items: center; gap: 4px; cursor: pointer;" title="Tài khoản đang hoạt động (Bấm để vô hiệu hóa / Offboard)"><i class="fa-solid fa-circle" style="font-size: 7px; color: #22c55e;"></i> Online</span>`}
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
                        ${item.devAllocation === 'project' || item.devStatus === 'Thiết bị dự án' || item.devStatus === 'Thiết bị dùng chung dự án' || item.devStatus === 'Dùng chung' ? `
                            <span class="badge" style="background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.3); font-weight: 700; width: fit-content; margin-bottom: 4px; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-people-roof"></i> Dùng chung
                            </span>
                        ` : ''}
                        ${item.devId || item.maTaiSan || item.assetCode ? `
                            <span class="name" style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                                ${item.devId ? `<span class="badge badge-green" title="ID Thiết bị">${item.devId}</span>` : ''}
                                ${(item.maTaiSan || item.assetCode) && (item.maTaiSan || item.assetCode) !== item.devId ? `
                                    <span class="badge" style="background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.3); font-family: monospace; font-weight: 700; font-size: 11px;" title="Mã Tài Sản">${item.maTaiSan || item.assetCode}</span>
                                ` : ''}
                                ${item.devStatus && !['Thiết bị dự án', 'Thiết bị dùng chung dự án', 'Dùng chung', 'Thiết bị cá nhân', 'Cá nhân'].includes(item.devStatus) ? `<span class="badge ${getStatusBadgeClass(item.devStatus)}">${item.devStatus}</span>` : ''}
                            </span>
                        ` : ''}
                        ${(item.devAllocation === 'personal' || item.devStatus === 'Thiết bị cá nhân' || item.devStatus === 'Cá nhân') && !item.devId ? `
                            <span class="badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-laptop-code"></i> Cá nhân</span>
                        ` : ((item.devAllocation === 'no' || item.devStatus === 'Không cấp') && !item.devId ? `
                            <span class="badge badge-secondary" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3);"><i class="fa-solid fa-ban"></i> Không cấp</span>
                        ` : ((item.devType || item.devMain || item.devCpu || item.devRam || item.devSsd || item.devHdd || item.devStatus) ? `
                            ${!item.devId && item.devStatus && !['Thiết bị dự án', 'Thiết bị dùng chung dự án', 'Dùng chung', 'Thiết bị cá nhân', 'Cá nhân'].includes(item.devStatus) ? `<span class="name"><span class="badge ${getStatusBadgeClass(item.devStatus)}">${item.devStatus}</span></span>` : ''}
                            <span class="details">Loại: ${item.devType || 'Chưa phân loại'}</span>
                        ` : (!item.devId && item.devAllocation !== 'project' && item.devStatus !== 'Thiết bị dự án' && item.devStatus !== 'Thiết bị dùng chung dự án' && item.devStatus !== 'Dùng chung' ? `
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
                    <span style="font-size: 13px; color: var(--text-secondary); font-style: italic; white-space: pre-line; word-break: break-word;">${item.devNotes || '—'}</span>
                </td>
                <td>
                    <div class="actions-cell actions-cell-grid">
                        <div class="actions-row">
                            <button class="btn-icon-only btn-export-row-thietbi" data-index="${originalIndex}" title="Xuất thông tin nhân viên" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);">
                                <i class="fa-solid fa-file-invoice"></i>
                            </button>
                            ${item.hasDevice || item.devId || item.devCpu || item.devRam ? `
                                <button class="btn-icon-only btn-transfer-row-thietbi" data-index="${originalIndex}" title="Chuyển thiết bị cho nhân viên khác hoặc về Kho" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                                    <i class="fa-solid fa-right-left"></i>
                                </button>
                            ` : ''}
                            ${item.devId ? `
                                <button class="btn-icon-only btn-qrcode-tag-thietbi" data-index="${originalIndex}" title="Tạo mã QR Code & Tem dán tài sản" style="background: rgba(123, 202, 15, 0.15); color: #7bca0f; border: 1px solid rgba(123, 202, 15, 0.3);">
                                    <i class="fa-solid fa-qrcode"></i>
                                </button>
                            ` : ''}
                            ${item.devId || item.hasDevice || item.devCpu ? `
                                <button class="btn-icon-only btn-maintenance-log-thietbi" data-index="${originalIndex}" title="Sổ nhật ký bảo trì & Nâng cấp thiết bị" style="background: rgba(14, 165, 233, 0.15); color: #0ea5e9; border: 1px solid rgba(14, 165, 233, 0.3);">
                                    <i class="fa-solid fa-screwdriver-wrench"></i>
                                </button>
                            ` : ''}
                        </div>
                        <div class="actions-row">
                            <button class="btn-icon-only btn-offboard-thietbi" data-index="${originalIndex}" title="${item.userDisabled ? 'Nhân sự đã vô hiệu hóa (Bấm để xem hoặc kích hoạt lại)' : 'Quy trình vô hiệu hóa tài khoản / Nghỉ việc (Offboarding)'}" style="background: ${item.userDisabled ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.12)'}; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.35);">
                                <i class="fa-solid fa-user-xmark"></i>
                            </button>
                            <button class="btn-icon-only btn-troubleshoot-row-thietbi" data-index="${originalIndex}" title="Xem danh sách các lỗi thường gặp & Cách fix" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">
                                <i class="fa-solid fa-wrench"></i>
                            </button>
                            <button class="btn-icon-only history btn-history-thietbi" data-index="${originalIndex}" title="Xem ngày cập nhật">
                                <i class="fa-solid fa-clock-rotate-left"></i>
                            </button>
                            <button class="btn-icon-only delete btn-delete-thietbi" data-index="${originalIndex}" title="Xóa">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </td>
            `;
            tbodyThietBi.appendChild(tr);
        });

        // Bind events to action buttons inside the table
        document.querySelectorAll('.btn-export-row-thietbi').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.getAttribute('data-index'));
                openExportModalForUser(idx);
            });
        });
        document.querySelectorAll('.btn-transfer-row-thietbi').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                openTransferModalForUser(idx);
            });
        });
        document.querySelectorAll('.btn-troubleshoot-row-thietbi').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                openTroubleshootModal(idx);
            });
        });

        document.querySelectorAll('.btn-qrcode-tag-thietbi').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.getAttribute('data-index'));
                openQrTagModal(idx);
            });
        });

        document.querySelectorAll('.btn-maintenance-log-thietbi').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.getAttribute('data-index'));
                openMaintenanceModal(idx);
            });
        });

        document.querySelectorAll('.btn-offboard-thietbi').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.getAttribute('data-index'));
                openOffboardModal(idx);
            });
        });

        document.querySelectorAll('.btn-toggle-user-status').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.getAttribute('data-index'));
                const it = thietBiList[idx];
                if (!it) return;
                if (it.userDisabled) {
                    if (confirm(`Bạn có muốn mở khóa / kích hoạt lại tài khoản (Online) cho nhân sự "${it.userName}" không?`)) {
                        reEnableUser(idx);
                    }
                } else {
                    openOffboardModal(idx);
                }
            });
        });
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
                            <div class="timeline-time">${log.time || '—'}</div>
                            <div class="timeline-action">${log.action || 'Cập nhật'}</div>
                            <div class="timeline-details">${log.details || '—'}</div>
                        `;
                        histTimeline.appendChild(div);
                    });
                }
                
                // Show modal
                historyModal.classList.add('show');
            });
        });
    }

    // Modal Troubleshoot Preview logic
    const modalTroubleshootView = document.getElementById('modal-troubleshoot-view');
    const btnCloseTroubleshootModal = document.getElementById('btn-close-troubleshoot-modal');
    const btnFooterCloseTroubleshootModal = document.getElementById('btn-footer-close-troubleshoot-modal');

    function openTroubleshootModal(index) {
        const item = thietBiList[index];
        if (!item) return;

        const userEl = document.getElementById('tbview-user');
        const devEl = document.getElementById('tbview-device');
        const deptEl = document.getElementById('tbview-dept');
        const listEl = document.getElementById('tbview-content-list');

        if (userEl) userEl.innerText = `${item.userName} (${item.userId})`;
        if (devEl) devEl.innerText = item.devId ? `${item.devId} - ${item.devType || 'Thiết bị'}` : 'Chưa cấp ID thiết bị';
        if (deptEl) deptEl.innerText = item.userDept || '—';

        const pairs = formatTroubleshootForDisplay(item.devIssueDesc, item.devIssueFix);

        if (pairs.length === 0) {
            listEl.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); background: rgba(255, 255, 255, 0.02); border-radius: 8px; border: 1px dashed var(--border-color);">
                    <i class="fa-solid fa-circle-check" style="font-size: 36px; color: #22c55e; margin-bottom: 12px; display: block;"></i>
                    <div style="font-size: 15px; font-weight: 700; color: var(--text-primary);">Chưa ghi nhận lỗi thường gặp</div>
                    <div style="font-size: 13px; margin-top: 6px; color: var(--text-secondary);">Thiết bị hoặc nhân sự này chưa có mục sự cố nào được lưu trong Mục 3.</div>
                </div>
            `;
        } else {
            listEl.innerHTML = `
                <div class="troubleshoot-wrapper" style="box-shadow: none;">
                    <div class="troubleshoot-header" style="background: rgba(255, 255, 255, 0.04);">
                        <div class="th-stt">STT</div>
                        <div class="th-issue"><i class="fa-solid fa-bug"></i> Thông tin lỗi hay gặp</div>
                        <div class="th-fix"><i class="fa-solid fa-circle-check"></i> Hướng dẫn cách fix</div>
                    </div>
                    <div class="troubleshoot-body" style="padding: 10px;">
                        ${pairs.map(p => `
                            <div class="troubleshoot-row-card" style="background: rgba(255, 255, 255, 0.02);">
                                <div class="troubleshoot-num-pill" style="width: 32px; height: 32px; font-size: 12px;">${String(p.index).padStart(2, '0')}</div>
                                <div style="padding: 9px 14px; background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 6px; font-size: 13px; color: #fef3c7; word-break: break-word;">
                                    <i class="fa-solid fa-triangle-exclamation" style="color: #fbbf24; margin-right: 6px;"></i>
                                    ${p.desc || '<span style="color: var(--text-muted); font-style: italic;">Chưa nhập thông tin lỗi</span>'}
                                </div>
                                <div style="padding: 9px 14px; background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 6px; font-size: 13px; color: #dcfce7; word-break: break-word;">
                                    <i class="fa-solid fa-wrench" style="color: #4ade80; margin-right: 6px;"></i>
                                    ${p.fix || '<span style="color: var(--text-muted); font-style: italic;">Chưa nhập hướng dẫn fix</span>'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (modalTroubleshootView) modalTroubleshootView.classList.remove('hidden');
    }

    if (btnCloseTroubleshootModal) {
        btnCloseTroubleshootModal.addEventListener('click', () => {
            if (modalTroubleshootView) modalTroubleshootView.classList.add('hidden');
        });
    }

    if (btnFooterCloseTroubleshootModal) {
        btnFooterCloseTroubleshootModal.addEventListener('click', () => {
            if (modalTroubleshootView) modalTroubleshootView.classList.add('hidden');
        });
    }

    if (modalTroubleshootView) {
        modalTroubleshootView.addEventListener('click', (e) => {
            if (e.target === modalTroubleshootView) {
                modalTroubleshootView.classList.add('hidden');
            }
        });
    }

    // Submit Action for Asset management form
    formCapPhat.addEventListener('submit', async (e) => {
        e.preventDefault();
        const indexStr = editIndexThietBi.value;

        // Perform validation
        const userOk = validateDuplicateUser(indexStr);
        const devOk = validateDuplicateDevice(indexStr);
        const snOk = validateDeviceSerial(indexStr);

        if (!userOk || !devOk || !snOk) {
            showToast('Lỗi nhập liệu', 'Vui lòng kiểm tra lại thông tin mã/serial hoặc trường bắt buộc!', 'error');
            return;
        }

        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} lúc ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        let devAllocVal = 'yes';
        const allocSelected = document.querySelector('input[name="dev-allocation"]:checked');
        if (allocSelected) devAllocVal = allocSelected.value;
        const hasDevice = devAllocVal === 'yes' || devAllocVal === 'project';

        const data = {
            devAllocation: devAllocVal,
            hasDevice: hasDevice,
            userDisabled: document.getElementById('user-status-select') 
                ? (document.getElementById('user-status-select').value === 'disabled')
                : ((indexStr !== '' && thietBiList[parseInt(indexStr)]) ? !!thietBiList[parseInt(indexStr)].userDisabled : false),
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
            devSsd: hasDevice ? (document.getElementById('dev-ssd') ? document.getElementById('dev-ssd').value.trim() : '') : '',
            devSsd2: hasDevice ? (document.getElementById('dev-ssd-2') ? document.getElementById('dev-ssd-2').value.trim() : '') : '',
            devHdd: hasDevice ? (document.getElementById('dev-hdd') ? document.getElementById('dev-hdd').value.trim() : '') : '',
            devHdd2: hasDevice ? (document.getElementById('dev-hdd-2') ? document.getElementById('dev-hdd-2').value.trim() : '') : '',
            devVga: hasDevice ? document.getElementById('dev-vga').value.trim() : '',
            keyWin: hasDevice ? document.getElementById('key-win').value.trim() : '',
            keyOffice: hasDevice ? document.getElementById('key-office').value.trim() : '',
            keyPdf: hasDevice ? document.getElementById('key-pdf').value.trim() : '',
            devNotes: hasDevice ? document.getElementById('dev-notes').value.trim() : '',
            devApps: hasDevice ? document.getElementById('dev-apps').value.trim() : '',
            ...getTroubleshootDataFromForm(),
            devStatus: devAllocVal === 'personal' ? 'Thiết bị cá nhân' : (document.getElementById('dev-status').value || (devAllocVal === 'project' ? 'Thiết bị dự án' : 'Mới')),
            devMonitor: hasDevice ? (document.getElementById('dev-monitor') ? document.getElementById('dev-monitor').value.trim() : '') : '',
            devMonitor2: hasDevice ? (document.getElementById('dev-monitor-2') ? document.getElementById('dev-monitor-2').value.trim() : '') : '',
            devMonitorSn: (hasDevice && document.getElementById('dev-monitor-sn')) ? document.getElementById('dev-monitor-sn').value.trim() : '',
            devMonitorSn2: (hasDevice && document.getElementById('dev-monitor-sn-2')) ? document.getElementById('dev-monitor-sn-2').value.trim() : '',
            devSn: hasDevice ? document.getElementById('dev-sn').value.trim() : '',
            devKeyboard: (hasDevice && document.getElementById('dev-keyboard')) ? document.getElementById('dev-keyboard').value : '',
            devMouse: (hasDevice && document.getElementById('dev-mouse')) ? document.getElementById('dev-mouse').value : '',
            devCables: hasDevice ? document.getElementById('dev-cables').value : '',
            updatedAt: formattedDate,
            purchasePrice: (document.getElementById('device-purchase-price') ? document.getElementById('device-purchase-price').value.trim() : ''),
            purchaseDate: (document.getElementById('device-purchase-date') ? document.getElementById('device-purchase-date').value.trim() : ''),
            depreciationYears: (document.getElementById('device-depreciation-years') ? document.getElementById('device-depreciation-years').value : '3'),
            maintenanceLogs: (indexStr !== '' && thietBiList[parseInt(indexStr)]) ? (thietBiList[parseInt(indexStr)].maintenanceLogs || []) : [],
            devId: devIdInput ? devIdInput.value.trim() : '',
            maTaiSan: document.getElementById('dev-ma-tai-san') ? document.getElementById('dev-ma-tai-san').value.trim() : '',
            assetCode: document.getElementById('dev-ma-tai-san') ? document.getElementById('dev-ma-tai-san').value.trim() : '',
            assetCompany: document.getElementById('dev-asset-company') ? (document.getElementById('dev-asset-company').value.trim().toUpperCase() || 'ERG') : 'ERG',
            assetGroup: document.getElementById('dev-asset-group') ? document.getElementById('dev-asset-group').value : 'CCDC',
            currentAssetGroup: document.getElementById('dev-asset-group') ? document.getElementById('dev-asset-group').value : 'CCDC',
            assetType: document.getElementById('dev-asset-type') ? document.getElementById('dev-asset-type').value : 'LT',
            monitorSize: document.getElementById('dev-monitor-size') ? document.getElementById('dev-monitor-size').value.trim() : '',
            warrantyEndDate: document.getElementById('dev-warranty-exp') ? document.getElementById('dev-warranty-exp').value.trim() : ''
        };

        if (indexStr === '') {
            // Commit sequence when saving brand new asset
            commitAssetSequence(data.assetCompany, data.assetGroup, data.assetType, data.maTaiSan);
        }

        saveDeviceExtras(data.devId || data.userId, {
            purchasePrice: data.purchasePrice,
            purchaseDate: data.purchaseDate,
            depreciationYears: data.depreciationYears,
            maintenanceLogs: data.maintenanceLogs
        });

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
                userKeyElement: "Key Element",
                devIssueDesc: "Thông tin lỗi hay gặp",
                devIssueFix: "Cách fix lỗi"
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
                    devSsd: "SSD 1",
                    devSsd2: "SSD 2",
                    devHdd: "HDD 1",
                    devHdd2: "HDD 2",
                    devVga: "VGA",
                    devMonitor: "Tên màn hình 1",
                    devMonitor2: "Tên màn hình 2",
                    devMonitorSn: "Serial màn hình 1",
                    devMonitorSn2: "Serial màn hình 2",
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
        if (!requirePermission('canEdit', 'chỉnh sửa thông tin cấp phát thiết bị')) return;
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
        if (document.getElementById('user-status-select')) document.getElementById('user-status-select').value = item.userDisabled ? 'disabled' : 'active';
        const alloc = item.devAllocation || (item.devStatus === 'Thiết bị cá nhân' || item.devStatus === 'Cá nhân' ? 'personal' : (item.devStatus === 'Thiết bị dự án' || item.devStatus === 'Thiết bị dùng chung dự án' || item.devStatus === 'Dùng chung' ? 'project' : (item.devStatus === 'Không cấp' ? 'no' : 'yes')));
        const radioTarget = document.querySelector(`input[name="dev-allocation"][value="${alloc}"]`) || document.getElementById('dev-alloc-yes');
        if (radioTarget) {
            radioTarget.checked = true;
            toggleDeviceFields(alloc === 'yes' || alloc === 'project');
        }
        document.getElementById('dev-type').value = item.devType || '';
        document.getElementById('dev-main').value = item.devMain;
        document.getElementById('dev-cpu').value = item.devCpu;
        document.getElementById('dev-ram').value = item.devRam;
        document.getElementById('dev-ram-slots').value = item.devRamSlots || '';
        document.getElementById('dev-ssd').value = item.devSsd || '';
        if (document.getElementById('dev-ssd-2')) document.getElementById('dev-ssd-2').value = item.devSsd2 || '';
        document.getElementById('dev-hdd').value = item.devHdd || '';
        if (document.getElementById('dev-hdd-2')) document.getElementById('dev-hdd-2').value = item.devHdd2 || '';
        document.getElementById('dev-vga').value = item.devVga || '';
        document.getElementById('key-win').value = item.keyWin || '';
        document.getElementById('key-office').value = item.keyOffice || '';
        document.getElementById('key-pdf').value = item.keyPdf || '';
        document.getElementById('dev-notes').value = item.devNotes || '';
        document.getElementById('dev-apps').value = item.devApps || '';
        populateTroubleshootForm(item.devIssueDesc, item.devIssueFix);
        document.getElementById('dev-status').value = item.devStatus || '';
        document.getElementById('dev-monitor').value = item.devMonitor || '';
        if (document.getElementById('dev-monitor-2')) document.getElementById('dev-monitor-2').value = item.devMonitor2 || '';
        if (document.getElementById('dev-monitor-sn')) document.getElementById('dev-monitor-sn').value = item.devMonitorSn || '';
        if (document.getElementById('dev-monitor-sn-2')) document.getElementById('dev-monitor-sn-2').value = item.devMonitorSn2 || '';
        document.getElementById('dev-sn').value = item.devSn || '';
        if (document.getElementById('dev-keyboard')) {
            let kbVal = item.devKeyboard;
            if (kbVal === true || kbVal === 'true') kbVal = 'Bàn phím có dây';
            else if (!kbVal || kbVal === false) kbVal = '';
            document.getElementById('dev-keyboard').value = kbVal;
        }
        if (document.getElementById('dev-mouse')) document.getElementById('dev-mouse').value = item.devMouse || '';
        document.getElementById('dev-cables').value = item.devCables || '';
        if (document.getElementById('device-purchase-price')) document.getElementById('device-purchase-price').value = item.purchasePrice || '';
        if (document.getElementById('device-purchase-date')) document.getElementById('device-purchase-date').value = item.purchaseDate || '';
        if (document.getElementById('device-depreciation-years')) document.getElementById('device-depreciation-years').value = item.depreciationYears || '3';
        
        // Asset Code & Device ID Fields Population & Immutability lock
        if (devIdInput) {
            devIdInput.value = item.devId || '';
            devIdInput.readOnly = false;
            devIdInput.title = 'ID Thiết bị trong hệ thống';
        }
        const selAssetCompany = document.getElementById('dev-asset-company');
        if (selAssetCompany) {
            selAssetCompany.value = item.assetCompany || getAssetPrefix() || 'ERG';
            selAssetCompany.readOnly = false;
            selAssetCompany.disabled = false;
        }
        const selAssetGroup = document.getElementById('dev-asset-group');
        if (selAssetGroup) {
            selAssetGroup.value = item.assetGroup || 'CCDC';
            selAssetGroup.disabled = false;
        }

        const selAssetType = document.getElementById('dev-asset-type');
        if (selAssetType) {
            selAssetType.value = item.assetType || 'LT';
            selAssetType.disabled = false;
        }

        const devMaTaiSan = document.getElementById('dev-ma-tai-san');
        if (devMaTaiSan) {
            devMaTaiSan.value = item.maTaiSan || item.assetCode || '';
            devMaTaiSan.readOnly = false;
        }
        const btnRegenCode = document.getElementById('btn-regen-asset-code');
        if (btnRegenCode) btnRegenCode.style.display = 'inline-flex';



        if (document.getElementById('dev-monitor-size')) document.getElementById('dev-monitor-size').value = item.monitorSize || '';
        if (document.getElementById('dev-warranty-exp')) document.getElementById('dev-warranty-exp').value = item.warrantyEndDate || '';

        btnSaveThietBi.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Cấp Phát';
        btnCancelThietBi.classList.remove('hidden');

        const badgeMode = document.getElementById('badge-form-mode');
        if (badgeMode) {
            badgeMode.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Đang chỉnh sửa: ${item.maTaiSan || item.devId || item.userName || '#' + (index + 1)}`;
            badgeMode.style.background = 'rgba(249, 115, 22, 0.15)';
            badgeMode.style.color = '#fb923c';
            badgeMode.style.borderColor = 'rgba(249, 115, 22, 0.35)';
        }

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
        if (!requirePermission('canDelete', 'xóa thông tin cấp phát thiết bị')) return;
        const item = thietBiList[index];
        if (confirm(`Bạn có chắc chắn muốn xóa cấp phát thiết bị của nhân sự ${item.userName} (${item.userId})?`)) {
            try {
                const { error } = await supabaseClient
                    .from('thiet_bi')
                    .delete()
                    .eq('id', item.id);
                if (error) throw error;
                if (item.devId || item.assetCode) {
                    recordDeletedAssetCode(item.devId || item.assetCode, 'Đã xóa cấp phát');
                }
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
        const badgeMode = document.getElementById('badge-form-mode');
        if (badgeMode) {
            badgeMode.innerHTML = '<i class="fa-solid fa-plus"></i> Thêm cấp phát mới';
            badgeMode.style.background = 'rgba(123, 202, 15, 0.15)';
            badgeMode.style.color = 'var(--brand-green)';
            badgeMode.style.borderColor = 'rgba(123, 202, 15, 0.3)';
        }
        formCapPhat.reset();
        resetTroubleshootForm();
        if (document.getElementById('user-status-select')) {
            document.getElementById('user-status-select').value = 'active';
        }
        const devAllocYes = document.getElementById('dev-alloc-yes');
        if (devAllocYes) {
            devAllocYes.checked = true;
            toggleDeviceFields(true);
        }
        const container = document.getElementById('user-info-subsection');
        if (container) {
            container.style.background = '';
            container.style.borderColor = '';
        }

        document.getElementById('err-user-id').style.display = 'none';
        document.getElementById('err-dev-id').style.display = 'none';
        userIdInput.style.borderColor = '';
        devIdInput.style.borderColor = '';
        if (document.getElementById('device-purchase-price')) document.getElementById('device-purchase-price').value = '';
        if (document.getElementById('device-purchase-date')) document.getElementById('device-purchase-date').value = '';
        if (document.getElementById('device-depreciation-years')) document.getElementById('device-depreciation-years').value = '3';

        // Unlock Asset Code and regenerate next preview code
        if (devIdInput) {
            devIdInput.value = '';
            devIdInput.readOnly = false;
            devIdInput.title = 'Nhập ID Thiết bị của hệ thống (VD: PC-01, LT-01...)';
        }
        const selAssetCompany = document.getElementById('dev-asset-company');
        if (selAssetCompany) {
            selAssetCompany.readOnly = false;
            selAssetCompany.value = getAssetPrefix() || 'ERG';
        }
        const btnRegenCode = document.getElementById('btn-regen-asset-code');
        if (btnRegenCode) btnRegenCode.style.display = 'inline-flex';

        const selAssetGroup = document.getElementById('dev-asset-group');
        if (selAssetGroup) {
            selAssetGroup.disabled = false;
            selAssetGroup.value = 'CCDC';
        }
        const selAssetType = document.getElementById('dev-asset-type');
        if (selAssetType) {
            selAssetType.disabled = false;
            selAssetType.value = 'LT';
        }
        const devMaTaiSan = document.getElementById('dev-ma-tai-san');
        if (devMaTaiSan) {
            devMaTaiSan.value = '';
        }


        if (document.getElementById('dev-monitor-size')) document.getElementById('dev-monitor-size').value = '';
        if (document.getElementById('dev-warranty-exp')) document.getElementById('dev-warranty-exp').value = '';
        const errSn = document.getElementById('err-dev-sn');
        if (errSn) errSn.style.display = 'none';
        const snInp = document.getElementById('dev-sn');
        if (snInp) snInp.style.borderColor = '';

        if (typeof refreshFormAssetCode === 'function') {
            refreshFormAssetCode();
        }
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
            const val = e.target.value;
            toggleDeviceFields(val === 'yes' || val === 'project');
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

    let transferSourceOverride = null;

    // Helper: Trích xuất cấu hình đầy đủ từ chuỗi Ghi chú của Kho
    function extractSpecsFromKhoNotes(notesText) {
        if (!notesText) return {};
        const jsonMatch = notesText.match(/\[SPECS_JSON:(.*?)\]/s);
        if (jsonMatch && jsonMatch[1]) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch (e) {
                console.warn("Lỗi parse SPECS_JSON từ kho:", e);
            }
        }
        // Fallback regex cho các thiết bị lưu trước đây
        const result = {};
        const mainMatch = notesText.match(/Main(?:board)?:\s*([^,.\n]+)/i);
        const cpuMatch = notesText.match(/CPU:\s*([^,.\n]+)/i);
        const ramMatch = notesText.match(/RAM:\s*([^,.\n]+)/i);
        const ssdMatch = notesText.match(/SSD:\s*([^,.\n]+)/i);
        const hddMatch = notesText.match(/HDD:\s*([^,.\n]+)/i);
        const vgaMatch = notesText.match(/VGA:\s*([^,.\n]+)/i);
        const monMatch = notesText.match(/Màn hình:\s*([^,.\n]+)/i);
        
        if (mainMatch) result.devMain = mainMatch[1].trim();
        if (cpuMatch) result.devCpu = cpuMatch[1].trim();
        if (ramMatch) result.devRam = ramMatch[1].trim();
        if (ssdMatch) result.devSsd = ssdMatch[1].trim().replace(/GB/i, '');
        if (hddMatch) result.devHdd = hddMatch[1].trim();
        if (vgaMatch) result.devVga = vgaMatch[1].trim();
        if (monMatch) result.devMonitor = monMatch[1].trim();
        return result;
    }

    // Helper: Lấy thông tin thiết bị hiện tại (từ form hoặc nguồn được chỉ định)
    function getCurrentDeviceSpecs() {
        if (transferSourceOverride) {
            const u = transferSourceOverride;
            return {
                sourceUser: u,
                currentUserId: u.userId || '',
                currentUserName: u.userName || 'Nhân viên',
                devAllocVal: u.devAllocation || 'yes',
                hasDevice: u.hasDevice !== false && u.devAllocation !== 'no' && (u.devId || u.devType || u.devCpu || u.devRam),
                devId: u.devId || '',
                devType: u.devType || 'PC / Laptop',
                devMain: u.devMain || '',
                devCpu: u.devCpu || '',
                devRam: u.devRam || '',
                devRamSlots: u.devRamSlots || '',
                devSsd: u.devSsd || '',
                devSsd2: u.devSsd2 || '',
                devHdd: u.devHdd || '',
                devHdd2: u.devHdd2 || '',
                devVga: u.devVga || '',
                keyWin: u.keyWin || '',
                keyOffice: u.keyOffice || '',
                keyPdf: u.keyPdf || '',
                devNotes: u.devNotes || '',
                devApps: u.devApps || '',
                devStatus: u.devStatus || 'Mới',
                devMonitor: u.devMonitor || '',
                devMonitor2: u.devMonitor2 || '',
                devMonitorSn: u.devMonitorSn || '',
                devMonitorSn2: u.devMonitorSn2 || '',
                devSn: u.devSn || '',
                devKeyboard: u.devKeyboard || '',
                devMouse: u.devMouse || '',
                devCables: u.devCables || ''
            };
        }

        const indexStr = editIndexThietBi.value;
        const allocSelected = document.querySelector('input[name="dev-allocation"]:checked');
        const devAllocVal = allocSelected ? allocSelected.value : 'yes';

        let devId = devIdInput.value.trim();
        let devType = document.getElementById('dev-type').value.trim();
        let devCpu = document.getElementById('dev-cpu').value.trim();
        let devRam = document.getElementById('dev-ram').value;
        let devSsd = document.getElementById('dev-ssd') ? document.getElementById('dev-ssd').value.trim() : '';
        let devSsd2 = document.getElementById('dev-ssd-2') ? document.getElementById('dev-ssd-2').value.trim() : '';
        let devHdd = document.getElementById('dev-hdd') ? document.getElementById('dev-hdd').value.trim() : '';
        let devHdd2 = document.getElementById('dev-hdd-2') ? document.getElementById('dev-hdd-2').value.trim() : '';
        let devMain = document.getElementById('dev-main').value.trim();
        let devMonitor = document.getElementById('dev-monitor') ? document.getElementById('dev-monitor').value.trim() : '';
        let devMonitor2 = document.getElementById('dev-monitor-2') ? document.getElementById('dev-monitor-2').value.trim() : '';
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
            devRamSlots: document.getElementById('dev-ram-slots') ? document.getElementById('dev-ram-slots').value : '',
            devSsd: devSsd,
            devSsd2: devSsd2,
            devHdd: devHdd,
            devHdd2: devHdd2,
            devVga: document.getElementById('dev-vga') ? document.getElementById('dev-vga').value.trim() : '',
            keyWin: document.getElementById('key-win') ? document.getElementById('key-win').value.trim() : '',
            keyOffice: document.getElementById('key-office') ? document.getElementById('key-office').value.trim() : '',
            keyPdf: document.getElementById('key-pdf') ? document.getElementById('key-pdf').value.trim() : '',
            devNotes: document.getElementById('dev-notes') ? document.getElementById('dev-notes').value.trim() : '',
            devApps: document.getElementById('dev-apps') ? document.getElementById('dev-apps').value.trim() : '',
            ...getTroubleshootDataFromForm(),
            devStatus: devStatus || 'Mới',
            devMonitor: devMonitor,
            devMonitor2: devMonitor2,
            devMonitorSn: document.getElementById('dev-monitor-sn') ? document.getElementById('dev-monitor-sn').value.trim() : '',
            devMonitorSn2: document.getElementById('dev-monitor-sn-2') ? document.getElementById('dev-monitor-sn-2').value.trim() : '',
            devSn: document.getElementById('dev-sn') ? document.getElementById('dev-sn').value.trim() : '',
            devKeyboard: document.getElementById('dev-keyboard') ? document.getElementById('dev-keyboard').value : '',
            devMouse: document.getElementById('dev-mouse') ? document.getElementById('dev-mouse').value : '',
            devCables: document.getElementById('dev-cables') ? document.getElementById('dev-cables').value : ''
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
        transferSourceOverride = null;
    }

    // Mở Modal Chuyển Thiết Bị nội bộ
    function openTransferModalInternal() {
        if (!requirePermission('canEdit', 'chuyển thiết bị / thu hồi về kho')) return;
        const specs = getCurrentDeviceSpecs();

        if (!specs.hasDevice && !specs.devId && !specs.devType && !specs.devCpu && !specs.devRam) {
            showToast('Thông báo', 'Không có thông tin thiết bị để chuyển! Vui lòng chọn nhân viên có cấp phát thiết bị hoặc điền thông tin thiết bị trước.', 'warning');
            transferSourceOverride = null;
            return;
        }

        // Nạp nội dung hiển thị tổng quan thiết bị
        transferSummaryTitle.innerText = `Thiết bị từ ${specs.currentUserName} (${specs.currentUserId || 'Mới'}):`;
        
        let html = `<strong>Mã thiết bị:</strong> ${specs.devId || 'Chưa đặt ID'}<br>`;
        html += `<strong>Loại:</strong> ${specs.devType} | <strong>Tình trạng:</strong> ${specs.devStatus}<br>`;
        let hardware = [];
        if (specs.devMain) hardware.push(`Main: ${specs.devMain}`);
        if (specs.devCpu) hardware.push(`CPU: ${specs.devCpu}`);
        if (specs.devRam) hardware.push(`RAM: ${specs.devRam}${specs.devRamSlots ? ' (' + specs.devRamSlots + ')' : ''}`);
        if (specs.devSsd) hardware.push(`SSD: ${specs.devSsd}GB`);
        if (specs.devHdd) hardware.push(`HDD: ${specs.devHdd}`);
        if (specs.devVga) hardware.push(`VGA: ${specs.devVga}`);
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
    }

    // Mở Modal Chuyển Thiết Bị từ bảng Danh Sách
    function openTransferModalForUser(index) {
        if (index < 0 || index >= thietBiList.length) return;
        const user = thietBiList[index];
        if (!user.hasDevice && !user.devId && !user.devType && !user.devCpu && user.devAllocation === 'no') {
            showToast('Thông báo', `Nhân viên ${user.userName} (${user.userId}) hiện không có thiết bị để chuyển!`, 'warning');
            return;
        }
        transferSourceOverride = user;
        openTransferModalInternal();
    }

    // Mở Modal Chuyển Thiết Bị từ Form
    if (btnOpenTransferModal) {
        btnOpenTransferModal.addEventListener('click', () => {
            transferSourceOverride = null;
            openTransferModalInternal();
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

            const currentUserId = (transferSourceOverride ? transferSourceOverride.userId : userIdInput.value).trim().toLowerCase();

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

                // 1. Cập nhật ĐẦY ĐỦ 100% CẤU HÌNH THIẾT BỊ cho targetUser
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
                targetUser.devSsd2 = specs.devSsd2 || '';
                targetUser.devHdd = specs.devHdd;
                targetUser.devHdd2 = specs.devHdd2 || '';
                targetUser.devVga = specs.devVga;
                targetUser.keyWin = specs.keyWin;
                targetUser.keyOffice = specs.keyOffice;
                targetUser.keyPdf = specs.keyPdf;
                targetUser.devNotes = specs.devNotes;
                targetUser.devApps = specs.devApps;
                targetUser.devStatus = specs.devStatus || 'Mới';
                targetUser.devMonitor = specs.devMonitor;
                targetUser.devMonitor2 = specs.devMonitor2 || '';
                targetUser.devMonitorSn = specs.devMonitorSn;
                targetUser.devMonitorSn2 = specs.devMonitorSn2 || '';
                targetUser.devSn = specs.devSn;
                targetUser.devKeyboard = specs.devKeyboard;
                targetUser.devMouse = specs.devMouse;
                targetUser.devCables = specs.devCables;
                targetUser.updatedAt = formattedDate;

                if (!targetUser.history) targetUser.history = [];
                targetUser.history.push({
                    time: formattedDate,
                    action: 'Nhận bàn giao thiết bị',
                    details: `Nhận điều chuyển thiết bị <strong>${devIdentifier}</strong> (${specs.devCpu ? specs.devCpu + ', ' : ''}${specs.devRam ? 'RAM ' + specs.devRam : ''}) từ nhân viên <strong>${specs.currentUserName}</strong> (${specs.currentUserId || 'Mới'}).`
                });

                // Lưu targetUser lên Supabase
                try {
                    const dbTarget = mappers.thietBi.toDB(targetUser);
                    if (supabaseClient && targetUser.id && !String(targetUser.id).startsWith('local-')) {
                        const { error } = await supabaseClient.from('thiet_bi').update(dbTarget).eq('id', targetUser.id);
                        if (error) console.error("Lỗi lưu targetUser lên Supabase:", error);
                    }
                } catch (e) {
                    console.warn("Lỗi lưu targetUser lên Supabase:", e);
                }

                // 2. Nếu có sourceUser trong thietBiList -> Xóa thiết bị của sourceUser
                if (specs.sourceUser) {
                    const sourceIdx = thietBiList.findIndex(u => (specs.sourceUser.id && u.id === specs.sourceUser.id) || (specs.sourceUser.userId && u.userId.toLowerCase() === specs.sourceUser.userId.toLowerCase()));
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
                        sUser.devSsd2 = '';
                        sUser.devHdd = '';
                        sUser.devHdd2 = '';
                        sUser.devVga = '';
                        sUser.keyWin = '';
                        sUser.keyOffice = '';
                        sUser.keyPdf = '';
                        sUser.devNotes = '';
                        sUser.devApps = '';
                        sUser.devStatus = 'Không cấp';
                        sUser.devMonitor = '';
                        sUser.devMonitor2 = '';
                        sUser.devMonitorSn = '';
                        sUser.devMonitorSn2 = '';
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
                                const { error } = await supabaseClient.from('thiet_bi').update(dbSource).eq('id', sUser.id);
                                if (error) console.error("Lỗi lưu sourceUser lên Supabase:", error);
                            }
                        } catch (e) {
                            console.warn("Lỗi lưu sourceUser lên Supabase:", e);
                        }
                    }
                }

                // Reset form thiết bị và đồng bộ
                resetFormThietBi();
                saveToLocalStorageFallback('thiet_bi', thietBiList);
                renderThietBi();
                closeTransferModal();
                switchToTab('tab-cap-phat-list');

                showToast('Thành công', `Đã chuyển toàn bộ cấu hình thiết bị "${devIdentifier}" sang cho nhân viên ${targetUser.userName} (${targetUser.userId})!`, 'success');

            } else {
                // CHUYỂN VỀ LƯU KHO (kho_thiet_bi)
                const reason = transferKhoReasonInput.value.trim() || `Thu hồi thiết bị từ nhân viên ${specs.currentUserName}`;
                const notes = transferKhoNotesInput.value.trim();

                const devIdentifier = specs.devId || specs.devType || 'TB-KHO';
                let specsDetail = [];
                if (specs.devMain) specsDetail.push(`Main: ${specs.devMain}`);
                if (specs.devCpu) specsDetail.push(`CPU: ${specs.devCpu}`);
                if (specs.devRam) specsDetail.push(`RAM: ${specs.devRam}${specs.devRamSlots ? ' (' + specs.devRamSlots + ')' : ''}`);
                if (specs.devSsd || specs.devSsd2) {
                    const ssdParts = [specs.devSsd, specs.devSsd2].filter(Boolean);
                    specsDetail.push(`SSD: ${ssdParts.join(' + ')}`);
                }
                if (specs.devHdd || specs.devHdd2) {
                    const hddParts = [specs.devHdd, specs.devHdd2].filter(Boolean);
                    specsDetail.push(`HDD: ${hddParts.join(' + ')}`);
                }
                if (specs.devVga) specsDetail.push(`VGA: ${specs.devVga}`);
                if (specs.devMonitor || specs.devMonitor2) {
                    const monParts = [specs.devMonitor, specs.devMonitor2].filter(Boolean);
                    specsDetail.push(`Màn hình: ${monParts.join(' | ')}`);
                }

                // Đóng gói 100% linh kiện chi tiết thành JSON
                const specsData = {
                    devType: specs.devType,
                    devMain: specs.devMain,
                    devCpu: specs.devCpu,
                    devRam: specs.devRam,
                    devRamSlots: specs.devRamSlots,
                    devSsd: specs.devSsd,
                    devSsd2: specs.devSsd2 || '',
                    devHdd: specs.devHdd,
                    devHdd2: specs.devHdd2 || '',
                    devVga: specs.devVga,
                    devMonitor: specs.devMonitor,
                    devMonitor2: specs.devMonitor2 || '',
                    devMonitorSn: specs.devMonitorSn,
                    devMonitorSn2: specs.devMonitorSn2 || '',
                    devSn: specs.devSn,
                    devKeyboard: specs.devKeyboard,
                    devMouse: specs.devMouse,
                    devCables: specs.devCables,
                    keyWin: specs.keyWin,
                    keyOffice: specs.keyOffice,
                    keyPdf: specs.keyPdf,
                    devApps: specs.devApps,
                    devStatus: specs.devStatus
                };

                const fullNotes = `Cấu hình: ${specsDetail.join(', ')}` + (notes ? `. Ghi chú: ${notes}` : '') + `\n[SPECS_JSON:${JSON.stringify(specsData)}]`;

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
                    const sourceIdx = thietBiList.findIndex(u => (specs.sourceUser.id && u.id === specs.sourceUser.id) || (specs.sourceUser.userId && u.userId.toLowerCase() === specs.sourceUser.userId.toLowerCase()));
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
                        sUser.devSsd2 = '';
                        sUser.devHdd = '';
                        sUser.devHdd2 = '';
                        sUser.devVga = '';
                        sUser.keyWin = '';
                        sUser.keyOffice = '';
                        sUser.keyPdf = '';
                        sUser.devNotes = '';
                        sUser.devApps = '';
                        sUser.devStatus = 'Không cấp';
                        sUser.devMonitor = '';
                        sUser.devMonitor2 = '';
                        sUser.devMonitorSn = '';
                        sUser.devMonitorSn2 = '';
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
                                const { error } = await supabaseClient.from('thiet_bi').update(dbSource).eq('id', sUser.id);
                                if (error) console.error("Lỗi lưu sourceUser lên Supabase:", error);
                            }
                        } catch (e) {
                            console.warn("Lỗi lưu sourceUser lên Supabase:", e);
                        }
                        saveToLocalStorageFallback('thiet_bi', thietBiList);
                        renderThietBi();
                    }
                }

                resetFormThietBi();
                closeTransferModal();
                showToast('Thành công', `Đã chuyển thiết bị "${devIdentifier}" cùng cấu hình đầy đủ về kho lưu trữ!`, 'success');
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
        if (!requirePermission('canEdit', 'cấp phát thiết bị từ kho cho nhân viên')) return;
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
                const cleanNotes = item.notes.replace(/\[SPECS_JSON:.*?\]/s, '').trim();
                if (cleanNotes) {
                    html += `<strong>Ghi chú / Cấu hình:</strong> ${cleanNotes}`;
                }
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

    // XỬ LÝ CẤP PHÁT TỪ KHO -> NHÂN VIÊN (KHÔI PHỤC ĐẦY ĐỦ CẤU HÌNH)
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

            // Trích xuất cấu hình chi tiết từ ghi chú kho
            const specsObj = extractSpecsFromKhoNotes(khoItem.notes);
            const cleanNotes = (khoItem.notes || '').replace(/\[SPECS_JSON:.*?\]/s, '').trim();

            // 1. Cập nhật ĐẦY ĐỦ CẤU HÌNH cho targetUser
            targetUser.hasDevice = true;
            targetUser.devAllocation = 'yes';
            targetUser.devId = khoItem.code || specsObj.code || '';
            targetUser.maTaiSan = khoItem.maTaiSan || khoItem.assetCode || specsObj.maTaiSan || specsObj.assetCode || '';
            targetUser.assetCode = targetUser.maTaiSan;
            targetUser.assetCompany = khoItem.assetCompany || specsObj.assetCompany || 'ERG';
            targetUser.assetGroup = khoItem.assetGroup || specsObj.assetGroup || 'CCDC';
            targetUser.currentAssetGroup = khoItem.currentAssetGroup || specsObj.currentAssetGroup || targetUser.assetGroup;
            targetUser.assetType = khoItem.assetType || specsObj.assetType || 'LT';
            targetUser.devType = specsObj.devType || khoItem.name || 'PC / Laptop';
            targetUser.devMain = khoItem.devMain || specsObj.devMain || '';
            targetUser.devCpu = khoItem.devCpu || specsObj.devCpu || '';
            targetUser.devRam = khoItem.devRam || specsObj.devRam || '';
            targetUser.devRamSlots = khoItem.devRamSlots || specsObj.devRamSlots || '';
            targetUser.devSsd = khoItem.devSsd || specsObj.devSsd || '';
            targetUser.devSsd2 = specsObj.devSsd2 || '';
            targetUser.devHdd = khoItem.devHdd || specsObj.devHdd || '';
            targetUser.devHdd2 = specsObj.devHdd2 || '';
            targetUser.devVga = khoItem.devVga || specsObj.devVga || '';
            targetUser.devMonitor = khoItem.devMonitor || specsObj.devMonitor || '';
            targetUser.devMonitor2 = specsObj.devMonitor2 || '';
            targetUser.devMonitorSn = khoItem.devMonitorSn || specsObj.devMonitorSn || '';
            targetUser.devMonitorSn2 = specsObj.devMonitorSn2 || '';
            targetUser.monitorSize = khoItem.monitorSize || specsObj.monitorSize || '';
            targetUser.warrantyEndDate = khoItem.warrantyEndDate || specsObj.warrantyEndDate || '';
            targetUser.devSn = khoItem.devSn || specsObj.devSn || khoItem.serial || specsObj.serial || '';
            targetUser.devKeyboard = specsObj.devKeyboard || '';
            targetUser.devMouse = specsObj.devMouse || '';
            targetUser.devCables = khoItem.devCables || specsObj.devCables || '';
            targetUser.keyWin = specsObj.keyWin || '';
            targetUser.keyOffice = specsObj.keyOffice || '';
            targetUser.keyPdf = specsObj.keyPdf || '';
            targetUser.devApps = specsObj.devApps || '';
            targetUser.devStatus = khoItem.status || specsObj.devStatus || 'Mới';
            targetUser.devNotes = cleanNotes ? `Xuất từ kho: ${cleanNotes}` : 'Xuất từ kho thiết bị';
            targetUser.updatedAt = formattedDate;

            if (!targetUser.history) targetUser.history = [];
            targetUser.history.push({
                time: formattedDate,
                action: 'Nhận cấp phát từ kho',
                details: `Nhận cấp phát thiết bị <strong>${khoItem.code || khoItem.name}</strong> (${targetUser.devCpu ? targetUser.devCpu + ', ' : ''}${targetUser.devRam ? 'RAM ' + targetUser.devRam : ''}) xuất từ Kho lưu trữ thiết bị.`
            });

            // Lưu targetUser lên Supabase
            try {
                const dbTarget = mappers.thietBi.toDB(targetUser);
                if (supabaseClient && targetUser.id && !String(targetUser.id).startsWith('local-')) {
                    const { error } = await supabaseClient.from('thiet_bi').update(dbTarget).eq('id', targetUser.id);
                    if (error) console.error("Lỗi cập nhật targetUser từ kho lên Supabase:", error);
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

            showToast('Thành công', `Đã xuất cấp thiết bị "${khoItem.code || khoItem.name}" cùng cấu hình đầy đủ từ kho cho nhân viên ${targetUser.userName} (${targetUser.userId})!`, 'success');
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

            const cleanNotes = (item.notes || '').replace(/\[SPECS_JSON:.*?\]/s, '').trim();

            card.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 4px; flex-grow: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span class="badge badge-blue" style="font-weight: 700;">${item.code || 'MÃ KHO'}</span>
                        <strong style="font-size: 14px; color: #f8fafc;">${item.name || 'Thiết bị kho'}</strong>
                        <span style="background: rgba(234, 179, 8, 0.15); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.3); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">SL: ${item.quantity || 1}</span>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
                        ${cleanNotes ? `<strong>Ghi chú / Cấu hình:</strong> ${cleanNotes}<br>` : ''}
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

        // Trích xuất cấu hình chi tiết từ notes
        const specsObj = extractSpecsFromKhoNotes(khoItem.notes);
        const cleanNotes = (khoItem.notes || '').replace(/\[SPECS_JSON:.*?\]/s, '').trim();

        // 2. Điền ĐẦY ĐỦ 100% CẤU HÌNH vào form
        if (devIdInput) devIdInput.value = khoItem.code || '';
        const devTypeInput = document.getElementById('dev-type');
        if (devTypeInput) devTypeInput.value = specsObj.devType || khoItem.name || 'PC / Laptop';

        if (document.getElementById('dev-main')) document.getElementById('dev-main').value = specsObj.devMain || '';
        if (document.getElementById('dev-cpu')) document.getElementById('dev-cpu').value = specsObj.devCpu || '';
        if (document.getElementById('dev-ram')) document.getElementById('dev-ram').value = specsObj.devRam || '';
        if (document.getElementById('dev-ram-slots')) document.getElementById('dev-ram-slots').value = specsObj.devRamSlots || '';
        if (document.getElementById('dev-ssd')) document.getElementById('dev-ssd').value = (specsObj.devSsd || '').toString().replace(/GB/i, '');
        if (document.getElementById('dev-ssd-2')) document.getElementById('dev-ssd-2').value = (specsObj.devSsd2 || '').toString().replace(/GB/i, '');
        if (document.getElementById('dev-hdd')) document.getElementById('dev-hdd').value = specsObj.devHdd || '';
        if (document.getElementById('dev-hdd-2')) document.getElementById('dev-hdd-2').value = specsObj.devHdd2 || '';
        if (document.getElementById('dev-vga')) document.getElementById('dev-vga').value = specsObj.devVga || '';
        if (document.getElementById('dev-monitor')) document.getElementById('dev-monitor').value = specsObj.devMonitor || '';
        if (document.getElementById('dev-monitor-2')) document.getElementById('dev-monitor-2').value = specsObj.devMonitor2 || '';
        if (document.getElementById('dev-monitor-sn')) document.getElementById('dev-monitor-sn').value = specsObj.devMonitorSn || '';
        if (document.getElementById('dev-monitor-sn-2')) document.getElementById('dev-monitor-sn-2').value = specsObj.devMonitorSn2 || '';
        if (document.getElementById('dev-sn')) document.getElementById('dev-sn').value = specsObj.devSn || '';
        if (document.getElementById('dev-keyboard')) document.getElementById('dev-keyboard').value = specsObj.devKeyboard || '';
        if (document.getElementById('dev-mouse')) document.getElementById('dev-mouse').value = specsObj.devMouse || '';
        if (document.getElementById('dev-cables')) document.getElementById('dev-cables').value = specsObj.devCables || '';
        if (document.getElementById('key-win')) document.getElementById('key-win').value = specsObj.keyWin || '';
        if (document.getElementById('key-office')) document.getElementById('key-office').value = specsObj.keyOffice || '';
        if (document.getElementById('key-pdf')) document.getElementById('key-pdf').value = specsObj.keyPdf || '';
        if (document.getElementById('dev-apps')) document.getElementById('dev-apps').value = specsObj.devApps || '';
        if (document.getElementById('dev-status')) document.getElementById('dev-status').value = specsObj.devStatus || 'Mới';

        const devNotesInput = document.getElementById('dev-notes');
        if (devNotesInput) devNotesInput.value = cleanNotes ? `Xuất từ kho: ${cleanNotes}` : 'Xuất từ kho thiết bị';

        // Lưu chỉ số thiết bị kho đang chờ trừ số lượng khi Lưu Form
        pendingKhoIndexToDeduct = index;

        closeReceiveFromKhoModal();
        showToast('Đã chọn thiết bị', `Đã điền đầy đủ cấu hình thiết bị "${khoItem.code || khoItem.name}" từ kho vào form!`, 'success');
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

    const cardDashUsers = document.getElementById('card-dash-users');
    if (cardDashUsers) {
        cardDashUsers.addEventListener('click', () => switchToTab('tab-cap-phat-list'));
    }

    const cardDashKho = document.getElementById('card-dash-kho');
    if (cardDashKho) cardDashKho.addEventListener('click', () => switchToTab('tab-kho-thiet-bi'));

    // Tìm kiếm lịch sử hoạt động gần đây trên Dashboard
    const searchRecentActivity = document.getElementById('search-recent-activity');
    const btnClearRecentActivity = document.getElementById('btn-clear-recent-activity');

    if (searchRecentActivity) {
        searchRecentActivity.addEventListener('input', (e) => {
            renderRecentActivity(e.target.value);
        });
        searchRecentActivity.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchRecentActivity.value = '';
                renderRecentActivity('');
            }
        });
    }

    if (btnClearRecentActivity && searchRecentActivity) {
        btnClearRecentActivity.addEventListener('click', () => {
            searchRecentActivity.value = '';
            renderRecentActivity('');
            searchRecentActivity.focus();
        });
    }

    // Thêm thông tin Modal Popup & Actions
    function openAddInfoAction(action) {
        const modal = document.getElementById('modal-add-info-options');
        if (modal) modal.style.display = 'none';

        if (!requirePermission('canAdd', 'thêm mới dữ liệu')) return;

        let targetTabId = '';
        let resetFn = null;

        if (action === 'add-cap-phat') {
            targetTabId = 'tab-cap-phat-form';
            resetFn = typeof resetFormThietBi === 'function' ? resetFormThietBi : null;
        } else if (action === 'add-cong-ty') {
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
        } else if (action === 'add-phan-quyen') {
            targetTabId = 'tab-phan-quyen';
            resetFn = typeof resetFormPhanQuyen === 'function' ? resetFormPhanQuyen : null;
        }

        if (targetTabId) {
            if (!canAccessTab(targetTabId)) {
                showToast('Giới hạn phân quyền', 'Tài khoản của bạn không được cấp quyền truy cập mục này!', 'warning');
                return;
            }
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
            if (!requirePermission('canAdd', 'thêm mới dữ liệu')) return;
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
    // 5.6 ENTERPRISE SUITE: THEME TOGGLE, DEPRECIATION, QR TAG, MAINTENANCE & OFFBOARDING
    // =========================================================================

    // 1. THEME TOGGLE (DARK / LIGHT MODE)
    function initTheme() {
        const savedTheme = localStorage.getItem('eras_asset_theme') || 'dark';
        const btnThemeToggle = document.getElementById('btn-theme-toggle');
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            if (btnThemeToggle) {
                btnThemeToggle.innerHTML = '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';
                btnThemeToggle.title = 'Chuyển sang Chế độ Tối (Dark Mode)';
            }
        } else {
            document.body.classList.remove('light-theme');
            if (btnThemeToggle) {
                btnThemeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
                btnThemeToggle.title = 'Chuyển sang Chế độ Sáng (Light Mode)';
            }
        }

        if (btnThemeToggle && !btnThemeToggle.dataset.boundTheme) {
            btnThemeToggle.dataset.boundTheme = 'true';
            btnThemeToggle.addEventListener('click', () => {
                const isLight = document.body.classList.toggle('light-theme');
                if (isLight) {
                    btnThemeToggle.innerHTML = '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';
                    btnThemeToggle.title = 'Chuyển sang Chế độ Tối (Dark Mode)';
                    localStorage.setItem('eras_asset_theme', 'light');
                    showToast('Chế độ Sáng', 'Đã chuyển sang giao diện Chế độ Sáng (Light Mode)', 'info');
                } else {
                    btnThemeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
                    btnThemeToggle.title = 'Chuyển sang Chế độ Sáng (Light Mode)';
                    localStorage.setItem('eras_asset_theme', 'dark');
                    showToast('Chế độ Tối', 'Đã chuyển sang giao diện Chế độ Tối (Dark Mode)', 'info');
                }
            });
        }
    }

    // 2. DEPRECIATION ALGORITHM
    function calculateDeviceDepreciation(item) {
        if (!item) return { originalPrice: 0, residualValue: 0, depreciationRate: 0, monthsElapsed: 0 };
        const priceStr = (item.purchasePrice || '').toString().replace(/[^0-9]/g, '');
        const price = parseFloat(priceStr) || 0;
        if (price <= 0) {
            return { originalPrice: 0, residualValue: 0, depreciationRate: 0, monthsElapsed: 0 };
        }
        const years = parseInt(item.depreciationYears) || 3;
        const totalMonths = Math.max(1, years * 12);

        let pDate = null;
        const dateStr = (item.purchaseDate || '').trim();
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                pDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        } else if (dateStr.includes('-')) {
            pDate = new Date(dateStr);
        }

        if (!pDate || isNaN(pDate.getTime())) {
            pDate = new Date();
        }

        const now = new Date();
        let monthsElapsed = (now.getFullYear() - pDate.getFullYear()) * 12 + (now.getMonth() - pDate.getMonth());
        if (monthsElapsed < 0) monthsElapsed = 0;

        const monthlyRate = price / totalMonths;
        const accumulatedDep = Math.min(price, Math.round(monthlyRate * monthsElapsed));
        const residualValue = Math.max(0, price - accumulatedDep);
        const depRate = Math.min(100, Math.round((accumulatedDep / price) * 100));

        return {
            originalPrice: price,
            residualValue: residualValue,
            depreciationRate: depRate,
            monthsElapsed: monthsElapsed
        };
    }

    // 3. ASSET QR TAGGING & LABEL PRINTING
    let currentQrCodeInstance = null;
    let currentQrModalItem = null;
    let currentQrModalMode = 'text';
    let currentQrModalIsKho = false;

    // Helper: Determine Web Lookup Base URL for QR codes
    function getAssetLookupBaseUrl() {
        const savedUrl = localStorage.getItem('asset_qr_base_url');
        if (savedUrl && savedUrl.trim()) {
            return savedUrl.trim().replace(/\/+$/, '');
        }
        if (window.location.protocol.startsWith('http')) {
            const host = window.location.hostname;
            if (host && host !== 'localhost' && host !== '127.0.0.1') {
                return window.location.origin;
            }
        }
        // Fallback default LAN IP for mobile phone camera scanning
        return 'http://172.16.70.29:8080';
    }

    // Unified QR Modal Renderer
    function renderQrModalContent() {
        const item = currentQrModalItem;
        if (!item) return;

        const isKho = currentQrModalIsKho;
        const assetCodeVal = item.maTaiSan || item.assetCode || item.code || item.devId || 'ERG-ASSET';
        const devIdVal = item.devId || item.code || '';
        const companyVal = item.assetCompany || 'ERG';
        const groupVal = item.currentAssetGroup || item.assetGroup || 'CCDC';

        // 1. Badge & Codes
        const badgeGroup = document.getElementById('tag-badge-group');
        if (badgeGroup) badgeGroup.innerText = `${companyVal} • ${groupVal}`;

        const tagCode = document.getElementById('tag-device-code');
        if (tagCode) tagCode.innerText = assetCodeVal;

        const tagDevId = document.getElementById('tag-device-id');
        if (tagDevId) {
            tagDevId.innerText = (devIdVal && devIdVal !== assetCodeVal) ? `(${devIdVal})` : '';
        }

        const qrSubcode = document.getElementById('tag-qr-subcode');
        if (qrSubcode) qrSubcode.innerText = assetCodeVal;

        // 2. Full Device Name (Allow wrapping, no 1-line truncation)
        const tagName = document.getElementById('tag-device-name');
        if (tagName) {
            let fullName = item.name;
            if (!fullName) {
                fullName = [item.devType, item.devMain, item.devCpu].filter(Boolean).join(' ');
            }
            tagName.innerText = fullName || 'Máy tính làm việc';
        }

        // 3. Hardware Specs
        const cpuEl = document.getElementById('tag-spec-cpu');
        if (cpuEl) cpuEl.innerText = item.devCpu || '—';

        const ramEl = document.getElementById('tag-spec-ram');
        if (ramEl) {
            let ramStr = item.devRam || '—';
            if (ramStr !== '—' && !ramStr.toLowerCase().includes('gb') && !isNaN(ramStr)) ramStr += 'GB';
            ramEl.innerText = ramStr;
        }

        const ssdEl = document.getElementById('tag-spec-ssd');
        if (ssdEl) {
            const storages = [item.devSsd, item.devSsd2, item.devHdd ? 'HDD ' + item.devHdd : ''].filter(Boolean);
            ssdEl.innerText = storages.join(' + ') || '—';
        }

        const monEl = document.getElementById('tag-spec-monitor');
        if (monEl) {
            const monitors = [item.devMonitor, item.devMonitor2].filter(Boolean);
            let monStr = monitors.join(' | ');
            if (!monStr && item.monitorSize) monStr = `${item.monitorSize}`;
            monEl.innerText = monStr || 'Theo máy';
        }

        const snVal = item.devSn || item.serial || '—';
        const snEl = document.getElementById('tag-serial-num');
        if (snEl) snEl.innerText = `SN: ${snVal}`;

        // 4. Allocation / User Info
        const tagUser = document.getElementById('tag-user-name');
        if (tagUser) {
            tagUser.innerText = isKho ? 'LƯU KHO' : (item.userName || 'Chưa cấp phát');
        }

        const tagDept = document.getElementById('tag-user-dept');
        if (tagDept) {
            tagDept.innerText = isKho ? (item.location ? `Vị trí: ${item.location}` : 'Kho thiết bị IT') : (item.userDept || 'ERAS GROUP');
        }

        // Format dates cleanly with formatDateDMY
        const tagDate = document.getElementById('tag-handover-date');
        if (tagDate) {
            const rawDate = item.purchaseDate || item.dateStored || item.handoverDate || item.updatedAt;
            tagDate.innerText = formatDateDMY(rawDate) || '—';
        }

        const tagWarranty = document.getElementById('tag-warranty-date');
        if (tagWarranty) {
            const rawWarranty = item.warrantyDate || item.warrantyEndDate;
            tagWarranty.innerText = formatDateDMY(rawWarranty) || '—';
        }

        // 5. Generate QR Payload - Quét mã mở trang tra cứu hiển thị Thẻ Tem Nhãn & Cấu hình chi tiết
        const baseUrl = getAssetLookupBaseUrl();
        const qrPayload = `${baseUrl}/tai-san.html?code=${encodeURIComponent(assetCodeVal)}`;

        // 6. Draw QR Code (Supports both qrcode-generator full 40 versions & QRCode.js fallback)
        const qrTarget = document.getElementById('asset-tag-qrcode');
        if (qrTarget) {
            qrTarget.innerHTML = '';
            let rendered = false;

            // Ưu tiên thư viện qrcode-generator
            if (typeof qrcode !== 'undefined') {
                try {
                    const qr = qrcode(0, 'M');
                    qr.addData(qrPayload);
                    qr.make();
                    const dataUrl = qr.createDataURL(4, 1);
                    qrTarget.innerHTML = `<img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; display: block;" alt="QR Code">`;
                    rendered = true;
                } catch (e) {
                    console.warn('qrcode-generator render error:', e);
                }
            }

            // Fallback sang QRCode.js nếu có
            if (!rendered && typeof QRCode !== 'undefined') {
                try {
                    currentQrCodeInstance = new QRCode(qrTarget, {
                        text: qrPayload,
                        width: 98,
                        height: 98,
                        colorDark: '#0f172a',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.L
                    });
                    rendered = true;
                } catch (e) {
                    console.error("QRCode.js render error:", e);
                    qrTarget.innerHTML = `<div style="font-size: 9px; color: #ef4444; padding: 4px; text-align: center; word-break: break-word;">Lỗi sinh QR (${e.message})</div>`;
                }
            }
        }
    }

    function openQrTagModal(index) {
        const item = thietBiList[index];
        if (!item) return;

        currentQrModalItem = item;
        currentQrModalIsKho = false;
        currentQrModalMode = 'text';

        renderQrModalContent();

        const modal = document.getElementById('modal-asset-qr-tag');
        if (modal) modal.classList.remove('hidden');
    }

    function openKhoQrTagModal(index) {
        const item = khoList[index];
        if (!item) return;

        currentQrModalItem = item;
        currentQrModalIsKho = true;
        currentQrModalMode = 'text';

        renderQrModalContent();

        const modal = document.getElementById('modal-asset-qr-tag');
        if (modal) modal.classList.remove('hidden');
    }

    const modalQrTag = document.getElementById('modal-asset-qr-tag');
    const btnCloseQrModal = document.getElementById('btn-close-qr-modal');
    const btnCancelQrModal = document.getElementById('btn-cancel-qr-modal');
    const btnPrintQrTag = document.getElementById('btn-print-qr-tag');
    const btnDownloadQrPng = document.getElementById('btn-download-qr-png');

    if (btnCloseQrModal) btnCloseQrModal.addEventListener('click', () => modalQrTag?.classList.add('hidden'));
    if (btnCancelQrModal) btnCancelQrModal.addEventListener('click', () => modalQrTag?.classList.add('hidden'));
    if (modalQrTag) {
        modalQrTag.addEventListener('click', (e) => {
            if (e.target === modalQrTag) modalQrTag.classList.add('hidden');
        });
    }

    if (btnPrintQrTag) {
        btnPrintQrTag.addEventListener('click', () => {
            // Đảm bảo chỉ in duy nhất mã QR code
            const qrImg = document.querySelector('#asset-tag-qrcode img') || document.querySelector('#asset-tag-qrcode canvas');
            let printContainer = document.getElementById('only-print-qr-container');
            if (!printContainer) {
                printContainer = document.createElement('div');
                printContainer.id = 'only-print-qr-container';
                document.body.appendChild(printContainer);
            }
            if (qrImg) {
                const qrSrc = qrImg.src || (qrImg.toDataURL ? qrImg.toDataURL('image/png') : '');
                printContainer.innerHTML = `<img src="${qrSrc}" alt="Mã QR">`;
            } else {
                printContainer.innerHTML = document.getElementById('asset-tag-qrcode')?.innerHTML || '';
            }
            window.print();
        });
    }

    // 4. MAINTENANCE & UPGRADE LOG
    let currentMaintDeviceIndex = null;

    function openMaintenanceModal(index) {
        const item = thietBiList[index];
        if (!item) return;
        currentMaintDeviceIndex = index;

        const modal = document.getElementById('modal-maintenance-log');
        if (!modal) return;

        const titleEl = document.getElementById('maint-device-title');
        const configEl = document.getElementById('maint-device-config');
        if (titleEl) titleEl.innerText = `${item.userName} (${item.userId}) - ${item.devId || item.devType || 'Thiết bị IT'}`;
        if (configEl) {
            configEl.innerText = `CPU: ${item.devCpu || '—'} | RAM: ${item.devRam || '—'} | SSD: ${item.devSsd || '—'} | Tình trạng: ${item.devStatus || 'Tốt'}`;
        }

        const now = new Date();
        const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        const dateInput = document.getElementById('maint-input-date');
        if (dateInput) dateInput.value = todayStr;

        const costInput = document.getElementById('maint-input-cost');
        const providerInput = document.getElementById('maint-input-provider');
        const descInput = document.getElementById('maint-input-desc');
        if (costInput) costInput.value = '';
        if (providerInput) providerInput.value = 'IT Nội bộ ERAS';
        if (descInput) descInput.value = '';

        renderMaintenanceLogsList(item);
        modal.classList.remove('hidden');
    }

    function renderMaintenanceLogsList(item) {
        const listEl = document.getElementById('maint-records-list');
        const totalEl = document.getElementById('maint-total-cost');
        if (!listEl) return;

        const logs = Array.isArray(item.maintenanceLogs) ? item.maintenanceLogs : [];
        let totalCost = 0;

        if (logs.length === 0) {
            listEl.innerHTML = `
                <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px; font-style: italic; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px dashed var(--border-color);">
                    <i class="fa-solid fa-clipboard-check" style="font-size: 24px; margin-bottom: 8px; display: block; color: var(--brand-green);"></i>
                    Chưa có nhật ký bảo trì hoặc nâng cấp nào cho thiết bị này.
                </div>
            `;
        } else {
            listEl.innerHTML = '';
            [...logs].reverse().forEach((log, revIdx) => {
                const originalLogIdx = logs.length - 1 - revIdx;
                const costNum = parseFloat((log.cost || '').toString().replace(/[^0-9]/g, '')) || 0;
                totalCost += costNum;

                const div = document.createElement('div');
                div.className = 'maint-timeline-item';
                div.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span class="badge badge-green" style="font-weight: 700;">${log.type || 'Bảo trì'}</span>
                            <span style="font-size: 12px; color: var(--text-secondary);"><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i>${log.date || '—'}</span>
                            ${log.provider ? `<span style="font-size: 12px; color: var(--text-muted);"><i class="fa-solid fa-store" style="margin-right: 4px;"></i>${log.provider}</span>` : ''}
                        </div>
                        <div style="font-size: 13px; color: var(--text-primary); margin-top: 2px;">
                            ${log.desc || 'Không có mô tả chi tiết'}
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                        <span style="font-weight: 700; color: var(--brand-green); font-size: 14px;">
                            ${costNum > 0 ? (new Intl.NumberFormat('vi-VN').format(costNum) + ' đ') : 'Miễn phí'}
                        </span>
                        <button type="button" class="btn-icon-only delete btn-delete-maint-record" data-log-index="${originalLogIdx}" title="Xóa lượt ghi này" style="width: 24px; height: 24px; font-size: 11px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
                listEl.appendChild(div);
            });
        }

        if (totalEl) {
            totalEl.innerText = new Intl.NumberFormat('vi-VN').format(totalCost) + ' VNĐ';
        }

        listEl.querySelectorAll('.btn-delete-maint-record').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const logIdx = parseInt(this.getAttribute('data-log-index'));
                deleteMaintenanceRecord(logIdx);
            });
        });
    }

    async function addMaintenanceRecord() {
        if (!requirePermission('canEdit', 'thêm lịch sử bảo trì / nâng cấp')) return;
        if (currentMaintDeviceIndex === null) return;
        const item = thietBiList[currentMaintDeviceIndex];
        if (!item) return;

        const type = document.getElementById('maint-input-type')?.value || 'Bảo trì';
        const date = document.getElementById('maint-input-date')?.value.trim();
        const cost = document.getElementById('maint-input-cost')?.value.trim() || '0';
        const provider = document.getElementById('maint-input-provider')?.value.trim() || 'IT Nội bộ';
        const desc = document.getElementById('maint-input-desc')?.value.trim();

        if (!date) {
            showToast('Thiếu thông tin', 'Vui lòng nhập ngày thực hiện!', 'warning');
            return;
        }
        if (!desc) {
            showToast('Thiếu thông tin', 'Vui lòng nhập chi tiết nội dung bảo trì / linh kiện thay thế!', 'warning');
            return;
        }

        if (!Array.isArray(item.maintenanceLogs)) {
            item.maintenanceLogs = [];
        }

        const newRecord = {
            id: Date.now(),
            type: type,
            date: date,
            cost: cost,
            provider: provider,
            desc: desc
        };

        item.maintenanceLogs.push(newRecord);

        const extraKey = item.devId || item.userId || item.id;
        saveDeviceExtras(extraKey, {
            maintenanceLogs: item.maintenanceLogs
        });

        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} lúc ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (!Array.isArray(item.history)) item.history = [];
        item.history.push({
            time: formattedDate,
            action: 'Bảo trì / Nâng cấp',
            details: `${type} ngày ${date}: ${desc} - Chi phí: ${cost} đ (Đơn vị: ${provider})`
        });

        saveToLocalStorageFallback('thiet_bi', thietBiList);

        try {
            if (supabaseClient && item.id && !item.id.toString().startsWith('local-')) {
                const dbData = mappers.thietBi.toDB(item);
                await supabaseClient.from('thiet_bi').update(dbData).eq('id', item.id);
            }
        } catch (e) {
            console.warn('Sync maintenance to DB error:', e);
        }

        const descInput = document.getElementById('maint-input-desc');
        const costInput = document.getElementById('maint-input-cost');
        if (descInput) descInput.value = '';
        if (costInput) costInput.value = '';

        renderMaintenanceLogsList(item);
        showToast('Thành công', 'Đã thêm lượt bảo trì mới vào hồ sơ thiết bị!', 'success');
    }

    function deleteMaintenanceRecord(logIdx) {
        if (!requirePermission('canDelete', 'xóa lịch sử bảo trì')) return;
        if (currentMaintDeviceIndex === null) return;
        const item = thietBiList[currentMaintDeviceIndex];
        if (!item || !Array.isArray(item.maintenanceLogs)) return;

        if (confirm('Bạn có chắc chắn muốn xóa lượt ghi bảo trì này?')) {
            item.maintenanceLogs.splice(logIdx, 1);
            const extraKey = item.devId || item.userId || item.id;
            saveDeviceExtras(extraKey, {
                maintenanceLogs: item.maintenanceLogs
            });
            saveToLocalStorageFallback('thiet_bi', thietBiList);
            renderMaintenanceLogsList(item);
            showToast('Đã xóa', 'Đã xóa lượt ghi bảo trì!', 'info');
        }
    }

    const modalMaintLog = document.getElementById('modal-maintenance-log');
    const btnCloseMaintModal = document.getElementById('btn-close-maint-modal');
    const btnCloseMaintBottom = document.getElementById('btn-close-maint-modal-bottom');
    const btnAddMaintRecord = document.getElementById('btn-add-maint-record');

    if (btnCloseMaintModal) btnCloseMaintModal.addEventListener('click', () => modalMaintLog?.classList.add('hidden'));
    if (btnCloseMaintBottom) btnCloseMaintBottom.addEventListener('click', () => modalMaintLog?.classList.add('hidden'));
    if (btnAddMaintRecord) btnAddMaintRecord.addEventListener('click', addMaintenanceRecord);
    if (modalMaintLog) {
        modalMaintLog.addEventListener('click', (e) => {
            if (e.target === modalMaintLog) modalMaintLog.classList.add('hidden');
        });
    }

    // 5. OFFBOARDING CHECKLIST & 1-CLICK RETURN TO WAREHOUSE
    let currentOffboardIndex = null;

    function openOffboardModal(index) {
        if (!requirePermission('canEdit', 'thu hồi nghỉ việc / vô hiệu hóa tài khoản')) return;
        const item = thietBiList[index];
        if (!item) return;
        currentOffboardIndex = index;

        const modal = document.getElementById('modal-offboarding-checklist');
        if (!modal) return;

        const userLabel = document.getElementById('offboard-user-name');
        const deptLabel = document.getElementById('offboard-user-dept');
        const checklistContainer = document.getElementById('offboard-checklist-items');
        const conditionContainer = document.getElementById('offboard-device-condition-container');
        const conditionSelect = document.getElementById('offboard-device-condition');
        const notesInput = document.getElementById('offboard-notes');
        const modalTitle = modal.querySelector('.backup-modal-title');
        const btnConfirm = document.getElementById('btn-confirm-offboard');
        const btnConfirmText = document.getElementById('btn-confirm-offboard-text');
        const btnConfirmIcon = document.getElementById('btn-confirm-offboard-icon');
        const btnReEnable = document.getElementById('btn-re-enable-offboard');

        const hadDevice = item.hasDevice || !!item.devId || !!item.devCpu;

        if (userLabel) userLabel.innerText = `${item.userName} (Mã NV: ${item.userId})`;
        if (deptLabel) deptLabel.innerText = `Phòng ban: ${item.userDept || '—'} | Chức danh: ${item.userTitle || '—'} | Trạng thái: ${item.userDisabled ? '🔴 Đã vô hiệu hóa (Offline)' : '🟢 Đang hoạt động (Online)'}`;

        if (modalTitle) {
            if (item.userDisabled) {
                modalTitle.innerHTML = `<i class="fa-solid fa-user-lock"></i> Chi Tiết Hồ Sơ Vô Hiệu Hóa / Nghỉ Việc`;
            } else if (hadDevice) {
                modalTitle.innerHTML = `<i class="fa-solid fa-user-xmark"></i> Quy Trình Thu Hồi Thiết Bị (Offboarding)`;
            } else {
                modalTitle.innerHTML = `<i class="fa-solid fa-user-xmark"></i> Quy Trình Vô Hiệu Hóa Tài Khoản (Thiết Bị Cá Nhân)`;
            }
        }

        if (conditionContainer) {
            conditionContainer.style.display = hadDevice ? 'grid' : 'none';
        }

        if (conditionSelect) conditionSelect.value = 'Sẵn sàng cấp phát';
        if (notesInput) {
            notesInput.value = hadDevice 
                ? `Thu hồi đầy đủ thiết bị và phụ kiện khi nhân sự bàn giao nghỉ việc.`
                : `Nhân sự sử dụng thiết bị cá nhân - Đã thu hồi toàn bộ tài khoản và bàn giao công việc.`;
        }

        if (btnConfirm) {
            btnConfirm.style.display = item.userDisabled ? 'none' : 'inline-flex';
        }
        if (btnConfirmText) {
            btnConfirmText.innerText = hadDevice ? 'Xác Nhận Thu Hồi Về Kho' : 'Xác Nhận Vô Hiệu Hóa Tài Khoản';
        }
        if (btnConfirmIcon) {
            btnConfirmIcon.className = hadDevice ? 'fa-solid fa-boxes-stacked' : 'fa-solid fa-user-xmark';
        }

        if (btnReEnable) {
            btnReEnable.style.display = item.userDisabled ? 'inline-flex' : 'none';
        }

        const itemsToRecover = [];
        if (item.devId || item.devCpu || item.devRam) {
            itemsToRecover.push({
                id: 'chk-device',
                label: `Thân máy: ${item.devType || 'Máy tính'} (Mã TB: ${item.devId || 'Chưa gán'}) - Cấu hình: ${[item.devCpu, item.devRam, item.devSsd].filter(Boolean).join(' / ')}`,
                checked: true
            });
        }
        if (item.devMonitor) {
            itemsToRecover.push({
                id: 'chk-mon1',
                label: `Màn hình 1: ${item.devMonitor}${item.devMonitorSn ? ` (S/N: ${item.devMonitorSn})` : ''}`,
                checked: true
            });
        }
        if (item.devMonitor2) {
            itemsToRecover.push({
                id: 'chk-mon2',
                label: `Màn hình 2: ${item.devMonitor2}${item.devMonitorSn2 ? ` (S/N: ${item.devMonitorSn2})` : ''}`,
                checked: true
            });
        }
        if (item.devKeyboard || item.devMouse) {
            itemsToRecover.push({
                id: 'chk-km',
                label: `Phụ kiện: ${[item.devKeyboard, item.devMouse].filter(Boolean).join(' + ')}`,
                checked: true
            });
        }
        if (item.devCables) {
            itemsToRecover.push({
                id: 'chk-cables',
                label: `Dây sạc / Dây nguồn / Cáp tín hiệu: ${item.devCables}`,
                checked: true
            });
        }
        if (!hadDevice) {
            itemsToRecover.push({
                id: 'chk-personal-dev',
                label: `Thiết bị làm việc: Nhân sự sử dụng thiết bị cá nhân (Không có tài sản công ty cần thu hồi)`,
                checked: true
            });
        }
        itemsToRecover.push({
            id: 'chk-account',
            label: `Tài khoản & Phân quyền: Đã thu hồi Email/ERP/VPN và đổi mật khẩu truy cập`,
            checked: true
        });
        itemsToRecover.push({
            id: 'chk-data',
            label: `Dữ liệu công việc: Đã sao lưu dữ liệu máy và bàn giao cho Trưởng bộ phận`,
            checked: true
        });

        if (checklistContainer) {
            checklistContainer.innerHTML = itemsToRecover.map(it => `
                <label class="offboard-chk-row">
                    <input type="checkbox" id="${it.id}" ${it.checked ? 'checked' : ''} ${item.userDisabled ? 'disabled' : ''}>
                    <span style="color: var(--text-primary); font-size: 13px;">${it.label}</span>
                </label>
            `).join('');
        }

        modal.classList.remove('hidden');
    }

    async function reEnableUser(index) {
        if (index === null || index === undefined) return;
        const item = thietBiList[index];
        if (!item) return;

        item.userDisabled = false;
        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} lúc ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (!Array.isArray(item.history)) item.history = [];
        item.history.push({
            time: formattedDate,
            action: 'Kích hoạt lại tài khoản',
            details: `Đã mở khóa / kích hoạt lại tài khoản nhân sự hoạt động bình thường (Online).`
        });
        item.updatedAt = formattedDate;

        saveToLocalStorageFallback('thiet_bi', thietBiList);
        try {
            if (supabaseClient && item.id && !item.id.toString().startsWith('local-')) {
                const dbData = mappers.thietBi.toDB(item);
                await supabaseClient.from('thiet_bi').update(dbData).eq('id', item.id);
            }
        } catch (e) {
            console.warn('User update error:', e);
        }

        const modal = document.getElementById('modal-offboarding-checklist');
        if (modal) modal.classList.add('hidden');

        renderThietBi();
        renderDashboard();

        showToast('Kích hoạt thành công', `Đã mở khóa và kích hoạt lại tài khoản cho ${item.userName} (Online)!`, 'success');
    }

    async function confirmOffboarding() {
        if (currentOffboardIndex === null) return;
        const item = thietBiList[currentOffboardIndex];
        if (!item) return;

        const condition = document.getElementById('offboard-device-condition')?.value || 'Sẵn sàng cấp phát';
        const notes = document.getElementById('offboard-notes')?.value.trim() || '';

        const hadDevice = item.hasDevice || !!item.devId || !!item.devCpu;
        const oldDevId = item.devId || '';
        const oldDevType = item.devType || 'Máy tính';
        const oldSpecs = [item.devMain, item.devCpu, item.devRam, item.devSsd, item.devHdd, item.devVga].filter(Boolean).join(' | ');

        item.userDisabled = true;

        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} lúc ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (hadDevice) {
            const newKhoItem = {
                id: 'kho-' + Date.now(),
                code: oldDevId || item.maTaiSan || ('KHO-' + Date.now()),
                assetCode: item.maTaiSan || item.assetCode || '',
                maTaiSan: item.maTaiSan || item.assetCode || '',
                assetCompany: item.assetCompany || 'ERG',
                assetGroup: item.assetGroup || 'CCDC',
                currentAssetGroup: item.currentAssetGroup || item.assetGroup || 'CCDC',
                assetType: item.assetType || 'LT',
                name: `${oldDevType} (Thu hồi từ ${item.userName})`,
                type: oldDevType,
                status: condition,
                quantity: 1,
                unit: 'Chiếc',
                serial: item.devSn || '',
                devSn: item.devSn || '',
                devCpu: item.devCpu || '',
                devRam: item.devRam || '',
                devRamSlots: item.devRamSlots || '',
                devSsd: item.devSsd || '',
                devHdd: item.devHdd || '',
                devVga: item.devVga || '',
                devMain: item.devMain || '',
                devMonitor: item.devMonitor || '',
                monitorSize: item.monitorSize || '',
                devCables: item.devCables || '',
                warrantyEndDate: item.warrantyEndDate || '',
                reason: `Thu hồi từ nhân sự ${item.userName} (${item.userId})`,
                dateStored: formattedDate.split(' lúc ')[0],
                config: oldSpecs,
                origin: `Thu hồi từ nhân sự ${item.userName} (${item.userId})`,
                notes: `[Thu hồi nghỉ việc]: ${notes}`,
                updatedAt: formattedDate
            };

            if (typeof khoList !== 'undefined') {
                khoList.push(newKhoItem);
                saveToLocalStorageFallback('kho_thiet_bi', khoList);
                try {
                    if (supabaseClient && mappers && mappers.khoThietBi) {
                        const dbKho = mappers.khoThietBi.toDB(newKhoItem);
                        const { data: insertedKho, error } = await supabaseClient.from('kho_thiet_bi').insert([dbKho]).select();
                        if (!error && insertedKho && insertedKho.length > 0) {
                            khoList[khoList.length - 1] = mappers.khoThietBi.fromDB(insertedKho[0]);
                        }
                    }
                } catch (e) {
                    console.warn('Kho insert error:', e);
                }
            }

            item.devAllocation = 'no';
            item.hasDevice = false;
            item.devId = '';
            item.devStatus = 'Không cấp';
            item.devNotes = (item.devNotes ? item.devNotes + '\n' : '') + `[${formattedDate}] Đã thu hồi toàn bộ thiết bị về Kho. Ghi chú: ${notes}`;
        }

        if (!Array.isArray(item.history)) item.history = [];
        item.history.push({
            time: formattedDate,
            action: 'Thu hồi nghỉ việc (Offboarding)',
            details: hadDevice 
                ? `Đã hoàn tất quy trình thu hồi thiết bị ${oldDevId} về Kho (Tình trạng: "${condition}"). Vô hiệu hóa tài khoản nhân sự.`
                : `Đã hoàn tất checklist bàn giao nghỉ việc và vô hiệu hóa tài khoản.`
        });
        item.updatedAt = formattedDate;

        saveToLocalStorageFallback('thiet_bi', thietBiList);
        try {
            if (supabaseClient && item.id && !item.id.toString().startsWith('local-')) {
                const dbData = mappers.thietBi.toDB(item);
                await supabaseClient.from('thiet_bi').update(dbData).eq('id', item.id);
            }
        } catch (e) {
            console.warn('User update error:', e);
        }

        const modal = document.getElementById('modal-offboarding-checklist');
        if (modal) modal.classList.add('hidden');

        renderThietBi();
        if (typeof renderKhoThietBi === 'function') renderKhoThietBi();
        renderDashboard();

        showToast(
            hadDevice ? 'Thu hồi thành công' : 'Vô hiệu hóa thành công',
            hadDevice 
                ? `Đã hoàn tất quy trình offboarding cho ${item.userName} và nhập thiết bị về Kho!`
                : `Đã vô hiệu hóa tài khoản cho nhân sự ${item.userName}!`,
            'success'
        );
    }

    const modalOffboard = document.getElementById('modal-offboarding-checklist');
    const btnCloseOffboardModal = document.getElementById('btn-close-offboarding-modal');
    const btnCancelOffboardModal = document.getElementById('btn-cancel-offboard-modal');
    const btnConfirmOffboard = document.getElementById('btn-confirm-offboard');
    const btnReEnableOffboard = document.getElementById('btn-re-enable-offboard');

    if (btnCloseOffboardModal) btnCloseOffboardModal.addEventListener('click', () => modalOffboard?.classList.add('hidden'));
    if (btnCancelOffboardModal) btnCancelOffboardModal.addEventListener('click', () => modalOffboard?.classList.add('hidden'));
    if (btnConfirmOffboard) btnConfirmOffboard.addEventListener('click', confirmOffboarding);
    if (btnReEnableOffboard) {
        btnReEnableOffboard.addEventListener('click', () => {
            if (currentOffboardIndex !== null) {
                reEnableUser(currentOffboardIndex);
            }
        });
    }
    if (modalOffboard) {
        modalOffboard.addEventListener('click', (e) => {
            if (e.target === modalOffboard) modalOffboard.classList.add('hidden');
        });
    }

    // =========================================================================
    // 5.7 AUTOMATIC ASSET CODE ENGINE (ERG-[NHÓM]-[LOẠI]-[STT]) & SETTINGS
    // =========================================================================

    // 1. System Prefix & Asset Types Catalog Management
    function getAssetPrefix() {
        return (localStorage.getItem('eras_asset_prefix') || 'ERG').trim().toUpperCase();
    }

    function setAssetPrefix(prefix) {
        const clean = (prefix || 'ERG').trim().toUpperCase();
        localStorage.setItem('eras_asset_prefix', clean);
        return clean;
    }

    function getAssetTypes() {
        try {
            const raw = localStorage.getItem('eras_asset_types');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list) && list.length > 0) return list;
            }
        } catch (e) {
            console.warn('Error reading asset types:', e);
        }
        const defaultTypes = [
            { code: 'PC', name: 'Máy tính để bàn' },
            { code: 'LT', name: 'Laptop' },
            { code: 'MH', name: 'Màn hình' }
        ];
        localStorage.setItem('eras_asset_types', JSON.stringify(defaultTypes));
        return defaultTypes;
    }

    function saveAssetTypes(typesList) {
        localStorage.setItem('eras_asset_types', JSON.stringify(typesList));
        populateAssetTypeDropdowns();
        renderAssetTypesTable();
    }

    function populateAssetTypeDropdowns() {
        const types = getAssetTypes();
        const selects = ['dev-asset-type', 'batch-asset-type', 'kho-asset-type'];
        selects.forEach(selId => {
            const el = document.getElementById(selId);
            if (!el) return;
            const currentVal = el.value;
            el.innerHTML = types.map(t => `<option value="${t.code}">${t.code} - ${t.name}</option>`).join('');
            if (types.some(t => t.code === currentVal)) {
                el.value = currentVal;
            }
        });
    }

    function renderAssetTypesTable() {
        const tbody = document.getElementById('tbody-asset-types');
        if (!tbody) return;
        const types = getAssetTypes();
        tbody.innerHTML = types.map((t, i) => `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 12px; font-family: monospace; font-weight: 700; color: var(--brand-green);">${t.code}</td>
                <td style="padding: 8px 12px; color: var(--text-primary);">${t.name}</td>
                <td style="padding: 8px 12px; text-align: center;">
                    ${['PC', 'LT', 'MH'].includes(t.code) ? `
                        <span style="font-size: 11px; color: var(--text-muted); font-style: italic;">Mặc định</span>
                    ` : `
                        <button type="button" class="btn-icon-only delete btn-del-asset-type" data-code="${t.code}" title="Xóa loại này" style="width: 22px; height: 22px; font-size: 10px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `}
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.btn-del-asset-type').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                deleteAssetType(code);
            });
        });
    }

    function addAssetType(code, name) {
        const cleanCode = (code || '').trim().toUpperCase();
        const cleanName = (name || '').trim();

        if (!cleanCode || !/^[A-Z0-9]{2,4}$/.test(cleanCode)) {
            showToast('Lỗi nhập liệu', 'Mã loại phải từ 2-4 ký tự chữ cái in hoa/số (VD: PR, SV, TB)!', 'warning');
            return false;
        }
        if (!cleanName) {
            showToast('Lỗi nhập liệu', 'Vui lòng nhập tên loại tài sản!', 'warning');
            return false;
        }

        const types = getAssetTypes();
        if (types.some(t => t.code === cleanCode)) {
            showToast('Trùng lặp', `Mã loại "${cleanCode}" đã tồn tại trong danh mục!`, 'error');
            return false;
        }

        types.push({ code: cleanCode, name: cleanName });
        saveAssetTypes(types);
        showToast('Thành công', `Đã thêm loại tài sản "${cleanCode} - ${cleanName}"!`, 'success');
        return true;
    }

    function deleteAssetType(code) {
        let types = getAssetTypes();
        if (confirm(`Bạn có chắc chắn muốn xóa loại tài sản "${code}" khỏi danh mục?`)) {
            types = types.filter(t => t.code !== code);
            saveAssetTypes(types);
            showToast('Đã xóa', `Đã xóa loại tài sản "${code}"!`, 'info');
        }
    }

    // 1.1 Company Datalist Management (ERG, IOM, ERL...)
    function populateAssetCompanyDatalists() {
        const defaultCompanies = ['ERG', 'IOM', 'ERL'];
        const fromCongTyList = (congTyList || []).map(c => (c.code || '').trim().toUpperCase()).filter(Boolean);
        const allCompanies = [...new Set([...defaultCompanies, ...fromCongTyList])];

        const datalistIds = ['list-asset-company', 'list-batch-asset-company'];
        datalistIds.forEach(id => {
            const dl = document.getElementById(id);
            if (!dl) return;
            dl.innerHTML = allCompanies.map(c => `<option value="${c}">${c}</option>`).join('');
        });
    }

    // 2. Sequence Counter & Generator per (company, nhom, loai)
    function formatSeqNumber(num) {
        return num < 1000 ? String(num).padStart(3, '0') : String(num);
    }

    function getNextSequence(company, group, type) {
        const cleanCompany = (company || getAssetPrefix() || 'ERG').trim().toUpperCase();
        const cleanGroup = (group || 'CCDC').trim().toUpperCase();
        const cleanType = (type || 'LT').trim().toUpperCase();
        const key = `${cleanCompany}_${cleanGroup}_${cleanType}`;
        
        let seqMap = {};
        try {
            seqMap = JSON.parse(localStorage.getItem('eras_asset_sequences') || '{}');
        } catch (e) {
            seqMap = {};
        }

        let lastSeq = parseInt(seqMap[key]) || 0;

        // Quét toàn bộ mã đã có trong thietBiList và khoList để luôn lấy số lớn nhất
        const escC = cleanCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escG = cleanGroup.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escT = cleanType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`^${escC}-${escG}-${escT}-(\\d+)$`, 'i');

        const allItems = [...(thietBiList || []), ...(khoList || [])];
        allItems.forEach(item => {
            const c = (item.maTaiSan || item.assetCode || item.code || '').trim();
            const m = c.match(pattern);
            if (m && m[1]) {
                const n = parseInt(m[1]);
                if (n > lastSeq) lastSeq = n;
            }
        });

        // Đảm bảo không trùng các mã đã từng xóa
        try {
            const deleted = JSON.parse(localStorage.getItem('eras_deleted_asset_codes') || '[]');
            deleted.forEach(c => {
                const m = (c || '').match(pattern);
                if (m && m[1]) {
                    const n = parseInt(m[1]);
                    if (n > lastSeq) lastSeq = n;
                }
            });
        } catch (e) {}

        return lastSeq + 1;
    }

    function generateAssetCode(company, group, type) {
        const cleanCompany = (company || getAssetPrefix() || 'ERG').trim().toUpperCase();
        const cleanGroup = (group || 'CCDC').trim().toUpperCase();
        const cleanType = (type || 'LT').trim().toUpperCase();
        const nextSeq = getNextSequence(cleanCompany, cleanGroup, cleanType);
        return `${cleanCompany}-${cleanGroup}-${cleanType}-${formatSeqNumber(nextSeq)}`;
    }

    function generateBatchAssetCodes(company, group, type, count) {
        const cleanCompany = (company || getAssetPrefix() || 'ERG').trim().toUpperCase();
        const cleanGroup = (group || 'CCDC').trim().toUpperCase();
        const cleanType = (type || 'LT').trim().toUpperCase();
        const startSeq = getNextSequence(cleanCompany, cleanGroup, cleanType);
        const codes = [];
        for (let i = 0; i < count; i++) {
            const seq = startSeq + i;
            codes.push({
                seq: seq,
                code: `${cleanCompany}-${cleanGroup}-${cleanType}-${formatSeqNumber(seq)}`
            });
        }
        return codes;
    }

    function commitAssetSequence(company, group, type, fullCodeOrSeq) {
        const cleanCompany = (company || getAssetPrefix() || 'ERG').trim().toUpperCase();
        const cleanGroup = (group || 'CCDC').trim().toUpperCase();
        const cleanType = (type || 'LT').trim().toUpperCase();
        const key = `${cleanCompany}_${cleanGroup}_${cleanType}`;

        let seqNum = 0;
        if (typeof fullCodeOrSeq === 'number') {
            seqNum = fullCodeOrSeq;
        } else if (typeof fullCodeOrSeq === 'string') {
            const parts = fullCodeOrSeq.split('-');
            const lastPart = parts[parts.length - 1];
            seqNum = parseInt(lastPart) || 0;
        }

        if (seqNum > 0) {
            let seqMap = {};
            try {
                seqMap = JSON.parse(localStorage.getItem('eras_asset_sequences') || '{}');
            } catch (e) {}
            if (!seqMap[key] || seqNum > seqMap[key]) {
                seqMap[key] = seqNum;
                localStorage.setItem('eras_asset_sequences', JSON.stringify(seqMap));
            }
        }
    }

    function recordDeletedAssetCode(code, reason) {
        if (!code) return;
        try {
            const list = JSON.parse(localStorage.getItem('eras_deleted_asset_codes') || '[]');
            if (!list.includes(code)) {
                list.push(code);
                localStorage.setItem('eras_deleted_asset_codes', JSON.stringify(list));
            }
        } catch (e) {}
    }

    function refreshFormAssetCode(force = false) {
        const companyEl = document.getElementById('dev-asset-company');
        const groupEl = document.getElementById('dev-asset-group');
        const typeEl = document.getElementById('dev-asset-type');
        const codeInp = document.getElementById('dev-ma-tai-san');
        if (!groupEl || !typeEl || !codeInp) return;

        const isCreate = (!editIndexThietBi || editIndexThietBi.value === '');
        const company = (companyEl?.value || getAssetPrefix() || 'ERG').trim().toUpperCase();

        if (isCreate || force) {
            const code = generateAssetCode(company, groupEl.value, typeEl.value);
            codeInp.value = code;
        } else {
            // Khi đang chỉnh sửa thiết bị đã có:
            // Nếu người dùng đổi Cty, Nhóm hoặc Loại, tự động cập nhật các thành phần tương ứng của mã tài sản
            const curVal = codeInp.value.trim();
            const parts = curVal.split('-');
            if (parts.length >= 4) {
                codeInp.value = `${company}-${groupEl.value}-${typeEl.value}-${parts.slice(3).join('-')}`;
            } else if (!curVal) {
                const code = generateAssetCode(company, groupEl.value, typeEl.value);
                codeInp.value = code;
            }
        }
    }

    function refreshKhoAssetCode(force = false) {
        const companyEl = document.getElementById('kho-asset-company');
        const groupEl = document.getElementById('kho-asset-group');
        const typeEl = document.getElementById('kho-asset-type');
        const codeInp = document.getElementById('kho-ma-tai-san');
        if (!groupEl || !typeEl || !codeInp) return;

        const editIndexKho = document.getElementById('edit-index-kho');
        const isCreate = (!editIndexKho || editIndexKho.value === '');
        const company = (companyEl?.value || getAssetPrefix() || 'ERG').trim().toUpperCase();

        if (isCreate || force) {
            const code = generateAssetCode(company, groupEl.value, typeEl.value);
            codeInp.value = code;
        } else {
            const curVal = codeInp.value.trim();
            const parts = curVal.split('-');
            if (parts.length >= 4) {
                codeInp.value = `${company}-${groupEl.value}-${typeEl.value}-${parts.slice(3).join('-')}`;
            } else if (!curVal) {
                const code = generateAssetCode(company, groupEl.value, typeEl.value);
                codeInp.value = code;
            }
        }
    }

    // 3. Serial Number Validation (Không bắt buộc điền, chỉ kiểm tra không trùng lặp nếu có nhập)
    function validateDeviceSerial(excludeIndex = "") {
        const snInput = document.getElementById('dev-sn');
        const errSn = document.getElementById('err-dev-sn');
        if (!snInput || !errSn) return true;

        const val = snInput.value.trim().toLowerCase();

        // Không bắt buộc điền: nếu để trống thì hợp lệ
        if (!val) {
            errSn.style.display = 'none';
            snInput.style.borderColor = '';
            return true;
        }

        // Nếu có nhập thì kiểm tra trùng lặp với Thiết Bị và Kho
        const dupThietBi = thietBiList.find((item, index) => {
            if (excludeIndex !== "" && index === parseInt(excludeIndex)) return false;
            return (item.devSn || '').trim().toLowerCase() === val;
        });
        const dupKho = (khoList || []).find(item => (item.devSn || item.serial || '').trim().toLowerCase() === val);

        if (dupThietBi || dupKho) {
            const owner = dupThietBi ? `Nhân sự ${dupThietBi.userName} (${dupThietBi.userId})` : 'Kho thiết bị';
            errSn.innerText = `Số Serial đã tồn tại trên hệ thống (đang gán cho ${owner})!`;
            errSn.style.display = 'block';
            snInput.style.borderColor = 'var(--danger-color)';
            return false;
        }

        errSn.style.display = 'none';
        snInput.style.borderColor = '';
        return true;
    }

    // 4. Batch Asset Generation Modal Handlers
    function updateBatchPreview() {
        const company = (document.getElementById('batch-asset-company')?.value || getAssetPrefix() || 'ERG').trim().toUpperCase();
        const group = document.getElementById('batch-asset-group')?.value || 'CCDC';
        const type = document.getElementById('batch-asset-type')?.value || 'LT';
        const qtyInp = document.getElementById('batch-quantity');
        const qty = parseInt(qtyInp ? qtyInp.value : 20) || 1;
        const validQty = Math.min(200, Math.max(1, qty));

        const codes = generateBatchAssetCodes(company, group, type, validQty);
        const previewEl = document.getElementById('batch-preview-codes');
        if (previewEl && codes.length > 0) {
            previewEl.innerHTML = `Từ <strong style="color: var(--brand-green);">${codes[0].code}</strong> đến <strong style="color: var(--brand-green);">${codes[codes.length - 1].code}</strong> (Tổng cộng: <strong>${codes.length}</strong> thiết bị liên tiếp)`;
        }
    }

    async function executeBatchCreate() {
        const company = (document.getElementById('batch-asset-company')?.value || getAssetPrefix() || 'ERG').trim().toUpperCase();
        const group = document.getElementById('batch-asset-group')?.value || 'CCDC';
        const type = document.getElementById('batch-asset-type')?.value || 'LT';
        const qtyInp = document.getElementById('batch-quantity');
        const qty = parseInt(qtyInp ? qtyInp.value : 20) || 1;
        const validQty = Math.min(200, Math.max(1, qty));

        const deviceName = document.getElementById('batch-device-name')?.value.trim();
        if (!deviceName) {
            showToast('Thiếu thông tin', 'Vui lòng nhập tên model / tên thiết bị của lô hàng!', 'warning');
            return;
        }

        const cpu = document.getElementById('batch-cpu')?.value.trim() || '';
        const ram = document.getElementById('batch-ram')?.value.trim() || '';
        const ssd = document.getElementById('batch-ssd')?.value.trim() || '';
        const monitorSize = document.getElementById('batch-monitor-size')?.value.trim() || '';
        const warrantyExp = document.getElementById('batch-warranty-exp')?.value.trim() || '';
        const reason = document.getElementById('batch-reason')?.value.trim() || 'Nhập kho lô mới';

        const codes = generateBatchAssetCodes(company, group, type, validQty);
        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

        const createdItems = [];
        codes.forEach(cObj => {
            const item = {
                id: 'kho-' + Date.now() + '-' + cObj.seq,
                code: cObj.code,
                assetCode: cObj.code,
                maTaiSan: cObj.code,
                assetCompany: company,
                name: `${deviceName} (#${cObj.seq})`,
                quantity: 1,
                reason: reason,
                dateStored: formattedDate,
                assetGroup: group,
                currentAssetGroup: group,
                assetType: type,
                devCpu: cpu,
                devRam: ram,
                devSsd: ssd,
                monitorSize: monitorSize,
                warrantyEndDate: warrantyExp,
                notes: `[Lô ${codes[0].code} - ${codes[codes.length - 1].code}] CPU: ${cpu} | RAM: ${ram} | SSD: ${ssd}`
            };
            khoList.push(item);
            createdItems.push(item);
        });

        // Commit sequence to the highest number
        commitAssetSequence(company, group, type, codes[codes.length - 1].seq);
        saveToLocalStorageFallback('kho_thiet_bi', khoList);

        // Batch insert to Supabase if available
        try {
            if (supabaseClient) {
                const dbBatch = createdItems.map(it => ({
                    code: it.code,
                    name: it.name,
                    quantity: 1,
                    reason: it.reason,
                    notes: it.notes
                }));
                await supabaseClient.from('kho_thiet_bi').insert(dbBatch);
            }
        } catch (e) {
            console.warn('Batch Supabase insert error:', e);
        }

        const modal = document.getElementById('modal-batch-create-asset');
        if (modal) modal.classList.add('hidden');

        renderKho();
        renderDashboard();

        showToast('Tạo hàng loạt thành công', `Đã tạo thành công ${validQty} mã tài sản từ ${codes[0].code} đến ${codes[codes.length - 1].code} và nhập vào Kho!`, 'success');
    }

    // Modal DOM Events Wiring
    const modalBatchAsset = document.getElementById('modal-batch-create-asset');
    const btnCloseBatchModal = document.getElementById('btn-close-batch-modal');
    const btnCancelBatchModal = document.getElementById('btn-cancel-batch-modal');
    const btnConfirmBatchCreate = document.getElementById('btn-confirm-batch-create');
    const btnOpenBatchKho = document.getElementById('btn-open-batch-create-kho');

    if (btnOpenBatchKho) {
        btnOpenBatchKho.addEventListener('click', () => {
            populateAssetCompanyDatalists();
            populateAssetTypeDropdowns();
            updateBatchPreview();
            if (modalBatchAsset) modalBatchAsset.classList.remove('hidden');
        });
    }

    if (btnCloseBatchModal) btnCloseBatchModal.addEventListener('click', () => modalBatchAsset?.classList.add('hidden'));
    if (btnCancelBatchModal) btnCancelBatchModal.addEventListener('click', () => modalBatchAsset?.classList.add('hidden'));
    if (modalBatchAsset) {
        modalBatchAsset.addEventListener('click', (e) => {
            if (e.target === modalBatchAsset) modalBatchAsset.classList.add('hidden');
        });
    }

    if (btnConfirmBatchCreate) btnConfirmBatchCreate.addEventListener('click', executeBatchCreate);

    document.getElementById('batch-asset-company')?.addEventListener('input', updateBatchPreview);
    document.getElementById('batch-asset-company')?.addEventListener('change', updateBatchPreview);
    document.getElementById('batch-asset-group')?.addEventListener('change', updateBatchPreview);
    document.getElementById('batch-asset-type')?.addEventListener('change', updateBatchPreview);
    document.getElementById('batch-quantity')?.addEventListener('input', updateBatchPreview);

    // Asset Settings Modal DOM Events Wiring
    const modalAssetSettings = document.getElementById('modal-asset-type-settings');
    const btnCloseAssetSettings = document.getElementById('btn-close-asset-settings');
    const btnCloseAssetSettingsBottom = document.getElementById('btn-close-asset-settings-bottom');
    const btnOpenAssetSettingsForm = document.getElementById('btn-open-asset-settings');
    const btnOpenAssetSettingsKho = document.getElementById('btn-open-asset-settings-kho');
    const btnSavePrefix = document.getElementById('btn-save-asset-prefix');
    const btnAddType = document.getElementById('btn-add-asset-type');

    function openAssetSettingsModal() {
        const prefixInput = document.getElementById('setting-asset-prefix');
        if (prefixInput) prefixInput.value = getAssetPrefix();
        renderAssetTypesTable();
        if (modalAssetSettings) modalAssetSettings.classList.remove('hidden');
    }

    if (btnOpenAssetSettingsForm) btnOpenAssetSettingsForm.addEventListener('click', openAssetSettingsModal);
    if (btnOpenAssetSettingsKho) btnOpenAssetSettingsKho.addEventListener('click', openAssetSettingsModal);
    if (btnCloseAssetSettings) btnCloseAssetSettings.addEventListener('click', () => modalAssetSettings?.classList.add('hidden'));
    if (btnCloseAssetSettingsBottom) btnCloseAssetSettingsBottom.addEventListener('click', () => modalAssetSettings?.classList.add('hidden'));
    if (modalAssetSettings) {
        modalAssetSettings.addEventListener('click', (e) => {
            if (e.target === modalAssetSettings) modalAssetSettings.classList.add('hidden');
        });
    }

    if (btnSavePrefix) {
        btnSavePrefix.addEventListener('click', () => {
            const prefixVal = document.getElementById('setting-asset-prefix')?.value.trim();
            if (!prefixVal) {
                showToast('Lỗi', 'Tiền tố không được để trống!', 'warning');
                return;
            }
            setAssetPrefix(prefixVal);
            refreshFormAssetCode();
            populateAssetCompanyDatalists();
            showToast('Thành công', `Đã lưu tiền tố mã tài sản: "${getAssetPrefix()}"!`, 'success');
        });
    }

    if (btnAddType) {
        btnAddType.addEventListener('click', () => {
            const code = document.getElementById('new-type-code')?.value;
            const name = document.getElementById('new-type-name')?.value;
            if (addAssetType(code, name)) {
                document.getElementById('new-type-code').value = '';
                document.getElementById('new-type-name').value = '';
                refreshFormAssetCode();
                updateBatchPreview();
            }
        });
    }

    // Auto-update asset code when company, group or type changes on form-cap-phat
    document.getElementById('dev-asset-company')?.addEventListener('input', () => {
        refreshFormAssetCode();
    });
    document.getElementById('dev-asset-company')?.addEventListener('change', () => {
        refreshFormAssetCode();
    });

    document.getElementById('dev-asset-group')?.addEventListener('change', () => {
        refreshFormAssetCode();
        validateDeviceSerial(editIndexThietBi.value);
    });

    document.getElementById('dev-asset-type')?.addEventListener('change', () => {
        refreshFormAssetCode();
        validateDeviceSerial(editIndexThietBi.value);
    });

    document.getElementById('btn-regen-asset-code')?.addEventListener('click', () => {
        refreshFormAssetCode(true);
        showToast('Sinh mã mới', `Mã tài sản: ${document.getElementById('dev-ma-tai-san')?.value || ''}`, 'info');
    });

    // Copy Mã Tài Sản to ID Thiết Bị button
    const btnCopyMaToDevId = document.getElementById('btn-copy-ma-to-devid');
    if (btnCopyMaToDevId) {
        btnCopyMaToDevId.addEventListener('click', () => {
            const maTS = document.getElementById('dev-ma-tai-san')?.value;
            if (maTS && devIdInput) {
                devIdInput.value = maTS;
                validateDuplicateDevice(editIndexThietBi.value);
                showToast('Đã điền ID', `Đã lấy ID Thiết bị theo Mã Tài Sản: ${maTS}`, 'info');
            }
        });
    }

    // Auto-update asset code when company, group or type changes on form-kho-thiet-bi
    document.getElementById('kho-asset-company')?.addEventListener('input', () => refreshKhoAssetCode(false));
    document.getElementById('kho-asset-company')?.addEventListener('change', () => refreshKhoAssetCode(false));
    document.getElementById('kho-asset-group')?.addEventListener('change', () => refreshKhoAssetCode(false));
    document.getElementById('kho-asset-type')?.addEventListener('change', () => refreshKhoAssetCode(false));

    document.getElementById('btn-regen-kho-asset-code')?.addEventListener('click', () => {
        refreshKhoAssetCode(true);
        showToast('Sinh mã mới', `Mã tài sản kho: ${document.getElementById('kho-ma-tai-san')?.value || ''}`, 'info');
    });

    // Copy Mã Tài Sản to ID Thiết Bị Kho button
    document.getElementById('btn-copy-kho-ma-to-devid')?.addEventListener('click', () => {
        const maTS = document.getElementById('kho-ma-tai-san')?.value;
        const khoCodeInput = document.getElementById('kho-code');
        if (maTS && khoCodeInput) {
            khoCodeInput.value = maTS;
            showToast('Đã điền ID', `Đã lấy Mã thiết bị kho theo Mã Tài Sản: ${maTS}`, 'info');
        }
    });

    // Button Mở Form Thêm Thiết Bị Vào Kho
    document.getElementById('btn-open-add-kho')?.addEventListener('click', () => {
        if (typeof resetFormKho === 'function') resetFormKho();
        const formTitle = document.getElementById('title-form-kho');
        if (formTitle) formTitle.innerHTML = '<i class="fa-solid fa-boxes-stacked"></i> Thêm Thiết Bị Lưu Kho Mới';
        showTabFormOnly('tab-kho-thiet-bi');
        populateAssetCompanyDatalists();
        populateAssetTypeDropdowns();
        refreshKhoAssetCode();
        document.getElementById('kho-name')?.focus();
    });

    // Populate asset types & company datalists on startup
    populateAssetCompanyDatalists();
    populateAssetTypeDropdowns();
    refreshFormAssetCode();
    refreshKhoAssetCode();


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
        if (typeof populateAssetCompanyDatalists === 'function') {
            populateAssetCompanyDatalists();
        }
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
        if (!requirePermission('canEdit', 'chỉnh sửa thông tin chi nhánh / công ty')) return;
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
        if (!requirePermission('canDelete', 'xóa thông tin chi nhánh / công ty')) return;
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
        if (!requirePermission('canEdit', 'chỉnh sửa thông tin tài khoản')) return;
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
        if (!requirePermission('canDelete', 'xóa thông tin tài khoản')) return;
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
        if (!requirePermission('canEdit', 'chỉnh sửa thông tin hỗ trợ')) return;
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
        if (!requirePermission('canDelete', 'xóa thông tin hỗ trợ')) return;
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
        if (!requirePermission('canEdit', 'chỉnh sửa thông tin camera')) return;
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
        if (!requirePermission('canDelete', 'xóa thông tin camera')) return;
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
        if (!requirePermission('canEdit', 'chỉnh sửa bài viết Tip & Trick')) return;
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
        if (!requirePermission('canDelete', 'xóa bài viết Tip & Trick')) return;
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

        const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(?:lúc\s+)?(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/i);
        if (dmyMatch) {
            const day = parseInt(dmyMatch[1], 10);
            const month = parseInt(dmyMatch[2], 10) - 1;
            const year = parseInt(dmyMatch[3], 10);
            const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
            const minute = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
            const second = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
            const d = new Date(year, month, day, hour, minute, second);
            return isNaN(d.getTime()) ? null : d;
        }

        const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
        if (ymdMatch) {
            const year = parseInt(ymdMatch[1], 10);
            const month = parseInt(ymdMatch[2], 10) - 1;
            const day = parseInt(ymdMatch[3], 10);
            const hour = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 0;
            const minute = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0;
            const second = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0;
            const d = new Date(year, month, day, hour, minute, second);
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
        if (!requirePermission('canEdit', 'chỉnh sửa thông tin gia hạn bản quyền')) return;
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
        if (!requirePermission('canDelete', 'xóa thông tin gia hạn bản quyền')) return;
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
    attachDateMask(document.getElementById('kho-warranty-exp'));
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
                (item.assetCode || '').toLowerCase().includes(keyword) ||
                (item.maTaiSan || '').toLowerCase().includes(keyword) ||
                (item.name || '').toLowerCase().includes(keyword) ||
                (item.reason || '').toLowerCase().includes(keyword) ||
                (item.devSn || '').toLowerCase().includes(keyword) ||
                (item.serial || '').toLowerCase().includes(keyword) ||
                (item.devCpu || '').toLowerCase().includes(keyword) ||
                (item.devRam || '').toLowerCase().includes(keyword) ||
                (item.status || '').toLowerCase().includes(keyword) ||
                (item.location || '').toLowerCase().includes(keyword)
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
                    <td colspan="7" class="text-center" style="padding: 35px 20px; color: var(--text-muted);">
                        <div style="font-size: 32px; color: #64748b; margin-bottom: 10px;"><i class="fa-solid fa-boxes-packing"></i></div>
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Kho hiện chưa có thiết bị lưu kho nào!</div>
                        <div style="font-size: 13px; margin-bottom: 16px;">Bấm nút bên dưới để thêm thiết bị mới vào kho.</div>
                        <button type="button" class="btn btn-primary btn-sm" onclick="document.getElementById('btn-open-add-kho')?.click()" style="font-weight: 600; padding: 7px 18px;">
                            <i class="fa-solid fa-plus"></i> Thêm Thiết Bị Vào Kho
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        const pageItems = filtered.slice(startIndex, endIndex);

        pageItems.forEach((item) => {
            const originalIndex = khoList.indexOf(item);
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.setAttribute('title', 'Nhấn vào dòng này để xem chi tiết & cập nhật thiết bị');
            tr.addEventListener('click', function(e) {
                if (e.target.closest('.actions-cell') || e.target.closest('button') || e.target.closest('a')) return;
                editKho(originalIndex);
            });

            // 1. Mã Thiết Bị & Mã Tài Sản
            const assetCodeVal = item.maTaiSan || item.assetCode || '';
            const assetCodeBadge = assetCodeVal ? `<div style="margin-top: 3px;"><span class="badge" style="background: rgba(34, 211, 238, 0.12); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.3); font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">${assetCodeVal}</span></div>` : '';
            const devIdBadge = item.code ? `<span class="badge badge-blue" style="font-weight: 700;">${item.code}</span>` : '<span class="text-muted">—</span>';

            // 2. Tên Thiết Bị & Serial
            const snVal = item.devSn || item.serial || '';
            const snHtml = snVal ? `<div style="font-size: 11.5px; color: #94a3b8; font-family: monospace; margin-top: 2px;"><i class="fa-solid fa-barcode" style="font-size: 10px;"></i> S/N: ${snVal}</div>` : '';

            // 3. Cấu hình tóm tắt
            const specsPills = [];
            if (item.devCpu) specsPills.push(`<span style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; font-size: 11px; white-space: nowrap;"><i class="fa-solid fa-microchip"></i> ${item.devCpu}</span>`);
            if (item.devRam) specsPills.push(`<span style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; font-size: 11px; white-space: nowrap;"><i class="fa-solid fa-memory"></i> ${item.devRam}</span>`);
            if (item.devSsd) specsPills.push(`<span style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; font-size: 11px; white-space: nowrap;"><i class="fa-solid fa-hard-drive"></i> ${item.devSsd}</span>`);
            if (item.monitorSize) specsPills.push(`<span style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; font-size: 11px; white-space: nowrap;"><i class="fa-solid fa-desktop"></i> ${item.monitorSize}</span>`);

            let specsContent = specsPills.join(' ');
            if (!specsContent && item.notes) {
                const clean = item.notes.replace(/\[SPECS_JSON:.*?\]/s, '').trim();
                if (clean) specsContent = `<span style="font-size: 11.5px; color: var(--text-secondary);">${clean}</span>`;
            }
            if (!specsContent) specsContent = `<span style="font-size: 11px; color: var(--text-muted);">—</span>`;

            // 4. Tình trạng & Vị trí
            const statusVal = item.status || 'Sẵn sàng cấp phát';
            let statusStyle = 'background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);';
            if (statusVal.includes('hư hỏng') || statusVal.includes('Chờ sửa')) {
                statusStyle = 'background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);';
            } else if (statusVal.includes('thanh lý') || statusVal.includes('Hỏng')) {
                statusStyle = 'background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);';
            } else if (statusVal.includes('Đã qua sử dụng')) {
                statusStyle = 'background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);';
            }
            const locationHtml = item.location ? `<div style="font-size: 11.5px; color: #94a3b8; margin-top: 3px;"><i class="fa-solid fa-location-dot" style="color: #60a5fa; font-size: 10px;"></i> ${item.location}</div>` : '';

            tr.innerHTML = `
                <td>${devIdBadge}${assetCodeBadge}</td>
                <td><strong style="color: var(--text-primary); font-size: 13.5px;">${item.name || 'Thiết bị'}</strong>${snHtml}</td>
                <td><div style="display: flex; flex-wrap: wrap; gap: 4px;">${specsContent}</div></td>
                <td><span class="badge" style="${statusStyle} font-size: 11px; font-weight: 600;">${statusVal}</span>${locationHtml}</td>
                <td class="text-center"><span class="badge badge-warning" style="font-size: 13px; font-weight: 700;">${item.quantity || 1}</span></td>
                <td>
                    <div style="font-size: 13px; color: var(--text-primary); font-weight: 500;">${item.reason || '—'}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"><i class="fa-regular fa-calendar"></i> ${formatDateDMY(item.dateStored)}</div>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-only edit btn-allocate-kho" data-index="${originalIndex}" title="Cấp phát cho Nhân viên" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);">
                            <i class="fa-solid fa-user-plus"></i>
                        </button>
                        <button class="btn-icon-only edit btn-qr-kho" data-index="${originalIndex}" title="In tem tài sản QR Code" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">
                            <i class="fa-solid fa-qrcode"></i>
                        </button>
                        <button class="btn-icon-only edit btn-edit-kho" data-index="${originalIndex}" title="Xem chi tiết & Cập nhật">
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

        document.querySelectorAll('.btn-qr-kho').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                openKhoQrTagModal(idx);
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

    // openKhoQrTagModal is managed centrally by the unified QR engine in Section 3

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

            const warrantyVal = document.getElementById('kho-warranty-exp')?.value.trim() || '';
            if (warrantyVal && !validateDateDMY(warrantyVal, true)) {
                showToast('Lỗi nhập liệu', 'Vui lòng nhập Ngày hết bảo hành đúng định dạng dd/mm/yyyy!', 'error');
                return;
            }

            const companyVal = (document.getElementById('kho-asset-company')?.value || getAssetPrefix() || 'ERG').trim().toUpperCase();
            const groupVal = document.getElementById('kho-asset-group')?.value || 'CCDC';
            const currentGroupVal = groupVal;
            const typeVal = document.getElementById('kho-asset-type')?.value || 'LT';
            const maTaiSanVal = document.getElementById('kho-ma-tai-san')?.value.trim() || generateAssetCode(companyVal, groupVal, typeVal);

            const userNotes = document.getElementById('kho-notes')?.value.trim() || '';

            const data = {
                code: document.getElementById('kho-code').value.trim(),
                assetCode: maTaiSanVal,
                maTaiSan: maTaiSanVal,
                assetCompany: companyVal,
                assetGroup: groupVal,
                currentAssetGroup: currentGroupVal,
                assetType: typeVal,
                name: document.getElementById('kho-name').value.trim(),
                devSn: document.getElementById('kho-sn')?.value.trim() || '',
                serial: document.getElementById('kho-sn')?.value.trim() || '',
                status: document.getElementById('kho-status')?.value || 'Sẵn sàng cấp phát',
                quantity: parseInt(document.getElementById('kho-quantity').value) || 1,
                devCpu: document.getElementById('kho-cpu')?.value.trim() || '',
                devRam: document.getElementById('kho-ram')?.value.trim() || '',
                devRamSlots: document.getElementById('kho-ram-slots')?.value || '',
                devSsd: document.getElementById('kho-ssd')?.value.trim() || '',
                devHdd: document.getElementById('kho-hdd')?.value.trim() || '',
                devVga: document.getElementById('kho-vga')?.value.trim() || '',
                devMain: document.getElementById('kho-main')?.value.trim() || '',
                devMonitor: document.getElementById('kho-monitor')?.value.trim() || '',
                monitorSize: document.getElementById('kho-monitor-size')?.value.trim() || '',
                devMonitorSn: document.getElementById('kho-monitor-sn')?.value.trim() || '',
                devCables: document.getElementById('kho-cables')?.value.trim() || '',
                warrantyEndDate: warrantyVal ? formatDateDMY(warrantyVal) : '',
                reason: document.getElementById('kho-reason').value.trim(),
                location: document.getElementById('kho-location')?.value.trim() || '',
                dateStored: dateStoredVal,
                storedBy: document.getElementById('kho-stored-by')?.value.trim() || '',
                notes: userNotes
            };

            // Bundle full specs into [SPECS_JSON:...] inside notes for maximum compatibility
            const specsJson = JSON.stringify({
                code: data.code,
                maTaiSan: data.maTaiSan,
                assetCompany: data.assetCompany,
                assetGroup: data.assetGroup,
                currentAssetGroup: data.currentAssetGroup,
                assetType: data.assetType,
                name: data.name,
                devSn: data.devSn,
                status: data.status,
                quantity: data.quantity,
                devCpu: data.devCpu,
                devRam: data.devRam,
                devRamSlots: data.devRamSlots,
                devSsd: data.devSsd,
                devHdd: data.devHdd,
                devVga: data.devVga,
                devMain: data.devMain,
                devMonitor: data.devMonitor,
                monitorSize: data.monitorSize,
                devMonitorSn: data.devMonitorSn,
                devCables: data.devCables,
                warrantyEndDate: data.warrantyEndDate,
                reason: data.reason,
                location: data.location,
                dateStored: data.dateStored,
                storedBy: data.storedBy
            });
            data.notes = userNotes ? `${userNotes}\n[SPECS_JSON:${specsJson}]` : `[SPECS_JSON:${specsJson}]`;

            if (indexStr === '') {
                try {
                    commitAssetSequence(companyVal, groupVal, typeVal, maTaiSanVal);
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
                } catch (err) {
                    console.error("Lỗi cập nhật kho:", err);
                    data.id = oldItem ? oldItem.id : ('local-' + Date.now());
                    khoList[idx] = data;
                    saveToLocalStorageFallback('kho_thiet_bi', khoList);
                    showToast('Lưu Offline', 'Đã cập nhật tạm thời trên trình duyệt!', 'warning');
                }
            }

            renderKho();
            returnToKhoTable();
        });
    }

    function editKho(index) {
        if (!requirePermission('canEdit', 'chỉnh sửa thông tin thiết bị lưu kho')) return;
        const item = khoList[index];
        if (!item) return;
        showTabFormOnly('tab-kho-thiet-bi');
        if (editIndexKho) editIndexKho.value = index;

        const formTitle = document.getElementById('title-form-kho');
        const codeDisplay = item.code || item.maTaiSan || item.name || 'Thiết bị';
        if (formTitle) {
            formTitle.innerHTML = `<i class="fa-solid fa-circle-info"></i> Chi Tiết & Cập Nhật Thiết Bị Kho: <span style="color: #60a5fa; font-family: monospace;">${codeDisplay}</span>`;
        }

        // Trích xuất specs nếu có
        let specs = {};
        if (item.notes && item.notes.includes('[SPECS_JSON:')) {
            const match = item.notes.match(/\[SPECS_JSON:(.*?)\]/s);
            if (match && match[1]) {
                try { specs = JSON.parse(match[1]); } catch (e) {}
            }
        }

        populateAssetCompanyDatalists();
        populateAssetTypeDropdowns();

        const codeVal = item.code || specs.code || '';
        const maVal = item.maTaiSan || item.assetCode || specs.maTaiSan || specs.assetCode || '';
        const companyVal = item.assetCompany || specs.assetCompany || 'ERG';
        const groupVal = item.assetGroup || specs.assetGroup || 'CCDC';
        const currentGroupVal = item.currentAssetGroup || specs.currentAssetGroup || groupVal;
        const typeVal = item.assetType || specs.assetType || 'LT';

        if (document.getElementById('kho-code')) document.getElementById('kho-code').value = codeVal;
        const khoCompanyEl = document.getElementById('kho-asset-company');
        if (khoCompanyEl) {
            khoCompanyEl.value = companyVal;
            khoCompanyEl.readOnly = false;
            khoCompanyEl.disabled = false;
        }
        const khoGroupEl = document.getElementById('kho-asset-group');
        if (khoGroupEl) {
            khoGroupEl.value = groupVal;
            khoGroupEl.disabled = false;
        }
        const khoTypeEl = document.getElementById('kho-asset-type');
        if (khoTypeEl) {
            khoTypeEl.value = typeVal;
            khoTypeEl.disabled = false;
        }
        const khoMaInp = document.getElementById('kho-ma-tai-san');
        if (khoMaInp) {
            khoMaInp.value = maVal;
            khoMaInp.readOnly = false;
        }



        if (document.getElementById('kho-name')) document.getElementById('kho-name').value = item.name || specs.name || '';
        if (document.getElementById('kho-sn')) document.getElementById('kho-sn').value = item.devSn || item.serial || specs.devSn || specs.serial || '';
        if (document.getElementById('kho-status')) document.getElementById('kho-status').value = item.status || specs.status || 'Sẵn sàng cấp phát';
        if (document.getElementById('kho-quantity')) document.getElementById('kho-quantity').value = item.quantity || specs.quantity || 1;
        if (document.getElementById('kho-cpu')) document.getElementById('kho-cpu').value = item.devCpu || specs.devCpu || '';
        if (document.getElementById('kho-ram')) document.getElementById('kho-ram').value = item.devRam || specs.devRam || '';
        if (document.getElementById('kho-ram-slots')) document.getElementById('kho-ram-slots').value = item.devRamSlots || specs.devRamSlots || '';
        if (document.getElementById('kho-ssd')) document.getElementById('kho-ssd').value = item.devSsd || specs.devSsd || '';
        if (document.getElementById('kho-hdd')) document.getElementById('kho-hdd').value = item.devHdd || specs.devHdd || '';
        if (document.getElementById('kho-vga')) document.getElementById('kho-vga').value = item.devVga || specs.devVga || '';
        if (document.getElementById('kho-main')) document.getElementById('kho-main').value = item.devMain || specs.devMain || '';
        if (document.getElementById('kho-monitor')) document.getElementById('kho-monitor').value = item.devMonitor || specs.devMonitor || '';
        if (document.getElementById('kho-monitor-size')) document.getElementById('kho-monitor-size').value = item.monitorSize || specs.monitorSize || '';
        if (document.getElementById('kho-monitor-sn')) document.getElementById('kho-monitor-sn').value = item.devMonitorSn || specs.devMonitorSn || '';
        if (document.getElementById('kho-cables')) document.getElementById('kho-cables').value = item.devCables || specs.devCables || '';
        if (document.getElementById('kho-warranty-exp')) document.getElementById('kho-warranty-exp').value = item.warrantyEndDate ? formatDateDMY(item.warrantyEndDate) : (specs.warrantyEndDate ? formatDateDMY(specs.warrantyEndDate) : '');

        if (document.getElementById('kho-reason')) document.getElementById('kho-reason').value = item.reason || specs.reason || '';
        if (document.getElementById('kho-location')) document.getElementById('kho-location').value = item.location || specs.location || '';
        if (document.getElementById('kho-date-stored')) document.getElementById('kho-date-stored').value = item.dateStored ? formatDateDMY(item.dateStored) : (specs.dateStored ? formatDateDMY(specs.dateStored) : '');
        if (document.getElementById('kho-stored-by')) document.getElementById('kho-stored-by').value = item.storedBy || specs.storedBy || '';

        const cleanNotes = (item.notes || '').replace(/\[SPECS_JSON:.*?\]/s, '').trim();
        if (document.getElementById('kho-notes')) document.getElementById('kho-notes').value = cleanNotes;

        if (btnSaveKho) btnSaveKho.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> LƯU CẬP NHẬT';

        document.querySelector('.tab-container').scrollTop = 0;
    }

    async function deleteKho(index) {
        if (!requirePermission('canDelete', 'xóa thiết bị lưu kho')) return;
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
                    returnToKhoTable();
                }
            } catch (err) {
                console.error(err);
                khoList.splice(index, 1);
                saveToLocalStorageFallback('kho_thiet_bi', khoList);
                renderKho();
                showToast('Xóa Offline', 'Không kết nối được Supabase. Đã xóa tạm thời trên trình duyệt!', 'warning');

                if (editIndexKho && editIndexKho.value === index.toString()) {
                    returnToKhoTable();
                }
            }
        }
    }

    function resetFormKho() {
        if (editIndexKho) editIndexKho.value = '';
        if (btnSaveKho) btnSaveKho.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> LƯU THIẾT BỊ KHO';
        const formTitle = document.getElementById('title-form-kho');
        if (formTitle) formTitle.innerHTML = '<i class="fa-solid fa-boxes-stacked"></i> Thêm & Cập Nhật Thiết Bị Lưu Kho';
        if (formKho) formKho.reset();

        if (document.getElementById('kho-quantity')) document.getElementById('kho-quantity').value = '1';
        if (document.getElementById('kho-status')) document.getElementById('kho-status').value = 'Sẵn sàng cấp phát';
        const khoDateInput = document.getElementById('kho-date-stored');
        if (khoDateInput) khoDateInput.value = formatDateDMY(new Date());
        refreshKhoAssetCode();
    }

    function returnToKhoTable() {
        resetFormKho();
        showTabTableOnly('tab-kho-thiet-bi');
    }

    document.querySelectorAll('.btn-back-to-kho-table').forEach(btn => {
        btn.addEventListener('click', returnToKhoTable);
    });
    if (btnCancelKho) btnCancelKho.addEventListener('click', returnToKhoTable);

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
                    (item.assetCode || '').toLowerCase().includes(keyword) ||
                    (item.maTaiSan || '').toLowerCase().includes(keyword) ||
                    (item.name || '').toLowerCase().includes(keyword) ||
                    (item.reason || '').toLowerCase().includes(keyword) ||
                    (item.devSn || '').toLowerCase().includes(keyword) ||
                    (item.serial || '').toLowerCase().includes(keyword) ||
                    (item.devCpu || '').toLowerCase().includes(keyword) ||
                    (item.devRam || '').toLowerCase().includes(keyword) ||
                    (item.status || '').toLowerCase().includes(keyword) ||
                    (item.location || '').toLowerCase().includes(keyword)
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
            if (!requirePermission('canExport', 'xuất dữ liệu sao lưu hệ thống')) return;
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
            if (!requirePermission('canExport', 'nhập dữ liệu phục hồi hệ thống')) return;
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
                khoThietBi: khoList || [],
                rbacConfig: rbacConfig || null
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
        if (data.rbacConfig && Array.isArray(data.rbacConfig.users)) {
            rbacConfig = data.rbacConfig;
            if (typeof savePermissionsConfig === 'function') {
                await savePermissionsConfig();
            }
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
                if (data && data.length > 0) {
                    khoList = data.map(mappers.khoThietBi.fromDB);
                    saveToLocalStorageFallback('kho_thiet_bi', khoList);
                } else {
                    // Nếu Supabase trả về rỗng (do chưa cấp quyền RLS hoặc chưa sync), dùng local fallback và initial seed an toàn
                    loadFromLocalStorageFallback('kho_thiet_bi', khoList, renderKho);
                    if (khoList.length === 0 && initialKhoSeed.length > 0) {
                        khoList = JSON.parse(JSON.stringify(initialKhoSeed));
                        saveToLocalStorageFallback('kho_thiet_bi', khoList);
                    }
                }
                renderKho();
            }).catch(err => {
                hasConnectionError = true;
                lastErrorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : err);
                console.warn("Fetch kho_thiet_bi failed, loading fallback:", err);
                loadFromLocalStorageFallback('kho_thiet_bi', khoList, renderKho);
                if (khoList.length === 0 && initialKhoSeed.length > 0) {
                    khoList = JSON.parse(JSON.stringify(initialKhoSeed));
                    saveToLocalStorageFallback('kho_thiet_bi', khoList);
                    renderKho();
                }
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
    // 11. LOGIN, ADMIN AUTHENTICATION & RBAC PERMISSION MANAGEMENT
    // -------------------------------------------------------------------------
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const formLogin = document.getElementById('form-login');
    const btnToggleLoginPass = document.getElementById('btn-toggle-login-pass');
    const btnLogout = document.getElementById('btn-logout-header');

    const TAB_LABELS_MAP = {
        'tab-trang-chu': 'Trang chủ',
        'tab-cap-phat-list': 'Danh sách Cấp phát',
        'tab-kho-thiet-bi': 'Thiết bị Lưu kho',
        'tab-cong-ty': 'Chi nhánh',
        'tab-account': 'Tài khoản (Account)',
        'tab-ho-tro': 'Thông tin Hỗ trợ',
        'tab-camera': 'Thông tin Camera',
        'tab-tips': 'Tip & Trick',
        'tab-gia-han': 'Gia hạn Bản quyền'
    };

    // Supabase is the only source of truth for RBAC.
    function rowToPermission(row) {
        const actions = row.permissions?.actions || {};
        const preset = getRolePresetPermissions(row.role || 'viewer');
        return {
            email: normalizeUserEmail(row.email),
            displayName: row.display_name || row.email,
            dept: row.notes || '',
            role: row.role || 'viewer',
            isActive: row.is_active !== false,
            canAdd: actions.canAdd === undefined ? preset.canAdd : actions.canAdd === true,
            canEdit: actions.canEdit === undefined ? preset.canEdit : actions.canEdit === true,
            canDelete: actions.canDelete === undefined ? preset.canDelete : actions.canDelete === true,
            canExport: actions.canExport === undefined && actions.canExportImport === undefined
                ? preset.canExport : (actions.canExport === true || actions.canExportImport === true),
            allowedTabs: Array.isArray(row.permissions?.tabs)
                ? row.permissions.tabs : preset.allowedTabs,
            updatedAt: row.updated_at || ''
        };
    }

    async function savePermissionsConfig() {
        if (!supabaseClient || currentUserPerm?.role !== 'admin') {
            throw new Error('Chỉ Admin được lưu phân quyền');
        }
        const { error } = await supabaseClient.rpc('qlts_save_permissions', {
            p_config: {
                defaultNewUserRole: rbacConfig.defaultNewUserRole,
                users: rbacConfig.users.map(u => ({
                    email: normalizeUserEmail(u.email),
                    displayName: u.displayName,
                    dept: u.dept,
                    role: u.role,
                    isActive: u.isActive,
                    canAdd: u.canAdd,
                    canEdit: u.canEdit,
                    canDelete: u.canDelete,
                    canExport: u.canExport,
                    allowedTabs: u.allowedTabs
                }))
            }
        });
        if (error) throw new Error(error.message || 'Không thể lưu phân quyền lên Supabase');
        await syncPermissionsFromRemote();
    }

    async function syncPermissionsFromRemote() {
        if (!supabaseClient) throw new Error('Không thể kết nối Supabase');
        const { error: ensureError } = await supabaseClient.rpc('qlts_ensure_my_permission');
        if (ensureError) throw new Error(ensureError.message || 'Tài khoản chưa được cấp quyền');
        const [{ data: users, error: userError }, { data: setting, error: settingError }] = await Promise.all([
            supabaseClient.from('user_permissions')
                .select('email,display_name,role,is_active,permissions,notes,updated_at'),
            supabaseClient.from('rbac_settings').select('default_new_user_role').eq('id', 1).single()
        ]);
        if (userError) throw new Error(userError.message || 'Không thể đọc phân quyền');
        if (settingError) throw new Error(settingError.message || 'Không thể đọc cấu hình phân quyền');
        rbacConfig = {
            defaultNewUserRole: setting.default_new_user_role || 'viewer',
            users: (users || []).map(rowToPermission)
        };
        return rbacConfig;
    }

    // Resolve only the server-authorized record for the authenticated email.
    function resolveUserPermissions(rawEmail) {
        const email = normalizeUserEmail(rawEmail);
        const userRecord = rbacConfig.users.find(u => normalizeUserEmail(u.email) === email);
        if (!userRecord || userRecord.isActive === false) {
            currentUserPerm = null;
            return null;
        }
        const role = userRecord.role || 'viewer';
        const preset = getRolePresetPermissions(role);
        currentUserPerm = {
            email, displayName: userRecord.displayName || email,
            dept: userRecord.dept || '', role, isActive: true,
            canAdd: role === 'admin' || userRecord.canAdd === true,
            canEdit: role === 'admin' || userRecord.canEdit === true,
            canDelete: role === 'admin' || userRecord.canDelete === true,
            canExport: role === 'admin' || userRecord.canExport === true,
            allowedTabs: role === 'admin'
                ? preset.allowedTabs
                : (Array.isArray(userRecord.allowedTabs) ? userRecord.allowedTabs : preset.allowedTabs)
        };
        return currentUserPerm;
    }

    // Apply currentUserPerm restrictions across the entire UI
    function applyUserPermissionsUI() {
        const perm = currentUserPerm;
        if (!perm) return;

        // 1. Update Header User Profile display
        const elName = document.getElementById('header-user-name');
        const elRole = document.getElementById('header-user-role');
        const elAvatar = document.getElementById('header-user-avatar');
        const elAvatarIcon = document.getElementById('header-user-avatar-icon');
        const elInfoClickable = document.getElementById('header-user-info-clickable');

        if (elName) {
            elName.textContent = perm.displayName || perm.email || 'User';
            elName.title = perm.email;
        }
        if (elRole) {
            if (perm.role === 'admin') {
                elRole.innerHTML = '<i class="fa-solid fa-crown" style="font-size:10px; color:#f43f5e;"></i> Quản trị viên (Admin)';
                elRole.style.color = '#fb7185';
            } else if (perm.role === 'editor') {
                elRole.innerHTML = '<i class="fa-solid fa-user-gear" style="font-size:10px; color:#38bdf8;"></i> Quản lý / Kỹ thuật';
                elRole.style.color = '#38bdf8';
            } else {
                elRole.innerHTML = '<i class="fa-solid fa-eye" style="font-size:10px; color:#4ade80;"></i> Chỉ xem (Viewer)';
                elRole.style.color = '#4ade80';
            }
        }
        if (elAvatar && elAvatarIcon) {
            if (perm.role === 'admin') {
                elAvatarIcon.className = 'fa-solid fa-user-shield';
                elAvatar.style.borderColor = 'rgba(244, 63, 94, 0.5)';
                elAvatar.style.color = '#fb7185';
            } else if (perm.role === 'editor') {
                elAvatarIcon.className = 'fa-solid fa-user-gear';
                elAvatar.style.borderColor = 'rgba(56, 189, 248, 0.5)';
                elAvatar.style.color = '#38bdf8';
            } else {
                elAvatarIcon.className = 'fa-solid fa-user-check';
                elAvatar.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                elAvatar.style.color = '#4ade80';
            }
        }
        if (elInfoClickable) {
            elInfoClickable.onclick = () => {
                if (perm.role === 'admin') {
                    switchToTab('tab-phan-quyen');
                } else {
                    const actions = [];
                    if (perm.canAdd) actions.push('Thêm');
                    if (perm.canEdit) actions.push('Sửa');
                    if (perm.canDelete) actions.push('Xóa');
                    if (perm.canExport) actions.push('Export');
                    const actStr = actions.length > 0 ? actions.join(', ') : 'Chỉ xem dữ liệu';
                    showToast('Thông tin quyền hạn', `Tài khoản: ${perm.email} | Quyền thao tác: ${actStr}`, 'info');
                }
            };
        }

        // 2. Toggle CSS classes on <body> for global button visibility
        document.body.classList.toggle('perm-no-add', !hasActionPermission('canAdd'));
        document.body.classList.toggle('perm-no-edit', !hasActionPermission('canEdit'));
        document.body.classList.toggle('perm-no-delete', !hasActionPermission('canDelete'));
        document.body.classList.toggle('perm-no-export', !hasActionPermission('canExport'));

        // 3. Toggle Sidebar Menu Items based on allowedTabs & Admin role
        const menuItems = document.querySelectorAll('.sidebar-menu .menu-item[data-tab]');
        menuItems.forEach(item => {
            const tabId = item.getAttribute('data-tab');
            if (tabId === 'tab-phan-quyen') {
                item.style.display = perm.role === 'admin' ? 'flex' : 'none';
            } else {
                item.style.display = canAccessTab(tabId) ? 'flex' : 'none';
            }
        });

        // 4. Toggle Quick Add ("Thêm thông tin") button & modal options
        const btnAddInfo = document.getElementById('btn-toggle-add-info');
        if (btnAddInfo) {
            btnAddInfo.style.display = hasActionPermission('canAdd') ? 'flex' : 'none';
        }
        const addActionToTabMap = {
            'add-cap-phat': 'tab-cap-phat-list',
            'add-kho': 'tab-kho-thiet-bi',
            'add-cong-ty': 'tab-cong-ty',
            'add-account': 'tab-account',
            'add-ho-tro': 'tab-ho-tro',
            'add-camera': 'tab-camera',
            'add-tips': 'tab-tips',
            'add-gia-han': 'tab-gia-han'
        };
        document.querySelectorAll('#modal-add-info-options .add-info-option-item').forEach(opt => {
            const act = opt.getAttribute('data-action');
            if (act === 'add-phan-quyen') {
                opt.style.display = perm.role === 'admin' ? 'flex' : 'none';
            } else if (addActionToTabMap[act]) {
                opt.style.display = canAccessTab(addActionToTabMap[act]) ? 'flex' : 'none';
            }
        });

        // 5. Toggle Export / Import Box in Sidebar
        const exportBox = document.getElementById('sidebar-export-import-box');
        if (exportBox) {
            exportBox.style.display = hasActionPermission('canExport') ? 'flex' : 'none';
        }

        // 6. Toggle Maintenance Add Form Box inside Maintenance Modal
        const maintAddBox = document.getElementById('maint-form-add-box');
        if (maintAddBox) {
            maintAddBox.style.display = hasActionPermission('canEdit') ? 'block' : 'none';
        }

        // 7. Ensure active tab is allowed; otherwise redirect to first allowed tab
        const currentActiveSection = document.querySelector('.tab-content.active');
        if (currentActiveSection && !canAccessTab(currentActiveSection.id)) {
            switchToTab(getFirstAllowedTab());
        }

        // 8. Render RBAC table if Admin
        if (perm.role === 'admin' && typeof renderPhanQuyen === 'function') {
            renderPhanQuyen();
        }
    }

    // =========================================================================
    // 11.1. GIAO DIỆN QUẢN LÝ PHÂN QUYỀN USER (TAB-PHAN-QUYEN)
    // =========================================================================
    const formPhanQuyen = document.getElementById('form-phan-quyen');
    const tbodyPhanQuyen = document.getElementById('tbody-phan-quyen');
    const searchPhanQuyen = document.getElementById('search-phan-quyen');
    const filterRolePhanQuyen = document.getElementById('filter-role-phan-quyen');
    const editIndexPhanQuyen = document.getElementById('edit-index-phan-quyen');
    const selectDefaultNewUserRole = document.getElementById('rbac-default-new-user-role');
    const btnOpenAddRbacUser = document.getElementById('btn-open-add-phan-quyen') || document.getElementById('btn-open-add-rbac-user');
    const btnRefreshRbac = document.getElementById('btn-refresh-rbac');
    const btnCancelPhanQuyen = document.getElementById('btn-cancel-phan-quyen');
    const btnBackPhanQuyen = document.getElementById('btn-back-to-rbac-table') || document.getElementById('btn-back-phan-quyen');
    const btnToggleRbacPass = document.getElementById('btn-toggle-rbac-pass');
    const btnSelectAllTabs = document.getElementById('btn-rbac-select-all-tabs');
    const btnSelectBasicTabs = document.getElementById('btn-rbac-select-basic-tabs');

    function getRbacRoleInput() {
        return document.getElementById('rbac-selected-role') || document.getElementById('rbac-user-role');
    }
    function getRbacNoteInput() {
        return document.getElementById('rbac-user-notes') || document.getElementById('rbac-user-dept');
    }

    function highlightRolePresetCard(role) {
        const hiddenRoleInput = getRbacRoleInput();
        if (hiddenRoleInput) hiddenRoleInput.value = role;
        document.querySelectorAll('.rbac-role-card').forEach(card => {
            const cardRole = card.getAttribute('data-role');
            card.classList.remove('active', 'active-role-admin', 'active-role-editor', 'active-role-viewer');
            if (cardRole === role) card.classList.add('active', `active-role-${role}`);
        });
    }

    function applyRolePresetToForm(role) {
        highlightRolePresetCard(role);
        const preset = getRolePresetPermissions(role);

        const chkAdd = document.getElementById('rbac-act-add');
        const chkEdit = document.getElementById('rbac-act-edit');
        const chkDelete = document.getElementById('rbac-act-delete');
        const chkExport = document.getElementById('rbac-act-export');

        if (chkAdd) chkAdd.checked = preset.canAdd;
        if (chkEdit) chkEdit.checked = preset.canEdit;
        if (chkDelete) chkDelete.checked = preset.canDelete;
        if (chkExport) chkExport.checked = preset.canExport;

        document.querySelectorAll('.rbac-tab-chk').forEach(chk => {
            chk.checked = preset.allowedTabs.includes(chk.value);
        });
    }

    document.querySelectorAll('.rbac-role-card').forEach(card => {
        card.addEventListener('click', () => {
            const role = card.getAttribute('data-role') || 'viewer';
            applyRolePresetToForm(role);
        });
    });

    if (btnSelectAllTabs) {
        btnSelectAllTabs.addEventListener('click', () => {
            document.querySelectorAll('.rbac-tab-chk').forEach(chk => { chk.checked = true; });
        });
    }

    if (btnSelectBasicTabs) {
        btnSelectBasicTabs.addEventListener('click', () => {
            const basicTabs = ['tab-trang-chu', 'tab-cap-phat-list', 'tab-kho-thiet-bi', 'tab-ho-tro', 'tab-tips'];
            document.querySelectorAll('.rbac-tab-chk').forEach(chk => {
                chk.checked = basicTabs.includes(chk.value);
            });
        });
    }

    if (btnToggleRbacPass) {
        btnToggleRbacPass.addEventListener('click', () => {
            const passInp = document.getElementById('rbac-user-password');
            if (!passInp) return;
            if (passInp.type === 'password') {
                passInp.type = 'text';
                btnToggleRbacPass.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
            } else {
                passInp.type = 'password';
                btnToggleRbacPass.innerHTML = '<i class="fa-regular fa-eye"></i>';
            }
        });
    }

    if (selectDefaultNewUserRole) {
        selectDefaultNewUserRole.value = rbacConfig.defaultNewUserRole || 'viewer';
        selectDefaultNewUserRole.addEventListener('change', async () => {
            if (!currentUserPerm || currentUserPerm.role !== 'admin') return;
            rbacConfig.defaultNewUserRole = selectDefaultNewUserRole.value;
            try {
                await savePermissionsConfig();
                showToast('Đã lưu cài đặt', 'Đã cập nhật quyền mặc định trên Supabase', 'success');
            } catch (err) {
                await syncPermissionsFromRemote().catch(() => {});
                selectDefaultNewUserRole.value = rbacConfig.defaultNewUserRole || 'viewer';
                showToast('Lỗi lưu phân quyền', err.message, 'error');
            }
        });
    }

    function resetFormPhanQuyen() {
        if (editIndexPhanQuyen) editIndexPhanQuyen.value = '';
        if (formPhanQuyen) formPhanQuyen.reset();
        const emailInp = document.getElementById('rbac-user-email');
        if (emailInp) emailInp.readOnly = false;
        const passInp = document.getElementById('rbac-user-password');
        if (passInp) passInp.type = 'password';
        if (btnToggleRbacPass) btnToggleRbacPass.innerHTML = '<i class="fa-regular fa-eye"></i>';
        const titleEl = document.getElementById('title-form-phan-quyen');
        if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-user-plus"></i> Thêm / Cấu Hình Phân Quyền Tài Khoản';
        const btnSave = document.getElementById('btn-save-phan-quyen');
        if (btnSave) btnSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Phân Quyền User';
        applyRolePresetToForm('viewer');
    }

    function returnToPhanQuyenTable() {
        resetFormPhanQuyen();
        showTabTableOnly('tab-phan-quyen');
    }

    if (btnOpenAddRbacUser) {
        btnOpenAddRbacUser.addEventListener('click', () => {
            resetFormPhanQuyen();
            showTabFormOnly('tab-phan-quyen');
        });
    }

    if (btnCancelPhanQuyen) btnCancelPhanQuyen.addEventListener('click', returnToPhanQuyenTable);
    if (btnBackPhanQuyen) btnBackPhanQuyen.addEventListener('click', returnToPhanQuyenTable);

    if (btnRefreshRbac) {
        btnRefreshRbac.addEventListener('click', async () => {
            await syncPermissionsFromRemote();
            const loggedUser = localStorage.getItem('erg_asset_user');
            if (loggedUser) resolveUserPermissions(loggedUser);
            applyUserPermissionsUI();
            renderPhanQuyen();
            showToast('Đã làm mới', 'Đã đồng bộ danh sách phân quyền mới nhất!', 'success');
        });
    }

    function updateRbacStats() {
        const users = (rbacConfig && Array.isArray(rbacConfig.users)) ? rbacConfig.users : [];
        const totalEl = document.getElementById('rbac-stat-total');
        const adminEl = document.getElementById('rbac-stat-admin');
        const editorEl = document.getElementById('rbac-stat-editor');
        const viewerEl = document.getElementById('rbac-stat-viewer');

        if (totalEl) totalEl.textContent = users.length;
        if (adminEl) adminEl.textContent = users.filter(u => u.role === 'admin').length;
        if (editorEl) editorEl.textContent = users.filter(u => u.role === 'editor').length;
        if (viewerEl) viewerEl.textContent = users.filter(u => u.role !== 'admin' && u.role !== 'editor').length;

        if (selectDefaultNewUserRole) {
            selectDefaultNewUserRole.value = rbacConfig.defaultNewUserRole || 'viewer';
        }
    }

    function renderPhanQuyen() {
        if (!tbodyPhanQuyen) return;
        updateRbacStats();

        const keyword = (searchPhanQuyen ? searchPhanQuyen.value.trim().toLowerCase() : '');
        const roleFilter = (filterRolePhanQuyen ? filterRolePhanQuyen.value : 'all');
        const users = (rbacConfig && Array.isArray(rbacConfig.users)) ? rbacConfig.users : [];

        const filtered = users.filter(u => {
            const matchRole = !roleFilter || roleFilter === 'all' || (u.role || 'viewer') === roleFilter;
            const matchKw = !keyword ||
                (u.email || '').toLowerCase().includes(keyword) ||
                (u.displayName || '').toLowerCase().includes(keyword) ||
                (u.dept || '').toLowerCase().includes(keyword);
            return matchRole && matchKw;
        });

        tbodyPhanQuyen.innerHTML = '';

        if (filtered.length === 0) {
            tbodyPhanQuyen.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7" class="text-center text-muted" style="padding: 28px;">
                        Chưa có tài khoản nào khớp bộ lọc tìm kiếm!
                    </td>
                </tr>
            `;
            return;
        }

        const currentEmail = normalizeUserEmail(localStorage.getItem('erg_asset_user') || '');

        filtered.forEach((u, idx) => {
            const originalIndex = users.indexOf(u);
            const tr = document.createElement('tr');
            const isSelf = normalizeUserEmail(u.email) === currentEmail;

            // Role badge
            let roleBadge = `<span class="badge-role-viewer"><i class="fa-solid fa-eye"></i> Chỉ xem (Viewer)</span>`;
            if (u.role === 'admin') {
                roleBadge = `<span class="badge-role-admin"><i class="fa-solid fa-crown"></i> Quản trị viên (Admin)</span>`;
            } else if (u.role === 'editor') {
                roleBadge = `<span class="badge-role-editor"><i class="fa-solid fa-user-gear"></i> Quản lý / Kỹ thuật</span>`;
            }

            // Action badges
            const actPills = [];
            if (u.role === 'admin' || u.canAdd) actPills.push(`<span class="rbac-perm-pill active"><i class="fa-solid fa-plus"></i> Thêm</span>`);
            if (u.role === 'admin' || u.canEdit) actPills.push(`<span class="rbac-perm-pill active"><i class="fa-solid fa-pen"></i> Sửa</span>`);
            if (u.role === 'admin' || u.canDelete) actPills.push(`<span class="rbac-perm-pill active"><i class="fa-solid fa-trash"></i> Xóa</span>`);
            if (u.role === 'admin' || u.canExport) actPills.push(`<span class="rbac-perm-pill active"><i class="fa-solid fa-file-export"></i> Export</span>`);
            if (actPills.length === 0) {
                actPills.push(`<span class="rbac-perm-pill"><i class="fa-solid fa-lock"></i> Chỉ xem</span>`);
            }

            // Allowed tabs summary
            const tabs = u.role === 'admin' ? ALL_CONFIGURABLE_TABS.map(t => t.id) : (Array.isArray(u.allowedTabs) ? u.allowedTabs : []);
            let tabsHtml = '';
            if (u.role === 'admin' || tabs.length >= ALL_CONFIGURABLE_TABS.length) {
                tabsHtml = `<span class="badge badge-green" style="font-size: 11.5px;"><i class="fa-solid fa-check-double"></i> Toàn bộ (${ALL_CONFIGURABLE_TABS.length} Tab)</span>`;
            } else {
                const labels = tabs.map(t => TAB_LABELS_MAP[t] || t);
                tabsHtml = `<div style="display:flex; flex-wrap:wrap; gap:4px;">` +
                    labels.map(l => `<span class="rbac-perm-pill" style="color: var(--text-primary); border-color: rgba(148,163,184,0.28);">${escapeHtml(l)}</span>`).join('') +
                    `</div>`;
            }

            // Status badge
            const isActive = u.isActive !== false;
            const statusHtml = isActive
                ? `<span class="badge badge-green" style="cursor:pointer;" title="Nhấn để khóa tạm thời tài khoản này" data-toggle-status="${originalIndex}"><i class="fa-solid fa-circle-check"></i> Hoạt động</span>`
                : `<span class="badge badge-danger" style="cursor:pointer;" title="Nhấn để mở khóa tài khoản này" data-toggle-status="${originalIndex}"><i class="fa-solid fa-ban"></i> Đã khóa</span>`;

            tr.innerHTML = `
                <td class="text-center" style="font-weight: 600; color: var(--text-muted);">${idx + 1}</td>
                <td>
                    <div style="font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-envelope" style="color: #818cf8; font-size: 12px;"></i>
                        <span>${escapeHtml(u.email)}</span>
                        ${isSelf ? `<span class="badge" style="background: rgba(123,202,15,0.18); color: var(--brand-green); font-size: 10px; padding: 2px 6px;">Bạn</span>` : ''}
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px;">
                        <strong>${escapeHtml(u.displayName || '—')}</strong> ${u.dept ? `• <span style="color: var(--text-muted);">${escapeHtml(u.dept)}</span>` : ''}
                    </div>
                </td>
                <td>${roleBadge}</td>
                <td><div style="display:flex; flex-wrap:wrap; gap:4px;">${actPills.join('')}</div></td>
                <td>${tabsHtml}</td>
                <td>
                    ${statusHtml}
                    ${u.updatedAt ? `<div style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px;">Cập nhật: ${escapeHtml(u.updatedAt)}</div>` : ''}
                </td>
                <td>
                    <div class="actions-cell">
                        <button type="button" class="btn-icon-only edit btn-edit-rbac" data-index="${originalIndex}" title="Chỉnh sửa phân quyền">
                            <i class="fa-solid fa-user-pen"></i>
                        </button>
                        <button type="button" class="btn-icon-only delete btn-delete-rbac" data-index="${originalIndex}" title="Xóa tài khoản khỏi danh sách">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbodyPhanQuyen.appendChild(tr);
        });

        // Bind edit / delete / status toggle events
        tbodyPhanQuyen.querySelectorAll('.btn-edit-rbac').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                editPhanQuyen(idx);
            });
        });

        tbodyPhanQuyen.querySelectorAll('.btn-delete-rbac').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                deletePhanQuyen(idx);
            });
        });

        tbodyPhanQuyen.querySelectorAll('[data-toggle-status]').forEach(badge => {
            badge.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-toggle-status'));
                toggleRbacUserStatus(idx);
            });
        });
    }

    function editPhanQuyen(index) {
        const users = (rbacConfig && Array.isArray(rbacConfig.users)) ? rbacConfig.users : [];
        const u = users[index];
        if (!u) return;

        showTabFormOnly('tab-phan-quyen');
        if (editIndexPhanQuyen) editIndexPhanQuyen.value = index;

        const titleEl = document.getElementById('title-form-phan-quyen');
        if (titleEl) {
            titleEl.innerHTML = `<i class="fa-solid fa-user-pen"></i> Cập Nhật Phân Quyền: <span style="color: #818cf8;">${escapeHtml(u.email)}</span>`;
        }
        const btnSave = document.getElementById('btn-save-phan-quyen');
        if (btnSave) {
            btnSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Cập Nhật Phân Quyền';
        }

        const emailInp = document.getElementById('rbac-user-email');
        if (emailInp) emailInp.value = u.email || '';
        const nameInp = document.getElementById('rbac-user-name');
        if (nameInp) nameInp.value = u.displayName || '';
        const deptInp = getRbacNoteInput();
        if (deptInp) deptInp.value = u.dept || '';
        const passInp = document.getElementById('rbac-user-password');
        if (passInp) passInp.value = '';
        const statusSel = document.getElementById('rbac-user-status');
        if (statusSel) statusSel.value = u.isActive === false ? 'locked' : 'active';

        const role = u.role || 'viewer';
        highlightRolePresetCard(role);

        const chkAdd = document.getElementById('rbac-act-add');
        const chkEdit = document.getElementById('rbac-act-edit');
        const chkDelete = document.getElementById('rbac-act-delete');
        const chkExport = document.getElementById('rbac-act-export');

        if (chkAdd) chkAdd.checked = role === 'admin' ? true : !!u.canAdd;
        if (chkEdit) chkEdit.checked = role === 'admin' ? true : !!u.canEdit;
        if (chkDelete) chkDelete.checked = role === 'admin' ? true : !!u.canDelete;
        if (chkExport) chkExport.checked = role === 'admin' ? true : !!u.canExport;

        const allowed = role === 'admin'
            ? ALL_CONFIGURABLE_TABS.map(t => t.id)
            : (Array.isArray(u.allowedTabs) ? u.allowedTabs : getRolePresetPermissions(role).allowedTabs);

        document.querySelectorAll('.rbac-tab-chk').forEach(chk => {
            chk.checked = allowed.includes(chk.value);
        });

        document.querySelector('.tab-container').scrollTop = 0;
    }

    async function deletePhanQuyen(index) {
        const users = (rbacConfig && Array.isArray(rbacConfig.users)) ? rbacConfig.users : [];
        const u = users[index];
        if (!u) return;

        // Prevent deleting the last active Admin
        const activeAdmins = users.filter((item, i) => i !== index && item.role === 'admin' && item.isActive !== false);
        if (u.role === 'admin' && activeAdmins.length === 0) {
            showToast('Không thể xóa', 'Hệ thống phải có ít nhất 1 tài khoản Quản trị viên (Admin) đang hoạt động!', 'error');
            return;
        }

        if (confirm(`Bạn có chắc chắn muốn xóa phân quyền của tài khoản "${u.email}"?`)) {
            users.splice(index, 1);
            try {
                await savePermissionsConfig();
                renderPhanQuyen();
                showToast('Đã xóa', `Đã xóa cấu hình phân quyền của ${u.email}!`, 'warning');
            } catch (err) {
                await syncPermissionsFromRemote().catch(() => {});
                renderPhanQuyen();
                showToast('Lỗi xóa phân quyền', err.message, 'error');
            }
        }
    }

    async function toggleRbacUserStatus(index) {
        const users = (rbacConfig && Array.isArray(rbacConfig.users)) ? rbacConfig.users : [];
        const u = users[index];
        if (!u) return;

        const nextActive = u.isActive === false;
        if (!nextActive && u.role === 'admin') {
            const otherActiveAdmins = users.filter((item, i) => i !== index && item.role === 'admin' && item.isActive !== false);
            if (otherActiveAdmins.length === 0) {
                showToast('Không thể khóa', 'Không thể khóa tài khoản Admin duy nhất đang hoạt động!', 'error');
                return;
            }
        }

        u.isActive = nextActive;
        try {
            await savePermissionsConfig();
            renderPhanQuyen();
            showToast(nextActive ? 'Đã mở khóa' : 'Đã khóa tài khoản',
                `Tài khoản ${u.email} hiện đang ở trạng thái: ${nextActive ? 'Hoạt động' : 'Đã khóa truy cập'}!`,
                nextActive ? 'success' : 'warning');
        } catch (err) {
            await syncPermissionsFromRemote().catch(() => {});
            renderPhanQuyen();
            showToast('Lỗi cập nhật trạng thái', err.message, 'error');
        }
    }

    if (searchPhanQuyen) {
        searchPhanQuyen.addEventListener('input', () => renderPhanQuyen());
    }
    if (filterRolePhanQuyen) {
        filterRolePhanQuyen.addEventListener('change', () => renderPhanQuyen());
    }

    if (formPhanQuyen) {
        formPhanQuyen.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUserPerm || currentUserPerm.role !== 'admin') {
                showToast('Từ chối truy cập', 'Chỉ Quản trị viên (Admin) mới được phép thay đổi phân quyền!', 'error');
                return;
            }

            const rawEmail = (document.getElementById('rbac-user-email')?.value || '').trim();
            if (!rawEmail) {
                showToast('Thiếu thông tin', 'Vui lòng nhập Email đăng nhập của người dùng!', 'warning');
                return;
            }
            const email = normalizeUserEmail(rawEmail);
            const displayName = (document.getElementById('rbac-user-name')?.value || '').trim() || email.split('@')[0];
            const dept = (getRbacNoteInput()?.value || '').trim();
            const rawPassword = (document.getElementById('rbac-user-password')?.value || '').trim();
            const statusVal = document.getElementById('rbac-user-status')?.value || 'active';
            const isActive = statusVal !== 'locked';
            const role = getRbacRoleInput()?.value || 'viewer';
            const syncSupabaseAuth = document.getElementById('rbac-sync-supabase-auth')?.checked;

            const canAdd = role === 'admin' ? true : !!document.getElementById('rbac-act-add')?.checked;
            const canEdit = role === 'admin' ? true : !!document.getElementById('rbac-act-edit')?.checked;
            const canDelete = role === 'admin' ? true : !!document.getElementById('rbac-act-delete')?.checked;
            const canExport = role === 'admin' ? true : !!document.getElementById('rbac-act-export')?.checked;

            const allowedTabs = [];
            document.querySelectorAll('.rbac-tab-chk').forEach(chk => {
                if (chk.checked || role === 'admin') {
                    allowedTabs.push(chk.value);
                }
            });

            if (allowedTabs.length === 0) {
                showToast('Chưa chọn Tab', 'Vui lòng chọn ít nhất 1 Tab được phép hiển thị cho người dùng này!', 'warning');
                return;
            }

            const editIdxStr = editIndexPhanQuyen ? editIndexPhanQuyen.value : '';
            const users = (rbacConfig && Array.isArray(rbacConfig.users)) ? rbacConfig.users : [];

            // Check duplicate email when adding new or changing email
            const existingIdx = users.findIndex(u => normalizeUserEmail(u.email) === email);
            const targetIdx = editIdxStr !== '' ? parseInt(editIdxStr) : existingIdx;

            // Prevent demoting or locking the last active Admin
            if (targetIdx !== -1 && users[targetIdx]) {
                const prevUser = users[targetIdx];
                if (prevUser.role === 'admin' && (role !== 'admin' || !isActive)) {
                    const otherActiveAdmins = users.filter((item, i) => i !== targetIdx && item.role === 'admin' && item.isActive !== false);
                    if (otherActiveAdmins.length === 0) {
                        showToast('Cảnh báo an toàn', 'Hệ thống phải giữ ít nhất 1 tài khoản Admin đang hoạt động! Không thể hạ quyền hoặc khóa Admin cuối cùng.', 'error');
                        return;
                    }
                }
            }

            const nowStr = formatDateDMY(new Date());
            const prevRecord = (targetIdx >= 0 && users[targetIdx]) ? users[targetIdx] : {};

            const userObj = {
                ...prevRecord,
                email: email,
                displayName: displayName,
                dept: dept,
                role: role,
                isActive: isActive,
                canAdd: canAdd,
                canEdit: canEdit,
                canDelete: canDelete,
                canExport: canExport,
                allowedTabs: allowedTabs,
                updatedAt: nowStr
            };

            // Optional: Register on Supabase Auth using isolated non-persisting client
            let supabaseSignUpMsg = '';
            if (rawPassword && rawPassword.length < 6) {
                showToast('Mật khẩu quá ngắn', 'Mật khẩu Supabase Auth cần ít nhất 6 ký tự.', 'error');
                return;
            }
            if (rawPassword && targetIdx >= 0) {
                showToast('Không thể đổi mật khẩu', 'Đổi mật khẩu tài khoản đã có qua Supabase Auth hoặc chức năng khôi phục mật khẩu.', 'error');
                return;
            }
            if (rawPassword && !syncSupabaseAuth) {
                showToast('Chưa tạo tài khoản', 'Mật khẩu chỉ được dùng khi đăng ký Supabase Auth.', 'error');
                return;
            }

            if (targetIdx >= 0 && targetIdx < users.length) {
                users[targetIdx] = userObj;
            } else {
                users.push(userObj);
            }

            rbacConfig.users = users;
            try {
                await savePermissionsConfig();
            } catch (err) {
                await syncPermissionsFromRemote().catch(() => {});
                showToast('Lỗi lưu phân quyền', err.message, 'error');
                return;
            }

            // Permission commit comes first; Auth signup is a separate operation.
            if (rawPassword && syncSupabaseAuth && window.supabase && typeof window.supabase.createClient === 'function') {
                try {
                    const isolatedClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
                        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
                    });
                    const { error: signUpErr } = await isolatedClient.auth.signUp({
                        email: email,
                        password: rawPassword,
                        options: {
                            data: { full_name: displayName, department: dept, role: role }
                        }
                    });
                    if (!signUpErr) {
                        supabaseSignUpMsg = ' (Đã gửi yêu cầu tạo tài khoản Supabase Auth; có thể cần xác nhận email)';
                    } else {
                        throw new Error(signUpErr.message || 'Không thể tạo tài khoản Supabase Auth');
                    }
                } catch (e) {
                    supabaseSignUpMsg = ' (chưa tạo được Supabase Auth: ' + (e.message || 'lỗi xác thực') + ')';
                    showToast('Quyền đã lưu, tài khoản chưa tạo', e.message || 'Không thể tạo Supabase Auth', 'warning');
                }
            }

            // If Admin edited their own permissions or current logged-in user, re-apply immediately
            const currentLoggedEmail = normalizeUserEmail(localStorage.getItem('erg_asset_user') || '');
            if (currentLoggedEmail === email) {
                resolveUserPermissions(currentLoggedEmail);
                applyUserPermissionsUI();
            }

            renderPhanQuyen();
            returnToPhanQuyenTable();
            showToast('Đã lưu phân quyền', `Cấu hình phân quyền cho "${email}" đã được áp dụng${supabaseSignUpMsg}!`, 'success');
        });
    }

    // Toggle Password Visibility on Login Screen (Delegates to centralized toggleLoginPassword)
    if (btnToggleLoginPass) {
        btnToggleLoginPass.onclick = (e) => {
            if (typeof window.toggleLoginPassword === 'function') {
                window.toggleLoginPassword(e);
            } else {
                const passInput = document.getElementById('login-password');
                if (!passInput) return;
                if (passInput.type === 'password') {
                    passInput.type = 'text';
                    btnToggleLoginPass.innerHTML = '<i class="fa-solid fa-eye-slash" id="icon-login-pass"></i>';
                    btnToggleLoginPass.classList.add('active');
                } else {
                    passInput.type = 'password';
                    btnToggleLoginPass.innerHTML = '<i class="fa-solid fa-eye" id="icon-login-pass"></i>';
                    btnToggleLoginPass.classList.remove('active');
                }
            }
        };
    }

    // Handle Login Form Submit via Supabase Auth + RBAC Verification
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rawUser = (document.getElementById('login-username')?.value || '').trim();
            const rawPass = (document.getElementById('login-password')?.value || '').trim();

            // Clear any previous error message
            const errDiv = document.getElementById('login-error-msg');
            if (errDiv) errDiv.classList.add('hidden');

            if (!rawUser || !rawPass) {
                const msg = 'Vui lòng nhập đầy đủ Email và Mật khẩu!';
                if (errDiv) {
                    errDiv.textContent = msg;
                    errDiv.classList.remove('hidden');
                }
                showToast('Thiếu thông tin', msg, 'warning');
                return;
            }

            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            const originalText = btnSubmit ? btnSubmit.innerHTML : 'Đăng nhập';
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xác thực & kiểm tra phân quyền...';
            }

            // Normalise Email: If user types username without @domain, auto-append @erasgroup.vn
            const emailToAuth = normalizeUserEmail(rawUser);

            try {
                if (!supabaseClient) throw new Error('Không thể kết nối Supabase Auth');
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: emailToAuth,
                    password: rawPass
                });
                if (error || !data?.user) {
                    throw new Error(error?.message || 'Email hoặc mật khẩu không chính xác');
                }
                const authenticatedEmail = normalizeUserEmail(data.user.email || emailToAuth);
                await syncPermissionsFromRemote();

                // 4. Resolve RBAC permissions for the authenticated user
                const perm = resolveUserPermissions(authenticatedEmail);
                if (!perm) throw new Error('Tài khoản chưa được cấp quyền hoặc đã bị khóa');

                localStorage.removeItem('erg_asset_logged_in');
                localStorage.setItem('erg_asset_user', authenticatedEmail);

                // 5. Apply RBAC UI restrictions (hide disallowed tabs & action buttons)
                applyUserPermissionsUI();

                const roleLabel = perm?.role === 'admin' ? 'Quản trị viên (Admin)' : (perm?.role === 'editor' ? 'Quản lý / Kỹ thuật' : 'Chỉ xem (Viewer)');
                showToast('Đăng nhập thành công', `Xin chào ${perm?.displayName || authenticatedEmail} (${roleLabel})!`, 'success');

                if (loginScreen) loginScreen.classList.add('hidden');
                if (appContainer) appContainer.classList.remove('hidden');

                const targetTab = getFirstAllowedTab();
                switchToTab(targetTab);

                initApp().catch(err => console.warn("Background initApp error:", err));
                renderDashboard();

            } catch (err) {
                currentUserPerm = null;
                await supabaseClient?.auth.signOut().catch(() => {});
                console.error("Login Error:", err);
                if (errDiv) {
                    errDiv.textContent = 'Đăng nhập thất bại: ' + (err.message || 'Lỗi xác thực!');
                    errDiv.classList.remove('hidden');
                    errDiv.style.animation = 'none';
                    errDiv.offsetHeight; /* trigger reflow */
                    errDiv.style.animation = '';
                }
                showToast('Lỗi đăng nhập', err.message || 'Đăng nhập không thành công!', 'error');
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalText;
                }
            }
        });
    }

    // -------------------------------------------------------------------------
    // Centralized, Resilient Logout System (Never hangs on network)
    // -------------------------------------------------------------------------
    async function performAppLogout() {
        if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) return;

        // 1. Immediately wipe all local authentication & session state
        try {
            currentUserPerm = null;
            localStorage.removeItem('erg_asset_logged_in');
            localStorage.removeItem('erg_asset_user');
            localStorage.removeItem('erg_asset_active_tab');

            // Wipe all Supabase auth storage tokens
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase') || key.startsWith('erg_'))) {
                    localStorage.removeItem(key);
                }
            }
            sessionStorage.clear();
        } catch (storageErr) {
            console.warn('Storage wipe error:', storageErr);
        }

        // 2. Immediately switch UI to login screen without waiting
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');

        // Reset inputs
        const userInput = document.getElementById('login-username');
        const passInput = document.getElementById('login-password');
        if (userInput) userInput.value = '';
        if (passInput) passInput.value = '';

        showToast('Đã đăng xuất', 'Đang chuyển về màn hình đăng nhập...', 'info');

        // 3. Best-effort Supabase signOut with strict 400ms timeout (never hangs!)
        try {
            if (supabaseClient && supabaseClient.auth) {
                await Promise.race([
                    supabaseClient.auth.signOut(),
                    new Promise(resolve => setTimeout(resolve, 400))
                ]);
            }
        } catch (signOutErr) {
            console.warn('Supabase signOut error:', signOutErr);
        }

        // 4. Clean redirect: strip any ?autologin=1 or ?admin=1 from the URL bar!
        const cleanUrl = window.location.origin + window.location.pathname;
        if (window.location.search || window.location.hash) {
            window.location.replace(cleanUrl);
        } else {
            window.location.reload();
        }
    }

    // Expose globally for instant inline triggering
    window.performAppLogout = performAppLogout;

    // Attach to Header logout button
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            performAppLogout();
        };
    }

    // Attach to Sidebar logout button
    const btnLogoutSidebar = document.getElementById('btn-logout-sidebar');
    if (btnLogoutSidebar) {
        btnLogoutSidebar.onclick = (e) => {
            e.preventDefault();
            performAppLogout();
        };
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
    const btnSwitchToHandover = document.getElementById('btn-switch-to-handover');

    const btnShowHandoverModal = document.getElementById('btn-show-handover-modal');
    const modalHandoverPreview = document.getElementById('modal-handover-preview');
    const btnCloseHandoverModal = document.getElementById('btn-close-handover-modal');
    const btnExportHandoverPngIcon = document.getElementById('btn-export-handover-png-icon');
    const btnSwitchToUserCard = document.getElementById('btn-switch-to-user-card');

    const modalExportUserOptions = document.getElementById('modal-export-user-options');
    const btnCloseModalExportUser = document.getElementById('btn-close-modal-export-user');
    const optExportHandover = document.getElementById('opt-export-handover');
    const optExportCard = document.getElementById('opt-export-card');

    let currentExportItem = null;
    let currentExportUserId = '';

    // Function mở modal lựa chọn mẫu xuất thông tin cho nhân viên từ bảng
    function openExportModalForUser(index) {
        if (index < 0 || index >= thietBiList.length) return;
        const item = thietBiList[index];
        currentExportItem = item;
        currentExportUserId = (item.userId || '').trim();

        if (modalExportUserOptions) {
            const nameEl = document.getElementById('export-modal-user-name');
            const idEl = document.getElementById('export-modal-user-id');
            if (nameEl) nameEl.innerText = item.userName || 'Chưa cập nhật';
            if (idEl) idEl.innerText = item.userId ? `(${item.userId})` : '';
            modalExportUserOptions.style.display = 'flex';
        }
    }

    function closeExportUserModal() {
        if (modalExportUserOptions) {
            modalExportUserOptions.style.display = 'none';
        }
    }

    if (btnCloseModalExportUser) {
        btnCloseModalExportUser.addEventListener('click', closeExportUserModal);
    }
    if (modalExportUserOptions) {
        modalExportUserOptions.addEventListener('click', (e) => {
            if (e.target === modalExportUserOptions) closeExportUserModal();
        });
    }

    if (optExportHandover) {
        optExportHandover.addEventListener('click', () => {
            closeExportUserModal();
            showHandoverModal(currentExportItem);
        });
    }

    if (optExportCard) {
        optExportCard.addEventListener('click', () => {
            closeExportUserModal();
            showUserCardModal(currentExportItem);
        });
    }

    // Function hiển thị Thẻ Thông Tin Nhân Viên
    function showUserCardModal(item = null) {
        currentExportItem = item;
        let userId = '';
        let userName = '';
        let userTitle = '';
        let userDept = '';
        let userEmail = '';
        let userPhone = '';

        if (item) {
            userId = (item.userId || '').trim();
            userName = (item.userName || '').trim();
            userTitle = item.userTitle || 'Chưa cập nhật chức danh';
            userDept = item.userDept || 'Chưa cập nhật phòng ban';
            userEmail = item.userEmail || '—';
            userPhone = item.userPhone || '—';
        } else {
            userId = (document.getElementById('user-id') ? document.getElementById('user-id').value.trim() : '');
            userName = (document.getElementById('user-name') ? document.getElementById('user-name').value.trim() : '');
            userTitle = (document.getElementById('user-title') ? document.getElementById('user-title').value.trim() : '') || 'Chưa cập nhật chức danh';
            userDept = (document.getElementById('user-dept') ? document.getElementById('user-dept').value.trim() : '') || 'Chưa cập nhật phòng ban';
            userEmail = (document.getElementById('user-email') ? document.getElementById('user-email').value.trim() : '') || '—';
            userPhone = (document.getElementById('user-phone') ? document.getElementById('user-phone').value.trim() : '') || '—';

            if (!userId || !userName) {
                showToast('Thông báo', 'Vui lòng nhập ít nhất ID và Họ và Tên của nhân viên để xem thẻ!', 'warning');
                return;
            }
        }

        currentExportUserId = userId || 'user';

        if (document.getElementById('preview-user-id')) document.getElementById('preview-user-id').innerText = userId;
        if (document.getElementById('preview-user-name')) document.getElementById('preview-user-name').innerText = userName || '—';
        if (document.getElementById('preview-user-title')) document.getElementById('preview-user-title').innerText = userTitle;
        if (document.getElementById('preview-user-dept')) document.getElementById('preview-user-dept').innerText = userDept;
        if (document.getElementById('preview-user-email')) document.getElementById('preview-user-email').innerText = userEmail;
        if (document.getElementById('preview-user-phone')) document.getElementById('preview-user-phone').innerText = userPhone;

        if (modalUserPreview) {
            modalUserPreview.classList.remove('hidden');
        }
    }

    // Function hiển thị Biên Bản Bàn Giao Thiết Bị
    function showHandoverModal(item = null) {
        currentExportItem = item;
        let userId = '';
        let userName = '';
        let userTitle = '';
        let userDept = '';
        let userEmail = '';

        let devName = '';
        let devMain = '';
        let devCpu = '';
        let devRamText = '—';
        let devDiskText = '—';
        let devMonitorText = '—';
        let devMonitorSnText = '—';
        let devSn = '—';
        let devKeyboard = '—';
        let devMouse = '—';
        let keyWin = '—';
        let keyOffice = '—';
        let keyPdf = '—';
        let devApps = '—';
        let devNotes = '—';

        if (item) {
            userId = (item.userId || '').trim();
            userName = (item.userName || '').trim();
            userTitle = item.userTitle || '—';
            userDept = item.userDept || '—';
            userEmail = item.userEmail || '—';

            devName = item.devType || item.devName || '—';
            devMain = item.devMain || '—';
            devCpu = item.devCpu || '—';

            const ramVal = item.devRam || '';
            const ramSlotsVal = item.devRamSlots || '';
            devRamText = ramVal ? `${ramVal} ${ramSlotsVal ? `(${ramSlotsVal})` : ''}` : '—';

            const ssdVal = item.devSsd || '';
            const ssdVal2 = item.devSsd2 || '';
            const hddVal = item.devHdd || '';
            const hddVal2 = item.devHdd2 || '';
            let diskParts = [];
            const ssdFull = [ssdVal, ssdVal2].filter(Boolean).join(' + ');
            if (ssdFull) diskParts.push(`SSD: ${ssdFull}`);
            const hddFull = [hddVal, hddVal2].filter(Boolean).join(' + ');
            if (hddFull) diskParts.push(`HDD: ${hddFull}`);
            devDiskText = diskParts.join(' / ') || '—';

            const monVal = item.devMonitor || '';
            const monVal2 = item.devMonitor2 || '';
            devMonitorText = [monVal, monVal2].filter(Boolean).join(' | ') || '—';

            const monSnVal = item.devMonitorSn || '';
            const monSnVal2 = item.devMonitorSn2 || '';
            devMonitorSnText = [monSnVal, monSnVal2].filter(Boolean).join(' | ') || '—';

            devSn = item.devSn || '—';
            devKeyboard = item.devKeyboard || '—';
            devMouse = item.devMouse || '—';

            keyWin = item.keyWin || '—';
            keyOffice = item.keyOffice || '—';
            keyPdf = item.keyPdf || '—';

            devApps = item.devApps || '—';
            devNotes = item.devNotes || '—';
        } else {
            userId = (document.getElementById('user-id') ? document.getElementById('user-id').value.trim() : '');
            userName = (document.getElementById('user-name') ? document.getElementById('user-name').value.trim() : '');

            if (!userId || !userName) {
                showToast('Thông báo', 'Vui lòng nhập ID và Họ tên người sử dụng trước khi xem thông tin bàn giao!', 'warning');
                return;
            }

            userTitle = (document.getElementById('user-title') ? document.getElementById('user-title').value.trim() : '') || '—';
            userDept = (document.getElementById('user-dept') ? document.getElementById('user-dept').value.trim() : '') || '—';
            userEmail = (document.getElementById('user-email') ? document.getElementById('user-email').value.trim() : '') || '—';

            devName = (document.getElementById('dev-type') ? document.getElementById('dev-type').value.trim() : '') || '—';
            devMain = (document.getElementById('dev-main') ? document.getElementById('dev-main').value.trim() : '') || '—';
            devCpu = (document.getElementById('dev-cpu') ? document.getElementById('dev-cpu').value.trim() : '') || '—';

            const ramVal = document.getElementById('dev-ram') ? document.getElementById('dev-ram').value : '';
            const ramSlotsVal = document.getElementById('dev-ram-slots') ? document.getElementById('dev-ram-slots').value : '';
            devRamText = ramVal ? `${ramVal} ${ramSlotsVal ? `(${ramSlotsVal})` : ''}` : '—';

            const ssdVal = document.getElementById('dev-ssd') ? document.getElementById('dev-ssd').value.trim() : '';
            const ssdVal2 = document.getElementById('dev-ssd-2') ? document.getElementById('dev-ssd-2').value.trim() : '';
            const hddVal = document.getElementById('dev-hdd') ? document.getElementById('dev-hdd').value.trim() : '';
            const hddVal2 = document.getElementById('dev-hdd-2') ? document.getElementById('dev-hdd-2').value.trim() : '';
            let diskParts = [];
            const ssdFull = [ssdVal, ssdVal2].filter(Boolean).join(' + ');
            if (ssdFull) diskParts.push(`SSD: ${ssdFull}`);
            const hddFull = [hddVal, hddVal2].filter(Boolean).join(' + ');
            if (hddFull) diskParts.push(`HDD: ${hddFull}`);
            devDiskText = diskParts.join(' / ') || '—';

            const monVal = document.getElementById('dev-monitor') ? document.getElementById('dev-monitor').value.trim() : '';
            const monVal2 = document.getElementById('dev-monitor-2') ? document.getElementById('dev-monitor-2').value.trim() : '';
            devMonitorText = [monVal, monVal2].filter(Boolean).join(' | ') || '—';

            const monSnVal = document.getElementById('dev-monitor-sn') ? document.getElementById('dev-monitor-sn').value.trim() : '';
            const monSnVal2 = document.getElementById('dev-monitor-sn-2') ? document.getElementById('dev-monitor-sn-2').value.trim() : '';
            devMonitorSnText = [monSnVal, monSnVal2].filter(Boolean).join(' | ') || '—';

            devSn = (document.getElementById('dev-sn') ? document.getElementById('dev-sn').value.trim() : '') || '—';
            devKeyboard = (document.getElementById('dev-keyboard') ? document.getElementById('dev-keyboard').value : '') || '—';
            devMouse = (document.getElementById('dev-mouse') ? document.getElementById('dev-mouse').value : '') || '—';

            keyWin = (document.getElementById('key-win') ? document.getElementById('key-win').value.trim() : '') || '—';
            keyOffice = (document.getElementById('key-office') ? document.getElementById('key-office').value.trim() : '') || '—';
            keyPdf = (document.getElementById('key-pdf') ? document.getElementById('key-pdf').value.trim() : '') || '—';

            devApps = (document.getElementById('dev-apps') ? document.getElementById('dev-apps').value.trim() : '') || '—';
            devNotes = (document.getElementById('dev-notes') ? document.getElementById('dev-notes').value.trim() : '') || '—';
        }

        currentExportUserId = userId || 'user';

        if (document.getElementById('receipt-user-name')) document.getElementById('receipt-user-name').innerText = userName || '—';
        if (document.getElementById('receipt-user-title')) document.getElementById('receipt-user-title').innerText = userTitle;
        if (document.getElementById('receipt-user-dept')) document.getElementById('receipt-user-dept').innerText = userDept;
        if (document.getElementById('receipt-user-email')) document.getElementById('receipt-user-email').innerText = userEmail;

        if (document.getElementById('receipt-dev-name')) document.getElementById('receipt-dev-name').innerText = devName;
        if (document.getElementById('receipt-dev-main')) document.getElementById('receipt-dev-main').innerText = devMain;
        if (document.getElementById('receipt-dev-cpu')) document.getElementById('receipt-dev-cpu').innerText = devCpu;
        if (document.getElementById('receipt-dev-ram')) document.getElementById('receipt-dev-ram').innerText = devRamText;
        if (document.getElementById('receipt-dev-disk')) document.getElementById('receipt-dev-disk').innerText = devDiskText;
        if (document.getElementById('receipt-dev-monitor')) document.getElementById('receipt-dev-monitor').innerText = devMonitorText;
        if (document.getElementById('receipt-dev-monitor-sn')) document.getElementById('receipt-dev-monitor-sn').innerText = devMonitorSnText;
        if (document.getElementById('receipt-dev-sn')) document.getElementById('receipt-dev-sn').innerText = devSn;
        if (document.getElementById('receipt-dev-keyboard')) document.getElementById('receipt-dev-keyboard').innerText = devKeyboard;
        if (document.getElementById('receipt-dev-mouse')) document.getElementById('receipt-dev-mouse').innerText = devMouse;

        if (document.getElementById('receipt-key-win')) document.getElementById('receipt-key-win').innerText = keyWin;
        if (document.getElementById('receipt-key-office')) document.getElementById('receipt-key-office').innerText = keyOffice;
        if (document.getElementById('receipt-key-pdf')) document.getElementById('receipt-key-pdf').innerText = keyPdf;

        if (document.getElementById('receipt-dev-apps')) document.getElementById('receipt-dev-apps').innerText = devApps;
        if (document.getElementById('receipt-dev-notes')) document.getElementById('receipt-dev-notes').innerText = devNotes;

        if (document.getElementById('receipt-user-sign-name')) document.getElementById('receipt-user-sign-name').innerText = userName || '—';

        const today = new Date();
        const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        if (document.getElementById('receipt-handover-date')) {
            document.getElementById('receipt-handover-date').innerText = `Ngày bàn giao: ${dateStr}`;
        }

        if (modalHandoverPreview) {
            modalHandoverPreview.classList.remove('hidden');
        }
    }

    // 1. Click title to show User Info Card Preview popup from form
    if (titleUserInfo) {
        titleUserInfo.addEventListener('click', () => {
            showUserCardModal(null);
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

    // Switch from User Card to Handover modal
    if (btnSwitchToHandover) {
        btnSwitchToHandover.addEventListener('click', () => {
            if (modalUserPreview) modalUserPreview.classList.add('hidden');
            showHandoverModal(currentExportItem);
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
            const userId = currentExportUserId || (document.getElementById('user-id') ? document.getElementById('user-id').value.trim() : '') || 'user';
            
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

    // 3. Show Handover Receipt Modal from form
    if (btnShowHandoverModal) {
        btnShowHandoverModal.addEventListener('click', () => {
            showHandoverModal(null);
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

    // Switch from Handover to User Card modal
    if (btnSwitchToUserCard) {
        btnSwitchToUserCard.addEventListener('click', () => {
            if (modalHandoverPreview) modalHandoverPreview.classList.add('hidden');
            showUserCardModal(currentExportItem);
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
            const userId = currentExportUserId || (document.getElementById('user-id') ? document.getElementById('user-id').value.trim() : '') || 'user';
            
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

    // A localStorage flag is never proof of an authenticated session.
    initTheme();

    async function bootstrapAuthenticatedSession(session) {
        try {
            await syncPermissionsFromRemote();
            const email = normalizeUserEmail(session.user.email);
            const perm = resolveUserPermissions(email);
            if (!perm) throw new Error('Tài khoản chưa được cấp quyền hoặc đã bị khóa');
            localStorage.setItem('erg_asset_user', email);
            applyUserPermissionsUI();
            if (loginScreen) loginScreen.classList.add('hidden');
            if (appContainer) appContainer.classList.remove('hidden');
            const activeTab = localStorage.getItem('erg_asset_active_tab');
            switchToTab(activeTab && canAccessTab(activeTab) ? activeTab : getFirstAllowedTab());
            initApp();
        } catch (err) {
            currentUserPerm = null;
            localStorage.removeItem('erg_asset_logged_in');
            localStorage.removeItem('erg_asset_user');
            await supabaseClient?.auth.signOut().catch(() => {});
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
            showToast('Không thể vào hệ thống', err.message || 'Lỗi phân quyền', 'error');
        }
    }

    if (supabaseClient) {
        supabaseClient.auth.getSession().then(({ data, error }) => {
            if (error || !data?.session?.user) {
                if (loginScreen) loginScreen.classList.remove('hidden');
                if (appContainer) appContainer.classList.add('hidden');
                return;
            }
            bootstrapAuthenticatedSession(data.session);
        }).catch(err => {
            console.error('Auth session error:', err);
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
