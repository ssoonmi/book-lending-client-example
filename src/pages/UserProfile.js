import React from 'react';
import NavBar from '../components/navbar/NavBar.js';
import UserDetails from '../components/users/UserDetails.js';
import LogOutButton from '../components/users/LogOutButton.js';

export default () => {
  return (
    <>
      <NavBar />
      <UserDetails />
      <LogOutButton />
    </>
  )
}