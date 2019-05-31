/* eslint-disable no-underscore-dangle */

'use strict';

const App = require('next/app').default;

async function getInitialProps({ ctx, ...rest }) {
  const cotype =
    global.__COTYPE_NEXT_DATA__ ||
    (global.__NEXT_DATA__ ? global.__NEXT_DATA__.props.cotype : {});

  return {
    ...(await App.getInitialProps({
      ctx: {
        ...ctx,
        cotype,
      },
      ...rest,
    })),
    cotype,
  };
}

class CotypeApp extends App {}

CotypeApp.getInitialProps = getInitialProps;

module.exports = CotypeApp;
