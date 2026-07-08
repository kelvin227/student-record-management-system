# Student Record Management System

**Project Architecture**

## **Backend & Database**

* Next.js (App Router)  
* Prisma ORM  
* PostgreSQL  
* JWT/Auth Sessions  
* REST API or Next.js Route Handlers

## **Web Application**

### **Admin Portal**

For system administrators.

Features:

* Dashboard  
* Student Management  
* Lecturer Management  
* Department Management  
* Course Management  
* Session Management  
* Semester Management  
* User Management  
* Result Management  
* Transcript Management  
* Reports  
* System Settings

### **Lecturer Portal**

Features:

* Dashboard  
* Assigned Courses  
* Student Lists  
* Score Entry  
* Result Submission  
* Result History  
* Profile

### **Student Portal (Web)**

Features:

* Dashboard  
* Profile  
* Course Registration  
* Results  
* GPA/CGPA  
* Transcript Requests  
* Notifications

---

## **Mobile Application (Flutter)**

Student-focused.

Features:

* Login  
* Profile  
* Course Registration Status  
* Semester Results  
* GPA/CGPA  
* Transcript View  
* Notifications  
* Academic History

The Flutter app and web student portal should use the same API.

---

# **Database Design Modules**

## **Academic Structure**

### **Departments**

id  
name  
code  
createdAt

### **Programs**

id  
departmentId  
name  
duration

### **Sessions**

id  
name  
isActive

Example:

2025/2026  
2026/2027

### **Semesters**

id  
sessionId  
name

Example:

First Semester  
Second Semester

---

## **User System**

### **Users**

id  
email  
password  
role  
createdAt

Roles:

ADMIN  
LECTURER  
STUDENT

### **Students**

id  
userId  
matricNo  
firstname  
lastname  
departmentId  
programId  
level  
phone

### **Lecturers**

id  
userId  
staffId  
firstname  
lastname  
departmentId

---

## **Courses**

id  
code  
title  
creditUnit  
departmentId  
level  
semesterId

Example:

CSC101  
Introduction to Computing  
3 Units

---

## **Course Registration**

id  
studentId  
courseId  
sessionId  
semesterId  
status

This determines which courses a student is taking.

---

## **Result System**

### **Scores**

id  
studentId  
courseId  
ca  
exam  
total  
grade  
gradePoint  
lecturerId

---

### **GPA Records**

id  
studentId  
sessionId  
semesterId  
gpa  
cgpa

Can be generated automatically.

---

# **Development Phases**

## **Phase 1**

Foundation

* Setup Next.js  
* Setup PostgreSQL  
* Setup Prisma  
* Authentication  
* User Roles  
* Dashboard Layout

## **Phase 2**

Academic Management

* Departments  
* Programs  
* Sessions  
* Semesters  
* Courses

## **Phase 3**

Student Management

* Student CRUD  
* Lecturer CRUD  
* Bulk Import Students  
* Student Profiles

## **Phase 4**

Course Registration

* Register Courses  
* View Registrations  
* Approval Workflow (optional)

## **Phase 5**

Result Management

* Lecturer Score Entry  
* Grade Calculation  
* GPA Calculation  
* CGPA Calculation  
* Result Publishing

## **Phase 6**

Reports

* Result Sheets  
* Student Transcript  
* Academic Reports  
* Export PDF

## **Phase 7**

Student Portal

* Student Dashboard  
* View Results  
* View GPA/CGPA  
* Download Transcript

## **Phase 8**

Flutter Mobile App

* Authentication  
* Student Profile  
* Results  
* GPA/CGPA  
* Notifications

---

# **One Important Addition**

The literature review repeatedly mentions **security and role-based access control**, so I'd recommend adding:

### **Audit Logs**

id  
userId  
action  
entity  
entityId  
createdAt

Examples:

* Result Updated  
* Course Added  
* Student Created  
* Transcript Generated

This will strengthen the project academically because examiners often ask:

"How can you track who modified a student's result?"

With audit logs, you'll have a clear answer.

My recommendation is to start with **Phase 1 (database schema and authentication design)** before writing any UI, because almost every module depends on those core structures.

