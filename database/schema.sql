CREATE DATABASE IF NOT EXISTS aigrade DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE aigrade;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role ENUM('teacher','admin') NOT NULL DEFAULT 'teacher',
  name VARCHAR(64) NOT NULL,
  mobile VARCHAR(24),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  teacher_id BIGINT NOT NULL,
  name VARCHAR(64) NOT NULL,
  grade VARCHAR(32) NOT NULL,
  school_year VARCHAR(16) NOT NULL,
  INDEX idx_classes_teacher (teacher_id),
  CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE students (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_id BIGINT NOT NULL,
  student_no VARCHAR(32) NOT NULL,
  name VARCHAR(64) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  UNIQUE KEY uk_student_no_class (class_id, student_no),
  CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_id BIGINT NOT NULL,
  subject ENUM('math','chinese','english') NOT NULL,
  title VARCHAR(160) NOT NULL,
  total_score DECIMAL(6,2) NOT NULL,
  rubric_json JSON NOT NULL,
  answer_version INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assignments_class_created (class_id, created_at),
  CONSTRAINT fk_assignments_class FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE knowledge_points (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subject VARCHAR(32) NOT NULL,
  parent_id BIGINT NULL,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(96) NOT NULL,
  level TINYINT NOT NULL,
  prerequisite_ids JSON,
  UNIQUE KEY uk_knowledge_code (code),
  CONSTRAINT fk_knowledge_parent FOREIGN KEY (parent_id) REFERENCES knowledge_points(id)
);

CREATE TABLE questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT NOT NULL,
  question_no VARCHAR(24) NOT NULL,
  question_type ENUM('choice','judge','calculation','solution','essay') NOT NULL,
  max_score DECIMAL(6,2) NOT NULL,
  standard_answer_json JSON NOT NULL,
  rubric_json JSON,
  knowledge_point_ids JSON NOT NULL,
  CONSTRAINT fk_questions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);

CREATE TABLE submissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  source_object_key VARCHAR(255) NOT NULL,
  status ENUM('uploaded','ocr','grading','review','completed','failed') NOT NULL,
  total_score DECIMAL(6,2),
  ocr_confidence DECIMAL(5,4),
  teacher_reviewed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_submission_assignment_student (assignment_id, student_id),
  INDEX idx_submissions_status_created (status, created_at),
  CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE grading_details (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  submission_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  score DECIMAL(6,2) NOT NULL,
  status ENUM('correct','partial','incorrect','review') NOT NULL,
  ocr_json JSON NOT NULL,
  reasoning_json JSON NOT NULL,
  feedback TEXT,
  model_trace_id VARCHAR(96),
  UNIQUE KEY uk_grading_submission_question (submission_id, question_id),
  CONSTRAINT fk_grading_submission FOREIGN KEY (submission_id) REFERENCES submissions(id),
  CONSTRAINT fk_grading_question FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE error_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  submission_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  knowledge_point_id BIGINT NOT NULL,
  error_type VARCHAR(64) NOT NULL,
  severity TINYINT NOT NULL,
  evidence_json JSON NOT NULL,
  occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_errors_student_knowledge_time (student_id, knowledge_point_id, occurred_at),
  CONSTRAINT fk_errors_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_errors_submission FOREIGN KEY (submission_id) REFERENCES submissions(id),
  CONSTRAINT fk_errors_question FOREIGN KEY (question_id) REFERENCES questions(id),
  CONSTRAINT fk_errors_knowledge FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_points(id)
);

CREATE TABLE mastery_snapshots (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  knowledge_point_id BIGINT NOT NULL,
  mastery DECIMAL(5,4) NOT NULL,
  evidence_count INT NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  calculated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mastery_student_time (student_id, calculated_at),
  CONSTRAINT fk_mastery_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_mastery_knowledge FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_points(id)
);

CREATE TABLE prompt_versions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  scene VARCHAR(64) NOT NULL,
  subject VARCHAR(32) NOT NULL,
  version VARCHAR(24) NOT NULL,
  template TEXT NOT NULL,
  output_schema JSON NOT NULL,
  enabled TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_prompt_scene_subject_version (scene, subject, version)
);
