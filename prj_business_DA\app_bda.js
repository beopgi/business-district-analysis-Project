const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();

// ✅ API 라우터 통합
const userRoutes = require('./routes/v1/userRoutes_bda');

// 📦 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 세션 설정
app.use(session({
  secret: '지운이의_비밀키',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS 아닌 환경에서 false
}));

// 📂 EJS 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ API 라우트
app.use('/api/v1', userRoutes);

// 🌐 프론트 라우트 (EJS 렌더)
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
app.get('/find', (req, res) => {
  res.render('find');
});
app.get('/reset_pw', (req, res) => {
  const id = req.query.id;
  res.render('reset_pw', { id });
});
app.get('/main', (req, res) => {
  const id = req.query.id;
  res.render('main', { id });
});
app.get('/edit_user', (req, res) => {
  // 실제 사용 시 로그인한 유저 정보 조회해서 넘기기 (지금은 쿼리스트링)
  const { id, user_name, phone, email } = req.query;
  res.render('edit_user', { id, user_name, phone, email });
});

// 🛑 404 핸들러
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// 🚀 서버 실행
app.listen(3000, () => {
  console.log('Express REST API 서버가 http://localhost:3000 에서 실행 중입니다.');
});
