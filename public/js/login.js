//import { login } from '../../controllers/authController';
import axios from 'axios';
import { showAlert } from './alerts';
// const { default: axios } = require('axios');

export const login = async (email, password) => {
   axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
         email,
         password,
      },
   })
      .then(function (response) {
         if (response.data.status === 'success') {
            console.log('login success' + localStorage.getItem('user'));
            showAlert('success', `login success`);
            // localStorage.getItem('user')
            window.setInterval(() => {
               window.location = '/';
            }, 1000);
         }
      })
      .catch(function (error) {
         showAlert('error', error.response.data.message);
      });
};

export const logout = () => {
   axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
   })
      .then(function (response) {
         if (response.data.status === 'success') {
            // console.log('login success');
            showAlert('success', `logout success`);
            window.setInterval(() => {
               window.location = '/';
            }, 1000);
         }
      })
      .catch(function (error) {
         showAlert('error', error.response.data.message);
      });
};
