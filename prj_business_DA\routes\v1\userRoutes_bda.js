const express = require('express');
const router = express.Router();
const db = require('../../db_bda');

// 회원가입 라우트
router.post('/register', async (req, res) => {
  const { name, phone, email, userid, password } = req.body;
  if (!name || !phone || !email || !userid || !password) {
    return res.status(400).send('비밀번호는 최소 8자리 이상이어야 합니다.');
  }

  try {
    const conn = await db.getConnection();
    const sql = 'INSERT INTO bda_user (user_name, phone, email, id, pw) VALUES (?, ?, ?, ?, ?)';
    await conn.query(sql, [name, phone, email, userid, password]);
    conn.release();
    res.status(201).send('가입 성공');
  } catch (err) {
    console.error('회원가입 실패:', err);
    res.status(500).send('DB 오류: ' + err.message);
  }
});

//로그인 라우트
router.post('/login', async (req, res) => {
  const { userid, password } = req.body;
  if (!userid || !password) {
    return res.status(400).send('입력 누락');
  }

  try {
    const conn = await db.getConnection();
    const sql = 'SELECT * FROM bda_user WHERE id = ? AND pw = ?';
    const [rows] = await conn.query(sql, [userid, password]);
    conn.release();

    if (rows.length > 0) {
      res.status(200).json({ id: userid });
    } else {
      res.status(401).send('아이디 또는 비밀번호 불일치');
    }
  } catch (err) {
    res.status(500).send('DB 오류');
  }
});

// 아이디 찾기
router.post('/find-id', async (req, res) => {
  const { name } = req.body;
  try {
    const conn = await db.getConnection();
    const sql = 'SELECT id FROM bda_user WHERE user_name = ?';
    const [rows] = await conn.query(sql, [name]);
    conn.release();

    if (rows.length > 0) {
      res.send(`당신의 아이디는: ${rows[0].id}`);
    } else {
      res.send('일치하는 사용자를 찾을 수 없습니다.');
    }
  } catch (err) {
    res.status(500).send('DB 오류');
  }
});

// 비밀번호 찾기
router.post('/find_pw', async (req, res) => {
  const { userid, name } = req.body;
  try {
    const conn = await db.getConnection();
    const sql = 'SELECT pw FROM bda_user WHERE id = ? AND user_name = ?';
    const [rows] = await conn.query(sql, [userid, name]);
    conn.release();

   if (rows.length > 0) {
  // 아이디가 확인됐으니 비밀번호 변경하러 가라고 알려줌
  res.json({ id: userid }); // 클라이언트에서 이걸 보고 redirect 함
} else {
  res.send('일치하는 정보를 찾을 수 없습니다.');
}

  } catch (err) {
    res.status(500).send('DB 오류');
  }
});

router.post('/reset_pw', async (req, res) => {
  const { id, newPw, confirmPw } = req.body;
  if (!id || !newPw || !confirmPw) {
    return res.status(400).send('입력 누락');
  }

  try {
    const conn = await db.getConnection();

    const sql = `
      UPDATE bda_user 
      SET pw = ? 
      WHERE id = ? 
        AND pw != ? 
        AND ? = ?
    `;

    const [result] = await conn.query(sql, [newPw, id, newPw, newPw, confirmPw]);
    conn.release();

    if (result.affectedRows > 0) {
      res.status(200).send('비밀번호가 성공적으로 변경되었습니다.');
    } else {
      res.status(400).send('비밀번호 변경 조건을 만족하지 않습니다.');
    }
  } catch (err) {
    res.status(500).send('DB 오류: ' + err.message);
  }
});


module.exports = router;
