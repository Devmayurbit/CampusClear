import { type Student, type InsertStudent, type Department, type InsertDepartment, type Clearance, type InsertClearance } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByEnrollment(enrollmentNo: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;

  // Department operations
  getDepartment(id: string): Promise<Department | undefined>;
  getAllDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Clearance operations
  getClearance(id: string): Promise<Clearance | undefined>;
  getClearancesByStudent(studentId: string): Promise<Clearance[]>;
  getClearanceByStudentAndDepartment(studentId: string, departmentId: string): Promise<Clearance | undefined>;
  createClearance(clearance: InsertClearance): Promise<Clearance>;
  updateClearance(id: string, clearance: Partial<InsertClearance>): Promise<Clearance | undefined>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private departments: Map<string, Department>;
  private clearances: Map<string, Clearance>;

  constructor() {
    this.students = new Map();
    this.departments = new Map();
    this.clearances = new Map();

    // Initialize default departments
    this.initializeDefaultDepartments();
  }

  private initializeDefaultDepartments() {
    const defaultDepartments = [
      { name: "Library", description: "Book returns and fine clearance", color: "#10b981" },
      { name: "Accounts", description: "Fee payment and financial clearance", color: "#f59e0b" },
      { name: "Hostel", description: "Room and mess clearance", color: "#3b82f6" },
      { name: "Academic", description: "Project submission and lab equipment", color: "#8b5cf6" },
      { name: "Sports", description: "Equipment and uniform return", color: "#f97316" },
      { name: "IT Department", description: "ID card and system access", color: "#6366f1" },
    ];

    defaultDepartments.forEach(dept => {
      const id = randomUUID();
      const department: Department = {
        id,
        ...dept,
        createdAt: new Date(),
      };
      this.departments.set(id, department);
    });
  }

  // Student operations
  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByEnrollment(enrollmentNo: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.enrollmentNo === enrollmentNo,
    );
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.email === email,
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { 
      ...insertStudent,
      id,
      phone: insertStudent.phone || null,
      address: insertStudent.address || null,
      profilePhoto: insertStudent.profilePhoto || null,
      cgpa: insertStudent.cgpa || null,
      credits: insertStudent.credits || null,
      semester: insertStudent.semester || null,
      expectedGraduation: insertStudent.expectedGraduation || null,
      emergencyContactName: insertStudent.emergencyContactName || null,
      emergencyContactRelation: insertStudent.emergencyContactRelation || null,
      emergencyContactPhone: insertStudent.emergencyContactPhone || null,
      emergencyContactEmail: insertStudent.emergencyContactEmail || null,
      createdAt: new Date(),
    };
    this.students.set(id, student);

    // Create initial clearance records for all departments
    const departments = Array.from(this.departments.values());
    for (const dept of departments) {
      await this.createClearance({
        studentId: id,
        departmentId: dept.id,
        status: "pending",
        requirements: this.getDefaultRequirements(dept.name),
        completedRequirements: [],
      });
    }

    return student;
  }

  async updateStudent(id: string, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;

    const updatedStudent = { ...student, ...updateData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  // Department operations
  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const department: Department = { 
      ...insertDepartment,
      id,
      description: insertDepartment.description || null,
      color: insertDepartment.color || "#6366f1",
      createdAt: new Date(),
    };
    this.departments.set(id, department);
    return department;
  }

  // Clearance operations
  async getClearance(id: string): Promise<Clearance | undefined> {
    return this.clearances.get(id);
  }

  async getClearancesByStudent(studentId: string): Promise<Clearance[]> {
    return Array.from(this.clearances.values()).filter(
      (clearance) => clearance.studentId === studentId,
    );
  }

  async getClearanceByStudentAndDepartment(studentId: string, departmentId: string): Promise<Clearance | undefined> {
    return Array.from(this.clearances.values()).find(
      (clearance) => clearance.studentId === studentId && clearance.departmentId === departmentId,
    );
  }

  async createClearance(insertClearance: InsertClearance): Promise<Clearance> {
    const id = randomUUID();
    const clearance: Clearance = { 
      ...insertClearance,
      id,
      status: insertClearance.status || "pending",
      requirements: insertClearance.requirements || [],
      completedRequirements: insertClearance.completedRequirements || [],
      remarks: insertClearance.remarks || null,
      clearedAt: insertClearance.clearedAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clearances.set(id, clearance);
    return clearance;
  }

  async updateClearance(id: string, updateData: Partial<InsertClearance>): Promise<Clearance | undefined> {
    const clearance = this.clearances.get(id);
    if (!clearance) return undefined;

    const updatedClearance = { 
      ...clearance, 
      ...updateData,
      updatedAt: new Date(),
    };
    this.clearances.set(id, updatedClearance);
    return updatedClearance;
  }

  private getDefaultRequirements(departmentName: string): string[] {
    const requirements: Record<string, string[]> = {
      "Library": ["Book Returns", "Fine Payment"],
      "Accounts": ["Tuition Fees", "Late Fine"],
      "Hostel": ["Room Clearance", "Mess Dues"],
      "Academic": ["Project Submission", "Lab Equipment"],
      "Sports": ["Equipment Return", "Uniform Return"],
      "IT Department": ["ID Card Return", "System Access"],
    };
    return requirements[departmentName] || [];
  }
}

export const storage = new MemStorage();
