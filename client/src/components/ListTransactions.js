import React from 'react';
import { memo } from 'react';
import Transaction from './Transaction';

function ListTransactions(props) {
  const { transactions } = props;

  return (
    <div>
      {transactions.map((row, index) => (
        <Transaction key={row._id} {...props} row={row} index={index} />
      ))}
    </div>
  );
}

export default memo(ListTransactions);
