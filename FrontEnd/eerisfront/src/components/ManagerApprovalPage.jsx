import NavBar from './NavBar';
import Transaction from './Transaction';
import { useEffect, useState } from 'react';
import Summary from './Sumarry';
import Adjust from './Adjust';
import { useUser } from './UserContext';
import { Calendar, User, CircleDollarSign, Rows3, UserPlus, UserRoundMinus, UserRoundPen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ManagerApprovalPage() {
  const { user } = useUser();
  const [choice, setChoice] = useState("approve");
  const [transactions, setTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [adjustData, setAdjustData] = useState([]);

  // Fetch transactions
  const fetchTransactions = async () => {
    if (choice !== 'approve') return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/transactions/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();

      const pendingTransactions = data.filter(txn => txn.status === 'pending');
      setTransactions(pendingTransactions);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  // Fetch summary
  const fetchSummaryData = async () => {
    if (choice !== 'summary') return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/manager/monthly_summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 1 }) // (optional: change later)
      });

      if (!res.ok) throw new Error('Failed to fetch summary data');
      const data = await res.json();
      setSummaryData(data);
    } catch (err) {
      console.error('Error loading summary data:', err);
    }
  };

  // Fetch adjust budgets
  const fetchAdjustData = async () => {
    if (choice !== 'adjust') return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/manager/employee_budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: "test" }) // (optional: pass dynamic email later)
      });

      if (!res.ok) throw new Error('Failed to fetch adjust data');
      const data = await res.json();
      setAdjustData(data);
    } catch (err) {
      console.error('Error loading adjust data:', err);
    }
  };

  // Trigger fetching based on choice
  useEffect(() => {
    if (choice === 'approve') fetchTransactions();
    else if (choice === 'summary') fetchSummaryData();
    else if (choice === 'adjust') fetchAdjustData();
  }, [choice]);

  return (
    <div>
      <NavBar />
      <div className="ManagerAppContainer">
        <div className="ManagerApp-leftWidgetContainer">
          <div className="glassy-button approve" style={{ cursor: "pointer" }} onClick={() => setChoice("approve")}>
            <UserPlus className="leftWidgetIcons plus" />
            <span className='plusSpan'>Approve Transactions</span>
          </div>
          <div className="glassy-button summary" style={{ cursor: "pointer" }} onClick={() => setChoice("summary")}>
            <UserRoundMinus className="leftWidgetIcons minus" />
            <span className='minusSpan'>View Summary</span>
          </div>
          <div className="glassy-button adjust" style={{ cursor: "pointer" }} onClick={() => setChoice("adjust")}>
            <UserRoundPen className="leftWidgetIcons penicl" />
            <span className='pencilSpan'>Adjust Budgets</span>
          </div>
        </div>

        <div className="ManagerApp-rightWidgetContainer">
          {choice === 'approve' && <h1>Transactions</h1>}
          {choice === 'summary' && <h1>Monthly Summary</h1>}
          {choice === 'adjust' && <h1>Employee Budgets</h1>}

          <div className="innerContainer">
            <div className="header">
              <span className='text'>
                {choice !== 'adjust' ? (<><Calendar className="thIcons" />Date</>) : (<><User className="thIcons" />Employee</>)}
              </span>
              {choice !== 'adjust' && <span className='text'><><User className="thIcons" />Employee</></span>}
              <span className={choice !== 'adjust' ? 'text' : 'budgetText'}>
                {choice !== 'adjust' ? (<><CircleDollarSign className="thIcons" />Amount</>) : (<><CircleDollarSign className="thIcons" />Budget</>)}
              </span>
            </div>

            <AnimatePresence>
              <motion.div
                className="body"
                key={choice}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  top: 54,
                  left: -1,
                }}
              >
                {choice === 'approve' ? (
                  transactions.map((trans, index) => (
                    <Transaction
                      key={trans._id || index}
                      transId={trans.receipt_id}
                      date={trans.date}
                      employee={trans.employee}
                      amount={trans.amount}
                      refreshTransactions={fetchTransactions} // 🆕 refresh after decision
                    />
                  ))
                ) : choice === 'summary' ? (
                  summaryData.map((empData, index) => (
                    <Summary
                      key={index}
                      username={empData.empId}
                      date={empData.date}
                      employee={empData.employee}
                      amount={empData.amount}
                    />
                  ))
                ) : (
                  adjustData.map((empData, index) => (
                    <Adjust
                      key={index}
                      empId={empData.email}
                      employee={empData.employee}
                      amount={empData.budget}
                      refreshAdjustData={fetchAdjustData} // 🆕 refresh after adjust
                    />
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerApprovalPage;
