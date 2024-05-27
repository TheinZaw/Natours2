const toggleColor = () => {
   const element = document.getElementById('container');
   const currentColor = element.style.color;
   if (currentColor === 'red') {
      element.style.color = 'green';
   } else {
      element.style.color = 'red';
   }
};
