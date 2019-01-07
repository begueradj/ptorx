import { TextField, Button, Paper } from 'react-md';
import * as React from 'react';
import * as swal from 'sweetalert';
import { api } from 'lib/api';

// Components
import Navigation from 'components/emails/Navigation';

// Actions
import { updateCredits } from 'actions/account';

export default class SendMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { id: location.hash.split('/')[3] };
  }

  onSend() {
    const { App } = this.props;

    api
      .post(`/emails/${this.state.id}/messages/`, {
        to: this._to.value,
        subject: this._subject.value,
        content: this._message.value
      })
      .then(res => {
        App.dispatch(updateCredits(res.data.credits));
        swal('Success', `Message sent to ${this._to.value}`, 'success');
        location.hash = `#/emails/messages/${this.state.id}/list`;
      })
      .catch(err => swal('Error', err.response.data.error, 'error'));
  }

  render() {
    return (
      <div className="message-send">
        <Navigation email={this.state.id} />

        <Paper zDepth={1} component="section" className="section flex">
          <TextField
            id="text--to"
            ref={i => (this._to = i)}
            type="text"
            label="To"
          />

          <TextField
            id="text--subject"
            ref={i => (this._subject = i)}
            type="text"
            label="Subject"
          />

          <TextField
            id="text--message"
            ref={i => (this._message = i)}
            rows={2}
            type="text"
            label="Message"
          />

          <Button
            raised
            primary
            iconChildren="send"
            onClick={() => this.onSend()}
          >
            Send
          </Button>
        </Paper>
      </div>
    );
  }
}
