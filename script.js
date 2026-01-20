// 1. Tariflar (Faqat Basic va Pro)
const plans = [
    { name: "Basic", price: "$4.99/oy", features: ["5 GB SSD", "1 ta Domen", "LiteSpeed Cache"] },
    { name: "Pro", price: "$9.99/oy", features: ["20 GB SSD", "3 ta Domen", "SSL Sertifikat"] }
];

// 2. LocalStorage dan ma'lumotlarni yuklash
let checkedDomainsHistory = JSON.parse(localStorage.getItem('domainHistory')) || [];
let selectedPlanName = localStorage.getItem('selectedPlan') || null;

// 3. Sahifalarni boshqarish
function showSection(name) {
    const sections = ['home', 'domains', 'contact'];
    sections.forEach(s => {
        const el = document.getElementById(`${s}-section`);
        if (el) el.style.display = (s === name) ? 'block' : 'none';
    });

    // Planlar bo'limi hamisha Home sahifasida chiqishi uchun
    const plansSection = document.getElementById('plans-section');
    if (plansSection) plansSection.style.display = (name === 'home') ? 'block' : 'none';
}

// 4. Tariflarni chiqarish (Xotirani hisobga olgan holda)
function loadPlans() {
    const container = document.getElementById('plansContainer');
    if (!container) return;
    
    container.innerHTML = plans.map(p => {
        const isPicked = (p.name === selectedPlanName);
        return `
            <div class="glass-card" style="text-align: center; padding: 30px; margin-bottom: 20px;">
                <h3>${p.name}</h3>
                <div style="font-size: 2rem; margin: 15px 0;">${p.price}</div>
                <ul style="list-style: none; margin-bottom: 20px; text-align: left; opacity: 0.8;">
                    ${p.features.map(f => `<li>• ${f}</li>`).join('')}
                </ul>
                <button id="btn-${p.name}" 
                        onclick="selectPlan('${p.name}')" 
                        style="width: 100%; ${isPicked ? 'background: #444; cursor: default;' : ''}" 
                        ${isPicked ? 'disabled' : ''}>
                    ${isPicked ? 'Tanlandi' : 'Tanlash'}
                </button>
            </div>
        `;
    }).join('');
}

// 5. Plan tanlash va avtomatik almashish
async function selectPlan(planName) {
    // UI-ni reset qilish
    plans.forEach(p => {
        const btn = document.getElementById(`btn-${p.name}`);
        if (btn) {
            btn.innerText = "Tanlash";
            btn.style.background = "";
            btn.disabled = false;
        }
    });

    if (window.supabaseClient) {
        const { error } = await window.supabaseClient.from('orders').insert([{ plan_name: planName }]);
        if (!error) {
            selectedPlanName = planName;
            localStorage.setItem('selectedPlan', planName); // Xotiraga saqlash
            
            const currentBtn = document.getElementById(`btn-${planName}`);
            if (currentBtn) {
                currentBtn.innerText = "Tanlandi";
                currentBtn.style.background = "#444";
                currentBtn.disabled = true;
            }
            showModal(`${planName} tarifi tanlandi!`);
        } else {
            showModal("Xatolik: " + error.message);
        }
    }
}

// 6. Domen tekshirish (Proxy orqali - Brauzer xatoligini yechish uchun)
async function checkDomain() {
    const input = document.getElementById('domainInput');
    const domain = input.value.trim().toLowerCase();
    
    if (!domain || !domain.includes('.')) {
        showModal("Iltimos, to'g'ri domen kiriting!");
        return;
    }

    showModal("Tekshirilmoqda...");

    try {
        // CORS Proxy ishlatildi: bu brauzer blokirovkasini chetlab o'tadi
        const response = await fetch(`https://corsproxy.io/?https://rdap.org/domain/${domain}`);
        const isAvailable = (response.status === 404);

        checkedDomainsHistory.unshift({
            name: domain,
            status: isAvailable ? 'Mavjud' : 'Band',
            time: new Date().toLocaleTimeString()
        });

        localStorage.setItem('domainHistory', JSON.stringify(checkedDomainsHistory));
        updateUI();
        showModal(isAvailable ? `✓ ${domain} - Bo'sh!` : `✗ ${domain} - Band!`);
    } catch (error) {
        console.error("Xatolik:", error);
        showModal("Ulanishda xatolik yuz berdi.");
    }
}

// 7. UI Yangilash (Tarix)
function updateUI() {
    const list = document.getElementById('checkedDomainsList');
    if (!list) return;
    list.innerHTML = checkedDomainsHistory.map(d => `
        <div class="glass-card" style="margin-bottom:10px; display:flex; justify-content:space-between; padding:15px;">
            <span style="color:#2575fc; font-weight:bold;">${d.name}</span>
            <span style="color:${d.status === 'Mavjud' ? '#00ff00' : '#ff4b2b'}; font-weight:bold;">${d.status}</span>
        </div>
    `).join('');
}

// 8. Modal va Boshlang'ich yuklash
function showModal(msg) {
    const modal = document.getElementById('modal');
    const msgEl = document.getElementById('modalMessage');
    if (modal && msgEl) {
        msgEl.innerText = msg;
        modal.style.display = 'grid';
    }
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

window.onload = () => {
    loadPlans();
    updateUI();
    showSection('home');
};