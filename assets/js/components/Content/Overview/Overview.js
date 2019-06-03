import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Animated} from 'react-animated-css';
import axios from 'axios';
import { NavLink } from 'react-router-dom';


class Overview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            response : []
        };
    }

    componentDidMount() {
        this.dashboard();
    }

    dashboard() {
        axios({
            method: 'GET',
            url: '/api/dashboard',
            headers: {
                'Authorization' : `Bearer ${this.props.logged_user.token}`
            }
        })
            .then((response) => {
                this.setState({
                    response : response.data
                });
                console.log(response);
            })
    }

    render() {
        let {response} = this.state;
        return (
            <div>
                <Animated animationIn="fadeIn">
                    <div className="dash-nav-wrap">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-8">
                                    <ul className="nav nav-pills">
                                    {
                                        (this.props.logged_user.role_id == 1)
                                        ?
                                            (
                                                [
                                                <li className="nav-item"><a className="nav-link active" href="#">Companies</a></li>,
                                                <li className="nav-item"><a className="nav-link" href="#">Resellers</a></li>                                                
                                                ]
                                            )
                                        :''
                                    }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Animated>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <Animated animationIn="fadeInUp">
                                <div className="table-wrap">
                                    <ul className="nav nav-pills nav-content">
                                    {
                                        (this.props.logged_user.role_id == 1)
                                        ?
                                            (
                                                [                                    
                                                    <li><a className="nav-link active" href="#">All</a></li>,
                                                    <li><a className="nav-link" href="#">Arrows</a></li>,
                                                    <li><a className="nav-link" href="#">Creanordic</a></li>
                                                ]
                                            )
                                        :''
                                    }
                                    {
                                        (this.props.logged_user.role_id == 2)
                                        ?
                                            (
                                                [                                    
                                                    <li><a className="nav-link active" href="#">All</a></li>,
                                                    <li><a className="nav-link" href="#">Arrow Division A</a></li>,
                                                    <li><a className="nav-link" href="#">Arrow Division B</a></li>,                                                    
                                                    <li><a className="nav-link" href="#">Creanordic Sales Division</a></li>
                                                ]
                                            )
                                        :''
                                    }                                                                                    
                                    </ul>

                                    <div className="row">
                                        <div className="col-md-7">
                                            <div className="overview-left">
                                                <div className="row">
                                                {
                                                    (this.props.logged_user.role_id == 1)
                                                    ?
                                                        (
                                                            <div className="col-md-4 col-xs-6">
                                                                <div className="numbers-block">
                                                                    <h6>Companies</h6>
                                                                    <div className="number"><h1>{response.companies}</h1></div>
                                                                </div>
                                                            </div>
                                                        )
                                                    :''
                                                }
                                                {
                                                    (this.props.logged_user.role_id == 1 || this.props.logged_user.role_id == 2 || this.props.logged_user.role_id == 3)
                                                    ?
                                                        (
                                                            <div className="col-md-4 col-xs-6">
                                                              <div className="numbers-block">
                                                                <h6>Resellers</h6>
                                                                <div className="number"><h1>{response.resellers}</h1></div>
                                                              </div>
                                                            </div>
                                                        )
                                                    :''
                                                }
                                                {
                                                    (this.props.logged_user.role_id == 1 || this.props.logged_user.role_id == 2 || this.props.logged_user.role_id == 3 || this.props.logged_user.role_id == 4)
                                                    ?
                                                        (
                                                            <div className="col-md-4 col-xs-6">
                                                              <div className="numbers-block">
                                                                <h6>Salespeople</h6>
                                                                <div className="number"><h1>{response.salespeople}</h1></div>
                                                              </div>
                                                            </div>
                                                        )
                                                    :''
                                                }
                                                    <div className="col-md-4 col-xs-6">
                                                      <div className="numbers-block">
                                                        <h6>Active Leads</h6>
                                                        <div className="number"><h1>{response.active_leads}</h1></div>
                                                      </div>
                                                    </div>

                                                    <div className="col-md-4 col-xs-6">
                                                      <div className="numbers-block">
                                                        <h6>Rotten Leads</h6>
                                                        <div className="number"><h1>{response.rotten_leads}</h1></div>
                                                      </div>
                                                    </div>

                                                    <div className="col-md-4 col-xs-6">
                                                      <div className="numbers-block">
                                                        <h6>Pending Bant</h6>
                                                        <div className="number"><h1>{response.pending_bant}</h1></div>
                                                      </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-5">
                                            <div className="overview-right">
                                                <ul id="overview-list">
                                                    <li><span>Total Budget: {response.total_budget} Kr.</span></li>
                                                    <li>Ave. BANT Score: <span> {response.bant_score} </span></li>
                                                    <li>Ave. Lead Lifetime: <span> 30 Days </span></li>
                                                    <li>Closing Rate: <span>{response.closing_rate}%</span></li>
                                                </ul>

                                                <div id="leads-activity">
                                                    <h5>Leads Activity</h5>
                                                    <img src={`${window.location.origin}/images/chart.png`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Animated>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Overview;
