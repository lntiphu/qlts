-- ==========================================
-- SUPABASE / POSTGRESQL DATABASE SCHEMA
-- Dự án: ERG Asset - Quản lý thiết bị & tài sản
-- File: supabase_schema.sql
-- ==========================================

-- 1. BẢNG: thiet_bi (Quản lý cấp phát thiết bị & tài sản)
CREATE TABLE IF NOT EXISTS thiet_bi (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,                       -- userId (Mã nhân viên)
    user_name TEXT NOT NULL,                            -- userName (Họ và tên)
    user_title TEXT,                                    -- userTitle (Chức danh)
    user_dept TEXT,                                     -- userDept (Phòng ban)
    user_email TEXT,                                    -- userEmail (Email)
    user_phone TEXT,                                    -- userPhone (Số điện thoại)
    dev_id TEXT UNIQUE,                                 -- devId (Mã thiết bị)
    dev_type TEXT,                                      -- devType (Loại thiết bị)
    dev_main TEXT,                                      -- devMain (Mainboard)
    dev_cpu TEXT,                                       -- devCpu (CPU)
    dev_ram TEXT,                                       -- devRam (Dung lượng RAM)
    dev_ram_slots TEXT,                                 -- devRamSlots (Số khe/thanh RAM)
    dev_ssd TEXT,                                       -- devSsd (SSD)
    dev_hdd TEXT,                                       -- devHdd (HDD)
    dev_vga TEXT,                                       -- devVga (VGA)
    dev_monitor TEXT,                                   -- devMonitor (Thông tin màn hình)
    dev_cables TEXT,                                    -- devCables (Dây cáp kết nối)
    key_win TEXT,                                       -- keyWin (Key Windows)
    key_office TEXT,                                    -- keyOffice (Key Office)
    key_pdf TEXT,                                       -- keyPdf (Key PDF)
    dev_notes TEXT,                                     -- devNotes (Ghi chú thiết bị)
    dev_apps TEXT,                                      -- devApps (App bản quyền)
    dev_status TEXT,                                    -- devStatus (Tình trạng thiết bị)
    updated_at TIMESTAMPTZ DEFAULT NOW(),               -- updatedAt (Thời gian cập nhật)
    history JSONB DEFAULT '[]'::jsonb                   -- history (Lịch sử thay đổi)
);

-- 2. BẢNG: cong_ty (Thông tin công ty)
CREATE TABLE IF NOT EXISTS cong_ty (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,                          -- code (Mã công ty)
    name TEXT NOT NULL,                                 -- name (Tên công ty)
    tax_code TEXT,                                      -- taxCode (Mã số thuế)
    rep TEXT,                                           -- rep (Người đại diện)
    rep_role TEXT,                                      -- repRole (Chức vụ người đại diện)
    address TEXT                                        -- address (Địa chỉ công ty)
);

-- 3. BẢNG: account (Tài khoản truy cập các hệ thống)
CREATE TABLE IF NOT EXISTS account (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    func TEXT NOT NULL,                                 -- func (Chức năng)
    ip TEXT,                                            -- ip (IP/Cloud/Local)
    username TEXT NOT NULL,                             -- username (Tên đăng nhập)
    password TEXT NOT NULL,                             -- password (Mật khẩu)
    notes TEXT                                          -- notes (Ghi chú)
);

-- 4. BẢNG: ho_tro (Trang liên hệ hỗ trợ)
CREATE TABLE IF NOT EXISTS ho_tro (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    unit TEXT NOT NULL,                                 -- unit (Đơn vị hỗ trợ)
    name TEXT NOT NULL,                                 -- name (Họ tên đầu mối)
    role TEXT,                                          -- role (Vị trí/Chức vụ)
    phone TEXT,                                         -- phone (Số điện thoại)
    scope TEXT,                                         -- scope (Phạm vi hỗ trợ)
    has_zalo BOOLEAN DEFAULT false                      -- has_zalo (Có thể liên hệ qua Zalo)
);

-- 5. BẢNG: camera (Thông tin Camera & Đầu ghi)
CREATE TABLE IF NOT EXISTS camera (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project TEXT NOT NULL,                              -- project (Tên dự án)
    device TEXT,                                        -- device (Loại camera/đầu ghi)
    ip_wan TEXT,                                        -- ipWan (IP WAN)
    rtsp TEXT,                                          -- rtsp (Port RTSP)
    tcp TEXT,                                           -- tcp (Port TCP)
    http TEXT,                                          -- http (Port HTTP)
    https TEXT,                                         -- https (Port HTTPS)
    username TEXT,                                      -- username (Tên đăng nhập)
    password TEXT,                                      -- password (Mật khẩu)
    notes TEXT,                                         -- notes (Ghi chú)
    onvif_user TEXT,                                    -- onvifUser (User ONVIF)
    onvif_pass TEXT                                     -- onvifPass (Pass ONVIF)
);

-- 6. BẢNG: tips (Hướng dẫn giải quyết sự cố - Tip & Trick)
CREATE TABLE IF NOT EXISTS tips (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    issue TEXT NOT NULL,                                -- issue (Vấn đề/Lỗi)
    solution TEXT NOT NULL                              -- solution (Cách giải quyết)
);

-- ==========================================
-- CẤU HÌNH PHÂN QUYỀN (ROW LEVEL SECURITY - RLS)
-- Bật RLS và chỉ cho phép những yêu cầu được xác thực bởi Supabase Auth truy cập dữ liệu
-- ==========================================
ALTER TABLE thiet_bi ENABLE ROW LEVEL SECURITY;
ALTER TABLE cong_ty ENABLE ROW LEVEL SECURITY;
ALTER TABLE account ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_tro ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách chỉ cho phép truy cập toàn quyền khi người dùng đã đăng nhập (authenticated)
CREATE POLICY "Allow authenticated ALL to thiet_bi" ON thiet_bi FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated ALL to cong_ty" ON cong_ty FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated ALL to account" ON account FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated ALL to ho_tro" ON ho_tro FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated ALL to camera" ON camera FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated ALL to tips" ON tips FOR ALL TO authenticated USING (true) WITH CHECK (true);
