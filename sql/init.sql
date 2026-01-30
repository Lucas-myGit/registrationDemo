-- 智慧医院挂号系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS hospital_registration DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hospital_registration;

-- 患者表
CREATE TABLE IF NOT EXISTS patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    name VARCHAR(50) DEFAULT '' COMMENT '姓名',
    gender VARCHAR(10) DEFAULT '' COMMENT '性别',
    age INT DEFAULT 0 COMMENT '年龄',
    id_card VARCHAR(20) DEFAULT '' COMMENT '身份证号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='患者表';

-- 医生表
CREATE TABLE IF NOT EXISTS doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    title VARCHAR(50) DEFAULT '' COMMENT '职称',
    department VARCHAR(50) DEFAULT '' COMMENT '科室',
    specialty VARCHAR(255) DEFAULT '' COMMENT '擅长',
    avatar VARCHAR(255) DEFAULT '' COMMENT '头像',
    fee DECIMAL(10,2) DEFAULT 50.00 COMMENT '挂号费',
    status TINYINT DEFAULT 1 COMMENT '状态 1-接诊中 0-停诊',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生表';

-- 挂号记录表
CREATE TABLE IF NOT EXISTS registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL COMMENT '患者ID',
    doctor_id INT NOT NULL COMMENT '医生ID',
    reg_date DATE NOT NULL COMMENT '挂号日期',
    reg_time VARCHAR(20) DEFAULT '' COMMENT '挂号时段',
    status TINYINT DEFAULT 0 COMMENT '状态 0-待诊 1-诊中 2-已诊 3-已取消',
    queue_no VARCHAR(20) DEFAULT '' COMMENT '排队号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='挂号记录表';

-- 诊断记录表
CREATE TABLE IF NOT EXISTS diagnoses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL UNIQUE COMMENT '挂号记录ID',
    chief_complaint TEXT COMMENT '主诉',
    present_illness TEXT COMMENT '现病史',
    past_history TEXT COMMENT '既往史',
    diagnosis TEXT COMMENT '诊断结果',
    treatment TEXT COMMENT '治疗建议',
    prescription TEXT COMMENT '处方',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诊断记录表';

-- 插入默认患者数据
INSERT INTO patients (phone, password, name, gender, age) VALUES
('13333333333', '123', '张晓明', '男', 30);

-- 插入默认医生数据
INSERT INTO doctors (username, password, name, title, department, specialty, fee) VALUES
('admin', '123', '张德远', '主任医师', '心内科', '高血压、冠心病、心律失常', 50.00);
