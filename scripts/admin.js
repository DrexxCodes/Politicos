const db = firebase.firestore();
let registrations = [];

// Fetch data from Firestore
async function fetchRegistrations() {
    const snapshot = await db.collection("registrations").orderBy("timestamp", "asc").get();
    registrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderTable();
}

// Render table
function renderTable() {
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";
    
    registrations.forEach(entry => {
        const row = `<tr>
            <td>${entry.name}</td>
            <td>${entry.regNumber}</td>
            <td>${new Date(entry.timestamp.toDate()).toLocaleString()}</td>
            <td>${entry.deviceId}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Sorting function
function sortData() {
    const field = document.getElementById("sortField").value;
    const order = document.getElementById("sortOrder").value;
    
    registrations.sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];

        if (field === "timestamp") {
            valueA = new Date(a.timestamp.toDate());
            valueB = new Date(b.timestamp.toDate());
        } else if (field === "regNumber") {
            valueA = parseInt(a.regNumber, 10);
            valueB = parseInt(b.regNumber, 10);
        }

        return order === "asc" ? valueA > valueB ? 1 : -1 : valueA < valueB ? 1 : -1;
    });

    renderTable();
}

// Download table as PDF (Fix)
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error("jsPDF is not loaded correctly.");
        return;
    }

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(14);
    doc.text("Year One Political Science Class List", 14, 10);

    doc.setFontSize(10);
    doc.text("Name", 10, y);
    doc.text("Reg Number", 60, y);
    /* doc.text("Date & Time", 110, y);
    doc.text("Device ID", 160, y); */
    y += 10;

    registrations.forEach(entry => {
        doc.text(entry.name, 10, y);
        doc.text(entry.regNumber.toString(), 60, y);
        /*doc.text(new Date(entry.timestamp.toDate()).toLocaleString(), 110, y);
        doc.text(entry.deviceId, 160, y);*/
        y += 10;
    });

    doc.save("registrations.pdf");
}

// Event listeners
document.getElementById("sortBtn").addEventListener("click", sortData);
document.getElementById("downloadBtn").addEventListener("click", downloadPDF);

// Fetch data on load
fetchRegistrations();