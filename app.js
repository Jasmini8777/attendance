const users = [
    { username: "admin@123gmail.com", password: "admin#45", role: "admin" },
    // { username: "jagat@23gmail.com", password: "jagat124", role: "employee" },
    { username: "jasmini@123gmail.com", password: "jasmini8998", role: "employee" },
    // { username: "khusi@12gmail.com", password: "emp678", role: "employee" },
    // { username: "kumar@12gmail.com", password: "emp134", role: "employee" },
    // { username: "sharma@45gmail.com", password: "emp124", role: "employee" },
    // { username: "ankita@gmail.com", password: "emp125", role: "employee" },
    // { username: "priyanka78@gmail.com", password: "emp125", role: "employee" },
    // { username: "nimish20@gmail.com", password: "nimish20", role: "employee" },
    
];




// // Handle login
// document.getElementById("loginForm").addEventListener("submit", (e) => {
//     e.preventDefault();
//     const username = document.getElementById("username").value;
//     const password = document.getElementById("password").value;

//     const user = users.find(
//         (u) => u.username === username && u.password === password
//     );

//     if (user) {
//         if (user.role === "admin") {
//             window.location.href = "admin.html";
//         } else if (user.role === "employee") {
//             window.location.href = "employee.html";
//         }
//     } else {
//         document.getElementById("error-msg").innerText = "Invalid credentials!";
//     }
// });




document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("username").value;  
    const password = document.getElementById("password").value;

    fetch("http://localhost:3004/login", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.user) {
            sessionStorage.setItem("loggedInUser", JSON.stringify({
                employee_id: data.user.employee_id,
                first_name: data.user.first_name,
                last_name: data.user.last_name,
                email: data.user.email,
                   
                department_id: data.user.department_id,
                shift_id: data.user.shift_id,
                hire_date: data.user.hire_date,
                role: data.user.role
            }));

            // ✅ Redirect Based on Role
            if (data.user.role === "admin") {
                window.location.href = "admin.html";   
            } else if (data.user.role === "employee") {
                window.location.href = "employee.html"; 
            } else {
                document.getElementById("error-msg").innerText = "Invalid Role!";
            }
        } else {
            document.getElementById("error-msg").innerText = "Invalid credentials!";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById("error-msg").innerText = "An error occurred. Please try again.";
    });
});




// Show and hide modals
const forgotPasswordModal = document.getElementById("forgotPasswordModal");

const forgotPasswordLink = document.getElementById("forgotPasswordLink");

const closeForgotPassword = document.getElementById("closeForgotPassword");


forgotPasswordModal.style.display = "none";
    
    
forgotPasswordLink.addEventListener("click", () => {
    forgotPasswordModal.style.display = "flex";
});



closeForgotPassword.addEventListener("click", () => {
    forgotPasswordModal.style.display = "none";
});



window.addEventListener("click", (event) => {
    if (event.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = "none";
    }
   
});

// Handle Forgot Password
document.getElementById("resetPasswordForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const usernameEmail = document.getElementById("resetUsernameEmail").value;
    const newPassword = document.getElementById("newPassword").value;

    const user = users.find(
        (u) => u.username === usernameEmail || u.email === usernameEmail
    );

    if (user) {
        user.password = newPassword;
        alert("Password reset successfully!");
        forgotPasswordModal.style.display = "none";
    } else {
        alert("User not found!");
    }
});





// Call fetchEmployees when Home button is clicked
document.getElementById('home').addEventListener('click', () => {
    document.getElementById('home-section').style.display = 'block'; // Show Home section
    document.getElementById('addEmployees-section').style.display = 'none';
    document.getElementById('markAttendance-section').style.display = 'none';
    
    fetchEmployees(); // Fetch and display employee data
});


//  // Handle form submission
//  document.getElementById('loginForm').addEventListener('submit', (e) => {
//     e.preventDefault();

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     // Send a POST request to the backend with login credentials
//     fetch('http://localhost:3003/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: email, password: password })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             // Store logged-in employee data in sessionStorage
//             sessionStorage.setItem('loggedInUser', JSON.stringify({
//                 employee_id: data.user.employee_id,  // Store Employee ID
//                 first_name: data.user.first_name,
//                 last_name: data.user.last_name,
//                 email: data.user.email,
//                 department_id: data.user.department_id,
//                 shift_id: data.user.shift_id,
//                 hire_date: data.user.hire_date,

//             }));

//             // Redirect to employee dashboard
//             window.location.href = "employee.html";
//         } else {
//             document.getElementById('error-msg').innerText = 'Invalid credentials';
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         document.getElementById('error-msg').innerText = 'An error occurred. Please try again.';
//     });
// });






// Logout
function logout() {
    window.location.href = "index.html";
}


