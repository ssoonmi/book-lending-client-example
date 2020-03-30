import React from 'react';
import { NavLink } from 'react-router-dom';

export default () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink exact to="/">
            Books
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/authors">
            Authors
          </NavLink>
        </li>
      </ul>
    </nav>
  )
};