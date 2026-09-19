# Automatic Air Conditioner Control System (IoT)
> **IoT Engineering Monitoring & Closed-Loop Control Center**  
> โครงการระบบควบคุมเครื่องปรับอากาศอัตโนมัติเพื่อการประหยัดพลังงาน — รายวิชา Circuits and IoT (Faculty of Engineering)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Microcontroller](https://img.shields.io/badge/MCU-ESP32%20Xtensa%20LX6-red.svg?style=flat-square&logo=espressif)](https://www.espressif.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

---

## 📌 บทคัดย่อ / Project Overview

**Automatic Air Conditioner Control System** เป็นระบบควบคุมและตรวจติดตามสภาพแวดล้อมห้องปรับอากาศอัจฉริยะแบบวงรอบปิด (Closed-Loop Automation) โดยนำไมโครคอนโทรลเลอร์ **ESP32** มาประมวลผลข้อมูลเซนเซอร์ตรวจวัดอุณหภูมิ/ความชื้น (**DHT22**) ร่วมกับเซนเซอร์ตรวจจับความเคลื่อนไหวของผู้ใช้งาน (**PIR HC-SR501**) เพื่อสั่งการเปิด-ปิดเครื่องปรับอากาศ Panasonic ผ่านชุดขับสัญญาณอินฟราเรด (**IR Transmitter 940nm modulated at 38 kHz**) พร้อมเชื่อมโยงข้อมูลสู่ **Web Dashboard** ผ่านเครือข่ายไร้สาย Wi-Fi แบบเรียลไทม์

### คติประจำระบบ (System Motto)
> *“แผงควบคุมอัจฉริยะ ตรวจจับความเคลื่อนไหว ปรับอุณหภูมิให้เย็นใจ ประหยัดไฟทุกเวลา”*

---

## 🛠️ สถาปัตยกรรมระบบและวงจร (System Architecture)

```
       [ DHT22 Sensor ] (GPIO 4: Single-Bus Pull-Up 4.7kΩ)
              │
              ├──────► [ ESP32 Microcontroller ] 
              │         • evaluateAutomation() Logic
       [ PIR Sensor ]   • FreeRTOS Task Scheduling
(GPIO 13: Digital In)   • Wi-Fi 802.11 b/g/n Client
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
[ IR Driver Circuit ]                           [ Wi-Fi Network ]
 • BC548 NPN Modulation Transistor               • 2.4 GHz RF Link
 • 940nm Infrared Emitter LED                    • Auto-Failover
 • 38 kHz Panasonic Carrier                      • REST / WebSocket
        ▼                                               ▼
[ Panasonic Air Conditioner ]                   [ React Web Dashboard ]
 • POWER ON / OFF                                • Live Telemetry Charts
 • Target Temperature / Fan Speed                • Control & Audit Logs
```

---

## ⚡ คุณสมบัติเด่นของระบบ (Core Features)

### 1. 🧠 Closed-Loop Automation Decision Engine (`evaluateAutomation`)
* **Rule C (Hot & Occupied):** เมื่ออุณหภูมิห้องสูงกว่าเกณฑ์ที่กำหนด ($T > T_{\text{high}}$ เช่น $\ge 26.0^\circ\text{C}$) และตรวจพบคนในห้อง ($\text{PIR} = \text{HIGH}$) $\rightarrow$ สั่ง **AC ON (AUTO_COOLING)**
* **Rule E (Vacancy Timeout):** เมื่อไม่มีคนอยู่ในห้องต่อเนื่องจนครบเวลาที่กำหนด ($t_{\text{inactivity}} \ge t_{\text{timeout}}$ เช่น 30-60 วินาที) $\rightarrow$ สั่ง **AC OFF (AUTO_OFF_EMPTY)** เพื่อประหยัดพลังงาน
* **Anti-Spam & Edge Triggering:** มีระบบป้องกันการส่งสัญญาณซ้ำซ้อน ส่งสัญญาณ IR เมื่อเกิดการเปลี่ยนสถานะ (State Transition) เท่านั้น

### 2. 📡 Panasonic AC IR Learning & Control
* **ถอดรหัสสัญญาณรีโมตจริง:** รองรับสัญญาณอินฟราเรดความถี่พาหะ 38 kHz ความยาว 216 pulses ตามมาตรฐาน Panasonic AC Protocol
* **Replay & Command Library:** สามารถบันทึกและสั่งเล่นซ้ำคำสั่งพื้นฐาน เช่น `POWER ON`, `POWER OFF`, `COOL 26°C`, `COOL 27°C`, `FAN AUTO`
* **Signal Flow Inspection:** แสดงขั้นตอนการ demodulate และส่งสัญญาณผ่านทรานซิสเตอร์ BC548 ชัดเจน

### 3. 🎯 Presentation Demo Mode (โหมดนำเสนอหน้าชั้นเรียน)
ออกแบบมาสำหรับอาจารย์และผู้ประเมินเพื่อทดสอบตรรกะได้ทันทีโดยไม่ต้องรอให้สภาพแวดล้อมจริงเปลี่ยน:
* **Scenario 1: Normal Room** ($24.5^\circ\text{C}$, มีคน) $\rightarrow$ AC ปิด (`AUTO_IDLE`)
* **Scenario 2: Hot Room** ($29.2^\circ\text{C}$, มีคน) $\rightarrow$ AC เปิดทำความเย็น (`AUTO_COOLING`)
* **Scenario 3: Empty Room** ($28.5^\circ\text{C}$, ไม่มีคนครบ 30s) $\rightarrow$ AC ปิดอัตโนมัติ (`AUTO_OFF_EMPTY`)

### 4. 📶 Wi-Fi Manager & Autonomous Roaming
* ตรวจวัดระดับความแรงสัญญาณ RSSI (-dBm) และคุณภาพสัญญาณ
* ระบบ **Auto-Failover**: เมื่อสัญญาณ AP หลัก (Home_WiFi) ตกต่ำกว่า $-75\text{ dBm}$ จะทำการ Roam ไปยัง AP สำรอง (Lab_WiFi) อัตโนมัติ

### 5. 📋 Engineering Event Audit Trail & Hardware Health
* บันทึกประวัติเหตุการณ์สำคัญ เช่น การเปลี่ยนสถานะเซนเซอร์, คำสั่ง IR, และการเชื่อมต่อ Wi-Fi
* มีตัวกรองแยกหมวดหมู่และสามารถ **Export เป็นไฟล์ CSV** ได้
* ตรวจสอบสถานะและ Health Telemetry ของ Node ทั้ง 5 จุด: ESP32, DHT22, PIR, IR Transmitter, Wi-Fi

---

## 🔌 รายการอุปกรณ์และขาต่อใช้งาน (Bill of Materials - BOM)

| Component | Specification | Pin / Bus Interface | Function |
| :--- | :--- | :--- | :--- |
| **ESP32 DevKit V1** | 30-pin, 240 MHz Dual-Core | Central Controller | ประมวลผลตรรกะและส่งข้อมูลผ่าน Wi-Fi |
| **DHT22 (AM2302)** | -40 to 80°C (±0.5°C), 0-100% RH | `GPIO 4` (Single-Bus) | วัดอุณหภูมิและความชื้นสัมพัทธ์ในห้อง |
| **PIR (HC-SR501)** | Pyroelectric IR, 120° cone, 7m | `GPIO 13` (Digital In) | ตรวจจับการมีอยู่ของบุคคลจากรังสีความร้อน |
| **IR Emitter LED** | 940nm wavelength, 38 kHz | `GPIO 14` (LEDC PWM) | ส่งรหัสคำสั่งรีโมตควบคุมแอร์ Panasonic |
| **NPN Transistor** | BC548 / 2N2222 (500mA) | Base via 1kΩ to `GPIO 14` | สวิตช์ขับกระแสสูงให้หลอดอินฟราเรดจากราง 5V |
| **Pull-up Resistor** | 4.7 kΩ ±1% metal film | `GPIO 4` to 3.3V DC | ดึงสัญญาณสาย Single-Bus ของ DHT22 |
| **Current Resistor** | 220 Ω ±5% carbon film | 5V Rail to IR Anode | จำกัดกระแสพัลส์ที่ไหลผ่านหลอด IR LED |

---

## 💻 การติดตั้งและรันโปรเจกต์ (Getting Started)

### ความต้องการของระบบ (Prerequisites)
* [Node.js](https://nodejs.org/) (เวอร์ชัน 18.0 ขึ้นไป)
* `npm` หรือ `pnpm` หรือ `yarn`

### ขั้นตอนการรัน

```bash
# 1. โคลน Repository
git clone https://github.com/Chalermsak1/CIRCUITS-AND-IOT.git
cd CIRCUITS-AND-IOT

# 2. ติดตั้ง Dependencies
npm install

# 3. รัน Development Server
npm run dev
```

เปิดเว็บเบราว์เซอร์ไปที่: **`http://localhost:5173`** (หรือพอร์ตที่แสดงใน Terminal)

### คำสั่งอื่นๆ

```bash
# ตรวจสอบ TypeScript Types
npx tsc -b

# รัน Automated Test Suites ทั้งหมด
npm test

# Build โปรเจกต์สำหรับ Production
npm run build
```

---

## 🧪 การทดสอบระบบ (Automated Tests)

โปรเจกต์มาพร้อมกับชุดทดสอบแบบครอบคลุม:
* `automationEngine.test.ts`: ทดสอบความถูกต้องของตรรกะ Rule A ถึง Rule E และ Anti-Spam
* `presentationDemo.test.ts`: ทดสอบการสลับ Scenario นำเสนอและ State Synchronization
* `deviceHealth.test.ts`: ตรวจสอบความถูกต้องของแบบจำลองสถานะฮาร์ดแวร์
* `historySystem.test.ts`: ตรวจสอบ Event Types, การกรองข้อมูล และระบบป้องกัน Event ซ้ำ
* `panasonicIrLearning.test.ts`: ทดสอบการ decode สัญญาณ 216 pulses และการจำลอง replay

---

## 👥 ผู้จัดทำ (Author & Credits)

* **Chalermsak** ([@Chalermsak1](https://github.com/Chalermsak1))
* **Faculty of Engineering** • Circuits & IoT Laboratory Project
