// ---------- FORM SWITCH ----------
function showRegister() {
  document.getElementById('loginCard').classList.add('hidden');
  document.getElementById('registerCard').classList.remove('hidden');
  clearMsg('registerMsg');
}

function showLogin() {
  document.getElementById('registerCard').classList.add('hidden');
  document.getElementById('loginCard').classList.remove('hidden');
  clearMsg('loginMsg');
}

function clearMsg(id) {
  var el = document.getElementById(id);
  el.className = 'msg';
  el.innerText = '';
}

function showMsg(id, text, type) {
  var el = document.getElementById(id);
  el.innerText = text;
  el.className = 'msg ' + type;
}

// ---------- DEVICE INFO ----------
function getDeviceInfo() {
  var ua = navigator.userAgent;
  var device = /Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
  var browser = 'Unknown';
  if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';
  return { device, browser };
}

// ---------- LOGIN ----------
async function handleLogin() {
  var email    = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value.trim();

  if (email === '' || password === '') {
    showMsg('loginMsg', '⚠️ Please fill in all fields!', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showMsg('loginMsg', '⚠️ Please enter a valid email!', 'error');
    return;
  }

  if (password.length < 6) {
    showMsg('loginMsg', '⚠️ Password must be at least 6 characters!', 'error');
    return;
  }

  try {
    var info = getDeviceInfo();
    var response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, device: info.device, browser: info.browser })
    });
    var data = await response.json();

    if (data.success) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('highScore', data.user.highScore);
      localStorage.setItem('gamesPlayed', data.user.gamesPlayed);
      showMsg('loginMsg', '✅ Login Successful! Redirecting...', 'success');
      setTimeout(function() { window.location.href = 'dashboard.html'; }, 1500);
    } else {
      showMsg('loginMsg', '❌ ' + data.message, 'error');
    }
  } catch (err) {
    showMsg('loginMsg', '❌ Server se connect nahi ho pa raha!', 'error');
  }
}

// ---------- REGISTER ----------
async function handleRegister() {
  var name     = document.getElementById('regName').value.trim();
  var email    = document.getElementById('regEmail').value.trim();
  var phone    = document.getElementById('regPhone').value.trim();
  var password = document.getElementById('regPassword').value.trim();
  var confirm  = document.getElementById('regConfirm').value.trim();

  if (name === '' || email === '' || phone === '' || password === '' || confirm === '') {
    showMsg('registerMsg', '⚠️ Please fill in all fields!', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showMsg('registerMsg', '⚠️ Please enter a valid email!', 'error');
    return;
  }

  if (phone.length < 10) {
    showMsg('registerMsg', '⚠️ Please enter a valid phone number!', 'error');
    return;
  }

  if (password.length < 6) {
    showMsg('registerMsg', '⚠️ Password must be at least 6 characters!', 'error');
    return;
  }

  if (password !== confirm) {
    showMsg('registerMsg', '⚠️ Passwords do not match!', 'error');
    return;
  }

  try {
    var info = getDeviceInfo();
    var response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, device: info.device, browser: info.browser })
    });
    var data = await response.json();

    if (data.success) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('highScore', '0');
      localStorage.setItem('gamesPlayed', '0');
      showMsg('registerMsg', '✅ Account Created! Redirecting...', 'success');
      setTimeout(function() { window.location.href = 'dashboard.html'; }, 1500);
    } else {
      showMsg('registerMsg', '❌ ' + data.message, 'error');
    }
  } catch (err) {
    showMsg('registerMsg', '❌ Server se connect nahi ho pa raha!', 'error');
  }
}

// ---------- EMAIL VALIDATION ----------
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}