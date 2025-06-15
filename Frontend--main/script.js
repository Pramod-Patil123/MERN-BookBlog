document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '';
  
    // Basic validation
    if (!email || !password) {
      errorDiv.textContent = 'Both fields are required.';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errorDiv.textContent = 'Please enter a valid email address.';
      return;
    }
  
    // Success feedback for now
    errorDiv.style.color = 'green';
    errorDiv.textContent = 'Validation passed! (Ready to connect to backend)';
  });
  