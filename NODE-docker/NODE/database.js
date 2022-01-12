const mariadb = require('mariadb')

const pool = mariadb.createPool({
    host:'127.0.0.1', /// Docker's ip direction for localhost || 127.0.0.1 //172.17.0.1 is the IP-address of the host in Docker’s default network. https://forums.docker.com/t/nodejs-docker-container-cant-connect-to-mysql-on-host/115221/2
    port:'3307',
    user: 'root',
    password:'test',
    database:'db1'
});

async function getConnection(){
   try{
    const connection = await pool.getConnection();
    return connection
   } catch (error){
       console.log(error)
   }
}
module.exports = {getConnection}