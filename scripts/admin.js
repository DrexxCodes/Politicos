const db = firebase.firestore();
let registrations = [];

// Fetch data from Firestore (Remove Duplicates)
async function fetchRegistrations() {
    const snapshot = await db.collection("registrations").orderBy("timestamp", "asc").get();
    
    // Store unique entries using a Map (key: "name|regNumber")
    const uniqueEntries = new Map();

    snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const uniqueKey = `${data.name}|${data.regNumber}`;

        if (!uniqueEntries.has(uniqueKey)) {
            uniqueEntries.set(uniqueKey, {
                id: doc.id,
                ...data
            });
        }
    });

    // Convert map to array and add serial numbers
    registrations = Array.from(uniqueEntries.values()).map((entry, index) => ({
        sn: index + 1, // Serial Number
        ...entry
    }));

    renderTable();
}

// Render table
function renderTable() {
    const tbody = document.querySelector("#dataTable tbody");
    const totalCount = document.getElementById("totalCount");

    tbody.innerHTML = "";
    registrations.forEach((entry, index) => {
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.regNumber}</td>
            <td>${new Date(entry.timestamp.toDate()).toLocaleString()}</td>
            <td>${entry.deviceId}</td>
        </tr>`;
        tbody.innerHTML += row;
    });

    // Update total count
    totalCount.textContent = `Total Unique Uploads: ${registrations.length}`;
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

        return order === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });

    renderTable();
}

// Print-based PDF Download (Immediate Print Dialog)
function downloadPDF() {
    const printWindow = window.open("", "_blank");

    // Wait for the new window to fully load before triggering print
    printWindow.document.write(`
        <html>
        <head>
            <title>Class Registration List</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h2 { text-align: center; }
            </style>
        </head>
        <body>
            <h2>Year One Political Science Class List</h2>
            <table>
                <thead>
                    <tr>
                        <th>S/N</th>
                        <th>Name</th>
                        <th>Reg Number</th>
                    </tr>
                </thead>
                <tbody>
                    ${registrations.map((entry, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${entry.name}</td>
                            <td>${entry.regNumber}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `);

    printWindow.document.close(); // Ensure the document is fully loaded
    printWindow.focus(); // Bring window to focus
    printWindow.print(); // Open print dialog
    setTimeout(() => printWindow.close(), 500); // Auto-close after 500ms
}

// Event listeners
document.getElementById("sortBtn").addEventListener("click", sortData);
document.getElementById("downloadBtn").addEventListener("click", downloadPDF);

// Fetch data on load
fetchRegistrations();