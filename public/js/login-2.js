//import { login } from '../../controllers/authController';
import axios from 'axios';

// const { default: axios } = require('axios');

const login = async (email, password) => {
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
            // console.log('login success');
            console.log(localStorage.getItem('user'));
            window.setInterval(() => {
               window.location = '/';
            }, 1000);
         }
      })
      .catch(function (error) {
         console.log(error.response.data);
      });
};

// document.querySelector('#login-submit').addEventListener('click', function () {
//    // const { data } = await axios.post('/user', document.querySelector('#my-form'), {
//    //    headers: {
//    //       'Content-Type': 'application/json',
//    //    }});

//    console.log('login-submit');
// });

document.querySelector('form').addEventListener('submit', (e) => {
   e.preventDefault();
   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;
   login(email, password);
});
