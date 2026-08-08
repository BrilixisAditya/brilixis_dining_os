import { useState } from "react";
import { StaffUser } from "../types/types";



const DEFAULT_STAFF_USERS: StaffUser[] = [
      { id: 'stf-01', name: 'Devi Patel', role: 'Executive Steward', rating: 4.93, status: 'active', efficiency: 98, code: 'PIN 2024', phone: '+91 9876543210' },
      { id: 'stf-02', name: 'Alex Thorne', role: 'Senior Table Steward', rating: 4.88, status: 'active', efficiency: 95, code: 'PIN 3030', phone: '+91 9876543211' },
      { id: 'stf-03', name: 'Yuki Sato', role: 'Dine Floor Steward', rating: 4.85, status: 'break', efficiency: 92, code: 'PIN 4040', phone: '+91 9876543212' },
      { id: 'stf-04', name: 'Elena Rostova', role: 'Hostess Steward', rating: 4.96, status: 'active', efficiency: 99, code: 'PIN 5050', phone: '+91 9876543213' },
      { id: 'stf-05', name: 'James Sinclair', role: 'Tableside Steward', rating: 4.79, status: 'active', efficiency: 89, code: 'PIN 6060', phone: '+91 9876543214' },
      { id: 'stf-06', name: 'Rajeev Kapoor', role: 'Executive Chef', rating: 4.91, status: 'active', efficiency: 97, code: 'PIN 7070', phone: '+91 9876543215' }
    ];


function useStaff(){
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>(DEFAULT_STAFF_USERS);
    const [isStaffLoading, setIsStaffLoading] = useState<boolean>(false);

      const addStaffUser = (newUser: StaffUser) => {
         // TODO: CALL API
      };
    
      const updateStaffUser = (userId: string, updatedFields: Partial<StaffUser>) => {
         // TODO: CALL API
      };
    
      const deleteStaffUser = (userId: string) => {
         // TODO: CALL API
      };

      return {staffUsers, isStaffLoading, addStaffUser, updateStaffUser, deleteStaffUser};
};

export default useStaff;