// ✅ Required for imports to work (make sure <script type="module"> is set in HTML)

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCJXAeatYBRRgs-GMTVGervg4yh6oavJjg",
  authDomain: "notes-sharing-app-284e7.firebaseapp.com",
  projectId: "notes-sharing-app-284e7",
  storageBucket: "notes-sharing-app-284e7.appspot.com",
  messagingSenderId: "127599616794",
  appId: "1:127599616794:web:dbb660ec5f6332a92f82a3",
};

// ✅ Initialize Firebase only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Filter function
function filterNotes(type) {
  const cards = document.querySelectorAll("[data-price]");
  cards.forEach((card) => {
    const price = card.getAttribute("data-price");
    if (type === "all") card.style.display = "block";
    else if (type === "free") card.style.display = price === "free" ? "block" : "none";
    else if (type === "paid") card.style.display = price !== "free" ? "block" : "none";
    else if (type === "high") {
      const numericPrice = parseFloat(price);
      card.style.display = !isNaN(numericPrice) && numericPrice >= 100 ? "block" : "none";
    }
  });
}
window.filterNotes = filterNotes;

// ✅ Upload form
async function handleUpload(e) {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const subject = document.getElementById("subject").value;
  const price = document.getElementById("price").value;
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  try {
    const storageRef = ref(storage, `notes/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, "notes"), {
      title,
      subject,
      price,
      fileUrl: downloadURL,
      fileName: file.name,
      createdAt: serverTimestamp(),
    });

    alert("Note uploaded successfully!");
    e.target.reset(); // Clear form
    loadNotes(); // Refresh list
  } catch (err) {
    console.error("Error uploading note:", err);
    alert("Error uploading note. Please try again.");
  }
}
window.handleUpload = handleUpload;

// ✅ Load Notes
function loadNotes() {
  const notesContainer = document.getElementById("notesContainer");
  if (!notesContainer) return;
  notesContainer.innerHTML = "";

  getDocs(collection(db, "notes"))
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const note = doc.data();
        const rawPrice = note.price.toString().trim().toLowerCase();
        const priceType = rawPrice === "free" ? "free" : parseFloat(note.price);
        const card = document.createElement("div");
        card.className = "col-md-4";
        card.setAttribute("data-price", priceType);

        card.innerHTML = `
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">${note.title}</h5>
              <p><strong>Subject:</strong> ${note.subject}</p>
              <p><strong>Price:</strong> ${note.price}</p>
              <button class="btn btn-outline-primary btn-sm" onclick="previewPDF('${note.fileUrl}')" data-bs-toggle="modal" data-bs-target="#previewModal">Preview</button>
              <button class="btn ${rawPrice === "free" ? "btn-success" : "btn-warning"} btn-sm">
                ${rawPrice === "free" ? "Download" : "Buy Now"}
              </button>
            </div>
          </div>
        `;
        notesContainer.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error getting notes: ", error);
    });
}
window.loadNotes = loadNotes;

// ✅ Preview PDF
function previewPDF(fileURL) {
  const embed = document.getElementById("pdfPreview");
  embed.src = fileURL;
}
window.previewPDF = previewPDF;

// ✅ Chat simulation
function sendMessage() {
  const chatInput = document.getElementById("chatInput");
  const chatBox = document.getElementById("chatBox");
  const message = chatInput.value.trim();

  if (message !== "") {
    const msg = document.createElement("div");
    msg.textContent = "You: " + message;
    msg.className = "mb-2";
    chatBox.appendChild(msg);
    chatInput.value = "";

    setTimeout(() => {
      const reply = document.createElement("div");
      reply.textContent = "Seller: Let's discuss!";
      reply.className = "mb-2 text-muted";
      chatBox.appendChild(reply);
    }, 1000);
  }
}
window.sendMessage = sendMessage;

// ✅ Logout
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}
window.logout = logout;

// ✅ Load notes on page if user is logged in
window.onload = () => {
  const user = localStorage.getItem("loggedInUser");
  const welcome = document.getElementById("welcomeUser");
  if (user && welcome) {
    welcome.innerText = `Welcome, ${user}`;
    loadNotes();
  } else if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
  }
};
