const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5102,
  path: '/api/Auth/admin-login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("LOGIN RESPONSE:");
    console.log(data);
    const json = JSON.parse(data);
    
    // Now request claims
    const token = json.token;
    if(token) {
        const claimsOptions = {
            hostname: 'localhost',
            port: 5102,
            path: '/api/Auth/claims',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const req2 = http.request(claimsOptions, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
                console.log("CLAIMS RESPONSE (" + res2.statusCode + "):");
                console.log(data2);
                
                // Now request courses
                const coursesOptions = {
                    hostname: 'localhost',
                    port: 5102,
                    path: '/api/admin/courses?status=pending&page=1',
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const req3 = http.request(coursesOptions, (res3) => {
                    let data3 = '';
                    res3.on('data', chunk => data3 += chunk);
                    res3.on('end', () => {
                        console.log("COURSES RESPONSE (" + res3.statusCode + "):");
                        console.log(data3);
                    });
                });
                req3.end();
            });
        });
        req2.end();
    }
  });
});

req.write(JSON.stringify({ email: 'admin@gmail.com', password: 'Admin@123' }));
req.end();
