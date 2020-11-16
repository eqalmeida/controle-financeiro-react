import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  makeStyles,
  Card,
  CardContent,
  Grid,
  IconButton,
  DialogContent,
  Radio,
  Snackbar,
  Backdrop,
  CircularProgress,
} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import ArrowRight from '@material-ui/icons/ArrowRight';
import Delete from '@material-ui/icons/Delete';

import useDebounce from './shared/useDebounce';
import axios from 'axios';
import ListTransactions from './components/ListTransactions';
import ResumoLancamentos from './components/ResumoLancamentos';
import PeriodFilter from './components/PeriodFilter';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

function dateStr(transaction) {
  if (!transaction.year) return '';
  return (
    transaction.year.toString().padStart(4, '0') +
    '-' +
    transaction.month.toString().padStart(2, '0') +
    '-' +
    transaction.day.toString().padStart(2, '0')
  );
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState({});
  const [month, setMonth] = useState(new Date().getMonth());
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const classes = useStyles();

  const debouncedFilter = useDebounce(filter, 500);

  useEffect(() => {
    //if (!isLoading) {
    loadTransactions(month, year);
    //}
  }, [month, year]);

  const filteredItems = useMemo(() => {
    if (debouncedFilter && debouncedFilter.length > 0) {
      const f = debouncedFilter.toLowerCase();
      const items = transactions.filter((t) =>
        t.description.toLowerCase().includes(f)
      );
      return items;
    }
    return transactions;
  }, [debouncedFilter, transactions]);

  const loadTransactions = async (m, y) => {
    setIsLoading(true);
    try {
      let data = {};
      const monthStr = `${m + 1}`.padStart(2, '0');
      const yearStr = `${y}`.padStart(4, '0');
      const yearMonth = `${yearStr}-${monthStr}`;

      const resp = await axios.get(`/api/transaction/?period=${yearMonth}`);
      data = resp.data;
      setTransactions(data.transactions);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleDateInc = () => {
    if (month < 11) {
      setMonth(month + 1);
    } else if (year < 2021) {
      setMonth(0);
      setYear(year + 1);
    }
  };

  const handleDateDec = () => {
    if (month > 0) {
      setMonth(month - 1);
    } else if (year > 2019) {
      setMonth(11);
      setYear(year - 1);
    }
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleFilterChange = (event) => {
    const value = event.target.value;
    setFilter(value);
  };

  const handleEdit = (idx) => {
    setError(null);
    setSelected({ ...filteredItems[idx] });
    setShowForm(true);
  };

  const handleNew = () => {
    setError(null);
    setSelected({
      dercription: '',
      category: '',
      type: '',
      value: null,
      day: 1,
      month: month + 1,
      year: year,
    });
    setShowForm(true);
  };

  const handleDelete = (idx) => {
    setSelected({ ...filteredItems[idx] });
    setOpenDeleteConfirmation(true);
  };

  const handleDeleteSelected = async () => {
    setOpenDeleteConfirmation(false);
    setShowForm(false);
    setIsLoading(true);
    try {
      const resp = await axios.delete(`/api/transaction/${selected._id}`);
      const data = resp.data;
      setTransactions([...transactions.filter((t) => t._id !== data._id)]);
      //setSelected({});
    } catch (error) {
      setShowForm(true);
      if (error.response) {
        // Request made and server responded
        console.log(error.response.data);
        //console.log(error.response.status);
        //console.log(error.response.headers);
        if (error.response.data.error) {
          setError(error.response.data.error);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
    }
    setIsLoading(false);
  };

  const handleDescrChange = ({ target }) => {
    const obj = { ...selected };
    obj.description = target.value;
    setSelected(obj);
  };

  const handleCategoryChange = ({ target }) => {
    const obj = { ...selected };
    obj.category = target.value;
    setSelected(obj);
  };

  const handleTypeChange = ({ target }) => {
    const obj = { ...selected };
    obj.type = target.value;
    setSelected(obj);
  };

  const handleValueChange = ({ target }) => {
    const obj = { ...selected };
    obj.value = parseFloat(target.value);
    setSelected(obj);
  };

  const handleDateChange = ({ target }) => {
    const obj = { ...selected };
    const date = new Date(target.value);
    obj.year = date.getUTCFullYear();
    obj.month = date.getUTCMonth() + 1;
    obj.day = date.getUTCDate();
    setSelected(obj);
  };

  const handleFormSubmit = (form) => {
    form.preventDefault();
    handleFormSave();
  };

  const handleFormSave = async () => {
    setError(null);
    setShowForm(false);
    setIsLoading(true);
    try {
      if (selected._id) {
        // Editando
        const resp = await axios.put(
          `/api/transaction/${selected._id}`,
          selected
        );
        const data = resp.data;

        const index = transactions.findIndex((x) => x._id === selected._id);
        if (index >= 0) {
          const newData = [...transactions];
          newData[index] = data;
          setTransactions(newData);
        }
      } else {
        // Novo
        const resp = await axios.post(`/api/transaction/`, selected);
        const data = resp.data;
        if (
          parseInt(data.year) === year &&
          parseInt(data.month) === month + 1
        ) {
          const newData = [data, ...transactions];
          setTransactions(newData);
        }
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setShowForm(true);
      if (error.response) {
        // Request made and server responded
        console.log(error.response.data);
        //console.log(error.response.status);
        //console.log(error.response.headers);
        if (error.response.data.error) {
          setError(error.response.data.error);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box my={4} style={{ textAlign: 'center' }}>
        <h1>Controle financeiro Pessoal</h1>
        <h3>Bootcamp Fullstack - Desafio final</h3>
      </Box>
      <Card style={{ marginBottom: 10 }}>
        <CardContent>
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={0}
          >
            <Grid item>
              <IconButton
                variant="contained"
                aria-label="delete"
                color="secondary"
                onClick={handleDateDec}
              >
                <ArrowLeft />
              </IconButton>
            </Grid>
            <Grid item>
              <PeriodFilter
                month={month}
                year={year}
                handleMonthChange={handleMonthChange}
                handleYearChange={handleYearChange}
              />
            </Grid>
            <Grid item>
              <IconButton
                variant="contained"
                aria-label="delete"
                color="secondary"
                onClick={handleDateInc}
              >
                <ArrowRight />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <ResumoLancamentos transactions={filteredItems} />

      <Box style={{ marginLeft: 15, marginRight: 15 }}>
        <FormControl fullWidth>
          <TextField
            id="filter-input"
            label="Filtro"
            fullWidth
            value={filter}
            onChange={handleFilterChange}
          />
        </FormControl>
      </Box>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="baseline"
        style={{
          paddingRight: 15,
          marginRight: 15,
          marginLeft: 12,
          marginTop: 20,
          marginBottom: 0,
        }}
      >
        <Grid item xs={6}>
          <h4>Lançamentos</h4>
        </Grid>
        <Grid
          item
          xs={6}
          style={{ textAlign: 'right', verticalAlign: 'bottom' }}
        >
          <Button onClick={handleNew} variant="contained" color="primary">
            + Adicionar
          </Button>
        </Grid>
      </Grid>

      <Box my="4">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ListTransactions
            transactions={filteredItems}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}
      </Box>

      <Dialog
        open={openDeleteConfirmation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Confirma excluir o registro?'}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleDeleteSelected} color="secondary">
            Sim
          </Button>
          <Button
            onClick={() => setOpenDeleteConfirmation(false)}
            color="primary"
            autoFocus
          >
            Não
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showForm}
        maxWidth="sm"
        fullWidth
        aria-describedby="alert-dialog-description"
        aria-labelledby="form-dialog-title"
      >
        <form onSubmit={handleFormSubmit}>
          <DialogTitle id="alert-dialog-title">
            {selected._id ? 'Editar registro' : 'Novo registro'}
          </DialogTitle>
          <DialogContent>
            <Grid
              container
              direction="column"
              justify="space-around"
              alignItems="stretch"
              spacing={2}
            >
              <Grid item>
                <div>
                  <Radio
                    id="form-receita"
                    value="+"
                    disabled={!!selected._id}
                    checked={selected.type === '+'}
                    onChange={handleTypeChange}
                    label="Receita"
                  />
                  <label htmlFor="form-receita">Receita</label>
                  <Radio
                    id="form-despesa"
                    value="-"
                    disabled={!!selected._id}
                    checked={selected.type === '-'}
                    onChange={handleTypeChange}
                    label="Despesa"
                  />
                  <label htmlFor="form-despesa">Despesa</label>
                </div>
              </Grid>
              <Grid item>
                <TextField
                  label="Descrição"
                  required
                  fullWidth
                  defaultValue={selected.description}
                  onChange={handleDescrChange}
                />
              </Grid>
              <Grid item>
                <TextField
                  fullWidth
                  required
                  label="Categoria"
                  defaultValue={selected.category}
                  onChange={handleCategoryChange}
                />
              </Grid>
              <Grid item>
                <TextField
                  fullWidth
                  required
                  label="Valor"
                  type="number"
                  defaultValue={selected.value}
                  onChange={handleValueChange}
                />
              </Grid>
              <Grid item>
                <TextField
                  fullWidth
                  required
                  label="Data"
                  type="date"
                  defaultValue={dateStr(selected)}
                  onChange={handleDateChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <IconButton
              disabled={!selected._id}
              aria-label="delete"
              color="secondary"
              onClick={() => setOpenDeleteConfirmation(true)}
            >
              <Delete />
            </IconButton>

            <Button color="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              autoFocus
              // onClick={handleFormSave}
            >
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      ></Snackbar>
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
}
