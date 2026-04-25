// --- Elements Selection ---
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const eventDateInput = document.getElementById("eventDate");
const eventNoteInput = document.getElementById("eventNote");
const saveEventBtn = document.getElementById("saveEventBtn");

const month_picker = document.querySelector('#month-picker');
const timeFormate = document.querySelector('.time-formate');
const dateFormate = document.querySelector('.date-formate');
const calendar_days = document.querySelector('.calendar-days');
const calendar_header_year = document.querySelector('#year');
const month_list = document.querySelector('.month-list');

// Modal elements
const eventModal = document.getElementById("eventModal");
const closeModal = document.querySelector(".close-modal");
const modalNote = document.getElementById("modalNote");
const modalImage = document.getElementById("modalImage");

const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// --- GLOBAL STORAGE ---
// Ini akan menyimpan semua imej dan nota anda ikut tarikh
// Format: {'2026-05-10': {image: 'data:...', note: '...'}}
let savedEvents = {}; 

// Temp storage untuk imej yang baru diupload (sebelum disave)
let tempImageData = null; 

// 1. Clock Logic
setInterval(() => {
    const currdate = new Date();
    dateFormate.innerHTML = `${currdate.getDate()} ${month_names[currdate.getMonth()]} ${currdate.getFullYear()}`;
    timeFormate.innerHTML = currdate.toLocaleTimeString();
}, 1000);

// 2. Calendar Logic
const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
const getFebDays = (year) => isLeapYear(year) ? 29 : 28;

let currDate = new Date(); // Hari ini (Real time)
// Simulasi hari ini untuk interview (23 April 2026)
let simulatedToday = new Date("2026-04-23");
simulatedToday.setHours(0,0,0,0);

let curr_month = { value: simulatedToday.getMonth() };
let curr_year = { value: simulatedToday.getFullYear() };

const generateCalendar = (month, year) => {
    calendar_days.innerHTML = '';
    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let first_day = new Date(year, month, 1);

    month_picker.innerHTML = month_names[month];
    calendar_header_year.innerHTML = year;

    for (let i = 0; i < first_day.getDay(); i++) {
        calendar_days.appendChild(document.createElement('div'));
    }

    for (let i = 1; i <= days_of_month[month]; i++) {
        let day = document.createElement('div');
        day.innerHTML = i;
        
        // Format tarikh sel ini (YYYY-MM-DD)
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        // Jika tarikh ini ada event tersimpan
        if (savedEvents[dayStr]) {
            const deadline = new Date(dayStr);
            const diffTime = deadline - simulatedToday;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Alert Warna
            if (diffDays < 0) day.style.opacity = '0.3'; // Dah lepas
            else if (diffDays <= 3) day.classList.add('red');
            else if (diffDays <= 7) day.classList.add('yellow');
            else day.classList.add('green');

            // Tambah listener untuk tengok event
            day.onclick = () => showEventModal(dayStr);
        } 
        else {
            // Jika hari ini
            if (i === simulatedToday.getDate() && year === simulatedToday.getFullYear() && month === simulatedToday.getMonth()) {
            }
        }
        calendar_days.appendChild(day);
    }
};

// 3. Month Picker Overlay
month_names.forEach((e, index) => {
    let month = document.createElement('div');
    month.innerHTML = `<div>${e}</div>`;
    month.onclick = () => {
        month_list.classList.remove('show');
        curr_month.value = index;
        generateCalendar(curr_month.value, curr_year.value);
    };
    month_list.appendChild(month);
});

month_picker.onclick = () =>{
   month_list.classList.add('show'); 
};

// 4. Handle Image Upload & Save Event
imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            tempImageData = e.target.result;
            
            // Paparkan imej & sembunyikan placeholder
            previewImage.src = tempImageData;
            previewImage.style.display = "block";
            document.getElementById("placeholderContent").style.display = "none";
            
            // Tukar border kepada solid bila ada gambar
            document.getElementById("imagePreviewContainer").style.borderStyle = "solid";
        }
        reader.readAsDataURL(file);
    }
});

// Bila tombol "Save to Calendar" diklik
saveEventBtn.onclick = () => {
    const date = eventDateInput.value;
    const note = eventNoteInput.value;

    if (!tempImageData || !date) {
        alert("Please upload an image AND select a date!");
        return;
    }

    // Jika tarikh ini belum ada array, wujudkan array baru
    if (!savedEvents[date]) {
        savedEvents[date] = [];
    }

    // SIMPAN DATA KE GLOBAL STORAGE
    savedEvents[date].push({
        image: tempImageData,
        note: note || "No notes added."
    });

    alert("Event saved! Checking calendar...");

    // Refresh kalendar ke bulan tarikh yang disave
    const d = new Date(date);
    curr_month.value = d.getMonth();
    curr_year.value = d.getFullYear();
    
    // Reset input panel kiri
    previewImage.src = "";
    eventDateInput.value = "";
    eventNoteInput.value = "";
    tempImageData = null;

    generateCalendar(curr_month.value, curr_year.value);
};

// 5. Modal Logic (Tengok Event)
function showEventModal(dateStr) {
    const events = savedEvents[dateStr]; // Ini sekarang adalah Array
    if (events && events.length > 0) {
        modalNote.innerHTML = `<h3>Deadline: ${dateStr}</h3>`;
        
        // Kosongkan modal body sebelum tambah iklan baru
        const modalBody = document.querySelector(".modal-body");
        modalBody.innerHTML = ''; 

        events.forEach((event, index) => {
            const eventDiv = document.createElement('div');
            eventDiv.style.marginBottom = "20px";
            eventDiv.style.borderBottom = "1px solid #eee";
            eventDiv.style.paddingBottom = "10px";

            eventDiv.innerHTML = `
                <p><strong>Job ${index + 1}:</strong> ${event.note}</p>
                <img src="${event.image}" style="width:100%; border-radius:10px; margin-top:10px;">
            `;
            modalBody.appendChild(eventDiv);
        });

        eventModal.style.display = "block";
    }
}
closeModal.onclick = () => eventModal.style.display = "none";
window.onclick = (event) => {
    if (event.target == eventModal) eventModal.style.display = "none";
}

// Navigasi Tahun
document.querySelector('#prev-year').onclick = () => { --curr_year.value; generateCalendar(curr_month.value, curr_year.value); };
document.querySelector('#next-year').onclick = () => { ++curr_year.value; generateCalendar(curr_month.value, curr_year.value); };
// Logik untuk butang bulan sebelumnya
document.querySelector('#prev-month').onclick = () => {
    if (curr_month.value === 0) {
        // Jika Januari, tukar ke Disember tahun sebelumnya
        curr_month.value = 11;
        curr_year.value--;
    } else {
        curr_month.value--;
    }
    generateCalendar(curr_month.value, curr_year.value);
};

// Logik untuk butang bulan seterusnya
document.querySelector('#next-month').onclick = () => {
    if (curr_month.value === 11) {
        // Jika Disember, tukar ke Januari tahun depan
        curr_month.value = 0;
        curr_year.value++;
    } else {
        curr_month.value++;
    }
    generateCalendar(curr_month.value, curr_year.value);
};
// Start (Simulation date)
generateCalendar(curr_month.value, curr_year.value);