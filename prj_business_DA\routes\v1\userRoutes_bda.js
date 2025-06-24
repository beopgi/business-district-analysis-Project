const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const db = require('../../db_bda');
const path = require('path');
const fs = require('fs');

// 정규식
const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;

/* 1. 회원가입 */
// 기존 코드 중 회원가입 부분만!
router.post('/join', async (req, res) => {
  let { user_name, phone, email, id, pw } = req.body;
  phone = phone.replace(/-/g, '');
  if (!user_name || !id || !pw) {
    return res.status(400).json({ message: "이름, ID, 비밀번호는 필수입니다." });
  }
  if (!idRegex.test(id)) {
    return res.status(400).json({ message: "ID는 영문+숫자 8~16자입니다." });
  }
  if (!pwRegex.test(pw)) {
    return res.status(400).json({ message: "비밀번호는 영문+숫자 8~16자입니다." });
  }
  try {
    const [exists] = await db.query('SELECT * FROM bda_user WHERE id = ?', [id]);
    if (exists.length > 0) {
      return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
    }
    // 👇 여기서 비밀번호를 해시화
    const hash = await bcrypt.hash(pw, 10);
    await db.query(
      'INSERT INTO bda_user (user_name, phone, email, id, pw) VALUES (?, ?, ?, ?, ?)',
      [user_name, phone, email, id, hash]
    );
    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});


/* 2. 로그인 */
router.post('/login', async (req, res) => {
  const { id, pw } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM bda_user WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
    }
    const user = rows[0];
    // 👇 입력받은 pw와 DB의 해시값을 bcrypt로 비교
    const match = await bcrypt.compare(pw, user.pw);
    if (!match) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }
    req.session.userId = user.id;
    res.json({ id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});


/* 3. 아이디 찾기 */
router.post('/find-id', async (req, res) => {
  const { name } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM bda_user WHERE user_name = ?', [name]);
    if (rows.length === 0) {
      return res.status(404).send("해당 이름의 아이디를 찾을 수 없습니다.");
    }
    res.send(`아이디: ${rows[0].id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});

/* 4. 비밀번호 찾기(비밀번호 변경 링크로 이동) */
router.post('/find_pw', async (req, res) => {
  const { id, name } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM bda_user WHERE id = ? AND user_name = ?', [id, name]);
    if (rows.length === 0) {
      return res.status(404).send("일치하는 정보가 없습니다.");
    }
    res.json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});

/* 5. 비밀번호 재설정 */
router.post('/reset_pw', async (req, res) => {
  const { id, newPw, confirmPw } = req.body;
  if (!pwRegex.test(newPw)) {
    return res.status(400).send("비밀번호는 영문+숫자 조합 8~16자여야 합니다.");
  }
  if (newPw !== confirmPw) {
    return res.status(400).send("비밀번호와 확인 값이 일치하지 않습니다.");
  }
  try {
    // 👇 비밀번호를 해시화해서 저장
    const hash = await bcrypt.hash(newPw, 10);
    const [result] = await db.query('UPDATE bda_user SET pw = ? WHERE id = ?', [hash, id]);
    if (result.affectedRows === 0) {
      return res.status(404).send("해당 아이디가 존재하지 않습니다.");
    }
    res.send("비밀번호가 성공적으로 변경되었습니다.");
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});


/* 6. 회원정보 수정 */
router.post('/update-user', async (req, res) => {
  let { user_name, phone, email, id, current_pw, new_pw } = req.body;
  phone = phone.replace(/-/g, '');
  try {
    const [rows] = await db.query('SELECT * FROM bda_user WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).send("존재하지 않는 사용자입니다.");
    }
    const user = rows[0];
    // 👇 현재 비번 확인 (입력값 vs 해시)
    const match = await bcrypt.compare(current_pw, user.pw);
    if (!match) {
      return res.status(401).send("현재 비밀번호가 일치하지 않습니다.");
    }
    let finalPw = user.pw;
    if (new_pw && pwRegex.test(new_pw)) {
      // 👇 새 비번도 해시!
      finalPw = await bcrypt.hash(new_pw, 10);
    }
    await db.query(
      'UPDATE bda_user SET user_name=?, phone=?, email=?, pw=? WHERE id=?',
      [user_name, phone, email, finalPw, id]
    );
    res.send("회원정보가 성공적으로 수정되었습니다.");
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});


/* 7. 파일 다운로드 */
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../mnt/data', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('File download error');
    }
  });
});

/* 8. 로그아웃 */
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
