/* eslint-disable no-underscore-dangle */

'use strict';

const App = require('next/app').default;
const { createContext, createElement } = require('react');

const { Provider, Consumer } = createContext();

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

class CotypeApp extends App {
  render() {
    return createElement(
      Provider,
      { value: this.props.cotype },
      super.render(),
    );
  }
}

CotypeApp.getInitialProps = getInitialProps;
CotypeApp.Context = Consumer;

module.exports = CotypeApp;
