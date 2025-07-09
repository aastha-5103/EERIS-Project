import { useState } from 'react';

function ModifyEmployee({ firstName, lastName, email, budget, username, role }) {

      return (
          <div className="transDataHR">
            <span className="date">{username}</span>
            <span className="employee">{firstName + ' ' + lastName[0] + '.'}</span>
            <span className="amount">{role}</span>
          </div>
      );
    }
  export default ModifyEmployee;
  