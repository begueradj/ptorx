import { withSnackbar, WithSnackbarProps } from 'notistack';
import { RouteComponentProps } from 'react-router';
import { PanelContext } from 'lib/PanelContext';
import * as moment from 'moment';
import * as React from 'react';
import { Ptorx } from 'types/ptorx';
import { api } from 'lib/api';
import {
  FormControlLabel,
  createStyles,
  WithStyles,
  withStyles,
  Typography,
  Checkbox,
  Button
} from '@material-ui/core';

const styles = createStyles({
  title: {
    fontSize: '200%'
  },
  button: {
    marginRight: '0.5em'
  }
});

interface ManagePrimaryEmailState {
  deleting: boolean;
  primaryEmail?: Ptorx.PrimaryEmail;
}

class _ManagePrimaryEmail extends React.Component<
  RouteComponentProps & WithSnackbarProps & WithStyles<typeof styles>,
  ManagePrimaryEmailState
> {
  static contextType = PanelContext;
  context!: React.ContextType<typeof PanelContext>;
  state: ManagePrimaryEmailState = { deleting: false, primaryEmail: null };

  componentDidMount() {
    this.load();
  }

  onDelete() {
    if (!this.state.deleting) return this.setState({ deleting: true });
    api
      .delete('/primary-emails', {
        params: { primaryEmail: this.state.primaryEmail.id }
      })
      .then(() => {
        this.props.history.push('/app');
        return api.get('/primary-emails');
      })
      .then(res => this.context.dispatch({ primaryEmails: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  onChange(key: keyof Ptorx.PrimaryEmail, value: any) {
    this.setState({
      primaryEmail: { ...this.state.primaryEmail, [key]: value }
    });
  }

  onSubmit() {
    api
      .put('/primary-emails', this.state.primaryEmail)
      .then(res => {
        this.load();
        return api.get('/primary-emails');
      })
      .then(res => this.context.dispatch({ primaryEmails: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  load() {
    const primaryEmailId = +(this.props.match.params as {
      primaryEmail: number;
    }).primaryEmail;
    api
      .get('/primary-emails', { params: { primaryEmail: primaryEmailId } })
      .then(res => this.setState({ primaryEmail: res.data }))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  render() {
    const { primaryEmail, deleting } = this.state;
    const { classes } = this.props;
    if (!primaryEmail) return null;
    return (
      <div>
        <Typography variant="h2" className={classes.title}>
          {primaryEmail.address}
        </Typography>
        <Typography variant="body2">
          Added on {moment.unix(primaryEmail.created).format('LLL')}
        </Typography>
        <Typography variant="body2">
          Address is {primaryEmail.verified ? '' : 'un'}verified.
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={primaryEmail.autolink}
              onChange={e => this.onChange('autolink', e.target.checked)}
            />
          }
          label="Autolink"
        />

        <div>
          <Button
            color="primary"
            variant="contained"
            onClick={() => this.onSubmit()}
            className={classes.button}
          >
            Save
          </Button>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => this.onDelete()}
          >
            {deleting ? 'Confirm Delete' : 'Delete'}
          </Button>
        </div>
      </div>
    );
  }
}

export const ManagePrimaryEmail = withSnackbar(
  withStyles(styles)(_ManagePrimaryEmail)
);
