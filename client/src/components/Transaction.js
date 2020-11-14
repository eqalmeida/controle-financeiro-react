import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Card, CardContent, Grid } from '@material-ui/core';

const currFormatter = new Intl.NumberFormat('pt-br', {
  style: 'currency',
  currency: 'BRL',
});

export default React.memo(function Transaction(props) {
  const { row, handleEdit, handleDelete, index } = props;
  const rowStyle =
    row.type === '-'
      ? { backgroundColor: '#fcc' }
      : { backgroundColor: '#cfc' };

  return (
    <Card key={row._id} style={{ ...rowStyle, marginBottom: 5 }}>
      <CardContent>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="baseline"
        >
          <Grid item xs={4}>
            {row.description}
          </Grid>
          <Grid item xs={2}>
            {row.category}
          </Grid>
          <Grid item xs={2}>
            {currFormatter.format(row.value)}
          </Grid>
          <Grid item xs={2}>
            <span style={{ fontSize: '0.8rem' }}>
              {`${row.day}`.padStart(2, '0')}/{`${row.month}`.padStart(2, '0')}/
              {row.year}
            </span>
          </Grid>
          <Grid item xs={2} style={{ textAlign: 'right' }}>
            <IconButton
              size="small"
              aria-label="edit"
              color="primary"
              onClick={() => handleEdit(index)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="delete"
              color="secondary"
              onClick={() => handleDelete(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});
