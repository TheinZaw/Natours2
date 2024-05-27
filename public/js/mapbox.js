/* eslint-disable */

export const displayMap = (locations) => {
   mapboxgl.accessToken =
      'pk.eyJ1IjoidGhlaW56YXcwOTAyIiwiYSI6ImNsdzhwMnVxOTBhcGoyeHJ5ZDUyOXJhc2QifQ.hR3GZxnVQDB7vLaNzWp4Rw';

   var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9', //'mapbox://styles/theinzaw0902/clwd8rk1g000p01qwbefj3tfn',
      // center: [-118.113491, 34.111745],
      scrollZoom: false,
      //zoom: 4.5,
      // interactive: false
   });
   const bounds = new mapboxgl.LngLatBounds();
   locations.forEach((loc) => {
      // Create marker
      const el = document.createElement('div');
      el.className = 'marker';

      // Add marker
      new mapboxgl.Marker({
         element: el,
         anchor: 'bottom',
      })
         .setLngLat(loc.coordinates)
         .addTo(map);

      // Add popup
      new mapboxgl.Popup({
         offset: 30,
      })
         .setLngLat(loc.coordinates)
         .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
         .addTo(map);

      // Extend map bounds to include current location
      bounds.extend(loc.coordinates);
   });
   map.fitBounds(bounds, {
      padding: {
         top: 200,
         bottom: 150,
         left: 100,
         right: 100,
      },
   });
};
