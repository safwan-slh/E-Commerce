----------Server--------------
npm init -y
npm install express morgan cors nodemon bcryptjs jsonwebtoken

npm i @prisma/adapter-mariadb@7.10.1
npm i dotenv


// Doc ใช้ในการสร้างและอัพเดตฐานข้อมูล
npx prisma migrate dev --name init

----Client-----
npm create vite@latest .
client
javascript

cd client
npm install
npm run dev

npm install axios