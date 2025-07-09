import { Trash } from 'lucide-react';
import { useState } from 'react';

function Employee({ username, employee, role }) {
    const [isDeleted, setIsDeleted] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete employee ${employee}?`);
    
        if (confirmed) {
          try {
            const res = await fetch('http://127.0.0.1:8000/api/hr/delete_employee', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username }),
            });
    
            if (!res.ok) throw new Error('Failed to delete employee');

    
            // ✅ Hide component on success
            setIsDeleted(true);
            console.log(`Employee ${employee} deleted`);
    
          } catch (error) {
            console.error('Error deleting employee:', error);
          }
        }
      };

    //Conditionally render based on deletion state
      if (isDeleted) return null;


      return (
        <div className="transaction-container">
          <div className="transData">
            <span className="date">{username}</span>
            <span className="employee">{employee}</span>
            <span className="amount">{role}</span>
          </div>
          <div>
                <Trash className="trashIcon" onClick={handleDelete} style={{ cursor: 'pointer' }}/>
          </div>
       </div>
      );
    }
  export default Employee;
  