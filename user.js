import { db } from './firebase.js';
import {
  ref,
  get,
  update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const userKey = localStorage.getItem("user");
const loanList = document.getElementById("loanList");

if (!userKey) {
  loanList.innerHTML = "<p>❌ লগ ইন তথ্য পাওয়া যায়নি।</p>";
} else {
  const userRef = ref(db, `users/${userKey}/loans`);

  get(userRef).then(snapshot => {
    if (!snapshot.exists()) {
      loanList.innerHTML = "<p>🚫 কোনো লোন পাওয়া যায়নি।</p>";
      return;
    }

    const loans = snapshot.val();
    loanList.innerHTML = "";

    Object.entries(loans).forEach(([loanId, loan]) => {
      const statusText = loan.status === "approved"
        ? `<span class="approved">✅ অনুমোদিত</span>`
        : `<span class="pending">⌛ অনুমোদনের অপেক্ষায়</span>`;

      const div = document.createElement("div");

      const scheduleRows = loan.schedule.map((inst, i) => `
        <tr>
          <td>${inst.installment}</td>
          <td>${inst.amount}</td>
          <td>${
  inst.status === 'approved' ? '✅ Paid' :
  inst.status === 'requested' ? '📨 অনুরোধ পাঠানো' :
  inst.status === 'rejected' ? '❌ বাতিল' :
  '⌛ Pending'
}</td>

          <td>${inst.date || 'N/A'}</td>
          <td>
            ${loan.status === "approved" && (inst.status === 'pending' || inst.status === 'rejected')
  ? `<button onclick="requestPayment('${loanId}', ${i})">Paid Request</button>`
  : ""}
          </td>
        </tr>
      `).join("");

      div.innerHTML = `
        <h3>📌 লোন: ৳${loan.amount} (${loan.months} মাস)</h3>
        <p>EMI: ৳${loan.emi} | অবস্থা: ${statusText}</p>
        <table>
          <thead>
            <tr><th>কিস্তি</th><th>টাকা</th><th>স্ট্যাটাস</th><th>তারিখ</th><th>অ্যাকশন</th></tr>
          </thead>
          <tbody>
            ${scheduleRows}
          </tbody>
        </table>
        <hr>
      `;
      loanList.appendChild(div);
    });
  });
}

window.requestPayment = function (loanId, index) {
  const instRef = ref(db, `users/${userKey}/loans/${loanId}/schedule/${index}`);

  update(instRef, { status: "requested" }).then(() => {
    alert("✅ Paid request পাঠানো হয়েছে!");
    location.reload();
  });
};
