export default {
  experimental: {
    // Leaves static Server Component markup out of the Flight payload inlined
    // into the HTML. Needs a React build with enableFlightHTMLFirst.
    htmlFirstFlight: true,
  },
};
