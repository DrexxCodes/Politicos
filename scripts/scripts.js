const db = firebase.firestore();

// Free IP Grabber API
async function getUserIP() {
    try {
        let response = await fetch("https://api64.ipify.org?format=json");
        let data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("IP Fetch Error:", error);
        return null;
    }
}

// Device Storage Check
function getDeviceId() {
    if (!localStorage.getItem("deviceId")) {
        localStorage.setItem("deviceId", "device_" + Math.random().toString(36).substr(2, 9));
    }
    return localStorage.getItem("deviceId");
}

document.getElementById("registrationForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const regNumber = document.getElementById("regNumber").value.trim();
    const messageBox = document.getElementById("messageBox");
    const loading = document.getElementById("loading");

    if (!name || !regNumber) {
        showMessage("Please fill in all fields", "error");
        return;
    }

    // Validate Registration Number Length
    if (regNumber.length !== 10) {
        showMessage("Upload failed: Registration format is wrong (must be 10 digits).", "error");
        return;
    }

    // Validate Registration Number Format
    if (!regNumber.startsWith("2024")) {
        showMessage("Upload failed: Registration number must start with 2024.", "error");
        return;
    }

    loading.classList.remove("hidden");

    const userIP = await getUserIP();
    const deviceId = getDeviceId();

    if (!userIP) {
        showMessage("Failed to retrieve IP. Try again.", "error");
        loading.classList.add("hidden");
        return;
    }

    try {
        // Check for existing registration number
        let regCheck = await db.collection("registrations").where("regNumber", "==", regNumber).get();
        if (!regCheck.empty) {
            showMessage("Upload failed: Registration number already exists!", "error");
            loading.classList.add("hidden");
            return;
        }

        // Check for existing IP or device ID
        let userCheck = await db.collection("registrations").where("ip", "==", userIP).get();
        let deviceCheck = await db.collection("registrations").where("deviceId", "==", deviceId).get();
        if (!userCheck.empty || !deviceCheck.empty) {
            showMessage("Upload failed: You can only submit once!", "error");
            loading.classList.add("hidden");
            return;
        }

        // Upload data to Firestore
        await db.collection("registrations").add({
            name,
            regNumber,
            ip: userIP,
            deviceId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        showMessage("Uploaded successfully!", "success");
        document.getElementById("registrationForm").reset();
    } catch (error) {
        console.error("Upload Error:", error);
        showMessage("Upload failed: " + error.message, "error");
    }

    loading.classList.add("hidden");
});

// Show message function
function showMessage(message, type) {
    const messageBox = document.getElementById("messageBox");
    messageBox.textContent = message;
    messageBox.className = type;
    messageBox.classList.remove("hidden");

    setTimeout(() => {
        messageBox.classList.add("hidden");
    }, 5000);
}