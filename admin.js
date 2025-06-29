import { db } from './firebase.js';
import {
  ref,
  get,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
// এডমিন অথরাইজেশন চেক
if (localStorage.getItem("isAdmin") !== "true") {
  alert("❌ আপনি অনুমোদিত নন!");
  window.location.href = "login.html";
}


const container = document.getElementById("adminLoanList");
const usersRef = ref(db, "users");

get(usersRef).then(snapshot => {
  if (!snapshot.exists()) {
    container.innerHTML = "<p>🙁 কোনো লোন পাওয়া যায়নি।</p>";
    return;
  }

  const users = snapshot.val();
  container.innerHTML = "";

  Object.entries(users).forEach(([userKey, data]) => {
    Object.entries(data.loans || {}).forEach(([loanId, loan]) => {
      const userName = userKey.split("_")[0];
      const userPhone = userKey.split("_")[1];

      const statusText = loan.status === "approved"
        ? `<span class="approved">✅ Approved</span>`
        : `<span class="pending">⌛ Pending</span>`;

      const div = document.createElement("div");

      // Schedule rows with date column
      const scheduleRows = loan.schedule.map((inst, i) => `
        <tr>
    <td>${inst.installment}</td>
    <td>${inst.amount}</td>
    <td>
      ${
        inst.status.startsWith('approved:')
        ? `✅ ${inst.status.replace('approved:', '')}`
        : inst.status === 'approved'
        ? '✅ Paid'
        : inst.status === 'requested'
        ? `📨 অনুরোধ (${inst.note || 'নোট নেই'})`
        : inst.status === 'rejected'
        ? '❌ বাতিল'
        : '⌛ Pending'
      }
    </td>
    <td>
      ${inst.status === 'requested'
        ? `<button onclick="approveInstallment('${userKey}', '${loanId}', ${i}, '${inst.note || ''}')">Approve</button>
           <button onclick="rejectInstallment('${userKey}', '${loanId}', ${i})">Reject</button>`
        : ""}
    </td>
  </tr>
`).join("");

      div.innerHTML = `
        <h3>👤 ${userName} (${userPhone})</h3>
        <p>Amount: ৳${loan.amount} | Months: ${loan.months} | EMI: ৳${loan.emi}</p>
        <p>লোন স্ট্যাটাস: ${statusText}</p>
        ${loan.status === "pending" ? `<button onclick="approveLoan('${userKey}', '${loanId}')">Approve</button>` : ""}
        <button onclick="deleteLoan('${userKey}', '${loanId}')">❌ Delete</button>

        <table>
          <thead>
            <tr><th>কিস্তি</th><th>পরিমাণ</th><th>স্ট্যাটাস</th><th>তারিখ</th><th>অ্যাকশন</th></tr>
          </thead>
          <tbody>
            ${scheduleRows}
          </tbody>
        </table>
        <hr>
      `;
      container.appendChild(div);
    });
  });
});

// Approve Loan
window.approveLoan = function (userKey, loanId) {
  update(ref(db, `users/${userKey}/loans/${loanId}`), {
    status: "approved"
  }).then(() => {
    alert("✅ লোন অনুমোদিত হয়েছে");
    location.reload();
  });
};

// Approve Installment
window.approveInstallment = function (userKey, loanId, index, note = "") {

  update(ref(db, `users/${userKey}/loans/${loanId}/schedule/${index}`), {
  status: `approved:${note}`
  }).then(() => {
    alert("✅ কিস্তি অনুমোদিত হয়েছে");
    location.reload();
  });
};
// Reject Installment
window.rejectInstallment = function (userKey, loanId, index) {
  update(ref(db, `users/${userKey}/loans/${loanId}/schedule/${index}`), {
    status: "rejected"
  }).then(() => {
    alert("❌ কিস্তি বাতিল করা হয়েছে");
    location.reload();
  });
};

// Delete Loan
window.deleteLoan = function (userKey, loanId) {
  const confirmed = confirm("আপনি কি সত্যিই লোনটি ডিলিট করতে চান?");
  if (!confirmed) return;

  remove(ref(db, `users/${userKey}/loans/${loanId}`)).then(() => {
    alert("❌ লোন ডিলিট করা হয়েছে");
    location.reload();
  });
};
