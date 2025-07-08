import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';

function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  let role;

  if (user) {
    role = user.role;
  }

  const handleLogout = () => {
    logout();           // clear user from context
    navigate('/login'); // logout happens immediately
  };

  // ✅ NEW: Dispatch event instead of navigating immediately
  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      const navEvent = new CustomEvent('start-navigation', { detail: path });
      window.dispatchEvent(navEvent);
    }
  };

  return (
    <div className="NavBar-container">
      <div className="NavBar-text">
        <h3 className="NavBar-title">EERIS Project</h3>
        {role === 'Employee' && (
          <>
            <h4 className="NavBar-links" style={{ cursor: 'pointer' }} onClick={() => handleNavigation('/home')}>Home</h4>
            <h4 className="NavBar-links" style={{ cursor: 'pointer' }} onClick={() => handleNavigation('/receipts')}>Submit Receipt</h4>
          </>
        )}

        {role === 'manager' && (
          <h4 className="NavBar-links" style={{ cursor: 'pointer' }} onClick={() => handleNavigation('/approveTransactions')}>
            Approve Transactions
          </h4>
        )}

        {role === 'hr' && (
          <h4 className="NavBar-links" style={{ cursor: 'pointer' }} onClick={() => handleNavigation('/hrpage')}>
            Manage Employees
          </h4>
        )}
      </div>

      {!isLoginPage && (
        <div className="NavBar-LoginBTN" onClick={handleLogout}>
          Log Out
        </div>
      )}
    </div>
  );
}

export default NavBar;
