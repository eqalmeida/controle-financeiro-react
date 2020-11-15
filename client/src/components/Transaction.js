import React from 'react';
import { Card, CardContent, Grid } from '@material-ui/core';

const currFormatter = new Intl.NumberFormat('pt-br', {
  style: 'currency',
  currency: 'BRL',
});

export default React.memo(function Transaction(props) {
  const { row, handleEdit, index } = props;
  const rowStyle =
    row.type === '-'
      ? { backgroundColor: '#fcc' }
      : { backgroundColor: '#cfc' };

  return (
    <Card
      key={row._id}
      style={{ ...rowStyle, marginBottom: 5, cursor: 'pointer' }}
      onClick={() => handleEdit(index)}
    >
      <CardContent>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="baseline"
        >
          <Grid item sm={5} xs={9}>
            {row.description}
          </Grid>
          <Grid item sm={2} xs={3} style={{ textAlign: 'right' }}>
            {row.category}
          </Grid>
          <Grid item sm={3} xs={4} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.0rem', fontWeight: 'bold' }}>
              {currFormatter.format(row.value)}
            </span>
          </Grid>
          <Grid item sm={2} xs={4} style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem' }}>
              {`${row.day}`.padStart(2, '0')}/{`${row.month}`.padStart(2, '0')}/
              {row.year}
            </span>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});
