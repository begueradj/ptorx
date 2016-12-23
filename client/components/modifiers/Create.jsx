import React from "react";

// Action creators
import { addModifier } from "actions/creators/modifiers";

// Constants
import { URL } from "constants/config";
import { modifierTypes } from "constants/types";

// Modules
import request from "lib/request";

export default class CreateModifier extends React.Component {

    constructor(props) {
        super(props);

        this.onChangeType = this.onChangeType.bind(this);
        this.onCreate = this.onCreate.bind(this);

        this.state = { type: 0, useRegex: false };
    }

    onChangeType() {
        this.setState({ type: +this.refs.type.value });
    }

    onCreate() {
        let data = {
            type: +this.refs.type.value, name: this.refs.name.value,
            description: this.refs.description.value
        }, data2 = {};

        switch (data.type) {
            case 1:
                data2 = { key: this.refs.key.value }; break;

            case 2:
                data2 = ""; break;

            case 3:
                data2 = {
                    regex: +this.refs.regex.checked, flags: (
                        this.refs.regexFlags
                            ? this.refs.regexFlags.value : ""
                    ), value: this.refs.find.value,
                    with: this.refs.replace.value
                }; break;

            case 4:
                data2 = { subject: this.refs.subject.value }; break;

            case 5:
                data2 = {
                    value: this.refs.tag.value,
                    prepend: +this.refs.prepend.checked
                }; break;
        }

        request({
            url: "../api/modifiers", method: "POST",
            data: Object.assign({}, data, data2)
        }, (res) => {
            if (res.error) {
                swal("Error", res.message, "error");
            }
            else {
                // Add to state.modifiers
                data.id = res.id;
                data.data = data2;
                this.props.dispatch(addModifier(data));

                if (this.props.onCreate) {
                    this.props.onCreate(res.id);
                }
                else {
                    location.hash = "modifiers/list";
                    swal(
                        "Success",
                        `Modifier '${data.name}' created`,
                        "success"
                    );
                }
            }
        });
    }

    render() {
        let form;
        switch (this.state.type) {
            case 1:
                form = (
                    <div>
                        <label>Encryption Key</label>
                        <span className="input-description">
                            Email text and HTML content will be encrypted with this key using AES-256.
                        </span>
                        <input type="text" ref="key" />
                    </div>
                ); break;

            case 2:
                form = (
                    <p>
                        HTML will be stripped from all emails leaving plain text.
                    </p>
                ); break;

            case 3:
                form = (
                    <div>
                        <label>Find</label>
                        <span className="input-description">
                            The value to be replaced.
                        </span>
                        <input type="text" ref="find" />

                        <label>Replace</label>
                        <span className="input-description">
                            The value which replaces 'Find'.
                        </span>

                        <input type="text" ref="replace" />
                        
                        <label><input
                            ref="regex"
                            type="checkbox"
                            onChange={() =>
                                this.setState({ useRegex: !this.state.useRegex })
                            }
                        />Use Regular Expression</label>

                        {this.state.useRegex ? (
                            <div>
                                <label>Regular Expression Flags</label>
                                <input type="text" ref="regexFlags" />
                            </div>
                        ) : (
                            <div />
                        )}
                    </div>
                ); break;

            case 4:
                form = (
                    <div>
                        <label>Subject</label>
                        <span className="input-description">
                            The text to replace an email's subject with.
                        </span>
                        <input type="text" ref="subject" />
                    </div>
                ); break;

            case 5:
                form = (
                    <div>
                        <label>Subject Tag</label>
                        <span className="input-description">
                            The value to append or prepend to an email's subject.
                        </span>
                        <input type="text" ref="tag" />
                        <label><input
                            type="checkbox"
                            ref="prepend"
                            defaultChecked={true}
                        />Prepend Tag</label>
                    </div>
                ); break;
        }
        
        return (
            <div className="modifier-create">
                <label>Modifier Type</label>
                <select ref="type" onChange={this.onChangeType}>{
                    [0].concat(Object.keys(modifierTypes)).map(k =>
                        <option value={k}>{
                            modifierTypes[k] || "Modifier Type"
                        }</option>
                    )
                }</select>
                <label>Name</label>
                <span className="input-description">
                    Give your modifier a name to find it easier.
                </span>
                <input type="text" ref="name" />
                
                <label>Description</label>
                <span className="input-description">
                    Describe your modifier to find it easier.
                </span>
                <input type="text" ref="description" />
                
                {form}
                
                { this.props.onCreate ? <span /> : <hr /> }
                
                <button className="btn-primary" onClick={this.onCreate}>
                    Create Modifier
                </button>
            </div>
        );
    }

}