import { Grid, makeStyles, Paper } from '@material-ui/core';
import './App.css';
import Menu from './components/Menu';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    minHeight: '50vh',
  
  },
}));

function App() {
  const classes = useStyles();
  return (
    <div className="App">
      <Menu>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Paper className={classes.paper}>Grupos novos</Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>Usuarios Novos</Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>Solicitacoes para Grupo</Paper>
          </Grid>
        </Grid>
      </Menu>
    </div>
  );
}

export default App;
