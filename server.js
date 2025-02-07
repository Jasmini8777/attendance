const express = require('express');
const bodyParser = require('body-parser');

const mysql = require('mysql');
const cors = require('cors');



// Create Express app
const app = express();


// Use middleware
app.use(bodyParser.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.urlencoded({ extended: true }));


// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '', // Replace with your MySQL password
    database: 'attendance_system1'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


/////////////////////fetching employees data

app.get('/employees', (req, res) => {
    console.log('Fetching employees...');
    const query = 'SELECT * FROM employees';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            res.status(500).send('Error fetching employees');
            return;
        }
        console.log('Employees fetched:', results);
        res.json(results);
    });
});

/////////Add Employee
app.post('/add-employee', (req, res) => {
    const { first_name, last_name, email, password, hire_date, department_id, shift_id, role } = req.body;

    if (!first_name || !last_name || !email || !password || !hire_date || !department_id || !shift_id || role) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const query = "INSERT INTO employees (first_name, last_name, email, password, hire_date, department_id, shift_id, role) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(query, [first_name, last_name, email, password, hire_date, department_id, shift_id, role], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ success: false, message: 'Error adding employee' });
        }

        res.status(201).json({ success: true, message: 'Employee added successfully' });
    });
});




// Route to fetch all departments
app.get('/department', (req, res) => {
    const query = 'SELECT * FROM department';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch departments' });
            return;
        }
        res.status(200).json(results);
    });
});

// ////////////////Add departments

app.post('/add-department', (req, res) => {
    const { name } = req.body;
    const query = `
        INSERT INTO department (name)
        VALUES (?)
    `;
    db.query(query, [name], (err, result) => {
        if (err) {
            console.error('Error adding department:', err);
            res.status(500).send({ success: false, message: 'Error adding department' });
        } else {
            console.log('Department added:', name);
            res.status(200).json({ success: true, message: 'Department added successfully!' });
        }
    });
});




// Utility function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Utility function to validate latitude and longitude
function isValidCoordinate(lat, lon) {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

app.post('/markAttendance', (req, res) => {
    const { employeeId, latitude, longitude } = req.body;

    if (!employeeId || !latitude || !longitude) {
        return res.status(400).json({ message: 'Employee ID, latitude, and longitude are required.' });
    }

    if (!isValidCoordinate(latitude, longitude)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude.' });
    }

    const query = 'SELECT * FROM location';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching locations:', err);
            return res.status(500).json({ message: 'Database error.' });
        }

        let status = 'Absent';
        let locationId = null;

        // Calculate distance and check presence status
        for (const location of results) {
            const distance = calculateDistance(
                parseFloat(location.latitude),
                parseFloat(location.longitude),
                parseFloat(latitude),
                parseFloat(longitude)
            );

            if (distance <= 0.5) {
                status = 'Present';
                locationId = location.location_id;
                break;
            }
        }

        const date = new Date().toISOString().split('T')[0];

        // Check if attendance is already marked
        const checkQuery = `SELECT * FROM attendance WHERE employee_id = ? AND date = ?`;
        db.query(checkQuery, [employeeId, date], (err, results) => {
            if (err) {
                console.error('Error checking attendance:', err);
                return res.status(500).json({ message: 'Database error.' });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Attendance already marked for today.' });
            }

            // Insert attendance record
            const insertQuery = `INSERT INTO attendance (employee_id, date, status, location_id) VALUES (?, ?, ?, ?)`;
            db.query(insertQuery, [employeeId, date, status, locationId], (err, result) => {
                if (err) {
                    console.error('Error inserting attendance:', err);
                    return res.status(500).json({ message: ' Attendance marked as ${status}.' });
                }

                return res.status(200).json({ message: `Attendance marked as ${status}.` });
            });
        });
    });
});


 // Fetch attendance records
app.get("/api/attendance", (req, res) => {
    const query = "SELECT * FROM attendance";
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: "Error fetching attendance data" });
        } else {
            res.json(results);
        }
    });
});   



// // Handle login
// app.post('/login', (req, res) => {
//     const { username, password } = req.body;

//     // SQL query to check if the username and password match
//     const query = 'SELECT * FROM employees WHERE email = ? AND password = ?';
    
//     db.query(query, [username, password], (err, results) => {
//         if (err) {
//             return res.status(500).json({ message: 'Server error' });
//         }

//         if (results.length > 0) {
//             // If the employee is found, send their data
//             res.json({ user: results[0] });
//         } else {
//             // If the credentials are invalid
//             res.status(401).json({ message: 'Invalid username or password' });
            
//         }
        
//     });
// });



app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM employees WHERE email = ? AND password = ?";

    db.query(query, [email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length > 0) {
            const user = results[0];

            res.json({
                user: {
                    employee_id: user.employee_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    department_id: user.department_id,
                     shift_id: user.shift_id,
                     hire_date: user.hire_date,
                    role: user.role  // ✅ Now we have a role column
                }
            });
        } else {
            res.status(401).json({ message: "Invalid username or password" });
        }
    });
});




// Utility function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Utility function to validate latitude and longitude
function isValidCoordinate(lat, lon) {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

app.post('/markAttendance', (req, res) => {
    const { employeeId, latitude, longitude } = req.body;

    if (!employeeId || !latitude || !longitude) {
        return res.status(400).json({ message: 'Employee ID, latitude, and longitude are required.' });
    }

    if (!isValidCoordinate(latitude, longitude)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude.' });
    }

    const query = 'SELECT * FROM location';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching locations:', err);
            return res.status(500).json({ message: 'Database error.' });
        }

        let status = 'Absent';
        let locationId = null;

        // Calculate distance and check presence status
        for (const location of results) {
            const distance = calculateDistance(
                parseFloat(location.latitude),
                parseFloat(location.longitude),
                parseFloat(latitude),
                parseFloat(longitude)
            );

            if (distance <= 0.5) {
                status = 'Present';
                locationId = location.location_id;
                break;
            }
        }

        const date = new Date().toISOString().split('T')[0];

        // Check if attendance is already marked
        const checkQuery = `SELECT * FROM attendance WHERE employee_id = ? AND date = ?`;
        db.query(checkQuery, [employeeId, date], (err, results) => {
            if (err) {
                console.error('Error checking attendance:', err);
                return res.status(500).json({ message: 'Database error.' });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Attendance already marked for today.' });
            }

            // Insert attendance record
            const insertQuery = `INSERT INTO attendance (employee_id, date, status, location_id) VALUES (?, ?, ?, ?)`;
            db.query(insertQuery, [employeeId, date, status, locationId], (err, result) => {
                if (err) {
                    console.error('Error inserting attendance:', err);
                    return res.status(500).json({ message: ' Attendance marked as ${status}.' });
                }

                return res.status(200).json({ message: `Attendance marked as ${status}.` });
            });
        });
    });
});


app.get('/viewAttendance/:employeeId', (req, res) => {
    const employeeId = req.params.employeeId; // Get Employee ID from URL
    const query = "SELECT  employee_id, date, status, location_id FROM attendance WHERE employee_id = ?";

    
    db.query(query, [employeeId], (err, results) => {
        if (err) {
            console.error("Error fetching attendance records:", err);
            res.status(500).json({ error: "Failed to fetch records" });
            return;
        }
        res.json(results);
    });
});


    

// Start Server
app.listen(3004, () => {
    console.log('Server running at http://localhost:3004');
});
