import React from 'react';
import useFetchOrderData from './useFetchOrderData';

const Get = () => {
  const { data, error, mdOrder } = useFetchOrderData();
const depositAmount = data ? data.Amount : null;
  return (
    <div>
      {error ? <p>{error}</p> : <p>Amount: {depositAmount !== null ? depositAmount : 'No amount found'}</p>}
    </div>
  );
};

export default Get;
