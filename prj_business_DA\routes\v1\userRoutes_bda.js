const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../../db_bda');

const saltRounds = 10;

// ✅ 회원가입
router.post('/register', async (req, res) => {
  const { name, phone, email, userid, password } = req.body;
  if (!name || !phone || !email || !userid || !password) {
    return res.status(400).send('모든 항목을 입력해 주십시오.');
  }

  try {
    const conn = await db.getConnection();
    const hashedPw = await bcrypt.hash(password, saltRounds);
    await conn.execute(
      'INSERT INTO bda_user (user_name, phone, email, id, pw) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email, userid, hashedPw]
    );
    conn.release();
    res.status(201).send('회원가입이 성공적으로 완료되었습니다.');
  } catch (err) {
    console.error('회원가입 실패:', err);
    res.status(500).send('DB 오류: ' + err.message);
  }
});

// ✅ 로그인
router.post('/login', async (req, res) => {
  const { userid, password } = req.body;
  if (!userid || !password) {
    return res.status(400).send('모든 항목을 입력해 주십시오.');
  }

  try {
    const conn = await db.getConnection();
    const [rows] = await conn.query('SELECT pw FROM bda_user WHERE id = ?', [userid]);
    conn.release();

    if (rows.length === 0) {
      return res.status(401).send('아이디 또는 비밀번호가 불일치합니다.');
    }

    const match = await bcrypt.compare(password, rows[0].pw);

    if (match) {
      res.status(200).json({ id: userid });
    } else {
      res.status(401).send('아이디 또는 비밀번호가 불일치합니다.');
    }
  } catch (err) {
    res.status(500).send('DB 오류: ' + err.message);
  }
});

// ✅ 아이디 찾기
router.post('/find-id', async (req, res) => {
  const { name } = req.body;
  try {
    const conn = await db.getConnection();
    const [rows] = await conn.query('SELECT id FROM bda_user WHERE user_name = ?', [name]);
    conn.release();

    if (rows.length > 0) {
      res.send(`당신의 아이디는: ${rows[0].id}`);
    } else {
      res.send('일치하는 사용자를 찾을 수 없습니다.');
    }
  } catch (err) {
    res.status(500).send('DB 오류: ' + err.message);
  }
});

// ✅ 비밀번호 찾기 (확인만)
router.post('/find_pw', async (req, res) => {
  const { userid, name } = req.body;
  try {
    const conn = await db.getConnection();
    const [rows] = await conn.query('SELECT id FROM bda_user WHERE id = ? AND user_name = ?', [userid, name]);
    conn.release();

    if (rows.length > 0) {
      res.json({ id: userid }); // 클라이언트에서 이 id로 reset_pw로 이동
    } else {
      res.send('일치하는 정보를 찾을 수 없습니다.');
    }
  } catch (err) {
    res.status(500).send('DB 오류: ' + err.message);
  }
});

// ✅ 비밀번호 재설정
router.post('/reset_pw', async (req, res) => {
  const { id, newPw, confirmPw } = req.body;
  if (!id || !newPw || !confirmPw) {
    return res.status(400).send('모든 항목을 입력해 주십시오.');
  }
  if (newPw !== confirmPw) {
    return res.status(400).send('비밀번호와 확인 비밀번호가 일치하지 않습니다.');
  }

  try {
    const hashedNewPw = await bcrypt.hash(newPw, saltRounds);
    const conn = await db.getConnection();
    const [result] = await conn.query('UPDATE bda_user SET pw = ? WHERE id = ?', [hashedNewPw, id]);
    conn.release();

    if (result.affectedRows > 0) {
      res.status(200).send('비밀번호가 성공적으로 변경되었습니다.');
    } else {
      res.status(400).send('비밀번호 변경 실패: 사용자 없음');
    }
  } catch (err) {
    res.status(500).send('DB 오류: ' + err.message);
  }
});

module.exports = router;
