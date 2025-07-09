import {ReactComponent as PDF} from '../images/pdf.svg'
import {ReactComponent as ApproveFill} from '../images/approveFill.svg'
import { useState } from 'react';
import {CircleCheck} from 'lucide-react';

function Summary({ username, date, employee, amount }) {
  const [downloaded, setDownloaded] = useState(false);


  /* This function will handle dowloading a pdf of all the emp transactions.
  It will make an api call to the back end with the emp id and download a pdf.
  It creates a link tag with the pdf and automatically clicks it so the user
  doesnt have to click it. */
  const handleDownload = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/manager/generate_expense_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ empId:username }),
      });

      if (!response.ok) throw new Error('Failed to download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Automatically trigger the download without adding to the DOM
      const filename = `summary-${username}.pdf`;

      // This works in all modern browsers
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click(); // ✅ Triggers download immediately

      window.URL.revokeObjectURL(url); // cleanup
      // ✅ Update state to show ApproveFill
      setDownloaded(true);

    } catch (error) {
      console.error('Download error:', error);
    }
  };

      return (
        <div className="transaction-container">
          <div className="transData">
            <span className="date">{date}</span>
            <span className="employee">{employee}</span>
            <span className="amount">{amount}</span>
          </div>
          <div>
              {downloaded ? (
                <CircleCheck 
                className="pdfIcon"
                style={{color:"rgba(0, 214, 143, 0.55)"}}
                />
              ) : (
                <PDF onClick={handleDownload} style={{ cursor: 'pointer' }} className="pdfIcon" />
              )}
          </div>
       </div>
      );
    }
  export default Summary;
  