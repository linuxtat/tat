import { db } from './firebase.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

window.calculateEMI = function () {
  const amount = parseFloat(document.getElementById("amount").value);
  const fee = parseFloat(document.getElementById("processingFee").value) || 0;
  const annual = parseFloat(document.getElementById("annualRate").value);
  const monthlyInput = document.getElementById("monthlyRate").value;
  const monthly = parseFloat(monthlyInput);
  const months = parseInt(document.getElementById("months").value);
  const loanStartDate = document.getElementById("loanStartDate").value;

  if (!loanStartDate) {
    alert("লোন নেয়ার তারিখ নির্বাচন করুন");
    return;
  }

  if (!amount || !months || (!annual && !monthlyInput)) {
    alert("সব ইনপুট পূরণ করুন");
    return;
  }

  let monthlyRate = !isNaN(monthly) ? monthly / 100 : annual / 1200;
  const processingFee = amount * (fee / 100);
  const netAmount = amount - processingFee;
  const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);

  let balance = amount;
  let totalPrincipal = 0, totalInterest = 0;
  const body = document.getElementById("scheduleBody");
  body.innerHTML = "";

  // Calculate installment dates starting from loanStartDate + 1 month
  let baseDate = new Date(loanStartDate);
  baseDate.setMonth(baseDate.getMonth() + 1);

  const scheduleArray = [];

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principal = emi - interest;
    balance -= principal;
    totalPrincipal += principal;
    totalInterest += interest;

    const instDate = new Date(baseDate);
    instDate.setMonth(instDate.getMonth() + (i - 1));
    const instDateStr = instDate.toISOString().split('T')[0]; // yyyy-mm-dd format

    body.innerHTML += `<tr>
      <td>${i}ম কিস্তি</td>
      <td>${principal.toFixed(2)}</td>
      <td>${interest.toFixed(2)}</td>
      <td>${emi.toFixed(2)}</td>
      <td>${balance > 0 ? balance.toFixed(2) : "0.00"}</td>
      <td>${instDateStr}</td>
    </tr>`;

    scheduleArray.push({
      installment: `${i}ম কিস্তি`,
      amount: emi.toFixed(2),
      paid: false,
      status: 'pending',
      date: instDateStr
    });
  }

  document.getElementById("netAmountResult").innerText = `হাতে পাবেন: ৳${netAmount.toFixed(2)}`;
  document.getElementById("emiResult").innerText = `প্রতি মাসে কিস্তি: ৳${emi.toFixed(2)}`;
  document.getElementById("totalPrincipalLine").innerText = `মোট মূলধন পরিশোধ: ৳${totalPrincipal.toFixed(2)}`;
  document.getElementById("totalInterestLine").innerText = `মোট সুদ পরিশোধ: ৳${totalInterest.toFixed(2)}`;
  document.getElementById("totalPaymentLine").innerText = `মোট কিস্তি পরিশোধ: ৳${(totalPrincipal + totalInterest).toFixed(2)}`;
  document.getElementById("totalPrincipal").innerText = totalPrincipal.toFixed(2);
  document.getElementById("totalInterest").innerText = totalInterest.toFixed(2);
  document.getElementById("totalPayment").innerText = (totalPrincipal + totalInterest).toFixed(2);

  document.getElementById("scheduleTable").style.display = "table";
  document.getElementById("loanSummary").style.display = "block";
  document.getElementById("userForm").style.display = "block";

  // Save loanData with schedule including dates
  window.loanData = {
    amount,
    fee,
    netAmount: netAmount.toFixed(2),
    emi: emi.toFixed(2),
    months,
    totalPrincipal: totalPrincipal.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
    totalPayment: (totalPrincipal + totalInterest).toFixed(2),
    loanStartDate,
    schedule: scheduleArray
  };
};

window.downloadPDF = function () {
  const element = document.getElementById("pdfContent");
  html2pdf().from(element).save();
};

window.submitLoanRequest = function () {
  const name = document.getElementById("userName").value.trim();
  const phone = document.getElementById("userPhone").value.trim();
  if (!name || !phone) {
    alert("নাম ও নাম্বার দিন");
    return;
  }

  const loan = window.loanData;
  const loanId = Date.now();
  const userPath = `users/${name}_${phone}/loans/${loanId}`;
  const userRef = ref(db, userPath);

  set(userRef, {
    ...loan,
    status: "pending",
    timestamp: new Date().toISOString()
  }).then(() => {
    document.getElementById("submitMessage").innerText = "✅ লোন রিকোয়েস্ট সফলভাবে জমা হয়েছে!";
  });
};
