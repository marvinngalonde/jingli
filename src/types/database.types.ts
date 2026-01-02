export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'admin' | 'teacher' | 'staff' | 'parent' | 'student'
                    full_name: string
                    email: string
                    phone: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    role: 'admin' | 'teacher' | 'staff' | 'parent' | 'student'
                    full_name: string
                    email: string
                    phone?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    role?: 'admin' | 'teacher' | 'staff' | 'parent' | 'student'
                    full_name?: string
                    email?: string
                    phone?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            students: {
                Row: {
                    id: string
                    student_id: string
                    first_name: string
                    last_name: string
                    date_of_birth: string
                    gender: 'male' | 'female' | 'other'
                    class_id: string | null
                    parent_id: string | null
                    address: string | null
                    contact_number: string | null
                    email: string | null
                    status: 'active' | 'inactive' | 'graduated'
                    admission_date: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    first_name: string
                    last_name: string
                    date_of_birth: string
                    gender: 'male' | 'female' | 'other'
                    class_id?: string | null
                    parent_id?: string | null
                    address?: string | null
                    contact_number?: string | null
                    email?: string | null
                    status?: 'active' | 'inactive' | 'graduated'
                    admission_date: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    first_name?: string
                    last_name?: string
                    date_of_birth?: string
                    gender?: 'male' | 'female' | 'other'
                    class_id?: string | null
                    parent_id?: string | null
                    address?: string | null
                    contact_number?: string | null
                    email?: string | null
                    status?: 'active' | 'inactive' | 'graduated'
                    admission_date?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            classes: {
                Row: {
                    id: string
                    name: string
                    grade_level: number
                    section: string
                    class_teacher_id: string | null
                    academic_year: string
                    capacity: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    grade_level: number
                    section: string
                    class_teacher_id?: string | null
                    academic_year: string
                    capacity: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    grade_level?: number
                    section?: string
                    class_teacher_id?: string | null
                    academic_year?: string
                    capacity?: number
                    created_at?: string
                }
            }
            staff: {
                Row: {
                    id: string
                    employee_id: string
                    profile_id: string
                    role: 'teacher' | 'senior_teacher' | 'admin_officer' | 'support_staff'
                    department: string | null
                    qualification: string | null
                    joining_date: string
                    basic_salary: number
                    status: 'active' | 'on_leave' | 'terminated'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    employee_id: string
                    profile_id: string
                    role: 'teacher' | 'senior_teacher' | 'admin_officer' | 'support_staff'
                    department?: string | null
                    qualification?: string | null
                    joining_date: string
                    basic_salary: number
                    status?: 'active' | 'on_leave' | 'terminated'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    employee_id?: string
                    profile_id?: string
                    role?: 'teacher' | 'senior_teacher' | 'admin_officer' | 'support_staff'
                    department?: string | null
                    qualification?: string | null
                    joining_date?: string
                    basic_salary?: number
                    status?: 'active' | 'on_leave' | 'terminated'
                    created_at?: string
                    updated_at?: string
                }
            }
            attendance: {
                Row: {
                    id: string
                    student_id: string
                    date: string
                    status: 'present' | 'absent' | 'late' | 'excused'
                    marked_by: string | null
                    remarks: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    date: string
                    status: 'present' | 'absent' | 'late' | 'excused'
                    marked_by?: string | null
                    remarks?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    date?: string
                    status?: 'present' | 'absent' | 'late' | 'excused'
                    marked_by?: string | null
                    remarks?: string | null
                    created_at?: string
                }
            }
            finance_transactions: {
                Row: {
                    id: string
                    student_id: string
                    transaction_type: 'fee_payment' | 'fine' | 'refund'
                    fee_type: 'tuition' | 'transport' | 'library' | 'exam' | 'other'
                    amount: number
                    payment_mode: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'online'
                    payment_date: string
                    reference_number: string | null
                    status: 'pending' | 'completed' | 'failed'
                    remarks: string | null
                    created_by: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    transaction_type: 'fee_payment' | 'fine' | 'refund'
                    fee_type: 'tuition' | 'transport' | 'library' | 'exam' | 'other'
                    amount: number
                    payment_mode: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'online'
                    payment_date: string
                    reference_number?: string | null
                    status?: 'pending' | 'completed' | 'failed'
                    remarks?: string | null
                    created_by: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    transaction_type?: 'fee_payment' | 'fine' | 'refund'
                    fee_type?: 'tuition' | 'transport' | 'library' | 'exam' | 'other'
                    amount?: number
                    payment_mode?: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'online'
                    payment_date?: string
                    reference_number?: string | null
                    status?: 'pending' | 'completed' | 'failed'
                    remarks?: string | null
                    created_by?: string
                    created_at?: string
                }
            }
            library_books: {
                Row: {
                    id: string
                    accession_number: string
                    title: string
                    author: string
                    isbn: string | null
                    category: string
                    publisher: string | null
                    shelf_number: string
                    status: 'available' | 'issued' | 'lost' | 'damaged'
                    cover_image_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    accession_number: string
                    title: string
                    author: string
                    isbn?: string | null
                    category: string
                    publisher?: string | null
                    shelf_number: string
                    status?: 'available' | 'issued' | 'lost' | 'damaged'
                    cover_image_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    accession_number?: string
                    title?: string
                    author?: string
                    isbn?: string | null
                    category?: string
                    publisher?: string | null
                    shelf_number?: string
                    status?: 'available' | 'issued' | 'lost' | 'damaged'
                    cover_image_url?: string | null
                    created_at?: string
                }
            }
            transport_routes: {
                Row: {
                    id: string
                    route_id: string
                    route_name: string
                    driver_id: string | null
                    vehicle_number: string
                    capacity: number
                    stops: Json
                    start_time: string
                    end_time: string
                    status: 'active' | 'inactive'
                    created_at: string
                }
                Insert: {
                    id?: string
                    route_id: string
                    route_name: string
                    driver_id?: string | null
                    vehicle_number: string
                    capacity: number
                    stops: Json
                    start_time: string
                    end_time: string
                    status?: 'active' | 'inactive'
                    created_at?: string
                }
                Update: {
                    id?: string
                    route_id?: string
                    route_name?: string
                    driver_id?: string | null
                    vehicle_number?: string
                    capacity?: number
                    stops?: Json
                    start_time?: string
                    end_time?: string
                    status?: 'active' | 'inactive'
                    created_at?: string
                }
            }
            facilities: {
                Row: {
                    id: string
                    name: string
                    type: 'classroom' | 'lab' | 'auditorium' | 'sports_ground' | 'other'
                    capacity: number
                    status: 'available' | 'occupied' | 'maintenance'
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type: 'classroom' | 'lab' | 'auditorium' | 'sports_ground' | 'other'
                    capacity: number
                    status?: 'available' | 'occupied' | 'maintenance'
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: 'classroom' | 'lab' | 'auditorium' | 'sports_ground' | 'other'
                    capacity?: number
                    status?: 'available' | 'occupied' | 'maintenance'
                    created_at?: string
                }
            }
            visitor_logs: {
                Row: {
                    id: string
                    visitor_name: string
                    purpose: string
                    person_to_meet: string
                    contact_number: string
                    check_in_time: string
                    check_out_time: string | null
                    id_proof_type: string
                    id_proof_number: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    visitor_name: string
                    purpose: string
                    person_to_meet: string
                    contact_number: string
                    check_in_time?: string
                    check_out_time?: string | null
                    id_proof_type: string
                    id_proof_number: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    visitor_name?: string
                    purpose?: string
                    person_to_meet?: string
                    contact_number?: string
                    check_in_time?: string
                    check_out_time?: string | null
                    id_proof_type?: string
                    id_proof_number?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
