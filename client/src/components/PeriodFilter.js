import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';

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

const years = [2019, 2020, 2021];

export default function PeriodFilter(props) {
  const { month, year, handleMonthChange, handleYearChange } = props;
  return (
    <>
      <FormControl style={{ marginRight: 5 }}>
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
      <FormControl>
        <InputLabel id="ano-input">Ano</InputLabel>
        <Select
          labelId="ano-input"
          id="ano-input-id"
          value={year}
          onChange={handleYearChange}
        >
          {years.map((item, index) => (
            <MenuItem key={index} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
