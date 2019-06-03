import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FormGroup,FormControl,HelpBlock,ControlLabel } from 'react-bootstrap';

class Login extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit() {
        axios({
            method: 'POST',
            url: '/oauth/token',
            data: {
                client_id: 2,
                client_secret: '2N22I3V3p5QptjwrrvO75yWmF4nFZDBaUV4xJZLT',
                grant_type: 'password',
                scope: '*',
                username: this.email.value,
                password: this.password.value
            }
        })
            .then((response) => {
                const token = response.data.access_token;
                axios({
                    method: 'GET',
                    url: '/api/user',
                    headers: {'Authorization' : `Bearer ${token}`}
                })
                    .then((response) => {
                        const user = {
                            token      : token,
                            name       : response.data.name,
                            role_id    : response.data.role_id,
                            company_id : response.data.company_id,
                        };
                        localStorage.setItem('user', JSON.stringify(user));
                        this.props.logged(user);
                    });
            });
    }

    render(){
        return (
            <div id="page">
                <header>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-2 col-md-offset-5 text-center login-header">
                                <div id="gtco-logo">
                                    <a href="index.html">
                                        <img src={`${window.location.origin}/images/logo.png`} className="img-responsive center-block"/>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <section>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6 col-md-offset-3 login-wrapper">
                                <form>
                                    <h4 className="modal-title text-center" id="myModalLabel">Please login to your account</h4>
                                    <div className="col-md-10 col-md-offset-1">
                                        <FormGroup
                                            controlId="email"
                                        >
                                            <ControlLabel>Email Address</ControlLabel>
                                            <FormControl
                                                type="text"
                                                inputRef={ref => { this.email = ref; }}
                                                ref="email"
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            controlId="password"
                                        >
                                            <ControlLabel>Password</ControlLabel>
                                            <FormControl
                                                type="password"
                                                inputRef={ref => { this.password = ref; }}
                                                ref="password"
                                            />
                                        </FormGroup>
                                    </div>
                                    <div className="modal-footer text-center">
                                        <button type="button" className="btn btn-primary" onClick={this.handleSubmit}>Login</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default Login;