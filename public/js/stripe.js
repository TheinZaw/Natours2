/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
export const bookTour = async (tourId) => {
   try {
      var stripe = Stripe(
         'pk_test_51PKHT1P39QBpr3kttoU2KfmOpYfSZHsRmuTyonDY1SGUzkPQpfLgSw48BXKGv5zBKdgjPPCTAk1YLxb2fcDMCaV800DiWGrHCS',
      );
      //get checkout session from api
      const session = await axios({
         method: 'GET',
         url: `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
      });
      console.log(session);
      await stripe.redirectToCheckout({
         sessionId: session.data.session.id,
      });
   } catch (err) {
      console.log(err);
      showAlert('Error', err);
   }

   //create checkout form + charge credit card
};
