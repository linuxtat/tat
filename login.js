import { db } from './firebase.js';
import {
  ref,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

window.loginUser = function () {
  const name = document.getElementById("loginName").value.trim();
  const phone = document.getElementById("loginPhone").value.trim();

  if (!name || !phone) {
    document.getElementById("loginMessage").innerText = "সঠিক নাম ও নাম্বার দিন।";
    return;
  }

  const isAdmin = name === "tushar13" && phone === "01712499829";
  const dbRef = ref(db);

  if (isAdmin) {
    window.location.href = "admin.html";
    return;
  }

  get(child(dbRef, `users/${name}_${phone}`)).then(snapshot => {
    if (snapshot.exists()) {
      localStorage.setItem("user", `${name}_${phone}`);
      window.location.href = "user.html";
    } else {
      document.getElementById("loginMessage").innerText = "লোন পাওয়া যায়নি। আগে আবেদন করুন।";
    }
  }).catch(error => {
    console.error(error);
    document.getElementById("loginMessage").innerText = "ডাটাবেজ সমস্যা হয়েছে।";
  });
}
