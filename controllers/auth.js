const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    // step 1 เช็คก่อนว่า email กับ password ว่างไหม
    if (!email) {
      return res.status(400).json({ message: 'Email is required!!!' });
    }
    if (!password) {
      return res.status(400).json({ message: 'password is required!!!' });
    }

    // step 2 เช็ค email ใน database ว่ามีไหม
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      return res.status(400).json({ message: 'Email already exits!!' });
    }

    // step 3 แปลงรหัสผ่าน
    const hashPassword = await bcrypt.hash(password, 10);

    // step 4 เข้าสู่ระบบ
    await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
      },
    });

    res.send('Register susses');
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // step 1 เช็ค email
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user || !user.enable) {
      return res.status(400).json({ message: 'User not found or not enabled' });
    }
    // step 2 เช็ค password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is invalid' });
    }

    // step 3 สร้าง Payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // step 4 สร้าง Token
    if (!process.env.SECRET_KEY) {
      return res.status(500).json({ message: 'JWT secret is not configured' });
    }

    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      {
        expiresIn: '1d',
      },
      (err, token) => {
        if (err) {
          return res.status(500).json({ message: 'Error generating token' });
        }
        res.json({ payload, token });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.currentUser = async (req, res) => {
  try {
    res.send('Current user route');
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
