import { Card, CardContent, Grid } from '@material-ui/core';
import React from 'react';

const currFormatter = new Intl.NumberFormat('pt-br', {
  style: 'currency',
  currency: 'BRL',
});

export default function ResumoLancamentos(props) {
  const { transactions } = props;
  const receitas = transactions
    .filter((t) => t.type === '+')
    .map((t) => t.value)
    .reduce((acc, curr) => acc + curr, 0);

  const despesas = transactions
    .filter((t) => t.type === '-')
    .map((t) => t.value)
    .reduce((acc, curr) => acc + curr, 0);

  return (
    <Card style={{ marginBottom: 10 }}>
      <CardContent>
        <Grid container>
          <Grid item xs={12} sm={3}>
            <strong>Lançamentos: </strong>
            {transactions.length}
          </Grid>
          <Grid item xs={12} sm={3}>
            <strong>Receitas: </strong>
            <span>{currFormatter.format(receitas)}</span>
          </Grid>
          <Grid item xs={12} sm={3}>
            <strong>Despesas: </strong>
            <span>-{currFormatter.format(despesas)}</span>
          </Grid>
          <Grid item xs={12} sm={3}>
            <strong>Saldo: </strong>
            {currFormatter.format(receitas - despesas)}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
