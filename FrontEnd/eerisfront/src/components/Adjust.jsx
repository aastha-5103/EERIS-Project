import { Pencil } from 'lucide-react';
import { useState } from 'react';

function Adjust({ empId, employee, amount }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newAmount, setNewAmount] = useState(amount);
  const [displayAmount, setDisplayAmount] = useState(amount); // ✅ amount to show

  // const handleSubmit = async () => {
  //   console.log("🎯 Submitting new budget for:", empId);    //----------------------------------------
  //   if (!newAmount) return;

  //   try {
  //     const res = await fetch('http://localhost:8000/api/manager/adjust_budget', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         empId,
  //         amount: newAmount,
  //       }),
  //     });

  //     const json = await res.json();   //-----------------------------------------
  //     console.log("💬 Server response:", json);    //----------------------------------------
  //     if (!res.ok) throw new Error('Failed to update amount');

  //     // ✅ Update the displayed amount
  //     setDisplayAmount(newAmount);
  //     setIsEditing(false);
  //     console.log(`Updated amount for ${employee} to ${newAmount}`);

  //   } catch (error) {
  //     console.error('Error updating amount:', error);
  //   }
  // };
  
  const handleSubmit = async () => {
    console.log("🎯 Budget submit triggered with:", empId, newAmount);
    
    const numericAmount = parseFloat(newAmount);

    if (!numericAmount) {
      console.warn("⚠️ No amount entered.");
      return;
    }
    
    if (numericAmount < 0) {
      alert("🚫 Budget amount cannot be negative.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/manager/adjust-budget", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: empId, 
          amount: numericAmount,
        }),
      });
  
      console.log("📡 PATCH sent to /api/manager/adjust-budget");
  
      const result = await res.json();
      console.log("💬 Response:", result);
  
      if (!res.ok) throw new Error("Failed to update amount");
  
      setDisplayAmount(numericAmount);
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Error submitting budget:", err);
    }
  };
  

  return (
    <div className="transaction-container">
      <div className="transData">
        <span className="employee">{employee}</span>
        {isEditing ? (
          <input
            type="number"
            min="0"
            className="amountInput"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
          />
        ) : (
          <span className="amount">{`$${displayAmount}`}</span>
        )}
      </div>
      <div>
        {isEditing ? (
          <button className="glassy-button adjustAmntBTN" onClick={handleSubmit}>Submit</button>
        ) : (
          <Pencil className="pencilIcon" onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }} />
        )}
      </div>
    </div>
  );
  }
  
  export default Adjust;
  