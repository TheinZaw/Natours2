import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

const logoutUser = document.querySelector('.nav__el--logout');
const loginForm = document.getElementById('my-form');
const updForm = document.getElementById('updateUserForm');
const pwdForm = document.querySelector('.form-user-password');

const bookBtn = document.getElementById('book-tour');

if (loginForm) {
   //console.log('Login Form');
   loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
   });
}

if (updForm) {
   updForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData();
      form.append('email', document.getElementById('email').value);
      form.append('name', document.getElementById('name').value);
      form.append('photo', document.getElementById('photo').files[0]);
      //console.log(form);
      //const email = document.getElementById('email').value;
      //const name = document.getElementById('name').value;
      //{ name, email }
      updateSettings(form, 'user');
   });
}

if (pwdForm) {
   pwdForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const curPassword = document.getElementById('password-current').value;
      const pwd = document.getElementById('password').value;
      const confPwd = document.getElementById('password-confirm').value;
      console.log(curPassword, pwd, confPwd);
      const data = {
         password: curPassword,
         newPassword: pwd,
         conformPassword: confPwd,
      };
      updateSettings(data, 'password');
   });
}
if (logoutUser) {
   logoutUser.addEventListener('click', () => logout());
}
const mapObj = document.getElementById('map');
if (mapObj) {
   const locations = JSON.parse(mapObj.dataset.locations);
   //console.log(locations);
   displayMap(locations);
}

if (bookBtn) {
   bookBtn.addEventListener('click', (e) => {
      e.target.textContent = 'Processing....';
      const { tourId } = e.target.dataset;
      console.log(bookTour(tourId));
   });
}
