import { useState } from 'react';
import { CircleCheck, CircleSlash } from 'lucide-react';

function Transaction({ transId, date, employee, amount, refreshTransactions }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const handleRowClick = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/receipts/${transId}`);
      if (!res.ok) throw new Error('Failed to fetch receipt');
      const data = await res.json();
      setSelectedReceipt(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      alert('Failed to load receipt');
    }
  };

  const handleDecision = async (decision) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/transactions/${transId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision === 'approve' ? 'approved' : 'rejected' }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      console.log(`Transaction ${transId} ${decision}ed:`, data);

      await refreshTransactions();
    } catch (error) {
      console.error('Error sending decision:', error);
    }
  };

  return (
    <>
      {/* This is your normal transaction row */}
      <div className="transaction-container" onClick={handleRowClick} style={{ cursor: 'pointer' }}>
        <div className="transData">
          <span className="date">{date}</span>
          <span className="employee">{employee}</span>
          <span className="amount">{amount}</span>
        </div>

        <div className="transIcons">
          <CircleCheck
            className="actualIcons"
            onClick={(e) => { e.stopPropagation(); handleDecision('approve'); }}
            style={{ cursor: 'pointer', color: "rgba(0, 214, 143, 0.55)" }}
          />
          <CircleSlash
            className="actualIcons"
            onClick={(e) => { e.stopPropagation(); handleDecision('rejected'); }}
            style={{ cursor: 'pointer', color: "rgba(255, 76, 91, 0.65)" }}
          />
        </div>
      </div>

      {/* Modal to show receipt only */}
      {showModal && selectedReceipt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Receipt Image</h2>
            {selectedReceipt.image_base64 ? (
              <img
                src={`data:image/jpeg;base64,${selectedReceipt.image_base64}`}
                alt="Receipt"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            ) : (
              <p>No receipt image available.</p>
            )}
            <button className="submit-button" onClick={() => setShowModal(false)} style={{ marginTop: '1em' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Transaction;
