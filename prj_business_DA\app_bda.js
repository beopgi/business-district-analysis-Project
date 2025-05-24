const path = require('path');
const express = require('express');
const app = express();
const userRoutes1 = require('./routes/v1/userRoutes_bda');
// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API 라우트
app.use('/api/v1', userRoutes1);

// 프론트 페이지 라우트
app.get('/', (req, res) => {
  res.redirect('/join');
});

app.get('/join', (req, res) => {
  res.render('join');
});

app.get('/welcome', (req, res) => {
  res.render('welcome');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/main', (req, res) => {
  const id = req.query.id;
  res.render('main', { id });  // ← id를 뷰로 넘겨줌
});

app.get('/find', (req, res) => {
  res.render('find');
});

app.get('/reset_pw', (req, res) => {
  const id = req.query.id;
  res.render('reset_pw', { id });
});


app.listen(3000, () => {
  console.log('Express REST API 서버가 http://localhost:3000 에서 실행 중입니다.');
});

// 404 처리
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});
