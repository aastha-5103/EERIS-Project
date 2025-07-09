import React, { useState } from 'react';
import NavBar from './NavBar';
import { useUser } from './UserContext';
import { ImageUp } from 'lucide-react';
import {ReactComponent as LoadAnimation} from '../images/infinite.svg';

const ReceiptPage = () => {
  const { user } = useUser();

  const [receiptData, setReceiptData] = useState({
    date: '',
    business: '',
    category: '',
    subcategory: '',
    amount: '',
  });

  const [base64Image, setBase64Image] = useState(''); // 🆕 base64 image

  const [isLoading, setIsLoading] = useState(false);

  // 🛠 Handle file upload + OCR + read base64
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.email) {
      alert("Please log in before uploading a receipt.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.email);

    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/receipts/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to parse receipt image');
      };

      const { parsed } = await res.json();

      setReceiptData(prev => ({
        ...prev,
        business: parsed.business || '',
        date: parsed.date || '',
        amount: parsed.amount || ''
      }));

      // 🆕 Read file as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result.split(',')[1]); // Remove the data:image/jpeg;base64 part
      };
      reader.readAsDataURL(file);

      setIsLoading(false);
      alert('Receipt image parsed! Please confirm details and choose a category.');
    } catch (error) {
      setIsLoading(false);
      console.error('Error parsing image:', error);
      alert(`Failed to parse receipt: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    setReceiptData({
      ...receiptData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.email) {
      alert("Please log in before submitting a receipt.");
      return;
    }

    const dataToSend = {
      ...receiptData,
      userId: user.email,
      image_base64: base64Image, // 🆕 Include base64 image
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/receipts/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Failed to submit receipt' }));
        console.error('Backend error:', errorData);
        throw new Error(errorData.detail || 'Failed to submit receipt');
      }

      const result = await res.json();
      console.log('Transaction submitted:', result);
      alert('Receipt submitted successfully!');

      // Reset form after submit
      setReceiptData({ date: '', business: '', category: '', subcategory: '', amount: '' });
      setBase64Image('');
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Submission failed: ${error.message}`);
    }
  };

  return (
    <>
      <NavBar />
      <div className="receipt-page">
        {/* Upload Box */}
        <div className="upload-box">
          <div className="upload-icon"><ImageUp size={64} /></div>
          <h3 style={{ fontWeight: "300", fontSize: "1.3em", margin: "0", marginTop: "1em" }}>
            Upload Receipt Image Here
          </h3>
          <p style={{ fontWeight: "200", width: "88%", fontSize: "0.9em", margin: "0", marginBottom: "2em" }}>
            We will parse some info automatically. Any remaining info will need to be filled manually.
          </p>
          { isLoading ? <div className='animContainer'><LoadAnimation className="anim"/> Overthinking...</div>: 
            <label className="file-upload">
            Upload Receipt
            <input
              type="file"
              className="file-input"
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>}
        </div>
        {/* Receipt Form */}
        <form className="receipt-form" onSubmit={handleSubmit}>
          <h2>Receipt Information</h2>

          <input
            type="text"
            name="date"
            value={receiptData.date}
            onChange={handleChange}
            placeholder="Date"
            required
            className="receiptInput"
          />

          <input
            type="text"
            name="business"
            value={receiptData.business}
            onChange={handleChange}
            required
            placeholder="Business"
            className="receiptInput"
          />

          <select
            name="category"
            value={receiptData.category}
            onChange={handleChange}
            required
            className="category"
          >
            <option value="" disabled selected>Category</option>
            <option value="Food">Food</option>
            <option value="Merchandise">Merchandise</option>
            <option value="Supplies">Supplies</option>
            <option value="Software">Software</option>
            <option value="Bills">Bills</option>
          </select>

          <input
            type="text"
            name="subcategory"
            value={receiptData.subcategory}
            onChange={handleChange}
            required
            placeholder="Subcategory"
            className="receiptInput"
          />

          <input
            type="number"
            name="amount"
            value={receiptData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            placeholder="Amount"
            className="receiptInput"
          />

          <button type="submit" className="submit-button">
            Submit Transaction
          </button>
        </form>
      </div>
    </>
  );
};

export default ReceiptPage;
