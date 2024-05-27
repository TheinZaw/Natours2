/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
   try {
      const url =
         type === 'password'
            ? 'http://localhost:3000/api/v1/users/updatePassword'
            : 'http://localhost:3000/api/v1/users/updateMe';

      const res = axios({
         method: 'PATCH',
         url,
         data,
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      })
         .then(function (res) {
            if (res.data.status === 'success') {
               showAlert(
                  'success',
                  `${type.toUpperCase()} updated successfully!`,
               );
               const photo = `/img/users/${res.data.data.user.photo}`;
               console.log(photo);
               const el = document.querySelector('.nav--user a span');
               el.innerText = res.data.data.user.name;
               const el1 = document.querySelector('.nav__user-img');
               //el1.setAttribute('src', photo);
               el1.setAttribute('alt', res.data.data.user.name);
               el1.src = photo;

               console.log(res.config.data);

               //el.innerText=res.data.local
            }
         })
         .catch(function (er) {
            showAlert('error', er.response.data.message);
         });
   } catch (err) {
      showAlert('error', err.response.data.message);
   }
};
