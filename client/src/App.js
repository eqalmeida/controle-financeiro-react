import React, { useState, useEffect } from 'react';
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
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import ArrowRight from '@material-ui/icons/ArrowRight';

import useDebounce from './shared/useDebounce';
import axios from 'axios';
import ListTransactions from './components/ListTransactions';
import ResumoLancamentos from './components/ResumoLancamentos';

const months = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

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
    if (!isLoading) {
      loadTransactions(debouncedFilter, month, year);
    }
  }, [debouncedFilter, month, year]);

  const loadTransactions = async (f, m, y) => {
    setIsLoading(true);
    try {
      let data = {};
      if (f.length > 1) {
        const resp = await axios.get(`/api/transaction/?filter=${f}`);
        data = resp.data;
      } else {
        const monthStr = `${m + 1}`.padStart(2, '0');
        const yearStr = `${y}`.padStart(4, '0');
        const yearMonth = `${yearStr}-${monthStr}`;

        const resp = await axios.get(`/api/transaction/?period=${yearMonth}`);
        data = resp.data;
      }
      setTransactions(data.transactions);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
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
    setSelected({ ...transactions[idx] });
    setShowForm(true);
  };

  const handleNew = () => {
    const today = new Date();
    setError(null);
    setSelected({
      dercription: '',
      category: '',
      type: '',
      value: 0,
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    });
    setShowForm(true);
  };

  const handleDelete = (idx) => {
    setSelected({ ...transactions[idx] });
    setOpenDeleteConfirmation(true);
  };

  const handleDeleteSelected = async () => {
    setOpenDeleteConfirmation(false);
    setIsLoading(true);
    try {
      const resp = await axios.delete(`/api/transaction/${selected._id}`);
      const data = resp.data;
      setTransactions([...transactions.filter((t) => t._id !== data._id)]);
      setShowForm(false);
      //setSelected({});
    } catch (error) {}
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
    obj.year = date.getFullYear();
    obj.month = date.getMonth() + 1;
    obj.day = date.getDate();
    setSelected(obj);
  };

  const handleFormSave = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (selected._id) {
        // Editando
        const resp = await axios.put(
          `/api/transaction/${selected._id}`,
          selected
        );
        const data = resp.data;

        setShowForm(false);

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
        setShowForm(false);
        if (data.year === year && data.month === month) {
          const newData = [data, ...transactions];
          setTransactions(newData);
        }
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
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
          <IconButton aria-label="delete" color="secondary">
            <ArrowLeft />
          </IconButton>
          <FormControl className={classes.formControl}>
            <InputLabel id="mes-input">Mês</InputLabel>
            <Select
              labelId="mes-input"
              id="mes-input-id"
              value={month}
              onChange={handleMonthChange}
            >
              {months.map((item, index) => (
                <MenuItem key={index} value={index}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="ano-input">Ano</InputLabel>
            <Select
              labelId="ano-input"
              id="ano-input-id"
              value={year}
              onChange={handleYearChange}
            >
              {[2019, 2020, 2021].map((item, index) => (
                <MenuItem key={index} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton aria-label="delete" color="secondary">
            <ArrowRight />
          </IconButton>
          <FormControl>
            <TextField
              id="filter-input"
              label="Filtro"
              value={filter}
              onChange={handleFilterChange}
            />
          </FormControl>
        </CardContent>
      </Card>
      <ResumoLancamentos transactions={transactions} />

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
            transactions={transactions}
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
        maxWidth="xl"
        aria-describedby="alert-dialog-description"
        aria-labelledby="form-dialog-title"
      >
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
            <Grid item style={{ minWidth: 400 }}>
              <TextField
                label="Descrição"
                fullWidth
                value={selected.description}
                onChange={handleDescrChange}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Categoria"
                value={selected.category}
                onChange={handleCategoryChange}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Valor"
                type="number"
                value={selected.value}
                onChange={handleValueChange}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Data"
                type="date"
                value={dateStr(selected)}
                onChange={handleDateChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!selected._id}
            color="secondary"
            onClick={() => setOpenDeleteConfirmation(true)}
          >
            Excluir
          </Button>

          <Button color="secondary" onClick={() => setShowForm(false)}>
            Cancelar
          </Button>
          <Button color="primary" autoFocus onClick={handleFormSave}>
            Salvar
          </Button>
        </DialogActions>
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
