# 智慧医院挂号系统

一个完整的医院挂号系统，包含患者H5端、医生Web端和后端服务。

## 项目结构

```
registrationDemo/
├── backend/          # Node.js + Express 后端服务
├── frontend/
│   ├── h5/          # 患者端 H5 (Vue3 + Pinia + Element Plus)
│   └── web/         # 医生端 Web (Vue3 + Pinia + Element Plus)
└── sql/             # 数据库初始化脚本
```

## 默认账号

- **患者端**: 手机号 `13333333333`，密码 `123`
- **医生端**: 账号 `admin`，密码 `123`

## 快速开始

### 1. 初始化数据库

确保已安装 MySQL，然后执行 SQL 脚本：

```bash
mysql -u root -p < sql/init.sql
```

或者在 MySQL 客户端中执行 `sql/init.sql` 文件内容。

### 2. 配置后端数据库连接

编辑 `backend/app.js`，修改数据库连接配置：

```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',  // 修改为你的数据库密码
  database: 'hospital_registration',
  ...
});
```

### 3. 启动后端服务

```bash
cd backend
npm install
npm start
```

后端服务将运行在 http://localhost:3000

### 4. 启动患者端 H5

```bash
cd frontend/h5
npm install
npm run dev
```

H5 端将运行在 http://localhost:5173

### 5. 启动医生端 Web

```bash
cd frontend/web
npm install
npm run dev
```

Web 端将运行在 http://localhost:5174

## 功能流程

1. **患者登录** - 使用手机号 13333333333 和密码 123 登录 H5 端
2. **选择医生挂号** - 在挂号页面选择日期和医生（admin 张德远医生）进行挂号
3. **医生登录** - 使用账号 admin 和密码 123 登录 Web 端
4. **查看挂号** - 医生在工作台左侧可以看到患者的挂号信息
5. **填写诊断** - 医生选择患者，填写主诉、诊断、治疗建议等信息并提交
6. **查看诊断结果** - 患者在 H5 端的就诊记录中可以查看医生的诊断结果

## API 接口

### 患者端
- `POST /api/patient/login` - 患者登录
- `GET /api/doctors` - 获取医生列表
- `POST /api/registration` - 创建挂号
- `GET /api/patient/registrations` - 获取患者挂号记录

### 医生端
- `POST /api/doctor/login` - 医生登录
- `GET /api/doctor/registrations` - 获取医生的挂号列表
- `GET /api/registration/:id` - 获取挂号详情
- `PUT /api/registration/:id/status` - 更新挂号状态
- `POST /api/diagnosis` - 提交诊断
- `GET /api/doctor/stats` - 获取统计数据

## 技术栈

- **后端**: Node.js + Express + MySQL
- **前端**: Vue 3 + Pinia + Element Plus + Vite
- **H5适配**: amfe-flexible + postcss-pxtorem
