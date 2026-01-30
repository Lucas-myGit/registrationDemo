const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'hospital_secret_key_2026';

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root', // 请根据实际情况修改
  database: 'hospital_registration',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ code: 403, message: 'token无效' });
    }
    req.user = user;
    next();
  });
};

// ==================== 患者端API ====================

// 患者登录
app.post('/api/patient/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.json({ code: 400, message: '手机号和密码不能为空' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM patients WHERE phone = ? AND password = ?',
      [phone, password]
    );

    if (rows.length === 0) {
      return res.json({ code: 401, message: '手机号或密码错误' });
    }

    const patient = rows[0];
    const token = jwt.sign(
      { id: patient.id, phone: patient.phone, type: 'patient' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: patient.id,
          phone: patient.phone,
          name: patient.name,
          gender: patient.gender,
          age: patient.age
        }
      }
    });
  } catch (error) {
    console.error('患者登录错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取医生列表
app.get('/api/doctors', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, title, department, specialty, avatar, fee, status FROM doctors WHERE status = 1'
    );

    res.json({
      code: 200,
      data: rows
    });
  } catch (error) {
    console.error('获取医生列表错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 患者挂号
app.post('/api/registration', authenticateToken, async (req, res) => {
  try {
    const { doctorId, regDate, regTime } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !regDate) {
      return res.json({ code: 400, message: '参数不完整' });
    }

    // 检查是否已挂号
    const [existing] = await pool.execute(
      'SELECT * FROM registrations WHERE patient_id = ? AND doctor_id = ? AND reg_date = ? AND status != 3',
      [patientId, doctorId, regDate]
    );

    if (existing.length > 0) {
      return res.json({ code: 400, message: '您已预约该医生当天的号源' });
    }

    // 生成排队号
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM registrations WHERE doctor_id = ? AND reg_date = ?',
      [doctorId, regDate]
    );
    const queueNo = 'A' + String(countResult[0].count + 1).padStart(3, '0');

    // 创建挂号记录
    const [result] = await pool.execute(
      'INSERT INTO registrations (patient_id, doctor_id, reg_date, reg_time, queue_no, status) VALUES (?, ?, ?, ?, ?, 0)',
      [patientId, doctorId, regDate, regTime || '', queueNo]
    );

    res.json({
      code: 200,
      message: '挂号成功',
      data: {
        registrationId: result.insertId,
        queueNo
      }
    });
  } catch (error) {
    console.error('挂号错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取患者挂号记录
app.get('/api/patient/registrations', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.id;

    const [rows] = await pool.execute(`
      SELECT r.*, d.name as doctor_name, d.title as doctor_title, d.department,
             diag.diagnosis, diag.treatment, diag.chief_complaint, diag.prescription, diag.fee
      FROM registrations r
      LEFT JOIN doctors d ON r.doctor_id = d.id
      LEFT JOIN diagnoses diag ON r.id = diag.registration_id
      WHERE r.patient_id = ?
      ORDER BY r.created_at DESC
    `, [patientId]);

    res.json({
      code: 200,
      data: rows
    });
  } catch (error) {
    console.error('获取挂号记录错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// ==================== 医生端API ====================

// 医生登录
app.post('/api/doctor/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ code: 400, message: '账号和密码不能为空' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM doctors WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.json({ code: 401, message: '账号或密码错误' });
    }

    const doctor = rows[0];
    const token = jwt.sign(
      { id: doctor.id, username: doctor.username, type: 'doctor' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: doctor.id,
          username: doctor.username,
          name: doctor.name,
          title: doctor.title,
          department: doctor.department
        }
      }
    });
  } catch (error) {
    console.error('医生登录错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取医生的挂号列表
app.get('/api/doctor/registrations', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { date, status } = req.query;

    let sql = `
      SELECT r.*, p.name as patient_name, p.phone as patient_phone,
             p.gender as patient_gender, p.age as patient_age, p.id_card as patient_id_card,
             diag.id as diagnosis_id
      FROM registrations r
      LEFT JOIN patients p ON r.patient_id = p.id
      LEFT JOIN diagnoses diag ON r.id = diag.registration_id
      WHERE r.doctor_id = ?
    `;
    const params = [doctorId];

    if (date) {
      sql += ' AND r.reg_date = ?';
      params.push(date);
    }

    if (status !== undefined && status !== '') {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY r.status ASC, r.queue_no ASC';

    const [rows] = await pool.execute(sql, params);

    res.json({
      code: 200,
      data: rows
    });
  } catch (error) {
    console.error('获取挂号列表错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取挂号详情
app.get('/api/registration/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`
      SELECT r.*, p.name as patient_name, p.phone as patient_phone,
             p.gender as patient_gender, p.age as patient_age, p.id_card as patient_id_card,
             d.name as doctor_name, d.title as doctor_title, d.department,
             diag.id as diagnosis_id, diag.chief_complaint, diag.present_illness,
             diag.past_history, diag.diagnosis, diag.treatment, diag.prescription, diag.fee
      FROM registrations r
      LEFT JOIN patients p ON r.patient_id = p.id
      LEFT JOIN doctors d ON r.doctor_id = d.id
      LEFT JOIN diagnoses diag ON r.id = diag.registration_id
      WHERE r.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.json({ code: 404, message: '挂号记录不存在' });
    }

    res.json({
      code: 200,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取挂号详情错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 更新挂号状态
app.put('/api/registration/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute(
      'UPDATE registrations SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      code: 200,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新状态错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 提交诊断
app.post('/api/diagnosis', authenticateToken, async (req, res) => {
  try {
    const { registrationId, chiefComplaint, presentIllness, pastHistory, diagnosis, treatment, prescription, fee } = req.body;

    if (!registrationId || !diagnosis) {
      return res.json({ code: 400, message: '参数不完整' });
    }

    // 检查是否已有诊断记录
    const [existing] = await pool.execute(
      'SELECT * FROM diagnoses WHERE registration_id = ?',
      [registrationId]
    );

    if (existing.length > 0) {
      // 更新诊断
      await pool.execute(`
        UPDATE diagnoses SET
          chief_complaint = ?, present_illness = ?, past_history = ?,
          diagnosis = ?, treatment = ?, prescription = ?, fee = ?
        WHERE registration_id = ?
      `, [chiefComplaint || '', presentIllness || '', pastHistory || '', diagnosis, treatment || '', prescription || '', fee || 0, registrationId]);
    } else {
      // 新建诊断
      await pool.execute(`
        INSERT INTO diagnoses (registration_id, chief_complaint, present_illness, past_history, diagnosis, treatment, prescription, fee)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [registrationId, chiefComplaint || '', presentIllness || '', pastHistory || '', diagnosis, treatment || '', prescription || '', fee || 0]);
    }

    // 更新挂号状态为已诊
    await pool.execute(
      'UPDATE registrations SET status = 2 WHERE id = ?',
      [registrationId]
    );

    res.json({
      code: 200,
      message: '诊断提交成功'
    });
  } catch (error) {
    console.error('提交诊断错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取统计数据
app.get('/api/doctor/stats', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // 今日接诊数
    const [todayCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM registrations WHERE doctor_id = ? AND reg_date = ? AND status = 2',
      [doctorId, today]
    );

    // 待诊数
    const [waitingCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM registrations WHERE doctor_id = ? AND reg_date = ? AND status IN (0, 1)',
      [doctorId, today]
    );

    res.json({
      code: 200,
      data: {
        todayDiagnosed: todayCount[0].count,
        waiting: waitingCount[0].count
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
