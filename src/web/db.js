import mysql from 'mysql2';

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '40343604',
    port: '3306',
});

export default connection;